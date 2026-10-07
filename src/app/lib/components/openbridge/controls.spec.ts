import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { OpenBridgeCheckboxComponent } from './checkbox.component';
import {
  OpenBridgeSelectComponent,
  OpenBridgeOptionComponent
} from './select.component';
import { OpenBridgeSliderComponent } from './slider.component';

@Component({
  imports: [
    FormsModule,
    OpenBridgeCheckboxComponent,
    OpenBridgeSelectComponent,
    OpenBridgeOptionComponent,
    OpenBridgeSliderComponent
  ],
  template: `
    <fb-checkbox
      label="Enable feature"
      [(ngModel)]="enabled"
      [disabled]="disabled"
      (change)="saved = enabled"
    />
    <fb-select label="Source" [(ngModel)]="source" [disabled]="disabled">
      <fb-option [value]="null" label="None" />
      <fb-option [value]="42" label="Numeric source" />
      <fb-option value="42" label="String source" />
    </fb-select>
    <fb-slider
      label="Duration"
      min="1"
      max="96"
      [(ngModel)]="duration"
      [disabled]="disabled"
      (valueChange)="savedDuration = duration"
    />
  `
})
class ControlsFixture {
  enabled = false;
  disabled = false;
  saved = false;
  source: unknown = null;
  duration = 12;
  savedDuration = 12;
}

async function createFixture() {
  const fixture = TestBed.createComponent(ControlsFixture);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  for (const element of fixture.nativeElement.querySelectorAll(
    'obc-dropdown-button, obc-slider, obc-checkbox-item'
  ) as NodeListOf<HTMLElement & { updateComplete: Promise<boolean> }>) {
    await element.updateComplete;
  }
  await Promise.resolve();
  return fixture;
}

describe('OpenBridge Angular control integration', () => {
  it('publishes a checkbox value before the persistence callback and respects disabled state', async () => {
    const fixture = await createFixture();
    const checkbox = fixture.nativeElement.querySelector(
      'obc-checkbox-item'
    ) as HTMLElement;
    checkbox.dispatchEvent(
      new CustomEvent('change', { detail: { status: 'checked' } })
    );
    expect(fixture.componentInstance.enabled).toBe(true);
    expect(fixture.componentInstance.saved).toBe(true);
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    checkbox.dispatchEvent(
      new CustomEvent('change', { detail: { status: 'unchecked' } })
    );
    expect(fixture.componentInstance.enabled).toBe(true);
  });
  it('preserves null, number and string option values rather than coercing them', async () => {
    const fixture = await createFixture();
    const dropdown = fixture.nativeElement.querySelector(
      'obc-dropdown-button'
    ) as HTMLElement;
    for (const [index, value] of [
      [1, 42],
      [2, '42'],
      [0, null]
    ] as const) {
      dropdown.dispatchEvent(
        new CustomEvent('change', { detail: { value: String(index) } })
      );
      expect(fixture.componentInstance.source).toBe(value);
    }
    expect(
      dropdown.shadowRoot?.querySelector('select')?.getAttribute('aria-label')
    ).toBe('Source');
  });
  it('renders the minimum while Angular initializes or resets a slider with null', async () => {
    const fixture = TestBed.createComponent(OpenBridgeSliderComponent);
    fixture.componentInstance.min = 40;
    fixture.componentInstance.writeValue(null);
    fixture.detectChanges();
    await fixture.whenStable();
    const slider = fixture.nativeElement.querySelector('obc-slider');
    await slider.updateComplete;
    expect(slider.value).toBe(40);
    expect(slider.shadowRoot.querySelector('input').value).toBe('40');
  });
  it('publishes slider values before persistence and labels the native range', async () => {
    const fixture = await createFixture();
    const slider = fixture.nativeElement.querySelector(
      'obc-slider'
    ) as HTMLElement;
    slider.dispatchEvent(new CustomEvent('value', { detail: 24 }));
    expect(fixture.componentInstance.duration).toBe(24);
    expect(fixture.componentInstance.savedDuration).toBe(24);
    expect(
      slider.shadowRoot?.querySelector('input')?.getAttribute('aria-label')
    ).toBe('Duration');
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    slider.dispatchEvent(new CustomEvent('value', { detail: 30 }));
    expect(fixture.componentInstance.duration).toBe(24);
  });
});
