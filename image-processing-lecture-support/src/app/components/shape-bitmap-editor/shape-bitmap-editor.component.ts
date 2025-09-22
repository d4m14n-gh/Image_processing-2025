import { AfterViewInit, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { getVar } from '../../static/style-utils';
import { MatIconModule } from '@angular/material/icon';
import { AnimationControllerComponent } from '../animation-controller/animation-controller.component';
import cvReadyPromise from '@techstark/opencv-js';

@Component({
  selector: 'app-shape-bitmap-editor',
  imports: [
    MatCardModule,
    MatIconModule,
    AnimationControllerComponent
  ],
  templateUrl: './shape-bitmap-editor.component.html',
  styleUrl: './shape-bitmap-editor.component.css'
})
export class ShapeBitmapEditorComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  readonly width = 1050;
  readonly height = 750;
  // readonly eps = 0.01;
  readonly eps = 0.79;

  animationIndex = 0;
  animationElements: MATAnimationElement[] = [];

  private _borderPoints: [number, number][] = [];
  private _dist: number[][] = [];
  private _medial: [number, number, number][] = [];
  private _frameId: number = 0;
  private _medialPointsVisited = new Set<string>();
  private _medialPointsBfsQueue: [number, number, number][] = [];


  constructor(private ngZone: NgZone) { }

  drawStartShape(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const padding = 50;
    canvas.width = this.width;
    canvas.height = this.height;
    ctx.imageSmoothingEnabled = false;
    // ctx.fillStyle = getVar('--mat-sys-primary');
    ctx.fillStyle = "#162d59";
    // ctx.beginPath();
    // ctx.ellipse(200, 200, 120, 80, 0, 0, Math.PI * 2);
    // ctx.fill();
    // ctx.closePath();

    // ctx.beginPath();
    // ctx.ellipse(280, 280, 120, 80, 0, 0, Math.PI * 2);
    // ctx.fill();
    // ctx.closePath();

    // ctx.beginPath();
    // ctx.ellipse(290, 150, 120, 80, 0, 0, Math.PI * 2);
    // ctx.fill();
    // ctx.closePath();


    // ctx.beginPath();
    // ctx.ellipse(120, 150, 120, 80, 0, 0, Math.PI * 2);
    // ctx.fill();
    // ctx.closePath();

    ctx.fillRect(padding, padding, this.width - 2 * padding - 1, this.height - 2 * padding - 1);
    // ctx.fillRect(10, 150, 501, 601);
    // ctx.fillRect(350, 250, 401, 201);
  }
  drawMedialAxis(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = getVar('--mat-sys-on-primary');
    ctx.fillStyle = "#fcf8f9";
    for (const [x, y] of this._medial)
      ctx.fillRect(x, y, 1, 1);
  }
  getHash(x: number, y: number): string {
    return `${Math.trunc(x)},${Math.trunc(y)}`;
  }
  calculateMATAnimationElements(): void {
    const medialLength = this._medial.length;


    while (this.animationElements.length < medialLength) {
      if (this._medialPointsBfsQueue.length === 0) {
        for (const p of this._medial)
          if (!this._medialPointsVisited.has(this.getHash(p[0], p[1]))) {
            this._medialPointsBfsQueue.push(p);
            break;
          }
      }
      if (this._medialPointsBfsQueue.length === 0) break;


      const [x, y, r] = this._medialPointsBfsQueue.pop()!;
      this._medialPointsVisited.add(this.getHash(x, y));
      let element: MATAnimationElement = new MATAnimationElement(x, y, r, []);
      for (const bp of this._borderPoints) {
        const dx = bp[0] - x;
        const dy = bp[1] - y;
        const dist = Math.sqrt(dx * dx + dy * dy)+1;
        if (dist-r<0.0001)
          element.borderPoints.push(bp);
      }
      this.animationElements.push(element);

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          if (this._medialPointsVisited.has(this.getHash(x + dc, y + dr))) continue;
          const index = this._medial.map(p => this.getHash(p[0], p[1])).indexOf(this.getHash(x + dc, y + dr));
          if (index === -1) continue;
          this._medialPointsBfsQueue.push([x + dc, y + dr, this._medial[index][2]]);
        }
      }
    }
  }

  drawAnimationElement(index: number): void {
    if (index < 0 || index >= this.animationElements.length) return;
    const element = this.animationElements[index];
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;



    ctx.fillStyle = "rgba(0,255,0,0.125)";
    ctx.strokeStyle = "rgba(0,255,0,0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(element.x, element.y, element.r, element.r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    const rP = 3;
    ctx.fillStyle = "rgba(0,255,0,1)";
    ctx.beginPath();
    ctx.ellipse(element.x, element.y, rP, rP, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = "rgba(235, 32, 32, 1)";
    for (const bp of element.borderPoints) {
      ctx.beginPath();
      ctx.ellipse(bp[0], bp[1], rP, rP, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
    }
  }

  drawCircle() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;



    if (this._medialPointsBfsQueue.length === 0) {
      for (const p of this._medial)
        if (!this._medialPointsVisited.has(this.getHash(p[0], p[1]))) {
          this._medialPointsBfsQueue.push(p);
          break;
        }
    }
    if (this._medialPointsBfsQueue.length === 0) return;



    const [x, y, r] = this._medialPointsBfsQueue.pop()!;
    this._medialPointsVisited.add(this.getHash(x, y));

    // console.log(x, y, r);
    // ctx.imageSmoothingEnabled = true;
    ctx.fillStyle = "rgba(0,255,0,0.125)";
    ctx.strokeStyle = "rgba(0,255,0,0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    const rP = 3;
    // ctx.fillStyle = getVar('--mat-sys-error');
    ctx.fillStyle = "rgba(0,255,0,1)";
    ctx.beginPath();
    ctx.ellipse(x, y, rP, rP, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    ctx.fillStyle = "rgba(235, 32, 32, 1)";
    for (const bp of this._borderPoints) {
      const dx = bp[0] - x;
      const dy = bp[1] - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist == r) {
        ctx.beginPath();
        ctx.ellipse(bp[0], bp[1], rP, rP, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
      }
    }


    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        if (this._medialPointsVisited.has(this.getHash(x + dc, y + dr))) continue;
        const index = this._medial.map(p => this.getHash(p[0], p[1])).indexOf(this.getHash(x + dc, y + dr));
        if (index === -1) continue;
        this._medialPointsBfsQueue.push([x + dc, y + dr, this._medial[index][2]]);
      }
    }

    // for(let dr = -2; dr <= 2; dr++){
    //   for(let dc = -2; dc <= 2; dc++){
    //     if(dr === 0 && dc === 0) continue;
    //     if(this._medialPointsVisited.has(getHash(x+dc, y+dr))) continue;
    //     const index = this._medial.map(p => getHash(p[0], p[1])).indexOf(getHash(x+dc, y+dr));
    //     if(index === -1) continue;
    //     this._medialPointsBfsQueue.push([x+dc, y+dr, this._medial[index][2]]);
    //   }
    // }

    // for(let dr = -3; dr <= 3; dr++){
    //   for(let dc = -3; dc <= 3; dc++){
    //     if(dr === 0 && dc === 0) continue;
    //     if(this._medialPointsVisited.has(getHash(x+dc, y+dr))) continue;
    //     const index = this._medial.map(p => getHash(p[0], p[1])).indexOf(getHash(x+dc, y+dr));
    //     if(index === -1) continue;
    //     this._medialPointsBfsQueue.push([x+dc, y+dr, this._medial[index][2]]);
    //   }
    // }
  }

  async ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;


    this.drawStartShape();

    // pobieramy dane obrazu
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    function isInside(x: number, y: number): boolean {
      const idx = (y * canvas.width + x) * 4;
      return data[idx + 3] > 0; // sprawdzamy alpha kanał
    }
    function isBorder(x: number, y: number): boolean {
      if (!isInside(x, y)) return false;
      return !(isInside(x - 1, y) && isInside(x + 1, y) && isInside(x, y - 1) && isInside(x, y + 1));
    }
    for (let y = 1; y < canvas.height - 1; y++) {
      for (let x = 1; x < canvas.width - 1; x++) {
        if (isBorder(x, y)) {
          this._borderPoints.push([x, y]);
        }
      }
    }
    
    const cv = await cvReadyPromise;


    const src = new cv.Mat(imgData.height, imgData.width, cv.CV_8UC4);
    src.data.set(imgData.data);
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    const binary = new cv.Mat();
    cv.threshold(gray, binary, 25, 255, cv.THRESH_BINARY);


    const dst = new cv.Mat();
    cv.distanceTransform(binary, dst, cv.DIST_L2, 5);
    this._dist = [];
    for (let y = 0; y < dst.rows; y++) {
      const row: number[] = [];
      for (let x = 0; x < dst.cols; x++)
        row.push(dst.floatAt(y, x));
      this._dist.push(row);
    }

    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (!isInside(x, y)) continue;
        const d = this._dist[y][x];
        if(d < 1) continue;

        let isMax = true;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            if (dx !== 0 && dy !== 0) continue;
            if (d + this.eps <= this._dist[y + dy][x + dx]) {
              isMax = false;
              break;
            }
          }
          if (!isMax) break;
        }

        if (isMax)
          this._medial.push([x, y, d]);

      }
    }

    this.calculateMATAnimationElements();
    this.animate();
  }

  animate() {
    if(this.ngZone){

      this.ngZone.runOutsideAngular(() => {
        
        this._frameId = requestAnimationFrame(this.animate);
        
        this.drawStartShape();
        this.drawMedialAxis();
        this.drawAnimationElement(this.animationIndex);
      });
    }
  };

  ngOnDestroy(): void {
    cancelAnimationFrame(this._frameId);
  }
}


class MATAnimationElement {
  constructor(public x: number, public y: number, public r: number, public borderPoints: [number, number][]) { }
}