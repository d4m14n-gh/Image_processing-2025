import { AbstractControl, ValidationErrors } from "@angular/forms";
import { Bitmap, InteractiveBitmap } from "./bitmap";
import { OutOfRangeHandling, Padding, QuantizationMode } from "./enums";
import { Parser } from "expr-eval";
import * as fastNoise from 'fast-simplex-noise';
import { Point } from "./point";

/** Handles quantization of a value based on the specified mode.
 * @param value The value to be quantized.
 * @param mode The quantization mode to apply (Round, Floor, Ceil).
 * @returns The quantized value as a number.
 */
export function quantizationHandle(value: number, mode: QuantizationMode): number {
    if (mode === QuantizationMode.Floor)
        return Math.floor(value);
    else if (mode === QuantizationMode.Ceil)
        return Math.ceil(value);
    return Math.round(value);
}

/** Handles out-of-range pixel values based on the specified mode.
 * @param value The pixel value to be handled.
 * @param mode The out-of-range handling mode (None, Clipping, Modulo).
 * @returns The handled pixel value as a number, or NaN if the mode is None and the value is out of range.
 */
export function outOfRangeHandle(value: number, mode: OutOfRangeHandling): number {
    if (value >= 0 && value <= 255) return value;
    if (mode === OutOfRangeHandling.None)
        return NaN;
    else if (mode === OutOfRangeHandling.Modulo)
        return ((value % 256) + 256) % 256;
    else
        return Math.max(0, Math.min(255, value));
}

/** Validator function to check the validity of a mathematical expression.
 * @returns A validation function that can be used in Angular forms.
 */
export function expressionValidator(): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value || '';
    const ret = validateExpression(value);
    if(!ret[0])
      return { 'expression': { name: ret[1], message: ret[2] } };
    return null;
  };
}

/** Validates a mathematical expression to ensure it only contains allowed variables and functions.
 * @param expression The expression string to validate.
 * @returns A tuple where the first element is a boolean indicating validity, and the second and third elements are optional error name and message.
 */
export function validateExpression(expression: string): [boolean, string?, string?] {
    const parser = new Parser();

    declareCustomFunctions(parser, new InteractiveBitmap(10, 10), Padding.Zero, 0);

    const allowedVariables = ['x', 'y', 'v'];
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

/** Declares custom functions and constants in the expression parser for bitmap manipulation.
 * @param parser The expression parser to which functions and constants will be added.
 * @param bitmap The bitmap used for pixel value retrieval.
 * @param padding The padding mode to apply when retrieving pixel values.
 * @param defaultValue The default value to use when a pixel is out of bounds.
 */
export function declareCustomFunctions(
    parser: Parser,
    bitmap: InteractiveBitmap,
    padding: Padding,
    defaultValue: number
): void{
    parser.functions.b = (x: number, y: number) => {
        const cell = new Point(y, x);
        return bitmap.getWithPadding(cell, padding, defaultValue);
    }
    parser.functions.simplex = (x: number, y: number, seed: number) => {
        const gen = fastNoise.makeNoise2D(() => seed);
        return gen(x / 10, y / 10);
    };
    parser.consts.WIDTH = bitmap.width;
    parser.consts.HEIGHT = bitmap.height;
    parser.consts.RANDOM = Math.random();
}

/** Parses and applies a mathematical expression to a bitmap, producing a new bitmap with the results.
 * @param expression The mathematical expression to apply.
 * @param bitmap The source bitmap to which the expression will be applied.
 * @param padding The padding mode to use when accessing pixel values.
 * @param outOfRangeHandling The mode for handling out-of-range pixel values.
 * @param quantizationMode The mode for quantizing pixel values.
 * @param defaultValue The default pixel value to use when a pixel is out of bounds.
 * @param selectedOnly If true, the expression is applied only to selected pixels in the bitmap.
 * @returns A new Bitmap instance containing the results of applying the expression.
 */
export function parseAndApply(
    expression: string,
    bitmap: InteractiveBitmap, 
    padding: Padding,
    outOfRangeHandling: OutOfRangeHandling,
    quantizationMode: QuantizationMode,
    defaultValue: number,
    selectedOnly: boolean
): Bitmap {
    const parser = new Parser();

    declareCustomFunctions(parser, bitmap, padding, defaultValue);

    const compiled = parser.parse(expression);
    const resultBitmap = new Bitmap(bitmap.width, bitmap.height, bitmap);

    for (let row = 0; row < bitmap.height; row++) {
        for (let col = 0; col < bitmap.width; col++) {
            const cell = new Point(row, col);
            if (!selectedOnly || bitmap.isSelected(cell)) {
                const cell = new Point(row, col);
                let newValue = compiled.evaluate({ x: col, y: row, v: bitmap.get(cell) ?? defaultValue });
                if(typeof newValue !== 'number' || isNaN(newValue)) continue;
                let quantizedValue = quantizationHandle(newValue, quantizationMode);
                let clippedValue = outOfRangeHandle(quantizedValue, outOfRangeHandling);
                resultBitmap.set(cell, clippedValue);
            }
        }
    }

    return resultBitmap;
}