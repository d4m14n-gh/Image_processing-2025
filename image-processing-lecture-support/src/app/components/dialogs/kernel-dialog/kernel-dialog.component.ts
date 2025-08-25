import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardHeader, MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { MatTabHeader } from "@angular/material/tabs";

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
  kernel: number[][] = [];
  private _size: number = 3;
  get size(): string {
    return this._size.toString();
  }
  set size(value: string) {
    this._size = Number.parseInt(value);
    this.generateKernel();
  }

  constructor(private dialogRef: MatDialogRef<KernelDialogComponent>) {
    this.generateKernel();
  }
  generateKernel() {
    this.kernel = Array.from({ length: this._size }, () =>
      Array.from({ length: this._size }, () => 0)
    );
  }
  close() {
    this.dialogRef.close();
  }

  submit() {
    this.dialogRef.close({ size: this.size, kernel: this.kernel });
  }
}
