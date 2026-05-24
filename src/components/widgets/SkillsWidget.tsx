import type { WidgetComponentProps } from '../../types/widget'
import { skills } from '../../data/portfolio'
import { WidgetShell } from '../ui/WidgetShell'

export function SkillsWidget({ id }: WidgetComponentProps) {
  return (
    <WidgetShell id={id} title="Skills" subtitle="Tech stack">
      <ul id={id} className="space-y-4">
        {skills.map((skill) => (
          <li key={skill.name}>
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="font-medium text-dashboard-text">{skill.name}</span>
              <span className="font-mono text-dashboard-muted">{skill.level}%</span>
            </div>
            <div
              className="h-1.5 overflow-hidden rounded-full bg-dashboard-border"
              role="progressbar"
              aria-valuenow={skill.level}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${skill.name} proficiency`}
            >
              <div
                className="skill-bar-fill h-full rounded-full bg-gradient-to-r from-accent to-accent-hover transition-all"
                style={{ width: `${skill.level}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </WidgetShell>
  )
}
