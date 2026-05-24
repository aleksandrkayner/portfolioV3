import { makeAutoObservable } from 'mobx'
import type { WidgetStatus } from '../types/widgetUi'

export class WidgetUiStore {
  statuses: Record<string, WidgetStatus> = {}

  constructor() {
    makeAutoObservable(this)
  }

  getStatus(widgetId: string): WidgetStatus {
    return this.statuses[widgetId] ?? 'online'
  }

  toggleStatus(widgetId: string) {
    const next: WidgetStatus =
      this.getStatus(widgetId) === 'online' ? 'idle' : 'online'
    this.statuses[widgetId] = next
  }
}
