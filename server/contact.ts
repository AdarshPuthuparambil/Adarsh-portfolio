import { createHash } from 'node:crypto'
import { Resend, type ErrorResponse } from 'resend'
import { validateContactForm } from '../src/lib/contactValidation'
import {
  CONTACT_ERROR_MESSAGE,
  CONTACT_VALIDATION_MESSAGE,
  type ContactApiRequest,
  type ContactApiResponse,
  type ContactFormData,
} from '../src/types/contact'
import { buildEnquiryHtml, buildEnquirySubject, buildEnquiryText } from './contactEmail'

export const CONTACT_MAX_BODY_BYTES = 16 * 1024
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const RATE_LIMIT_MAX = 10
const DUPLICATE_WINDOW_MS = 2 * 60 * 1000

type ContactHandlerResult = {
  status: number
  body: ContactApiResponse
}

type SentSubmission = {
  at: number
  emailId: string
}

const hitsByIp = new Map<string, number[]>()
const recentSubmissions = new Map<string, SentSubmission>()

function genericError(status = 500): ContactHandlerResult {
  return {
    status,
    body: {
      success: false,
      message: CONTACT_ERROR_MESSAGE,
    },
  }
}

function success(emailId?: string): ContactHandlerResult {
  return {
    status: 200,
    body: {
      success: true,
      message: 'Your message has been sent successfully.',
      ...(emailId ? { emailId } : {}),
    },
  }
}

function stripHeaderInjection(value: string): string {
  let sanitized = ''
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0
    if (
      code === 0 ||
      code === 10 ||
      code === 13 ||
      code === 0x85 ||
      code === 0x2028 ||
      code === 0x2029
    ) {
      continue
    }
    sanitized += char
  }
  return sanitized.trim()
}

function stripNullBytes(value: string): string {
  let sanitized = ''
  for (const char of value) {
    if ((char.codePointAt(0) ?? 0) !== 0) sanitized += char
  }
  return sanitized
}

function pruneMap(
  map: Map<string, SentSubmission>,
  windowMs: number,
  now: number,
) {
  for (const [key, entry] of map) {
    if (now - entry.at > windowMs) map.delete(key)
  }
}

function isRateLimited(ip: string, now: number): boolean {
  const recent = (hitsByIp.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  )

  if (recent.length >= RATE_LIMIT_MAX) {
    hitsByIp.set(ip, recent)
    return true
  }

  recent.push(now)
  hitsByIp.set(ip, recent)
  return false
}

function submissionKey(ip: string, values: ContactFormData): string {
  return createHash('sha256')
    .update(
      `${ip}\n${values.name}\n${values.email}\n${values.phone}\n${values.subject}\n${values.message}`,
    )
    .digest('hex')
}

// Resend answers 422 when the payload we built from the submission is
// unusable, which is the only failure the caller can fix. Everything else -
// rejected key, unverified sender domain, quota - is ours. Note that Resend
// also names the unverified-domain 403 a "validation_error", so the status
// code is the reliable signal here, not the error name.
function resendErrorStatus(error: ErrorResponse): number {
  return error.statusCode === 422 ? 400 : 500
}

// Resend errors carry no credentials, but build the string explicitly so a
// future SDK field cannot leak into the log by accident.
function describeResendError(error: ErrorResponse): string {
  const code = error.statusCode ? ` (HTTP ${error.statusCode})` : ''
  return `${error.name}${code}: ${error.message}`
}

function isHoneypotFilled(payload: ContactApiRequest): boolean {
  return Boolean(payload.website && payload.website.trim() !== '')
}

function readRequestPayload(payload: unknown): ContactApiRequest | null {
  if (typeof payload !== 'object' || payload === null) return null
  const record = payload as Record<string, unknown>

  return {
    name: typeof record.name === 'string' ? record.name : '',
    email: typeof record.email === 'string' ? record.email : '',
    phone: typeof record.phone === 'string' ? record.phone : '',
    subject: typeof record.subject === 'string' ? record.subject : '',
    message: typeof record.message === 'string' ? record.message : '',
    website: typeof record.website === 'string' ? record.website : '',
  }
}

