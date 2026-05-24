import type { Env } from '../config/env.js'

export async function notifyAdminNewRegistration(
  env: Env,
  user: { displayName: string; email: string; username: string | null },
): Promise<void> {
  const message = [
    'New portfolio registration (pending approval)',
    `Name: ${user.displayName}`,
    `Email: ${user.email}`,
    `Username: ${user.username ?? '(OAuth only)'}`,
    `Review: ${env.CLIENT_URL}/admin`,
  ].join('\n')

  // Replace with Resend/SendGrid in production
  console.info(`[email → ${env.ADMIN_EMAIL}]\n${message}`)
}

export async function notifyUserApproved(
  env: Env,
  user: { email: string; displayName: string },
): Promise<void> {
  const message = [
    `Hi ${user.displayName},`,
    'Your portfolio account has been approved.',
    `Sign in: ${env.CLIENT_URL}/login`,
  ].join('\n')

  console.info(`[email → ${user.email}]\n${message}`)
}

export async function notifyPasswordReset(
  env: Env,
  user: { email: string; displayName: string },
  resetUrl: string,
): Promise<void> {
  const message = [
    `Hi ${user.displayName},`,
    'We received a request to reset your portfolio password.',
    `Reset link (expires in 1 hour): ${resetUrl}`,
    'If you did not request this, you can ignore this email.',
  ].join('\n')

  console.info(`[email → ${user.email}]\n${message}`)
}
