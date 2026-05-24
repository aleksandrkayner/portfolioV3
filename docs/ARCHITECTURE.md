# Architecture

## Overview

Portfolio dashboard on a **CSS Grid chess board**:

- **3 columns** on tablet/desktop (`grid-template-columns: repeat(3, 1fr)`)
- **Equal row height** — `grid-auto-rows: 96px` (every row the same)
- **Unlimited rows** — `grid-auto-rows` grows as widgets are added
- **Widget size** — `grid.w` ∈ {1,2,3}, `grid.h` ∈ {1,2} only

```
     Col1    Col2    Col3
R1   [  Profile 2×2  ][s]
R2   [             ][l]
R3   [skills][contact][ ]
...
```

## Key files

| File | Role |
|------|------|
| `src/types/widget.ts` | `GridColSpan`, `GridRowSpan` (1 or 2) |
| `src/config/widgets.ts` | `grid: { w, h }` per widget |
| `src/config/gridLayout.ts` | `ROW_HEIGHT_PX`, `WIDGET_PLACEMENTS`, `getWidgetGridStyle` |
| `src/components/layout/DashboardGrid.tsx` | CSS grid render |

## Placement

Edit `WIDGET_PLACEMENTS` in `gridLayout.ts` to set starting cell (`col`, `row`, 1-based). Span is always from `widget.grid`.

## Mobile

Below 768px: single column; each widget full width, still `h` of 1 or 2 row units.

## Themes

`docs/THEMES.md` — `[data-theme]` CSS variables.

## Build

Vite → static `dist/`.