function getEmailConfig(): { apiKey: string; from: string; to: string } | null {
  const apiKey = process.env.EMAIL_API_KEY?.trim()
  const from = stripHeaderInjection(process.env.EMAIL_FROM ?? '')
  const to = stripHeaderInjection(process.env.EMAIL_TO ?? '')

  const missing = [
    apiKey ? null : 'EMAIL_API_KEY',
    from ? null : 'EMAIL_FROM',
    to ? null : 'EMAIL_TO',
  ].filter((name): name is string => name !== null)

  if (missing.length > 0) {
    console.error(`[contact] Missing environment variables: ${missing.join(', ')}.`)
    return null
  }
  if (!apiKey || !from || !to) return null

  if (from.includes('<') || from.includes('>') || to.includes('<') || to.includes('>')) {
    console.error(
      '[contact] EMAIL_FROM and EMAIL_TO must be bare addresses without angle brackets.',
    )
    return null
  }

  return { apiKey, from, to }
}

export async function processContact(input: {
  payload: unknown
  ip: string
}): Promise<ContactHandlerResult> {
  const now = Date.now()
  const ip = input.ip || 'unknown'

  if (isRateLimited(ip, now)) {
    return genericError(429)
  }

  const payload = readRequestPayload(input.payload)
  if (!payload) {
    return {
      status: 400,
      body: {
        success: false,
        message: CONTACT_VALIDATION_MESSAGE,
      },
    }
  }

  if (isHoneypotFilled(payload)) {
    console.warn(
      '[contact] Skipped send: honeypot field was filled, so no email was sent. ' +
        'A browser password manager autofilling the hidden "website" field looks identical to a bot here.',
    )
    return success()
  }

  const validation = validateContactForm(payload)
  if (!validation.ok) {
    return {
      status: 400,
      body: {
        success: false,
        message: CONTACT_VALIDATION_MESSAGE,
      },
    }
  }

  const values: ContactFormData = {
    name: stripHeaderInjection(validation.values.name),
    email: stripHeaderInjection(validation.values.email),
    phone: stripHeaderInjection(validation.values.phone),
    subject: stripHeaderInjection(validation.values.subject),
    message: stripNullBytes(validation.values.message),
  }

  pruneMap(recentSubmissions, DUPLICATE_WINDOW_MS, now)
  const duplicateKey = submissionKey(ip, values)
  const alreadySent = recentSubmissions.get(duplicateKey)
  if (alreadySent) {
    console.warn(
      `[contact] Skipped send: identical submission ${Math.round((now - alreadySent.at) / 1000)}s ago, ` +
        `so no new email was sent. Replaying email ${alreadySent.emailId}. ` +
        `Change the form content to send again, or wait ${Math.round(DUPLICATE_WINDOW_MS / 1000)}s.`,
    )
    return success(alreadySent.emailId)
  }

  const config = getEmailConfig()
  if (!config) return genericError(500)

  try {
    const resend = new Resend(config.apiKey)
    console.info(`[contact] Resend API initialized (from ${config.from}, to ${config.to})`)

    console.info('[contact] Sending email...')
    const { data, error } = await resend.emails.send({
      from: `Website Contact Form <${config.from}>`,
      to: [config.to],
      replyTo: values.email,
      subject: buildEnquirySubject(values.subject),
      html: buildEnquiryHtml(values),
      text: buildEnquiryText(values),
    })

    if (error) {
      console.error(`[contact] Resend error: ${describeResendError(error)}`)
      return genericError(resendErrorStatus(error))
    }

    if (!data?.id) {
      console.error(
        '[contact] Resend error: the send resolved without an error but returned no email id.',
      )
      return genericError(500)
    }

    console.info(`[contact] Resend success: ${data.id}`)
    recentSubmissions.set(duplicateKey, { at: now, emailId: data.id })
    return success(data.id)
  } catch (error) {
    console.error(
      `[contact] Resend error: ${error instanceof Error ? `${error.name}: ${error.message}` : String(error)}`,
    )
    return genericError(500)
  }
}
