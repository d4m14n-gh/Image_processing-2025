import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from "@angular/material/toolbar";

@Component({
  selector: 'app-image-matrix-editor',
  imports: [
    MatSliderModule,
    MatCard,
    MatToolbarModule,
    MatCheckbox,
    FormsModule,
    NgClass
],
  templateUrl: './image-matrix-editor.component.html',
  styleUrl: './image-matrix-editor.component.css'
})
export class ImageMatrixEditorComponent implements OnInit {
  private matrix: ImageMatrix = new ImageMatrix();
  public showNumberValues: boolean = true;
  public showBorders: boolean = true;
  public showColorScale: boolean = true;
  
  public ngOnInit(): void {
    this.matrix = new ImageMatrix(10, 10);
  }
  public getValue(row: number, col: number): number {
    return this.matrix.getElement(row, col);
  }
  public getColor(row: number, col: number): string {
    let gray_value = (this.matrix.getElement(row, col) + 255) / 2;
    return `rgb(${gray_value}, ${gray_value}, ${gray_value})`;
  }
  public getWidth(): number {
    return this.matrix.getWidth();
  }
  public getHeight(): number {
    return this.matrix.getHeight();
  }
  public getRows(): number[] {
    return Array.from({ length: this.matrix.getHeight() }, (_, row) => row);
  }
  public getCols(): number[] {
    return Array.from({ length: this.matrix.getWidth() }, (_, col) => col);
  }
  public isSelected(row: number, col: number): boolean {
    return this.matrix.isSelected(row, col);
  }
  public getBorderClass(row: number, col: number): { [key: string]: boolean } {
    let classes: { [key: string]: boolean } = {}
    if(this.matrix.isSelected(row, col)){
      if(!this.matrix.isSelected(row+1, col))
        classes['border-bottom'] = true;
      if(!this.matrix.isSelected(row, col+1))
        classes['border-right'] = true;
      if(!this.matrix.isSelected(row-1, col))
        classes['border-top'] = true;
      if(!this.matrix.isSelected(row, col-1))
        classes['border-left'] = true;
      classes['selected'] = true;
    }
    else{
      if(this.matrix.isSelected(row+1, col))
        classes['border-bottom'] = true;
      if(this.matrix.isSelected(row, col+1))
        classes['border-right'] = true;
      if(this.matrix.isSelected(row-1, col))
        classes['border-top'] = true;
      if(this.matrix.isSelected(row, col-1))
        classes['border-left'] = true;
    }
    // if (this.showBorders) {
    //   classes['border-top'] = '1px solid black';
    //   classes['border-left'] = '1px solid black';
    // }
    return classes;
  }

  public setValue(row: number, col: number, value: number): void {
    if (value < 0 || value > 255) {
      console.error("Value must be between 0 and 255");
      return;
    }
    this.matrix.setElement(row, col, value);
  }
  public selectElement(row: number, col: number): void {
    // this.matrix.clearSelection();
    if(this.matrix.isSelected(row, col)) 
      this.matrix.unselectElement(row, col);
    else
      this.matrix.selectElement(row, col);
  }
  public setWidth(value: number): void {
    this.matrix = new ImageMatrix(value, this.matrix.getHeight(), this.matrix);
  }
  public setHeight(value: number): void {
    this.matrix = new ImageMatrix(this.matrix.getWidth(), value, this.matrix);
  }
}

export class ImageMatrix{
  private width: number;
  private height: number;
  private matrix: number[][];
  private selected: Set<string>;

  constructor(width: number = 10, height: number = 10, oldMatrix?: ImageMatrix) {
    this.width = width;
    this.height = height;
    this.matrix = Array.from({ length: height }, () => Array(width).fill(0));
    this.selected = new Set();
    oldMatrix?.matrix.forEach((row, r) => {
      row.forEach((value, c) => {
        if (r < height && c < width) {
          this.matrix[r][c] = value;
        }
      });
    });
    

  }

  public getWidth(): number {
    return this.width;
  }
  public getHeight(): number {
    return this.height;
  }
  public getElement(row: number, col: number): number {
    return this.matrix[row]?.[col] ?? 0;
  }
  public isSelected(row: number, col: number): boolean {
    return this.selected.has(`${row},${col}`);
  }
  
  public selectElement(row: number, col: number): void {
    this.selected.add(`${row},${col}`);
  }
  public unselectElement(row: number, col: number): void {
    this.selected.delete(`${row},${col}`);
  }
  clearSelection() {
    this.selected.clear();
  }
  public setElement(row: number, col: number, value: number): void {
    this.matrix[row][col] = value;
  }
}
