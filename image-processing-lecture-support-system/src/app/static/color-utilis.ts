import chroma from "chroma-js";

export enum ColorScale {
    None = 'none',
    Grayscale = 'grayscale',
    Heatmap = 'heatmap',
    Spectral = 'spectral',
    Viridis = 'viridis'
}

export function colorScaleFromString(value: string): ColorScale {
  if (Object.values(ColorScale).includes(value as ColorScale)) {
    return value as ColorScale;
  }
  return ColorScale.Grayscale;
}

export function getContrastTextColor(bgColor: string): string {
  const luminance = chroma(bgColor).luminance();
  return luminance > 0.27 ? 'rgb(26, 27, 31)' : 'rgb(249, 248, 244)';
}

export function scaleColor(value: number, colorScale: ColorScale): string {
    const ratio = value / 255;
    if (colorScale === ColorScale.Grayscale) 
      return chroma.scale(['black', 'white'])(ratio).css();
    else if (colorScale === ColorScale.Heatmap) 
      return  chroma.scale("YlOrRd")(ratio).css();
    else if (colorScale === ColorScale.Spectral) 
      return  chroma.scale("Spectral")(ratio).css();
    else if (colorScale === ColorScale.Viridis) 
      return chroma.scale(['#440154', '#3b528b', '#21908d', '#5dc963', '#fde725'])(ratio).css();
    return '#ffffff';
  }