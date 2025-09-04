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
import { ColorScale } from '../../static/enums';
import { Bitmap, InteractiveBitmap } from '../../static/bitmap';
import { BitmapStorageService } from '../../services/bitmap-storage/bitmap-storage.service';

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
  ],
  templateUrl: './median-filter-animation.component.html',
  styleUrl: './median-filter-animation.component.css'
})
export class MedianFilterAnimationComponent {
  bitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);
  filteredBitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);
  resultBitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);

  bitmapTick: number = 0;
  bitmapKey: string = "median-filter";


  //view
  pixelSize: number = 40;
  showGrid: boolean = true;
  showHeaders: boolean = true;
  showNumberValues: boolean = true;
  showBase: boolean = false;
  selectedColorScale: ColorScale = ColorScale.Grayscale;


  //controls
  animationIndex: number = 0;

  constructor(private bitmapStorage: BitmapStorageService) { 
    let bitmap = this.bitmapStorage.load(this.bitmapKey);
    if (bitmap) this.load(bitmap);
    this.refresh();
  }
  
  load(bitmap: Bitmap) { 
    this.bitmap = new InteractiveBitmap(bitmap.width, bitmap.height, bitmap, 255);
  }
  refresh() {
    this.bitmapTick++;
  }
  animate() { }
}
