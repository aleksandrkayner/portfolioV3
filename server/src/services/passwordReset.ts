import { and, eq, gt, isNull } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type * as schema from '../db/schema.js'
import { passwordResetTokens, sessions, users } from '../db/schema.js'
import { createSessionToken, hashToken, type Env } from '../config/env.js'
import { hashPassword } from '../lib/password.js'
import {
  forgotPasswordSchema,
  formatZodError,
  resetPasswordSchema,
} from '../lib/validation.js'
import { notifyPasswordReset } from './email.js'

const RESET_TTL_MS = 1000 * 60 * 60 // 1 hour

type Db = PostgresJsDatabase<typeof schema>

const GENERIC_FORGOT_MESSAGE =
  'If an account exists with that email, a password reset link has been sent.'

export async function requestPasswordReset(
  db: Db,
  env: Env,
  input: { email: string },
): Promise<{ message: string } | { error: string }> {
  const parsed = forgotPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { error: formatZodError(parsed.error) }
  }

  const email = parsed.data.email.toLowerCase()
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

  if (!user?.passwordHash) {
    return { message: GENERIC_FORGOT_MESSAGE }
  }

  const plainToken = createSessionToken()
  const expiresAt = new Date(Date.now() + RESET_TTL_MS)

  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.userId, user.id))

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash: hashToken(plainToken),
    expiresAt,
  })

  const resetUrl = `${env.CLIENT_URL.replace(/\/$/, '')}/reset-password#token=${encodeURIComponent(plainToken)}`
  await notifyPasswordReset(env, { email: user.email, displayName: user.displayName }, resetUrl)

  return { message: GENERIC_FORGOT_MESSAGE }
}

export async function resetPasswordWithToken(
  db: Db,
  input: { token: string; password: string },
): Promise<{ message: string } | { error: string }> {
  const parsed = resetPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { error: formatZodError(parsed.error) }
  }

  const tokenHash = hashToken(parsed.data.token)
  const [row] = await db
    .select({ reset: passwordResetTokens, user: users })
    .from(passwordResetTokens)
    .innerJoin(users, eq(passwordResetTokens.userId, users.id))
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .limit(1)

  if (!row) {
    return { error: 'Invalid or expired reset link. Request a new one.' }
  }

  const passwordHash = await hashPassword(parsed.data.password)

  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, row.user.id))

  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.id, row.reset.id))

  await db.delete(sessions).where(eq(sessions.userId, row.user.id))

  return { message: 'Password updated. You can sign in with your new password.' }
}

export async function validateResetToken(
  db: Db,
  token: string,
): Promise<{ valid: boolean }> {
  if (!token.trim()) return { valid: false }

  const [row] = await db
    .select({ id: passwordResetTokens.id })
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, hashToken(token)),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date()),
      ),
    )
    .limit(1)

  return { valid: Boolean(row) }
}
