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

/**
 * A component for displaying and interacting with a bitmap.
 * It supports features like displaying pixels, selecting pixels, and copying data to the clipboard.
 * The component is highly customizable with options for displaying grid lines, headers, and color scales.
 */
@Component({
  selector: 'app-bitmap',
  imports: [MatCardModule],
  templateUrl: './bitmap.component.html',
  styleUrl: './bitmap.component.css'
})
export class BitmapComponent implements OnInit, OnDestroy{
  /** The bitmap (model) to display and interact with.
   * @see InteractiveBitmap
   */
  bitmap = input.required<InteractiveBitmap>();
  /** Used for refreshing bitmap. */
  tick = input<number>(0);
  /** Size of each pixel in the bitmap display (in pixels). */
  pixelSize =  input<number>(40);  
  /** If true, pixel values are displayed within each cell. */
  showNumbers =  input<boolean>(true);
  /** If true, a grid is displayed over the bitmap. */
  showGrid =  input<boolean>(true);
  /** If true, row and column headers are displayed. */
  showHeaders =  input<boolean>(false);
  /** If true, a color scale is displayed alongside the bitmap. */
  showColorScale =  input<boolean>(true);
  /** If true, user can select cells in the bitmap. */
  userSelect =  input<boolean>(true);
  /** If true, the cursor changes dynamically based on cursor position in bitmap. */
  dynamicCursor =  input<boolean>(true);
  /** The color scale used for rendering the bitmap. */
  selectedColorScale =  input<ColorScale>(ColorScale.Grayscale);
  /** The color used to highlight selected cells. */
  selectionColor =  input<string>("rgba(56, 116, 255, 1)");

  /** Event emitted when the bitmap data (bitmap input) changes (e.g., cell values or selection). */
  bitmapChanged = output<InteractiveBitmap>();
  /** Event emitted when a drag operation starts. */
  dragStarted = output<DragArea>();
  /** Event emitted when a drag operation is in progress. */
  dragMoved = output<DragArea>();
  /** Event emitted when a drag operation ends.*/
  dragEnded = output<DragArea>();
  /** Event emitted when a row header is clicked. */
  rowClicked = output<{row: number, event: MouseEvent}>();
  /** Event emitted when a column header is clicked. */
  colClicked = output<{col: number, event: MouseEvent}>();
  /** Event emitted when a cell (pixel) is clicked. */
  cellClicked = output<{cell: Point, event: MouseEvent}>();
  /** Event emitted when the cursor enters a cell (pixel). */
  cellEntered = output<{cell: Point, event: MouseEvent}>();

  /** Reference to the canvas element, used for drawing bitmap. */
  @ViewChild('canvas', { static: false }) canvasRef?: ElementRef<HTMLCanvasElement> = undefined;
  
  
  
  //private

  /** The bitmap renderer used for drawing the bitmap. */
  private _bitmapRenderer: BitmapRenderer = new BitmapRenderer();
  /** Manages drag operations for selecting cells. */
  private _dragArea: DragArea = new DragArea();
  /** If true, context menu is disabled (during drag operations). */
  private _disableContext: boolean = false;
  /** Subscription to theme changes for dynamic bitmap redrawing. */
  private _themeSubscription: Subscription = new Subscription();
  /** The currently hovered cell (pixel). */
  private _currentCell: Point | null = null;
  /** Indicates if the component has been initialized, used for preventing actions before initialization. */
  private _initialized: boolean = false;

  
  
  /**
   * Creates an instance of BitmapComponent.
   * @param ngZone Angular NgZone service for running code outside Angular's zone
   * @param themeService Angular ThemeService for managing theme changes
   */
  constructor(private ngZone: NgZone, private themeService: ThemeService) {
    this._themeSubscription = this.themeService.themeChanged.subscribe(theme => {
      this.draw();
    });
  }
  /** Lifecycle hook called after component initialization.
   * Sets up font loading and initial drawing of the bitmap.
   */
  ngOnInit(): void {
    document.fonts.ready.then(() => {
      this.draw();
    });
    this.draw();
    this._initialized = true;
  }
  /** Lifecycle hook called when input properties change.
   * Updates bitmap renderer settings and redraws the bitmap.
   * **When bitmap is internally updated, `ngOnChanges` is not called. In this case, you should call `draw()` manually. or 'tick' input properties.**
   * @param changes The changes to the input properties
   */
  ngOnChanges(_: SimpleChanges): void {
    this._bitmapRenderer.colorScale = this.selectedColorScale();
    this._bitmapRenderer.grid = this.showGrid();
    this._bitmapRenderer.headers = this.showHeaders();
    this._bitmapRenderer.numbers = this.showNumbers();
    this._bitmapRenderer.pixelSize = this.pixelSize();
    this.draw();
  }


  //listeners

