export class DragArea{
    dragging: boolean = false;
    ctrlKey: boolean = false;
    button: number = 0;
    dragStart: {row: number, col: number} = {row: 0, col: 0};
    dragEnd: {row: number, col: number} = {row: 0, col: 0};

    includes(row: number, col: number): boolean {
        const select_row_start = Math.min(this.dragStart.row, this.dragEnd.row);
        const select_row_end = Math.max(this.dragStart.row, this.dragEnd.row);

        const select_col_start = Math.min(this.dragStart.col, this.dragEnd.col);
        const select_col_end = Math.max(this.dragStart.col, this.dragEnd.col);
        return row <= select_row_end && row >= select_row_start && col <= select_col_end && col >= select_col_start;
    }

    getAreaCells(){
        const cells: {row: number, col: number}[] = [];
        const select_row_start = Math.min(this.dragStart.row, this.dragEnd.row);
        const select_row_end = Math.max(this.dragStart.row, this.dragEnd.row);

        const select_col_start = Math.min(this.dragStart.col, this.dragEnd.col);
        const select_col_end = Math.max(this.dragStart.col, this.dragEnd.col);

        for(let row = select_row_start; row <= select_row_end; row++){
            for(let col = select_col_start; col <= select_col_end; col++){
                cells.push({row, col});
            }
        }
        return cells;
    }
}