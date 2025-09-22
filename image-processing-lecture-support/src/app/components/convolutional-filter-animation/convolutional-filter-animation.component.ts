import { Component} from '@angular/core';
import { BitmapComponent } from '../bitmap/bitmap.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { RouterModule } from '@angular/router';
import { AnimationControllerComponent } from '../animation-controller/animation-controller.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { InteractiveBitmap } from '../../static/bitmap';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { KernelDialogComponent } from '../dialogs/kernel-dialog/kernel-dialog.component';
import { BitmapStorageService } from '../../services/bitmap-storage/bitmap-storage.service';
import { Kernel } from '../../static/kernel';
import { ColorScale, OutOfRangeHandling, Padding, QuantizationMode } from '../../static/enums';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Point } from '../../static/point';
import { MatrixDisplayComponent } from "../matrix-display/matrix-display.component";
import { MathjaxModule } from 'mathjax-angular';
import { MatSelectModule } from '@angular/material/select';

/** Component to visualize and animate the application of a convolutional filter on a bitmap image.
 * It allows users to see how the convolutional filter processes each pixel in the image step-by-step.
 */
@Component({
  selector: 'app-convolutional-filter-animation',
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
],
  templateUrl: './convolutional-filter-animation.component.html',
  styleUrl: './convolutional-filter-animation.component.css'
})
export class ConvolutionalFilterAnimationComponent {
  /** The original bitmap image to which the convolutional filter is applied. */
  bitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);
  /** The bitmap image after applying the convolutional filter. */
  filteredBitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);
  /** The result bitmap after the animation. */
  resultBitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);


  /** Used to trigger re-rendering of the bitmap component when the bitmap changes. */
  tick: number = 0;
  /** Key used to load and save the bitmap in storage. */
  readonly bitmapKey: string = "convolutional-filter";

  /** The convolutional kernel used for filtering. */
  kernel: Kernel = new Kernel(3);
  /** The kernel representing the current neighborhood of pixels being processed. */
  sourceKernel: Kernel = new Kernel(3);
  /** The kernel representing the weighted values used to compute the filtered pixel value. */
  resultKernel: Kernel = new Kernel(3);
  /** Padding strategy used when accessing pixels outside the bitmap boundaries. */
  padding: Padding = Padding.Edge;


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
  /** Current index of the pixel being processed in the animation. */
  animationIndex: number = 0;

  /** Constructor to initialize the component with necessary services and load initial data. 
   * @param dialog Service to manage dialog interactions.
   * @param bitmapStorage Service to load and save bitmaps in storage.
  */
  constructor(private dialog: MatDialog, private bitmapStorage: BitmapStorageService) { 
    let bitmap = this.bitmapStorage.load(this.bitmapKey);
    if (bitmap)
      this.bitmap = new InteractiveBitmap(bitmap.width, bitmap.height, bitmap, 255);
    else
      this.bitmapStorage.save(this.bitmapKey, this.bitmap);
    
    this.kernel.load("kernel");
    this.refresh();
  }

  /** Opens a dialog to edit the convolutional kernel. */
  openDialog(): void {
    const dialogRef = this.dialog.open(KernelDialogComponent, {
      width: '650px',
      disableClose: true,
      // hasBackdrop: false,
      data: this.kernel.clone()
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.kernel = result;
        this.sourceKernel = new Kernel(result.size);
        this.resultKernel = new Kernel(result.size);
        this.kernel.save("kernel");
        this.refresh();
      }
    });
  }
  
  /** Refreshes the filtered and result bitmaps by reapplying the convolutional filter and resets the animation. */
  refresh(): void {
    this.resultBitmap = new InteractiveBitmap(this.bitmap.width, this.bitmap.height, this.bitmap, 255);
    this.filteredBitmap = new InteractiveBitmap(this.bitmap.width, this.bitmap.height, undefined, 255);
    this.applyFilter(this.bitmap.length(), this.filteredBitmap, this.bitmap);
    this.animate();
  }

  /** Advances the animation by processing the next pixel and updating the selection. */
  animate(): void {
    const index = this.animationIndex;
    this.bitmap.clearSelection();
    this.resultBitmap = new InteractiveBitmap(this.bitmap.width, this.bitmap.height, this.showBase?this.bitmap:undefined, 255);
    this.setValues(index+1, this.resultBitmap, this.filteredBitmap);
    

    this.sourceKernel = this.getSourceKernel()
    this.resultKernel = this.getResultKernel();

    const size = this.kernel.size;
    const r = Math.trunc((size - 1) / 2);
    const cell = this.bitmap.getIndexCell(index);

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

  /** Handles cell click events to jump to a specific pixel in the animation.
   * @param $event The event containing the clicked cell and mouse event details.
   * @param click unused.
   */
  onCellClicked($event: { cell: Point; event: MouseEvent; }, click: boolean = true): void {
    if(this.bitmap.isOut($event.cell)) return;
    if($event.event.buttons === 1) {
      this.animationIndex = this.bitmap.getCellIndex($event.cell);
      this.animate();
    }
  }
  /** Generates a LaTeX representation of the convolution operation for display. */
  getEquation(): string {
    const divider = this.kernel.divider;
    return `\\[
      ${this.sourceKernel.toLatex()}
      \\cdot
      ${divider<0 ? '-' : ''}\\frac{1}{${Math.abs(divider)}}
      ${this.kernel.toLatex()}
      =
      ${this.filteredBitmap.get(this.bitmap.getIndexCell(this.animationIndex))}
      \\]`;
  }
  /** Applies the convolutional filter to the source bitmap and stores the result in the destination bitmap.
   * @param length The number of pixels to process.
   * @param destination The destination bitmap where the filtered result is stored.
   * @param source The source bitmap to which the convolutional filter is applied.
  */
  private applyFilter(length: number, destination: InteractiveBitmap, source: InteractiveBitmap): void {
    for (let i = 0; i < length; i++) {
      const cell = source.getIndexCell(i);
      if (destination.isOut(cell) || source.isOut(cell)) 
        continue;
      let kernelValue = this.kernel.apply(source, cell, QuantizationMode.Round, OutOfRangeHandling.Clipping, this.padding);
      destination.set(cell, kernelValue);
    }
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
  /** Retrieves the kernel of pixel values centered around the current animation index.
   * @returns A Kernel instance containing the pixel values in the neighborhood.
  */
  private getSourceKernel(): Kernel {
    let kernel = new Kernel(this.kernel.size);
    const r = Math.trunc((this.kernel.size - 1) / 2);
    for (let oy = -r; oy <= r; oy++)
      for (let ox = -r; ox <= r; ox++) {
        const point = this.bitmap.getIndexCell(this.animationIndex);
        const offset = point.add(new Point(oy, ox));

        let value = this.bitmap.getWithPadding(offset, this.padding);
        kernel.kernel[ox + r][oy + r] = value;
      }
    return kernel;
  }
  /** Computes the result kernel by multiplying the convolutional kernel with the source kernel.
   * @returns A Kernel instance containing the weighted values used to compute the filtered pixel value.
  */
  private getResultKernel(): Kernel {
    let kernel = new Kernel(this.kernel.size);
    const r = Math.trunc((this.kernel.size - 1) / 2);
    for (let oy = -r; oy <= r; oy++)
      for (let ox = -r; ox <= r; ox++)
        kernel.kernel[oy + r][ox + r] = this.kernel.kernel[oy + r][ox + r] * this.sourceKernel.kernel[oy + r][ox + r];
    return kernel;
  }
}
