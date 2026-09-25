// lib/color-utils.ts
import chroma from 'chroma-js';
import colorNamer from 'color-namer';

// ============ COLOR FORMATS ============

export const COLOR_FORMATS = [
  { value: 'hex', label: 'HEX', symbol: '#', example: '#FF0000' },
  { value: 'rgb', label: 'RGB', symbol: 'rgb()', example: 'rgb(255, 0, 0)' },
  { value: 'hsl', label: 'HSL', symbol: 'hsl()', example: 'hsl(0, 100%, 50%)' },
  { value: 'hsv', label: 'HSV', symbol: 'hsv()', example: 'hsv(0, 100%, 100%)' },
  { value: 'cmyk', label: 'CMYK', symbol: 'cmyk()', example: 'cmyk(0, 100%, 100%, 0%)' },
];

// ============ LRU CACHE ============

class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 500) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

const colorNameCache = new LRUCache<string, any>(500);
const thirdColorCache = new LRUCache<string, ColorSuggestion[]>(200);

// ============ HEX SANITIZATION ============

export function sanitizeHex(value: string): string {
  if (!value) return '';

  let clean = value.trim().replace(/^#/, '');

  if (/^[a-fA-F0-9]{3}$/i.test(clean)) {
    clean = clean.split('').map(c => c + c).join('');
  }

  const hexMatch = clean.match(/^([a-fA-F0-9]{6})/);
  return hexMatch ? hexMatch[1] : '';
}

export function isValidHex(value: string): boolean {
  return /^[a-fA-F0-9]{6}$/i.test(sanitizeHex(value));
}

// ============ COLOR FAMILY DETECTION ============

function getColorFamilyByHue(hue: number): string {
  if (isNaN(hue)) return 'Gray';

  const h = ((hue % 360) + 360) % 360;

  const families = [
    { name: 'Red', range: [340, 20] },
    { name: 'Red-Orange', range: [20, 40] },
    { name: 'Orange', range: [40, 60] },
    { name: 'Yellow', range: [60, 90] },
    { name: 'Yellow-Green', range: [90, 120] },
    { name: 'Green', range: [120, 165] },
    { name: 'Cyan', range: [165, 210] },
    { name: 'Blue', range: [210, 250] },
    { name: 'Blue-Purple', range: [250, 275] },
    { name: 'Purple', range: [275, 310] },
    { name: 'Pink', range: [310, 340] },
  ];

  for (const family of families) {
    const [start, end] = family.range;
    if (start > end) {
      if (h >= start || h <= end) return family.name;
    } else {
      if (h >= start && h <= end) return family.name;
    }
  }

  return 'Color';
}

export function getColorFamily(hex: string): string {
  const cleanHex = sanitizeHex(hex);
  if (!cleanHex) return 'Color';

  try {
    const color = chroma(`#${cleanHex}`);
    const hsl = color.hsl();
    const h = Math.round(hsl[0] || 0);
    return getColorFamilyByHue(h);
  } catch {
    return 'Color';
  }
}

// ============ COLOR NAME ============

export function getColorName(hex: string): string {
  const cleanHex = sanitizeHex(hex);
  if (!cleanHex) return 'Invalid Color';

  const cached = colorNameCache.get(cleanHex);
  if (cached) return cached.name;

  try {
    const color = chroma(`#${cleanHex}`);
    const hsl = color.hsl();
    const s = Math.round(hsl[1] * 100);
    const l = Math.round(hsl[2] * 100);

    // Grayscale fast path
    if (s < 10) {
      let name = 'Gray';
      if (l < 20) name = 'Black';
      else if (l < 40) name = 'Dark Gray';
      else if (l < 60) name = 'Gray';
      else if (l < 80) name = 'Light Gray';
      else name = 'White';

      colorNameCache.set(cleanHex, { name, family: 'Gray' });
      return name;
    }

    const result = colorNamer(`#${cleanHex}`);

    let name = '';
    const paletteOrder = ['ntc', 'pantone', 'css', 'html', 'x11', 'basic'];

    for (const paletteName of paletteOrder) {
      const palette = (result as any)[paletteName];
      if (palette && Array.isArray(palette) && palette.length > 0) {
        name = palette[0].name;
        break;
      }
    }

    if (!name) {
      const keys = Object.keys(result);
      for (const key of keys) {
        const palette = (result as any)[key];
        if (palette && Array.isArray(palette) && palette.length > 0) {
          name = palette[0].name;
          break;
        }
      }
    }

    if (!name) name = 'Custom Color';

    let finalName = name
      .replace(/#[0-9a-f]{6}/gi, '')
      .replace(/\([^)]*\)/g, '')
      .trim();

    finalName = finalName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    const family = getColorFamily(cleanHex);
    colorNameCache.set(cleanHex, { name: finalName, family });

    return finalName;
  } catch {
    return 'Custom Color';
  }
}

// ============ COLOR INFO ============

export function getColorInfo(hex: string) {
  const cleanHex = sanitizeHex(hex);
  if (!cleanHex) {
    return {
      name: 'Invalid Color',
      family: 'Unknown',
      hex: '#000000',
      hsl: { hue: 0, saturation: 0, lightness: 0 },
      rgb: null,
      hsv: null,
      cmyk: null,
      contrast: '#FFFFFF',
      isValid: false,
    };
  }

  try {
    const color = chroma(`#${cleanHex}`);
    const hsl = color.hsl();
    const h = Math.round(hsl[0] || 0);
    const s = Math.round(hsl[1] * 100);
    const l = Math.round(hsl[2] * 100);

    return {
      name: getColorName(cleanHex),
      family: getColorFamily(cleanHex),
      hex: `#${cleanHex.toUpperCase()}`,
      hsl: { hue: h, saturation: s, lightness: l },
      rgb: hexToRgb(cleanHex),
      hsv: hexToHsv(cleanHex),
      cmyk: hexToCmyk(cleanHex),
      contrast: getContrastColor(cleanHex),
      isValid: true,
    };
  } catch {
    return {
      name: 'Custom Color',
      family: 'Unknown',
      hex: `#${cleanHex.toUpperCase()}`,
      hsl: { hue: 0, saturation: 0, lightness: 0 },
      rgb: null,
      hsv: null,
      cmyk: null,
      contrast: '#FFFFFF',
      isValid: false,
    };
  }
}

// ============ CONVERSIONS ============

export function hexToRgb(hex: string): string | null {
  const rgb = hexToRgbArray(hex);
  if (!rgb) return null;
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

export function hexToRgbArray(hex: string): [number, number, number] | null {
  const clean = sanitizeHex(hex);
  if (!clean) return null;

  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16),
  ];
}

