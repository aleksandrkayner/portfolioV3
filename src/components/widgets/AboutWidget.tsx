import type { WidgetComponentProps } from '../../types/widget'
import { profile, socialLinks } from '../../data/portfolio'
import { WidgetShell } from '../ui/WidgetShell'

export function AboutWidget({ id }: WidgetComponentProps) {
  return (
    <WidgetShell id={id} title="Profile" subtitle="Overview">
      <div id={id} className="flex h-full flex-col justify-between gap-6 text-left">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-accent">
            {profile.role}
          </p>
          <h1 className="mb-3 text-2xl font-bold tracking-tight text-dashboard-text sm:text-3xl lg:text-4xl">
            {profile.name}
          </h1>
          <p className="max-w-prose text-sm leading-relaxed text-dashboard-muted sm:text-base">
            {profile.tagline}
          </p>
          <p className="mt-3 text-xs text-dashboard-muted">
            📍 {profile.location}
          </p>
        </div>
        <nav aria-label="Social links" className="flex flex-wrap gap-2">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-dashboard-border px-3 py-1.5 text-xs font-medium text-dashboard-text transition-colors hover:border-accent hover:bg-accent/10 hover:text-accent"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </WidgetShell>
  )
}
