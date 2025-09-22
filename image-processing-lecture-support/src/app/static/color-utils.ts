import chroma from "chroma-js";
import { ColorScale } from "./enums";

/** Determines if a given color is considered "dark" based on its luminance.
 * @param color The color to evaluate, in any format recognized by chroma.js.
 * @returns True if the color is dark, false otherwise.
 */
export function isDark(color: string): boolean{
  const luminance = chroma(color).luminance();
  return luminance > 0.215;
}

/** Determines a contrasting color (either dark or light) based on the luminance of the input color.
 * @param color The base color to evaluate, in any format recognized by chroma.js.
 * @returns A dark color ('rgb(26, 27, 31)') if the input color is light, or a light color ('rgb(249, 248, 244)') if the input color is dark.
 */
export function getContrastColor(color: string): string {
  const luminance = chroma(color).luminance();
  return luminance > 0.215 ? 'rgb(26, 27, 31)' : 'rgb(249, 248, 244)';
}

/** Scales a given  value to a color based on the specified color scale.
 * @param value The value to scale, typically in the range of 0 to 255.
 * @param colorScale The color scale to use for scaling (e.g., Grayscale, Heatmap, Spectral, Viridis, Binary).
 * @returns A string representing the scaled color in CSS format.
 */
export function scaleColor(value: number, colorScale: ColorScale): string {
    const chromaScale = chroma.scale(['black', 'white']);
    const heatmapScale = chroma.scale("YlOrRd");
    const spectralScale = chroma.scale("Spectral");
    const viridisScale = chroma.scale(['#440154', '#3b528b', '#21908d', '#5dc963', '#fde725']);
    const binaryScale = chroma.scale(['#000', '#333', '#e9f0ffff', '#ccc', '#fff']);
    const ratio = value / 255;
    if (colorScale === ColorScale.Grayscale) 
      return chromaScale(ratio).css();
    else if (colorScale === ColorScale.Heatmap) 
      return  heatmapScale(ratio).css();
    else if (colorScale === ColorScale.Spectral) 
      return  spectralScale(ratio).css();
    else if (colorScale === ColorScale.Viridis) 
      return viridisScale(ratio).css();
    else if (colorScale === ColorScale.Binary)
      return binaryScale(ratio).css();
    return '#ffffff';
  }