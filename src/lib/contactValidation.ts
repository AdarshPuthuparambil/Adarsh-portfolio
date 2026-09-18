import {
  CONTACT_LIMITS,
  type ContactFieldErrors,
  type ContactFormData,
} from '../types/contact'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^\+?[0-9\s().-]{7,20}$/
const HEADER_BREAK_CODES = new Set([0, 10, 13, 0x85, 0x2028, 0x2029])

function countDigits(value: string): number {
  return (value.match(/\d/g) ?? []).length
}

function hasHeaderBreaks(value: string): boolean {
  for (const char of value) {
    if (HEADER_BREAK_CODES.has(char.codePointAt(0) ?? 0)) return true
  }
  return false
}

export function normalizeContactForm(
  input: Partial<ContactFormData>,
): ContactFormData {
  return {
    name: input.name?.trim() ?? '',
    email: input.email?.trim() ?? '',
    phone: input.phone?.trim() ?? '',
    subject: input.subject?.trim() ?? '',
    message: input.message?.trim() ?? '',
  }
}

export function validateContactForm(input: Partial<ContactFormData>): {
  ok: boolean
  values: ContactFormData
  errors: ContactFieldErrors
} {
  const values = normalizeContactForm(input)
  const errors: ContactFieldErrors = {}

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
  } else if (
    hasHeaderBreaks(values.email) ||
    !EMAIL_PATTERN.test(values.email)
  ) {
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
