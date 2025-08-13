import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BitmapEditorComponent } from './bitmap-editor.component';

describe('ImageMatrixEditorComponent', () => {
  let component: BitmapEditorComponent;
  let fixture: ComponentFixture<BitmapEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BitmapEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BitmapEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
