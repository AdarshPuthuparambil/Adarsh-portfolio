import {
  CONTACT_ERROR_MESSAGE,
  CONTACT_VALIDATION_MESSAGE,
  type ContactApiRequest,
  type ContactApiResponse,
} from '../types/contact'

function isContactApiResponse(value: unknown): value is ContactApiResponse {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return (
    typeof record.success === 'boolean' && typeof record.message === 'string'
  )
}

export async function submitContact(
  payload: ContactApiRequest,
): Promise<ContactApiResponse> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 20_000)

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    const data: unknown = await response.json().catch(() => null)
    if (isContactApiResponse(data) && data.success) {
      return data
    }

    return {
      success: false,
      message:
        response.status === 400
          ? CONTACT_VALIDATION_MESSAGE
          : CONTACT_ERROR_MESSAGE,
    }
  } catch {
    return {
      success: false,
      message: CONTACT_ERROR_MESSAGE,
    }
  } finally {
    window.clearTimeout(timeoutId)
  }
}
