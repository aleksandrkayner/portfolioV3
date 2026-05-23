import type { ReactNode } from 'react'

interface WidgetShellProps {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
  /** Decorative status dot color */
  status?: 'online' | 'idle' | 'none'
}

const statusColors = {
  online: 'bg-success shadow-[0_0_8px_rgba(52,211,153,0.6)]',
  idle: 'bg-warning',
  none: '',
}

export function WidgetShell({
  title,
  subtitle,
  children,
  className = '',
  status = 'online',
}: WidgetShellProps) {
  return (
    <article
      className={`group flex h-full min-h-[180px] flex-col overflow-hidden rounded-2xl border border-dashboard-border bg-dashboard-surface shadow-lg transition-shadow hover:shadow-xl hover:shadow-accent/5 ${className}`}
    >
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-dashboard-border px-4 py-3 sm:px-5">
        <div className="min-w-0 text-left">
          <h2 className="truncate text-sm font-semibold text-dashboard-text sm:text-base">
            {title}
          </h2>
          {subtitle && (
            <p className="truncate text-xs text-dashboard-muted">{subtitle}</p>
          )}
        </div>
        {status !== 'none' && (
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${statusColors[status]}`}
            aria-hidden
          />
        )}
      </header>
      <div className="flex flex-1 flex-col overflow-auto p-4 sm:p-5">{children}</div>
    </article>
  )
}
