import { timingSafeEqual } from 'node:crypto'
import type { Env } from '../config/env.js'

function secureCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export function isAdminLoginAttempt(env: Env, login: string): boolean {
  return login.trim().toLowerCase() === env.ADMIN_LOGIN_EMAIL.toLowerCase()
}

export function verifyAdminLoginPassword(env: Env, password: string): boolean {
  return secureCompare(password, env.ADMIN_LOGIN_PASSWORD)
}

export function matchesAdminLogin(env: Env, login: string, password: string): boolean {
  return isAdminLoginAttempt(env, login) && verifyAdminLoginPassword(env, password)
}
