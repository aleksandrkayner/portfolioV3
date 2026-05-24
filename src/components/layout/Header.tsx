import { profile } from '../../data/portfolio'
import { ThemeToggle } from '../ui/ThemeToggle'

export function Header() {
  const year = new Date().getFullYear()

  return (
    <header className="sticky top-0 z-10 border-b border-dashboard-border bg-dashboard-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="header-avatar flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white"
            aria-hidden
          >
            {profile.avatarInitials}
          </div>
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-semibold text-dashboard-text">
              {profile.name}
            </p>
            <p className="truncate text-xs text-dashboard-muted">
              Portfolio Dashboard
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <span className="hidden rounded-full border border-dashboard-border px-2.5 py-1 text-xs text-dashboard-muted sm:inline">
            {profile.availability}
          </span>
          <time dateTime={String(year)} className="font-mono">
            © {year}
          </time>
        </div>
      </div>
    </header>
  )
}
