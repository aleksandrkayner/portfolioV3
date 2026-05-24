const API_BASE = '/api'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    signal: AbortSignal.timeout(8000),
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  const data = (await res.json().catch(() => ({}))) as { error?: string } & T
  if (!res.ok) {
    throw new ApiError(data.error ?? 'Request failed', res.status)
  }
  return data
}

export const api = {
  register: (body: unknown) =>
    request<{ user: import('../types/auth').AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: unknown) =>
    request<{ user: import('../types/auth').AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  logout: () =>
    request<{ ok: boolean }>('/auth/logout', { method: 'POST' }),

  forgotPassword: (body: { email: string }) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  validateResetToken: (token: string) =>
    request<{ valid: boolean }>(`/auth/reset-password/validate?token=${encodeURIComponent(token)}`),

  resetPassword: (body: { token: string; password: string }) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  me: () =>
    request<{ user: import('../types/auth').AuthUser }>('/auth/me'),

  adminUsers: () =>
    request<{ users: import('../types/auth').AuthUser[] }>('/admin/users'),

  adminPrivileges: () =>
    request<{ privileges: import('../types/auth').Privilege[] }>('/admin/privileges'),

  updateUserStatus: (id: string, body: unknown) =>
    request<{ user: import('../types/auth').AuthUser }>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  updateUserPrivileges: (id: string, body: unknown) =>
    request<{ user: import('../types/auth').AuthUser }>(`/admin/users/${id}/privileges`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
}

export function oauthUrl(provider: 'google' | 'facebook'): string {
  return `${API_BASE}/auth/${provider}`
}
