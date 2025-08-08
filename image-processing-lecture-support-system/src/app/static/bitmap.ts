export class Bitmap{
  private width: number;
  private height: number;
  private matrix: number[][];
  private selected: Set<string>;

  constructor(width: number = 10, height: number = 10, oldMatrix?: Bitmap) {
    this.width = width;
    this.height = height;
    this.matrix = Array.from({ length: height }, () => Array(width).fill(0));
    this.selected = new Set();

    // Fill with random values between 0 and 255
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        this.matrix[r][c] = Math.floor(Math.random() * 256);
      }
    }

    oldMatrix?.matrix.forEach((row, r) => {
      row.forEach((value, c) => {
        if (r < height && c < width) {
          this.matrix[r][c] = value;
        }
      });
    });
    

  }

  public getWidth(): number {
    return this.width;
  }
  public getHeight(): number {
    return this.height;
  }
  public getElement(row: number, col: number): number {
    return this.matrix[row]?.[col] ?? 0;
  }
  public isSelected(row: number, col: number): boolean {
    return this.selected.has(`${row},${col}`);
  }
  
  public selectElement(row: number, col: number): void {
    this.selected.add(`${row},${col}`);
  }
  public unselectElement(row: number, col: number): void {
    this.selected.delete(`${row},${col}`);
  }
  clearSelection() {
    this.selected.clear();
  }
  public setElement(row: number, col: number, value: number): void {
    this.matrix[row][col] = value;
  }
}