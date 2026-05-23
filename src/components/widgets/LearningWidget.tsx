import type { WidgetComponentProps } from '../../types/widget'
import { nowLearning } from '../../data/portfolio'
import { WidgetShell } from '../ui/WidgetShell'

export function LearningWidget({ id }: WidgetComponentProps) {
  return (
    <WidgetShell title="Currently learning" status="idle">
      <ul id={id} className="flex flex-wrap gap-2">
        {nowLearning.map((topic) => (
          <li
            key={topic}
            className="rounded-lg border border-dashed border-dashboard-border px-3 py-2 text-xs font-medium text-dashboard-text"
          >
            {topic}
          </li>
        ))}
      </ul>
    </WidgetShell>
  )
}
