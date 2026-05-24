import type { FormEvent, ReactNode } from 'react'

type FieldProps = {
  id: string
  label: string
  error?: string
  children: ReactNode
}

export function AuthField({ id, label, error, children }: FieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-dashboard-text">
        {label}
      </label>
      {children}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  )
}

export function AuthInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-dashboard-border bg-dashboard-bg px-3 py-2 text-sm text-dashboard-text outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30 ${props.className ?? ''}`}
    />
  )
}

export function AuthButton({
  children,
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger'
}) {
  const styles =
    variant === 'primary'
      ? 'bg-accent text-white hover:bg-accent-hover'
      : variant === 'danger'
        ? 'border border-red-500/40 text-red-300 hover:bg-red-500/10'
        : 'border border-dashboard-border text-dashboard-text hover:border-accent/50'

  return (
    <button
      {...props}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${props.className ?? ''}`}
    >
      {children}
    </button>
  )
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="widget-card mx-auto w-full max-w-md rounded-2xl border border-dashboard-border bg-dashboard-surface p-6 shadow-lg sm:p-8">
      <div className="mb-6 space-y-1 text-center">
        <h1 className="text-xl font-semibold text-dashboard-text">{title}</h1>
        {subtitle ? <p className="text-sm text-dashboard-muted">{subtitle}</p> : null}
      </div>
      {children}
      {footer ? <div className="mt-6 border-t border-dashboard-border pt-4">{footer}</div> : null}
    </div>
  )
}

export function OAuthButtons() {
  return (
    <div className="space-y-3">
      <p className="text-center text-xs uppercase tracking-wide text-dashboard-muted">Or continue with</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <a
          href="/api/auth/google"
          className="flex items-center justify-center gap-2 rounded-lg border border-dashboard-border px-3 py-2 text-sm font-medium text-dashboard-text transition hover:border-accent/50"
        >
          Google
        </a>
        <a
          href="/api/auth/facebook"
          className="flex items-center justify-center gap-2 rounded-lg border border-dashboard-border px-3 py-2 text-sm font-medium text-dashboard-text transition hover:border-accent/50"
        >
          Facebook
        </a>
      </div>
    </div>
  )
}

export function handleFormSubmit(onSubmit: () => Promise<void>) {
  return async (event: FormEvent) => {
    event.preventDefault()
    await onSubmit()
  }
}