  /**
   * Handles the window resize event.
   * @param event The resize event
   * @returns 
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if(!this._initialized) return;
    this._bitmapRenderer.pixelSize = this.pixelSize();
    this.draw();
  }
  /** Handles the mouse up event on the window.
   * @param event The mouse up event
   */
  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    if(!this._initialized) return;
    this.onCanvasMouseUp(event);
  }
  /** Handles the drag end event on the window.
   * @param event The drag end event
   */
  @HostListener('window:dragend', ['$event'])
  onDragEnd(event: MouseEvent): void {
    if(!this._initialized) return;
    this.onCanvasMouseUp(event);
  }
  /** Handles the mouse move event on the canvas.
   * @param event The mouse move event
   */
  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if(!this._initialized) return;
    this.onCanvasMouseMove(event);
  }
  /** Handles the right-click (context menu) event on the document.
   * If a drag operation is in progress, the context menu is disabled.
   * @param event The context menu event
   */
  @HostListener('document:contextmenu', ['$event'])
  onRightClick(event: MouseEvent): void {
    if(!this._initialized) return;
    if (this._disableContext) {
      event.preventDefault();
    }
  }
  /** Cleans up resources when the component is destroyed. */
  ngOnDestroy(): void {
    this._themeSubscription.unsubscribe();
  }

  
  
  
  //mouse events
  
  /** Calculates the cursor position relative to the canvas.
   * @param event The mouse event
   * @returns The x and y coordinates of the cursor relative to the canvas
   */
  getCursorPosition(event: MouseEvent): {x: number, y: number} {
    if (!this.canvasRef) return {x: 0, y: 0};

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return {x, y};
  }
  /** Handles the mouse down event on the canvas.
   * Initiates drag operations for selecting cells and emits relevant events.
   * @param event The mouse down event
   */
  onCanvasMouseDown(event: MouseEvent): void {
    const {x, y} = this.getCursorPosition(event);
    const {row, col} = this._bitmapRenderer.getCursorCell(x, y);
    
    if (this._bitmapRenderer.isCursorOnColHeader(x, y, this.bitmap()))
      this.colClicked.emit({col, event});
    else if (this._bitmapRenderer.isCursorOnRowHeader(x, y, this.bitmap()))
      this.rowClicked.emit({row, event});
    else if (this._bitmapRenderer.isCursorOnCell(x, y, this.bitmap()))
      this.cellClicked.emit({cell: new Point(row, col), event});
    
    
    if(event.button !== 0 && event.button !== 2) return;
    if(!this.userSelect()) return;
    window.getSelection()?.removeAllRanges();

    if (this._bitmapRenderer.isCursorOnColHeader(x, y, this.bitmap()))
      this.selectColumn(col, event);
    else if (this._bitmapRenderer.isCursorOnRowHeader(x, y, this.bitmap()))
      this.selectRow(row, event);
    else if (this._bitmapRenderer.isCursorOnCell(x, y, this.bitmap()))
      if (!this._dragArea.dragging) {
        this._dragArea.dragging = true;
        this._disableContext = true;
        this._dragArea.button = event.button;
        this._dragArea.ctrlKey = event.ctrlKey;
        this._dragArea.dragStart = new Point(row, col);
        this._dragArea.dragEnd = new Point(row, col);
        
        this.dragStarted.emit(this._dragArea);
        this.dragStart(this._dragArea);
      }
  }

  /** Handles the mouse move event on the canvas.
   * Updates drag operations for selecting cells and emits relevant events.
   * @param event The mouse move event
   */
  onCanvasMouseMove(event: MouseEvent): void {
    const {x, y} = this.getCursorPosition(event);
    let {row, col} = this._bitmapRenderer.getCursorCell(x, y);
    let cell = new Point(row, col);


    if(this.dynamicCursor()){
      // this.canvasRef.nativeElement.style.cursor = 'url("/brush.svg") 4 28, grab';
      if(this.canvasRef){
        this.canvasRef.nativeElement.style.cursor = 'default';
        if(this._bitmapRenderer.isCursorOnCell(x, y, this.bitmap()))
          this.canvasRef.nativeElement.style.cursor = 'crosshair';
      }
    }

    if(this._currentCell===null || !this._currentCell.equals(cell)){
        this._currentCell = cell;
        this.cellEntered.emit({cell, event});
    }
    
    if (event.buttons !== 0 && this._bitmapRenderer.isCursorOnCell(x, y, this.bitmap())) 
      if (window.getSelection) {
        const selection = window.getSelection();
        if (selection) selection.removeAllRanges();
      }

    if (this._dragArea.dragging) {
      
      if(row < 0) row = 0;
      if(row >= this.bitmap().height) row = this.bitmap().height - 1;
      if(col < 0) col = 0;
      if(col >= this.bitmap().width) col = this.bitmap().width - 1;

      if(this._dragArea.dragEnd.row!=row || this._dragArea.dragEnd.col!=col){
        this._dragArea.dragEnd = new Point(row, col);
        this.dragMoved.emit(this._dragArea);
        this.dragMove(this._dragArea);
      }
    }
  }

  /** Handles the mouse up event on the canvas.
   * Ends drag operations for selecting cells and emits relevant events.
   * @param event The mouse up event
   */
  onCanvasMouseUp(event: MouseEvent): void {
    if (this._dragArea.dragging && this._dragArea.button === event.button) {
      this._dragArea.dragging = false;
      setTimeout(() => this._disableContext = false, 0);
      this.dragEnded.emit(this._dragArea);
      this.dragEnd(this._dragArea);
    }
  }




  //dragging

  /** Handles the start of a drag operation.
   * @param drag_area The current drag area information
   */
  dragStart(drag_area: DragArea): void {
    if(!drag_area.ctrlKey&&drag_area.button != 2) 
      this.bitmap().clearSelection();
    this.bitmap().dragArea = drag_area;
    this.syncBitmap(); 
  }
  
  /** Handles the drag operation while the mouse is moving.
   * @param drag_area The current drag area information
   */
  dragMove(drag_area: DragArea): void {
    if(drag_area.dragging){
      this.bitmap().dragArea = drag_area;
      this.syncBitmap(); 
    }
  }
  /** Handles the end of a drag operation.
   * @param drag_area The final drag area information
   */
  dragEnd(drag_area: DragArea): void {
    this.bitmap().dragArea = drag_area;
    for(let pos of drag_area.getAreaCells())
      this.bitmap().setSelection(pos, drag_area.button != 2);
    this.syncBitmap(); 
  }




  //keys

  /** Handles key down events for the component.
   * Supports Ctrl+A for selecting all cells and Ctrl+C for copying selected cells to the clipboard.  
   * @param event The keyboard event
   */
  keyDown(event: KeyboardEvent): void {
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

  /** Selects all cells in the bitmap. */
  selectAll(): void {
    this.bitmap().cells().forEach(cell => this.bitmap().select(cell));
    this.syncBitmap(); 
  }
  /** Selects all cells in a specific row. 
   * @param row The row index to select
   * @param event The mouse event that triggered the selection
  */
  selectRow(row: number, event: MouseEvent): void {
    if(!event.ctrlKey&&event.button != 2) this.bitmap().clearSelection();
    for (let col = 0; col < this.bitmap().width; col++) 
      this.bitmap().setSelection(new Point(row, col), event.button != 2);
    this.syncBitmap(); 
  }
  /** Selects all cells in a specific column.
   * @param col The column index to select
   * @param event The mouse event that triggered the selection
   */
  selectColumn(col: number, event: MouseEvent): void {
    if(!event.ctrlKey&&event.button != 2) this.bitmap().clearSelection();
    for (let row = 0; row < this.bitmap().height; row++)
      this.bitmap().setSelection(new Point(row, col), event.button != 2);
    this.syncBitmap(); 
  }


  //utils

  /** Copies the selected cells in the bitmap to the clipboard in CSV format. */
  copyToCsv(): void {
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
  /** Synchronizes the bitmap state and redraws the bitmap. */
  syncBitmap(): void {
    this.bitmapChanged.emit(this.bitmap());
    this.draw();
  }
  /** Gets the device pixel ratio.
   * @returns The device pixel ratio
   */
  getPixelRatio(): number {
     return (window.devicePixelRatio || 1);
  }
  /** Calculates the required canvas height based on the bitmap size and pixel size.
   * @returns The calculated canvas height
   */
  getCanvasHeight(): number {
    return this.bitmap().height * this.pixelSize() + (this.showHeaders() ? 30 : 0);
  }
  /** Calculates the required canvas width based on the bitmap size and pixel size.
   * @returns The calculated canvas width
   */
  getCanvasWidth(): number {
    return this.bitmap().width * this.pixelSize() + (this.showHeaders() ? 30 : 0);
  }
  /** Draws the bitmap on the canvas using 'BitmapRenderer'.
   * @see BitmapRenderer
   */
  draw(): void {
    this.ngZone.runOutsideAngular(() => {
    window.requestAnimationFrame(() => {
        const context = this.canvasRef?.nativeElement.getContext('2d') ?? undefined;
        if (!context) return;

          this.setStyles();
          context.canvas.width = this.getCanvasWidth() * this.getPixelRatio();
          context.canvas.height = this.getCanvasHeight() * this.getPixelRatio();

          this._bitmapRenderer.render(context, this.getPixelRatio(), this.bitmap());
        }
    )});
  }
  /** Sets the styles for the bitmap renderer based on the current theme and input properties. */
  private setStyles(): void {
    const headerColor = getVar('--mat-sys-surface-container');
    const selectionColor = "rgba(56, 116, 255, 1)";
    const gridColor = "#2e2e2eff";

    this._bitmapRenderer.selectionColor = this.selectionColor() || selectionColor;
    if(gridColor)
      this._bitmapRenderer.gridColor = gridColor;
    if(headerColor)
      this._bitmapRenderer.headerColor = headerColor;
    
  }
}
