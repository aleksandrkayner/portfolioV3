# Theme modes (Light / Dark / Prismatic)

## User-facing

The header has three theme buttons:

| Mode | Label | Description |
|------|-------|-------------|
| `light` | Light | Bright background, dark text |
| `dark` | Dark | Default dashboard look |
| `prismatic` | Prismatic | Purple base + rainbow prism accents |

Theme is held in MobX (`ThemeStore`) via the tsyringe container — in-memory only (resets on refresh). Initial value follows system light/dark preference.

## For developers

| File | Role |
|------|------|
| `src/types/theme.ts` | `ThemeMode` type and labels |
| `src/stores/themeStore.ts` | MobX store, `data-theme` on `<html>` |
| `src/di/container.ts` | tsyringe registration and `resolveThemeStore()` |
| `src/components/ui/ThemeToggle.tsx` | Header control (`observer`) |
| `src/index.css` | CSS variables per `[data-theme="..."]` |

### Add a fourth theme

1. Add id to `THEME_MODES` in `src/types/theme.ts`
2. Add label in `THEME_LABELS`
3. Add `[data-theme='yourtheme'] { --color-... }` block in `index.css`
4. Update inline script in `index.html` if needed for flash prevention
5. Add button icon in `ThemeToggle.tsx`

### Styling rule

Use semantic Tailwind tokens (`bg-dashboard-bg`, `text-accent`, etc.) — not hard-coded hex in components — so themes apply automatically.

Prismatic-only effects use classes: `widget-card`, `skill-bar-fill`, `header-avatar`, `theme-toggle-active`.
