import type { WidgetComponentProps } from '../../types/widget'
import { stats } from '../../data/portfolio'
import { WidgetShell } from '../ui/WidgetShell'

export function StatsWidget({ id }: WidgetComponentProps) {
  return (
    <WidgetShell title="At a glance" status="none">
      <ul id={id} className="flex h-full flex-col justify-center gap-4">
        {stats.map((stat) => (
          <li key={stat.label} className="text-left">
            <p className="font-mono text-2xl font-semibold text-dashboard-text">
              {stat.value}
            </p>
            <p className="text-xs text-dashboard-muted">{stat.label}</p>
          </li>
        ))}
      </ul>
    </WidgetShell>
  )
}
