import { DragArea } from "./drag-area";
import { Padding } from "./enums";
import { Point } from "./point";

export class Bitmap{
  private _width: number;
  private _height: number;
  protected matrix: number[][];

  constructor(width: number = 10, height: number = 10, oldMatrix?: Bitmap, defaultValue: number = 0) {
    this._width = width;
    this._height = height;
    this.matrix = Array.from({ length: height }, () => Array(width).fill(defaultValue));

    oldMatrix?.matrix.forEach((row, r) => {
      row.forEach((value, c) => {
        if (r < height && c < width) {
          this.matrix[r][c] = value;
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


  isOut(row: number, col: number): boolean {
    return row < 0 || row >= this._height || col < 0 || col >= this._width || !Number.isInteger(row) || !Number.isInteger(col);
  }

  get(row: number, col: number): number {
    return this.matrix[row]?.[col] ?? NaN;
  }
  getWithPadding(point: Point, mode: Padding) {
    if (!this.isOut(point.row, point.col))
      return this.get(point.row, point.col);

    if (mode == Padding.Edge) {
      let row = point.col;
      let col = point.row;

      if (row < 0)
        row = 0;
      else if (row >= this.width)
        row = this.width - 1;

      if (col < 0)
        col = 0;
      else if (col >= this.height)
        col = this.height - 1;
      return this.get(col, row);
    }
    return 0;
  }


  set(row: number, col: number, value: number): void {
    this.matrix[row][col] = value;
  }
  cells(): {row: number, col: number, value: number}[]{
    let values: {row: number, col: number, value: number}[] = [];

    this.matrix.forEach((row, r) => {
      row.forEach((value, c) => {
        values.push({row: r, col: c, value});
      });
    });
    
    return values;
  }
}



export class InteractiveBitmap extends Bitmap {
  private _selected: Set<string>;
  private _drag_area: DragArea;

  constructor(width: number, height: number, oldMatrix?: Bitmap, defaultValue: number = 0) {
    super(width, height, oldMatrix, defaultValue);
    this._selected = new Set();
    this._drag_area = new DragArea();
  }

  isDragged(row: number, col: number): boolean {
    return this._drag_area.dragging&&this._drag_area.includes(row, col);
  }
  get dragArea(): DragArea {
    return this._drag_area;
  }
  set dragArea(drag_area: DragArea) {
    this._drag_area = drag_area;
  }
  get selected(): {row: number, col: number}[] {
    return Array.from(this._selected).map(pos => {
      const [row, col] = pos.split(',').map(Number);
      return {row, col};
    });
  }

  isSelected(row: number, col: number): boolean {
    if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
      return false;
    }
    return this._selected.has(`${row},${col}`);
  }

  select(row: number, col: number): void {
    if (row < 0 || row >= this.height || col < 0 || col >= this.width) 
      return;
    this._selected.add(`${row},${col}`);
  }
  unselect(row: number, col: number): void {
    this._selected.delete(`${row},${col}`);
  }
  setSelection(row: number, col: number, value: boolean): void {
    if (value) 
      this.select(row, col);
    else 
      this.unselect(row, col);
  }
  clearSelection() {
    this._selected.clear();
  }
  histogram(groupSize: number = 1, selectedOnly: boolean): number[]{
    let histogram = Array(Math.ceil(256/groupSize)).fill(0);
    this.matrix.forEach((row, r) => {
      row.forEach((value, c) => {
        if(!selectedOnly || (selectedOnly && this.isSelected(r, c)))
          if (!Number.isNaN(value) && value!=null && value >= 0 && value < 256) 
            histogram[Math.trunc(value/groupSize)]++;
      });
    });
    return histogram;
  }
}