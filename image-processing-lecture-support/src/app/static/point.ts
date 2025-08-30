export class Point{
    constructor(public row: number, public col: number) {

    }
    add(other: Point): Point {
        return new Point(this.row + other.row, this.col + other.col);
    }
}