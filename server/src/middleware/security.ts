import type { FastifyReply, FastifyRequest } from 'fastify'
import type { Env } from '../config/env.js'
import { getDb } from '../db/index.js'
import type { User } from '../db/schema.js'
import { userHasPrivilege } from '../services/auth.js'

function normalizeOrigin(url: string): string {
  return url.replace(/\/$/, '')
}

export function verifyRequestOrigin(env: Env) {
  const allowed = normalizeOrigin(env.CLIENT_URL)

  return async function originGuard(request: FastifyRequest, reply: FastifyReply) {
    const method = request.method.toUpperCase()
    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return
    }

    const origin = request.headers.origin
    if (origin) {
      if (normalizeOrigin(origin) !== allowed) {
        return reply.code(403).send({ error: 'Forbidden' })
      }
      return
    }

    const referer = request.headers.referer
    if (referer) {
      const ok =
        referer === allowed ||
        referer.startsWith(`${allowed}/`) ||
        referer.startsWith(`${allowed}?`)
      if (!ok) {
        return reply.code(403).send({ error: 'Forbidden' })
      }
    }
  }
}

export async function requireApprovedPrivilege(
  request: FastifyRequest,
  reply: FastifyReply,
  env: Env,
  privilegeKey: string,
): Promise<User | null> {
  if (!request.currentUser) {
    reply.code(401).send({ error: 'Authentication required' })
    return null
  }

  const db = getDb(env.DATABASE_URL)
  const allowed = await userHasPrivilege(db, request.currentUser.id, privilegeKey)
  if (!allowed) {
    reply.code(403).send({ error: 'Access denied' })
    return null
  }

  return request.currentUser
}