export function rgbToHex(rgb: [number, number, number]): string {
  const [r, g, b] = rgb.map(v => Math.max(0, Math.min(255, Math.round(v))));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
}

export function hexToHsl(hex: string): string | null {
  const rgb = hexToRgbArray(hex);
  if (!rgb) return null;
  return rgbToHslString(rgb);
}

export function rgbToHslString(rgb: [number, number, number]): string {
  const [r, g, b] = rgb.map(v => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

export function hexToHsv(hex: string): string | null {
  const rgb = hexToRgbArray(hex);
  if (!rgb) return null;
  return rgbToHsvString(rgb);
}

export function rgbToHsvString(rgb: [number, number, number]): string {
  const [r, g, b] = rgb.map(v => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }

  const s = max === 0 ? 0 : d / max;
  const v = max;

  return `hsv(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(v * 100)}%)`;
}

export function hexToCmyk(hex: string): string | null {
  const rgb = hexToRgbArray(hex);
  if (!rgb) return null;
  return rgbToCmykString(rgb);
}

export function rgbToCmykString(rgb: [number, number, number]): string {
  const [r, g, b] = rgb.map(v => v / 255);
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return 'cmyk(0%, 0%, 0%, 100%)';

  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);

  return `cmyk(${Math.round(c * 100)}%, ${Math.round(m * 100)}%, ${Math.round(y * 100)}%, ${Math.round(k * 100)}%)`;
}

export function getContrastColor(hex: string): string {
  const rgb = hexToRgbArray(hex);
  if (!rgb) return '#FFFFFF';

  const [r, g, b] = rgb;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// ============ PARSERS ============

export function parseRgb(value: string): [number, number, number] | null {
  const clean = value.replace(/\s/g, '').toLowerCase();
  const match = clean.match(/^rgba?\(([^)]+)\)$/);
  if (!match) return null;

  const parts = match[1].split(',').filter(p => p !== '');
  if (parts.length < 3) return null;

  const values = parts.slice(0, 3).map(p => {
    if (p.endsWith('%')) return (parseFloat(p) / 100) * 255;
    return parseFloat(p);
  });

  if (values.some(v => isNaN(v) || v < 0 || v > 255)) return null;
  return values.map(v => Math.round(v)) as [number, number, number];
}

export function hslToRgb(value: string): [number, number, number] | null {
  const clean = value.replace(/\s/g, '').toLowerCase();
  const match = clean.match(/^hsla?\(([^)]+)\)$/);
  if (!match) return null;

  let parts = match[1].split(',').filter(p => p !== '');
  if (parts.length === 1) {
    const spaceParts = match[1].split(/[\s/]+/).filter(p => p !== '');
    if (spaceParts.length >= 3) parts = spaceParts;
  }

  if (parts.length < 3) return null;

  let h = parseFloat(parts[0]);
  let s = parseFloat(parts[1].replace('%', ''));
  let l = parseFloat(parts[2].replace('%', ''));

  if (isNaN(h) || isNaN(s) || isNaN(l)) return null;

  h = (((h % 360) + 360) % 360) / 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }

  const hueToRgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return [
    Math.round(hueToRgb(p, q, h + 1 / 3) * 255),
    Math.round(hueToRgb(p, q, h) * 255),
    Math.round(hueToRgb(p, q, h - 1 / 3) * 255),
  ];
}

