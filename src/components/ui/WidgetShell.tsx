import { observer } from 'mobx-react-lite'
import type { ReactNode } from 'react'
import { resolveWidgetUiStore } from '../../di/container'
import {
  WIDGET_STATUS_CLASSES,
  WIDGET_STATUS_LABELS,
} from '../../types/widgetUi'
import { WidgetSizeSettings } from './WidgetSizeSettings'

interface WidgetShellProps {
  id?: string
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export const WidgetShell = observer(function WidgetShell({
  id,
  title,
  subtitle,
  children,
  className = '',
}: WidgetShellProps) {
  const widgetUiStore = resolveWidgetUiStore()
  const status = id ? widgetUiStore.getStatus(id) : 'online'

  return (
    <article
      className={`widget-card group flex h-full min-h-0 flex-col rounded-2xl border border-dashboard-border bg-dashboard-surface shadow-lg transition-shadow hover:shadow-xl hover:shadow-accent/5 ${className}`}
    >
      <header className="relative z-20 grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-1 border-b border-dashboard-border py-3 pl-4 pr-2 sm:pl-5 sm:pr-2.5">
        <div className="min-w-0 text-left">
          <h2 className="truncate text-sm font-semibold text-dashboard-text sm:text-base">
            {title}
          </h2>
          {subtitle && (
            <p className="truncate text-xs text-dashboard-muted">{subtitle}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {id && (
            <button
              type="button"
              className="widget-status flex size-7 shrink-0 items-center justify-center rounded-md border border-transparent transition-colors hover:border-dashboard-border hover:bg-dashboard-bg"
              aria-label={`Status: ${WIDGET_STATUS_LABELS[status]}. Click to change.`}
              title={`${WIDGET_STATUS_LABELS[status]} — click to toggle`}
              onClick={() => widgetUiStore.toggleStatus(id)}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full transition-colors ${WIDGET_STATUS_CLASSES[status]}`}
                aria-hidden
              />
            </button>
          )}
          {id && <WidgetSizeSettings widgetId={id} />}
          <button
            type="button"
            className="widget-drag-handle flex size-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md border border-transparent text-dashboard-muted transition-colors hover:border-dashboard-border hover:bg-dashboard-bg hover:text-dashboard-text active:cursor-grabbing"
            aria-label="Drag to reposition widget"
            title="Drag to reposition"
          >
            <span className="grid grid-cols-3 gap-px" aria-hidden>
              {Array.from({ length: 9 }, (_, i) => (
                <span key={i} className="size-1 rounded-full bg-current" />
              ))}
            </span>
          </button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col overflow-auto p-4 sm:p-5">{children}</div>
      </div>
    </article>
  )
})
