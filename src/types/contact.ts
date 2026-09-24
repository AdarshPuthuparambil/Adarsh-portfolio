export type ContactFormData = {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export type ContactFieldName = keyof ContactFormData

export type ContactFieldErrors = Partial<Record<ContactFieldName, string>>

export type ContactApiRequest = ContactFormData & {
  website?: string
}

export type ContactApiResponse = {
  success: boolean
  message: string
  emailId?: string
}

export const CONTACT_LIMITS = {
  name: 100,
  email: 254,
  phone: 20,
  subject: 150,
  message: 5000,
} as const

export const CONTACT_SUCCESS_MESSAGE =
  "Thank you! Your message has been sent successfully. I'll get back to you soon."

export const CONTACT_ERROR_MESSAGE =
  'Unable to send your message right now. Please try again later.'

export const CONTACT_VALIDATION_MESSAGE =
  'Please check your details and try again.'
