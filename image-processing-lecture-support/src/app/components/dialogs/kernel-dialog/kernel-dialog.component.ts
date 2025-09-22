import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import { Kernel } from '../../../static/kernel';
import { MatSelectModule } from '@angular/material/select';
import { MatMenu, MatMenuModule } from "@angular/material/menu";

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
    MatDialogModule,
    MatSelectModule,
    MatMenuModule
],
  templateUrl: './kernel-dialog.component.html',
  styleUrl: './kernel-dialog.component.css'
})
export class KernelDialogComponent {
  kernel: Kernel;
  readonly kernelType = KernelType;
  get size(): number {
    return this.kernel.size;
  }
  set size(value: number) {
    this.kernel = new Kernel(value);
  }


  constructor(private dialogRef: MatDialogRef<KernelDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: Kernel) {
    this.kernel = data;
  }

  setKernel(type: KernelType) {
    if (type === KernelType.Identity3x3) {
      this.kernel = new Kernel(3,
        [[0, 0, 0],
        [0, 1, 0],
        [0, 0, 0]]
      );
    } else if (type === KernelType.Sharpen3x3) {
      this.kernel = new Kernel(3,
        [[0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0]]
      );
    } else if (type === KernelType.EdgeDetect3x3) {
      this.kernel = new Kernel(3,
        [[-1, -1, -1],
        [-1, 8, -1],
        [-1, -1, -1]]
      );
    } else if (type === KernelType.BoxBlur3x3) {
      this.kernel = new Kernel(3,
        [[1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]], 9
      );
    } else if (type === KernelType.GaussianBlur3x3) {
      this.kernel = new Kernel(3,
        [[1, 2, 1],
        [2, 4, 2],
        [1, 2, 1]], 16
      );
    } else if (type === KernelType.Sobel3x3) {
      this.kernel = new Kernel(3,
        [[-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]]
      );
    } else if (type === KernelType.Prewitt3x3) {
      this.kernel = new Kernel(3,
        [[-1, 0, 1],
        [-1, 0, 1],
        [-1, 0, 1]]
      );
    } else if (type === KernelType.Laplacian3x3) {
      this.kernel = new Kernel(3,
        [[0, 1, 0],
        [1, -4, 1],
        [0, 1, 0]]
      );
    }

    else if (type === KernelType.BoxBlur5x5) {
      this.kernel = new Kernel(5,
        Array(5).fill(Array(5).fill(1)), 25
      );
    } else if (type === KernelType.GaussianBlur5x5) {
      this.kernel = new Kernel(5,
        [
          [1, 4, 6, 4, 1],
          [4, 16, 24, 16, 4],
          [6, 24, 36, 24, 6],
          [4, 16, 24, 16, 4],
          [1, 4, 6, 4, 1]
        ], 256
      );
    } else if (type === KernelType.Sharpen5x5) {
      this.kernel = new Kernel(5,
        [
          [0, 0, -1, 0, 0],
          [0, -1, -2, -1, 0],
          [-1, -2, 16, -2, -1],
          [0, -1, -2, -1, 0],
          [0, 0, -1, 0, 0]
        ]
      );
    } 

    else if (type === KernelType.BoxBlur7x7) {
      this.kernel = new Kernel(7,
        Array(7).fill(Array(7).fill(1)), 49
      );
    } else if (type === KernelType.GaussianBlur7x7) {
      this.kernel = new Kernel(7,
        [
          [0, 0, 1, 2, 1, 0, 0],
          [0, 3, 13, 22, 13, 3, 0],
          [1, 13, 59, 97, 59, 13, 1],
          [2, 22, 97, 159, 97, 22, 2],
          [1, 13, 59, 97, 59, 13, 1],
          [0, 3, 13, 22, 13, 3, 0],
          [0, 0, 1, 2, 1, 0, 0]
        ], 1003
      );
    } else if (type === KernelType.Sharpen7x7) {
      this.kernel = new Kernel(7,
        [
          [0, 0, 0, -1, 0, 0, 0],
          [0, 0, -1, -2, -1, 0, 0],
          [0, -1, -2, -4, -2, -1, 0],
          [-1, -2, -4, 60, -4, -2, -1],
          [0, -1, -2, -4, -2, -1, 0],
          [0, 0, -1, -2, -1, 0, 0],
          [0, 0, 0, -1, 0, 0, 0]
        ]
      );
    }
  }



  close() {
    this.dialogRef.close();
  }

  submit() {
    this.dialogRef.close(this.kernel);
  }
}

export enum KernelType {
  // 3x3 - pełny zestaw
  Identity3x3 = "Identity3x3",
  Sharpen3x3 = "Sharpen3x3",
  EdgeDetect3x3 = "EdgeDetect3x3",
  BoxBlur3x3 = "BoxBlur3x3",
  GaussianBlur3x3 = "GaussianBlur3x3",
  Sobel3x3 = "Sobel3x3",
  Prewitt3x3 = "Prewitt3x3",
  Laplacian3x3 = "Laplacian3x3",

  // 5x5 - minimalne
  BoxBlur5x5 = "BoxBlur5x5",
  GaussianBlur5x5 = "GaussianBlur5x5",
  Sharpen5x5 = "Sharpen5x5",

  // 7x7 - minimalne
  BoxBlur7x7 = "BoxBlur7x7",
  GaussianBlur7x7 = "GaussianBlur7x7",
  Sharpen7x7 = "Sharpen7x7",
}