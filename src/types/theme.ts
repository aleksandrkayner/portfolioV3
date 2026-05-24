export const THEME_MODES = ['light', 'dark', 'prismatic'] as const
export type ThemeMode = (typeof THEME_MODES)[number]

export const THEME_LABELS: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  prismatic: 'Prismatic',
}
