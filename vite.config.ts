import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'
import type { ViteDevServer } from 'vite'

const EMAIL_ENV_KEYS = ['EMAIL_API_KEY', 'EMAIL_FROM', 'EMAIL_TO'] as const
const CONTACT_MAX_BODY_BYTES = 16 * 1024
const CONTACT_ERROR_MESSAGE =
  'Unable to send your message right now. Please try again later.'

function applyEmailEnv(env: Record<string, string>) {
  for (const key of EMAIL_ENV_KEYS) {
    if (env[key]) process.env[key] = env[key]
  }
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

// Minimal stand-ins for VercelRequest/VercelResponse so the dev server can run
// api/contact.ts unchanged instead of a parallel dev-only implementation.
type VercelLikeRequest = {
  method?: string
  headers: IncomingMessage['headers']
  socket: IncomingMessage['socket']
  body?: unknown
}

type VercelLikeResponse = {
  setHeader: (name: string, value: string) => void
  status: (code: number) => VercelLikeResponse
  json: (body: unknown) => void
  end: () => void
}

type VercelLikeHandler = (
  req: VercelLikeRequest,
  res: VercelLikeResponse,
) => Promise<unknown>

function createResponseShim(res: ServerResponse): VercelLikeResponse {
  let statusCode = 200

  const shim: VercelLikeResponse = {
    setHeader(name, value) {
      res.setHeader(name, value)
    },
    status(code) {
      statusCode = code
      return shim
    },
    json(body) {
      res.statusCode = statusCode
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify(body))
    },
    end() {
      res.statusCode = statusCode
      res.end()
    },
  }

  return shim
}

function sendError(res: ServerResponse, status: number) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify({ success: false, message: CONTACT_ERROR_MESSAGE }))
}

async function handleDevContactRequest(
  req: IncomingMessage,
  res: ServerResponse,
  loadHandler: () => Promise<VercelLikeHandler>,
) {
  let body: unknown

  if (req.method === 'POST') {
    try {
      body = await readRequestBody(req, CONTACT_MAX_BODY_BYTES)
    } catch (error) {
      console.error(
        '[contact] Request failed before reaching the email step:',
        error instanceof Error ? `${error.name}: ${error.message}` : error,
      )
      const tooLarge =
        error instanceof Error && error.message === 'payload_too_large'
      sendError(res, tooLarge ? 413 : 400)
      return
    }
  }

  try {
    const handler = await loadHandler()
    await handler(
      {
        method: req.method,
        headers: req.headers,
        socket: req.socket,
        body,
      },
      createResponseShim(res),
    )
  } catch (error) {
    console.error(
      '[contact] Dev handler threw:',
      error instanceof Error ? `${error.name}: ${error.message}` : error,
    )
    if (!res.writableEnded) sendError(res, 500)
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
            path.resolve(server.config.root, 'api/contact.ts'),
          )) as { default: VercelLikeHandler }
          return mod.default
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
