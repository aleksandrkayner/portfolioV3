import { and, eq, gt, or } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type * as schema from '../db/schema.js'
import {
  oauthAccounts,
  privileges,
  rolePrivileges,
  roles,
  sessions,
  userPrivileges,
  userRoles,
  users,
  type User,
} from '../db/schema.js'
import { createSessionToken, hashToken, type Env } from '../config/env.js'
import { hashPassword, verifyPassword } from '../lib/password.js'
import {
  formatZodError,
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from '../lib/validation.js'
import { notifyAdminNewRegistration, notifyUserApproved } from './email.js'
import { isAdminLoginAttempt, verifyAdminLoginPassword } from '../lib/adminLogin.js'

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14 // 14 days
const ADMIN_USERNAME = 'admin'

type Db = PostgresJsDatabase<typeof schema>

export type PublicUser = {
  id: string
  username: string | null
  email: string
  displayName: string
  avatarUrl: string | null
  status: User['status']
  roles: string[]
  privileges: string[]
  isAdmin: boolean
}

export async function getUserPrivileges(db: Db, userId: string): Promise<string[]> {
  const roleRows = await db
    .select({ key: privileges.key })
    .from(userRoles)
    .innerJoin(rolePrivileges, eq(userRoles.roleId, rolePrivileges.roleId))
    .innerJoin(privileges, eq(rolePrivileges.privilegeId, privileges.id))
    .where(eq(userRoles.userId, userId))

  const directRows = await db
    .select({ key: privileges.key })
    .from(userPrivileges)
    .innerJoin(privileges, eq(userPrivileges.privilegeId, privileges.id))
    .where(eq(userPrivileges.userId, userId))

  return [...new Set([...roleRows, ...directRows].map((row) => row.key))].sort()
}

export async function getUserRoles(db: Db, userId: string): Promise<string[]> {
  const rows = await db
    .select({ name: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId))

  return rows.map((row) => row.name).sort()
}

export async function toPublicUser(db: Db, user: User): Promise<PublicUser> {
  const [roles, privilegeKeys] = await Promise.all([
    getUserRoles(db, user.id),
    getUserPrivileges(db, user.id),
  ])

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    status: user.status,
    roles,
    privileges: privilegeKeys,
    isAdmin: privilegeKeys.includes('admin:manage_users'),
  }
}

async function assignAdminRole(db: Db, userId: string) {
  const [adminRole] = await db
    .select()
    .from(roles)
    .where(eq(roles.name, 'admin'))
    .limit(1)
  if (adminRole) {
    await db
      .insert(userRoles)
      .values({ userId, roleId: adminRole.id })
      .onConflictDoNothing()
  }
}

async function ensureAdminAccount(db: Db, env: Env): Promise<User> {
  const email = env.ADMIN_LOGIN_EMAIL.toLowerCase()
  const passwordHash = await hashPassword(env.ADMIN_LOGIN_PASSWORD)

  let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

  if (!user) {
    ;[user] = await db
      .insert(users)
      .values({
        email,
        username: ADMIN_USERNAME,
        displayName: 'Admin',
        passwordHash,
        status: 'approved',
        approvedAt: new Date(),
      })
      .returning()
  } else {
    ;[user] = await db
      .update(users)
      .set({
        passwordHash,
        status: 'approved',
        approvedAt: user.approvedAt ?? new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning()
  }

  await assignAdminRole(db, user.id)
  return user
}

export async function registerUser(
  db: Db,
  env: Env,
  input: RegisterInput,
): Promise<{ user: PublicUser; sessionToken: string } | { error: string }> {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) {
    return { error: formatZodError(parsed.error) }
  }

  const { username, email, password, displayName } = parsed.data

  if (email.toLowerCase() === env.ADMIN_LOGIN_EMAIL.toLowerCase()) {
    return { error: 'This email is reserved for admin sign-in.' }
  }

  const passwordHash = await hashPassword(password)

  try {
    const [created] = await db
      .insert(users)
      .values({
        username,
        email: email.toLowerCase(),
        passwordHash,
        displayName,
        status: 'pending',
      })
      .returning()

    const sessionToken = await createSessionForUser(db, created.id)
    const publicUser = await toPublicUser(db, created)

    await notifyAdminNewRegistration(env, {
      displayName,
      email: email.toLowerCase(),
      username,
    })

    return { user: publicUser, sessionToken }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed'
    if (message.includes('users_email_unique')) {
      return { error: 'Email is already registered' }
    }
    if (message.includes('users_username_unique')) {
      return { error: 'Username is already taken' }
    }
    return { error: 'Registration failed' }
  }
}

export async function loginUser(
  db: Db,
  env: Env,
  input: LoginInput,
): Promise<{ user: PublicUser; sessionToken: string } | { error: string }> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) {
    return { error: formatZodError(parsed.error) }
  }

  const { login, password } = parsed.data
  const normalizedLogin = login.toLowerCase()

  if (isAdminLoginAttempt(env, login)) {
    if (!verifyAdminLoginPassword(env, password)) {
      return { error: 'Invalid username/email or password' }
    }
    const adminUser = await ensureAdminAccount(db, env)
    const sessionToken = await createSessionForUser(db, adminUser.id)
    return { user: await toPublicUser(db, adminUser), sessionToken }
  }

  const [user] = await db
    .select()
    .from(users)
    .where(
      or(
        eq(users.email, normalizedLogin),
        eq(users.username, login),
      ),
    )
    .limit(1)

  if (!user?.passwordHash) {
    return { error: 'Invalid username/email or password' }
  }

  if (user.status === 'suspended') {
    return { error: 'Account is suspended' }
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    return { error: 'Invalid username/email or password' }
  }

  const sessionToken = await createSessionForUser(db, user.id)
  const publicUser = await toPublicUser(db, user)
  return { user: publicUser, sessionToken }
}

