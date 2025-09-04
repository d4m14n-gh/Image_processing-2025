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
import { ColorScale, OutOfRangeHandling, Padding, QuantizationMode, SelectionMode } from '../../static/enums';
import { expressionValidator, parseAndApply } from '../../static/expression-utils';
import { ReactiveFormsModule } from '@angular/forms';
import { HistoryService } from '../../services/history/history.service';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BitmapStorageService } from '../../services/bitmap-storage/bitmap-storage.service';
import { UndoRedo } from '../../static/undoRedo';

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
  showNumberValues: boolean = true;
  showGrid: boolean = true;
  showHeaders: boolean = true;
  selectedColorScale: ColorScale = ColorScale.Grayscale;
  pixelSize: number = 50;
  

  //properties
  width: number = 16;
  height: number = 9;
  private _defaultValue: number = 255;
  get defaultValue() { return this._defaultValue; }
  set defaultValue(value: number) { this._defaultValue = Math.max(Math.min(Math.round(value), 255), 0); }
  bitmap: InteractiveBitmap = new InteractiveBitmap(this.width, this.height, undefined, this.defaultValue);
  undoRedo = new UndoRedo<Bitmap>(20);

  //backend
  selectionMode: SelectionMode = SelectionMode.Selected;
  outOfRangeHandling: OutOfRangeHandling = OutOfRangeHandling.Clipping;
  padding: Padding = Padding.Zero;
  quantizationMode: QuantizationMode = QuantizationMode.Round;
  

  //expression
  expressionControl = new FormControl("b(x, y) + simplex(x, y, 0) * 128 - 128", [
    Validators.required,
    expressionValidator(),
  ]);
  
  
  //controls
  tick: number = 0;
  private _id: string | null = null;


  constructor(private historyService: HistoryService, private route: ActivatedRoute, private bitmap_storage: BitmapStorageService, private router: Router) {
    this.expressionControl.setValue(historyService.getHistoryReversed()[0] ?? this.expressionControl.value);
    this._id = this.route.snapshot.paramMap.get('id');
    
    let bitmap = this.bitmap_storage.load(this._id);
    if(bitmap) this.load(bitmap);
    this.push();
  }
  load(bitmapToLoad: Bitmap, keepSelection: boolean = false, push: boolean = true) {
    const newBitmap = new InteractiveBitmap(bitmapToLoad.width, bitmapToLoad.height, bitmapToLoad, this.defaultValue);
    if (keepSelection) this.bitmap.selected.forEach(c=>newBitmap.select(c));

    this.bitmap = newBitmap;
    this.height = this.bitmap.height;
    this.width = this.bitmap.width;
    if(push) this.push();
  }
  apply() {
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
  getHistory() {
    return this.historyService.getHistoryReversed();
  }
  resize() {
    this.load(new InteractiveBitmap(this.width, this.height, this.bitmap, this.defaultValue), true);
  }


  //save / quit
  canSave(){
    return this._id !== null; 
  }
  quit(){
     if (history.length > 1) {
      history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
  save(){
    if (this._id !== null) {
      this.bitmap_storage.save(this._id, this.bitmap);
      this.quit();
    }
  }


  //undo/redo
  push(){
    this.undoRedo.push(new Bitmap(this.bitmap.width, this.bitmap.height, this.bitmap));
  }
  undo(): boolean{
    let state = this.undoRedo.undo();
    if(state){
      this.load(state, false, false);
      return true;
    } 
    return false;
  }
  redo(): boolean{
    let state = this.undoRedo.redo();
    if(state){
      this.load(state, false, false);
      return true;
    } 
    return false;
  }
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
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


