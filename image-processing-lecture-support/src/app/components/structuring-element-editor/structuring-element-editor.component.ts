import { Component, OnInit } from '@angular/core';
import { InteractiveBitmap } from '../../static/bitmap';
import { MatCardModule } from '@angular/material/card';
import { BitmapComponent } from '../bitmap/bitmap.component';
import { Point } from '../../static/point';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { BitmapStorageService } from '../../services/bitmap-storage/bitmap-storage.service';
import { StructuringElement } from '../../static/structuringElement';

@Component({
  selector: 'app-structuring-element-editor',
  imports: [
    MatCardModule,
    BitmapComponent,
    MatSliderModule,
    FormsModule,
    MatFormFieldModule,
    MatDividerModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './structuring-element-editor.component.html',
  styleUrl: './structuring-element-editor.component.css'
})
export class StructuringElementEditorComponent {
  bitmap: InteractiveBitmap;
  bitmapComponentTick: number = 0;
  structuringElement: StructuringElement = new StructuringElement(3, 3);
  origin: Point;

  pixelSize: number = 75;
  showHeaders: boolean = true;
  showGrid: boolean = true;

  width: number;
  height: number;

  constructor(private router: Router) {
    this.structuringElement.set(Point.one, 0);
    this.structuringElement.load();
    this.width = this.structuringElement.width;
    this.height = this.structuringElement.height;
    this.bitmap = new InteractiveBitmap(this.width, this.height, this.structuringElement);
    this.origin = this.structuringElement.origin;
    
    this.refresh();
  }

  onCellEntered($event: { cell: Point; event: MouseEvent; }) {
    if(this.bitmap.isOut($event.cell)) return;
    if($event.event.buttons === 1)
      this.bitmap.set($event.cell, 0);
    else if($event.event.buttons === 2)
      this.bitmap.set($event.cell, 255);
    this.refresh();
  }

  onCellClicked($event: { cell: Point; event: MouseEvent; }) {
    if($event.event.buttons !== 4) return;
    this.origin = $event.cell;
    this.refresh();
  }
  
  refresh(){
    this.bitmap.clearSelection();
    this.bitmap.highlightedElement = this.origin.clone();
    this.bitmap.select(this.origin);
    // this.bitmap.dragArea.button = 2;
    // this.bitmap.dragArea.dragStart = this.origin.clone();
    // this.bitmap.dragArea.dragEnd = this.origin.clone();
    // this.bitmap.dragArea.dragging = true;
    this.bitmapComponentTick++;
  }

  clear(){
    this.bitmap = new InteractiveBitmap(this.width, this.height, undefined, 255);
    this.refresh();
  }
  
  resize() {
    this.bitmap = new InteractiveBitmap(this.width, this.height, this.bitmap, 255);
    this.origin = new Point(Math.min(this.origin.row, this.height-1), Math.min(this.origin.col, this.width-1));
    this.refresh();
  }

  canSave(): boolean{
    return true;
    // return this._id !== null; 
  }
  quit(){
     if (history.length > 1) {
      history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
  save(){
    this.structuringElement = new StructuringElement(this.bitmap.width, this.bitmap.height, this.origin, this.bitmap);
    this.structuringElement.save();
    this.quit();
  }
}
