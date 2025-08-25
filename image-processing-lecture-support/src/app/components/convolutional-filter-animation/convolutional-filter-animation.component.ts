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
],
  templateUrl: './convolutional-filter-animation.component.html',
  styleUrl: './convolutional-filter-animation.component.css'
})

export class ConvolutionalFilterAnimationComponent{
  bitmap: InteractiveBitmap = new InteractiveBitmap(16, 9, undefined, 255);
  


  constructor(private dialog: MatDialog, private theme: ThemeService) {}
  openDialog() {
    this.dialog.open(KernelDialogComponent, {
      width: '550px',
      disableClose: true, 
    });
  }
}
