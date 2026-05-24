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
  OAuthButtons,
} from './AuthUi'

const authStore = resolveAuthStore()

function validateClient(input: {
  username: string
  email: string
  password: string
  displayName: string
}) {
  const errors: Record<string, string> = {}
  if (!/^[a-zA-Z0-9_]{3,32}$/.test(input.username)) {
    errors.username = '3–32 characters: letters, numbers, underscores only'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.email = 'Enter a valid email'
  }
  if (input.password.length < 8) {
    errors.password = 'At least 8 characters'
  } else if (!/[a-z]/.test(input.password)) {
    errors.password = 'Include a lowercase letter'
  } else if (!/[A-Z]/.test(input.password)) {
    errors.password = 'Include an uppercase letter'
  } else if (!/[0-9]/.test(input.password)) {
    errors.password = 'Include a number'
  } else if (!/[^a-zA-Z0-9]/.test(input.password)) {
    errors.password = 'Include a special character'
  }
  if (!input.displayName.trim()) {
    errors.displayName = 'Display name is required'
  }
  return errors
}

export const RegisterPage = observer(function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    displayName: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function onSubmit() {
    const clientErrors = validateClient(form)
    setFieldErrors(clientErrors)
    if (Object.keys(clientErrors).length > 0) return

    setSubmitting(true)
    setError(null)
    try {
      await authStore.register(form)
      navigate('/')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Create account"
      subtitle="Open registration — admin approval required for member access"
      footer={
        <p className="text-center text-sm text-dashboard-muted">
          Already registered?{' '}
          <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
            Sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleFormSubmit(onSubmit)}>
        <AuthField id="displayName" label="Display name" error={fieldErrors.displayName}>
          <AuthInput
            id="displayName"
            value={form.displayName}
            onChange={(e) => updateField('displayName', e.target.value)}
            required
          />
        </AuthField>
        <AuthField id="username" label="Username" error={fieldErrors.username}>
          <AuthInput
            id="username"
            autoComplete="username"
            value={form.username}
            onChange={(e) => updateField('username', e.target.value)}
            required
          />
        </AuthField>
        <AuthField id="email" label="Email" error={fieldErrors.email}>
          <AuthInput
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            required
          />
        </AuthField>
        <AuthField id="password" label="Password" error={fieldErrors.password}>
          <AuthInput
            id="password"
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            required
          />
        </AuthField>
        <p className="text-xs text-dashboard-muted">
          Password: 8+ chars with upper, lower, number, and special character.
        </p>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <AuthButton type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Creating account…' : 'Register'}
        </AuthButton>
      </form>
      <div className="mt-6">
        <OAuthButtons />
      </div>
    </AuthCard>
  )
})
