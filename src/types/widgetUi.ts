export type WidgetStatus = 'online' | 'idle'

export const WIDGET_STATUS_LABELS: Record<WidgetStatus, string> = {
  online: 'Active',
  idle: 'Idle',
}

export const WIDGET_STATUS_CLASSES: Record<WidgetStatus, string> = {
  online: 'bg-success shadow-[0_0_8px_rgba(52,211,153,0.6)]',
  idle: 'bg-warning shadow-[0_0_6px_rgba(251,191,36,0.5)]',
}
