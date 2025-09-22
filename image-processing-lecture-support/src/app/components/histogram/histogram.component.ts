import { Component, AfterViewInit, ViewChild, ElementRef, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { BitmapComponent } from "../bitmap/bitmap.component";
import { InteractiveBitmap } from '../../static/bitmap';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { BitmapStorageService } from '../../services/bitmap-storage/bitmap-storage.service';
import { getVar } from '../../static/style-utils';
import { MatSlider, MatSliderModule } from "@angular/material/slider";
import { AnimationControllerComponent } from '../animation-controller/animation-controller.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { getContrastColor, scaleColor } from '../../static/color-utils';
import { ColorScale } from '../../static/enums';
import { MatMenuModule } from "@angular/material/menu";
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '../../services/theme/theme.service';
import { Subscription } from 'rxjs';

/** Component to display and interact with a histogram of bitmap pixel values. */
@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.css'],
  imports: [
    BitmapComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    RouterModule,
    MatSlider,
    AnimationControllerComponent,
    MatFormFieldModule,
    MatMenuModule,
    MatSelectModule,
    MatCheckboxModule,
    FormsModule
]  
})
export class HistogramComponent implements AfterViewInit, OnDestroy {
  /** Reference to the histogram canvas element. */
  @ViewChild('histogram') histogramCanvas!: ElementRef<HTMLCanvasElement>;
  /** The bitmap for which the histogram is displayed and analyzed. */
  bitmap: InteractiveBitmap = new InteractiveBitmap(16, 9);
  /** Key used to load and save the bitmap in storage. */
  readonly bitmapKey: string = "histogram-bitmap";

  //view
  /** Size of each pixel in the bitmap display (in pixels). */
  pixelSize: number = 50;
  /** If true, a grid is displayed over the bitmap. */
  showGrid: boolean = true;
  /** If true, headers are displayed above the bitmap. */
  showHeaders: boolean = true;
  /** If true, pixel values are displayed on the bitmap. */
  showNumberValues: boolean = true;
  /** If true, the histogram bars are colored according to the selected color scale. */
  enableHistogramColorscale: boolean = true;
  /** Color scale used for displaying the histogram bars. */
  selectedColorScale: ColorScale = ColorScale.Grayscale;
  
  /** Size of each histogram bin (group size). */
  histogramBinSize: number = 5;
  /** Start of the pixel value range to include in the histogram. */
  rangeStart: number = 0;
  /** End of the pixel value range to include in the histogram. */
  rangeEnd: number = 256;
  /** Used to trigger bitmap component updates. */
  tick: number = 0;

  /**  The Chart.js instance for the histogram. */
  chart?: Chart; 
  /** Labels for the histogram bins. */
  private _labels: string[] = [];
  /** Colors for the histogram bars. */
  private _colors: string[] = [];
  /** Border colors for the histogram bars. */
  private _border_colors: string[] = [];
  /** Data values for the histogram bins. */
  private _data: number[] = [];
  /** Subscription to theme changes for dynamic styling. */
  private _themeSubscription: Subscription = new Subscription();

  /** Initializes the component, loading the bitmap from storage if available. 
   * @param bitmapStorage Service for loading and saving bitmaps.
   * @param themeService Service for managing application themes.
  */
  constructor(private bitmapStorage: BitmapStorageService, private themeService: ThemeService) {
    let bitmap = this.bitmapStorage.load(this.bitmapKey);
    if(bitmap)
      this.bitmap = new InteractiveBitmap(bitmap.width, bitmap.height, bitmap, 255);

    this._themeSubscription = this.themeService.themeChanged.subscribe(() => this.updateChart());
  }

  /** Handles window resize events to update the histogram chart accordingly. 
   * @param event The resize event.
  */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.updateChart();
  }

  /** Sets the start of the pixel value range for the histogram and updates the chart.
   * @param value The new start value for the range.
  */
  setRangeStart(value: number): void {
    this.rangeStart = value;
    this.prepareChartData();
    this.updateChart();
  }

  /** Sets the end of the pixel value range for the histogram and updates the chart.
   * @param value The new end value for the range.
  */
  setRangeEnd(value: number): void {
    this.rangeEnd = value;
    this.prepareChartData();
    this.updateChart();
  }

  /** Sets the size of each histogram bin (group size) and updates the chart.
   * @param value The new bin size.
  */
  setGroupSize(value: number): void {
    this.histogramBinSize = value;
    this.prepareChartData();
    this.updateChart();
  }

  /** Prepares the data for the histogram chart based on the current bitmap and settings.
   * @param selectedOnly If true, only selected pixels are included in the histogram.
  */
  prepareChartData(selectedOnly: boolean=true): void {
    this._labels = [];
    this._colors = [];
    this._border_colors = [];

    for (let i = this.rangeStart; i < this.rangeEnd; i+=this.histogramBinSize) {
      if(this.histogramBinSize == 1)
        this._labels.push(`${i.toString()}`);
      else  
        this._labels.push(`${i.toString()}-${Math.min(i + this.histogramBinSize - 1, this.rangeEnd - 1).toString()}`);

      let color = scaleColor(i, this.selectedColorScale);
      this._colors.push(color);
      this._border_colors.push(getContrastColor("f6f3f3"));
    }
    this._data = this.bitmap.histogram(this.histogramBinSize, selectedOnly);
  }

  /** Updates the histogram chart with the current data and styling. */
  updateChart(): void {
    if(this.chart){
      this.chart.data.datasets[0].data = this._data;
      this.chart.data.labels = this._labels;

      if(this.enableHistogramColorscale)
        this.chart.data.datasets[0].backgroundColor = this._colors;
      else
        this.chart.data.datasets[0].backgroundColor = getVar();
      
      this.chart.data.datasets[0].borderWidth = 0;
      
      // this.chart.data.datasets[0].backgroundColor = getVar();
      // if(this.histogramBinSize>2){
      // this.chart.data.datasets[0].borderColor = this._border_colors;
        // this.chart.data.datasets[0].borderWidth = 1;
      // }
      // else{
      //   this.chart.data.datasets[0].backgroundColor = getVar();
      //   this.chart.data.datasets[0].borderWidth = 0;
      // }
      this.chart.update();
    }
  }

  /** Animates the bitmap by selecting pixels based on their values and updating the histogram chart.
   * @param animationIndex The current index for the animation, determining which pixels to select.
  */
  animate(animationIndex: number): void {
    this.bitmap.clearSelection();
    this.bitmap.pixels().filter(c => c.value <= animationIndex && !isNaN(c.value) && c.value != null).forEach(
      c => {
        this.bitmap.select(c.cell);
      }
    );
  
    this.prepareChartData(true);
    this.tick++;
    this.updateChart();
  }

  /** Cleans up subscriptions when the component is destroyed. */
  ngOnDestroy(): void {
    this._themeSubscription.unsubscribe();
  }
  /** Initializes the histogram chart after the view has been initialized. */
  ngAfterViewInit(): void {
    Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

    this.prepareChartData();

    const bgColor = getVar();
    
    const ctx = this.histogramCanvas.nativeElement;
    this.chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: this._labels,
        datasets: [
          {
            label: "Histogram",
            data: this._data,
            backgroundColor: bgColor,
            categoryPercentage: 0.9,
            barPercentage: 1,
            borderWidth: 1,
            borderColor: bgColor,
          },
        ],
      },
      options: {
        devicePixelRatio: 2,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false 
          }
        },
        animation: {
          duration: 500,
          easing: "easeOutQuart",
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

  }
}
