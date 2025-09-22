/** Enumeration for different color scales used in bitmap display. */
export enum ColorScale {
    None = 'none',
    Grayscale = 'grayscale',
    Heatmap = 'heatmap',
    Spectral = 'spectral',
    Viridis = 'viridis',
    Binary = 'binary',
}

/** Enumeration for handling out-of-range pixel values. */
export enum OutOfRangeHandling {
    None = 'none',
    Clipping = 'clipping',
    Modulo = 'modulo'
}

/** Enumeration for different quantization modes. */
export enum QuantizationMode {
    Round = 'round',
    Floor = 'floor',
    Ceil = 'ceil'
}

/** Enumeration for application themes. */
export enum Themes{
    Light = 'light',
    Dark = 'dark'
}

/** Enumeration for different padding strategies when applying filters. */
export enum Padding{
    Zero = 'zero',
    DefaultValue = 'default',
    Edge = 'edge'
}

/** Enumeration for different morphological operations. */
export enum MorphologicalOperations {
    Erosion = 'erosion',
    Dilation = 'dilation',
    Opening = 'opening',
    Closing = 'closing'
}