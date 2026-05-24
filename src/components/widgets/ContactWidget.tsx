import { useCallback, useEffect, useRef, useState } from 'react'
import type { WidgetComponentProps } from '../../types/widget'
import { profile, socialLinks } from '../../data/portfolio'
import { WidgetShell } from '../ui/WidgetShell'

const COPIED_FEEDBACK_MS = 2200

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

export function ContactWidget({ id }: WidgetComponentProps) {
  const [copied, setCopied] = useState(false)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current)
      resetTimerRef.current = null
    }
  }, [])

  useEffect(() => clearResetTimer, [clearResetTimer])

  const handleCopyEmail = useCallback(async () => {
    try {
      await copyToClipboard(profile.email)
    } catch {
      return
    }

    setCopied(true)
    setShowSnackbar(true)
    clearResetTimer()
    resetTimerRef.current = setTimeout(() => {
      setCopied(false)
      setShowSnackbar(false)
    }, COPIED_FEEDBACK_MS)
  }, [clearResetTimer])

  return (
    <WidgetShell id={id} title="Contact" subtitle="Get in touch">
      <div
        id={id}
        className="relative flex h-full flex-col justify-between gap-4 text-left"
      >
        <p className="text-sm text-dashboard-muted">
          Interested in working together? Reach out — I typically respond within a
          few days.
        </p>

        <button
          type="button"
          onClick={() => void handleCopyEmail()}
          aria-label={
            copied ? 'Email copied to clipboard' : `Copy ${profile.email} to clipboard`
          }
          className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 ${
            copied
              ? 'bg-success hover:bg-success/90'
              : 'bg-accent hover:bg-accent-hover'
          }`}
        >
          {profile.email}
        </button>

        <ul className="space-y-2 border-t border-dashboard-border pt-4">
          {socialLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-dashboard-muted transition-colors hover:text-accent"
              >
                {link.label} ↗
              </a>
            </li>
          ))}
        </ul>

        <div
          role="status"
          aria-live="polite"
          className={`pointer-events-none absolute bottom-14 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-dashboard-border bg-dashboard-surface px-3 py-2 text-xs font-medium text-dashboard-text shadow-lg transition-all duration-200 ${
            showSnackbar
              ? 'translate-y-0 opacity-100'
              : 'translate-y-1 opacity-0'
          }`}
        >
          Email copied to clipboard
        </div>
      </div>
    </WidgetShell>
  )
}
