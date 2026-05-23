# Architecture

## Overview

This portfolio uses a **widget registry pattern**: each dashboard panel is an independent React component registered in configuration. The layout engine maps size tokens to CSS Grid classes so widgets reflow across mobile, tablet, and desktop without per-widget media queries.

```
┌─────────────────────────────────────────┐
│ Header (sticky)                         │
├─────────────────────────────────────────┤
│ DashboardGrid (CSS Grid, 1→2→8 cols)    │
│  ┌─────────┐ ┌────┐ ┌──────────────┐   │
│  │ Widget  │ │ W  │ │ Widget       │   │
│  │ (hero)  │ │    │ │ (wide)       │   │
│  └─────────┘ └────┘ └──────────────┘   │
└─────────────────────────────────────────┘
```

## Data flow

1. **Content** lives in `src/data/portfolio.ts` (plain objects, no API).
2. **Registry** in `src/config/widgets.ts` lists which components render and in what order.
3. **Grid** in `src/config/grid.ts` maps `WidgetSize` → Tailwind grid classes.
4. **Widgets** read content and wrap UI in `WidgetShell` for consistent chrome.

No global state library is used — props and imports are enough at this scale.

## Responsive breakpoints

Tailwind defaults:

| Prefix | Min width | Typical device |
|--------|-----------|----------------|
| (none) | 0 | Mobile portrait |
| `sm:` | 640px | Large phone / small tablet |
| `lg:` | 1024px | Tablet landscape / desktop |

The dashboard grid:

- **Mobile**: 1 column, widgets stack vertically
- **`sm`**: 2 columns
- **`lg`**: 8 columns — widget `size` tokens span multiple columns

## Widget sizes

| Token | Desktop behavior (lg) |
|-------|------------------------|
| `sm` | 2 / 8 columns |
| `md` | 4 / 8 columns |
| `lg` | 4 cols, 2 rows |
| `wide` | Full row (8 cols) |
| `tall` | 4 cols, 2 rows |
| `hero` | 6 cols, 2 rows — profile prominence |

## Extension points

| Need | Location |
|------|----------|
| New widget | `components/widgets/` + `config/widgets.ts` |
| New size preset | `types/widget.ts` + `config/grid.ts` |
| Theme colors | `src/index.css` `@theme` |
| Feature flag | `enabled: false` on widget definition |
| Future API | Add `src/services/` and fetch in widgets or a provider |

## Build output

Vite emits a static SPA in `dist/`. Any static host can serve it; client-side routing is not used yet (single page).

## Future ideas (not implemented)

- Drag-and-drop widget reordering
- Light/dark toggle (currently dark-only theme)
- CMS or JSON file fetched at runtime
- Analytics widget
- Blog / MDX widget

Document new features in `docs/WIDGETS.md` when added.
