import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let media: EventTarget & { matches: boolean };
  beforeEach(() => {
    media = Object.assign(new EventTarget(), { matches: false });
    vi.stubGlobal('matchMedia', () => media);
    localStorage.removeItem('freeboard-theme-override');
    document.documentElement.removeAttribute('data-obc-theme');
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
    localStorage.removeItem('freeboard-theme-override');
    document.documentElement.removeAttribute('data-obc-theme');
    document.documentElement.classList.remove('dark-theme');
    document.documentElement.style.removeProperty('color-scheme');
  });
  it('updates the document root so shell and detached overlays inherit one palette', () => {
    const theme = TestBed.inject(ThemeService);
    for (const value of ['bright', 'day', 'dusk', 'night'] as const) {
      theme.update(value);
      expect(document.documentElement.dataset['obcTheme']).toBe(value);
      expect(theme.theme()).toBe(value);
      expect(document.documentElement.classList.contains('dark-theme')).toBe(
        value === 'dusk' || value === 'night'
      );
    }
  });
  it('responds live to OS changes only when OS is selected', () => {
    const theme = TestBed.inject(ThemeService);
    media.matches = true;
    media.dispatchEvent(new Event('change'));
    expect(theme.theme()).toBe('dusk');
    theme.update('bright');
    media.matches = false;
    media.dispatchEvent(new Event('change'));
    expect(theme.theme()).toBe('bright');
  });
  it('does not mutate root classes for unchanged realtime updates and cleans its listener', () => {
    const theme = TestBed.inject(ThemeService);
    theme.update('night');
    const toggle = vi.spyOn(document.documentElement.classList, 'toggle');
    theme.update('night');
    expect(toggle).not.toHaveBeenCalled();
    TestBed.resetTestingModule();
    media.matches = true;
    media.dispatchEvent(new Event('change'));
    expect(toggle).not.toHaveBeenCalled();
    toggle.mockRestore();
  });
});

describe('embedded theme messages', () => {
  const parent = { postMessage: vi.fn() } as unknown as Window;
  beforeEach(() => {
    vi.stubGlobal('matchMedia', () =>
      Object.assign(new EventTarget(), { matches: false })
    );
    vi.spyOn(window, 'parent', 'get').mockReturnValue(parent);
    localStorage.removeItem('freeboard-theme-override');
    document.documentElement.removeAttribute('data-obc-theme');
  });
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    localStorage.removeItem('freeboard-theme-override');
    document.documentElement.removeAttribute('data-obc-theme');
    document.documentElement.classList.remove('dark-theme');
    document.documentElement.style.removeProperty('color-scheme');
  });
  function receive(
    palette: unknown,
    origin = window.location.origin,
    source: Window = parent
  ) {
    window.dispatchEvent(
      new MessageEvent('message', {
        source,
        origin,
        data: { type: 'freeboard:theme', version: 1, palette }
      })
    );
  }
  it('requests the current palette and follows all four host themes without replacing its preference', () => {
    const service = TestBed.inject(ThemeService);
    expect(parent.postMessage).toHaveBeenCalledWith(
      { type: 'freeboard:theme-ready', version: 1 },
      window.location.origin
    );
    service.update('bright');
    for (const palette of ['bright', 'day', 'dusk', 'night'] as const) {
      receive(palette);
      service.update('bright');
      expect(service.theme()).toBe(palette);
      expect(service.embeddedTheme()).toBe(palette);
    }
  });
  it('rejects unrelated senders, origins, malformed values and protocol versions', () => {
    const service = TestBed.inject(ThemeService);
    service.update('day');
    receive('night', 'https://untrusted.example');
    receive('night', window.location.origin, window);
    receive('invalid');
    for (const data of [
      null,
      'night',
      { type: 'freeboard:theme', version: 2, palette: 'night' }
    ]) {
      window.dispatchEvent(
        new MessageEvent('message', {
          source: parent,
          origin: window.location.origin,
          data
        })
      );
    }
    expect(service.embeddedTheme()).toBeNull();
    expect(service.theme()).toBe('day');
  });
  it('keeps a local choice while Skip changes and immediately resumes the latest Skip theme', () => {
    const service = TestBed.inject(ThemeService);
    receive('day');
    service.setLocalTheme('night');
    expect(service.theme()).toBe('night');
    receive('dusk');
    expect(service.embeddedTheme()).toBe('dusk');
    expect(service.theme()).toBe('night');
    service.setLocalTheme(null);
    expect(service.theme()).toBe('dusk');
    expect(localStorage.getItem('freeboard-theme-override')).toBeNull();
  });
  it('restores an explicit local theme after reload without sending it to Skip', () => {
    const service = TestBed.inject(ThemeService);
    service.setLocalTheme('night');
    const before = vi.mocked(parent.postMessage).mock.calls.length;
    TestBed.resetTestingModule();
    const restored = TestBed.inject(ThemeService);
    expect(restored.localTheme()).toBe('night');
    expect(restored.theme()).toBe('night');
    expect(vi.mocked(parent.postMessage).mock.calls.slice(before)).toEqual([
      [{ type: 'freeboard:theme-ready', version: 1 }, window.location.origin]
    ]);
  });
  it('cleans up its listener', () => {
    const service = TestBed.inject(ThemeService);
    service.update('day');
    TestBed.resetTestingModule();
    receive('night');
    expect(service.theme()).toBe('day');
  });
  it('ignores host messages in a standalone window', () => {
    vi.spyOn(window, 'parent', 'get').mockReturnValue(window);
    const service = TestBed.inject(ThemeService);
    service.update('bright');
    receive('night', window.location.origin, window);
    expect(service.theme()).toBe('bright');
    expect(service.embeddedTheme()).toBeNull();
  });
});
