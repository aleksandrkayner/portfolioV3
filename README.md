# Portfolio Dashboard

A modular, dashboard-style developer portfolio built with **React**, **TypeScript**, and **Tailwind CSS**. Widgets are easy to add, remove, or reorder — designed for long-term growth.

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview production build locally
```

## Customize your content

Edit **`src/data/portfolio.ts`** — name, projects, skills, links, and experience all live in one place.

## Project layout

| Path | Purpose |
|------|---------|
| `src/data/portfolio.ts` | All portfolio copy and data |
| `src/config/widgets.ts` | Widget registry (enable/disable, order) |
| `src/config/grid.ts` | Responsive grid size mapping |
| `src/components/widgets/` | Individual widget UIs |
| `src/components/layout/` | Header, grid, dashboard shell |
| `docs/` | Detailed documentation |

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — how the app is structured
- [Widgets guide](docs/WIDGETS.md) — add or modify widgets
- [Development](docs/DEVELOPMENT.md) — local workflow and conventions
- [Deployment](docs/DEPLOYMENT.md) — free hosting (Vercel, Netlify, Render)
- [Themes](docs/THEMES.md) — light / dark / prismatic modes
- [Prompt log](docs/PROMPT-LOG.csv) — track AI prompts (open in Excel or Google Sheets)

## Deploy

Static SPA — deploy `dist/` after `npm run build`. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for Vercel, Netlify, Cloudflare Pages, and Render.

## Tech stack

- [Vite](https://vite.dev) — build tool
- [React 19](https://react.dev) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) — styling

## License

MIT — use freely for your own portfolio.