export function hsvToRgb(value: string): [number, number, number] | null {
  const clean = value.replace(/\s/g, '').toLowerCase();
  const match = clean.match(/^(?:hsv|hsb)\(([^)]+)\)$/);
  if (!match) return null;

  let parts = match[1].split(',').filter(p => p !== '');
  if (parts.length === 1) {
    const spaceParts = match[1].split(/[\s/]+/).filter(p => p !== '');
    if (spaceParts.length >= 3) parts = spaceParts;
  }

  if (parts.length < 3) return null;

  let h = parseFloat(parts[0]);
  let s = parseFloat(parts[1].replace('%', ''));
  let v = parseFloat(parts[2].replace('%', ''));

  if (isNaN(h) || isNaN(s) || isNaN(v)) return null;

  h = (((h % 360) + 360) % 360) / 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  v = Math.max(0, Math.min(100, v)) / 100;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r = 0, g = 0, b = 0;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export function cmykToRgb(value: string): [number, number, number] | null {
  const clean = value.replace(/\s/g, '').toLowerCase();
  const match = clean.match(/^cmyk\(([^)]+)\)$/);
  if (!match) return null;

  const parts = match[1].split(',').filter(p => p !== '');
  if (parts.length < 4) return null;

  const [c, m, y, k] = parts.map(p => parseFloat(p.replace('%', '')));

  if ([c, m, y, k].some(v => isNaN(v) || v < 0 || v > 100)) return null;

  return [
    Math.round(255 * (1 - c / 100) * (1 - k / 100)),
    Math.round(255 * (1 - m / 100) * (1 - k / 100)),
    Math.round(255 * (1 - y / 100) * (1 - k / 100)),
  ];
}

// ============ CONVERT ============

export function convertColor(value: string, fromFormat: string, toFormat: string): string | null {
  let rgb: [number, number, number] | null = null;

  switch (fromFormat) {
    case 'hex': rgb = hexToRgbArray(value); break;
    case 'rgb': rgb = parseRgb(value); break;
    case 'hsl': rgb = hslToRgb(value); break;
    case 'hsv': rgb = hsvToRgb(value); break;
    case 'cmyk': rgb = cmykToRgb(value); break;
    default: return null;
  }

  if (!rgb) return null;

  switch (toFormat) {
    case 'hex': return rgbToHex(rgb);
    case 'rgb': return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    case 'hsl': return rgbToHslString(rgb);
    case 'hsv': return rgbToHsvString(rgb);
    case 'cmyk': return rgbToCmykString(rgb);
    default: return null;
  }
}

