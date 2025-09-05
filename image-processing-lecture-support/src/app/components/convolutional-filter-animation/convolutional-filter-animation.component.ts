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

@Component({
  selector: 'app-convolutional-filter-animation',
  imports: [
    // BitmapComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    RouterModule,
    // MatSlider,
    // AnimationControllerComponent,
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
  bitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);
  filteredBitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);
  resultBitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);

  bitmapTick: number = 0;
  bitmapKey: string = "convolutional-filter";

  kernel: Kernel = new Kernel(3);
  sourceKernel: Kernel = new Kernel(3);
  resultKernel: Kernel = new Kernel(3);
  padding: Padding = Padding.Edge;


  //view
  pixelSize: number = 40;
  showGrid: boolean = true;
  showHeaders: boolean = true;
  showNumberValues: boolean = true;
  showBase: boolean = false;
  selectedColorScale: ColorScale = ColorScale.Grayscale;
  
  
  //controls
  animationIndex: number = 0;


  constructor(private dialog: MatDialog, private bitmapStorage: BitmapStorageService) { 
    let bitmap = this.bitmapStorage.load(this.bitmapKey);
    if (bitmap)
      this.bitmap = new InteractiveBitmap(bitmap.width, bitmap.height, bitmap, 255);
    else
      this.bitmapStorage.save(this.bitmapKey, this.bitmap);
    
    this.kernel.load("kernel");
    this.refresh();
  }

  openDialog() {
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
  
  refresh(){
    this.resultBitmap = new InteractiveBitmap(this.bitmap.width, this.bitmap.height, this.bitmap, 255);
    this.filteredBitmap = new InteractiveBitmap(this.bitmap.width, this.bitmap.height, undefined, 255);
    this.applyFilter(this.bitmap.length(), this.filteredBitmap, this.bitmap);
    this.animate();
  }

  animate() {
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


    this.bitmapTick++;
  }
  
  
  length() {
    return this.bitmap.length;
  }
  onCellClicked($event: { cell: Point; event: MouseEvent; }, click: boolean = true) {
    if(this.bitmap.isOut($event.cell)) return;
    if($event.event.buttons === 1) {
      this.animationIndex = this.bitmap.getCellIndex($event.cell);
      this.animate();
    }
  }
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

  private applyFilter(length: number, destination: InteractiveBitmap, source: InteractiveBitmap) {
    for (let i = 0; i < length; i++) {
      const cell = source.getIndexCell(i);
      if (destination.isOut(cell) || source.isOut(cell)) 
        continue;
      let kernelValue = this.kernel.apply(source, cell, QuantizationMode.Round, OutOfRangeHandling.Clipping, this.padding);
      destination.set(cell, kernelValue);
    }
  }
  private setValues(length: number, destination: InteractiveBitmap, source: InteractiveBitmap) {
    for (let i = 0; i < length; i++) {
      const cell = source.getIndexCell(i);
      if (destination.isOut(cell) || source.isOut(cell)) 
        continue;
      let value = source.get(cell)!;
      destination.set(cell, value);
    }
  }
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
  private getResultKernel(): Kernel {
    let kernel = new Kernel(this.kernel.size);
    const r = Math.trunc((this.kernel.size - 1) / 2);
    for (let oy = -r; oy <= r; oy++)
      for (let ox = -r; ox <= r; ox++)
        kernel.kernel[oy + r][ox + r] = this.kernel.kernel[oy + r][ox + r] * this.sourceKernel.kernel[oy + r][ox + r];
    return kernel;
  }
}
