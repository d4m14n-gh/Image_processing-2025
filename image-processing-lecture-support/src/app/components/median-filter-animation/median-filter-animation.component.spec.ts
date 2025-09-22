import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedianFilterAnimationComponent } from './median-filter-animation.component';

describe('MedianFilterAnimationComponent', () => {
  let component: MedianFilterAnimationComponent;
  let fixture: ComponentFixture<MedianFilterAnimationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedianFilterAnimationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedianFilterAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
