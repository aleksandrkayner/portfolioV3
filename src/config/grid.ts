import type { WidgetSize } from '../types/widget'

/**
 * Maps widget size tokens to responsive CSS grid classes.
 * Adjust here to change layout without touching individual widgets.
 */
export const sizeToGridClass: Record<WidgetSize, string> = {
  sm: 'col-span-1 row-span-1 sm:col-span-2 lg:col-span-2',
  md: 'col-span-1 row-span-1 sm:col-span-2 lg:col-span-4',
  lg: 'col-span-1 row-span-1 sm:col-span-2 lg:col-span-4 lg:row-span-2',
  wide: 'col-span-1 row-span-1 sm:col-span-2 lg:col-span-8',
  tall: 'col-span-1 row-span-1 sm:col-span-2 lg:col-span-4 lg:row-span-2',
  hero: 'col-span-1 row-span-1 sm:col-span-2 lg:col-span-6 lg:row-span-2',
}
