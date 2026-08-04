export interface ColorData {
  hex: string;
  name: string;
  rgb: string;
  hsl: string;
  hsv: string;
  cmyk: string;
  luminance: number;
  contrastColor: string;
}

export interface ColorHarmony {
  name: string;
  colors: string[];
}

export interface ColorShade {
  name: string;
  color: string;
}

export interface Gradient {
  name: string;
  css: string;
}

export interface ColorConversion {
  format: string;
  value: string;
}