import { createHash } from 'node:crypto'
import { Resend } from 'resend'
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

const hitsByIp = new Map<string, number[]>()
const recentSubmissions = new Map<string, number>()

function genericError(status = 500): ContactHandlerResult {
  return {
    status,
    body: {
      success: false,
      message: CONTACT_ERROR_MESSAGE,
    },
  }
}

function success(): ContactHandlerResult {
  return {
    status: 200,
    body: {
      success: true,
      message: 'Your message has been sent successfully.',
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

function pruneMap(map: Map<string, number>, windowMs: number, now: number) {
  for (const [key, timestamp] of map) {
    if (now - timestamp > windowMs) map.delete(key)
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

  if (!apiKey || !from || !to) return null
  if (from.includes('<') || from.includes('>') || to.includes('<') || to.includes('>')) {
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
  if (recentSubmissions.has(duplicateKey)) {
    return success()
  }

  const config = getEmailConfig()
  if (!config) {
    console.error('Contact email is not configured.')
    return genericError(500)
  }

  try {
    const resend = new Resend(config.apiKey)
    const result = await resend.emails.send({
      from: `Website Contact Form <${config.from}>`,
      to: [config.to],
      replyTo: values.email,
      subject: buildEnquirySubject(values.subject),
      html: buildEnquiryHtml(values),
      text: buildEnquiryText(values),
    })

    if (result.error) {
      console.error('Failed to send contact email.')
      return genericError(500)
    }

    recentSubmissions.set(duplicateKey, now)
    return success()
  } catch {
    console.error('Failed to send contact email.')
    return genericError(500)
  }
}
