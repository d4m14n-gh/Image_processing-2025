import { Component, HostListener } from '@angular/core';
import { FormControl, FormsModule, Validators } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from "@angular/material/toolbar";
import { Bitmap, InteractiveBitmap } from '../../static/bitmap';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BitmapComponent } from "../bitmap/bitmap.component";
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { ColorScale, OutOfRangeHandling, Padding, QuantizationMode} from '../../static/enums';
import { expressionValidator, parseAndApply } from '../../static/expression-utils';
import { ReactiveFormsModule } from '@angular/forms';
import { HistoryService } from '../../services/history/history.service';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BitmapStorageService } from '../../services/bitmap-storage/bitmap-storage.service';
import { UndoRedo } from '../../static/undoRedo';


/** Component for editing and manipulating bitmaps using mathematical expressions. */
@Component({
  selector: 'app-bitmap-editor',
  imports: [
    MatSliderModule,
    MatCardModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatSelectModule,
    FormsModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    BitmapComponent,
    BitmapComponent,
    MatTabsModule,
    MatInputModule,
    MatListModule,
    ReactiveFormsModule,
    MatMenuModule,
    RouterModule,
],
  templateUrl: './bitmap-editor.component.html',
  styleUrl: './bitmap-editor.component.css'
})
export class BitmapEditorComponent {
  //view

  /** If true, pixel values are displayed on the bitmap. */
  showNumberValues: boolean = true;
  /** If true, a grid is displayed over the bitmap. */
  showGrid: boolean = true;
  /** If true, headers (row/column indices) are displayed around the bitmap. */
  showHeaders: boolean = true;
  /** Color scale used for displaying the bitmap. */
  selectedColorScale: ColorScale = ColorScale.Grayscale;
  /** Size of each pixel in the bitmap display (in pixels). */
  pixelSize: number = 50;
  

  //properties
  
  /** Width of the bitmap */
  width: number = 16;
  /** Height of the bitmap */
  height: number = 9;
  /** Default pixel value for uninitialized pixels */
  private _defaultValue: number = 255;
  /** Default pixel value for uninitialized pixels
   * @returns The current default pixel value.
   */
  get defaultValue(): number { return this._defaultValue; }
  /** Sets the default pixel value, clamped between 0 and 255.
   * @param value The new default pixel value.
   */
  set defaultValue(value: number) { this._defaultValue = Math.max(Math.min(Math.round(value), 255), 0); }
  /** The bitmap being edited */
  bitmap: InteractiveBitmap = new InteractiveBitmap(this.width, this.height, undefined, this.defaultValue);
  /** Undo/Redo manager for bitmap states */
  undoRedo = new UndoRedo<Bitmap>(20);

  //behavior

  /** How to handle pixel values that go out of the valid range (0-255) */
  outOfRangeHandling: OutOfRangeHandling = OutOfRangeHandling.Clipping;
  /** Padding mode to use when accessing pixel values outside the bitmap bounds */
  padding: Padding = Padding.Zero;
  /** Quantization mode to use when applying mathematical expressions */
  quantizationMode: QuantizationMode = QuantizationMode.Round;
  

  //expression

  /** Form control for the mathematical expression input */
  expressionControl = new FormControl("b(x, y) + simplex(x, y, RANDOM) * 128 - 128", [
    Validators.required,
    expressionValidator(),
  ]);
  
  
  //controls
  /** Used for refreshing the bitmap display */
  tick: number = 0;
  /** Identifier for the bitmap, used for saving and loading */
  private _id: string | null = null;

  /** Initializes the component, loading the bitmap if an ID is provided in the route. 
   * @param historyService The history service for managing expression history.
   * @param route The activated route for accessing route parameters.
   * @param bitmap_storage The bitmap storage service for saving and loading bitmaps.
   * @param router The router for navigation.
   */
  constructor(private historyService: HistoryService, private route: ActivatedRoute, private bitmap_storage: BitmapStorageService, private router: Router) {
    this.expressionControl.setValue(historyService.getHistoryReversed()[0] ?? this.expressionControl.value);
    this._id = this.route.snapshot.paramMap.get('id');
    
    let bitmap = this.bitmap_storage.load(this._id);
    if(bitmap) this.load(bitmap);
    this.push();
  }
  /**  Loads a new bitmap into the editor.
   * @param bitmapToLoad The bitmap to load.
   * @param keepSelection If true, retains the current selection in the new bitmap.
   * @param push If true, saves the current state to the undo/redo stack.
   */
  load(bitmapToLoad: Bitmap, keepSelection: boolean = false, push: boolean = true): void {
    const newBitmap = new InteractiveBitmap(bitmapToLoad.width, bitmapToLoad.height, bitmapToLoad, this.defaultValue);
    if (keepSelection) this.bitmap.selected.forEach(c=>newBitmap.select(c));

    this.bitmap = newBitmap;
    this.height = this.bitmap.height;
    this.width = this.bitmap.width;
    if(push) this.push();
  }
  /** Applies the mathematical expression to the current bitmap, updating its pixel values. */
  apply(): void {
    if (!this.expressionControl.value) return;
    
    this.historyService.addToHistory(this.expressionControl.value);
    let result = parseAndApply(this.expressionControl.value, 
      this.bitmap,
      this.padding,
      this.outOfRangeHandling,
      this.quantizationMode,
      this.defaultValue,
      this.bitmap.selected.length > 0
    );
    this.load(result, true);
  }


  //gui helpers

  /** Gets the history in reverse order.
   * @returns The history array in reverse order.
   */ 
  getHistory(): string[] {
    return this.historyService.getHistoryReversed();
  }
  /** Resizes the bitmap to the current width and height, preserving existing pixel values. */
  resize(): void {
    this.load(new InteractiveBitmap(this.width, this.height, this.bitmap, this.defaultValue), true);
  }


  //save / quit
  /** Checks if the bitmap can be saved (i.e., has a valid ID).
   * @returns True if the bitmap can be saved, false otherwise.
   */
  canSave(): boolean {
    return this._id !== null;
  }
  
  /** Navigates back to the previous page or to the home page if no history exists. */
  quit(): void {
     if (history.length > 1) {
      history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
  /** Saves the current bitmap to storage if it has a valid ID, then navigates away. */
  save(): void {
    if (this._id !== null) {
      this.bitmap_storage.save(this._id, this.bitmap);
      this.quit();
    }
  }


  //undo/redo
  /** Saves the current bitmap state to the undo/redo stack. */
  push(): void {
    this.undoRedo.push(new Bitmap(this.bitmap.width, this.bitmap.height, this.bitmap));
  }
  /** Undoes the last action, reverting to the previous bitmap state.
   * @returns True if the undo was successful, false if there was no state to revert to.
   */
  undo(): boolean{
    let state = this.undoRedo.undo();
    if(state){
      this.load(state, false, false);
      return true;
    } 
    return false;
  }
  /** Redoes the last undone action, restoring the bitmap state.
   * @returns True if the redo was successful, false if there was no state to restore.
   */
  redo(): boolean{
    let state = this.undoRedo.redo();
    if(state){
      this.load(state, false, false);
      return true;
    } 
    return false;
  }
  /** Listens for keyboard shortcuts for undo (Ctrl+Z) and redo (Ctrl+Y) actions. 
   * @param event The keyboard event.
  */
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    switch(event.key) {
      case 'z':
        if (event.ctrlKey) 
          if(this.undo()) event.preventDefault();
        break;
      case 'y':
        if (event.ctrlKey) 
          if(this.redo()) event.preventDefault();
    }
  }
}


