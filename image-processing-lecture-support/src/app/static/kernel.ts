import { Bitmap } from "./bitmap";
import { OutOfRangeHandling, Padding, QuantizationMode } from "./enums";
import { outOfRangeHandle, quantizationHandle } from "./expression-utils";
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

    apply(bitmap: Bitmap, cell: Point, quantization: QuantizationMode, outOfRange: OutOfRangeHandling, padding: Padding): number {
        const r = Math.trunc((this._size - 1) / 2);
        let sum = 0;
        for (let oy = -r; oy <= r; oy++)
            for (let ox = -r; ox <= r; ox++) {
                let point = cell.add(new Point(oy, ox));
                sum += bitmap.getWithPadding(point, padding) * this._kernel[oy + r][ox + r] / (this._divider == 0 ? 1 : this._divider);
            }
        return outOfRangeHandle(quantizationHandle(sum, quantization), outOfRange);
    }

    values(): number[] {
        return this._kernel.flat();
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


    save(storageKey: string="kernel"): void {
        localStorage.setItem(storageKey, JSON.stringify(this));
    }

    load(storageKey: string="kernel"): void {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        try {
            const obj = JSON.parse(raw) as any;
            if (!obj || typeof obj !== 'object') return;
            const inst = Object.create(Kernel.prototype) as Kernel;
            let kernel = Object.assign(inst, obj);
            if (kernel) {
                if(kernel.kernel)
                    this._kernel = kernel.kernel;
                if(kernel.divider)
                    this._divider = kernel.divider;
            }
        } catch { }
    }
}