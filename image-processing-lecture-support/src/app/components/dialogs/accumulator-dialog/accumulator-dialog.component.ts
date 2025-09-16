import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-accumulator-dialog',
  imports: [
    MatDialogModule,
  ],
  templateUrl: './accumulator-dialog.component.html',
  styleUrl: './accumulator-dialog.component.css'
})
export class AccumulatorDialogComponent {
  accumulator: number[][];
  readonly thetaStep = 15;

  constructor(private dialogRef: MatDialogRef<AccumulatorDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: number[][]) {
    this.accumulator = data;
  }
}