export async function createSessionForUser(db: Db, userId: string): Promise<string> {
  const sessionToken = createSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)

  await db.insert(sessions).values({
    userId,
    tokenHash: hashToken(sessionToken),
    expiresAt,
  })

  return sessionToken
}

export async function destroySession(db: Db, sessionToken: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(sessionToken)))
}

export async function getUserBySessionToken(
  db: Db,
  sessionToken: string | undefined,
): Promise<User | null> {
  if (!sessionToken) return null

  const [row] = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, hashToken(sessionToken)),
        gt(sessions.expiresAt, new Date()),
      ),
    )
    .limit(1)

  return row?.user ?? null
}

export async function findOrCreateOAuthUser(
  db: Db,
  env: Env,
  provider: 'google' | 'facebook',
  account: { providerAccountId: string; email: string; displayName: string; avatarUrl?: string },
): Promise<{ user: PublicUser; sessionToken: string; isNew: boolean }> {
  const [existingOAuth] = await db
    .select({ user: users })
    .from(oauthAccounts)
    .innerJoin(users, eq(oauthAccounts.userId, users.id))
    .where(
      and(
        eq(oauthAccounts.provider, provider),
        eq(oauthAccounts.providerAccountId, account.providerAccountId),
      ),
    )
    .limit(1)

  if (existingOAuth) {
    if (existingOAuth.user.status === 'suspended') {
      throw new Error('Account is suspended')
    }
    const sessionToken = await createSessionForUser(db, existingOAuth.user.id)
    return {
      user: await toPublicUser(db, existingOAuth.user),
      sessionToken,
      isNew: false,
    }
  }

  const email = account.email.toLowerCase()
  let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  let isNew = false

  if (!user) {
    isNew = true
    ;[user] = await db
      .insert(users)
      .values({
        email,
        displayName: account.displayName,
        avatarUrl: account.avatarUrl ?? null,
        status: 'pending',
      })
      .returning()

    await notifyAdminNewRegistration(env, {
      displayName: account.displayName,
      email,
      username: null,
    })
  }

  await db.insert(oauthAccounts).values({
    userId: user.id,
    provider,
    providerAccountId: account.providerAccountId,
  })

  const sessionToken = await createSessionForUser(db, user.id)
  return {
    user: await toPublicUser(db, user),
    sessionToken,
    isNew,
  }
}

export async function listUsersForAdmin(db: Db) {
  const allUsers = await db.select().from(users).orderBy(users.createdAt)
  return Promise.all(allUsers.map((user) => toPublicUser(db, user)))
}

export async function listPrivileges(db: Db) {
  return db.select().from(privileges).orderBy(privileges.key)
}

export async function updateUserStatus(
  db: Db,
  env: Env,
  adminId: string,
  userId: string,
  status: User['status'],
  rejectionReason?: string,
) {
  const [updated] = await db
    .update(users)
    .set({
      status,
      rejectionReason: status === 'rejected' ? rejectionReason ?? null : null,
      approvedAt: status === 'approved' ? new Date() : null,
      approvedBy: status === 'approved' ? adminId : null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning()

  if (updated && status === 'approved') {
    const [memberRole] = await db
      .select()
      .from(roles)
      .where(eq(roles.name, 'member'))
      .limit(1)
    if (memberRole) {
      await db
        .insert(userRoles)
        .values({ userId, roleId: memberRole.id })
        .onConflictDoNothing()
    }
    await notifyUserApproved(env, { email: updated.email, displayName: updated.displayName })
  }

  return updated ? toPublicUser(db, updated) : null
}

export async function setUserPrivileges(
  db: Db,
  userId: string,
  privilegeKeys: string[],
) {
  const all = await db.select().from(privileges)
  const selected = all.filter((p) => privilegeKeys.includes(p.key))

  await db.delete(userPrivileges).where(eq(userPrivileges.userId, userId))

  if (selected.length > 0) {
    await db.insert(userPrivileges).values(
      selected.map((p) => ({ userId, privilegeId: p.id })),
    )
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  return user ? toPublicUser(db, user) : null
}

export async function userHasPrivilege(
  db: Db,
  userId: string,
  privilegeKey: string,
): Promise<boolean> {
  const keys = await getUserPrivileges(db, userId)
  return keys.includes(privilegeKey)
}
