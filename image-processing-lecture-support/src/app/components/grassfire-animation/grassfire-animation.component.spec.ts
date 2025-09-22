import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrassfireAnimationComponent } from './grassfire-animation.component';

describe('GrassfireAnimationComponent', () => {
  let component: GrassfireAnimationComponent;
  let fixture: ComponentFixture<GrassfireAnimationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrassfireAnimationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GrassfireAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
