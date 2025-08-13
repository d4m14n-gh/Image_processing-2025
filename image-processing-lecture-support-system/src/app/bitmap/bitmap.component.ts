import { Component, ElementRef, HostListener, input, NgZone, OnDestroy, OnInit, output, SimpleChanges, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BitmapRenderer } from '../static/render-utils';
import { InteractiveBitmap } from '../static/bitmap';
import { ColorScale } from '../static/enums';
import { DragArea } from '../static/drag-area';
import { ThemeService } from '../theme/theme.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-bitmap',
  imports: [MatCardModule],
  templateUrl: './bitmap.component.html',
  styleUrl: './bitmap.component.css'
})
export class BitmapComponent implements OnInit, OnDestroy{
  private bitmapRenderer: BitmapRenderer = new BitmapRenderer();
  
  bitmap = input.required<InteractiveBitmap>();
  tick =  input<number>(0);  

  pixelSize =  input<number>(40);  
  showNumbers =  input<boolean>(true);
  showGrid =  input<boolean>(true);
  showHeaders =  input<boolean>(false);
  showColorScale =  input<boolean>(true);

  dragStart = output<DragArea>();
  dragMove = output<DragArea>();
  dragEnd = output<DragArea>();
  
  rowClicked = output<{row: number, event: MouseEvent}>();
  colClicked = output<{col: number, event: MouseEvent}>();

  selectedColorScale =  input<ColorScale>(ColorScale.Grayscale);
  @ViewChild('canvas', { static: false }) canvasRef?: ElementRef<HTMLCanvasElement> = undefined;

  //private
  private _drag_area: DragArea = new DragArea();
  private _drag_area_right: DragArea = new DragArea();
  private _subscription: Subscription = new Subscription();

  constructor(private ngZone: NgZone, private themeService: ThemeService) {
    this._subscription = this.themeService.themeChanged$.subscribe(theme => {
      this.draw();
    });
  }
  ngOnInit(){
    this.draw();
  }
  ngOnChanges(ch: SimpleChanges) {
    this.bitmapRenderer.colorScale = this.selectedColorScale();
    this.bitmapRenderer.grid = this.showGrid();
    this.bitmapRenderer.headers = this.showHeaders();
    this.bitmapRenderer.numbers = this.showNumbers();
    this.bitmapRenderer.pixelSize = this.pixelSize();

    this.draw();
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.bitmapRenderer.pixelSize = this.pixelSize();
    this.draw();
  }
  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    this.onCanvasMouseUp(event);
  }
  @HostListener('window:dragend', ['$event'])
  onDragEnd(event: MouseEvent) {
    this.onCanvasMouseUp(event);
  }
  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.onCanvasMouseMove(event);
  }

  getCursorPosition(event: MouseEvent): {x: number, y: number} {
    if (!this.canvasRef) return {x: -1, y: -1};

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return {x, y};
  }

  onCanvasMouseDown(event: MouseEvent): void {
    if(event.button !== 0 && event.button !== 2) return; 
    window.getSelection()?.removeAllRanges();

    let {x, y} = this.getCursorPosition(event);
    const {row, col} = this.bitmapRenderer.getCursorCell(x, y);

    if (this.bitmapRenderer.isCursorOnColHeader(x, y, this.bitmap()))
      this.colClicked.emit({col, event});
    else if (this.bitmapRenderer.isCursorOnRowHeader(x, y, this.bitmap()))
      this.rowClicked.emit({row, event});
    else if (this.bitmapRenderer.isCursorOnCell(x, y, this.bitmap())){
      if (!this._drag_area.dragging) {
        this._drag_area.dragging = true;
        this._drag_area.button = event.button;
        this._drag_area.ctrlKey = event.ctrlKey;
        this._drag_area.dragStart = {row, col};
        this._drag_area.dragEnd = {row, col};
        
        this.dragStart.emit(this._drag_area);
      }
    }
  }

  onCanvasMouseMove(event: MouseEvent): void {
    if (this._drag_area.dragging) {
      let {x, y} = this.getCursorPosition(event);
      let {row, col} = this.bitmapRenderer.getCursorCell(x, y);
      
      if(row < 0) row = 0;
      if(row >= this.bitmap().getHeight()) row = this.bitmap().getHeight() - 1;
      if(col < 0) col = 0;
      if(col >= this.bitmap().getWidth()) col = this.bitmap().getWidth() - 1;

      if(this._drag_area.dragEnd.row!=row || this._drag_area.dragEnd.col!=col){
        this._drag_area.dragEnd = {row, col};
        this.dragMove.emit(this._drag_area);
      }
    }
  }

  onCanvasMouseUp(event: MouseEvent): void {
    if (this._drag_area.dragging && this._drag_area.button === event.button) {
      this._drag_area.dragging = false;
      this.dragEnd.emit(this._drag_area);
    }
  }


  getPixelRatio(): number {
     return (window.devicePixelRatio || 1);
  }
  getHeight(): number {
    return this.bitmap().getHeight() * this.pixelSize() + (this.showHeaders() ? 30 : 0);
  }
  getWidth(): number {
    return this.bitmap().getWidth() * this.pixelSize() + (this.showHeaders() ? 30 : 0);
  }
  draw(): void {
    this.ngZone.runOutsideAngular(() => {
    window.requestAnimationFrame(() => {
        const context = this.canvasRef?.nativeElement.getContext('2d') ?? undefined;
        if (!context) return;

          this.setStyles();
          context.canvas.width = this.getWidth() * this.getPixelRatio();
          context.canvas.height = this.getHeight() * this.getPixelRatio();

          this.bitmapRenderer.render(context, this.getPixelRatio(), this.bitmap());
        }
    )});
  }

  private setStyles(){
    const style = getComputedStyle(document.body);
    const headerColor = style.getPropertyValue('--mat-sys-surface-container').trim();
    const gridColor = "#2e2e2eff";
    const selectionColor = style.getPropertyValue('--mat-sys-primary').trim();

    if(gridColor)
      this.bitmapRenderer.gridColor = gridColor;
    if(headerColor)
      this.bitmapRenderer.headerColor = headerColor;
    if(selectionColor)
      this.bitmapRenderer.selectionColor = selectionColor;
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
