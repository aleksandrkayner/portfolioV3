import { Link, useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { profile } from '../../data/portfolio'
import { resolveAuthStore } from '../../di/container'
import { ThemeToggle } from '../ui/ThemeToggle'

const authStore = resolveAuthStore()

export const Header = observer(function Header() {
  const navigate = useNavigate()
  const year = new Date().getFullYear()

  async function handleLogout() {
    await authStore.logout()
    navigate('/login?loggedOut=1')
  }

  return (
    <header className="sticky top-0 z-10 border-b border-dashboard-border bg-dashboard-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" className="flex min-w-0 items-center gap-3">
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
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {authStore.isAuthenticated ? (
            <>
              <span className="hidden max-w-[8rem] truncate text-xs text-dashboard-muted sm:inline">
                {authStore.user?.displayName}
              </span>
              {authStore.isAdmin ? (
                <Link
                  to="/admin"
                  className="rounded-lg border border-dashboard-border px-2.5 py-1 text-xs font-medium text-dashboard-text hover:border-accent/50"
                >
                  Admin
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="rounded-lg border border-dashboard-border px-2.5 py-1 text-xs font-medium text-dashboard-text hover:border-accent/50"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg border border-dashboard-border px-2.5 py-1 text-xs font-medium text-dashboard-text hover:border-accent/50"
            >
              Log in
            </Link>
          )}
          <span className="hidden rounded-full border border-dashboard-border px-2.5 py-1 text-xs text-dashboard-muted sm:inline">
            {profile.availability}
          </span>
          <time dateTime={String(year)} className="font-mono text-xs sm:text-sm">
            © {year}
          </time>
        </div>
      </div>
    </header>
  )
})
