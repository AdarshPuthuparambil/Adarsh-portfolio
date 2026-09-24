import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import type { ViteDevServer } from 'vite'

const EMAIL_ENV_KEYS = ['EMAIL_API_KEY', 'EMAIL_FROM', 'EMAIL_TO'] as const
const CONTACT_MAX_BODY_BYTES = 16 * 1024

function applyEmailEnv(env: Record<string, string>) {
  for (const key of EMAIL_ENV_KEYS) {
    if (env[key]) process.env[key] = env[key]
  }
}

function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.trim() !== '') {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  return req.socket.remoteAddress ?? 'unknown'
}

function readRequestBody(
  req: IncomingMessage,
  maxBytes: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    let settled = false

    const fail = (error: Error) => {
      if (settled) return
      settled = true
      reject(error)
    }

    req.on('data', (chunk: string | Buffer) => {
      const buffer = typeof chunk === 'string' ? Buffer.from(chunk) : chunk
      size += buffer.length
      if (size > maxBytes) {
        fail(new Error('payload_too_large'))
        req.destroy()
        return
      }
      chunks.push(buffer)
    })
    req.on('end', () => {
      if (settled) return
      settled = true
      resolve(Buffer.concat(chunks).toString('utf8'))
    })
    req.on('error', (error: Error) => fail(error))
  })
}

type ContactResponseBody = {
  success: boolean
  message: string
  emailId?: string
}

function sendJson(
  res: ServerResponse,
  status: number,
  body: ContactResponseBody,
) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

type ProcessContact = (input: {
  payload: unknown
  ip: string
}) => Promise<{
  status: number
  body: ContactResponseBody
}>

async function handleDevContactRequest(
  req: IncomingMessage,
  res: ServerResponse,
  loadProcessContact: () => Promise<ProcessContact>,
) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.setHeader('Allow', 'POST')
    res.end()
    return
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    sendJson(res, 405, {
      success: false,
      message: 'Unable to send your message right now. Please try again later.',
    })
    return
  }

  try {
    const rawBody = await readRequestBody(req, CONTACT_MAX_BODY_BYTES)
    const payload = rawBody ? (JSON.parse(rawBody) as unknown) : {}
    const processContact = await loadProcessContact()
    const result = await processContact({
      payload,
      ip: getClientIp(req),
    })
    sendJson(res, result.status, result.body)
  } catch (error) {
    console.error(
      '[contact] Request failed before reaching the email step:',
      error instanceof Error ? `${error.name}: ${error.message}` : error,
    )
    const tooLarge =
      error instanceof Error && error.message === 'payload_too_large'
    sendJson(res, tooLarge ? 413 : 400, {
      success: false,
      message: 'Unable to send your message right now. Please try again later.',
    })
  }
}

function contactApiPlugin(): Plugin {
  return {
    name: 'contact-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        const requestPath = req.url?.split('?')[0]
        if (requestPath !== '/api/contact' && requestPath !== '/api/contact/') {
          next()
          return
        }

        void handleDevContactRequest(req, res, async () => {
          const mod = (await server.ssrLoadModule(
            path.resolve(server.config.root, 'server/contact.ts'),
          )) as { processContact: ProcessContact }
          return mod.processContact
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  applyEmailEnv(env)

  return {
    plugins: [react(), tailwindcss(), contactApiPlugin()],
    ssr: {
      external: ['resend'],
    },
  }
})
