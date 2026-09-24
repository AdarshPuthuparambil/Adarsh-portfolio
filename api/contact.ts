import type { VercelRequest, VercelResponse } from '@vercel/node'
import { CONTACT_MAX_BODY_BYTES, processContact } from '../server/contact'
import { CONTACT_ERROR_MESSAGE } from '../src/types/contact'

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
  } catch (error) {
    const tooLarge = error instanceof Error && error.message === 'payload_too_large'
    console.error(
      '[contact] Could not read the request body:',
      error instanceof Error ? `${error.name}: ${error.message}` : error,
    )
    return res.status(tooLarge ? 413 : 400).json({
      success: false,
      message: CONTACT_ERROR_MESSAGE,
    })
  }
}
