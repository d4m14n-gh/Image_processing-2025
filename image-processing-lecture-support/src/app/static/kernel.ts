import { Bitmap } from "./bitmap";
import { OutOfBoundsHandling, OutOfRangeHandling, Padding, QuantizationMode } from "./enums";
import { outOfBoundsHandle, outOfRangeHandle, quantizationHandle } from "./expression-utils";
import { Point } from "./point";

export class Kernel {
    private _divider: number = 1;
    private _kernel: number[][] = [];
    private _size: number = 3;
    get size() {return this._size} 
    get kernel() {return this._kernel}
    set divider(value: number) { this._divider = Math.round(value == 0 ? 1 : value); }
    get divider() { return this._divider; }

    constructor(size: number, kernel?: number[][]) {
        this._size = size;
        this._kernel = kernel || Array.from({ length: size }, () =>
            Array.from({ length: size }, () => 0)
        );
    }

    apply(bitmap: Bitmap, row: number, col: number, quantization: QuantizationMode, outOfRange: OutOfRangeHandling, padding: Padding): number {
        const r = Math.trunc((this._size - 1) / 2);
        let sum = 0;
        for (let oy = -r; oy <= r; oy++)
            for (let ox = -r; ox <= r; ox++) {
                let point = new Point(row + oy, col + ox);
                sum += bitmap.getWithPadding(point, padding) * this._kernel[oy + r][ox + r] / (this._divider == 0 ? 1 : this._divider);
            }
        return outOfRangeHandle(quantizationHandle(sum, quantization), outOfRange);
    }

    clone(): Kernel{
        const clone = new Kernel(this._size);
        clone._kernel = this._kernel.map(row => [...row]);
        clone._divider = this._divider;
        return clone;
    }

    toLatex(): string {
        const transposed = this._kernel[0].map((_, colIndex) =>
            this._kernel.map(row => row[colIndex])
        );
        const rows = transposed.map(row => row.join(' & '));
        const body = rows.join(' \\\\ \n');
        return `\\begin{bmatrix}
        ${body}
        \\end{bmatrix}`;
    }


    save(): string {
        return JSON.stringify(this);
    }

    static tryLoad(raw: string | null): Kernel | null {
        if (!raw) return null;
        try {
            const obj = JSON.parse(raw) as any;
            if (!obj || typeof obj !== 'object') return null;
            const inst = Object.create(Kernel.prototype) as Kernel;
            return Object.assign(inst, obj);
        } catch {
            return null;
        }
    }
}