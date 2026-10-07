export const OPENBRIDGE_THEMES = ['bright', 'day', 'dusk', 'night'] as const;
export type OpenBridgeTheme = (typeof OPENBRIDGE_THEMES)[number];
export type ThemePreference = OpenBridgeTheme | 0 | 1 | -1;

export function normalizeThemePreference(value: unknown): ThemePreference {
  if (value === -1) return 'dusk';
  if (value === 0 || value === 1) return value;
  return OPENBRIDGE_THEMES.includes(value as OpenBridgeTheme)
    ? (value as OpenBridgeTheme)
    : 0;
}

export function resolveTheme(
  preference: ThemePreference,
  osDark: boolean,
  environmentMode?: string
): OpenBridgeTheme {
  const source = normalizeThemePreference(preference);
  if (source === 0) return osDark ? 'dusk' : 'day';
  if (source === 1) {
    return environmentMode === 'night'
      ? 'night'
      : environmentMode === 'dusk'
        ? 'dusk'
        : 'day';
  }
  return source as OpenBridgeTheme;
}
