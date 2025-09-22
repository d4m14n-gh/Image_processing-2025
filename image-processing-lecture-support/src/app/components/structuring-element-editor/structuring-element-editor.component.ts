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
  /** The interactive bitmap representing the structuring element. */
  bitmap: InteractiveBitmap;
  /** Used to trigger bitmap component refresh. */
  tick: number = 0;
  /** The structuring element being edited. */
  structuringElement: StructuringElement = new StructuringElement(3, 3);
  /** The origin point of the structuring element. */
  origin: Point;

  //view
  /** Size of each pixel in the bitmap display (in pixels). */
  pixelSize: number = 75;
  /** If true, headers are displayed on the bitmap. */
  showHeaders: boolean = true;
  /** If true, a grid is displayed over the bitmap. */
  showGrid: boolean = true;

  /** Width of the structuring element. */
  width: number;
  /** Height of the structuring element. */
  height: number;

  /** Creates an instance of the StructuringElementEditorComponent.
   * @param router The router for navigation.
   */
  constructor(private router: Router) {
    this.structuringElement.set(Point.one, 0);
    this.structuringElement.load();
    this.width = this.structuringElement.width;
    this.height = this.structuringElement.height;
    this.bitmap = new InteractiveBitmap(this.width, this.height, this.structuringElement);
    this.origin = this.structuringElement.origin;
    
    this.refresh();
  }

  /** Handles cell enter events to set pixel values based on mouse buttons.
   * @param $event The event containing the entered cell and mouse event details.
   */
  onCellEntered($event: { cell: Point; event: MouseEvent; }): void {
    if(this.bitmap.isOut($event.cell)) return;
    if($event.event.buttons === 1)
      this.bitmap.set($event.cell, 0);
    else if($event.event.buttons === 2)
      this.bitmap.set($event.cell, 255);
    this.refresh();
  }

  /** Handles cell click events to set the origin of the structuring element.
   * @param $event The event containing the clicked cell and mouse event details.
   */
  onCellClicked($event: { cell: Point; event: MouseEvent; }): void {
    if($event.event.buttons !== 4) return;
    this.origin = $event.cell;
    this.refresh();
  }
  
  /** Refreshes the bitmap display and highlights the origin. */
  refresh(): void {
    this.bitmap.clearSelection();
    this.bitmap.highlightedElement = this.origin.clone();
    this.bitmap.select(this.origin);
    // this.bitmap.dragArea.button = 2;
    // this.bitmap.dragArea.dragStart = this.origin.clone();
    // this.bitmap.dragArea.dragEnd = this.origin.clone();
    // this.bitmap.dragArea.dragging = true;
    this.tick++;
  }

  /** Clears the bitmap to a new blank state. */
  clear(): void {
    this.bitmap = new InteractiveBitmap(this.width, this.height, undefined, 255);
    this.refresh();
  }
  
  /** Resizes the bitmap to the current width and height settings. */
  resize(): void {
    this.bitmap = new InteractiveBitmap(this.width, this.height, this.bitmap, 255);
    this.origin = new Point(Math.min(this.origin.row, this.height-1), Math.min(this.origin.col, this.width-1));
    this.refresh();
  }
  
  /** Checks if the structuring element can be saved (i.e., if it has a valid ID). */
  canSave(): boolean {
    return true;
    // return this._id !== null; 
  }
  /** Navigates back to the previous page or home if no history exists. */
  quit(): void {
     if (history.length > 1) {
      history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
  /** Saves the current structuring element to storage and navigates back. */
  save(): void {
    this.structuringElement = new StructuringElement(this.bitmap.width, this.bitmap.height, this.origin, this.bitmap);
    this.structuringElement.save();
    this.quit();
  }
}
