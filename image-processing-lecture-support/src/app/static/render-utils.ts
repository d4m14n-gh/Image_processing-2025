import { Bitmap, InteractiveBitmap } from "./bitmap";
import { getContrastColor, scaleColor } from "./color-utils";
import { ColorScale } from "./enums";


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
        
        if(stroke){
            ctx.strokeText(text, x * scale, y * scale);
        }
        ctx.fillText(text, x * scale, y * scale);
    }
    isCursorOnCell(x: number, y: number, bitmap: Bitmap): boolean {
       let cell = this.getCursorCell(x, y);
       return (
           cell.row >= 0 &&
           cell.row < bitmap.getHeight() &&
           cell.col >= 0 &&
           cell.col < bitmap.getWidth()
       );
    }
    getCursorCell(x: number, y: number): { row: number, col: number } {
        const { pixelSize } = this;
        const offsetX = this.getOffsetX();
        const offsetY = this.getOffsetY();

        const col = (Math.floor((x - offsetX) / (pixelSize)));
        const row = (Math.floor((y - offsetY) / (pixelSize)));
        return { row, col };
    }
    isCursorOnColHeader(x: number, y: number, bitmap: Bitmap): boolean {
        const { pixelSize } = this;
        const offsetX = this.getOffsetX();
        const offsetY = this.getOffsetY();

        return y < offsetY && x >= offsetX && x <= offsetX + pixelSize * bitmap.getWidth();
    }
    isCursorOnRowHeader(x: number, y: number, bitmap: Bitmap): boolean {
        const { pixelSize } = this;
        const offsetX = this.getOffsetX();
        const offsetY = this.getOffsetY();
        return x < offsetX && y >= offsetY && y <= offsetY + pixelSize * bitmap.getHeight();
    }

    drawGrid(ctx: CanvasRenderingContext2D, scale: number, bitmap: InteractiveBitmap, color: string): void {
        const { pixelSize } = this;
        const offsetX = this.getOffsetX();
        const offsetY = this.getOffsetY();

        ctx.lineWidth = scale;
        ctx.lineWidth = 1;
        ctx.strokeStyle = color;

        for (let row = 1; row <= bitmap.getHeight()-1; row++) {
            ctx.beginPath();
            ctx.moveTo(Math.round(offsetX*scale), Math.round((row * pixelSize + offsetY)*scale) + 0.5);
            ctx.lineTo(Math.round((bitmap.getWidth() * pixelSize + offsetX)*scale), Math.round((row * pixelSize + offsetY)*scale) + 0.5);
            ctx.stroke();
        }
        for (let col = 1; col <= bitmap.getWidth()-1; col++) {
            ctx.beginPath();
            ctx.moveTo(Math.round((col * pixelSize + offsetX)*scale) + 0.5, Math.round(offsetY*scale));
            ctx.lineTo(Math.round((col * pixelSize + offsetX)*scale) + 0.5, Math.round((bitmap.getHeight() * pixelSize + offsetY)*scale));
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

    


        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        for (let row = 0; row < bitmap.getHeight(); row++) {
            for (let col = 0; col < bitmap.getWidth(); col++) {
                const value = bitmap.get(row, col);
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
        const darkPatternCanvas = this.createDiagonalPattern(12*scale, scale, getContrastColor(selectionColor));
        const darkPattern = ctx.createPattern(darkPatternCanvas, 'repeat');
        if (!pattern) throw new Error('Pattern creation failed');
        if (!darkPattern) throw new Error('Dark pattern creation failed');

        ctx.lineWidth = 3 * scale;
        ctx.lineCap = 'square';
        ctx.lineJoin = "miter";
        ctx.strokeStyle = selectionColor;
        for (let row = 0; row < bitmap.getHeight(); row++) {
            for (let col = 0; col < bitmap.getWidth(); col++) {
                const isDragged = (r: number, c: number) => bitmap.isDragged(r, c);
                const isSel = (r: number, c: number) => bitmap.isSelected(r, c) || bitmap.isDragged(r, c);

                if(!isSel(row, col)) continue;

                const value = bitmap.get(row, col);
                const fillColor = scaleColor(value, colorScale); 
                
                // if(isDark(fillColor)){
                    ctx.fillStyle = pattern;
                    ctx.strokeStyle = selectionColor;
                // }
                // else{
                //     ctx.fillStyle = darkPattern;
                //     ctx.strokeStyle = getContrastColor(selectionColor);
                // }
                if(isSel(row, col) && (bitmap.dragArea.button != 2 || !isDragged(row, col)))
                    ctx.fillRect(Math.round((col * pixelSize + offsetX) * scale), Math.round((row * pixelSize + offsetY) * scale), Math.ceil(pixelSize * scale), Math.ceil(pixelSize * scale));

                if((isSel(row, col)&&!isSel(row-1, col)) || (isDragged(row, col)&&!isDragged(row-1, col))) {
                        
                    ctx.beginPath();
                    ctx.moveTo(((col * pixelSize + offsetX) * scale)+0.5, Math.round((row * pixelSize + offsetY) * scale)+0.5);
                    ctx.lineTo(((col * pixelSize + offsetX + pixelSize) * scale)-0.5, Math.round((row * pixelSize + offsetY) * scale)+0.5);
                    ctx.stroke();
                }
                if((isSel(row, col)&&!isSel(row+1, col)) || (isDragged(row, col)&&!isDragged(row+1, col))) {
                    ctx.beginPath();
                    ctx.moveTo(Math.round((col * pixelSize + offsetX) * scale)+0.5, Math.round((row * pixelSize + offsetY + pixelSize) * scale)-0.5);
                    ctx.lineTo(Math.round((col * pixelSize + pixelSize + offsetX) * scale)-0.5, Math.round((row * pixelSize + offsetY + pixelSize) * scale)-0.5);
                    ctx.stroke();
                }
                if((isSel(row, col)&&!isSel(row, col-1)) || (isDragged(row, col)&&!isDragged(row, col-1))) {
                    ctx.beginPath();
                    ctx.moveTo(Math.round((col * pixelSize + offsetX) * scale)+0.5, Math.round((row * pixelSize + offsetY) * scale)+0.5);
                    ctx.lineTo(Math.round((col * pixelSize + offsetX) * scale)+0.5, Math.round((row * pixelSize + pixelSize + offsetY) * scale)-0.5);
                    ctx.stroke();
                }
                if((isSel(row, col)&&!isSel(row, col+1)) || (isDragged(row, col)&&!isDragged(row, col+1))) {
                    ctx.beginPath();
                    ctx.moveTo(Math.round((col * pixelSize + offsetX + pixelSize) * scale)-0.5, Math.round((row * pixelSize + offsetY) * scale)+0.5);
                    ctx.lineTo(Math.round((col * pixelSize + offsetX + pixelSize) * scale)-0.5, Math.round((row * pixelSize + offsetY + pixelSize) * scale)-0.5);
                    ctx.stroke();
                }

            }
        }
       
        
        //numbers
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round';
        if (numbers) {
            for (let row = 0; row < bitmap.getHeight(); row++) {
                for (let col = 0; col < bitmap.getWidth(); col++) {
                    const value = bitmap.get(row, col);
                    const fillColor = isNaN(value) ? 'white' : scaleColor(value, colorScale);
                    const textColor = getContrastColor(fillColor);

                    ctx.lineWidth = scale * 4;
                    ctx.strokeStyle = fillColor;
                    this.drawString(ctx, scale, value.toString(), col * pixelSize + offsetX + pixelSize / 2, row * pixelSize + offsetY + pixelSize / 2, textColor, true);
                }
            }
        }


        //headers
        ctx.fillStyle = headerColor;
        if(this.headers){
            ctx.clearRect(0, 0, offsetX * scale, offsetY * scale);
            ctx.fillRect(0, offsetY * scale, Math.ceil(offsetX * scale), Math.ceil(ctx.canvas.height));
            ctx.fillRect(offsetX*scale, 0, Math.ceil(ctx.canvas.width), Math.ceil(offsetY*scale));
            const color = getContrastColor(headerColor); 
            for (let col = 0; col < bitmap.getWidth(); col++) 
                this.drawString(ctx, scale, (col).toString(), col * pixelSize + offsetX + pixelSize / 2,  offsetY / 2, color);
            for (let row = 0; row < bitmap.getHeight(); row++) 
                this.drawString(ctx, scale, (row).toString(), offsetX / 2, row * pixelSize + offsetY + pixelSize / 2, color);
        }

    }
}