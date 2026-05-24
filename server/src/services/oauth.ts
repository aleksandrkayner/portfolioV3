import { and, eq, lt } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type { Env } from '../config/env.js'
import { createOAuthState } from '../config/env.js'
import type * as schema from '../db/schema.js'
import { oauthStates } from '../db/schema.js'

type Db = PostgresJsDatabase<typeof schema>

const STATE_TTL_MS = 1000 * 60 * 10

function callbackUrl(env: Env, provider: 'google' | 'facebook'): string {
  return `${env.CLIENT_URL.replace(/\/$/, '')}/api/auth/${provider}/callback`
}

export async function cleanupOAuthStates(db: Db): Promise<void> {
  await db.delete(oauthStates).where(lt(oauthStates.expiresAt, new Date()))
}

async function storeOAuthState(
  db: Db,
  state: string,
  provider: 'google' | 'facebook',
): Promise<void> {
  await cleanupOAuthStates(db)
  await db.insert(oauthStates).values({
    state,
    provider,
    expiresAt: new Date(Date.now() + STATE_TTL_MS),
  })
}

export async function createOAuthRedirect(
  db: Db,
  env: Env,
  provider: 'google' | 'facebook',
): Promise<string> {
  const state = createOAuthState()
  await storeOAuthState(db, state, provider)
  const redirectUri = callbackUrl(env, provider)

  if (provider === 'google') {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth is not configured')
    }
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'online',
      prompt: 'select_account',
    })
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  if (!env.FACEBOOK_APP_ID || !env.FACEBOOK_APP_SECRET) {
    throw new Error('Facebook OAuth is not configured')
  }
  const params = new URLSearchParams({
    client_id: env.FACEBOOK_APP_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'email,public_profile',
    state,
  })
  return `https://www.facebook.com/v21.0/dialog/oauth?${params}`
}

export async function consumeOAuthState(
  db: Db,
  state: string,
  provider: 'google' | 'facebook',
): Promise<boolean> {
  const [row] = await db
    .select()
    .from(oauthStates)
    .where(and(eq(oauthStates.state, state), eq(oauthStates.provider, provider)))
    .limit(1)

  if (!row || row.expiresAt < new Date()) {
    return false
  }

  await db.delete(oauthStates).where(eq(oauthStates.state, state))
  return true
}

export async function exchangeGoogleCode(env: Env, code: string) {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth is not configured')
  }

  const redirectUri = callbackUrl(env, 'google')
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) throw new Error('Google token exchange failed')
  const tokenData = (await tokenRes.json()) as { access_token?: string }
  if (!tokenData.access_token) throw new Error('Google token missing')

  const profileRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  })
  if (!profileRes.ok) throw new Error('Google profile fetch failed')

  const profile = (await profileRes.json()) as {
    sub?: string
    email?: string
    name?: string
    picture?: string
  }

  if (!profile.sub || !profile.email) {
    throw new Error('Google account missing required profile data')
  }

  return {
    providerAccountId: profile.sub,
    email: profile.email,
    displayName: profile.name ?? profile.email.split('@')[0],
    avatarUrl: profile.picture,
  }
}

export async function exchangeFacebookCode(env: Env, code: string) {
  if (!env.FACEBOOK_APP_ID || !env.FACEBOOK_APP_SECRET) {
    throw new Error('Facebook OAuth is not configured')
  }

  const redirectUri = callbackUrl(env, 'facebook')
  const tokenUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token')
  tokenUrl.searchParams.set('client_id', env.FACEBOOK_APP_ID)
  tokenUrl.searchParams.set('client_secret', env.FACEBOOK_APP_SECRET)
  tokenUrl.searchParams.set('redirect_uri', redirectUri)
  tokenUrl.searchParams.set('code', code)

  const tokenRes = await fetch(tokenUrl)
  if (!tokenRes.ok) throw new Error('Facebook token exchange failed')
  const tokenData = (await tokenRes.json()) as { access_token?: string }
  if (!tokenData.access_token) throw new Error('Facebook token missing')

  const profileUrl = new URL('https://graph.facebook.com/me')
  profileUrl.searchParams.set('fields', 'id,name,email,picture')
  profileUrl.searchParams.set('access_token', tokenData.access_token)

  const profileRes = await fetch(profileUrl)
  if (!profileRes.ok) throw new Error('Facebook profile fetch failed')
  const profile = (await profileRes.json()) as {
    id?: string
    name?: string
    email?: string
    picture?: { data?: { url?: string } }
  }

  if (!profile.id || !profile.email) {
    throw new Error('Facebook account must share email to register')
  }

  return {
    providerAccountId: profile.id,
    email: profile.email,
    displayName: profile.name ?? profile.email.split('@')[0],
    avatarUrl: profile.picture?.data?.url,
  }
}
