import type { ComponentType } from 'react'

export const GRID_COLUMNS = 3

/** Columns spanned (1–3 of 3) */
export type GridColSpan = 1 | 2 | 3

/** Rows spanned — unbounded; each row unit = ROW_HEIGHT_PX in gridLayout.ts */
export type GridRowSpan = number

export interface WidgetGridSpan {
  w: GridColSpan
  h: GridRowSpan
}

export interface WidgetDefinition {
  id: string
  title: string
  subtitle?: string
  grid: WidgetGridSpan
  order: number
  enabled?: boolean
  component: ComponentType<WidgetComponentProps>
}

export interface WidgetComponentProps {
  id: string
}
