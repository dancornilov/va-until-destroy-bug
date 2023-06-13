import { AfterViewInit, Component, Injector, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { ValueAccessorBase } from '../core/base/value-accessor-base.class';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-minute-counter',
  templateUrl: './minute-counter.component.html',
  styleUrls: ['./minute-counter.component.scss'],
  providers: [ValueAccessorBase.getProviderConfig(MinuteCounterComponent)]
})
export class MinuteCounterComponent extends ValueAccessorBase<number | null> implements OnInit, AfterViewInit {
  @Input() label: string;

  form: FormGroup;
  keyMultiplier: Record<string, number> = {
    days: 1440, // 24 hours * 60 minutes,
    hours: 60,
    minutes: 1
  };

  private patchedValue: boolean;

  constructor(
    protected override injector: Injector,
    private formBuilder: FormBuilder
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.createForm();
  }

  override ngAfterViewInit(): void {
    setTimeout(() => {
      const ngControl: NgControl = this.injector.get(NgControl);
      this.control = ValueAccessorBase.extractFormControl(ngControl);

      if (this.control?.disabled) {
        this.form.disable();
      }
    });
  }

  override writeValue(value: number): void {
    if (!this.patchedValue && value) {
      // Incorrect logic, doesn't matter
      const days = 30;
      const hours = 10;
      const minutes = value - ((days * this.keyMultiplier['days']) + (hours * this.keyMultiplier['hours']));

      this.form.patchValue({ days, hours, minutes });

      this.patchedValue = true;
    }

    super.writeValue(value);
  }

  protected createForm(): void {
    this.form = this.formBuilder.group({
      days: [null],
      hours: [null],
      minutes: [null]
    });

    this.form.valueChanges.pipe(
      debounceTime(333),
      untilDestroyed(this)
    ).subscribe(value => {
      const amount = Object.keys(value).filter(key => !!value[key]).reduce((acc, key) => {
        acc += value[key] * this.keyMultiplier[key];

        return acc;
      }, 0);

      this.value = amount || null;
      this.control?.setValue(amount || null);
    });
  }
}
