import { DragArea } from "./drag-area";
import { Padding } from "./enums";
import { Point } from "./point";


/** * Represents a 2D bitmap with pixel values and provides methods for accessing and manipulating the bitmap.
 * The bitmap is stored as a 2D array of numbers, where each number represents a pixel value.
 * The class provides methods for getting and setting pixel values, checking if a pixel is out of bounds,
 * and retrieving the dimensions of the bitmap.
 */   
export class Bitmap{
  /** The width of the bitmap (number of columns). */
  protected _width: number;
  /** The height of the bitmap (number of rows). */
  protected _height: number;
  /** The 2D array representing the bitmap, where each element is a pixel value. */
  protected _matrix: number[][];

  /** Creates a new Bitmap instance with the specified width, height, and optional default pixel value.
   * If an old matrix is provided, it copies the values from the old matrix to the new one, up to the new dimensions.
   * @param width The width of the bitmap (number of columns). Default is 10.
   * @param height The height of the bitmap (number of rows). Default is 10.
   * @param oldMatrix An optional old Bitmap instance to copy values from.
   * @param defaultValue The default pixel value to use for uninitialized pixels. Default is 0.
   */
  constructor(width: number = 10, height: number = 10, oldMatrix?: Bitmap, defaultValue: number = 0) {
    this._width = width;
    this._height = height;
    this._matrix = Array.from({ length: height }, () => Array(width).fill(defaultValue));

    oldMatrix?._matrix?.forEach((row, r) => {
      row.forEach((value, c) => {
        if (r < height && c < width) {
          this._matrix[r][c] = value;
        }
      });
    });
  }

  /** Gets the width of the bitmap.
   * @returns The width of the bitmap (number of columns).
   */
  get width(): number {
    return this._width;
  }
  /** Gets the height of the bitmap.
   * @returns The height of the bitmap (number of rows).
   */
  get height(): number {
    return this._height;
  }

  /** Checks if the specified cell is out of the bounds of the bitmap.
   * @param cell The cell to check, represented as a Point object with row and column properties.
   * @returns True if the cell is out of bounds, false otherwise.
   */
  isOut(cell: Point): boolean {
    return cell.row < 0 || cell.row >= this._height || cell.col < 0 || cell.col >= this._width || !Number.isInteger(cell.row) || !Number.isInteger(cell.col);
  }
  /** Gets the pixel value at the specified cell.
   * @param cell The cell to get the pixel value from, represented as a Point object with row and column properties.
   * @returns The pixel value at the specified cell, or undefined if the cell is out of bounds.
   */
  get(cell: Point): number | undefined {
    if (this.isOut(cell)) return undefined;
    return this._matrix[cell.row]?.[cell.col];
  }
  /** Gets the binary value (0 or 1) at the specified cell.
   * A value of 0 is considered "true" (black), and any other value is considered "false" (white).
   * @param cell The cell to get the binary value from, represented as a Point object with row and column properties.
   * @returns True if the pixel value is 0, false otherwise.
   */
  getBinary(cell: Point): boolean {
    return this._matrix[cell.row]?.[cell.col] === 0;
  }
  /** Gets the pixel value at the specified cell, applying padding if the cell is out of bounds.
   * If the cell is out of bounds, the method applies the specified padding mode.
   * @param cell The cell to get the pixel value from, represented as a Point object with row and column properties.
   * @param padding The padding mode to apply if the cell is out of bounds.
   * @param defaultValue The default value to return if the cell is out of bounds and the padding mode is Padding.DefaultValue.
   * @returns The pixel value at the specified cell, or the padded value if the cell is out of bounds.
   */
  getWithPadding(cell: Point, padding: Padding, defaultValue: number = 255): number {
    if (!this.isOut(cell))
      return this.get(cell) ?? 0;

    if (padding == Padding.Edge) {
      let row = cell.row;
      let col = cell.col;

      if (row < 0)
        row = 0;
      else if (row >= this.height)
        row = this.height - 1;

      if (col < 0)
        col = 0;
      else if (col >= this.width)
        col = this.width - 1;
      return this.get(new Point(row, col)) ?? 0;
    }
    else if (padding == Padding.DefaultValue){
      return defaultValue;
    }
    return 0;
  }

  /** Sets the pixel value at the specified cell.
    * If the cell is out of bounds, the method does nothing.
    * @param cell The cell to set the pixel value at, represented as a Point object with row and column properties.
    * @param value The pixel value to set at the specified cell.
  */
  set(cell: Point, value: number): void {
    if(this.isOut(cell)) return;
    this._matrix[cell.row][cell.col] = value;
  }
  /** Gets all cells in the bitmap as an array of Point objects.
   * @returns An array of Point objects representing all cells in the bitmap.
   */
  cells(): Point[]{
    let values: Point[] = [];
    for(let row=0;row<this._height;row++)
      for(let col=0;col<this._width;col++)
        values.push(new Point(row, col));
    return values;
  }
  /** Gets all pixels in the bitmap as an array of objects containing the cell (Point) and its value.
   * @returns An array of objects, each containing a 'cell' property (Point) and a 'value' property (number).
   */
  pixels(): {cell: Point, value: number}[]{
    let values: {cell: Point, value: number}[] = [];

    this._matrix.forEach((row, r) => {
      row.forEach((value, c) => {
        values.push({cell: new Point(r, c), value});
      });
    });
    
    return values;
  }

