import 'dotenv/config'
import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import { loadEnv } from './config/env.js'
import { closeDb, getDb } from './db/index.js'
import { adminRoutes, authRoutes } from './routes/index.js'

const env = loadEnv()
const app = Fastify({ logger: env.NODE_ENV === 'development' })

await app.register(helmet, {
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
})

await app.register(cors, {
  origin: env.CLIENT_URL,
  credentials: true,
})

await app.register(cookie, {
  secret: env.SESSION_SECRET,
  hook: 'onRequest',
})

await app.register(rateLimit, {
  global: false,
})

getDb(env.DATABASE_URL)

app.get('/api/health', async () => ({ ok: true }))

await app.register(
  async (scope) => {
    await authRoutes(scope, env)
  },
  { prefix: '/api/auth' },
)

await app.register(
  async (scope) => {
    await adminRoutes(scope, env)
  },
  { prefix: '/api/admin' },
)

const host = env.API_HOST
const port = env.PORT
await app.listen({ port, host })
console.log(`API listening on http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`)

async function shutdown() {
  await app.close()
  await closeDb()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
