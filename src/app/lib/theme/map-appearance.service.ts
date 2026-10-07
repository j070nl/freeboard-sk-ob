import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { ThemeService } from './theme.service';
import { OPENBRIDGE_THEMES, OpenBridgeTheme } from './theme';

export type MapBrightness = { chart: number; symbols: number };
export const MAP_BRIGHTNESS_DEFAULTS: Record<OpenBridgeTheme, MapBrightness> = {
  bright: { chart: 100, symbols: 100 },
  day: { chart: 100, symbols: 100 },
  dusk: { chart: 60, symbols: 85 },
  night: { chart: 40, symbols: 60 }
};
const STORAGE_KEY = 'freeboard-map-brightness';

@Injectable({ providedIn: 'root' })
export class MapAppearanceService {
  private readonly document = inject(DOCUMENT);
  private readonly theme = inject(ThemeService);
  private readonly overrides = signal<
    Partial<Record<OpenBridgeTheme, MapBrightness>>
  >({});
  readonly brightness = computed(
    () =>
      this.overrides()[this.theme.theme()] ??
      MAP_BRIGHTNESS_DEFAULTS[this.theme.theme()]
  );

  constructor() {
    try {
      const data = JSON.parse(
        this.document.defaultView?.localStorage.getItem(STORAGE_KEY) ?? '{}'
      );
      const values: Partial<Record<OpenBridgeTheme, MapBrightness>> = {};
      for (const palette of OPENBRIDGE_THEMES) {
        const value = data?.[palette];
        if (this.valid(value))
          values[palette] = { chart: value.chart, symbols: value.symbols };
      }
      this.overrides.set(values);
    } catch {
      /* Storage may be unavailable; theme defaults remain usable. */
    }
    effect(() => {
      const value = this.brightness();
      const root = this.document.documentElement;
      root.style.setProperty(
        '--fb-chart-brightness',
        String(value.chart / 100)
      );
      root.style.setProperty(
        '--fb-symbol-brightness',
        String(value.symbols / 100)
      );
    });
  }

  setBrightness(kind: keyof MapBrightness, value: number): void {
    const next = { ...this.brightness(), [kind]: value };
    if (!this.valid(next)) return;
    this.overrides.update((values) => ({
      ...values,
      [this.theme.theme()]: next
    }));
    try {
      this.document.defaultView?.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(this.overrides())
      );
    } catch {
      /* The current session still uses the selected brightness. */
    }
  }

  private valid(value: unknown): value is MapBrightness {
    if (!value || typeof value !== 'object') return false;
    const v = value as MapBrightness;
    return (
      Number.isFinite(v.chart) &&
      v.chart >= 15 &&
      v.chart <= 100 &&
      Number.isFinite(v.symbols) &&
      v.symbols >= 40 &&
      v.symbols <= 100
    );
  }
}
