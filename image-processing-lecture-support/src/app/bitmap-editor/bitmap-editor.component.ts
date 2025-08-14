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
  bitmap: InteractiveBitmap;
  
  showNumberValues: boolean = true;
  showGrid: boolean = true;
  showHeaders: boolean = true;
  showColorScale: boolean = true;
  
  tick: number = 0;
  width: number = 16;
  height: number = 9;
  pixelSize: number = 50;
  
  selectionMode: SelectionMode = SelectionMode.Selected;
  outOfRangeHandling: OutOfRangeHandling = OutOfRangeHandling.Saturation;
  outOfBoundsHandling: OutOfBoundsHandling = OutOfBoundsHandling.Zero;
  selectedColorScale: ColorScale = ColorScale.Grayscale;
  quantizationMode: QuantizationMode = QuantizationMode.Round;
  
  
  expressionControl = new FormControl("b(x, y) + simplex(x, y, 0) * 128 - 128", [
    Validators.required,
    expressionValidator(),
  ]);
  
  private _defaultValue: number = 255;
  
  constructor(private historyService: HistoryService){
    this.bitmap = new InteractiveBitmap(this.width, this.height, undefined, this.defaultValue);
  }


  get defaultValue(){
    return this._defaultValue;
  }
  set defaultValue(value: number) {
    this._defaultValue = Math.max(Math.min(Math.round(value), 255), 0);
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
    this.tick++;
  }
}


