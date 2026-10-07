import { OpenBridgeControlDirective } from './control.directive';
import {
  Component,
  ChangeDetectionStrategy,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  booleanAttribute,
  forwardRef,
  output,
  signal
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import '@oicl/openbridge-webcomponents/dist/components/checkbox-item/checkbox-item.js';
import type { ObcCheckboxChangeEvent } from '@oicl/openbridge-webcomponents/dist/components/checkbox/checkbox.js';

@Component({
  selector: 'fb-checkbox',
  imports: [OpenBridgeControlDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OpenBridgeCheckboxComponent),
      multi: true
    }
  ],
  template: `
    <obc-checkbox-item
      [label]="label"
      [status]="value() ? 'checked' : 'unchecked'"
      [disabled]="disabled"
      (change)="update($event)"
      (focusout)="touch()"
    ></obc-checkbox-item>
  `,
  styles: `
    :host {
      display: inline-block;
      max-width: 100%;
    }
  `
})
export class OpenBridgeCheckboxComponent implements ControlValueAccessor {
  @Input() label = '';
  private readonly disabledState = signal(false);
  @Input({ transform: booleanAttribute }) set disabled(value: boolean) {
    this.disabledState.set(value);
  }
  get disabled(): boolean {
    return this.disabledState();
  }
  @Input({ transform: booleanAttribute }) set checked(value: boolean) {
    this.value.set(value);
  }
  get checked(): boolean {
    return this.value();
  }
  readonly change = output<{ checked: boolean }>();
  protected readonly value = signal(false);
  private onChange: (value: boolean) => void = () => {};
  protected touch: () => void = () => {};

  writeValue(value: boolean): void {
    this.value.set(Boolean(value));
  }
  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.touch = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  protected update(event: Event): void {
    event.stopPropagation();
    if (this.disabled) return;
    const checked =
      (event as ObcCheckboxChangeEvent).detail.status === 'checked';
    this.value.set(checked);
    this.onChange(checked);
    this.change.emit({ checked });
  }
}
