import type { WidgetComponentProps } from '../../types/widget'
import { getVisibleProjects } from '../../data/portfolio'
import { WidgetShell } from '../ui/WidgetShell'

const statusStyles = {
  Live: 'border-success/40 bg-success/10 text-success',
  'In progress': 'border-warning/40 bg-warning/10 text-warning',
} as const

export function ProjectsWidget({ id }: WidgetComponentProps) {
  return (
    <WidgetShell id={id} title="Projects" subtitle="Selected work">
      <ul id={id} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {getVisibleProjects().map((project) => (
          <li
            key={project.id}
            className="flex flex-col rounded-xl border border-dashboard-border bg-dashboard-bg/50 p-4 transition-colors hover:border-accent/40"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-dashboard-text">
                {project.title}
              </h3>
              <span
                className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${statusStyles[project.status]}`}
              >
                {project.status}
              </span>
            </div>
            <p className="mb-3 flex-1 text-xs leading-relaxed text-dashboard-muted">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-dashboard-border/60 px-2 py-0.5 font-mono text-[10px] text-dashboard-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
            <a
              href={project.href}
              className="mt-3 text-xs font-medium text-accent hover:text-accent-hover"
            >
              View project →
            </a>
          </li>
        ))}
      </ul>
    </WidgetShell>
  )
}
