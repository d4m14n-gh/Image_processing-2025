import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BitmapComponent } from './bitmap.component';

describe('BitmapComponent', () => {
  let component: BitmapComponent;
  let fixture: ComponentFixture<BitmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BitmapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BitmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
