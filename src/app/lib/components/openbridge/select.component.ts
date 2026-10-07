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
  computed,
  contentChildren,
  forwardRef,
  input,
  output,
  signal
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import '@oicl/openbridge-webcomponents/dist/components/dropdown-button/dropdown-button.js';
import type { ObcDropdownButton } from '@oicl/openbridge-webcomponents/dist/components/dropdown-button/dropdown-button.js';

@Component({ selector: 'fb-option', template: '', host: { hidden: '' } })
export class OpenBridgeOptionComponent {
  readonly value = input<unknown>();
  readonly label = input('');
}

@Component({
  selector: 'fb-select',
  imports: [OpenBridgeControlDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OpenBridgeSelectComponent),
      multi: true
    }
  ],
  template: `<obc-dropdown-button
      #dropdown
      [options]="nativeOptions()"
      [value]="selectedIndex()"
      [disabled]="disabled"
      [fullWidth]="true"
      [allowEmptySelection]="true"
      [placeholder]="placeholder"
      (change)="update($event)"
      (focusout)="touch()"
    ></obc-dropdown-button
    ><ng-content></ng-content>`,
  styles: `
    :host {
      display: block;
      width: 100%;
      min-width: 0;
    }
  `
})
export class OpenBridgeSelectComponent
  implements ControlValueAccessor, AfterViewInit
{
  @Input() label = '';
  @Input() placeholder = '';
  private readonly disabledState = signal(false);
  @Input({ transform: booleanAttribute }) set disabled(value: boolean) {
    this.disabledState.set(value);
  }
  get disabled(): boolean {
    return this.disabledState();
  }
  @ViewChild('dropdown', { static: true })
  private dropdown!: ElementRef<ObcDropdownButton>;
  readonly selectionChange = output<{ value: unknown }>();
  private readonly options = contentChildren(OpenBridgeOptionComponent);
  private readonly selected = signal<unknown>(undefined);
  protected readonly nativeOptions = computed(() =>
    this.options().map((option, index) => ({
      value: String(index),
      label: option.label()
    }))
  );
  protected readonly selectedIndex = computed(() => {
    const index = this.options().findIndex((option) =>
      Object.is(option.value(), this.selected())
    );
    return index < 0 ? '' : String(index);
  });
  get value(): unknown {
    return this.selected();
  }
  private onChange: (value: unknown) => void = () => {};
  protected touch: () => void = () => {};

  async ngAfterViewInit(): Promise<void> {
    await this.dropdown.nativeElement.updateComplete;
    // Next.162 has no accessible-name property for its inner native select.
    this.dropdown.nativeElement.shadowRoot
      ?.querySelector('select')
      ?.setAttribute('aria-label', this.label);
  }
  writeValue(value: unknown): void {
    this.selected.set(value);
  }
  registerOnChange(fn: (value: unknown) => void): void {
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
    const index = Number(
      (event as CustomEvent<{ value: string }>).detail.value
    );
    const option = this.options()[index];
    if (!option) return;
    const value = option.value();
    this.selected.set(value);
    this.onChange(value);
    this.selectionChange.emit({ value });
  }
}
