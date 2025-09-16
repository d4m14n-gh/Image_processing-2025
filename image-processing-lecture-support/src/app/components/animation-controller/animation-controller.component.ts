import { Component, effect, input, model, OnDestroy, OnInit, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';

/** 
 * A component that provides controls for animation playback, including play/pause, step forward/backward, and speed adjustment.
 * It allows users to control the animation frame by frame or continuously, with options for looping and speed changes.
 */
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
  //public
  
  /** If true, the animation will loop continuously. */
  loop: boolean = false;
  /** If true, the animation is currently playing.
   * When false, the animation is paused.
   */
  playing: boolean = false;
  /** Speed multiplier for the animation playback. Higher values result in faster playback. */
  speed: number = 1;
  
  /** If true, the value (current frame) is displayed. */
  showValue = input<boolean>(true);

  /** Minimum value (first frame) of the animation. */
  min = input<number>(1);
  /** Maximum value (last frame) of the animation. */
  max = input<number>(255);
  /** Step size for incrementing/decrementing the value (frame). */
  step = input<number>(1);

  /** Current value (frame) of the animation. */
  value = model<number>(0);
  /** Event emitted when the value (frame) changes, **overrides default model behavior.** */
  valueChanged = output<number>();

  //private

  /** Timeout ID for managing animation updates */
  private _timeoutId: any;
  /** Predefined speed levels for the animation */
  private readonly _speeds = [0.1, 0.25, 0.5, 0.75, 1, 2, 5, 10];
  /** Current index in the predefined speed levels */
  private _currentSpeedIndex = 4;
  /** Interval in milliseconds for animation updates */
  private readonly _interval = 250;

  /**
   * Initializes the component and starts the animation.
   */
  ngOnInit(): void {
    this.animate();
  }

  /** Sets the current value (frame) of the animation.
   * If the new value is different from the current value, it updates the value and emits the `valueChanged` event.
   * @param value The new value (frame) to set.
   */
  setValue(value: number): void {
    if (value !== this.value()) {
      this.value.set(value);
      this.valueChanged.emit(value);
    }
  }

  /**
   * Steps to the first frame of the animation.
   */
  stepFirst(): void {
    this.setValue(this.min());
  }
  
  /**
   * Steps backward in the animation.
   */
  stepBackward(): void {
    this.setValue(Math.max(this.min(), this.value() - this.step()));
  }
  /**
   * Toggles the play/pause state of the animation.
   */
  togglePlay(): void {
    this.playing = !this.playing;
    this.animate();
  }
  /**
   * Steps forward in the animation.
   */
  stepForward(): void {
    this.setValue(Math.min(this.max(), this.value() + this.step()));
  }
  /**
   * Steps to the last frame of the animation.
   */
  stepLast(): void {
    this.setValue(this.max());
  }

  /** Toggles the looping behavior of the animation.
   * When enabled, the animation will restart from the beginning after reaching the end.
   */
  toggleLoop(): void {
    this.loop = !this.loop;
  }



  //speedControl

  /** Decreases the animation speed to the next lower predefined speed level. */
  speedDown(): void {
    this._currentSpeedIndex = Math.max(0, this._currentSpeedIndex - 1);
    this.speed = this._speeds[this._currentSpeedIndex];
  }
  /** Increases the animation speed to the next higher predefined speed level. */
  speedUp(): void {
    this._currentSpeedIndex = Math.min(this._speeds.length - 1, this._currentSpeedIndex + 1);
    this.speed = this._speeds[this._currentSpeedIndex];
  }
  /** Returns the maximum speed value from the predefined speed levels. */
  maxSpeed(): number {
    return this._speeds[this._speeds.length - 1];
  }
  /** Returns the minimum speed value from the predefined speed levels. */
  minSpeed(): number {
    return this._speeds[0];
  }

  /** Continuously updates the animation frame based on the current speed and play state.
   * If the animation is playing and the current value is less than the maximum value, it increments the value.
   * If the current value reaches the maximum and looping is enabled, it resets to the minimum value.
   * The function uses a timeout to control the update frequency based on the speed setting.
   */
  animate(): void {
    if(this.playing){
      if(this.value()<this.max())
        this.setValue(this.value() + 1);
      else if(this.loop)
        this.setValue(this.min());


      this._timeoutId = setTimeout(() => {
        this.animate();
      }, this._interval / this.speed);
    }
  }

  /** Cleans up resources when the component is destroyed.
   */
  ngOnDestroy(): void{
    clearTimeout(this._timeoutId);
  }
}
