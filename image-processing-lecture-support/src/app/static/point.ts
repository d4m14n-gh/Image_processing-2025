/** Class representing a point in a 2D grid with row and column coordinates. */
export class Point{
    /** Creates a new Point instance.
     * @param row The row coordinate of the point.
     * @param col The column coordinate of the point.
     */
    constructor(public row: number, public col: number) {
        
    }
    /** Creates a copy of the current Point instance.
     * @returns A new Point instance with the same row and column coordinates as the current instance.
     */
    clone(): Point {
        return new Point(this.row, this.col);
    }
    /** Adds the coordinates of another Point to the current Point.
     * @param other The Point to add.
     * @returns A new Point instance representing the sum of the two Points.
     */
    add(other: Point): Point {
        return new Point(this.row + other.row, this.col + other.col);
    }
    /** Subtracts the coordinates of another Point from the current Point.
     * @param other The Point to subtract.
     * @returns A new Point instance representing the difference between the two Points.
     */
    subtract(other: Point): Point {
        return new Point(this.row - other.row, this.col - other.col);
    }
    /** Gets the minimum coordinates between the current Point and another Point.
     * @param other The Point to compare with.
     * @returns A new Point instance with the minimum row and column coordinates.
     * For example, if the current Point is (3, 5) and the other Point is (4, 2), the result will be (3, 2).
     */
    min(other: Point): Point{
        return new Point(Math.min(this.row, other.row), Math.min(this.col, other.col)); 
    }
    /** Gets the maximum coordinates between the current Point and another Point.
     * @param other The Point to compare with.
     * @returns A new Point instance with the maximum row and column coordinates.
     * For example, if the current Point is (3, 5) and the other Point is (4, 2), the result will be (4, 5).
     */
    max(other: Point): Point{
        return new Point(Math.max(this.row, other.row), Math.max(this.col, other.col)); 
    }
    /** Moves the point one unit to the left.
     * @returns A new Point instance representing the point moved one unit to the left.
     */
    left(): Point{
        return new Point(this.row, this.col - 1);
    }
    /** Moves the point one unit to the right.
     * @returns A new Point instance representing the point moved one unit to the right.
     */
    right(): Point{
        return new Point(this.row, this.col + 1);
    }
    /** Moves the point one unit up.
     * @returns A new Point instance representing the point moved one unit up.
     */
    up(): Point{
        return new Point(this.row - 1, this.col);
    }
    /** Moves the point one unit down.
     * @returns A new Point instance representing the point moved one unit down.
     */
    down(): Point{
        return new Point(this.row + 1, this.col);
    }
    /** Limits the point's coordinates to be within the specified bounds.
     * @param max The maximum bounds as a Point instance.
     * @param min The minimum bounds as a Point instance. Default is (0, 0).
     * @returns A new Point instance with the limited coordinates.
     */
    limit(max: Point, min: Point = Point.zero): Point {
        return new Point(Math.max(min.row, Math.min(max.row, this.row)), Math.max(min.col, Math.min(max.col, this.col)));
    }
    /** Checks if the current Point is equal to another Point.
     * @param other The Point to compare with.
     * @returns True if both Points have the same row and column coordinates, false otherwise.
     */
    equals(other: Point): boolean {
        return this.row === other.row && this.col === other.col;
    }
    /** Converts the Point to a string representation.
     * @returns A string in the format "row,col".
     */
    toString(): string {
        return `${this.row},${this.col}`;
    }
    /** A Point instance representing the origin (0, 0). */
    static readonly zero: Point = new Point(0, 0);
    /** A Point instance representing the coordinates (1, 1). */
    static readonly one: Point = new Point(1, 1);
}