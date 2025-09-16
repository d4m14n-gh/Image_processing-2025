import { Bitmap, InteractiveBitmap } from "./bitmap";
import { getContrastColor, scaleColor } from "./color-utils";
import { ColorScale } from "./enums";
import { Point } from "./point";

/** Utility class for rendering bitmaps onto a canvas. */
export class BitmapRenderer {
    /** Size of each pixel in the bitmap when rendered on the canvas. Default is 50. */
    pixelSize: number = 50;
    
    /** If true, the grid lines will be drawn. Default is true. */
    grid: boolean = true;
    /** If true, the numerical values of each cell will be displayed. Default is true. */
    numbers: boolean = true;
    /** If true, row and column headers will be displayed. Default is false. */
    headers: boolean = false;
    /** Color scale used for rendering the bitmap. Default is Grayscale. */
    colorScale: ColorScale = ColorScale.Grayscale;
    
    /** Color used for drawing the grid lines. Default is '#74777f'. */
    gridColor: string = '#74777f';
    /** Color used for the header background. Default is '#c1cce5'. */
    headerColor: string = '#c1cce5';
    /** Color used for selection highlighting. Default is '#222'. */
    selectionColor: string = "#222";


    //cursor

    /** Checks if the cursor is over a specific cell in the bitmap.
     * @param x The x-coordinate of the cursor.
     * @param y The y-coordinate of the cursor.
     * @param bitmap The bitmap to check against.
     * @returns True if the cursor is over a cell in the bitmap, false otherwise.
     */
    isCursorOnCell(x: number, y: number, bitmap: Bitmap): boolean {
       let cell = this.getCursorCell(x, y);
       return (
           x >= this.getOffsetX() &&
           y >= this.getOffsetY() &&
           cell.row >= 0 &&
           cell.row < bitmap.height &&
           cell.col >= 0 &&
           cell.col < bitmap.width
       );
    }
    /** Gets the cell coordinates (row and column) under the cursor.
     * @param x The x-coordinate of the cursor.
     * @param y The y-coordinate of the cursor.
     * @returns An object containing the row and column indices of the cell under the cursor.
     */
    getCursorCell(x: number, y: number): { row: number, col: number } {
        const { pixelSize } = this;
        const offsetX = this.getOffsetX();
        const offsetY = this.getOffsetY();

        const col = (Math.trunc((x - offsetX) / (pixelSize)));
        const row = (Math.trunc((y - offsetY) / (pixelSize)));
        return { row, col };
    }
    /** Checks if the cursor is over the column header area.
     * @param x The x-coordinate of the cursor.
     * @param y The y-coordinate of the cursor.
     * @param bitmap The bitmap to check against.
     * @returns True if the cursor is over the column header area, false otherwise.
     */
    isCursorOnColHeader(x: number, y: number, bitmap: Bitmap): boolean {
        const { pixelSize } = this;
        const offsetX = this.getOffsetX();
        const offsetY = this.getOffsetY();

        return y < offsetY && x >= offsetX && x <= offsetX + pixelSize * bitmap.width;
    }
    /** Checks if the cursor is over the row header area.
     * @param x The x-coordinate of the cursor.
     * @param y The y-coordinate of the cursor.
     * @param bitmap The bitmap to check against.
     * @returns True if the cursor is over the row header area, false otherwise.
     */
    isCursorOnRowHeader(x: number, y: number, bitmap: Bitmap): boolean {
        const { pixelSize } = this;
        const offsetX = this.getOffsetX();
        const offsetY = this.getOffsetY();
        return x < offsetX && y >= offsetY && y <= offsetY + pixelSize * bitmap.height;
    }


    //drawing
    
