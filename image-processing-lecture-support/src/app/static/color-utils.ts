import chroma from "chroma-js";
import { ColorScale } from "./enums";

export function colorScaleFromString(value: string): ColorScale {
  if (Object.values(ColorScale).includes(value as ColorScale)) {
    return value as ColorScale;
  }
  return ColorScale.Grayscale;
}

export function isDark(color: string): boolean{
  const luminance = chroma(color).luminance();
  return luminance > 0.215;
}

export function getContrastColor(color: string): string {
  const luminance = chroma(color).luminance();
  return luminance > 0.215 ? 'rgb(26, 27, 31)' : 'rgb(249, 248, 244)';
}

const chromaScale = chroma.scale(['black', 'white']);
const heatmapScale = chroma.scale("YlOrRd");
const spectralScale = chroma.scale("Spectral");
const viridisScale = chroma.scale(['#440154', '#3b528b', '#21908d', '#5dc963', '#fde725']);

export function scaleColor(value: number, colorScale: ColorScale): string {
    const ratio = value / 255;
    if (colorScale === ColorScale.Grayscale) 
      return chromaScale(ratio).css();
    else if (colorScale === ColorScale.Heatmap) 
      return  heatmapScale(ratio).css();
    else if (colorScale === ColorScale.Spectral) 
      return  spectralScale(ratio).css();
    else if (colorScale === ColorScale.Viridis) 
      return viridisScale(ratio).css();
    return '#ffffff';
  }