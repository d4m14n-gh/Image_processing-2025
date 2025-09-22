import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoughTransformAnimationComponent } from './hough-transform-animation.component';

describe('HoughTransformAnimationComponent', () => {
  let component: HoughTransformAnimationComponent;
  let fixture: ComponentFixture<HoughTransformAnimationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoughTransformAnimationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoughTransformAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