    /** Gets the X offset (row headers) for rendering the bitmap.
     * @returns The X offset in pixels.
     */
    private getOffsetX(): number {
        return this.headers ? 30 : 0;
    }
    /** Gets the Y offset (column headers) for rendering the bitmap.
     * @returns The Y offset in pixels.
     */
    private getOffsetY(): number {
        return this.headers ? 30 : 0;
    }
    /** Draws a string on the canvas at the specified position with the given scale and color.
     * @param ctx The 2D rendering context of the canvas.
     * @param scale The scale factor for the text size.
     * @param text The text string to be drawn.
     * @param x The x-coordinate where the text will be drawn.
     * @param y The y-coordinate where the text will be drawn.
     * @param color The color of the text.
     * @param stroke If true, the text will be stroked for better visibility. Default is false.
     */
    drawString(ctx: CanvasRenderingContext2D, scale: number, text: string, x: number, y: number, color: string, stroke: boolean=false): void {
        ctx.font = `${Math.round(scale*16)}px Roboto Mono, monospace`;
        ctx.fillStyle = color;
        
        if(stroke)
            ctx.strokeText(text, x * scale, y * scale);
        ctx.fillText(text, x * scale, y * scale);
    }
    /** Draws the grid lines on the canvas for the bitmap.
     * @param ctx The 2D rendering context of the canvas.
     * @param scale The scale factor for rendering.
     * @param bitmap The bitmap to draw the grid for.
     * @param color The color of the grid lines.
     */
    drawGrid(ctx: CanvasRenderingContext2D, scale: number, bitmap: InteractiveBitmap, color: string): void {
        const { pixelSize } = this;
        const offsetX = this.getOffsetX();
        const offsetY = this.getOffsetY();

        ctx.lineWidth = scale;
        ctx.lineWidth = 1;
        ctx.strokeStyle = color;

        for (let row = 1; row <= bitmap.height-1; row++) {
            ctx.beginPath();
            ctx.moveTo(Math.round(offsetX*scale), Math.round((row * pixelSize + offsetY)*scale) + 0.5);
            ctx.lineTo(Math.round((bitmap.width * pixelSize + offsetX)*scale), Math.round((row * pixelSize + offsetY)*scale) + 0.5);
            ctx.stroke();
        }
        for (let col = 1; col <= bitmap.width-1; col++) {
            ctx.beginPath();
            ctx.moveTo(Math.round((col * pixelSize + offsetX)*scale) + 0.5, Math.round(offsetY*scale));
            ctx.lineTo(Math.round((col * pixelSize + offsetX)*scale) + 0.5, Math.round((bitmap.height * pixelSize + offsetY)*scale));
            ctx.stroke();
        }
    }
    /** Creates a diagonal line pattern for selection highlighting.
     * @param size The size of the pattern canvas. Default is 20.
     * @param lineWidth The width of the diagonal lines. Default is 2.
     * @param color The color of the diagonal lines. Default is '#ccc'.
     * @returns A canvas element containing the diagonal line pattern.
     */
    private createDiagonalPattern(size = 20, lineWidth = 2, color = '#ccc'): HTMLCanvasElement {
        const off = document.createElement('canvas');
        off.width = size;
        off.height = size;
        const ctx = off.getContext('2d');
        if (!ctx) throw new Error('2D context not available');

        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;

        ctx.beginPath();
        ctx.moveTo(-1, size+1);
        ctx.lineTo(size+1, 0-1);
        
        ctx.moveTo(-1, size+1+size);
        ctx.lineTo(size+1, 0-1+size);
        
        ctx.moveTo(-1, size+1-size);
        ctx.lineTo(size+1, 0-1-size);
        ctx.stroke();

        return off;
    }
    /** Renders the bitmap onto the provided canvas context with the specified scale.
     * @param ctx The 2D rendering context of the canvas.
     * @param scale The scale factor for rendering.
     * @param bitmap The bitmap to be rendered.
     */
    render(ctx: CanvasRenderingContext2D, scale: number, bitmap: InteractiveBitmap): void {
        const { pixelSize, colorScale, grid, numbers, headerColor, selectionColor } = this;
        const offsetX = this.getOffsetX();
        const offsetY = this.getOffsetY();

    

        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        for (let row = 0; row < bitmap.height; row++) {
            for (let col = 0; col < bitmap.width; col++) {
                const cell = new Point(row, col);
                const value = bitmap.get(cell)!;
                const fillColor =  isNaN(value) ? 'white' : scaleColor(value, colorScale); 
                
                ctx.fillStyle = fillColor;
                ctx.fillRect(Math.round((col * pixelSize + offsetX) * scale), Math.round((row * pixelSize + offsetY) * scale), Math.ceil(pixelSize * scale), Math.ceil(pixelSize * scale));
            }
        }



        
        //grid
        if (grid) 
            this.drawGrid(ctx, scale, bitmap, this.gridColor);
        
        


        //selection
        const patternCanvas = this.createDiagonalPattern(12*scale, scale, selectionColor);
        const pattern = ctx.createPattern(patternCanvas, 'repeat');
        if (!pattern) throw new Error('Pattern creation failed');
        // const darkPatternCanvas = this.createDiagonalPattern(12*scale, scale, getContrastColor(selectionColor));
        // const darkPattern = ctx.createPattern(darkPatternCanvas, 'repeat');
        // if (!darkPattern) throw new Error('Dark pattern creation failed');


        const slwc = 3;
        ctx.lineWidth = slwc * scale;
        ctx.lineCap = "square";
        ctx.lineJoin = "miter";
        ctx.strokeStyle = selectionColor;
        for (let row = 0; row < bitmap.height; row++) {
            for (let col = 0; col < bitmap.width; col++) {
                const cell = new Point(row, col);
                const isDragged = (cell: Point) => bitmap.isDragged(cell);
                const isSel = (cell: Point) => bitmap.isSelected(cell) || bitmap.isDragged(cell);
                if(!isSel(cell)) continue;


                
                ctx.fillStyle = pattern;
                ctx.strokeStyle = selectionColor;

                // const value = bitmap.get(row, col);
                // const fillColor = scaleColor(value, colorScale); 
                // if(isDark(fillColor)){
                // }
                // else{
                //     ctx.fillStyle = darkPattern;
                //     ctx.strokeStyle = getContrastColor(selectionColor);
                // }
                if(isSel(cell) && (bitmap.dragArea.button != 2 || !isDragged(cell))){
                    const width = Math.round(((col+1) * pixelSize + offsetX) * scale)-Math.round((col * pixelSize + offsetX) * scale);
                    const height = Math.round(((row+1) * pixelSize + offsetY) * scale)-Math.round((row * pixelSize + offsetY) * scale);
                    ctx.fillRect(Math.round((col * pixelSize + offsetX) * scale), Math.round((row * pixelSize + offsetY) * scale), width, height);
                }


                //above
                if((isSel(cell)&&!isSel(cell.up())) || (isDragged(cell)&&!isDragged(cell.up()))) {
                    let slw = bitmap.isOut(cell.up()) ? slwc/2 : 0;
                    ctx.beginPath();
                    ctx.moveTo(((col * pixelSize + offsetX) * scale)+0.5,               Math.round((row * pixelSize + offsetY + slw) * scale)-0.5);
                    ctx.lineTo(((col * pixelSize + offsetX + pixelSize) * scale)-0.5,   Math.round((row * pixelSize + offsetY + slw) * scale)-0.5);
                    ctx.stroke();
                }
                //bottom
                if((isSel(cell)&&!isSel(cell.down())) || (isDragged(cell)&&!isDragged(cell.down()))) {
                    let slw = bitmap.isOut(cell.down()) ? slwc/2 : 0;
                    ctx.beginPath();
                    ctx.moveTo(Math.round((col * pixelSize + offsetX) * scale)+0.5,             Math.round((row * pixelSize + offsetY + pixelSize - slw) * scale)+0.5);
                    ctx.lineTo(Math.round((col * pixelSize + pixelSize + offsetX) * scale)-0.5, Math.round((row * pixelSize + offsetY + pixelSize - slw) * scale)+0.5);
                    ctx.stroke();
                }
                //left
                if((isSel(cell)&&!isSel(cell.left())) || (isDragged(cell)&&!isDragged(cell.left()))) {
                    let slw = bitmap.isOut(cell.left()) ? slwc/2 : 0;
                    ctx.beginPath();
                    ctx.moveTo(Math.round((col * pixelSize + offsetX + slw) * scale)-0.5,     Math.round((row * pixelSize + offsetY) * scale)+0.5);
                    ctx.lineTo(Math.round((col * pixelSize + offsetX + slw) * scale)-0.5,     Math.round((row * pixelSize + pixelSize + offsetY) * scale)-0.5);
                    ctx.stroke();
                }
                //right
                if((isSel(cell)&&!isSel(cell.right())) || (isDragged(cell)&&!isDragged(cell.right()))) {
                    let slw = bitmap.isOut(cell.right()) ? slwc/2 : 0;
                    ctx.beginPath();
                    ctx.moveTo(Math.round((col * pixelSize + offsetX + pixelSize - slw) * scale)+0.5,     Math.round((row * pixelSize + offsetY) * scale)+0.5);
                    ctx.lineTo(Math.round((col * pixelSize + offsetX + pixelSize - slw) * scale)+0.5,     Math.round((row * pixelSize + offsetY + pixelSize) * scale)-0.5);
                    ctx.stroke();
                }

            }
        }
       
        

        //numbers
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round';
        if (numbers) {
            for (let row = 0; row < bitmap.height; row++) {
                for (let col = 0; col < bitmap.width; col++) {
                    const cell = new Point(row, col);
                    const value = bitmap.get(cell)!;
                    const fillColor = isNaN(value) ? 'white' : scaleColor(value, colorScale);
                    const textColor = getContrastColor(fillColor);

                    ctx.lineWidth = scale * 4;
                    ctx.strokeStyle = fillColor;
                    this.drawString(ctx, scale, value.toString(), col * pixelSize + offsetX + pixelSize / 2, row * pixelSize + offsetY + pixelSize / 2, textColor, true);
                }
            }
        }


        //highlighted Element
        if (bitmap.highlightedElement) {
            ctx.beginPath();
            ctx.arc(
                Math.round((bitmap.highlightedElement.col * pixelSize + offsetX + pixelSize/2)*scale),
                Math.round((bitmap.highlightedElement.row * pixelSize + offsetY + pixelSize/2)*scale),
                5 * scale,
                0,
                2 * Math.PI
            );
            ctx.closePath();
            ctx.fillStyle = selectionColor;
            ctx.fill();
        }

        //headers
        ctx.fillStyle = headerColor;
        if(this.headers){
            ctx.clearRect(0, 0, offsetX * scale, offsetY * scale);
            ctx.fillRect(0, offsetY * scale, Math.round(offsetX * scale), Math.round(ctx.canvas.height));
            ctx.fillRect(offsetX*scale, 0, Math.round(ctx.canvas.width), Math.round(offsetY*scale));
            const color = getContrastColor(headerColor); 
            for (let col = 0; col < bitmap.width; col++) 
                this.drawString(ctx, scale, (col).toString(), col * pixelSize + offsetX + pixelSize / 2,  offsetY / 2, color);
            for (let row = 0; row < bitmap.height; row++) 
                this.drawString(ctx, scale, (row).toString(), offsetX / 2, row * pixelSize + offsetY + pixelSize / 2, color);
        }

    }
}