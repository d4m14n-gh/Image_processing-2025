import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimationControllerComponent } from './animation-controller.component';

describe('AnimationControllerComponent', () => {
  let component: AnimationControllerComponent;
  let fixture: ComponentFixture<AnimationControllerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimationControllerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimationControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
