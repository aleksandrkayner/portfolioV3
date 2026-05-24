# Widgets guide

## Grid rules

| Field | Values | Meaning |
|-------|--------|---------|
| `grid.w` | `1`, `2`, `3` | Columns spanned (of 3 on desktop) |
| `grid.h` | `1+` | Row units spanned (each row = 210px) |

Desktop: **3 columns**, min **250×210px** per cell, draggable via the grip in the widget header.  
Mobile (&lt;768px): **full width**, single column, still draggable.

Layout state lives in MobX (`LayoutStore`) via the tsyringe container — in-memory only (resets on refresh).

## Widget map (default)

| ID | Size (w×h) | Starts at (col, row) |
|----|------------|----------------------|
| about | 2×2 | 1, 1 |
| stats | 1×1 | 3, 1 |
| learning | 1×1 | 3, 2 |
| skills | 1×2 | 1, 3 |
| contact | 1×2 | 2, 3 |
| projects | 3×2 | 1, 5 |
| experience | 3×2 | 1, 7 |

Change default positions in `WIDGET_PLACEMENTS` (`src/config/gridLayout.ts`).

## Add a widget

```ts
{
  id: 'blog',
  title: 'Blog',
  grid: { w: 1, h: 1 }, // w: 1–3, h: any positive integer
  order: 8,
  component: BlogWidget,
},
```

Add placement:

```ts
// gridLayout.ts → WIDGET_PLACEMENTS
blog: { col: 3, row: 4 },
```

## Row / column sizing

- `COL_MIN_PX` (250) and `ROW_HEIGHT_PX` (210) in `gridLayout.ts`
- `GRID_GAP_PX` (16) between cells
