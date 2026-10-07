import { describe, expect, it } from 'vitest';
import {
  normalizeThemePreference,
  OPENBRIDGE_THEMES,
  resolveTheme
} from './theme';

describe('OpenBridge theme resolution', () => {
  for (const theme of OPENBRIDGE_THEMES) {
    it(`retains explicit ${theme} independently of OS and vessel mode`, () => {
      expect(resolveTheme(theme, true, 'night')).toBe(theme);
      expect(resolveTheme(theme, false, 'day')).toBe(theme);
      expect(normalizeThemePreference(JSON.parse(JSON.stringify(theme)))).toBe(
        theme
      );
    });
  }
  it('migrates legacy manual dark to dusk', () => {
    expect(normalizeThemePreference(-1)).toBe('dusk');
    expect(resolveTheme(-1, false)).toBe('dusk');
  });
  it('retains OS and Signal K automatic sources', () => {
    expect(resolveTheme(0, false, 'night')).toBe('day');
    expect(resolveTheme(0, true, 'day')).toBe('dusk');
    expect(resolveTheme(1, false, 'night')).toBe('night');
    expect(resolveTheme(1, true, 'dusk')).toBe('dusk');
    expect(resolveTheme(1, true, 'day')).toBe('day');
    expect(resolveTheme(1, true)).toBe('day');
  });
  it('falls back to the existing OS default for malformed stored values', () => {
    for (const invalid of [null, undefined, 'invalid', {}, 42]) {
      expect(normalizeThemePreference(invalid)).toBe(0);
    }
  });
});
