# Deployment guide

This project outputs a **static SPA** — no Node server required. Run `npm run build` and publish the `dist/` folder.

## Free hosting options

| Platform | Free tier | Best for |
|----------|-----------|----------|
| [Vercel](https://vercel.com) | Hobby | Vite/React, Git integration |
| [Netlify](https://netlify.com) | Starter | Static sites, forms |
| [Cloudflare Pages](https://pages.cloudflare.com) | Yes | Global CDN, fast builds |
| [Render](https://render.com) | Static sites free | Simple static hosting |

## Build settings (all platforms)

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 20.x |

## Option 1: Vercel (recommended)

1. Push the project to GitHub.
2. Sign in at [vercel.com](https://vercel.com) → **Add New Project**.
3. Import the repository — Vercel auto-detects Vite.
4. Deploy. Your site gets a `*.vercel.app` URL.

`vercel.json` is included for explicit build settings.

### CLI deploy

```bash
npx vercel
```

## Option 2: Netlify

1. Push to GitHub.
2. [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**.
3. Build command: `npm run build`, publish directory: `dist`.

`netlify.toml` is included in the repo root.

### Drag-and-drop

```bash
npm run build
```

Upload the `dist/` folder at Netlify → **Deploys** → **Drag and drop**.

## Option 3: Cloudflare Pages

1. Connect GitHub repo in Cloudflare dashboard.
2. Framework preset: **Vite**
3. Build: `npm run build`, output: `dist`

## Option 4: Render

1. **New** → **Static Site** → connect repo.
2. Build: `npm install && npm run build`, publish: `dist`.

`render.yaml` is included as a blueprint reference.

## Custom domain

All platforms above support custom domains on free plans (DNS configuration required).

## Environment variables

None required for the current static portfolio. If you add APIs later, set secrets in the host dashboard — never commit `.env` files.

## CI check before deploy

```bash
npm run build
```

Fix any TypeScript errors locally first.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank page after deploy | Ensure `base` in `vite.config.ts` is `/` (default) |
| 404 on refresh | Configure SPA fallback to `index.html` (Netlify/Vercel do this automatically) |
| Old content | Clear CDN cache or trigger redeploy |
