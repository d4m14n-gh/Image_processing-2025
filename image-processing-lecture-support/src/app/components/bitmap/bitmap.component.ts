import { Component, ElementRef, HostListener, input, NgZone, OnDestroy, OnInit, output, SimpleChanges, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { BitmapRenderer } from '../../static/render-utils';
import { InteractiveBitmap } from '../../static/bitmap';
import { ColorScale } from '../../static/enums';
import { DragArea } from '../../static/drag-area';
import { ThemeService } from '../../services/theme/theme.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { getVar } from '../../static/style-utils';
import { Point } from '../../static/point';

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
  userSelect =  input<boolean>(true);
  dynamicCursor =  input<boolean>(true);
  selectedColorScale =  input<ColorScale>(ColorScale.Grayscale);
  selectionColor =  input<string>("rgba(56, 116, 255, 1)");

  bitmapChanged = output<InteractiveBitmap>();
  dragStarted = output<DragArea>();
  dragMoved = output<DragArea>();
  dragEnded = output<DragArea>();
  rowClicked = output<{row: number, event: MouseEvent}>();
  colClicked = output<{col: number, event: MouseEvent}>();
  cellClicked = output<{cell: Point, event: MouseEvent}>();
  
  cellEntered = output<{cell: Point, event: MouseEvent}>();

  @ViewChild('canvas', { static: false }) canvasRef?: ElementRef<HTMLCanvasElement> = undefined;

  //private
  private _drag_area: DragArea = new DragArea();
  private _disableContext: boolean = false;
  private _themeSubscription: Subscription = new Subscription();
  private _currentCell: Point | null = null;
  private _initialized: boolean = false;

  constructor(private ngZone: NgZone, private themeService: ThemeService) {
    this._themeSubscription = this.themeService.themeChanged$.subscribe(theme => {
      this.draw();
    });
  }
  ngOnInit(){
    document.fonts.ready.then(() => {
      this.draw();
    });
    this.draw();
    this._initialized = true;
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
    if(!this._initialized) return;
    this.bitmapRenderer.pixelSize = this.pixelSize();
    this.draw();
  }
  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    if(!this._initialized) return;
    this.onCanvasMouseUp(event);
  }
  @HostListener('window:dragend', ['$event'])
  onDragEnd(event: MouseEvent) {
    if(!this._initialized) return;
    this.onCanvasMouseUp(event);
  }
  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if(!this._initialized) return;
    this.onCanvasMouseMove(event);
  }
  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    if(!this._initialized) return;
    if (this._disableContext) {
      event.preventDefault();
    }
  }
  ngOnDestroy() {
    this._themeSubscription.unsubscribe();
  }


  getCursorPosition(event: MouseEvent): {x: number, y: number} {
    if (!this.canvasRef) return {x: 0, y: 0};

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return {x, y};
  }

  onCanvasMouseDown(event: MouseEvent): void {
    const {x, y} = this.getCursorPosition(event);
    const {row, col} = this.bitmapRenderer.getCursorCell(x, y);
    
    if (this.bitmapRenderer.isCursorOnColHeader(x, y, this.bitmap()))
      this.colClicked.emit({col, event});
    else if (this.bitmapRenderer.isCursorOnRowHeader(x, y, this.bitmap()))
      this.rowClicked.emit({row, event});
    else if (this.bitmapRenderer.isCursorOnCell(x, y, this.bitmap()))
      this.cellClicked.emit({cell: new Point(row, col), event});
    
    
    if(event.button !== 0 && event.button !== 2) return;
    if(!this.userSelect()) return;
    window.getSelection()?.removeAllRanges();

    if (this.bitmapRenderer.isCursorOnColHeader(x, y, this.bitmap()))
      this.selectColumn(col, event);
    else if (this.bitmapRenderer.isCursorOnRowHeader(x, y, this.bitmap()))
      this.selectRow(row, event);
    else if (this.bitmapRenderer.isCursorOnCell(x, y, this.bitmap()))
      if (!this._drag_area.dragging) {
        this._drag_area.dragging = true;
        this._disableContext = true;
        this._drag_area.button = event.button;
        this._drag_area.ctrlKey = event.ctrlKey;
        this._drag_area.dragStart = new Point(row, col);
        this._drag_area.dragEnd = new Point(row, col);
        
        this.dragStarted.emit(this._drag_area);
        this.dragStart(this._drag_area);
      }
  }

  onCanvasMouseMove(event: MouseEvent): void {
    const {x, y} = this.getCursorPosition(event);
    let {row, col} = this.bitmapRenderer.getCursorCell(x, y);
    let cell = new Point(row, col);


    if(this.dynamicCursor()){
      // this.canvasRef.nativeElement.style.cursor = 'url("/brush.svg") 4 28, grab';
      if(this.canvasRef){
        this.canvasRef.nativeElement.style.cursor = 'default';
        if(this.bitmapRenderer.isCursorOnCell(x, y, this.bitmap()))
          this.canvasRef.nativeElement.style.cursor = 'crosshair';
      }
    }

    if(this._currentCell===null || !this._currentCell.equals(cell)){
        this._currentCell = cell;
        this.cellEntered.emit({cell, event});
    }
    
    if (event.buttons !== 0 && this.bitmapRenderer.isCursorOnCell(x, y, this.bitmap())) 
      if (window.getSelection) {
        const selection = window.getSelection();
        if (selection) selection.removeAllRanges();
      }

    if (this._drag_area.dragging) {
      
      if(row < 0) row = 0;
      if(row >= this.bitmap().height) row = this.bitmap().height - 1;
      if(col < 0) col = 0;
      if(col >= this.bitmap().width) col = this.bitmap().width - 1;

      if(this._drag_area.dragEnd.row!=row || this._drag_area.dragEnd.col!=col){
        this._drag_area.dragEnd = new Point(row, col);
        this.dragMoved.emit(this._drag_area);
        this.dragMove(this._drag_area);
      }
    }
  }

  onCanvasMouseUp(event: MouseEvent): void {
    if (this._drag_area.dragging && this._drag_area.button === event.button) {
      this._drag_area.dragging = false;
      setTimeout(() => this._disableContext = false, 0);
      this.dragEnded.emit(this._drag_area);
      this.dragEnd(this._drag_area);
    }
  }




  //dragging
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
      this.bitmap().setSelection(pos, drag_area.button != 2);
    this.syncBitmap(); 
  }




  //keys
  keyDown(event: KeyboardEvent) {
    if(!this.userSelect()) return;
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
  

  //selection
  selectAll() {
    this.bitmap().cells().forEach(cell => this.bitmap().select(cell));
    this.syncBitmap(); 
  }
  selectRow(row: number, event: MouseEvent) {
    if(!event.ctrlKey&&event.button != 2) this.bitmap().clearSelection();
    for (let col = 0; col < this.bitmap().width; col++) 
      this.bitmap().setSelection(new Point(row, col), event.button != 2);
    this.syncBitmap(); 
  }
  selectColumn(col: number, event: MouseEvent) {
    if(!event.ctrlKey&&event.button != 2) this.bitmap().clearSelection();
    for (let row = 0; row < this.bitmap().height; row++)
      this.bitmap().setSelection(new Point(row, col), event.button != 2);
    this.syncBitmap(); 
  }


  //utils
  copyToCsv() {
    const selection = this.bitmap().selected;

    const minCell = {row: this.bitmap().height, col: this.bitmap().width};
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
        const cell = new Point(row, col);
        if(this.bitmap().isSelected(cell))
          data += this.bitmap().get(cell)!.toString()
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
  getCanvasHeight(): number {
    return this.bitmap().height * this.pixelSize() + (this.showHeaders() ? 30 : 0);
  }
  getCanvasWidth(): number {
    return this.bitmap().width * this.pixelSize() + (this.showHeaders() ? 30 : 0);
  }
  draw(): void {
    this.ngZone.runOutsideAngular(() => {
    window.requestAnimationFrame(() => {
        const context = this.canvasRef?.nativeElement.getContext('2d') ?? undefined;
        if (!context) return;

          this.setStyles();
          context.canvas.width = this.getCanvasWidth() * this.getPixelRatio();
          context.canvas.height = this.getCanvasHeight() * this.getPixelRatio();

          this.bitmapRenderer.render(context, this.getPixelRatio(), this.bitmap());
        }
    )});
  }
  private setStyles(){
    const headerColor = getVar('--mat-sys-surface-container');
    const selectionColor = "rgba(56, 116, 255, 1)";
    const gridColor = "#2e2e2eff";

    this.bitmapRenderer.selectionColor = this.selectionColor() || selectionColor;
    if(gridColor)
      this.bitmapRenderer.gridColor = gridColor;
    if(headerColor)
      this.bitmapRenderer.headerColor = headerColor;
    
  }
}
