import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, NgZone, inject } from '@angular/core';

/** Rendering visibility, without disconnecting navigation data or changing settings. */
@Injectable({ providedIn: 'root' })
export class EmbeddedVisibilityService {
  private readonly document = inject(DOCUMENT);
  private hostVisible = true;
  private readonly listeners = new Set<(visible: boolean) => void>();

  constructor() {
    const view = this.document.defaultView;
    if (!view) return;
    const publish = () =>
      this.listeners.forEach((listener) => listener(this.visible));
    const message = (event: MessageEvent<unknown>) => {
      if (
        view.parent === view ||
        event.source !== view.parent ||
        event.origin !== view.location.origin
      )
        return;
      const data = event.data as {
        type?: unknown;
        version?: unknown;
        visible?: unknown;
      } | null;
      if (
        !data ||
        data.type !== 'freeboard:visibility' ||
        data.version !== 1 ||
        typeof data.visible !== 'boolean'
      )
        return;
      if (this.hostVisible === data.visible) return;
      this.hostVisible = data.visible;
      publish();
    };
    inject(NgZone).runOutsideAngular(() => {
      view.addEventListener('message', message);
      this.document.addEventListener('visibilitychange', publish);
      if (view.parent !== view)
        view.parent.postMessage(
          { type: 'freeboard:visibility-ready', version: 1 },
          view.location.origin
        );
    });
    inject(DestroyRef).onDestroy(() => {
      view.removeEventListener('message', message);
      this.document.removeEventListener('visibilitychange', publish);
      this.listeners.clear();
    });
  }

  get visible(): boolean {
    return this.hostVisible && !this.document.hidden;
  }

  observe(listener: (visible: boolean) => void): () => void {
    this.listeners.add(listener);
    listener(this.visible);
    return () => this.listeners.delete(listener);
  }
}
