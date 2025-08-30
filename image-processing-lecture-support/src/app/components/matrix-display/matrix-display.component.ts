import { Component, input } from '@angular/core';
import { Kernel } from '../../static/kernel';

@Component({
  selector: 'app-matrix-display',
  imports: [],
  templateUrl: './matrix-display.component.html',
  styleUrl: './matrix-display.component.css'
})
export class MatrixDisplayComponent {
  kernel = input.required<Kernel>();

  enumerator(){
    return Array.from({ length: this.kernel().size }, (_, i) => i + 1);
  }
}
