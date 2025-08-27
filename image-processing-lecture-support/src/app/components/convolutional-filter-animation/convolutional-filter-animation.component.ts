import { Component, OnInit } from '@angular/core';
import { BitmapComponent } from '../bitmap/bitmap.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlider, MatSliderModule } from '@angular/material/slider';
import { RouterModule } from '@angular/router';
import { AnimationControllerComponent } from '../animation-controller/animation-controller.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { InteractiveBitmap } from '../../static/bitmap';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { KernelDialogComponent } from '../dialogs/kernel-dialog/kernel-dialog.component';
import { ThemeService } from '../../services/theme/theme.service';
import { tick } from '@angular/core/testing';
import { BitmapStorageService } from '../../services/bitmap-storage/bitmap-storage.service';
import { Kernel } from '../../static/kernel';
import { OutOfBoundsHandling, OutOfRangeHandling, QuantizationMode } from '../../static/enums';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbar } from "@angular/material/toolbar";
import { Point } from '../../static/point';
import { MatrixDisplayComponent } from "../matrix-display/matrix-display.component";

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
    MatrixDisplayComponent
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

  pixelSize: number = 40;
  showGrid: boolean = true;
  showHeaders: boolean = true;
  showNumberValues: boolean = true;



  constructor(private dialog: MatDialog, private bitmapStorage: BitmapStorageService) { }

  ngOnInit(): void {
    let bitmap = this.bitmapStorage.load(this.bitmapKey);
    if (bitmap !== null)
      this.bitmap = new InteractiveBitmap(bitmap.getWidth(), bitmap.getHeight(), bitmap, 255);
    else
      this.bitmapStorage.save(this.bitmapKey, this.bitmap);


    let kernel = Kernel.tryLoad(localStorage.getItem("kernel"));
    if (kernel !== null)
      this.kernel = kernel;
    else
      localStorage.setItem("kernel", this.kernel.save());


    this.resultBitmap = new InteractiveBitmap(this.bitmap.getWidth(), this.bitmap.getHeight(), this.bitmap, 255);
    // this.filteredBitmap = new InteractiveBitmap(this.bitmap.getWidth(), this.bitmap.getHeight(), this.bitmap, 255);
    this.resultBitmap = new InteractiveBitmap(this.bitmap.getWidth(), this.bitmap.getHeight(), undefined, 255);
    this.filteredBitmap = new InteractiveBitmap(this.bitmap.getWidth(), this.bitmap.getHeight(), undefined, 255);
    this.applayFilter(this.length(), this.filteredBitmap, this.bitmap);
  }


  openDialog() {
    const dialogRef = this.dialog.open(KernelDialogComponent, {
      width: '650px',
      disableClose: true,
      data: this.kernel
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.kernel = result;
        this.sourceKernel = new Kernel(result.size);
        this.resultKernel = new Kernel(result.size);
        localStorage.setItem("kernel", this.kernel.save());
        
        this.clearResult();
        this.applayFilter(this.length(), this.filteredBitmap, this.bitmap);
      }
    });
  }


  animate(index: number) {
    this.bitmap.clearSelection();
    this.clearResult();


    this.sourceKernel = this.getSourceKernel(index)
    this.resultKernel = this.getResultKernel();

    const size = this.kernel.size;
    const r = Math.trunc((size - 1) / 2);
    const { row: x, col: y } = this.getPoint(index);

    if (index < this.length()) {

      for (let ox = -r; ox <= r; ox++)
        for (let oy = -r; oy <= r; oy++)
          this.bitmap.select(x + oy, y + ox);
      this.resultBitmap.select(x, y);
    }

    this.setValues(index+1, this.resultBitmap, this.filteredBitmap);

    this.bitmapTick++;
  }
  
  
  length() {
    return this.bitmap.getWidth() * this.bitmap.getHeight();
  }


  getPoint(index: number): Point {
    const x = Math.trunc(index / this.bitmap.getWidth());
    const y = index % this.bitmap.getWidth();
    return new Point(x, y);
  }


  clearResult() {
    // this.resultBitmap = new InteractiveBitmap(this.bitmap.getWidth(), this.bitmap.getHeight(), this.bitmap, 255);
    this.resultBitmap = new InteractiveBitmap(this.bitmap.getWidth(), this.bitmap.getHeight(), undefined, 255);
  }


  applayFilter(length: number, destination: InteractiveBitmap, source: InteractiveBitmap) {
    for (let i = 0; i < length; i++) {
      const { row: x, col: y } = this.getPoint(i);
      if (destination.isOut(x, y) || source.isOut(x, y)) 
        continue;
      let kernelValue = this.kernel.apply(source, x, y, QuantizationMode.Round, OutOfRangeHandling.Clipping, OutOfBoundsHandling.DefaultValue);
      destination.set(x, y, kernelValue);
    }
  }

  setValues(length: number, destination: InteractiveBitmap, source: InteractiveBitmap) {
    for (let i = 0; i < length; i++) {
      const { row: x, col: y } = this.getPoint(i);
      if (destination.isOut(x, y) || source.isOut(x, y)) 
        continue;
      let value = source.get(x, y);
      destination.set(x, y, value);
    }
  }


  getSourceKernel(index: number): Kernel {
    let kernel = new Kernel(this.kernel.size);
    const r = Math.trunc((this.kernel.size - 1) / 2);
    for (let oy = -r; oy <= r; oy++)
      for (let ox = -r; ox <= r; ox++) {
        const { row: x, col: y } = this.getPoint(index);
        if (this.bitmap.isOut(x + ox, y + oy)) 
          continue;
        let value = this.bitmap.get(x + ox, y + oy);
        kernel.kernel[ox + r][oy + r] = value;
      }
    return kernel;
  }

  getResultKernel(): Kernel {
    let kernel = new Kernel(this.kernel.size);
    const r = Math.trunc((this.kernel.size - 1) / 2);
    for (let oy = -r; oy <= r; oy++)
      for (let ox = -r; ox <= r; ox++)
        kernel.kernel[oy + r][ox + r] = this.kernel.kernel[oy + r][ox + r] * this.sourceKernel.kernel[oy + r][ox + r];
    return kernel;
  }
}
