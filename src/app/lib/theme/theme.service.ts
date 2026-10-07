import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import {
  OPENBRIDGE_THEMES,
  OpenBridgeTheme,
  ThemePreference,
  resolveTheme
} from './theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly media = this.document.defaultView?.matchMedia(
    '(prefers-color-scheme: dark)'
  );
  private readonly resolved = signal<OpenBridgeTheme>('day');
  readonly theme = this.resolved.asReadonly();
  private readonly parentPalette = signal<OpenBridgeTheme | null>(null);
  readonly embeddedTheme = this.parentPalette.asReadonly();
  private readonly localPalette = signal<OpenBridgeTheme | null>(null);
  readonly localTheme = this.localPalette.asReadonly();
  private preference: ThemePreference = 0;
  private environmentMode?: string;

  constructor() {
    try {
      const saved = this.document.defaultView?.localStorage.getItem(
        'freeboard-theme-override'
      );
      if (OPENBRIDGE_THEMES.includes(saved as OpenBridgeTheme))
        this.localPalette.set(saved as OpenBridgeTheme);
    } catch {
      /* Embedded/private browsing may deny storage. */
    }
    const onChange = () => this.apply();
    this.media?.addEventListener('change', onChange);
    inject(DestroyRef).onDestroy(() =>
      this.media?.removeEventListener('change', onChange)
    );
    const view = this.document.defaultView;
    if (view && view.parent !== view) {
      const onMessage = (event: MessageEvent<unknown>) => {
        if (
          event.source !== view.parent ||
          event.origin !== view.location.origin
        )
          return;
        const data = event.data;
        if (!data || typeof data !== 'object') return;
        const message = data as {
          type?: unknown;
          version?: unknown;
          palette?: unknown;
        };
        if (
          message.type !== 'freeboard:theme' ||
          message.version !== 1 ||
          !OPENBRIDGE_THEMES.includes(message.palette as OpenBridgeTheme)
        )
          return;
        this.parentPalette.set(message.palette as OpenBridgeTheme);
        this.apply();
      };
      view.addEventListener('message', onMessage);
      inject(DestroyRef).onDestroy(() =>
        view.removeEventListener('message', onMessage)
      );
      view.parent.postMessage(
        { type: 'freeboard:theme-ready', version: 1 },
        view.location.origin
      );
    }
    this.apply();
  }

  update(preference: ThemePreference, environmentMode?: string): void {
    this.preference = preference;
    this.environmentMode = environmentMode;
    this.apply();
  }

  setLocalTheme(palette: OpenBridgeTheme | null): void {
    this.localPalette.set(palette);
    try {
      const storage = this.document.defaultView?.localStorage;
      if (palette === null) storage?.removeItem('freeboard-theme-override');
      else storage?.setItem('freeboard-theme-override', palette);
    } catch {
      /* A temporary choice still works without persistent storage. */
    }
    this.apply();
  }

  private apply(): void {
    const theme =
      this.localPalette() ??
      this.parentPalette() ??
      resolveTheme(
        this.preference,
        this.media?.matches ?? false,
        this.environmentMode
      );
    const root = this.document.documentElement;
    this.resolved.set(theme);
    // Realtime callbacks may revisit this method; only palette changes touch the DOM.
    if (root.dataset['obcTheme'] === theme) return;
    root.dataset['obcTheme'] = theme;
    root.classList.toggle('dark-theme', theme === 'dusk' || theme === 'night');
    root.style.colorScheme =
      theme === 'dusk' || theme === 'night' ? 'dark' : 'light';
  }
}
