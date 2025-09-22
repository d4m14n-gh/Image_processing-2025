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
import { getVar } from '../../static/style-utils';

/** Component to visualize and animate morphological operations (dilation, erosion, opening, closing) on a bitmap image. */
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
  /** The original bitmap image to which the morphological operation is applied. */
  bitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);
  /** The bitmap image after applying the morphological operation. */
  appliedBitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);
  /** The result bitmap after the operation is applied. */
  resultBitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);
  /** Used to trigger bitmap component refresh. */
  bitmapTick: number = 0;
  /** Key used to load and save the bitmap in storage. */
  readonly bitmapKey: string = 'morphological-operations';

  /** The structuring element used for the morphological operation. */
  structuringElement: StructuringElement = new StructuringElement(3, 3);
  /** The morphological operation to perform. */
  operation: MorphologicalOperations = MorphologicalOperations.Erosion;

  //view
  /** Size of each pixel in the bitmap display (in pixels). */
  pixelSize: number = 40;
  /** If true, a grid is displayed over the bitmap. */
  showGrid: boolean = true;
  /** If true, headers are displayed. */
  showHeaders: boolean = true;
  /** If true, the difference is displayed. */
  showDifference: boolean = true;
  /** If true, the original bitmap is shown under the result. */
  showBase: boolean = false;
  /** Color used to highlight selected pixels. */
  selectionColor: string = getVar("--selection-color");
  
  /** Current index of the pixel being processed in the animation. */
  animationIndex: number = 0;
  /** Color scale used for displaying the bitmap. */
  readonly colorscale: ColorScale = ColorScale.Binary;

  /** Creates an instance of the MorphologicalOperationsAnimationComponent.
   * @param bitmapStorage The service for loading and saving bitmaps.
   */
  constructor(private bitmapStorage: BitmapStorageService) { 
    let bitmap = this.bitmapStorage.load(this.bitmapKey);
    if (bitmap)
      this.bitmap = new InteractiveBitmap(bitmap.width, bitmap.height, bitmap, 255);
    else
      this.bitmapStorage.save(this.bitmapKey, this.bitmap);

    this.structuringElement.set(Point.one, 0);
    this.structuringElement.load();
    this.structuringElement.save();
    this.refresh();
  }

  /** Updates the applied and result bitmaps based on the current operation and structuring element. */
  refresh(): void {
    this.appliedBitmap = new InteractiveBitmap(this.bitmap.width, this.bitmap.height, undefined, 255);
    this.resultBitmap = new InteractiveBitmap(this.bitmap.width, this.bitmap.height, this.bitmap, 255);
    this.structuringElement.applyComplex(this.bitmap, this.appliedBitmap, this.operation, this.showDifference);
    this.animate();
  }
  /** Saves the current bitmap to storage. */
  commit(): void {
    this.bitmapStorage.save(this.bitmapKey, this.bitmap);
  }
  /** Applies or reverts the morphological operation on the original bitmap.
   * @param apply If true, applies the operation; if false, reverts to the original bitmap.
  */
  apply(apply: boolean = true): void {
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
  /** Advances the animation by processing the next pixel and updating the selection. */
  animate(): void {
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
      if(!this.structuringElement.getErosion(this.bitmap, cell))
        this.selectionColor = "#636363ff"
    }
    
    if(this.operation===MorphologicalOperations.Dilation || this.operation===MorphologicalOperations.Erosion){
      this.bitmap.highlightedElement = cell;
      for(let row = 0; row < this.structuringElement.height; row++){
        for(let col = 0; col < this.structuringElement.width; col++) {
          let structuringCell = new Point(row, col);
          if(this.structuringElement.getBinary(structuringCell)){
            this.bitmap.select(cell.add(structuringCell).subtract(this.structuringElement.origin));
            if(this.operation===MorphologicalOperations.Dilation)
              this.resultBitmap.select(cell.add(structuringCell).subtract(this.structuringElement.origin));
          }
        }
      }
    }
    else{
      this.bitmap.select(cell);
    }

    this.bitmapTick++;
  }

  /** Sets pixel values in the destination bitmap based on the selected morphological operation.
   * @param length The number of pixels to process.
   * @param destination The bitmap where the results are stored.
   * @param source The bitmap from which pixel values are taken.
   */
  setValues(length: number, destination: Bitmap, source: Bitmap): void {
    if(this.operation == MorphologicalOperations.Dilation){

      this.structuringElement.getDilatationMask(length, source).pixels().filter(pixel=>pixel.value===0).forEach(pixel => {
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

  /** Handles cell click events to start the animation from the clicked pixel.
   * @param $event The event containing the clicked cell and mouse event details.
   * @param click Unused.
  */
  onCellClicked($event: { cell: Point; event: MouseEvent; }, click: boolean = false): void {
    if(this.bitmap.isOut($event.cell)) return;
    if($event.event.buttons === 1) {
      this.animationIndex = this.bitmap.getCellIndex($event.cell);
      this.animate();
    }
  }

}
