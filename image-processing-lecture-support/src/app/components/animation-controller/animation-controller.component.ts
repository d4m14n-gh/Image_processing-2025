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
  private _timeoutId: any;
  set value(newValue: number) {
    if(this._value !== newValue)
      this.valueChanged.emit(newValue);
    this._value = newValue;
  }
  get value(): number {
    return this._value;
  }
  
  ngOnInit() {
    this._value = this.startValue();
    this.animate();
  }
  stepFirst() {
    this.value = this.min();
  }
  stepBackward() {
    this.value = Math.max(this.min(), this.value - this.step());
  }
  togglePlay() {
    this.playing = !this.playing;
    this.animate();
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

  //speedControl
  private _speeds = [0.1, 0.25, 0.5, 0.75, 1, 2, 5, 10];
  private _currentSpeedIndex = 4;
  speedDown(){
    this._currentSpeedIndex = Math.max(0, this._currentSpeedIndex - 1);
    this.speed = this._speeds[this._currentSpeedIndex];
  }
  speedUp(){
    this._currentSpeedIndex = Math.min(this._speeds.length - 1, this._currentSpeedIndex + 1);
    this.speed = this._speeds[this._currentSpeedIndex];
  }
  maxSpeed(){
    return this._speeds[this._speeds.length - 1];
  }
  minSpeed(){
    return this._speeds[0];
  }

  
  animate(){
    if(this.playing){
      if(this.value<this.max())
        this.value++;
      else if(this.loop)
        this.value = this.min();


      this._timeoutId = setTimeout(() => {
        this.animate();
      }, 100 / this.speed);
    }
  }

  ngOnDestroy() {
    clearTimeout(this._timeoutId);
  }
}
