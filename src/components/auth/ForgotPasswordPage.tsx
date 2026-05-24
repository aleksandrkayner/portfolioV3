import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ApiError } from '../../api/client'
import { api } from '../../api/client'
import {
  AuthButton,
  AuthCard,
  AuthField,
  AuthInput,
  handleFormSubmit,
} from './AuthUi'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function onSubmit() {
    setSubmitting(true)
    setError(null)
    setMessage(null)
    try {
      const result = await api.forgotPassword({ email })
      setMessage(result.message)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Request failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Forgot password"
      subtitle="Enter your email and we'll send a reset link if an account exists"
      footer={
        <p className="text-center text-sm text-dashboard-muted">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
            Sign in
          </Link>
        </p>
      }
    >
      {message ? (
        <p className="mb-4 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-dashboard-text">
          {message}
          <span className="mt-2 block text-xs text-dashboard-muted">
            In development, check the API terminal for the reset link.
          </span>
        </p>
      ) : null}
      <form className="space-y-4" onSubmit={handleFormSubmit(onSubmit)}>
        <AuthField id="email" label="Email">
          <AuthInput
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </AuthField>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <AuthButton type="submit" disabled={submitting || Boolean(message)} className="w-full">
          {submitting ? 'Sending…' : 'Send reset link'}
        </AuthButton>
      </form>
    </AuthCard>
  )
}
