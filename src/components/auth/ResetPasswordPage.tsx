import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ApiError, api } from '../../api/client'
import {
  AuthButton,
  AuthCard,
  AuthField,
  AuthInput,
  handleFormSubmit,
} from './AuthUi'

function validatePassword(password: string): string | undefined {
  if (password.length < 8) return 'At least 8 characters'
  if (!/[a-z]/.test(password)) return 'Include a lowercase letter'
  if (!/[A-Z]/.test(password)) return 'Include an uppercase letter'
  if (!/[0-9]/.test(password)) return 'Include a number'
  if (!/[^a-zA-Z0-9]/.test(password)) return 'Include a special character'
  return undefined
}

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [checking, setChecking] = useState(true)
  const [validToken, setValidToken] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const passwordError = password ? validatePassword(password) : undefined

  useEffect(() => {
    if (!token) {
      setChecking(false)
      setValidToken(false)
      return
    }

    void api
      .validateResetToken(token)
      .then((result) => setValidToken(result.valid))
      .catch(() => setValidToken(false))
      .finally(() => setChecking(false))
  }, [token])

  async function onSubmit() {
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    const pwdError = validatePassword(password)
    if (pwdError) {
      setError(pwdError)
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const result = await api.resetPassword({ token, password })
      setMessage(result.message)
      setTimeout(() => navigate('/login?reset=success'), 2000)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Reset failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (checking) {
    return (
      <AuthCard title="Reset password" subtitle="Checking your reset link…">
        <p className="text-center text-sm text-dashboard-muted">Loading…</p>
      </AuthCard>
    )
  }

  if (!validToken) {
    return (
      <AuthCard
        title="Reset link invalid"
        subtitle="This link may have expired or already been used"
        footer={
          <p className="text-center text-sm text-dashboard-muted">
            <Link to="/forgot-password" className="font-medium text-accent hover:text-accent-hover">
              Request a new link
            </Link>
          </p>
        }
      >
        <p className="text-sm text-dashboard-muted">
          Password reset links expire after one hour.
        </p>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Set new password" subtitle="Choose a strong password for your account">
      {message ? (
        <p className="mb-4 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-dashboard-text">
          {message}
        </p>
      ) : null}
      <form className="space-y-4" onSubmit={handleFormSubmit(onSubmit)}>
        <AuthField id="password" label="New password" error={passwordError}>
          <AuthInput
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </AuthField>
        <AuthField id="confirm" label="Confirm password">
          <AuthInput
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </AuthField>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <AuthButton type="submit" disabled={submitting || Boolean(message)} className="w-full">
          {submitting ? 'Updating…' : 'Update password'}
        </AuthButton>
      </form>
    </AuthCard>
  )
}
