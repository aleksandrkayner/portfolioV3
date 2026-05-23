import type { WidgetComponentProps } from '../../types/widget'
import { experience } from '../../data/portfolio'
import { WidgetShell } from '../ui/WidgetShell'

export function ExperienceWidget({ id }: WidgetComponentProps) {
  return (
    <WidgetShell title="Experience">
      <ol id={id} className="relative space-y-6 border-l border-dashboard-border pl-4">
        {experience.map((item) => (
          <li key={item.id} className="relative text-left">
            <span
              className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-dashboard-bg bg-accent"
              aria-hidden
            />
            <p className="text-xs font-mono text-dashboard-muted">{item.period}</p>
            <h3 className="mt-0.5 text-sm font-semibold text-dashboard-text">
              {item.role}
            </h3>
            <p className="text-xs text-accent">{item.company}</p>
            <p className="mt-2 text-xs leading-relaxed text-dashboard-muted">
              {item.summary}
            </p>
          </li>
        ))}
      </ol>
    </WidgetShell>
  )
}
