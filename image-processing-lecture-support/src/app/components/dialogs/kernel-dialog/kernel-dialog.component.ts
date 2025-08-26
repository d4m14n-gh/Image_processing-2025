import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardHeader, MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabHeader } from "@angular/material/tabs";
import { Kernel } from '../../../static/kernel';

@Component({
  selector: 'app-kernel-dialog',
  imports: [
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSliderModule,
    MatCardModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatDialogModule
],
  templateUrl: './kernel-dialog.component.html',
  styleUrl: './kernel-dialog.component.css'
})
export class KernelDialogComponent {
  kernel: Kernel;

  get size(): string {
    return this.kernel.size.toString();
  }
  set size(value: string) {
    this.kernel = new Kernel(Number.parseInt(value));
  }

  constructor(private dialogRef: MatDialogRef<KernelDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: Kernel) {
    this.kernel = data;
  }

  close() {
    this.dialogRef.close();
  }

  submit() {
    this.dialogRef.close(this.kernel);
  }
}
