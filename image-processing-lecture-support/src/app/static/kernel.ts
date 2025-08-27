import { Bitmap } from "./bitmap";
import { OutOfBoundsHandling, OutOfRangeHandling, QuantizationMode } from "./enums";
import { outOfBoundsHandle, outOfRangeHandle, quantizationHandle } from "./expression-utils";

export class Kernel {
    private _kernel: number[][] = [];
    private _size: number = 3;
    get size() {return this._size} 
    get kernel() {return this._kernel}

    constructor(size: number, kernel?: number[][]) {
        this._size = size;
        this._kernel = kernel || Array.from({ length: size }, () =>
            Array.from({ length: size }, () => 0)
        );
    }

    apply(bitmap: Bitmap, row: number, col: number, quantization: QuantizationMode, outOfRange: OutOfRangeHandling, outOfBounds: OutOfBoundsHandling): number {
        const r = Math.trunc((this._size - 1) / 2);
        let sum = 0;
        for (let oy = -r; oy <= r; oy++)
            for (let ox = -r; ox <= r; ox++) {
                if (!bitmap.isOut(row + oy, col + ox))
                    sum += bitmap.get(row + oy, col + ox) * this._kernel[oy + r][ox + r];
                else
                    sum += outOfBoundsHandle(outOfBounds, 255) * this._kernel[oy + r][ox + r];
            }
        return outOfRangeHandle(quantizationHandle(sum, quantization), outOfRange);
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