export function parseColorToRgb(value: string): [number, number, number] | null {
  try {
    const color = chroma(value);
    const rgb = color.rgb();
    return [Math.round(rgb[0]), Math.round(rgb[1]), Math.round(rgb[2])];
  } catch {
    const parsers = [hexToRgbArray, parseRgb, hslToRgb, hsvToRgb, cmykToRgb];
    for (const parser of parsers) {
      const result = parser(value);
      if (result) return result;
    }
    return null;
  }
}

// ============ COLOR HARMONY UTILITIES ============

export type HarmonyType =
  | 'complementary'
  | 'triadic'
  | 'split-complementary'
  | 'analogous'
  | 'tetradic'
  | 'monochromatic';

export interface ColorSuggestion {
  hex: string;
  name: string;
  family: string;
  reason: string;
  harmony: HarmonyType;
  contrastWith: { [hex: string]: number };
  score: number;
  wcagLevel: 'AAA' | 'AA' | 'AA-Large' | 'FAIL';
  minContrast: number;
}

// Helper: HSL to hex
function hslToHex(h: number, s: number, l: number): string {
  return chroma.hsl(((h % 360) + 360) % 360, s, l).hex().toUpperCase();
}

// Helper: get hue from hex
function getHue(hex: string): number {
  try {
    return chroma(`#${sanitizeHex(hex)}`).hsl()[0] || 0;
  } catch {
    return 0;
  }
}

// Helper: is dark?
function isDark(hex: string): boolean {
  try {
    return chroma(`#${sanitizeHex(hex)}`).get('hsl.l') < 0.25;
  } catch {
    return false;
  }
}

// Helper: is red-ish?
function isRedish(hex: string): boolean {
  const h = getHue(hex);
  return h >= 340 || h <= 20;
}

// Helper: WCAG contrast ratio
function contrastRatio(hex1: string, hex2: string): number {
  try {
    return chroma.contrast(`#${sanitizeHex(hex1)}`, `#${sanitizeHex(hex2)}`);
  } catch {
    return 1;
  }
}

// Helper: determine WCAG level from a pair of contrast ratios
function getWcagLevel(c1: number, c2: number): 'AAA' | 'AA' | 'AA-Large' | 'FAIL' {
  const min = Math.min(c1, c2);
  if (min >= 7) return 'AAA';
  if (min >= 4.5) return 'AA';
  if (min >= 3) return 'AA-Large';
  return 'FAIL';
}

// ============ HARMONY GENERATORS ============

export function getComplementary(hex: string): string {
  const h = getHue(hex);
  return hslToHex(h + 180, 0.75, 0.5);
}

export function getTriadic(hex: string): string[] {
  const h = getHue(hex);
  return [hslToHex(h + 120, 0.7, 0.5), hslToHex(h + 240, 0.7, 0.5)];
}

export function getSplitComplementary(hex: string): string[] {
  const h = getHue(hex);
  return [hslToHex(h + 150, 0.7, 0.5), hslToHex(h + 210, 0.7, 0.5)];
}

export function getAnalogous(hex: string): string[] {
  const h = getHue(hex);
  return [hslToHex(h - 30, 0.7, 0.5), hslToHex(h + 30, 0.7, 0.5)];
}

// ============ LIGHTNESS-AWARE CANDIDATE GENERATOR ============
// For mid-lightness base colors, generate lighter/darker variants of harmony colors

