import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvolutionalFilterAnimationComponent } from './convolutional-filter-animation.component';

describe('ConvolutionalFilterAnimationComponent', () => {
  let component: ConvolutionalFilterAnimationComponent;
  let fixture: ComponentFixture<ConvolutionalFilterAnimationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConvolutionalFilterAnimationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConvolutionalFilterAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
