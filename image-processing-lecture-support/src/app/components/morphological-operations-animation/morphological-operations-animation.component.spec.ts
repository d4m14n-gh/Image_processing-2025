import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MorphologicalOperationsAnimationComponent } from './morphological-operations-animation.component';

describe('MorphologicalOperationsAnimationComponent', () => {
  let component: MorphologicalOperationsAnimationComponent;
  let fixture: ComponentFixture<MorphologicalOperationsAnimationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MorphologicalOperationsAnimationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MorphologicalOperationsAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
