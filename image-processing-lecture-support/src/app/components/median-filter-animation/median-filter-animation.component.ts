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
  bitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);
  appliedBitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);
  resultBitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);

  padding: Padding = Padding.Edge;
  sourceKernel: Kernel = new Kernel(3);
  windowSize: number = 3;
  
  
  //view
  pixelSize: number = 40;
  showGrid: boolean = true;
  showHeaders: boolean = true;
  showNumberValues: boolean = true;
  showBase: boolean = false;
  selectedColorScale: ColorScale = ColorScale.Grayscale;
  
  
  //controls
  bitmapTick: number = 0;
  animationIndex: number = 0;
  bitmapKey: string = "median-filter";

  constructor(private bitmapStorage: BitmapStorageService) { 
    let bitmap = this.bitmapStorage.load(this.bitmapKey);
    if (bitmap) this.load(bitmap);
    this.refresh();
  }
  
  load(bitmap: Bitmap) { 
    this.bitmap = new InteractiveBitmap(bitmap.width, bitmap.height, bitmap, 255);
  }
  refresh() {
    this.appliedBitmap = new InteractiveBitmap(this.bitmap.width, this.bitmap.height, undefined, 255);
    this.applyMedian(this.bitmap, this.appliedBitmap); 
    this.animate();
    this.bitmapTick++;
  }
  animate() {
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


    this.bitmapTick++;
  }

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


    // const startStr = start.map((v, i) => (i === midIndex ? `\\boxed{${v}}` : `${v}`)).join(' & ');
    // const endStr = end.map((v, i) => (i + n === midIndex ? `\\boxed{${v}}` : `${v}`)).join(' & ');
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


  onCellClicked($event: { cell: Point; event: MouseEvent; }, click: boolean = true) {
    if(this.bitmap.isOut($event.cell)) return;
    if($event.event.buttons === 1) {
      this.animationIndex = this.bitmap.getCellIndex($event.cell);
      this.animate();
    }
  }



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
  private applyMedian(srcBitmap: Bitmap, dstBitmap: Bitmap){
    srcBitmap.pixels().forEach(p=>{
      const result = this.median(this.getSourceKernel(p.cell).values());
      dstBitmap.set(p.cell, result);
    });
  }
  private median(arr: number[]): number {
    const mid = Math.floor(arr.length / 2);
    return arr.sort((a, b) => a - b)[mid];
  }
  private  setValues(length: number, destination: InteractiveBitmap, source: InteractiveBitmap) {
    for (let i = 0; i < length; i++) {
      const cell = source.getIndexCell(i);
      if (destination.isOut(cell) || source.isOut(cell)) 
        continue;
      let value = source.get(cell)!;
      destination.set(cell, value);
    }
  }
}
