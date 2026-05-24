/**
 * Widget registry — 3-column draggable grid; grid.w (1–3) × grid.h (row units).
 * Positions: WIDGET_PLACEMENTS in gridLayout.ts
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
    grid: { w: 2, h: 2 },
    order: 1,
    component: AboutWidget,
  },
  {
    id: 'stats',
    title: 'At a glance',
    grid: { w: 1, h: 1 },
    order: 2,
    component: StatsWidget,
  },
  {
    id: 'learning',
    title: 'Currently learning',
    grid: { w: 1, h: 1 },
    order: 3,
    component: LearningWidget,
  },
  {
    id: 'skills',
    title: 'Skills',
    subtitle: 'Tech stack',
    grid: { w: 1, h: 2 },
    order: 4,
    component: SkillsWidget,
  },
  {
    id: 'contact',
    title: 'Contact',
    subtitle: 'Get in touch',
    grid: { w: 1, h: 2 },
    order: 5,
    component: ContactWidget,
  },
  {
    id: 'projects',
    title: 'Projects',
    subtitle: 'Selected work',
    grid: { w: 3, h: 2 },
    order: 6,
    component: ProjectsWidget,
  },
  {
    id: 'experience',
    title: 'Experience',
    grid: { w: 3, h: 2 },
    order: 7,
    component: ExperienceWidget,
  },
]

export function getActiveWidgets(): WidgetDefinition[] {
  return widgetRegistry
    .filter((w) => w.enabled !== false)
    .sort((a, b) => a.order - b.order)
}
