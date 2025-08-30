export enum ColorScale {
    None = 'none',
    Grayscale = 'grayscale',
    Heatmap = 'heatmap',
    Spectral = 'spectral',
    Viridis = 'viridis'
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


export enum OutOfBoundsHandling {
    None = 'none',
    Zero = 'zero',
    DefaultValue = 'default',
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
    Edge = 'edge'
}