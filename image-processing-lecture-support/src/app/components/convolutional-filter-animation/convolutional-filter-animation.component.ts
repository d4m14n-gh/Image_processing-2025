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
import { OutOfRangeHandling, QuantizationMode } from '../../static/enums';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatToolbar } from "@angular/material/toolbar";

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
],
  templateUrl: './convolutional-filter-animation.component.html',
  styleUrl: './convolutional-filter-animation.component.css'
})

export class ConvolutionalFilterAnimationComponent{
  bitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);
  resultBitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);
  bitmapTick: number = 0;
  bitmapKey: string = "convolutional-filter";
  kernel: Kernel = new Kernel(3);

  pixelSize: number = 40;
  showGrid: boolean = true;
  showHeaders: boolean = true;
  showNumberValues: boolean = true;



  constructor(private dialog: MatDialog, private bitmapStorage: BitmapStorageService) {}

  ngOnInit(): void {
    let bitmap = this.bitmapStorage.load(this.bitmapKey);
    if(bitmap !== null)
      this.bitmap = new InteractiveBitmap(bitmap.getWidth(), bitmap.getHeight(), bitmap, 255);
    else
      this.bitmapStorage.save(this.bitmapKey, this.bitmap);


    let kernel = Kernel.tryLoad(localStorage.getItem("kernel"));
    if(kernel !== null)
      this.kernel = kernel;    
    else
      localStorage.setItem("kernel", this.kernel.save());
  }
  openDialog() {
    const dialogRef = this.dialog.open(KernelDialogComponent, {
      width: '550px',
      disableClose: true, 
      data: this.kernel
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Wynik dialogu:', result);
      if(result){
        this.kernel = result;
        localStorage.setItem("kernel", this.kernel.save());
      }
    });
  }

  animate(value: number) {
    this.bitmap.clearSelection();
    this.resultBitmap.clearSelection();
    
    if(value < 0 ) {
      this.clear();
      return;
    }
    else if(value >= this.length()) {
      this.bitmapTick++;
      return;
    }
    
    const size = 3;
    const r = Math.trunc((size-1)/2);
    const x = Math.trunc(value / this.bitmap.getWidth());
    const y = value % this.bitmap.getWidth();

    for(let ox=-r;ox<=r;ox++) 
      for(let oy=-r;oy<=r;oy++) 
        this.bitmap.select(x + oy, y + ox);
    this.resultBitmap.select(x, y);

    let kernelValue = this.kernel.apply(this.bitmap, x, y, QuantizationMode.Round, OutOfRangeHandling.Saturation);
    this.resultBitmap.set(x, y, kernelValue);
    this.bitmapTick++;
  }
  length() {
    return this.bitmap.getWidth() * this.bitmap.getHeight();
  }
  clear() {
    this.resultBitmap.cells().forEach(cell => this.resultBitmap.set(cell.row, cell.col, 255));
    this.bitmapTick++;
  }
}
