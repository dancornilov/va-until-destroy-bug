import { AfterViewInit, Directive, forwardRef, Injector, OnDestroy, Provider } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, UntypedFormControl } from '@angular/forms';
import { Subject } from 'rxjs';

@Directive()
export abstract class ValueAccessorBase<T> implements ControlValueAccessor, AfterViewInit, OnDestroy {
  disabled: boolean;
  changed = new Array<(value: T) => void>();
  touched = new Array<() => void>();
  innerValue: T;
  getValueTransform: (value: T) => any;
  setValueTransform: (value: any) => any;
  control: UntypedFormControl | null;
  protected destroy$: Subject<boolean> = new Subject();

  constructor(
    protected readonly injector: Injector
  ) {
  }

  get value(): T {
    return this.innerValue;
  }

  set value(value: T) {
    if (this.innerValue !== value) {
      this.innerValue = value;
    }

    this.changed.forEach(f => f(this.getValueTransform ? this.getValueTransform(value) : value));
  }

  /**
   * Returns provider configuration that should be defined for every component that extends ValueAccessorBaseClass.
   *
   * @param useExisting: Existing token to return. (equivalent to injector.get(useExisting))
   * @returns Provider
   */
  static getProviderConfig(useExisting: any): Provider {
    return {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => useExisting),
      multi: true
    };
  }

  /**
   * Returns control from
   *
   * @returns FormControl
   */
  static extractFormControl(ngControl: NgControl): UntypedFormControl | null {
    if (ngControl) {
      return ngControl.control as UntypedFormControl;
    }

    return null;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const ngControl: NgControl = this.injector.get(NgControl);
      this.control = ValueAccessorBase.extractFormControl(ngControl);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  writeValue(value: T): void {
    this.innerValue = this.setValueTransform ? this.setValueTransform(value) : value;
  }

  registerOnChange(fn: (value: T) => void): void {
    this.changed.push(fn);
  }

  registerOnTouched(fn: () => void): void {
    this.touched.push(fn);
  }

  touch(): void {
    this.touched.forEach(f => f());
  }

  setDisabledState(isDisabled: boolean = true): void {
    this.disabled = isDisabled;
  }
}
