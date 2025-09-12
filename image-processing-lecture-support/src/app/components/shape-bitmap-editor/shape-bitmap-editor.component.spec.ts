import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShapeBitmapEditorComponent } from './shape-bitmap-editor.component';

describe('ShapeBitmapEditorComponent', () => {
  let component: ShapeBitmapEditorComponent;
  let fixture: ComponentFixture<ShapeBitmapEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShapeBitmapEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShapeBitmapEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
