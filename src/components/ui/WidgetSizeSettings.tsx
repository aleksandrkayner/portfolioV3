import { observer } from 'mobx-react-lite'
import { useEffect, useId, useRef, useState } from 'react'
import { GRID_ROW_SPAN_MAX } from '../../config/gridLayout'
import { resolveLayoutStore } from '../../di/container'
import { useNarrowViewport } from '../../hooks/useNarrowViewport'
import { GRID_COLUMNS, type GridColSpan } from '../../types/widget'

interface WidgetSizeSettingsProps {
  widgetId: string
}

const widthOptions: GridColSpan[] = [1, 2, 3]
const heightOptions = Array.from(
  { length: GRID_ROW_SPAN_MAX },
  (_, i) => i + 1,
)

function SizeOptionGroup<T extends number>({
  label,
  value,
  options,
  onChange,
  format,
}: {
  label: string
  value: T
  options: readonly T[]
  onChange: (next: T) => void
  format?: (n: T) => string
}) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="text-[10px] font-medium uppercase tracking-wide text-dashboard-muted">
        {label}
      </legend>
      <div className="flex flex-wrap gap-1">
        {options.map((option) => {
          const selected = option === value
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              aria-pressed={selected}
              className={`min-w-7 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                selected
                  ? 'bg-accent text-white'
                  : 'border border-dashboard-border bg-dashboard-bg text-dashboard-text hover:border-accent/50'
              }`}
            >
              {format ? format(option) : option}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export const WidgetSizeSettings = observer(function WidgetSizeSettings({
  widgetId,
}: WidgetSizeSettingsProps) {
  const layoutStore = resolveLayoutStore()
  const narrow = useNarrowViewport()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const { w, h } = layoutStore.getWidgetSize(widgetId)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  return (
    <div ref={rootRef} className="widget-settings relative shrink-0">
      <button
        type="button"
        className="widget-settings flex h-7 shrink-0 items-center justify-center rounded-md border border-dashboard-border bg-dashboard-bg px-2 text-[10px] font-semibold uppercase tracking-wide text-dashboard-muted transition-colors hover:border-accent/50 hover:text-accent"
        aria-label="Widget size settings"
        aria-expanded={open}
        aria-controls={panelId}
        title="Change widget size"
        onClick={() => setOpen((prev) => !prev)}
      >
        Size
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute right-0 top-full z-30 mt-1 w-44 rounded-xl border border-dashboard-border bg-dashboard-surface p-3 shadow-xl"
        >
          <p className="mb-2 text-xs font-semibold text-dashboard-text">Widget size</p>
          {!narrow && (
            <SizeOptionGroup
              label="Width (columns)"
              value={w}
              options={widthOptions}
              onChange={(next) => layoutStore.updateWidgetSize(widgetId, next, h)}
              format={(n) => `${n}/${GRID_COLUMNS}`}
            />
          )}
          {narrow && (
            <p className="mb-2 text-[10px] text-dashboard-muted">
              Full width on mobile — adjust height only.
            </p>
          )}
          <div className={narrow ? '' : 'mt-3'}>
            <SizeOptionGroup
              label="Height (rows)"
              value={h}
              options={heightOptions}
              onChange={(next) => layoutStore.updateWidgetSize(widgetId, w, next)}
            />
          </div>
        </div>
      )}
    </div>
  )
})
