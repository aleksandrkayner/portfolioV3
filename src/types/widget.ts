import type { ComponentType } from 'react'

/** Grid span presets — maps to Tailwind col/row spans in DashboardGrid */
export type WidgetSize = 'sm' | 'md' | 'lg' | 'wide' | 'tall' | 'hero'

export interface WidgetDefinition {
  id: string
  title: string
  /** Optional subtitle shown in widget chrome */
  subtitle?: string
  size: WidgetSize
  /** Lower numbers render first in the grid */
  order: number
  /** Set false to hide without removing code (feature flags) */
  enabled?: boolean
  component: ComponentType<WidgetComponentProps>
}

export interface WidgetComponentProps {
  id: string
}
