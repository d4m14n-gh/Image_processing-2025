import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccumulatorDialogComponent } from './accumulator-dialog.component';

describe('AccumulatorDialogComponent', () => {
  let component: AccumulatorDialogComponent;
  let fixture: ComponentFixture<AccumulatorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccumulatorDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccumulatorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
