import { Header } from './Header'
import { DashboardGrid } from './DashboardGrid'

export function Dashboard() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section aria-label="Dashboard widgets">
          <p className="mb-6 max-w-2xl text-left text-sm text-dashboard-muted sm:mb-8 sm:text-base">
            Welcome — this dashboard-style portfolio is built from modular widgets.
            Customize content in{' '}
            <code className="rounded bg-dashboard-surface px-1.5 py-0.5 font-mono text-xs text-accent">
              src/data/portfolio.ts
            </code>
            .
          </p>
          <DashboardGrid />
        </section>
      </main>
    </div>
  )
}
