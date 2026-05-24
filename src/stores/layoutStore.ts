import { makeAutoObservable } from 'mobx'
import type { Layout, ResponsiveLayouts } from 'react-grid-layout/legacy'
import { getActiveWidgets } from '../config/widgets'
import {
  GRID_ROW_SPAN_MAX,
  buildDefaultLayout,
  expandLastItemFillGaps,
  layoutToSingleColumn,
  mergeLayoutWithWidgets,
  stripLastItemExpansion,
} from '../config/gridLayout'
import { GRID_COLUMNS, type GridColSpan } from '../types/widget'

type StoredLayouts = ResponsiveLayouts<'lg' | 'sm'>

function layoutSignature(layout: Layout): string {
  return JSON.stringify(
    [...layout]
      .sort((a, b) => a.i.localeCompare(b.i))
      .map((item) => ({ i: item.i, x: item.x, y: item.y, w: item.w, h: item.h })),
  )
}

export class LayoutStore {
  lg: Layout = []
  sm: Layout = []
  private readonly widgets = getActiveWidgets()

  constructor() {
    makeAutoObservable(this)
    this.resetLayout()
  }

  get displayLayouts(): StoredLayouts {
    return {
      lg: expandLastItemFillGaps(this.lg, GRID_COLUMNS),
      sm: expandLastItemFillGaps(this.sm, 1),
    }
  }

  resetLayout() {
    const lg = buildDefaultLayout(this.widgets)
    this.lg = lg
    this.sm = layoutToSingleColumn(lg)
  }

  onLayoutChange = (_current: Layout, all: StoredLayouts) => {
    const prevLg = this.lg
    const prevSm = this.sm
    const draggedLg = all.lg ?? prevLg

    const lg = mergeLayoutWithWidgets(
      stripLastItemExpansion(draggedLg, prevLg, GRID_COLUMNS),
      this.widgets,
    )
    const smRaw = all.sm?.length
      ? stripLastItemExpansion(all.sm, prevSm, 1)
      : layoutToSingleColumn(lg)
    const sm = mergeLayoutWithWidgets(smRaw, this.widgets)

    if (
      layoutSignature(lg) === layoutSignature(prevLg) &&
      layoutSignature(sm) === layoutSignature(prevSm)
    ) {
      return
    }

    this.lg = lg
    this.sm = sm
  }

  getWidgetSize(widgetId: string) {
    const item = this.lg.find((entry) => entry.i === widgetId)
    const w = Math.min(GRID_COLUMNS, Math.max(1, item?.w ?? 1)) as GridColSpan
    const h = Math.min(GRID_ROW_SPAN_MAX, Math.max(1, item?.h ?? 1))
    return { w, h }
  }

  updateWidgetSize(widgetId: string, w: GridColSpan, h: number) {
    const nextW = Math.min(GRID_COLUMNS, Math.max(1, w)) as GridColSpan
    const nextH = Math.min(GRID_ROW_SPAN_MAX, Math.max(1, h))

    this.lg = this.lg.map((item) => {
      if (item.i !== widgetId) return item
      return {
        ...item,
        w: nextW,
        h: nextH,
        x: Math.min(item.x, GRID_COLUMNS - nextW),
      }
    })
    this.sm = layoutToSingleColumn(this.lg).map((item) =>
      item.i === widgetId ? { ...item, h: nextH } : item,
    )
  }
}
