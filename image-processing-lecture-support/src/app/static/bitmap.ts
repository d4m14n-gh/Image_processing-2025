import { DragArea } from "./drag-area";
import { Padding } from "./enums";
import { Point } from "./point";

export class Bitmap{
  protected _width: number;
  protected _height: number;
  protected _matrix: number[][];

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

  get width(): number {
    return this._width;
  }
  get height(): number {
    return this._height;
  }


  isOut(cell: Point): boolean {
    return cell.row < 0 || cell.row >= this._height || cell.col < 0 || cell.col >= this._width || !Number.isInteger(cell.row) || !Number.isInteger(cell.col);
  }
  get(cell: Point): number | undefined {
    if (this.isOut(cell)) return undefined;
    return this._matrix[cell.row]?.[cell.col];
  }
  getBinary(cell: Point): boolean {
    return this._matrix[cell.row]?.[cell.col] === 0;
  }
  getWithPadding(cell: Point, mode: Padding): number {
    if (!this.isOut(cell))
      return this.get(cell) ?? 0;

    if (mode == Padding.Edge) {
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
    return 0;
  }

  set(cell: Point, value: number): void {
    if(this.isOut(cell)) return;
    this._matrix[cell.row][cell.col] = value;
  }
  cells(): Point[]{
    let values: Point[] = [];
    for(let row=0;row<this._height;row++)
      for(let col=0;col<this._width;col++)
        values.push(new Point(row, col));
    return values;
  }
  pixels(): {cell: Point, value: number}[]{
    let values: {cell: Point, value: number}[] = [];

    this._matrix.forEach((row, r) => {
      row.forEach((value, c) => {
        values.push({cell: new Point(r, c), value});
      });
    });
    
    return values;
  }

  getIndexCell(index: number): Point {
    if (index < 0) return new Point(0, 0);
    if (index >= this.length()) return new Point(0, 0);
    const x = Math.trunc(index / this.width);
    const y = index % this.width;
    return new Point(x, y);
  }
  getCellIndex(cell: Point): number {
    if (this.isOut(cell)) return 0;
    return cell.row * this.width + cell.col;
  }
  length(): number {
    return this.width * this.height;
  }
}




export class InteractiveBitmap extends Bitmap {
  private _selected: Set<string>;
  private _dragArea: DragArea;  
  highlightedElement: Point | null = null;

  get dragArea(): DragArea {
    return this._dragArea;
  }
  set dragArea(drag_area: DragArea) {
    this._dragArea = drag_area;
  }
  get selected(): Point[] {
    return Array.from(this._selected).map(pos => {
      const [row, col] = pos.split(',').map(Number);
      return new Point(row, col);
    });
  }

  constructor(width: number, height: number, oldMatrix?: Bitmap, defaultValue: number = 0) {
    super(width, height, oldMatrix, defaultValue);
    this._selected = new Set();
    this._dragArea = new DragArea();
  }


  isDragged(cell: Point): boolean {
    return this._dragArea.dragging&&this._dragArea.includes(cell);
  }
  isSelected(cell: Point): boolean {
    if (this.isOut(cell)) 
      return false;
    return this._selected.has(cell.toString());
  }

  select(cell: Point): void {
    if (this.isOut(cell)) 
      return;
    this._selected.add(cell.toString());
  }
  unselect(cell: Point): void {
    if (this.isOut(cell)) 
      return;
    this._selected.delete(cell.toString());
  }
  setSelection(cell: Point, value: boolean): void {
    if (value) 
      this.select(cell);
    else 
      this.unselect(cell);
  }
  clearSelection() {
    this._selected.clear();
  }
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