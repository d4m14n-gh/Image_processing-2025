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
  tick = input<number>(0);
  pixelSize =  input<number>(40);  
  showNumbers =  input<boolean>(true);
  showGrid =  input<boolean>(true);
  showHeaders =  input<boolean>(false);
  showColorScale =  input<boolean>(true);
  selectedColorScale =  input<ColorScale>(ColorScale.Grayscale);

  bitmapChanged = output<InteractiveBitmap>();
  dragStarted = output<DragArea>();
  dragMoved = output<DragArea>();
  dragEnded = output<DragArea>();
  rowClicked = output<{row: number, event: MouseEvent}>();
  colClicked = output<{col: number, event: MouseEvent}>();

  @ViewChild('canvas', { static: false }) canvasRef?: ElementRef<HTMLCanvasElement> = undefined;

  //private
  private _drag_area: DragArea = new DragArea();
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

    if (this.bitmapRenderer.isCursorOnColHeader(x, y, this.bitmap())){
      this.colClicked.emit({col, event});
      this.selectColumn(col, event);
    }
    else if (this.bitmapRenderer.isCursorOnRowHeader(x, y, this.bitmap())){
      this.rowClicked.emit({row, event});
      this.selectRow(row, event);
    }
    else if (this.bitmapRenderer.isCursorOnCell(x, y, this.bitmap())){
      if (!this._drag_area.dragging) {
        this._drag_area.dragging = true;
        this._drag_area.button = event.button;
        this._drag_area.ctrlKey = event.ctrlKey;
        this._drag_area.dragStart = {row, col};
        this._drag_area.dragEnd = {row, col};
        
        this.dragStarted.emit(this._drag_area);
        this.dragStart(this._drag_area);

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
        this.dragMoved.emit(this._drag_area);
        this.dragMove(this._drag_area);
      }
    }
  }

  onCanvasMouseUp(event: MouseEvent): void {
    if (this._drag_area.dragging && this._drag_area.button === event.button) {
      this._drag_area.dragging = false;
      this.dragEnded.emit(this._drag_area);
      this.dragEnd(this._drag_area);
    }
  }


  dragStart(drag_area: DragArea) {
    if(!drag_area.ctrlKey&&drag_area.button != 2) 
      this.bitmap().clearSelection();
    this.bitmap().dragArea = drag_area;
    this.syncBitmap(); 
  }
  dragMove(drag_area: DragArea){
    if(drag_area.dragging){
      this.bitmap().dragArea = drag_area;
      this.syncBitmap(); 
    }
  }
  dragEnd(drag_area: DragArea){
    this.bitmap().dragArea = drag_area;
    for(let pos of drag_area.getAreaCells())
      this.bitmap().setSelection(pos.row, pos.col, drag_area.button != 2);
    this.syncBitmap(); 
  }
  keyDown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (event.ctrlKey && key === 'a') {
      event.preventDefault();
      this.selectAll();
    }
    else if (event.ctrlKey && key === 'c') {
      event.preventDefault();
      this.copyToCsv();
    }
  }
  

  selectAll() {
    for (let row = 0; row < this.bitmap().getHeight(); row++) 
      for (let col = 0; col < this.bitmap().getWidth(); col++) 
        this.bitmap().select(row, col);
    this.syncBitmap(); 
  }
  selectRow(row: number, event: MouseEvent) {
    if(!event.ctrlKey&&event.button != 2) this.bitmap().clearSelection();
    for (let col = 0; col < this.bitmap().getWidth(); col++) 
      this.bitmap().setSelection(row, col, event.button != 2);
    this.syncBitmap(); 
  }
  selectColumn(col: number, event: MouseEvent) {
    if(!event.ctrlKey&&event.button != 2) this.bitmap().clearSelection();
    for (let row = 0; row < this.bitmap().getHeight(); row++)
      this.bitmap().setSelection(row, col, event.button != 2);
    this.syncBitmap(); 
  }

  copyToCsv() {
    const selection = this.bitmap().selected;
    
    const minCell = {row: this.bitmap().getHeight(), col: this.bitmap().getWidth()};
    const maxCell = {row: 0, col: 0};
    for(let cell of selection) {
      minCell.row = Math.min(minCell.row, cell.row);
      minCell.col = Math.min(minCell.col, cell.col);
      maxCell.row = Math.max(maxCell.row, cell.row);
      maxCell.col = Math.max(maxCell.col, cell.col);
    }

    let data = "";
    for(let row = minCell.row; row <= maxCell.row; row++) {
      for(let col = minCell.col; col <= maxCell.col; col++) {
        if(this.bitmap().isSelected(row, col))
          data += this.bitmap().get(row, col).toString()
        if(col < maxCell.col) data += ",";
      }
      data += "\n";
    }

    navigator.clipboard.writeText(data);
  }

  syncBitmap(){
    this.bitmapChanged.emit(this.bitmap());
    this.draw();
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
    const selectionColor = style.getPropertyValue('--mat-sys-secondary').trim();

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
