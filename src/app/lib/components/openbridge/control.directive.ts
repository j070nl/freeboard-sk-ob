import '@oicl/openbridge-webcomponents/dist/components/icon-button/icon-button.js';
import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';

type NativeControl = HTMLElement & { disabled?: boolean };

// CDK focus traps and menu restoration see hosts, not controls inside shadow roots.
@Directive({
  selector:
    'obc-icon-button, obc-button, obc-dropdown-button, obc-slider, obc-checkbox-item, obc-toggle-switch',
  host: {
    '[attr.tabindex]': 'control.disabled ? -1 : 0'
  }
})
export class OpenBridgeControlDirective {
  protected readonly control =
    inject<ElementRef<NativeControl>>(ElementRef).nativeElement;

  protected focusInner(options?: FocusOptions): void {
    const root = this.control.shadowRoot;
    const target =
      root?.querySelector<HTMLElement>(
        'button, select, input, [role="checkbox"]'
      ) ??
      root
        ?.querySelector('obc-checkbox')
        ?.shadowRoot?.querySelector<HTMLElement>('[role="checkbox"]');
    target?.focus(options);
  }

  constructor() {
    const control = this.control;
    const originalFocus = control.focus;
    control.focus = (options?: FocusOptions) => this.focusInner(options);
    let focusTimer: ReturnType<typeof setTimeout>;
    const onFocus = () => {
      clearTimeout(focusTimer);
      // Chromium can finish focusing the host after its focus handler returns.
      // Wait for that step before moving into the shadow root.
      focusTimer = setTimeout(() => {
        if (
          control.ownerDocument.activeElement === control &&
          !control.shadowRoot?.activeElement
        ) {
          this.focusInner();
        }
      }, 0);
    };
    control.addEventListener('focus', onFocus, true);
    const guardDisabled = (event: Event) => {
      if (control.disabled) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    control.addEventListener('click', guardDisabled, true);
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(focusTimer);
      control.removeEventListener('focus', onFocus, true);
      control.focus = originalFocus;
      control.removeEventListener('click', guardDisabled, true);
    });
  }
}
