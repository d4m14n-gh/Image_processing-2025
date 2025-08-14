import { DragArea } from "./drag-area";

export class Bitmap{
  private width: number;
  private height: number;
  private matrix: number[][];

  constructor(width: number = 10, height: number = 10, oldMatrix?: Bitmap, defaultValue: number = 0) {
    this.width = width;
    this.height = height;
    this.matrix = Array.from({ length: height }, () => Array(width).fill(defaultValue));

    oldMatrix?.matrix.forEach((row, r) => {
      row.forEach((value, c) => {
        if (r < height && c < width) {
          this.matrix[r][c] = value;
        }
      });
    });
  }

  getWidth(): number {
    return this.width;
  }
  getHeight(): number {
    return this.height;
  }
  get(row: number, col: number): number {
    return this.matrix[row]?.[col] ?? NaN;
  }
  isOut(row: number, col: number): boolean {
    return row < 0 || row >= this.height || col < 0 || col >= this.width;
  }
  set(row: number, col: number, value: number): void {
    this.matrix[row][col] = value;
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
    if (row < 0 || row >= this.getHeight() || col < 0 || col >= this.getWidth()) {
      return false;
    }
    return this._selected.has(`${row},${col}`);
  }

  select(row: number, col: number): void {
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
}