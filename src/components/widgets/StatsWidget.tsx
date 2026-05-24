import type { WidgetComponentProps } from '../../types/widget'
import { stats } from '../../data/portfolio'
import { WidgetShell } from '../ui/WidgetShell'

export function StatsWidget({ id }: WidgetComponentProps) {
  return (
    <WidgetShell id={id} title="At a glance">
      <ul id={id} className="flex min-h-0 flex-col gap-2.5 pt-1">
        {stats.map((stat) => (
          <li key={stat.label} className="text-left">
            <p className="font-mono text-xl font-semibold leading-tight text-dashboard-text sm:text-2xl">
              {stat.value}
            </p>
            <p className="mt-0.5 text-xs text-dashboard-muted">{stat.label}</p>
          </li>
        ))}
      </ul>
    </WidgetShell>
  )
}
