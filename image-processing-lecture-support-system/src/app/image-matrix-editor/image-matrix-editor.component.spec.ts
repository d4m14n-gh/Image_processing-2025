import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageMatrixEditorComponent } from './image-matrix-editor.component';

describe('ImageMatrixEditorComponent', () => {
  let component: ImageMatrixEditorComponent;
  let fixture: ComponentFixture<ImageMatrixEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageMatrixEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageMatrixEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
