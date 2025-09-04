export class Point{
    constructor(public row: number, public col: number) {
        
    }
    clone(): Point {
        return new Point(this.row, this.col);
    }
    add(other: Point): Point {
        return new Point(this.row + other.row, this.col + other.col);
    }
    subtract(other: Point): Point {
      return new Point(this.row - other.row, this.col - other.col);
    }
    left(): Point{
        return new Point(this.row, this.col - 1);
    }
    right(): Point{
        return new Point(this.row, this.col + 1);
    }
    up(): Point{
        return new Point(this.row - 1, this.col);
    }
    down(): Point{
        return new Point(this.row + 1, this.col);
    }
    limit(max: Point, min: Point = Point.zero): Point {
        return new Point(Math.max(min.row, Math.min(max.row, this.row)), Math.max(min.col, Math.min(max.col, this.col)));
    }
    equals(other: Point): boolean {
        return this.row === other.row && this.col === other.col;
    }
    toString(): string {
        return `${this.row},${this.col}`;
    }
    static readonly zero: Point = new Point(0, 0);
}