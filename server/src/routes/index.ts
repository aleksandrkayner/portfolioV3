import type { FastifyInstance } from 'fastify'
import type { Env } from '../config/env.js'
import { getDb } from '../db/index.js'
import {
  destroySession,
  findOrCreateOAuthUser,
  loginUser,
  registerUser,
  toPublicUser,
} from '../services/auth.js'
import {
  consumeOAuthState,
  createOAuthRedirect,
  exchangeFacebookCode,
  exchangeGoogleCode,
} from '../services/oauth.js'
import {
  attachCurrentUser,
  clearSessionCookie,
  requireAuth,
  SESSION_COOKIE,
  setSessionCookie,
} from '../middleware/session.js'
import { formatZodError, updateUserStatusSchema } from '../lib/validation.js'
import {
  requestPasswordReset,
  resetPasswordWithToken,
  validateResetToken,
} from '../services/passwordReset.js'

export async function authRoutes(app: FastifyInstance, env: Env) {
  app.addHook('preHandler', attachCurrentUser)

  app.post('/register', async (request, reply) => {
    const db = getDb(env.DATABASE_URL)
    const result = await registerUser(db, env, request.body as never)
    if ('error' in result) {
      return reply.code(400).send({ error: result.error })
    }
    setSessionCookie(reply, env, result.sessionToken)
    return { user: result.user }
  })

  app.post('/login', async (request, reply) => {
    const db = getDb(env.DATABASE_URL)
    const result = await loginUser(db, env, request.body as never)
    if ('error' in result) {
      return reply.code(401).send({ error: result.error })
    }
    setSessionCookie(reply, env, result.sessionToken)
    return { user: result.user }
  })

  app.post('/logout', async (request, reply) => {
    const db = getDb(env.DATABASE_URL)
    const token = request.cookies[SESSION_COOKIE]
    if (token) await destroySession(db, token)
    clearSessionCookie(reply, env)
    return { ok: true }
  })

  app.post('/forgot-password', async (request, reply) => {
    const db = getDb(env.DATABASE_URL)
    const result = await requestPasswordReset(db, env, request.body as { email: string })
    if ('error' in result) {
      return reply.code(400).send({ error: result.error })
    }
    return { message: result.message }
  })

  app.get('/reset-password/validate', async (request, reply) => {
    const db = getDb(env.DATABASE_URL)
    const { token } = request.query as { token?: string }
    if (!token) {
      return reply.code(400).send({ valid: false })
    }
    return validateResetToken(db, token)
  })

  app.post('/reset-password', async (request, reply) => {
    const db = getDb(env.DATABASE_URL)
    const result = await resetPasswordWithToken(db, request.body as never)
    if ('error' in result) {
      return reply.code(400).send({ error: result.error })
    }
    return { message: result.message }
  })

  app.get('/me', async (request, reply) => {
    const user = requireAuth(request, reply)
    if (!user) return
    const db = getDb(env.DATABASE_URL)
    return { user: await toPublicUser(db, user) }
  })

  app.get('/google', async (_request, reply) => {
    try {
      const url = createOAuthRedirect(env, 'google')
      return reply.redirect(url)
    } catch (err) {
      return reply.code(503).send({
        error: err instanceof Error ? err.message : 'Google OAuth unavailable',
      })
    }
  })

  app.get('/google/callback', async (request, reply) => {
    const query = request.query as { code?: string; state?: string; error?: string }
    if (query.error) {
      return reply.redirect(`${env.CLIENT_URL}/login?error=oauth_cancelled`)
    }
    if (!query.code || !query.state || !consumeOAuthState(query.state, 'google')) {
      return reply.redirect(`${env.CLIENT_URL}/login?error=oauth_invalid`)
    }

    try {
      const db = getDb(env.DATABASE_URL)
      const profile = await exchangeGoogleCode(env, query.code)
      const result = await findOrCreateOAuthUser(db, env, 'google', profile)
      setSessionCookie(reply, env, result.sessionToken)
      const dest = result.user.status === 'pending' ? '/login?registered=pending' : '/'
      return reply.redirect(`${env.CLIENT_URL}${dest}`)
    } catch {
      return reply.redirect(`${env.CLIENT_URL}/login?error=oauth_failed`)
    }
  })

  app.get('/facebook', async (_request, reply) => {
    try {
      const url = createOAuthRedirect(env, 'facebook')
      return reply.redirect(url)
    } catch (err) {
      return reply.code(503).send({
        error: err instanceof Error ? err.message : 'Facebook OAuth unavailable',
      })
    }
  })

  app.get('/facebook/callback', async (request, reply) => {
    const query = request.query as { code?: string; state?: string; error?: string }
    if (query.error) {
      return reply.redirect(`${env.CLIENT_URL}/login?error=oauth_cancelled`)
    }
    if (!query.code || !query.state || !consumeOAuthState(query.state, 'facebook')) {
      return reply.redirect(`${env.CLIENT_URL}/login?error=oauth_invalid`)
    }

    try {
      const db = getDb(env.DATABASE_URL)
      const profile = await exchangeFacebookCode(env, query.code)
      const result = await findOrCreateOAuthUser(db, env, 'facebook', profile)
      setSessionCookie(reply, env, result.sessionToken)
      const dest = result.user.status === 'pending' ? '/login?registered=pending' : '/'
      return reply.redirect(`${env.CLIENT_URL}${dest}`)
    } catch {
      return reply.redirect(`${env.CLIENT_URL}/login?error=oauth_failed`)
    }
  })
}

export async function adminRoutes(app: FastifyInstance, env: Env) {
  app.addHook('preHandler', attachCurrentUser)

  app.get('/users', async (request, reply) => {
    const admin = await (await import('../middleware/session.js')).requireAdmin(request, reply)
    if (!admin) return
    const db = getDb(env.DATABASE_URL)
    const { listUsersForAdmin } = await import('../services/auth.js')
    return { users: await listUsersForAdmin(db) }
  })

  app.get('/privileges', async (request, reply) => {
    const admin = await (await import('../middleware/session.js')).requireAdmin(request, reply)
    if (!admin) return
    const db = getDb(env.DATABASE_URL)
    const { listPrivileges } = await import('../services/auth.js')
    return { privileges: await listPrivileges(db) }
  })

  app.patch('/users/:id/status', async (request, reply) => {
    const admin = await (await import('../middleware/session.js')).requireAdmin(request, reply)
    if (!admin) return

    const parsed = updateUserStatusSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ error: formatZodError(parsed.error) })
    }

    const db = getDb(env.DATABASE_URL)
    const { updateUserStatus } = await import('../services/auth.js')
    const { id } = request.params as { id: string }
    const user = await updateUserStatus(
      db,
      env,
      admin.id,
      id,
      parsed.data.status,
      parsed.data.rejectionReason,
    )
    if (!user) return reply.code(404).send({ error: 'User not found' })
    return { user }
  })

  app.put('/users/:id/privileges', async (request, reply) => {
    const admin = await (await import('../middleware/session.js')).requireAdmin(request, reply)
    if (!admin) return

    const { updateUserPrivilegesSchema } = await import('../lib/validation.js')
    const parsed = updateUserPrivilegesSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ error: formatZodError(parsed.error) })
    }

    const db = getDb(env.DATABASE_URL)
    const { setUserPrivileges } = await import('../services/auth.js')
    const { id } = request.params as { id: string }
    const user = await setUserPrivileges(db, id, parsed.data.privilegeKeys)
    if (!user) return reply.code(404).send({ error: 'User not found' })
    return { user }
  })
}
