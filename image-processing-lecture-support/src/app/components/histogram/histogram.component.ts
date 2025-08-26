import { Component, AfterViewInit, ViewChild, ElementRef, OnInit, HostListener } from '@angular/core';
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
export class HistogramComponent implements AfterViewInit, OnInit {
  @ViewChild('histogram') histogramCanvas!: ElementRef<HTMLCanvasElement>;
  bitmap: InteractiveBitmap = new InteractiveBitmap(16, 9);
  bitmapKey: string = "histogram-bitmap";

  pixelSize: number = 50;
  showGrid: boolean = true;
  showHeaders: boolean = true;
  showNumberValues: boolean = true;
  selectedColorScale: ColorScale = ColorScale.Grayscale;
  
  histogramBinSize: number = 5;
  rangeStart: number = 0;
  rangeEnd: number = 256;
  bitmapComponentTick: number = 0;

  chart?: Chart; 
  private _labels: string[] = [];
  private _colors: string[] = [];
  private _border_colors: string[] = [];
  private _data: number[] = [];

  constructor(private bitmapStorage: BitmapStorageService) {}

  ngOnInit(): void {
    let bitmap = this.bitmapStorage.load(this.bitmapKey);
    if(bitmap !== null)
      this.bitmap = new InteractiveBitmap(bitmap.getWidth(), bitmap.getHeight(), bitmap, 255);
    else
      this.bitmapStorage.save(this.bitmapKey, this.bitmap);
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.updateChart();
  }

  setRangeStart(value: number) {
    this.rangeStart = value;
    this.prepareChartData();
    this.updateChart();
  }

  setRangeEnd(value: number) {
    this.rangeEnd = value;
    this.prepareChartData();
    this.updateChart();
  }

  setGroupSize(value: number) {
    this.histogramBinSize = value;
    this.prepareChartData();
    this.updateChart();
  }

  prepareChartData(selectedOnly: boolean=true){
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

  updateChart(){
    if(this.chart){
      this.chart.data.datasets[0].data = this._data;
      this.chart.data.labels = this._labels;
      // this.chart.data.datasets[0].backgroundColor = getVar();
      // if(this.histogramBinSize>2){
        this.chart.data.datasets[0].backgroundColor = this._colors;
        // this.chart.data.datasets[0].borderColor = this._border_colors;
        this.chart.data.datasets[0].borderWidth = 0;

        // this.chart.data.datasets[0].borderWidth = 1;
      // }
      // else{
      //   this.chart.data.datasets[0].backgroundColor = getVar();
      //   this.chart.data.datasets[0].borderWidth = 0;
      // }
      this.chart.update();
    }
  }

  animate(t: number) {
    this.bitmap.clearSelection();
    this.bitmap.cells().filter(c => c.value <= t && !isNaN(c.value) && c.value != null).forEach(
      c => {
        this.bitmap.select(c.row, c.col);
      }
    );
  
    this.prepareChartData(true);
    this.bitmapComponentTick++;
    this.updateChart();
  }

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
