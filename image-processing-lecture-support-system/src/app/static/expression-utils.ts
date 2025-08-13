import { AbstractControl, ValidationErrors } from "@angular/forms";
import { Bitmap, InteractiveBitmap } from "./bitmap";
import { OutOfBoundsHandling, OutOfRangeHandling, QuantizationMode } from "./enums";
import { Parser } from "expr-eval";
import * as fastNoise from 'fast-simplex-noise';

export function outOfBoundsHandle(value: number, mode: OutOfBoundsHandling, defaultValue: number): number {
    if (mode == OutOfBoundsHandling.None)
        return NaN;
    else if (mode == OutOfBoundsHandling.DefaultValue)
        return defaultValue;
    return 0;
}

export function quantizationHandle(value: number, mode: QuantizationMode): number {
    if (mode === QuantizationMode.Floor)
        return Math.floor(value);
    else if (mode === QuantizationMode.Ceil)
        return Math.ceil(value);
    return Math.round(value);
}

export function outOfRangeHandle(value: number, mode: OutOfRangeHandling): number {
    if (mode === OutOfRangeHandling.None)
        return NaN;
    else if (mode === OutOfRangeHandling.Modulo)
        return ((value % 256) + 256) % 256;
    else
        return Math.max(0, Math.min(255, value));
}

export function expressionValidator() {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value || '';
    const ret = validateExpression(value);
    if(!ret[0])
      return { 'expression': { name: ret[1], message: ret[2] } };
    return null;
  };
}


export function validateExpression(expression: string): [boolean, string?, string?] {
    const parser = new Parser();

    parser.functions.b = (x: number, y: number) => 0;
    parser.functions.simplex = (x: number, y: number, seed: number) => 0;

    const allowedVariables = ['x', 'y'];
    try {
        const parsed = parser.parse(expression);

        const variables = parsed.variables();
        for(const variable of variables){
            if(!allowedVariables.includes(variable)){
                return [false, "Invalid variable" , variable];
            }
        }

        return [true];
    } catch (err) {
        return [false, (err as Error).name, (err as Error).message];
    }
}

export function declareCustomFunctions(
    parser: Parser,
    bitmap: InteractiveBitmap,
    outOfBoundsHandling: OutOfBoundsHandling,
    defaultValue: number
){
    parser.functions.b = (x: number, y: number) => {
        const value = bitmap.get(y, x);
        if (bitmap.isOut(y, x))
            return outOfBoundsHandle(value, outOfBoundsHandling, defaultValue);
        return value;
    }
    parser.functions.simplex = (x: number, y: number, seed: number) => {
        const gen = fastNoise.makeNoise2D(() => seed);
        return gen(x / 10, y / 10);
    };
}

export function parseAndApply(
    expression: string,
    bitmap: InteractiveBitmap, 
    outOfBoundsHandling: OutOfBoundsHandling,
    outOfRangeHandling: OutOfRangeHandling,
    quantizationMode: QuantizationMode,
    defaultValue: number
) {
    const parser = new Parser();

    declareCustomFunctions(parser, bitmap, outOfBoundsHandling, defaultValue);

    const compiled = parser.parse(expression);
    const resultBitmap = new Bitmap(bitmap.getWidth(), bitmap.getHeight(), bitmap);

    for (let row = 0; row < bitmap.getHeight(); row++) {
        for (let col = 0; col < bitmap.getWidth(); col++) {
            if (bitmap.isSelected(row, col)) {
                let newValue = compiled.evaluate({ x: col, y: row });
                let quantizedValue = quantizationHandle(newValue, quantizationMode);
                let clippedValue = outOfRangeHandle(quantizedValue, outOfRangeHandling);
                resultBitmap.set(row, col, clippedValue);
            }
        }
    }

    for (let row = 0; row < bitmap.getHeight(); row++) {
        for (let col = 0; col < bitmap.getWidth(); col++) {
            bitmap.set(row, col, resultBitmap.get(row, col));
        }
    }
}