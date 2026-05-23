# Deployment guide

## Heroku (this project)

This repo is configured for Heroku with `Procfile`, `heroku-postbuild`, and the `serve` package for the Vite SPA.

**Target URL:** `https://aleksandraynerporfolio.herokuapp.com`  
(Heroku app names are lowercase; the name still reads as *AleksandraynerPorfolio*.)

### Cost note

Heroku **no longer has a free tier**. You need a paid Eco/Basic dyno (about $5/month as of 2024). Billing is on your Heroku account.

### One-time setup

```bash
cd "/Users/alexkayner/Desktop/portfolio v3"
npm install
heroku login
git init
git add .
git commit -m "Prepare portfolio for Heroku"
heroku create aleksandraynerporfolio
git push heroku main
```

If `aleksandraynerporfolio` is already taken globally, try a variant:

```bash
heroku create aleksandraynerporfolio-v3
```

### Deploy updates later

```bash
git add .
git commit -m "Update portfolio"
git push heroku main
```

### Open the site

```bash
heroku open
```

### Troubleshooting (Heroku)

| Issue | Fix |
|-------|-----|
| `Name is already taken` | Pick a unique suffix: `aleksandraynerporfolio-dev` |
| Build fails (TypeScript/Vite) | Run `npm run build` locally first; ensure Node 20 |
| Blank page | Check `heroku logs --tail`; confirm `dist/` exists after build |
| App crash on start | Verify `serve` is in `dependencies` and `PORT` is used |

---

## Other hosts (free tiers)

For a static React/Vite app, these alternatives have free plans:

| Platform | Free tier | Best for |
|----------|-----------|----------|
| [Vercel](https://vercel.com) | Hobby | Vite/React, Git integration |
| [Netlify](https://netlify.com) | Starter | Static sites, forms |
| [Cloudflare Pages](https://pages.cloudflare.com) | Yes | Global CDN, fast builds |
| [Render](https://render.com) | Static sites free | Simple static hosting |

This project outputs a **static SPA** — no server required.

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
