import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { RouterModule } from '@angular/router';
import { BitmapComponent } from '../bitmap/bitmap.component';
import { FormsModule } from '@angular/forms';
import { AnimationControllerComponent } from '../animation-controller/animation-controller.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { ColorScale, Padding } from '../../static/enums';
import { Bitmap, InteractiveBitmap } from '../../static/bitmap';
import { BitmapStorageService } from '../../services/bitmap-storage/bitmap-storage.service';
import { Point } from '../../static/point';
import { MathjaxModule } from 'mathjax-angular';
import { Kernel } from '../../static/kernel';
import { MatButtonToggleModule } from '@angular/material/button-toggle';


/**
 * Component to visualize and animate the application of a median filter on a bitmap image.
 * It allows users to see how the median filter processes each pixel in the image step-by-step.
 */
@Component({
  selector: 'app-median-filter-animation',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    RouterModule,
    MatFormFieldModule,
    MatMenuModule,
    BitmapComponent,
    FormsModule,
    AnimationControllerComponent,
    MatCheckboxModule,
    MatSelectModule,
    MathjaxModule,
    MatButtonToggleModule
  ],
  templateUrl: './median-filter-animation.component.html',
  styleUrl: './median-filter-animation.component.css'
})
export class MedianFilterAnimationComponent {
  /** The original bitmap image to which the median filter is applied. */
  bitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);
  /** The bitmap image after applying the median filter. */
  appliedBitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);
  /** The result bitmap after the animation. */
  resultBitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);

  /** Padding strategy used when accessing pixels outside the bitmap boundaries. */
  padding: Padding = Padding.Edge;
  /** The kernel representing the current neighborhood of pixels being processed. */
  sourceKernel: Kernel = new Kernel(3);
  /** Size of the median filter window (must be an odd number). */
  windowSize: number = 3;
  
  
  //view
  /** Size of each pixel in the bitmap display (in pixels). */
  pixelSize: number = 40;
  /** If true, a grid is displayed over the bitmap. */
  showGrid: boolean = true;
  /** If true, headers (row/column indices) are displayed around the bitmap. */
  showHeaders: boolean = true;
  /** If true, pixel values are displayed on the bitmap. */
  showNumberValues: boolean = true;
  /** If true, the original bitmap is shown under the result for comparison. */
  showBase: boolean = false;
  /** Color scale used for displaying the bitmap. */
  selectedColorScale: ColorScale = ColorScale.Grayscale;
  
  
  //controls
  /** Used to trigger re-rendering of the bitmap component when the bitmap changes. */
  tick: number = 0;
  /** Current index of the pixel being processed in the animation. */
  animationIndex: number = 0;
  /** Key used to load and save the bitmap in storage. */
  readonly bitmapKey: string = "median-filter";

  /** Initializes the component and loads the bitmap from storage if available. 
   * @param bitmapStorage Service for loading and saving bitmap images.
  */
  constructor(private bitmapStorage: BitmapStorageService) { 
    let bitmap = this.bitmapStorage.load(this.bitmapKey);
    if (bitmap) this.load(bitmap);
    this.refresh();
  }
  
  /** Loads a bitmap into the component and initializes the bitmap.
   * @param bitmap The bitmap image to load.
  */
  load(bitmap: Bitmap): void { 
    this.bitmap = new InteractiveBitmap(bitmap.width, bitmap.height, bitmap, 255);
  }
  /** Refreshes the applied bitmap by reapplying the median filter and resets the animation. */
  refresh(): void {
    this.appliedBitmap = new InteractiveBitmap(this.bitmap.width, this.bitmap.height, undefined, 255);
    this.applyMedian(this.bitmap, this.appliedBitmap); 
    this.animate();
    this.tick++;
  }
  /** Advances the animation by processing the next pixel and updating the selection. */
  animate(): void {
    const index = this.animationIndex;
    const cell = this.bitmap.getIndexCell(index);
    const r = Math.trunc((this.windowSize - 1) / 2);


    this.bitmap.clearSelection();
    this.sourceKernel = this.getSourceKernel(cell);
    this.resultBitmap = new InteractiveBitmap(this.bitmap.width, this.bitmap.height, this.showBase?this.bitmap:undefined, 255);
    this.setValues(index+1, this.resultBitmap, this.appliedBitmap);


    if (index < this.bitmap.length()) {
      for (let ox = -r; ox <= r; ox++)
        for (let oy = -r; oy <= r; oy++)
          this.bitmap.select(cell.add(new Point(ox, oy)));
      this.resultBitmap.select(cell);
    }
    this.bitmap.dragArea.dragStart = cell;
    this.bitmap.dragArea.dragEnd = cell;
    this.bitmap.dragArea.dragging = true;


    this.tick++;
  }

  /** Generates a LaTeX representation of the median filter operation for display. */
  getEquation(): string {
    const values = this.sourceKernel.values().sort((a, b) => a - b);
    const h = Math.floor(values.length / 2);

    const maxLength = 21;
    let latexArray: string;

    if (values.length <= maxLength) {
      latexArray = values
        .map((v, i) => (i === h ? `\\boxed{${v}}` : `${v}`))
        .join(' & ');
    } 
    else {
      const n = Math.floor(maxLength / 2);
      const s = 3;

      const start = values.slice(0, s);
      const end = values.slice(values.length - s);
      const leftmid = values.slice(h-(n-s), h);
      const rigtmid = values.slice(h+1, h+1+(n-s));
      
      latexArray = `${start.join(" & ")} & \\dots & ${leftmid.join(" & ")} & \\boxed{${values[h]}} & ${rigtmid.join(" & ")} & \\dots & ${end.join(" & ")}`;
    }

    return `
      \\[
      ${this.sourceKernel.toLatex()} 
      \\\longrightarrow 
      \\begin{bmatrix} ${latexArray} \\end{bmatrix}
      \\\longrightarrow 
      ${this.median(values)}
      \\]
    `;
  }

  /** Handles cell click events to update the animation index and refresh the animation.
   * @param $event The event containing the clicked cell and mouse event details.
   * @param click Unused.
  */
  onCellClicked($event: { cell: Point; event: MouseEvent; }, click: boolean = true) {
    if(this.bitmap.isOut($event.cell)) return;
    if($event.event.buttons === 1) {
      this.animationIndex = this.bitmap.getCellIndex($event.cell);
      this.animate();
    }
  }


  /** Retrieves the kernel of pixel values centered around a given cell.
   * @param cell The center cell for which to retrieve the kernel.
   * @returns A Kernel instance containing the pixel values in the neighborhood.
  */
  private getSourceKernel(cell: Point): Kernel {
    let kernel = new Kernel(this.windowSize);
    const r = Math.trunc((this.windowSize - 1) / 2);

    for (let oy = -r; oy <= r; oy++)
      for (let ox = -r; ox <= r; ox++) {
        const offset = new Point(oy, ox);
        let value = this.bitmap.getWithPadding(cell.add(offset), this.padding);
        kernel.kernel[ox + r][oy + r] = value;
      }
    
    return kernel;
  }
  /** Applies the median filter to the source bitmap and stores the result in the destination bitmap.
   * @param srcBitmap The source bitmap to which the median filter is applied.
   * @param dstBitmap The destination bitmap where the filtered result is stored.
  */
  private applyMedian(srcBitmap: Bitmap, dstBitmap: Bitmap): void{
    srcBitmap.pixels().forEach(p=>{
      const result = this.median(this.getSourceKernel(p.cell).values());
      dstBitmap.set(p.cell, result);
    });
  }
  /** Calculates the median value from an array of numbers.
   * @param arr The array of numbers from which to calculate the median.
   * @returns The median value.
  */
  private median(arr: number[]): number {
    const mid = Math.floor(arr.length / 2);
    return arr.sort((a, b) => a - b)[mid];
  }
  /** Sets pixel values from the source bitmap to the destination bitmap up to a specified length.
   * @param length The number of pixels to set.
   * @param destination The destination bitmap where the pixel values are set.
   * @param source The source bitmap from which the pixel values are taken.
  */
  private setValues(length: number, destination: InteractiveBitmap, source: InteractiveBitmap): void {
    for (let i = 0; i < length; i++) {
      const cell = source.getIndexCell(i);
      if (destination.isOut(cell) || source.isOut(cell)) 
        continue;
      let value = source.get(cell)!;
      destination.set(cell, value);
    }
  }
}
