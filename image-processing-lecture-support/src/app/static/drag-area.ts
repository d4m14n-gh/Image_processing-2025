import { Point } from "./point";

export class DragArea{
    dragging: boolean = false;
    ctrlKey: boolean = false;
    button: number = 0;
    dragStart: Point = new Point(0, 0);
    dragEnd: Point = new Point(0, 0);

    includes(cell: Point): boolean {
        const select_row_start = Math.min(this.dragStart.row, this.dragEnd.row);
        const select_row_end = Math.max(this.dragStart.row, this.dragEnd.row);

        const select_col_start = Math.min(this.dragStart.col, this.dragEnd.col);
        const select_col_end = Math.max(this.dragStart.col, this.dragEnd.col);
        return cell.row <= select_row_end && cell.row >= select_row_start && cell.col <= select_col_end && cell.col >= select_col_start;
    }

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