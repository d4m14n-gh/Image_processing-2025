import { NgClass } from '@angular/common';
import { Component, ElementRef, OnInit, NgZone, ViewChild, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from "@angular/material/toolbar";
import chroma from 'chroma-js';
import { Bitmap } from '../static/bitmap';
import { BitmapRenderer } from '../static/render-utils';
import { ColorScale, getContrastTextColor, scaleColor } from '../static/color-utilis';

@Component({
  selector: 'app-image-matrix-editor',
  imports: [
    MatSliderModule,
    MatCardModule,
    MatToolbarModule,
    MatCheckbox,
    MatButtonToggleModule,
    MatSelectModule,
    FormsModule,
],
  templateUrl: './image-matrix-editor.component.html',
  styleUrl: './image-matrix-editor.component.css'
})
export class ImageMatrixEditorComponent implements OnInit{

  private matrix: Bitmap = new Bitmap();
  public showNumberValues: boolean = true;
  public showBorders: boolean = true;
  public showColorScale: boolean = true;
  public pixelSize: number = 50;
  public selectedColorScale: ColorScale = ColorScale.Grayscale;
  @ViewChild('canvas', { static: false }) canvasRef?: ElementRef<HTMLCanvasElement> = undefined;

  
  constructor(private ngZone: NgZone) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.animate();
  }
  public ngOnInit(): void {
    this.matrix = new Bitmap(10, 10);
    this.animate();
  }

  public animate(): void {
    this.ngZone.runOutsideAngular(() => {
    window.requestAnimationFrame(() => {
        if (!this.canvasRef) return;
        const context = this.canvasRef.nativeElement.getContext('2d') ?? undefined;
        if (context) {
          context.canvas.width = (this.getWidth() * this.pixelSize + 30) * this.getPixelRatio();
          context.canvas.height = (this.getHeight() * this.pixelSize + 30) * this.getPixelRatio();
          BitmapRenderer.render(context, this.getPixelRatio(), this.matrix, this.pixelSize, this.selectedColorScale, this.showBorders, this.showNumberValues);
        }
        // this.ngZone.runOutsideAngular(() => this.animate(this.canvasRef?.nativeElement.getContext('2d') ?? undefined));
      })});
  }
  public getValue(row: number, col: number): number {
    return this.matrix.getElement(row, col);
  }
  public getBgColor(row: number, col: number): string {
    let color = chroma(this.getBaseColor(row, col));
    return color.css();
  }
  public getFgColor(row: number, col: number): string {
    let color = chroma(this.getBaseColor(row, col));
    return getContrastTextColor(color.css());
  }
  private getBaseColor(row: number, col: number): string {
    const value = this.matrix.getElement(row, col);
    return scaleColor(value, this.selectedColorScale);
  }

  
  public getWidth(): number {
    return this.matrix.getWidth();
  }
  public getHeight(): number {
    return this.matrix.getHeight();
  }
  public getPixelRatio(): number {
     return (window.devicePixelRatio || 1);
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
    return classes;
  }



  public setValue(row: number, col: number, value: number): void {
    if (value < 0 || value > 255) {
      console.error("Value must be between 0 and 255");
      return;
    }
    this.matrix.setElement(row, col, value);
  }
  public selectElement(row: number, col: number, event: MouseEvent): void {
    // this.matrix.clearSelection();
    if(!event.ctrlKey){
      this.matrix.clearSelection();
      this.matrix.selectElement(row, col);
    } 
    else{
      if(this.matrix.isSelected(row, col)) 
        this.matrix.unselectElement(row, col);
      else
        this.matrix.selectElement(row, col);
    }
  }
  public selectColumn(col: number, event: MouseEvent): void {
    if(!event.ctrlKey) 
      this.matrix.clearSelection();
    for (let row = 0; row < this.matrix.getHeight(); row++) 
      this.matrix.selectElement(row, col);
  }
  public selectRow(row: number, event: MouseEvent): void {
    if(!event.ctrlKey) 
      this.matrix.clearSelection();
    for (let col = 0; col < this.matrix.getWidth(); col++) 
      this.matrix.selectElement(row, col);
  }
  public setWidth(value: number): void {
    this.matrix = new Bitmap(value, this.matrix.getHeight(), this.matrix);
  }
  public setHeight(value: number): void {
    this.matrix = new Bitmap(this.matrix.getWidth(), value, this.matrix);
  }
}