function generateLightnessVariants(
  baseHex: string,
  targetHex: string
): string[] {
  try {
    const baseL = chroma(`#${sanitizeHex(baseHex)}`).get('hsl.l');
    const target = chroma(`#${sanitizeHex(targetHex)}`);
    const [h, s] = target.hsl();

    // Generate 3 variants: lighter, much lighter, darker
    const variants: string[] = [];

    // Lighten (to ensure contrast with mid-tone base)
    if (baseL < 0.7) {
      variants.push(chroma.hsl(h, s, Math.min(0.9, baseL + 0.35)).hex().toUpperCase());
      variants.push(chroma.hsl(h, s, Math.min(0.95, baseL + 0.5)).hex().toUpperCase());
    }

    // Darken
    if (baseL > 0.3) {
      variants.push(chroma.hsl(h, s, Math.max(0.1, baseL - 0.35)).hex().toUpperCase());
    }

    return variants;
  } catch {
    return [];
  }
}

// ============ THIRD COLOR FINDER (MAIN - FIXED) ============

/**
 * Find third color that matches with two base colors.
 *
 * Scoring prioritizes MIN contrast (worst-case legibility) over AVG,
 * so suggestions are honest about accessibility.
 *
 * @param baseColor1 First base color (hex)
 * @param baseColor2 Second base color (hex)
 * @param limit       Max suggestions to return
 * @param options     Contrast thresholds
 */
