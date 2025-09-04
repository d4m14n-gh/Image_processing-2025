import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BitmapComponent } from '../bitmap/bitmap.component';
import { InteractiveBitmap } from '../../static/bitmap';
import { Point } from '../../static/point';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from "@angular/material/button";
import { ActivatedRoute, Router } from '@angular/router';
import { BitmapStorageService } from '../../services/bitmap-storage/bitmap-storage.service';

@Component({
  selector: 'app-binary-bitmap-editor',
  imports: [
    MatCardModule,
    BitmapComponent,
    MatSliderModule,
    FormsModule,
    MatFormFieldModule,
    MatDividerModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule
],
  templateUrl: './binary-bitmap-editor.component.html',
  styleUrl: './binary-bitmap-editor.component.css'
})
export class BinaryBitmapEditorComponent {
  bitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);
  bitmapComponentTick: number = 0;
  pixelSize: number = 50;
  showHeaders: boolean = true;
  showGrid: boolean = true;

  width: number = 16;
  height: number = 9;

  private _id: string | null = null;
  constructor(private route: ActivatedRoute, private bitmap_storage: BitmapStorageService, private router: Router) {
    this._id = this.route.snapshot.paramMap.get('id');
    let bitmap = this.bitmap_storage.load(this._id);
    if(bitmap) 
      this.bitmap = new InteractiveBitmap(bitmap.width, bitmap.height, bitmap, 255);
    this.width = this.bitmap.width;
    this.height = this.bitmap.height;
  }

  onCellEntered($event: { cell: Point; event: MouseEvent; }) {
    if(this.bitmap.isOut($event.cell)) return;
    if($event.event.buttons === 1)
      this.bitmap.set($event.cell, 0);
    else if($event.event.buttons === 2)
      this.bitmap.set($event.cell, 255);
    this.bitmapComponentTick++;
  }

  clear() {
    this.bitmap = new InteractiveBitmap(this.width, this.height, undefined, 255);
    this.bitmapComponentTick++;
  }

  resize() {
    this.bitmap = new InteractiveBitmap(this.width, this.height, this.bitmap, 255);
    this.bitmapComponentTick++;
  }

  canSave(){
    return this._id !== null; 
  }
  quit(){
     if (history.length > 1) {
      history.back();
    } else {
      this.router.navigate(['/']);
    }
  }
  save(){
    if (this._id !== null) {
      this.bitmap_storage.save(this._id, this.bitmap);
      this.quit();
    }
  }
}
