import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { getVar } from '../../static/style-utils';

@Component({
  selector: 'app-shape-bitmap-editor',
  imports: [
    MatCardModule
  ],
  templateUrl: './shape-bitmap-editor.component.html',
  styleUrl: './shape-bitmap-editor.component.css'
})
export class ShapeBitmapEditorComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    //draw a rectangle
    if (!ctx) return;



    canvas.width = 1000;
    canvas.height = 500;

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = getVar('--mat-sys-primary');
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

    ctx.fillRect(500, 100, 400, 200);
    ctx.fillRect(300, 150, 400, 200);
    ctx.fillRect(350, 250, 400, 200);

    // pobieramy dane obrazu
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // helper: sprawdź czy piksel jest "wewnątrz kształtu"
    function isInside(x: number, y: number): boolean {
      const idx = (y * canvas.width + x) * 4;
      return data[idx + 3] > 0; // sprawdzamy alpha kanał
    }

    // --- 2. Liczymy distance transform ---
    const dist = this.distanceTransform(isInside, canvas.width, canvas.height);
    console.log(dist.length);

    // --- 3. Lokalna maksymalność = medial axis ---
  const medial: [number, number][] = [];
  const eps = 0.99;//7512; // tolerancja na równości
  for (let y = 1; y < canvas.height - 1; y++) {
    for (let x = 1; x < canvas.width - 1; x++) {
      if (!isInside(x, y)) continue;
      const d = dist[y][x];

      let isMax = true;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          if (dx !== 0 && dy !== 0) continue;
          if (d + eps < dist[y + dy][x + dx]) {
            isMax = false;
            break;
          }
        }
        if (!isMax) break;
      }

      // filtr na szum przy krawędzi
      if (isMax && d > 2) {
        medial.push([x, y]);
      }
    }
  }

  
    // Rysujemy medial axis
    console.log(medial);
    ctx.fillStyle = getVar('--mat-sys-on-primary');

    for (const [x, y] of medial) {
      ctx.fillRect(x, y, 1, 1);
    }

  }

  distanceTransform(isInside: (x: number, y: number) => boolean, w: number, h: number): number[][] {
    const dist: number[][] = Array.from({ length: h }, () => Array(w).fill(Infinity));

    // inicjalizacja: 0 na brzegu, inf w środku
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!isInside(x, y)) continue;

        // brzeg = jeśli sąsiedni piksel jest poza kształtem
        if (
          !isInside(x + 1, y) ||
          !isInside(x - 1, y) ||
          !isInside(x, y + 1) ||
          !isInside(x, y - 1)
        ) {
          dist[y][x] = 0;
        }
      }
    }

    // 1. Pass od góry-lewej do dołu-prawej
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!isInside(x, y)) continue;
        let d = dist[y][x];
        if (x > 0) d = Math.min(d, dist[y][x - 1] + 1);
        if (y > 0) d = Math.min(d, dist[y - 1][x] + 1);
        if (x > 0 && y > 0) d = Math.min(d, dist[y - 1][x - 1] + Math.SQRT2);
        if (x < w - 1 && y > 0) d = Math.min(d, dist[y - 1][x + 1] + Math.SQRT2);
        dist[y][x] = d;
      }
    }

    // 2. Pass od dołu-prawej do góry-lewej
    for (let y = h - 1; y >= 0; y--) {
      for (let x = w - 1; x >= 0; x--) {
        if (!isInside(x, y)) continue;
        let d = dist[y][x];
        if (x < w - 1) d = Math.min(d, dist[y][x + 1] + 1);
        if (y < h - 1) d = Math.min(d, dist[y + 1][x] + 1);
        if (x < w - 1 && y < h - 1) d = Math.min(d, dist[y + 1][x + 1] + Math.SQRT2);
        if (x > 0 && y < h - 1) d = Math.min(d, dist[y + 1][x - 1] + Math.SQRT2);
        dist[y][x] = d;
      }
    }

    return dist;
  }
}
