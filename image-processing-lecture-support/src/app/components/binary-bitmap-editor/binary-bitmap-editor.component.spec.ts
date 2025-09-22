import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BinaryBitmapEditorComponent } from './binary-bitmap-editor.component';

describe('BinaryBitmapEditorComponent', () => {
  let component: BinaryBitmapEditorComponent;
  let fixture: ComponentFixture<BinaryBitmapEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BinaryBitmapEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BinaryBitmapEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