export function findThirdColors(
  baseColor1: string,
  baseColor2: string,
  limit: number = 5,
  options: {
    minContrast?: number;       // hard floor for "usable" (default 3.0)
    preferredContrast?: number; // ideal target (default 4.5)
  } = {}
): ColorSuggestion[] {
  const { minContrast = 3.0, preferredContrast = 4.5 } = options;

  const c1 = sanitizeHex(baseColor1);
  const c2 = sanitizeHex(baseColor2);
  if (!c1 || !c2) return [];

  const cacheKey = `${c1}-${c2}-${limit}-${minContrast}-${preferredContrast}`;
  const cached = thirdColorCache.get(cacheKey);
  if (cached) return cached;

  const hex1 = `#${c1}`;
  const hex2 = `#${c2}`;

  const candidates: Array<{ hex: string; reason: string; harmony: HarmonyType }> = [];

  const dark1 = isDark(hex1);
  const dark2 = isDark(hex2);
  const red1 = isRedish(hex1);
  const red2 = isRedish(hex2);

  // Special: Black + Red
  if ((dark1 && red2) || (dark2 && red1)) {
    candidates.push(
      { hex: '#FFFFFF', reason: 'Classic high-contrast white', harmony: 'complementary' },
      { hex: '#D4AF37', reason: 'Luxury gold accent', harmony: 'triadic' },
      { hex: '#C0C0C0', reason: 'Modern silver gray', harmony: 'monochromatic' },
      { hex: '#F5F5DC', reason: 'Soft cream elegance', harmony: 'analogous' },
      { hex: '#36454F', reason: 'Charcoal depth', harmony: 'monochromatic' },
      { hex: '#FFD700', reason: 'Bold gold pop', harmony: 'triadic' },
      { hex: '#1E90FF', reason: 'Dodger blue contrast', harmony: 'complementary' },
      { hex: '#F0E68C', reason: 'Khaki warmth', harmony: 'analogous' }
    );
  } else {
    // General color-theory case
    const primary = red1 || red2 ? (red1 ? hex1 : hex2) : hex1;
    const secondary = primary === hex1 ? hex2 : hex1;

    // Complementary
    const comp = getComplementary(primary);
    candidates.push({ hex: comp, reason: 'Complementary to primary', harmony: 'complementary' });
    // Add light/dark variants to escape mid-tone trap
    for (const v of generateLightnessVariants(hex1, comp)) {
      candidates.push({ hex: v, reason: 'Complementary (tonal shift)', harmony: 'complementary' });
    }

    // Triadic
    for (const t of getTriadic(primary)) {
      candidates.push({ hex: t, reason: 'Triadic harmony', harmony: 'triadic' });
      for (const v of generateLightnessVariants(hex1, t)) {
        candidates.push({ hex: v, reason: 'Triadic (tonal shift)', harmony: 'triadic' });
      }
    }

    // Split-complementary
    for (const sc of getSplitComplementary(primary)) {
      candidates.push({ hex: sc, reason: 'Split-complementary balance', harmony: 'split-complementary' });
      for (const v of generateLightnessVariants(hex1, sc)) {
        candidates.push({ hex: v, reason: 'Split-complementary (tonal shift)', harmony: 'split-complementary' });
      }
    }

    // Analogous to secondary
    for (const a of getAnalogous(secondary)) {
      candidates.push({ hex: a, reason: 'Analogous to secondary', harmony: 'analogous' });
    }

    // Neutral anchors
    candidates.push(
      { hex: '#FFFFFF', reason: 'Pure white anchor', harmony: 'monochromatic' },
      { hex: '#F8F8F8', reason: 'Off-white anchor', harmony: 'monochromatic' },
      { hex: '#000000', reason: 'Pure black anchor', harmony: 'monochromatic' },
      { hex: '#1A1A1A', reason: 'Near-black anchor', harmony: 'monochromatic' },
      { hex: '#808080', reason: 'Neutral gray bridge', harmony: 'monochromatic' },
      { hex: '#404040', reason: 'Dark gray bridge', harmony: 'monochromatic' },
      { hex: '#D0D0D0', reason: 'Light gray bridge', harmony: 'monochromatic' }
    );
  }

  // ===== SCORE & DEDUPE (FIXED FORMULA) =====
  const seen = new Set<string>();
  const scored: ColorSuggestion[] = [];

  for (const cand of candidates) {
    const hex = cand.hex.toUpperCase();
    if (seen.has(hex)) continue;
    seen.add(hex);

    const contrast1 = contrastRatio(hex, hex1);
    const contrast2 = contrastRatio(hex, hex2);

    // ✅ KEY FIX: use MIN contrast as primary metric
    const minC = Math.min(contrast1, contrast2);
    const avgC = (contrast1 + contrast2) / 2;

    // Base score from min contrast (heavily weighted)
    // min=1 → 0, min=3 → 43, min=4.5 → 64, min=7 → 90, min=10+ → 100
    let score = Math.min(100, (minC / 7) * 90);

    // Small bonus from avg (rewards balance)
    score += Math.min(10, avgC);

    // Hard penalty if either side below min threshold
    if (contrast1 < minContrast || contrast2 < minContrast) {
      score -= 50;
    }

    // Hard reject: nearly identical to a base
    if (contrast1 < 2.0 || contrast2 < 2.0) {
      score = Math.min(score, 15);
    }

    // WCAG bonuses
    if (contrast1 >= preferredContrast && contrast2 >= preferredContrast) {
      score += 20;
    }
    if (contrast1 >= 7 && contrast2 >= 7) {
      score += 10;
    }

    // Harmony bonus
    const harmonyBonus: Record<HarmonyType, number> = {
      complementary: 10,
      triadic: 8,
      'split-complementary': 7,
      analogous: 5,
      tetradic: 4,
      monochromatic: 3,
    };
    score += harmonyBonus[cand.harmony];

    score = Math.max(0, Math.min(100, score));

    scored.push({
      hex,
      name: getColorName(hex),
      family: getColorFamily(hex),
      reason: cand.reason,
      harmony: cand.harmony,
      contrastWith: {
        [hex1.toUpperCase()]: Number(contrast1.toFixed(2)),
        [hex2.toUpperCase()]: Number(contrast2.toFixed(2)),
      },
      score: Math.round(score),
      wcagLevel: getWcagLevel(contrast1, contrast2),
      minContrast: Number(minC.toFixed(2)),
    });
  }

  // Sort by score, take top N
  const result = scored.sort((a, b) => b.score - a.score).slice(0, limit);

  thirdColorCache.set(cacheKey, result);
  return result;
}

// ============ BASE COLOR ANALYSIS ============

export interface BaseAnalysis {
  levelDiff: number; // 0-1 lightness difference
  hueDiff: number;   // 0-360 hue difference
  isBalanced: boolean;
  warning: string | null;
  suggestion: { base: 'base1' | 'base2'; newHex: string; reason: string } | null;
}

/**
 * Analyze whether the two base colors are "balanced" enough to yield
 * good third-color matches. If not, suggest an adjustment.
 */
