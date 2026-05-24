import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { ApiError } from '../../api/client'
import { resolveAuthStore } from '../../di/container'
import {
  AuthButton,
  AuthCard,
  AuthField,
  AuthInput,
  handleFormSubmit,
} from './AuthUi'

const authStore = resolveAuthStore()

export const AdminLoginPage = observer(function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      await authStore.login({ login: email, password })
      if (!authStore.isAdmin) {
        await authStore.logout()
        setError('These credentials are not authorized for admin access.')
        return
      }
      navigate('/admin')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Admin sign-in failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Admin sign in"
      subtitle="Use your configured admin email and password"
      footer={
        <p className="text-center text-sm text-dashboard-muted">
          <Link to="/" className="font-medium text-accent hover:text-accent-hover">
            Back to portfolio
          </Link>
          {' · '}
          <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
            Member sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleFormSubmit(onSubmit)}>
        <AuthField id="admin-email" label="Admin email">
          <AuthInput
            id="admin-email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </AuthField>
        <AuthField id="admin-password" label="Admin password">
          <AuthInput
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </AuthField>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <AuthButton type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Signing in…' : 'Sign in to admin'}
        </AuthButton>
      </form>
    </AuthCard>
  )
})
