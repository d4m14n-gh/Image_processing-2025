import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BitmapComponent } from '../bitmap/bitmap.component';
import { InteractiveBitmap } from '../../static/bitmap';
import { Point } from '../../static/point';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from "@angular/material/button";
import { ActivatedRoute, Router } from '@angular/router';
import { BitmapStorageService } from '../../services/bitmap-storage/bitmap-storage.service';

/** Component for editing binary bitmaps (black and white images). */
@Component({
  selector: 'app-binary-bitmap-editor',
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
  templateUrl: './binary-bitmap-editor.component.html',
  styleUrl: './binary-bitmap-editor.component.css'
})
export class BinaryBitmapEditorComponent {
  /** The interactive bitmap being edited. */
  bitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);
  /** Tick counter to trigger bitmap component updates. */
  bitmapComponentTick: number = 0;
  
  //view
  /** Size of each pixel in the bitmap display (in pixels). */
  pixelSize: number = 50;
  /** If true, pixel values are displayed on the bitmap. */
  showHeaders: boolean = true;
  /** If true, a grid is displayed over the bitmap. */
  showGrid: boolean = true;
  
  /** Width and height of the bitmap being edited. */
  width: number = 16;
  /** Height of the bitmap being edited. */
  height: number = 9;

  /** The ID of the bitmap being edited, if loaded from storage. */
  private _id: string | null = null;

  /** Creates an instance of the BinaryBitmapEditorComponent.
   * @param route The activated route to access route parameters.
   * @param bitmap_storage The service for loading and saving bitmaps.
   * @param router The router for navigation.
   */
  constructor(private route: ActivatedRoute, private bitmap_storage: BitmapStorageService, private router: Router) {
    this._id = this.route.snapshot.paramMap.get('id');
    let bitmap = this.bitmap_storage.load(this._id);
    if(bitmap) 
      this.bitmap = new InteractiveBitmap(bitmap.width, bitmap.height, bitmap, 255);
    this.width = this.bitmap.width;
    this.height = this.bitmap.height;
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
    this.bitmapComponentTick++;
  }

  /** Clears the bitmap to a new blank state. */
  clear(): void {
    this.bitmap = new InteractiveBitmap(this.width, this.height, undefined, 255);
    this.bitmapComponentTick++;
  }

  /** Resizes the bitmap to the current width and height settings. */
  resize(): void {
    this.bitmap = new InteractiveBitmap(this.width, this.height, this.bitmap, 255);
    this.bitmapComponentTick++;
  }

  /** Checks if the bitmap can be saved (i.e., if it has a valid ID). */
  canSave(): boolean {
    return this._id !== null;
  }
  /** Navigates back to the previous page or home if no history exists. */
  quit(): void {
     if (history.length > 1) {
      history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
  /** Saves the current bitmap to storage and navigates back. */
  save(): void {
    if (this._id !== null) {
      this.bitmap_storage.save(this._id, this.bitmap);
      this.quit();
    }
  }
}
