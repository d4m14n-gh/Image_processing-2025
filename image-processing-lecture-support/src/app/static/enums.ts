export enum ColorScale {
    None = 'none',
    Grayscale = 'grayscale',
    Heatmap = 'heatmap',
    Spectral = 'spectral',
    Viridis = 'viridis',
    Binary = 'binary',
}

export enum SelectionMode {
    All = 'all',
    Selected = 'selected'
}

export enum OutOfRangeHandling {
    None = 'none',
    Clipping = 'clipping',
    Modulo = 'modulo'
}

export enum QuantizationMode {
    Round = 'round',
    Floor = 'floor',
    Ceil = 'ceil'
}

export enum Themes{
    Light = 'light',
    Dark = 'dark'
}

export enum Padding{
    Zero = 'zero',
    DefaultValue = 'default',
    Edge = 'edge'
}

export enum MorphologicalOperations {
    Erosion = 'erosion',
    Dilation = 'dilation',
    Opening = 'opening',
    Closing = 'closing'
}