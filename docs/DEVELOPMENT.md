# Development guide

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm 10+

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with HMR at port 5173 |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run lint` | ESLint (if configured in package.json) |

## Conventions

### TypeScript

- Prefer `interface` for object shapes in `src/types/`
- Use `as const` on static data in `portfolio.ts` for literal inference
- Widget components must accept `WidgetComponentProps`

### Styling

- Use Tailwind utility classes in components
- Shared design tokens: `src/index.css` → `@theme`
- Semantic colors: `dashboard-bg`, `dashboard-surface`, `accent`, etc.

### File naming

- Components: `PascalCase.tsx`
- Config/data: `camelCase.ts`

### Content vs presentation

Never embed portfolio strings in widgets — import from `src/data/portfolio.ts`.

## Debugging

1. **Widget not showing** — check `enabled` and import in `widgets.ts`
2. **Layout broken on tablet** — inspect `sizeToGridClass` and test at 640px and 1024px
3. **Build fails** — run `npm run build` and fix TypeScript errors first

## Browser testing

Test these widths in DevTools:

- 375px (iPhone)
- 768px (iPad)
- 1280px (laptop)
- 1440px+ (large desktop)

## Git

Initialize when ready:

```bash
git init
git add .
git commit -m "Initial portfolio dashboard"
```

Push to GitHub to enable one-click deploy on Vercel/Netlify.
