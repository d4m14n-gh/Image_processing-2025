import { Bitmap } from "./bitmap";
import { ColorScale, getContrastTextColor, scaleColor } from "./color-utilis";

export class BitmapRenderer {
    public static drawString(ctx: CanvasRenderingContext2D, scale: number, text: string, x: number, y: number, color: string): void {
        ctx.font = `${Math.round(scale*16)}px Roboto Mono, monospace`;
        ctx.fillStyle = color;
        ctx.fillText(text, x * scale, y * scale);
    }

    public static render(ctx: CanvasRenderingContext2D, scale: number, bitmap: Bitmap, pixelSize: number, colorScale: ColorScale, grid: boolean, numbers: boolean): void {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#c1cce5'; 
        
        const offsetX = 30;
        const offsetY = 30;
        ctx.fillRect(0, offsetY*scale, offsetX*scale, ctx.canvas.height);
        ctx.fillRect(offsetX*scale, 0, ctx.canvas.width, offsetY*scale);

        for (let row = 0; row < bitmap.getHeight(); row++) {
            for (let col = 0; col < bitmap.getWidth(); col++) {
                const value = bitmap.getElement(row, col);
                ctx.fillStyle = scaleColor(value, colorScale);
                ctx.fillRect(Math.round((col * pixelSize + offsetX) * scale), Math.round((row * pixelSize + offsetY) * scale), Math.ceil(pixelSize * scale), Math.ceil(pixelSize * scale));
            }
        }


        //grid
        ctx.strokeStyle = '#74777f';
        ctx.strokeStyle = '#262728ff';
        ctx.lineWidth = Math.floor(scale);
        ctx.lineWidth = 1;
        for (let row = 0; row <= bitmap.getHeight(); row++) {
            ctx.beginPath();
            ctx.moveTo(0, Math.round((row * pixelSize + offsetY)*scale) + 0.5);
            ctx.lineTo(Math.round(offsetX*scale), Math.round((row * pixelSize + offsetY)*scale) + 0.5);
            ctx.stroke();
        }
        for (let col = 0; col <= bitmap.getWidth(); col++) {
            ctx.beginPath();
            ctx.moveTo(Math.round((col * pixelSize + offsetX)*scale) + 0.5, 0);
            ctx.lineTo(Math.round((col * pixelSize + offsetX)*scale) + 0.5, Math.round(offsetY*scale));
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(Math.round(offsetX*scale), Math.round((offsetY)*scale) + 0.5);
        ctx.lineTo(Math.round((bitmap.getWidth() * pixelSize + offsetX)*scale), Math.round((offsetY)*scale) + 0.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(Math.round((offsetX)*scale) + 0.5, Math.round(offsetY*scale));
        ctx.lineTo(Math.round((offsetX)*scale) + 0.5, Math.round((bitmap.getHeight() * pixelSize + offsetY)*scale));
        ctx.stroke();
        if (grid) {
            for (let row = 0; row <= bitmap.getHeight()-1; row++) {
                ctx.beginPath();
                ctx.moveTo(Math.round(offsetX*scale), Math.round((row * pixelSize + offsetY)*scale) + 0.5);
                ctx.lineTo(Math.round((bitmap.getWidth() * pixelSize + offsetX)*scale), Math.round((row * pixelSize + offsetY)*scale) + 0.5);
                ctx.stroke();
            }
            for (let col = 0; col <= bitmap.getWidth()-1; col++) {
                ctx.beginPath();
                ctx.moveTo(Math.round((col * pixelSize + offsetX)*scale) + 0.5, Math.round(offsetY*scale));
                ctx.lineTo(Math.round((col * pixelSize + offsetX)*scale) + 0.5, Math.round((bitmap.getHeight() * pixelSize + offsetY)*scale));
                ctx.stroke();
            }
        }


        //numbers
        if (numbers) {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (let row = 0; row < bitmap.getHeight(); row++) {
                for (let col = 0; col < bitmap.getWidth(); col++) {
                    const value = bitmap.getElement(row, col);
                    const color = getContrastTextColor(scaleColor(value, colorScale)); 
                    this.drawString(ctx, scale, value.toString(), col * pixelSize + offsetX + pixelSize / 2, row * pixelSize + offsetY + pixelSize / 2, color);
                }
            }
        }
    }
}