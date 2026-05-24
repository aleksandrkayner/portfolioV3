import type { Layout, LayoutItem } from 'react-grid-layout/legacy'
import { GRID_COLUMNS, type WidgetDefinition } from '../types/widget'

/** Minimum column width on desktop (px) */
export const COL_MIN_PX = 250
/** Row unit height — each grid row spans this many pixels (px) */
export const ROW_HEIGHT_PX = 210
export const GRID_GAP_PX = 16
/** Max row units offered in widget size settings */
export const GRID_ROW_SPAN_MAX = 6

export const GRID_BREAKPOINTS = { lg: 768, sm: 0 } as const
export const GRID_COLS = { lg: GRID_COLUMNS, sm: 1 } as const

/**
 * Starting cell for each widget on the 3-column board (1-based col/row).
 * Span comes from widget.grid (w × h).
 */
export const WIDGET_PLACEMENTS: Record<string, { col: number; row: number }> = {
  about: { col: 1, row: 1 },
  stats: { col: 3, row: 1 },
  learning: { col: 3, row: 2 },
  skills: { col: 1, row: 3 },
  contact: { col: 2, row: 3 },
  projects: { col: 1, row: 5 },
  experience: { col: 1, row: 7 },
}

const layoutConstraints = {
  minW: 1,
  maxW: GRID_COLUMNS,
  minH: 1,
} as const

export function widgetToLayoutItem(widget: WidgetDefinition): LayoutItem {
  const slot = WIDGET_PLACEMENTS[widget.id]
  const { w, h } = widget.grid

  if (!slot) {
    return { i: widget.id, x: 0, y: 0, w, h, ...layoutConstraints }
  }

  return {
    i: widget.id,
    x: slot.col - 1,
    y: slot.row - 1,
    w,
    h,
    ...layoutConstraints,
  }
}

export function buildDefaultLayout(widgets: WidgetDefinition[]): Layout {
  return widgets.map(widgetToLayoutItem)
}

/** Stack widgets in a single column for mobile (full width). */
export function layoutToSingleColumn(layout: Layout): Layout {
  const sorted = [...layout].sort((a, b) => a.y - b.y || a.x - b.x)
  let y = 0
  return sorted.map((item) => {
    const next: LayoutItem = {
      ...item,
      x: 0,
      w: 1,
      minW: 1,
      maxW: 1,
      y,
    }
    y += item.h
    return next
  })
}

export function mergeLayoutWithWidgets(
  saved: Layout | undefined,
  widgets: WidgetDefinition[],
): Layout {
  const defaults = buildDefaultLayout(widgets)
  if (!saved?.length) return defaults

  const defaultById = new Map(defaults.map((item) => [item.i, item]))

  return widgets.map((widget) => {
    const fallback = defaultById.get(widget.id)!
    const existing = saved.find((item) => item.i === widget.id)
    if (!existing) return fallback

    const w = clamp(existing.w, 1, GRID_COLUMNS)
    const h = Math.max(1, existing.h)

    return {
      ...fallback,
      x: Math.max(0, Math.min(existing.x, GRID_COLUMNS - w)),
      y: Math.max(0, existing.y),
      w,
      h,
    }
  })
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function cellKey(x: number, y: number): string {
  return `${x},${y}`
}

function buildOccupancy(layout: Layout, excludeId: string): Set<string> {
  const occupied = new Set<string>()
  for (const item of layout) {
    if (item.i === excludeId) continue
    for (let dy = 0; dy < item.h; dy++) {
      for (let dx = 0; dx < item.w; dx++) {
        occupied.add(cellKey(item.x + dx, item.y + dy))
      }
    }
  }
  return occupied
}

/** Bottom-right widget in reading order (fills trailing gaps). */
export function findLastLayoutItem(layout: Layout): LayoutItem {
  return [...layout].sort((a, b) => {
    const bottomA = a.y + a.h
    const bottomB = b.y + b.h
    if (bottomB !== bottomA) return bottomB - bottomA
    return b.x + b.w - (a.x + a.w)
  })[0]
}

/**
 * Grow the last item into empty cells to the right and below (display only).
 */
export function expandLastItemFillGaps(layout: Layout, cols: number): Layout {
  if (layout.length === 0) return layout

  const last = findLastLayoutItem(layout)
  const occupied = buildOccupancy(layout, last.i)
  const gridBottom = Math.max(...layout.map((item) => item.y + item.h))
  let { x, y } = last
  let w = last.w
  let h = last.h

  while (x + w < cols) {
    let blocked = false
    for (let dy = 0; dy < h; dy++) {
      if (occupied.has(cellKey(x + w, y + dy))) {
        blocked = true
        break
      }
    }
    if (blocked) break
    w++
  }

  // Only grow downward into holes inside the board — not unbounded empty space below.
  while (y + h < gridBottom) {
    let blocked = false
    for (let dx = 0; dx < w; dx++) {
      if (occupied.has(cellKey(x + dx, y + h))) {
        blocked = true
        break
      }
    }
    if (blocked) break
    h++
  }

  return layout.map((item) =>
    item.i === last.i ? { ...item, w: Math.min(w, cols - x), h } : item,
  )
}

/** Keep stored w/h for the last item — expansion is visual-only. */
export function stripLastItemExpansion(
  dragged: Layout,
  stored: Layout,
  cols: number,
): Layout {
  if (dragged.length === 0) return dragged
  const lastId = findLastLayoutItem(dragged).i
  const storedLast = stored.find((item) => item.i === lastId)

  return dragged.map((item) => {
    if (item.i !== lastId) return item
    return {
      ...item,
      w: storedLast?.w ?? item.w,
      h: storedLast?.h ?? item.h,
      x: clamp(item.x, 0, cols - (storedLast?.w ?? item.w)),
    }
  })
}

export const dashboardGridMinWidth = `calc(${GRID_COLUMNS} * ${COL_MIN_PX}px + ${(GRID_COLUMNS - 1) * GRID_GAP_PX}px)`
