import { Bitmap, InteractiveBitmap } from "./bitmap";
import { getContrastColor, scaleColor } from "./color-utils";
import { ColorScale } from "./enums";
import { Point } from "./point";


export class BitmapRenderer {
    
    pixelSize: number = 50;
    
    grid: boolean = true;
    numbers: boolean = true;
    headers: boolean = false;
    
    colorScale: ColorScale = ColorScale.Grayscale;
    
    gridColor: string = '#74777f';
    headerColor: string = '#c1cce5';
    selectionColor: string = "#222";
    selectionColor2: string = "#702121ff";


    private getOffsetX(): number {
        return this.headers ? 30 : 0;
    }
    private getOffsetY(): number {
        return this.headers ? 30 : 0;
    }
    drawString(ctx: CanvasRenderingContext2D, scale: number, text: string, x: number, y: number, color: string, stroke: boolean=false): void {
        ctx.font = `${Math.round(scale*16)}px Roboto Mono, monospace`;
        ctx.fillStyle = color;
        
        if(stroke)
            ctx.strokeText(text, x * scale, y * scale);
        ctx.fillText(text, x * scale, y * scale);
    }
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
    getCursorCell(x: number, y: number): { row: number, col: number } {
        const { pixelSize } = this;
        const offsetX = this.getOffsetX();
        const offsetY = this.getOffsetY();

        const col = (Math.trunc((x - offsetX) / (pixelSize)));
        const row = (Math.trunc((y - offsetY) / (pixelSize)));
        return { row, col };
    }
    isCursorOnColHeader(x: number, y: number, bitmap: Bitmap): boolean {
        const { pixelSize } = this;
        const offsetX = this.getOffsetX();
        const offsetY = this.getOffsetY();

        return y < offsetY && x >= offsetX && x <= offsetX + pixelSize * bitmap.width;
    }
    isCursorOnRowHeader(x: number, y: number, bitmap: Bitmap): boolean {
        const { pixelSize } = this;
        const offsetX = this.getOffsetX();
        const offsetY = this.getOffsetY();
        return x < offsetX && y >= offsetY && y <= offsetY + pixelSize * bitmap.height;
    }

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