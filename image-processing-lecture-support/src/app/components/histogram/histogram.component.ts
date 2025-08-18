import { Component, AfterViewInit, ViewChild, ElementRef, OnInit } from '@angular/core';
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
    MatSlider
]  
})
export class HistogramComponent implements AfterViewInit, OnInit {
  @ViewChild('histogram') histogramCanvas!: ElementRef<HTMLCanvasElement>;
  bitmap: InteractiveBitmap = new InteractiveBitmap(16, 9);
  bitmapKey: string = "histogram-bitmap";
  
  groupSize: number = 8;
  rangeStart: number = 0;
  rangeEnd: number = 256;
  
  chart?: Chart; 
  private _labels: string[] = [];
  private _data: number[] = [];

  constructor(private bitmapStorage: BitmapStorageService) {}

  ngOnInit(): void {
    let bitmap = this.bitmapStorage.load(this.bitmapKey);
    if(bitmap !== null)
      this.bitmap = new InteractiveBitmap(bitmap.getWidth(), bitmap.getHeight(), bitmap, 255);
    else
      this.bitmapStorage.save(this.bitmapKey, this.bitmap);
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
    this.groupSize = value;
    this.prepareChartData();
    this.updateChart();
  }

  prepareChartData(){
    this._labels = [];
    for (let i = this.rangeStart; i < this.rangeEnd; i+=this.groupSize) 
      this._labels.push(`${i.toString()}-${Math.min(i + this.groupSize - 1, this.rangeEnd - 1).toString()}`);
    this._data = this.bitmap.histogram(this.groupSize);
  }

  updateChart(){
    if(this.chart){
      this.chart.data.datasets[0].data = this._data;
      this.chart.data.labels = this._labels;
      this.chart.data.datasets[0].backgroundColor = getVar();
      this.chart.update();
    }
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
          },
        ],
      },
      options: {
        responsive: true,
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
