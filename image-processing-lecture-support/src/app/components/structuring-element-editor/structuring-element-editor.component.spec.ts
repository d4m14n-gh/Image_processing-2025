import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StructuringElementEditorComponent } from './structuring-element-editor.component';

describe('StructuringElementEditorComponent', () => {
  let component: StructuringElementEditorComponent;
  let fixture: ComponentFixture<StructuringElementEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructuringElementEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StructuringElementEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
