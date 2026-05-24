import { observer } from 'mobx-react-lite'
import { useContainerWidth } from 'react-grid-layout'
import { Responsive } from 'react-grid-layout/legacy'
import { getActiveWidgets } from '../../config/widgets'
import {
  GRID_BREAKPOINTS,
  GRID_COLS,
  GRID_GAP_PX,
  ROW_HEIGHT_PX,
  dashboardGridMinWidth,
} from '../../config/gridLayout'
import { resolveLayoutStore } from '../../di/container'

export const DashboardGrid = observer(function DashboardGrid() {
  const layoutStore = resolveLayoutStore()
  const widgets = getActiveWidgets()
  const { width, containerRef, mounted } = useContainerWidth()

  return (
    <div
      ref={containerRef}
      className="dashboard-grid-host w-full"
      style={{ minWidth: `min(100%, ${dashboardGridMinWidth})` }}
    >
      {mounted && width > 0 && (
        <Responsive
          className="dashboard-grid-layout"
          width={width}
          breakpoints={GRID_BREAKPOINTS}
          cols={GRID_COLS}
          layouts={layoutStore.displayLayouts}
          rowHeight={ROW_HEIGHT_PX}
          margin={[GRID_GAP_PX, GRID_GAP_PX]}
          containerPadding={[0, 0]}
          compactType="vertical"
          preventCollision={false}
          isDraggable
          isResizable={false}
          draggableHandle=".widget-drag-handle"
          draggableCancel="a, input, textarea, select, option, [contenteditable], .widget-settings, .widget-settings button, .widget-status"
          onLayoutChange={layoutStore.onLayoutChange}
        >
          {widgets.map((widget) => {
            const Component = widget.component
            return (
              <div key={widget.id} className="dashboard-grid-item h-full min-h-0">
                <Component id={widget.id} />
              </div>
            )
          })}
        </Responsive>
      )}
    </div>
  )
})
