import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createHash } from 'node:crypto'
import { Resend, type ErrorResponse } from 'resend'

// This function is intentionally self-contained: it imports only `resend` and
// type-only declarations. Vercel compiles this file to ESM `api/contact.js`,
// where Node resolves relative specifiers without extension guessing, so a
// runtime import of a sibling source file would fail to resolve.

export const CONTACT_MAX_BODY_BYTES = 16 * 1024

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const RATE_LIMIT_MAX = 10
const DUPLICATE_WINDOW_MS = 2 * 60 * 1000

const LIMITS = {
  name: 100,
  email: 254,
  phone: 20,
  subject: 150,
  message: 5000,
} as const

const ERROR_MESSAGE =
  'Unable to send your message right now. Please try again later.'
const VALIDATION_MESSAGE = 'Please check your details and try again.'
const SUCCESS_MESSAGE = 'Your message has been sent successfully.'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?[0-9\s().-]{7,20}$/
const HEADER_BREAK_CODES = new Set([0, 10, 13, 0x85, 0x2028, 0x2029])

type ContactFormData = {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

type ContactPayload = ContactFormData & { website: string }

type ResponseBody = {
  success: boolean
  message: string
  emailId?: string
}

type HandlerResult = {
  status: number
  body: ResponseBody
}

type SentSubmission = {
  at: number
  emailId: string
}

const hitsByIp = new Map<string, number[]>()
const recentSubmissions = new Map<string, SentSubmission>()

function genericError(status = 500): HandlerResult {
  return { status, body: { success: false, message: ERROR_MESSAGE } }
}

function validationError(): HandlerResult {
  return { status: 400, body: { success: false, message: VALIDATION_MESSAGE } }
}

function success(emailId?: string): HandlerResult {
  return {
    status: 200,
    body: {
      success: true,
      message: SUCCESS_MESSAGE,
      ...(emailId ? { emailId } : {}),
    },
  }
}

function hasHeaderBreaks(value: string): boolean {
  for (const char of value) {
    if (HEADER_BREAK_CODES.has(char.codePointAt(0) ?? 0)) return true
  }
  return false
}

function stripHeaderInjection(value: string): string {
  let sanitized = ''
  for (const char of value) {
    if (!HEADER_BREAK_CODES.has(char.codePointAt(0) ?? 0)) sanitized += char
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

function countDigits(value: string): number {
  return (value.match(/\d/g) ?? []).length
}

function readPayload(input: unknown): ContactPayload | null {
  if (typeof input !== 'object' || input === null) return null
  const record = input as Record<string, unknown>
  const field = (key: string): string =>
    typeof record[key] === 'string' ? (record[key] as string).trim() : ''

  return {
    name: field('name'),
    email: field('email'),
    phone: field('phone'),
    subject: field('subject'),
    message: field('message'),
    website: field('website'),
  }
}

function isValid(values: ContactFormData): boolean {
  if (
    !values.name ||
    values.name.length > LIMITS.name ||
    hasHeaderBreaks(values.name)
  ) {
    return false
  }

  if (
    !values.email ||
    values.email.length > LIMITS.email ||
    hasHeaderBreaks(values.email) ||
    !EMAIL_PATTERN.test(values.email)
  ) {
    return false
  }

  if (!values.phone || values.phone.length > LIMITS.phone) return false
  const digits = countDigits(values.phone)
  if (
    hasHeaderBreaks(values.phone) ||
    !PHONE_PATTERN.test(values.phone) ||
    digits < 7 ||
    digits > 15
  ) {
    return false
  }

  if (values.subject.length > LIMITS.subject || hasHeaderBreaks(values.subject)) {
    return false
  }

  if (!values.message || values.message.length > LIMITS.message) return false

  return true
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function toHtmlParagraph(value: string): string {
  return escapeHtml(value).replace(/\r\n|\r|\n/g, '<br />')
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding:14px 28px 0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#0f7a72;font-weight:700;">
        ${escapeHtml(label)}
      </td>
    </tr>
    <tr>
      <td style="padding:6px 28px 12px;font-size:16px;line-height:1.6;color:#101418;border-bottom:1px solid #e8eef1;">
        ${value}
      </td>
    </tr>
  `
}

function buildEnquirySubject(subject: string): string {
  return subject ? `New Website Enquiry - ${subject}` : 'New Website Enquiry'
}

function buildEnquiryText(data: ContactFormData): string {
  return [
    'New Website Enquiry',
    '',
    'Name:',
    data.name,
    '',
    'Email:',
    data.email,
    '',
    'Phone:',
    data.phone,
    '',
    'Subject:',
    data.subject || 'Not provided',
    '',
    'Message:',
    data.message,
  ].join('\n')
}

function buildEnquiryHtml(data: ContactFormData): string {
  const subject = data.subject ? toHtmlParagraph(data.subject) : 'Not provided'

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>New Website Enquiry</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f7f8;font-family:Arial,Helvetica,sans-serif;color:#101418;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f8;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8ea;">
            <tr>
              <td style="padding:28px 28px 16px;border-bottom:3px solid #0f7a72;">
                <p style="margin:0;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#0f7a72;font-weight:700;">
                  Portfolio contact
                </p>
                <h1 style="margin:8px 0 0;font-size:24px;line-height:1.3;color:#101418;">
                  New Website Enquiry
                </h1>
              </td>
            </tr>
            ${row('Name', escapeHtml(data.name))}
            ${row('Email', escapeHtml(data.email))}
            ${row('Phone', escapeHtml(data.phone))}
            ${row('Subject', subject)}
            ${row('Message', toHtmlParagraph(data.message))}
            <tr>
              <td style="padding:18px 28px 24px;font-size:12px;line-height:1.5;color:#6b7780;">
                Reply directly to this email to respond to the sender.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
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

function pruneSubmissions(now: number) {
  for (const [key, entry] of recentSubmissions) {
    if (now - entry.at > DUPLICATE_WINDOW_MS) recentSubmissions.delete(key)
  }
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

function getEmailConfig(): { apiKey: string; from: string; to: string } | null {
  const apiKey = process.env.EMAIL_API_KEY?.trim() ?? ''
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

  if (from.includes('<') || from.includes('>') || to.includes('<') || to.includes('>')) {
    console.error(
      '[contact] EMAIL_FROM and EMAIL_TO must be bare addresses without angle brackets.',
    )
    return null
  }

  return { apiKey, from, to }
}

async function processContact(input: {
  payload: unknown
  ip: string
}): Promise<HandlerResult> {
  const now = Date.now()
  const ip = input.ip || 'unknown'

  if (isRateLimited(ip, now)) return genericError(429)

  const payload = readPayload(input.payload)
  if (!payload) return validationError()

  if (payload.website !== '') {
    console.warn(
      '[contact] Skipped send: honeypot field was filled, so no email was sent. ' +
        'A browser password manager autofilling the hidden "website" field looks identical to a bot here.',
    )
    return success()
  }

  if (!isValid(payload)) return validationError()

  const values: ContactFormData = {
    name: stripHeaderInjection(payload.name),
    email: stripHeaderInjection(payload.email),
    phone: stripHeaderInjection(payload.phone),
    subject: stripHeaderInjection(payload.subject),
    message: stripNullBytes(payload.message),
  }

  pruneSubmissions(now)
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

    const { data, error } = await resend.emails.send({
      from: `Website Contact Form <${config.from}>`,
      to: [config.to],
      replyTo: values.email,
      subject: buildEnquirySubject(values.subject),
      html: buildEnquiryHtml(values),
      text: buildEnquiryText(values),
    })

    if (error) {
      console.error('RESEND ERROR:', describeResendError(error))
      return genericError(resendErrorStatus(error))
    }

    if (!data?.id) {
      console.error(
        'RESEND ERROR: the send resolved without an error but returned no email id.',
      )
      return genericError(500)
    }

    console.log('RESEND EMAIL ID:', data.id)
    recentSubmissions.set(duplicateKey, { at: now, emailId: data.id })
    return success(data.id)
  } catch (error) {
    console.error(
      'RESEND ERROR:',
      error instanceof Error ? `${error.name}: ${error.message}` : String(error),
    )
    return genericError(500)
  }
}

function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.trim() !== '') {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0]?.trim() || 'unknown'
  }
  return req.socket.remoteAddress ?? 'unknown'
}

function parseBody(req: VercelRequest): unknown {
  if (typeof req.body === 'string') {
    if (Buffer.byteLength(req.body, 'utf8') > CONTACT_MAX_BODY_BYTES) {
      throw new Error('payload_too_large')
    }
    return req.body === '' ? {} : (JSON.parse(req.body) as unknown)
  }

  const serialized = JSON.stringify(req.body ?? {})
  if (Buffer.byteLength(serialized, 'utf8') > CONTACT_MAX_BODY_BYTES) {
    throw new Error('payload_too_large')
  }
  return req.body as unknown
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST')
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ success: false, message: ERROR_MESSAGE })
  }

  try {
    const payload = parseBody(req)
    const result = await processContact({ payload, ip: getClientIp(req) })
    return res.status(result.status).json(result.body)
  } catch (error) {
    const tooLarge = error instanceof Error && error.message === 'payload_too_large'
    console.error(
      '[contact] Could not read the request body:',
      error instanceof Error ? `${error.name}: ${error.message}` : error,
    )
    return res
      .status(tooLarge ? 413 : 400)
      .json({ success: false, message: ERROR_MESSAGE })
  }
}
