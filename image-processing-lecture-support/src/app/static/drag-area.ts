import { Point } from "./point";

/** Class representing a draggable area defined by two points (start and end). */
export class DragArea{
    /** Indicates whether the area is currently being dragged. */
    dragging: boolean = false;
    /** Indicates whether the Ctrl key is pressed during the drag operation. */
    ctrlKey: boolean = false;
    /** Mouse button used for dragging (0: left, 1: middle, 2: right). */
    button: number = 0;
    /** Starting point of the drag operation. */
    dragStart: Point = new Point(0, 0);
    /** Ending point of the drag operation. */
    dragEnd: Point = new Point(0, 0);

    /** Checks if a given cell is within the dragged area.
     * @param cell The Point to check.
     * @returns True if the cell is within the dragged area, false otherwise.
     */
    includes(cell: Point): boolean {
        const select_row_start = Math.min(this.dragStart.row, this.dragEnd.row);
        const select_row_end = Math.max(this.dragStart.row, this.dragEnd.row);

        const select_col_start = Math.min(this.dragStart.col, this.dragEnd.col);
        const select_col_end = Math.max(this.dragStart.col, this.dragEnd.col);
        return cell.row <= select_row_end && cell.row >= select_row_start && cell.col <= select_col_end && cell.col >= select_col_start;
    }

    /** Gets all cells within the dragged area.
     * @returns An array of Points representing all cells within the dragged area.
     */
    getAreaCells(): Point[] {
        const cells: Point[] = [];
        const select_row_start = Math.min(this.dragStart.row, this.dragEnd.row);
        const select_row_end = Math.max(this.dragStart.row, this.dragEnd.row);

        const select_col_start = Math.min(this.dragStart.col, this.dragEnd.col);
        const select_col_end = Math.max(this.dragStart.col, this.dragEnd.col);

        for(let row = select_row_start; row <= select_row_end; row++){
            for(let col = select_col_start; col <= select_col_end; col++){
                cells.push(new Point(row, col));
            }
        }
        return cells;
    }
}