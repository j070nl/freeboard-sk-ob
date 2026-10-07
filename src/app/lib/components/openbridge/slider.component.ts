import { OpenBridgeControlDirective } from './control.directive';
import {
  AfterViewInit,
  Component,
  ChangeDetectionStrategy,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  Input,
  ViewChild,
  booleanAttribute,
  forwardRef,
  numberAttribute,
  output,
  signal
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import '@oicl/openbridge-webcomponents/dist/components/slider/slider.js';
import type { ObcSlider } from '@oicl/openbridge-webcomponents/dist/components/slider/slider.js';

@Component({
  selector: 'fb-slider',
  imports: [OpenBridgeControlDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OpenBridgeSliderComponent),
      multi: true
    }
  ],
  template: `<obc-slider
    #slider
    [min]="min"
    [max]="max"
    [step]="step"
    [value]="value()"
    [disabled]="disabled"
    [allowSeeking]="true"
    (value)="update($event)"
    (focusout)="touch()"
  ></obc-slider>`,
  styles: `
    :host {
      display: block;
      min-width: 160px;
      width: 100%;
    }
  `
})
export class OpenBridgeSliderComponent
  implements ControlValueAccessor, AfterViewInit
{
  @Input() label = '';
  @Input({ transform: numberAttribute }) min = 0;
  @Input({ transform: numberAttribute }) max = 100;
  @Input({ transform: numberAttribute }) step = 1;
  private readonly disabledState = signal(false);
  @Input({ transform: booleanAttribute }) set disabled(value: boolean) {
    this.disabledState.set(value);
  }
  get disabled(): boolean {
    return this.disabledState();
  }
  @ViewChild('slider', { static: true }) private slider!: ElementRef<ObcSlider>;
  readonly valueChange = output<number>();
  protected readonly value = signal(0);
  private onChange: (value: number) => void = () => {};
  protected touch: () => void = () => {};

  async ngAfterViewInit(): Promise<void> {
    await this.slider.nativeElement.updateComplete;
    // Next.162's slider does not forward aria-label to its native range input.
    this.slider.nativeElement.shadowRoot
      ?.querySelector('input')
      ?.setAttribute('aria-label', this.label);
  }
  writeValue(value: number | null): void {
    // Angular forms can issue an initial null before writing the bound value.
    this.value.set(
      typeof value === 'number' && Number.isFinite(value) ? value : this.min
    );
  }
  registerOnChange(fn: (value: number) => void): void {
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
    const value = (event as CustomEvent<number>).detail;
    this.value.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
  }
}
