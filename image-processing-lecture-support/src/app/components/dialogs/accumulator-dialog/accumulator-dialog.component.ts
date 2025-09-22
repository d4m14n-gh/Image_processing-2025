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
  currentAccumulator: Set<string>;
  readonly thetaStep = 15;

  constructor(private dialogRef: MatDialogRef<AccumulatorDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: [number[][], Set<string>]) {
    this.accumulator = data[0];
    this.currentAccumulator = data[1];
  }
}
