import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KernelDialogComponent } from './kernel-dialog.component';

describe('KernelDialogComponent', () => {
  let component: KernelDialogComponent;
  let fixture: ComponentFixture<KernelDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KernelDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KernelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
