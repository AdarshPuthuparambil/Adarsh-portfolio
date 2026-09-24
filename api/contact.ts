import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createHash } from 'node:crypto'
import { Resend } from 'resend'

const CONTACT_ERROR_MESSAGE =
  'Unable to send your message right now. Please try again later.'
const CONTACT_VALIDATION_MESSAGE = 'Please check your details and try again.'
export const CONTACT_MAX_BODY_BYTES = 16 * 1024
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const RATE_LIMIT_MAX = 10
const DUPLICATE_WINDOW_MS = 2 * 60 * 1000
const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  phone: 20,
  subject: 150,
  message: 5000,
} as const

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

type ContactApiRequest = ContactFormData & {
  website?: string
}

type ContactApiResponse = {
  success: boolean
  message: string
}

type ContactHandlerResult = {
  status: number
  body: ContactApiResponse
}

const hitsByIp = new Map<string, number[]>()
const recentSubmissions = new Map<string, number>()

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
    return JSON.parse(req.body) as unknown
  }

  const serialized = JSON.stringify(req.body ?? {})
  if (Buffer.byteLength(serialized, 'utf8') > CONTACT_MAX_BODY_BYTES) {
    throw new Error('payload_too_large')
  }
  return req.body as unknown
}

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
  const subject = data.subject || 'Not provided'

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
    subject,
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

function countDigits(value: string): number {
  return (value.match(/\d/g) ?? []).length
}

function hasHeaderBreaks(value: string): boolean {
  for (const char of value) {
    if (HEADER_BREAK_CODES.has(char.codePointAt(0) ?? 0)) return true
  }
  return false
}

function normalizeContactForm(input: Partial<ContactFormData>): ContactFormData {
  return {
    name: input.name?.trim() ?? '',
    email: input.email?.trim() ?? '',
    phone: input.phone?.trim() ?? '',
    subject: input.subject?.trim() ?? '',
    message: input.message?.trim() ?? '',
  }
}

function validateContactForm(input: Partial<ContactFormData>): {
  ok: boolean
  values: ContactFormData
  errors: Partial<Record<keyof ContactFormData, string>>
} {
  const values = normalizeContactForm(input)
  const errors: Partial<Record<keyof ContactFormData, string>> = {}

  if (!values.name) {
    errors.name = 'Full name is required.'
  } else if (values.name.length > CONTACT_LIMITS.name) {
    errors.name = `Full name must be ${CONTACT_LIMITS.name} characters or fewer.`
  } else if (hasHeaderBreaks(values.name)) {
    errors.name = 'Full name contains invalid characters.'
  }

  if (!values.email) {
    errors.email = 'Email is required.'
  } else if (values.email.length > CONTACT_LIMITS.email) {
    errors.email = `Email must be ${CONTACT_LIMITS.email} characters or fewer.`
  } else if (hasHeaderBreaks(values.email) || !EMAIL_PATTERN.test(values.email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.phone) {
    errors.phone = 'Phone number is required.'
  } else if (values.phone.length > CONTACT_LIMITS.phone) {
    errors.phone = `Phone number must be ${CONTACT_LIMITS.phone} characters or fewer.`
  } else {
    const digits = countDigits(values.phone)
    if (
      hasHeaderBreaks(values.phone) ||
      !PHONE_PATTERN.test(values.phone) ||
      digits < 7 ||
      digits > 15
    ) {
      errors.phone = 'Enter a valid phone number.'
    }
  }

  if (values.subject.length > CONTACT_LIMITS.subject) {
    errors.subject = `Subject must be ${CONTACT_LIMITS.subject} characters or fewer.`
  } else if (hasHeaderBreaks(values.subject)) {
    errors.subject = 'Subject contains invalid characters.'
  }

  if (!values.message) {
    errors.message = 'Message is required.'
  } else if (values.message.length > CONTACT_LIMITS.message) {
    errors.message = `Message must be ${CONTACT_LIMITS.message} characters or fewer.`
  }

  return {
    ok: Object.keys(errors).length === 0,
    values,
    errors,
  }
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
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return null
  }

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

async function processContact(input: {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST')
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({
      success: false,
      message: CONTACT_ERROR_MESSAGE,
    })
  }

  try {
    const payload = parseBody(req)
    const result = await processContact({
      payload,
      ip: getClientIp(req),
    })
    return res.status(result.status).json(result.body)
  } catch {
    return res.status(400).json({
      success: false,
      message: CONTACT_ERROR_MESSAGE,
    })
  }
}
