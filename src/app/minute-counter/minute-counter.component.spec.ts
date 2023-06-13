import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinuteCounterComponent } from './minute-counter.component';

describe('MinuteCounterComponent', () => {
  let component: MinuteCounterComponent;
  let fixture: ComponentFixture<MinuteCounterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MinuteCounterComponent]
    });
    fixture = TestBed.createComponent(MinuteCounterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
