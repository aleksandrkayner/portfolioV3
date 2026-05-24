import { randomBytes, createHash } from 'node:crypto'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  /** Bind address — use 127.0.0.1 locally; 0.0.0.0 behind a reverse proxy in production */
  API_HOST: z.string().default('127.0.0.1'),
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  /** Receives new registration notifications */
  ADMIN_EMAIL: z.string().email(),
  /** Admin panel login — only this email + password grants admin access */
  ADMIN_LOGIN_EMAIL: z.string().email(),
  ADMIN_LOGIN_PASSWORD: z.string().min(8),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
    process.exit(1)
  }
  return parsed.data
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function createSessionToken(): string {
  return randomBytes(32).toString('base64url')
}

export function createOAuthState(): string {
  return randomBytes(24).toString('base64url')
}
