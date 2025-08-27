import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrixDisplayComponent } from './matrix-display.component';

describe('MatrixDisplayComponent', () => {
  let component: MatrixDisplayComponent;
  let fixture: ComponentFixture<MatrixDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatrixDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatrixDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
