# Widgets guide

## Built-in widgets

| ID | Component | Size | Data source |
|----|-----------|------|-------------|
| `about` | `AboutWidget` | hero | `profile`, `socialLinks` |
| `stats` | `StatsWidget` | sm | `stats` |
| `skills` | `SkillsWidget` | md | `skills` |
| `projects` | `ProjectsWidget` | wide | `projects` |
| `experience` | `ExperienceWidget` | md | `experience` |
| `learning` | `LearningWidget` | sm | `nowLearning` |
| `contact` | `ContactWidget` | md | `profile`, `socialLinks` |

## Add a new widget (checklist)

### 1. Create the component

`src/components/widgets/WeatherWidget.tsx`:

```tsx
import type { WidgetComponentProps } from '../../types/widget'
import { WidgetShell } from '../ui/WidgetShell'

export function WeatherWidget({ id }: WidgetComponentProps) {
  return (
    <WidgetShell title="Weather" subtitle="Local">
      <div id={id}>Hello from a new widget</div>
    </WidgetShell>
  )
}
```

### 2. Register it

In `src/config/widgets.ts`:

```ts
import { WeatherWidget } from '../components/widgets/WeatherWidget'

// Add to widgetRegistry array:
{
  id: 'weather',
  title: 'Weather',
  size: 'sm',
  order: 8,
  component: WeatherWidget,
},
```

### 3. Add content (if needed)

Put strings and arrays in `src/data/portfolio.ts`, then import in your widget.

### 4. Choose a size

Pick from: `sm` | `md` | `lg` | `wide` | `tall` | `hero`. Adjust layout in `src/config/grid.ts` if none fit.

### 5. Document

Add a row to the table in this file.

## WidgetShell API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | required | Header title |
| `subtitle` | string | — | Muted line under title |
| `status` | `'online' \| 'idle' \| 'none'` | `'online'` | Status dot |
| `className` | string | — | Extra classes on card |

## Reorder or disable

- **Order**: change `order` number (lower = earlier in grid flow)
- **Disable**: `enabled: false` on the widget definition

## Duplicate titles

Widget components can pass their own `WidgetShell` title props (as implemented) independent of registry `title` — registry titles are reserved for future dynamic headers; keep them in sync manually for now.
