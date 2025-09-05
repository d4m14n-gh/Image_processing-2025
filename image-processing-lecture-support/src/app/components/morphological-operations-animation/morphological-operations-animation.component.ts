import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { RouterModule } from '@angular/router';
import { AnimationControllerComponent } from '../animation-controller/animation-controller.component';
import { Bitmap, InteractiveBitmap } from '../../static/bitmap';
import { BitmapComponent } from '../bitmap/bitmap.component';
import { BitmapStorageService } from '../../services/bitmap-storage/bitmap-storage.service';
import { Point } from '../../static/point';
import { StructuringElement } from '../../static/structuringElement';
import { ColorScale, MorphologicalOperations } from '../../static/enums';
import { CdkAutofill } from "@angular/cdk/text-field";
import { DragArea } from '../../static/drag-area';
import { getVar } from '../../static/style-utils';

@Component({
  selector: 'app-morphological-operations-animation',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSliderModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    RouterModule,
    MatCardModule,
    BitmapComponent,
    AnimationControllerComponent,
],
  templateUrl: './morphological-operations-animation.component.html',
  styleUrl: './morphological-operations-animation.component.css'
})
export class MorphologicalOperationsAnimationComponent {
  bitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);
  appliedBitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);
  resultBitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);
  bitmapTick: number = 0;
  bitmapKey: string = 'morphological-operations';

  structuringElemnet: StructuringElement = new StructuringElement(3, 3);
  operation: MorphologicalOperations = MorphologicalOperations.Erosion;

  pixelSize: number = 40;
  showGrid: boolean = true;
  showHeaders: boolean = true;
  showDifference: boolean = true;
  showBase: boolean = false;
  selectionColor: string = getVar("--selection-color");

  animationIndex: number = 0;
  readonly colorscale: ColorScale = ColorScale.Binary;

  constructor(private bitmapStorage: BitmapStorageService) { 
    let bitmap = this.bitmapStorage.load(this.bitmapKey);
    if (bitmap)
      this.bitmap = new InteractiveBitmap(bitmap.width, bitmap.height, bitmap, 255);
    else
      this.bitmapStorage.save(this.bitmapKey, this.bitmap);

    this.structuringElemnet.set(Point.one, 0);
    this.structuringElemnet.save();
    this.structuringElemnet.load();
    this.refresh();
  }

  refresh() {
    this.appliedBitmap = new InteractiveBitmap(this.bitmap.width, this.bitmap.height, undefined, 255);
    this.resultBitmap = new InteractiveBitmap(this.bitmap.width, this.bitmap.height, this.bitmap, 255);
    this.structuringElemnet.applyComplex(this.bitmap, this.appliedBitmap, this.operation, this.showDifference);
    this.animate();
  }

  commit() {
    this.bitmapStorage.save(this.bitmapKey, this.bitmap);
  }

  apply(apply: boolean = true) {
    this.bitmap = new InteractiveBitmap(this.bitmap.width, this.bitmap.height, undefined, 255);
    if(apply)
      this.appliedBitmap.pixels().filter(p=>p.value!<=128).forEach(p=>this.bitmap.set(p.cell, 0));
    else{
      let bitmap = this.bitmapStorage.load(this.bitmapKey);
      if (bitmap)
        this.bitmap = new InteractiveBitmap(bitmap.width, bitmap.height, bitmap, 255);
    }

    this.refresh();
  }

  animate() {
    let cell = this.bitmap.getIndexCell(this.animationIndex);


    this.resultBitmap = new InteractiveBitmap(this.bitmap.width, this.bitmap.height, this.showBase?this.bitmap:undefined, 255);
    this.resultBitmap.pixels().filter(p=>p.value===0).forEach(p => this.resultBitmap.set(p.cell, 128));
    this.setValues(this.animationIndex+1, this.resultBitmap, this.appliedBitmap);


    this.bitmap.clearSelection(); 
    this.resultBitmap.clearSelection(); 

    this.resultBitmap.select(cell);
    
    this.bitmap.highlightedElement = null;
    this.selectionColor = getVar("--selection-color");
    if(this.operation===MorphologicalOperations.Dilation){
      this.resultBitmap.highlightedElement = cell;
      if(!this.bitmap.getBinary(cell))
        this.selectionColor = "#636363ff"
    }
    if(this.operation===MorphologicalOperations.Erosion){
      if(!this.structuringElemnet.getErosion(this.bitmap, cell))
        this.selectionColor = "#636363ff"
    }
    
    if(this.operation===MorphologicalOperations.Dilation || this.operation===MorphologicalOperations.Erosion){
      this.bitmap.highlightedElement = cell;
      for(let row = 0; row < this.structuringElemnet.height; row++){
        for(let col = 0; col < this.structuringElemnet.width; col++) {
          let structuringCell = new Point(row, col);
          if(this.structuringElemnet.getBinary(structuringCell)){
            this.bitmap.select(cell.add(structuringCell).subtract(this.structuringElemnet.origin));
            if(this.operation===MorphologicalOperations.Dilation)
              this.resultBitmap.select(cell.add(structuringCell).subtract(this.structuringElemnet.origin));
          }
        }
      }
    }
    else{
      this.bitmap.select(cell);
    }

    this.bitmapTick++;
  }


  setValues(length: number, destination: Bitmap, source: Bitmap) {
    if(this.operation == MorphologicalOperations.Dilation){

      this.structuringElemnet.getDilatationMask(length, source).pixels().filter(pixel=>pixel.value===0).forEach(pixel => {
        if (destination.isOut(pixel.cell) || source.isOut(pixel.cell))
          return;
        destination.set(pixel.cell, source.get(pixel.cell) ?? 255);
      });
      return;
    
    }
    for (let i = 0; i < length; i++) {
      const cell = this.bitmap.getIndexCell(i);
      
      if (destination.isOut(cell) || source.isOut(cell)) 
        continue;
      
      let value = source.get(cell);
      if(value !== undefined)
        destination.set(cell, value);
    }
  }

  onCellClicked($event: { cell: Point; event: MouseEvent; }, click: boolean = false) {
    if(this.bitmap.isOut($event.cell)) return;
    if($event.event.buttons === 1) {
      this.animationIndex = this.bitmap.getCellIndex($event.cell);
      this.animate();
    }
  }

}
