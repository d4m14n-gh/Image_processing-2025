import { Component } from '@angular/core';
import { FormControl, FormsModule, Validators } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from "@angular/material/toolbar";
import { InteractiveBitmap } from '../static/bitmap';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BitmapComponent } from "../bitmap/bitmap.component";
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { ColorScale, OutOfBoundsHandling, OutOfRangeHandling, QuantizationMode, SelectionMode } from '../static/enums';
import { expressionValidator, parseAndApply } from '../static/expression-utils';
import { ReactiveFormsModule } from '@angular/forms';
import { HistoryService } from '../history/history.service';
import { MatListModule } from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import { DragArea } from '../static/drag-area';

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
    MatMenuModule
],
  templateUrl: './bitmap-editor.component.html',
  styleUrl: './bitmap-editor.component.css'
})
export class BitmapEditorComponent{
  showNumberValues: boolean = true;
  showGrid: boolean = true;
  showHeaders: boolean = false;
  showColorScale: boolean = true;

  width: number = 16;
  height: number = 9;
  pixelSize: number = 50;
  
  selectionMode: SelectionMode = SelectionMode.Selected;
  outOfRangeHandling: OutOfRangeHandling = OutOfRangeHandling.Saturation;
  outOfBoundsHandling: OutOfBoundsHandling = OutOfBoundsHandling.Zero;
  selectedColorScale: ColorScale = ColorScale.Grayscale;
  quantizationMode: QuantizationMode = QuantizationMode.Round;
  
  tick: number = 0;
  
  bitmap: InteractiveBitmap;
  
  expressionControl = new FormControl("b(x, y) + simplex(x, y, 0) * 128 - 128", [
    Validators.required,
    expressionValidator(),
  ]);
  

  //private
  private _defaultValue: number = 255;


  //functions
  constructor(private historyService: HistoryService){
    this.bitmap = new InteractiveBitmap(this.width, this.height, undefined, this.defaultValue);
  }
  get defaultValue(){
    return this._defaultValue;
  }
  set defaultValue(value: number) {
    this._defaultValue = Math.max(Math.min(Math.round(value), 255), 0);
  }

  onKey(event: KeyboardEvent) {
    // Ctrl+A
    if (event.ctrlKey && event.key.toLowerCase() === 'a') {
      event.preventDefault();
      this.selectAll();
    }
  }
  refreshBitmap() {
    this.tick++;
  }


  dragStart(drag_area: DragArea) {
    if(!drag_area.ctrlKey&&drag_area.button != 2) this.bitmap.clearSelection();
    this.bitmap.dragArea = drag_area;
    this.refreshBitmap();
  }
  dragMove(drag_area: DragArea){
    if(drag_area.dragging){
      this.bitmap.dragArea = drag_area;
      this.refreshBitmap();
    }
  }
  dragEnd(drag_area: DragArea){
    this.bitmap.dragArea = drag_area;
    for(let pos of drag_area.getAreaCells())
      this.bitmap.setSelection(pos.row, pos.col, drag_area.button != 2);
    this.refreshBitmap();
  }



  selectRow(row: number, event: MouseEvent) {
    if(!event.ctrlKey&&event.button != 2) this.bitmap.clearSelection();
    for (let col = 0; col < this.bitmap.getWidth(); col++) 
      this.bitmap.setSelection(row, col, event.button != 2);
    this.refreshBitmap();
  }
  selectColumn(col: number, event: MouseEvent) {
    if(!event.ctrlKey&&event.button != 2) this.bitmap.clearSelection();
    for (let row = 0; row < this.bitmap.getHeight(); row++)
      this.bitmap.setSelection(row, col, event.button != 2);
    this.refreshBitmap();
  }
  selectAll() {
    for (let row = 0; row < this.bitmap.getHeight(); row++) 
      for (let col = 0; col < this.bitmap.getWidth(); col++) 
        this.bitmap.select(row, col);
    this.refreshBitmap();
  }

  resize(){
    this.bitmap = new InteractiveBitmap(this.width, this.height, this.bitmap, this.defaultValue);
  }

  clearHistory() {
    this.historyService.clearHistory();
  }

  getHistory() {
    return this.historyService.getHistory().slice().reverse();
  }

  apply(){
    if(!this.expressionControl.value) return;
    
    parseAndApply(this.expressionControl.value, this.bitmap, 
      this.outOfBoundsHandling,
      this.outOfRangeHandling,
      this.quantizationMode,
      this.defaultValue
    );
    this.historyService.addToHistory(this.expressionControl.value);
    this.refreshBitmap();
  }
}