export function analyzeBaseColors(base1: string, base2: string): BaseAnalysis {
  const c1 = sanitizeHex(base1);
  const c2 = sanitizeHex(base2);

  if (!c1 || !c2) {
    return {
      levelDiff: 0,
      hueDiff: 0,
      isBalanced: false,
      warning: 'Invalid hex colors.',
      suggestion: null,
    };
  }

  const col1 = chroma(`#${c1}`);
  const col2 = chroma(`#${c2}`);

  const l1 = col1.get('hsl.l');
  const l2 = col2.get('hsl.l');
  const h1 = col1.get('hsl.h');
  const h2 = col2.get('hsl.h');

  const levelDiff = Math.abs(l1 - l2);
  const hueDiff = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2));

  // Same lightness + similar hue = bad
  const isBalanced = levelDiff >= 0.25 || hueDiff >= 90;

  if (isBalanced) {
    return { levelDiff, hueDiff, isBalanced: true, warning: null, suggestion: null };
  }

  // Suggest lightening the darker one or darkening the lighter one
  const adjustBase: 'base1' | 'base2' = l1 < l2 ? 'base1' : 'base2';
  const target = adjustBase === 'base1' ? col1 : col2;
  const targetL = adjustBase === 'base1' ? l1 : l2;

  const newL = targetL < 0.5 ? Math.min(0.9, targetL + 0.35) : Math.max(0.1, targetL - 0.35);
  const newHex = target.set('hsl.l', newL).hex().toUpperCase();

  return {
    levelDiff,
    hueDiff,
    isBalanced: false,
    warning:
      'Base colors have similar lightness — third color contrast kammi ah irukkum. ' +
      'One base ah lighten illa darken panna better results kidaikum.',
    suggestion: {
      base: adjustBase,
      newHex,
      reason: `Adjust lightness to ${Math.round(newL * 100)}% for stronger contrast`,
    },
  };
}

// ============ TRIO PALETTE BUILDER ============

export interface ColorTrio {
  primary: string;
  secondary: string;
  accent: string;
  accentInfo: ColorSuggestion;
  wcagAA: boolean;
}

export function buildTrio(
  base1: string,
  base2: string,
  preferredAccent?: string
): ColorTrio | null {
  const suggestions = findThirdColors(base1, base2, 10);
  if (suggestions.length === 0) return null;

  let accent: ColorSuggestion | undefined;

  if (preferredAccent) {
    const clean = `#${sanitizeHex(preferredAccent)}`.toUpperCase();
    accent = suggestions.find(s => s.hex === clean);
  }

  if (!accent) accent = suggestions[0];

  const hex1 = `#${sanitizeHex(base1)}`.toUpperCase();
  const hex2 = `#${sanitizeHex(base2)}`.toUpperCase();
  const c1 = accent.contrastWith[hex1] ?? 1;
  const c2 = accent.contrastWith[hex2] ?? 1;

  return {
    primary: hex1,
    secondary: hex2,
    accent: accent.hex,
    accentInfo: accent,
    wcagAA: c1 >= 4.5 && c2 >= 4.5,
  };
}

// ============ CACHE HELPERS ============

export function clearColorNameCache(): void {
  colorNameCache.clear();
}

export function clearThirdColorCache(): void {
  thirdColorCache.clear();
}

export function clearAllCaches(): void {
  colorNameCache.clear();
  thirdColorCache.clear();
}

// ============ PRE-CACHE ============

export function preCacheColorNames() {
  const commonColors = [
    'ff0000', '00ff00', '0000ff', 'ffff00', 'ff00ff', '00ffff',
    '000000', 'ffffff', '808080', 'ffa500', 'ffc0cb', '8b5cf6',
    'ef4444', '3b82f6', '22c55e', 'eab308', 'ec4899', 'f97316',
    '06b6d4', '6366f1', '14b8a6', 'f43f5e', 'f59e0b', '84cc16',
    '10b981', '0ea5e9', 'd946ef', 'fb7185', '1e293b', '4b5563',
  ];

  for (const hex of commonColors) {
    getColorName(hex);
  }
}

if (typeof window === 'undefined') {
  preCacheColorNames();
}