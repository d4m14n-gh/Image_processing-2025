import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { RouterModule } from '@angular/router';
import { BitmapComponent } from '../bitmap/bitmap.component';
import { AnimationControllerComponent } from '../animation-controller/animation-controller.component';
import { Bitmap, InteractiveBitmap } from '../../static/bitmap';
import { getVar } from '../../static/style-utils';
import { ColorScale } from '../../static/enums';
import { BitmapStorageService } from '../../services/bitmap-storage/bitmap-storage.service';
import { Point } from '../../static/point';
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, Tooltip, Legend } from 'chart.js';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';


@Component({
  selector: 'app-hough-transform-animation',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSliderModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    RouterModule,
    MatCardModule,
    BitmapComponent,
    AnimationControllerComponent,
    MatTabsModule
  ],
  templateUrl: './hough-transform-animation.component.html',
  styleUrl: './hough-transform-animation.component.css'
})
export class HoughTransformAnimationComponent implements AfterViewInit {
  bitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);
  resultBitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);
  bitmapTick: number = 0;
  bitmapKey: string = 'hough-transform';


  pixelSize: number = 40;
  limit: number = 5;
  threshold: number = 5;
  showGrid: boolean = true;
  tabIndex: number = 0;
  showHeaders: boolean = true;
  selectionColor: string = getVar("--selection-color");

  animationIndex: number = 0;
  readonly colorscale: ColorScale = ColorScale.Binary;
  private chart?: Chart; 
  

  constructor(private bitmapStorage: BitmapStorageService) { 
    let bitmap = this.bitmapStorage.load(this.bitmapKey);
    if (bitmap)
      this.bitmap = new InteractiveBitmap(bitmap.width, bitmap.height, bitmap, 255);

    this.refresh();
  }
  ngAfterViewInit(): void {
    const width = this.bitmap.width;
    const height = this.bitmap.height;
    
    Chart.register(LineController, LineElement, PointElement, LinearScale, Title, Tooltip, Legend);
    const canvas: HTMLCanvasElement = document.getElementById('bitmapChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: []
      },
      options: {
        responsive: false,
        devicePixelRatio: 2,
        maintainAspectRatio: false,
        layout: {

          padding: 0
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        },
        animation: false,
        scales: {
          x: {
            display: false,
            // grid: { display: true },
            type: 'linear',
            min: 0,
            max: width,
            title: { display: true, text: 'X' }
          },
          y: {
            display: false,
            type: 'linear',
            min: 0,
            max: height, 
            title: { display: true, text: 'Y' }
          }
        }
      }
    });
    this.refresh();
  
  }

  refresh() {
    // this.resultBitmap = new InteractiveBitmap(this.bitmap.width, this.bitmap.height, this.bitmap, 255);
    
    if(this.chart){
      this.chart.data.datasets = [];
      const width = this.bitmap.width;
      const height = this.bitmap.height;
    
      const lines = this.transform(this.resultBitmap).slice(0, this.limit);
      for(let line of lines) {
        let p1 = this.linePoint(line.min.col, line.rho, line.theta*Math.PI/180);
        let p2 = this.linePoint(line.max.col, line.rho, line.theta*Math.PI/180);
        if(line.min.col == line.max.col){
          p1 = new Point(line.min.row, line.rho);
          p2 = new Point(line.max.row, line.rho);
        }
        // const points = this.toLine(line.rho, line.theta);
        const dataPoints = [
          { x: p1.col, y: p1.row },
          { x: p2.col, y: p2.row }
        ];
        const flippedData = dataPoints.map(p => ({ x: p.x + 0.5, y: height - p.y - 0.5 }));
        this.chart.data.datasets.push(
          {
            label: `line theta: ${line.theta} rho: ${line.rho} votes: ${line.votes}`,
            data: flippedData,
            borderColor: getVar("--selection-color"),
            // tension: 0 ,
            pointRadius: 0,
            clip: false
          }
        );
      }
      // this.chart.resize(this.getCanvasWidth()*2, this.getCanvasHeight()*2);
      this.chart.update();
      }
    
    // this.animate();
  }

  animate() {
    let cell = this.bitmap.getIndexCell(this.animationIndex);


    this.resultBitmap = new InteractiveBitmap(this.bitmap.width, this.bitmap.height, undefined, 255);
    this.bitmap.pixels().filter(p=>p.value===0&&this.bitmap.getCellIndex(p.cell)<=this.animationIndex).forEach(p => this.resultBitmap.set(p.cell, 0));
    this.refresh();

    this.bitmap.clearSelection(); 
    this.resultBitmap.clearSelection(); 
    
    this.bitmap.highlightedElement = null;
    this.selectionColor = getVar("--selection-color");
    
    
   
    this.bitmap.select(cell);
    this.resultBitmap.select(cell);

    this.bitmapTick++;
  }

  transform(bitmap: Bitmap): Line[] {
    const thetaStep = 15;
    const thetas: number[] = [];
    const width = bitmap.width;
    const height = bitmap.height;

    //thetas
    for (let t = 0; t < 180; t += thetaStep)
      thetas.push((t * Math.PI) / 180);
    

    // rhos
    const diagLen = Math.ceil(Math.sqrt(width * width + height * height));
    const rhos: number[] = [];
    for (let r = -diagLen; r <= diagLen; r++)
      rhos.push(r);



    // akumulator [rho][theta]
    const accumulator: number[][] = Array.from({ length: rhos.length }, () =>
      Array(thetas.length).fill(0)
    );
    const min: Point[][] = Array.from({ length: rhos.length }, () =>
      Array(thetas.length).fill(new Point(height, width))
    );
    const max: Point[][] = Array.from({ length: rhos.length }, () =>
      Array(thetas.length).fill(Point.zero)
    );


    bitmap.cells().forEach(p => {
      if (bitmap.getBinary(p)) {

        thetas.forEach((theta, tIdx) => {
          const rho = Math.round(p.col * Math.cos(theta) + p.row * Math.sin(theta));
          const rIdx = rho + diagLen;
          min[rIdx][tIdx] = min[rIdx][tIdx].min(p);
          max[rIdx][tIdx] = max[rIdx][tIdx].max(p);
          // if(min[rIdx][tIdx].col>p.col)
          //   min[rIdx][tIdx].col = p.col;
          // if(max[rIdx][tIdx].col<p.col)
          //   max[rIdx][tIdx].col = p.col;

          accumulator[rIdx][tIdx]++;
        });

      }
    });

    const threshold = this.threshold;
    const lines: Line[] = [];

    for (let r = 0; r < rhos.length; r++) {
      for (let t = 0; t < thetas.length; t++) {
        const votes = accumulator[r][t];
        if (votes >= threshold) {
          lines.push(new Line(
            rhos[r],
            thetas[t]*180/Math.PI,
            votes,
            min[r][t],
            max[r][t]
          ));
        }
      }
    }

    lines.sort((a, b) => b.votes - a.votes);
    return lines;
  }

  //helpers
  getCanvasHeight(): number {
    return this.bitmap.height * this.pixelSize;// + (this.showHeaders ? 30 : 0);
  }
  getCanvasWidth(): number {
    return this.bitmap.width * this.pixelSize;// + (this.showHeaders ? 30 : 0);
  }
  linePoint(x: number, rho: number, thetaRad: number): Point {
    return new Point((rho-x*Math.cos(thetaRad))/Math.sin(thetaRad), x);
  }

  setValues(length: number, destination: Bitmap, source: Bitmap) {
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


class Line {
    constructor(public rho: number, public theta: number, public votes: number, public min: Point, public max: Point){ }
}