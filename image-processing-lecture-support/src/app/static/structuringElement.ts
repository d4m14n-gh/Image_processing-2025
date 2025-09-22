import { Bitmap } from "./bitmap";
import { MorphologicalOperations } from "./enums";
import { Point } from "./point";

export class StructuringElement extends Bitmap{
    origin: Point = new Point(0, 0);

    constructor(width: number, height: number, origin: Point = new Point(Math.trunc(width/2), Math.trunc(height/2)), oldMatrix?: Bitmap) {
        super(width, height, oldMatrix, 255);
        this.origin = origin;
    }

   getErosion(bitmap: Bitmap, cell: Point): boolean {
       let erosion = true;
       this.cells().forEach(structuringCell => {
           const bitmapCell = cell.add(structuringCell).subtract(this.origin);
           if(!this.getBinary(structuringCell)) return;
           if (bitmap.isOut(bitmapCell)) return;
           if (!bitmap.getBinary(bitmapCell)) 
               erosion = false;
       });
       return erosion;
   }
    private applyErosion(srcBitmap: Bitmap, dstBitmap: Bitmap) {
        srcBitmap.cells().forEach(cell => {
            dstBitmap.set(cell, this.getErosion(srcBitmap, cell) ? 0 : 255);
        });
    }
    private applyDilatation(srcBitmap: Bitmap, dstBitmap: Bitmap) {
        srcBitmap.cells().forEach(cell => {
            if (srcBitmap.getBinary(cell))
                this.cells().filter(SECell => this.getBinary(SECell)).forEach(SECell => dstBitmap.set(cell.add(SECell).subtract(this.origin), 0));
        });
    
    }
    private applyDifference(srcBitmap: Bitmap, rstBitmap: Bitmap): void {
        for(let row = 0; row < rstBitmap.height; row++)
            for(let col = 0; col < rstBitmap.width; col++){
                let cell = new Point(row, col);
                let oldValue = srcBitmap.get(cell);
                let newValue = rstBitmap.get(cell) ?? 255;
                if (newValue !== oldValue){
                    if(newValue === 0)
                        newValue = 96;
                    else
                        newValue = 192;
                }
                rstBitmap.set(cell, newValue);
            }
    }
    applyComplex(srcBitmap: Bitmap, dstBitmap: Bitmap, operation: MorphologicalOperations, difference: boolean) {
        if(operation === MorphologicalOperations.Erosion) {
            this.applyErosion(srcBitmap, dstBitmap);
        }
        else if(operation === MorphologicalOperations.Dilation) {
            this.applyDilatation(srcBitmap, dstBitmap);
        }
        else {
            let tmpBitmap = new Bitmap(srcBitmap.width, srcBitmap.height, undefined, 255);
            if(operation === MorphologicalOperations.Opening) {
                this.applyErosion(srcBitmap, tmpBitmap);
                this.applyDilatation(tmpBitmap, dstBitmap);
            }
            else if(operation === MorphologicalOperations.Closing) {
                this.applyDilatation(srcBitmap, tmpBitmap);
                this.applyErosion(tmpBitmap, dstBitmap);
            }
        }
        if(difference) 
            this.applyDifference(srcBitmap, dstBitmap);
    }
    getDilatationMask(index: number, bitmap: Bitmap): Bitmap {
        let mask = new Bitmap(bitmap.width, bitmap.height, undefined, 255);
        mask.cells().slice(0, index).forEach(cell => {
            if (bitmap.getBinary(cell))
                this.cells().filter(SECell => this.getBinary(SECell)).forEach(SECell => mask.set(cell.add(SECell).subtract(this.origin), 0));
        });
        return mask;
    }

    save(storageKey: string="structuringElement"): void {
        localStorage.setItem(storageKey, JSON.stringify(this));
    }

    load(storageKey: string="structuringElement"): void {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        try {
            const obj = JSON.parse(raw) as any;
            if (!obj || typeof obj !== 'object') return;
            const inst = Object.create(StructuringElement.prototype) as StructuringElement;
            let se: StructuringElement = Object.assign(inst, obj);
            if (se) {
                this.origin = Object.assign(Object.create(Point.prototype), se.origin);
                if(se.width)
                    this._width = se.width;
                if(se.height)
                    this._height = se.height;
                if(se._matrix)
                    this._matrix = se._matrix;
            }
        } catch { console.log("Error loading structuring element from localStorage") }
    }
}