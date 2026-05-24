import { observer } from 'mobx-react-lite'
import { THEME_LABELS, THEME_MODES, type ThemeMode } from '../../types/theme'
import { resolveThemeStore } from '../../di/container'
import { PrismaticCrystalIcon } from './PrismaticCrystalIcon'

function ThemeIcon({ mode }: { mode: ThemeMode }) {
  const className = 'h-4 w-4 shrink-0'

  if (mode === 'light') {
    return (
      <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M10 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm4 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-.464 4.95.707.707a1 1 0 0 0 1.414-1.414l-.707-.707a1 1 0 0 0-1.414 1.414Zm2.12-10.607a1 1 0 0 1 0 1.414l-.706.707a1 1 0 1 1-1.414-1.414l.707-.707a1 1 0 0 1 1.413 0Zm2.829 2.829a1 1 0 0 1 0 1.415l-.707.707a1 1 0 0 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0ZM8.464 4.464a1 1 0 0 1-1.414 0l-.707-.707a1 1 0 0 1 1.414-1.414l.707.707a1 1 0 0 1 0 1.414ZM4.343 6.757a1 1 0 0 0-1.414 0l-.707.707a1 1 0 0 0 1.414 1.414l.707-.707a1 1 0 0 0 0-1.414Zm10.586 0a1 1 0 0 1 1.414 0l.707.707a1 1 0 0 1-1.414 1.414l-.707-.707a1 1 0 0 1 0-1.414ZM6.343 13.657a1 1 0 0 0 0 1.414l-.707.707a1 1 0 1 0 1.414 1.414l.707-.707a1 1 0 0 0 0-1.414Zm7.314 0a1 1 0 0 1 1.414 0l.707.707a1 1 0 1 1-1.414 1.414l-.707-.707a1 1 0 0 1 0-1.414ZM10 16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Z"
          clipRule="evenodd"
        />
      </svg>
    )
  }

  if (mode === 'dark') {
    return (
      <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path d="M17.293 13.293A8 8 0 0 1 6.707 2.707a8.001 8.001 0 1 0 10.586 10.586Z" />
      </svg>
    )
  }

  return <PrismaticCrystalIcon className={className} />
}

export const ThemeToggle = observer(function ThemeToggle() {
  const themeStore = resolveThemeStore()

  return (
    <div
      className="flex shrink-0 rounded-lg border border-dashboard-border bg-dashboard-surface p-0.5"
      role="group"
      aria-label="Color theme"
    >
      {THEME_MODES.map((mode) => {
        const active = themeStore.theme === mode
        return (
          <button
            key={mode}
            type="button"
            onClick={() => themeStore.setTheme(mode)}
            aria-pressed={active}
            aria-label={`${THEME_LABELS[mode]} theme`}
            title={`${THEME_LABELS[mode]} theme`}
            className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:px-2.5 ${
              active
                ? 'theme-toggle-active bg-accent text-white shadow-sm'
                : 'text-dashboard-muted hover:bg-dashboard-border/40 hover:text-dashboard-text'
            }`}
          >
            <ThemeIcon mode={mode} />
            <span className="hidden sm:inline">{THEME_LABELS[mode]}</span>
          </button>
        )
      })}
    </div>
  )
})
