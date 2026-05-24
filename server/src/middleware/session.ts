import type { FastifyReply, FastifyRequest } from 'fastify'
import type { Env } from '../config/env.js'
import { getDb } from '../db/index.js'
import type { User } from '../db/schema.js'
import { getUserBySessionToken } from '../services/auth.js'

export const SESSION_COOKIE = 'portfolio_session'

declare module 'fastify' {
  interface FastifyRequest {
    currentUser: User | null
  }
}

export function setSessionCookie(reply: FastifyReply, env: Env, token: string) {
  reply.setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 14,
  })
}

export function clearSessionCookie(reply: FastifyReply, env: Env) {
  reply.clearCookie(SESSION_COOKIE, {
    path: '/',
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
  })
}

export async function attachCurrentUser(request: FastifyRequest) {
  const db = getDb(process.env.DATABASE_URL!)
  const token = request.cookies[SESSION_COOKIE]
  request.currentUser = await getUserBySessionToken(db, token)
}

export function requireAuth(request: FastifyRequest, reply: FastifyReply): User | null {
  if (!request.currentUser) {
    reply.code(401).send({ error: 'Authentication required' })
    return null
  }
  return request.currentUser
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply): Promise<User | null> {
  const user = requireAuth(request, reply)
  if (!user) return null

  const db = getDb(process.env.DATABASE_URL!)
  const { userHasPrivilege } = await import('../services/auth.js')
  const allowed = await userHasPrivilege(db, user.id, 'admin:manage_users')
  if (!allowed) {
    reply.code(403).send({ error: 'Admin access required' })
    return null
  }
  return user
}
