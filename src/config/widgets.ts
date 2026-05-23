/**
 * Widget registry — add new widgets here to appear on the dashboard.
 *
 * Steps to add a widget:
 * 1. Create `src/components/widgets/YourWidget.tsx`
 * 2. Import it below and add a WidgetDefinition entry
 * 3. Document it in `docs/WIDGETS.md`
 */
import type { WidgetDefinition } from '../types/widget'
import { AboutWidget } from '../components/widgets/AboutWidget'
import { StatsWidget } from '../components/widgets/StatsWidget'
import { SkillsWidget } from '../components/widgets/SkillsWidget'
import { ProjectsWidget } from '../components/widgets/ProjectsWidget'
import { ExperienceWidget } from '../components/widgets/ExperienceWidget'
import { ContactWidget } from '../components/widgets/ContactWidget'
import { LearningWidget } from '../components/widgets/LearningWidget'

export const widgetRegistry: WidgetDefinition[] = [
  {
    id: 'about',
    title: 'Profile',
    subtitle: 'Overview',
    size: 'hero',
    order: 1,
    component: AboutWidget,
  },
  {
    id: 'stats',
    title: 'At a glance',
    size: 'sm',
    order: 2,
    component: StatsWidget,
  },
  {
    id: 'skills',
    title: 'Skills',
    subtitle: 'Tech stack',
    size: 'md',
    order: 3,
    component: SkillsWidget,
  },
  {
    id: 'projects',
    title: 'Projects',
    subtitle: 'Selected work',
    size: 'wide',
    order: 4,
    component: ProjectsWidget,
  },
  {
    id: 'experience',
    title: 'Experience',
    size: 'md',
    order: 5,
    component: ExperienceWidget,
  },
  {
    id: 'learning',
    title: 'Currently learning',
    size: 'sm',
    order: 6,
    component: LearningWidget,
  },
  {
    id: 'contact',
    title: 'Contact',
    subtitle: 'Get in touch',
    size: 'md',
    order: 7,
    component: ContactWidget,
  },
]

/** Active widgets sorted for rendering */
export function getActiveWidgets(): WidgetDefinition[] {
  return widgetRegistry
    .filter((w) => w.enabled !== false)
    .sort((a, b) => a.order - b.order)
}
