import type { WidgetComponentProps } from '../../types/widget'
import { profile, socialLinks } from '../../data/portfolio'
import { WidgetShell } from '../ui/WidgetShell'

export function ContactWidget({ id }: WidgetComponentProps) {
  return (
    <WidgetShell title="Contact" subtitle="Get in touch">
      <div id={id} className="flex h-full flex-col justify-between gap-4 text-left">
        <p className="text-sm text-dashboard-muted">
          Interested in working together? Reach out — I typically respond within a
          few days.
        </p>
        <a
          href={`mailto:${profile.email}`}
          className="inline-flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          {profile.email}
        </a>
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
      </div>
    </WidgetShell>
  )
}