  /** Gets the cell (Point) corresponding to the specified linear index.
   * If the index is out of bounds, it returns a Point(0, 0).
   * @param index The linear index to convert to a cell (Point).
   * @returns A Point object representing the cell at the specified index, or Point(0, 0) if the index is out of bounds.
   */
  getIndexCell(index: number): Point {
    if (index < 0) return new Point(0, 0);
    if (index >= this.length()) return new Point(0, 0);
    const x = Math.trunc(index / this.width);
    const y = index % this.width;
    return new Point(x, y);
  }
  /** Gets the linear index corresponding to the specified cell (Point).
   * If the cell is out of bounds, it returns 0.
   * @param cell The cell (Point) to convert to a linear index.
   * @returns The linear index corresponding to the specified cell, or 0 if the cell is out of bounds.
   */
  getCellIndex(cell: Point): number {
    if (this.isOut(cell)) return 0;
    return cell.row * this.width + cell.col;
  }
  /** Gets the total number of pixels in the bitmap.
   * @returns The total number of pixels in the bitmap (width * height).
   */
  length(): number {
    return this.width * this.height;
  }
}



/** * Represents an interactive bitmap that extends the Bitmap class with additional features for selection and dragging.
 * This class adds functionality for selecting and dragging cells within the bitmap, as well as highlighting a specific element.
 * It also provides methods for managing the selection state and calculating histograms based on the selected pixels.
 * @extends Bitmap
 */
export class InteractiveBitmap extends Bitmap {
  /** The set of selected cells, represented as strings in the format "row,col". */
  private _selected: Set<string>;
  /** The drag area for managing dragging operations within the bitmap. */
  private _dragArea: DragArea;  
  /** The currently highlighted element, or null if no element is highlighted. Used in morphological operations. */
  highlightedElement: Point | null = null;

  /** Gets the drag area for managing dragging operations within the bitmap. */
  get dragArea(): DragArea {
    return this._dragArea;
  }
  /** Sets the drag area for managing dragging operations within the bitmap. */
  set dragArea(drag_area: DragArea) {
    this._dragArea = drag_area;
  }
  /** Gets the currently selected cells as an array of Point objects.
   * @returns An array of Point objects representing the selected cells.
   */
  get selected(): Point[] {
    return Array.from(this._selected).map(pos => {
      const [row, col] = pos.split(',').map(Number);
      return new Point(row, col);
    });
  }

  /** Creates a new InteractiveBitmap instance with the specified width, height, and optional default pixel value.
   * If an old matrix is provided, it copies the values from the old matrix to the new one, up to the new dimensions.
   * Initializes the selection set and drag area.
    * @param width The width of the bitmap (number of columns).
    * @param height The height of the bitmap (number of rows).
    * @param oldMatrix An optional old Bitmap instance to copy values from.
    * @param defaultValue The default pixel value to use for uninitialized pixels. Default is 255 (white). 
  */
  constructor(width: number, height: number, oldMatrix?: Bitmap, defaultValue: number = 255) {
    super(width, height, oldMatrix, defaultValue);
    this._selected = new Set();
    this._dragArea = new DragArea();
  }

  /** Checks if the specified cell is currently being dragged.
   * @param cell The cell to check, represented as a Point object with row and column properties.
   * @returns True if the cell is being dragged, false otherwise.
   */
  isDragged(cell: Point): boolean {
    return this._dragArea.dragging&&this._dragArea.includes(cell);
  }
  /** Checks if the specified cell is currently selected.
   * @param cell The cell to check, represented as a Point object with row and column properties.
   * @returns True if the cell is selected, false otherwise.
   */
  isSelected(cell: Point): boolean {
    if (this.isOut(cell)) 
      return false;
    return this._selected.has(cell.toString());
  }

  /** Selects the specified cell.
   * If the cell is out of bounds, the method does nothing.
   * @param cell The cell to select, represented as a Point object with row and column properties.
   */
  select(cell: Point): void {
    if (this.isOut(cell)) 
      return;
    this._selected.add(cell.toString());
  }
  /** Unselects the specified cell.
   * If the cell is out of bounds, the method does nothing.
   * @param cell The cell to unselect, represented as a Point object with row and column properties.
   */
  unselect(cell: Point): void {
    if (this.isOut(cell)) 
      return;
    this._selected.delete(cell.toString());
  }
  /** Sets the selection state of the specified cell.
   * If the cell is out of bounds, the method does nothing.
   * @param cell The cell to set the selection state for, represented as a Point object with row and column properties.
   * @param value True to select the cell, false to unselect it.
   */
  setSelection(cell: Point, value: boolean): void {
    if (value) 
      this.select(cell);
    else 
      this.unselect(cell);
  }
  /** Clears the current selection, unselecting all selected cells. */
  clearSelection(): void {
    this._selected.clear();
  }
  /** Calculates the histogram of pixel values in the bitmap.
   * The histogram is calculated based on the specified group size and whether to include only selected pixels.
   * @param groupSize The size of each group in the histogram. Default is 1 (individual pixel values).
   * @param selectedOnly If true, only selected pixels are included in the histogram.
   * @returns An array representing the histogram of pixel values.
   */
  histogram(groupSize: number = 1, selectedOnly: boolean): number[] {
    let histogram = Array(Math.ceil(256 / groupSize)).fill(0);

    this.pixels().forEach(
      pixel => {
        if (!selectedOnly || (selectedOnly && this.isSelected(pixel.cell)))
          if (!Number.isNaN(pixel.value))
            histogram[Math.trunc(pixel.value / groupSize)]++;
      }
    );

    return histogram;
  }
}