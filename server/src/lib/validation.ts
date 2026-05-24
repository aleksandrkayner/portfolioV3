import { z } from 'zod'

export const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(32, 'Username must be at most 32 characters')
  .regex(
    /^[a-zA-Z0-9_]+$/,
    'Username may only contain letters, numbers, and underscores',
  )

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[0-9]/, 'Password must include a number')
  .regex(/[^a-zA-Z0-9]/, 'Password must include a special character')

export const emailSchema = z
  .string()
  .trim()
  .email('Enter a valid email address')
  .max(254, 'Email is too long')

export const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().trim().min(1, 'Display name is required').max(80),
})

export const loginSchema = z.object({
  login: z
    .string()
    .trim()
    .min(1, 'Username or email is required')
    .max(254),
  password: z.string().min(1, 'Password is required'),
})

export const updateUserStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'suspended']),
  rejectionReason: z.string().trim().max(500).optional(),
})

export const updateUserPrivilegesSchema = z.object({
  privilegeKeys: z.array(z.string().min(1).max(64)),
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, 'Reset token is required'),
  password: passwordSchema,
})

export const resetTokenSchema = z.object({
  token: z.string().trim().min(1, 'Reset token is required'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>

export function formatZodError(error: z.ZodError): string {
  return error.errors.map((e) => e.message).join('. ')
}
