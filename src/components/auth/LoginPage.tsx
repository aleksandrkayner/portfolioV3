import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { ApiError } from '../../api/client'
import { resolveAuthStore } from '../../di/container'
import {
  AuthButton,
  AuthCard,
  AuthField,
  AuthInput,
  handleFormSubmit,
  OAuthButtons,
} from './AuthUi'

const authStore = resolveAuthStore()

export const LoginPage = observer(function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const oauthError = params.get('error')
  const pendingNotice = params.get('registered') === 'pending'
  const resetSuccess = params.get('reset') === 'success'
  const loggedOut = params.get('loggedOut') === '1'

  async function onSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      await authStore.login({ login, password })
      navigate('/')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Sign in"
      subtitle="Access member content after approval"
      footer={
        <p className="text-center text-sm text-dashboard-muted">
          No account?{' '}
          <Link to="/register" className="font-medium text-accent hover:text-accent-hover">
            Create one
          </Link>
        </p>
      }
    >
      {loggedOut ? (
        <p className="mb-4 rounded-lg border border-dashboard-border bg-dashboard-surface px-3 py-2 text-sm text-dashboard-text">
          You have been signed out.
        </p>
      ) : null}
      {resetSuccess ? (
        <p className="mb-4 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-dashboard-text">
          Password updated. Sign in with your new password.
        </p>
      ) : null}
      {pendingNotice ? (
        <p className="mb-4 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-dashboard-text">
          Registration received. Your account is pending admin approval.
        </p>
      ) : null}
      {oauthError ? (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          Social sign-in failed. Try again or use email registration.
        </p>
      ) : null}
      <form className="space-y-4" onSubmit={handleFormSubmit(onSubmit)}>
        <AuthField id="login" label="Username or email">
          <AuthInput
            id="login"
            autoComplete="username"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
          />
        </AuthField>
        <AuthField id="password" label="Password">
          <AuthInput
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </AuthField>
        <p className="text-right text-xs">
          <Link to="/forgot-password" className="text-accent hover:text-accent-hover">
            Forgot password?
          </Link>
        </p>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <AuthButton type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Signing in…' : 'Sign in'}
        </AuthButton>
      </form>
      <div className="mt-6">
        <OAuthButtons />
      </div>
    </AuthCard>
  )
})
