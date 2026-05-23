import { getActiveWidgets } from '../../config/widgets'
import { sizeToGridClass } from '../../config/grid'

export function DashboardGrid() {
  const widgets = getActiveWidgets()

  return (
    <div
      className="grid auto-rows-min grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-8 lg:gap-6"
      role="list"
    >
      {widgets.map((widget) => {
        const Component = widget.component
        const gridClass = sizeToGridClass[widget.size]

        return (
          <div key={widget.id} className={gridClass} role="listitem">
            <Component id={widget.id} />
          </div>
        )
      })}
    </div>
  )
}
