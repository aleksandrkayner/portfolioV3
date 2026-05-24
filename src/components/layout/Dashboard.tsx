import { Header } from './Header'
import { DashboardGrid } from './DashboardGrid'
import { AccountStatusBanner } from '../auth/AccountStatusBanner'

export function Dashboard() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <AccountStatusBanner />
        <section aria-label="Dashboard widgets">
          <DashboardGrid />
        </section>
      </main>
    </div>
  )
}
