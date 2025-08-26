import { Component, input, OnDestroy, OnInit, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'app-animation-controller',
  imports: [
    MatCardModule,
    MatSliderModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatMenuModule
  ],
  templateUrl: './animation-controller.component.html',
  styleUrl: './animation-controller.component.css'
})
export class AnimationControllerComponent implements OnInit, OnDestroy {
  loop: boolean = false;
  playing: boolean = false;
  
  speed: number = 1;
  
  showValue = input<boolean>(true);
  min = input<number>(1);
  max = input<number>(255);
  step = input<number>(1);
  startValue = input<number>(0);

  valueChanged = output<number>();

  private _value: number = 0;
  set value(newValue: number) {
    if(this._value !== newValue)
      this.valueChanged.emit(newValue);
    this._value = newValue;
  }
  get value(): number {
    return this._value;
  }

  stepFirst() {
    this.value = this.min();
  }
  stepBackward() {
    this.value = Math.max(this.min(), this.value - this.step());
  }
  togglePlay() {
    this.playing = !this.playing;
  }
  stepForward() {
    this.value = Math.min(this.max(), this.value + this.step());
  }
  stepLast(){
    this.value = this.max();
  }

  toggleLoop() {
    this.loop = !this.loop;
  }
  setGroupSize(arg0: number) {
    console.log(arg0);
  }

  intervalId: any;
  ngOnInit() {
    this._value = this.startValue();
    this.intervalId = setInterval(() => {
      if(this.playing){
        if(this.value<this.max())
          this.value++;
        else if(this.loop)
          this.value = this.min();
      }
    }, 250); 
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }
}
