import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeService } from './theme.service';
import { MapAppearanceService } from './map-appearance.service';

describe('MapAppearanceService', () => {
  beforeEach(() => {
    localStorage.removeItem('freeboard-map-brightness');
    document.documentElement.removeAttribute('data-obc-theme');
    vi.stubGlobal('matchMedia', () =>
      Object.assign(new EventTarget(), { matches: false })
    );
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
    localStorage.removeItem('freeboard-map-brightness');
    for (const key of ['--fb-chart-brightness', '--fb-symbol-brightness'])
      document.documentElement.style.removeProperty(key);
  });
  it('follows the theme and updates separate map brightness variables', () => {
    const theme = TestBed.inject(ThemeService);
    const appearance = TestBed.inject(MapAppearanceService);
    theme.update('night');
    TestBed.tick();
    expect(appearance.brightness()).toEqual({ chart: 40, symbols: 60 });
    expect(
      document.documentElement.style.getPropertyValue('--fb-chart-brightness')
    ).toBe('0.4');
    expect(
      document.documentElement.style.getPropertyValue('--fb-symbol-brightness')
    ).toBe('0.6');
    theme.update('dusk');
    expect(appearance.brightness()).toEqual({ chart: 60, symbols: 85 });
  });
  it('retains independent preferences by theme and across service recreation', () => {
    let theme = TestBed.inject(ThemeService);
    let appearance = TestBed.inject(MapAppearanceService);
    theme.update('night');
    appearance.setBrightness('chart', 55);
    theme.update('day');
    expect(appearance.brightness()).toEqual({ chart: 100, symbols: 100 });
    TestBed.resetTestingModule();
    theme = TestBed.inject(ThemeService);
    appearance = TestBed.inject(MapAppearanceService);
    theme.update('night');
    expect(appearance.brightness()).toEqual({ chart: 55, symbols: 60 });
  });
  it('rejects invalid stored preferences and values below the allowed symbol minimum', () => {
    localStorage.setItem(
      'freeboard-map-brightness',
      JSON.stringify({ night: { chart: 40, symbols: 0 } })
    );
    TestBed.inject(ThemeService).update('night');
    const appearance = TestBed.inject(MapAppearanceService);
    appearance.setBrightness('symbols', 0);
    appearance.setBrightness('chart', NaN);
    expect(appearance.brightness()).toEqual({ chart: 40, symbols: 60 });
  });
});
