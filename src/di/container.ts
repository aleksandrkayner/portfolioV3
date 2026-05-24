import 'reflect-metadata'
import { container } from 'tsyringe'
import { LayoutStore } from '../stores/layoutStore'
import { ThemeStore } from '../stores/themeStore'
import { WidgetUiStore } from '../stores/widgetUiStore'

container.registerSingleton(ThemeStore, ThemeStore)
container.registerSingleton(LayoutStore, LayoutStore)
container.registerSingleton(WidgetUiStore, WidgetUiStore)

export { container }

export function resolveThemeStore(): ThemeStore {
  return container.resolve(ThemeStore)
}

export function resolveLayoutStore(): LayoutStore {
  return container.resolve(LayoutStore)
}

export function resolveWidgetUiStore(): WidgetUiStore {
  return container.resolve(WidgetUiStore)
}
