// lib/color-utils.ts
import chroma from 'chroma-js';
import colorNamer from 'color-namer';

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

// ============ MAIN COLOR NAME FUNCTION ============

export function getColorName(hex: string): string {
  const cleanHex = sanitizeHex(hex);
  if (!cleanHex) return 'Invalid Color';
  
  // Check cache
  const cached = colorNameCache.get(cleanHex);
  if (cached) return cached.name;
  
  try {
    const color = chroma(`#${cleanHex}`);
    const hsl = color.hsl();
    const s = Math.round(hsl[1] * 100);
    const l = Math.round(hsl[2] * 100);
    
    // For grayscale, use simple naming (fast path)
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
    
    // Use color-namer for accurate color names
    const result = colorNamer(`#${cleanHex}`);
    
    // Type-safe way to get the best name
    let name = '';
    
    // Define the palette order (most accurate first)
    const paletteOrder = ['ntc', 'pantone', 'css', 'html', 'x11', 'basic'];
    
    // Try each palette in order
    for (const paletteName of paletteOrder) {
      // Type assertion to access dynamic property
      const palette = (result as any)[paletteName];
      if (palette && Array.isArray(palette) && palette.length > 0) {
        name = palette[0].name;
        break;
      }
    }
    
    // If no name found, try any palette
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
    
    // Final fallback
    if (!name) {
      name = 'Custom Color';
    }
    
    // Clean up the name
    let finalName = name
      .replace(/#[0-9a-f]{6}/gi, '')
      .replace(/\([^)]*\)/g, '')
      .trim();
    
    // Capitalize first letter of each word
    finalName = finalName.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
    
    // Get family
    const family = getColorFamily(cleanHex);
    
    // Cache result
    colorNameCache.set(cleanHex, { name: finalName, family });
    
    return finalName;
    
  } catch (error) {
    return 'Custom Color';
  }
}

// ============ GET COMPLETE COLOR INFO ============

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
      isValid: false
    };
  }
  
  try {
    const color = chroma(`#${cleanHex}`);
    const hsl = color.hsl();
    const h = Math.round(hsl[0] || 0);
    const s = Math.round(hsl[1] * 100);
    const l = Math.round(hsl[2] * 100);
    
    const name = getColorName(cleanHex);
    const family = getColorFamily(cleanHex);
    
    return {
      name,
      family,
      hex: `#${cleanHex.toUpperCase()}`,
      hsl: { hue: h, saturation: s, lightness: l },
      rgb: hexToRgb(cleanHex),
      hsv: hexToHsv(cleanHex),
      cmyk: hexToCmyk(cleanHex),
      contrast: getContrastColor(cleanHex),
      isValid: true
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
      isValid: false
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
    parseInt(clean.substring(4, 6), 16)
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

// ============ COLOR PARSERS ============

export function parseRgb(value: string): [number, number, number] | null {
  const clean = value.replace(/\s/g, '').toLowerCase();
  const match = clean.match(/^rgba?\(([^)]+)\)$/);
  if (!match) return null;
  
  const parts = match[1].split(',').filter(p => p !== '');
  if (parts.length < 3) return null;
  
  const values = parts.slice(0, 3).map(p => {
    if (p.endsWith('%')) {
      return parseFloat(p) / 100 * 255;
    }
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
  
  h = (h % 360 + 360) % 360 / 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  
  const hueToRgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  
  return [
    Math.round(hueToRgb(p, q, h + 1/3) * 255),
    Math.round(hueToRgb(p, q, h) * 255),
    Math.round(hueToRgb(p, q, h - 1/3) * 255)
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
  
  h = (h % 360 + 360) % 360 / 360;
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
    Math.round(255 * (1 - y / 100) * (1 - k / 100))
  ];
}

// ============ CONVERT COLOR ============

export function convertColor(value: string, fromFormat: string, toFormat: string): string | null {
  let rgb: [number, number, number] | null = null;
  
  switch (fromFormat) {
    case 'hex':
      rgb = hexToRgbArray(value);
      break;
    case 'rgb':
      rgb = parseRgb(value);
      break;
    case 'hsl':
      rgb = hslToRgb(value);
      break;
    case 'hsv':
      rgb = hsvToRgb(value);
      break;
    case 'cmyk':
      rgb = cmykToRgb(value);
      break;
    default:
      return null;
  }
  
  if (!rgb) return null;
  
  switch (toFormat) {
    case 'hex':
      return rgbToHex(rgb);
    case 'rgb':
      return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    case 'hsl':
      return rgbToHslString(rgb);
    case 'hsv':
      return rgbToHsvString(rgb);
    case 'cmyk':
      return rgbToCmykString(rgb);
    default:
      return null;
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

// ============ CLEAR CACHE ============

export function clearColorNameCache(): void {
  colorNameCache.clear();
}

// ============ PRE-CACHE COMMON COLORS ============

export function preCacheColorNames() {
  const commonColors = [
    'ff0000', '00ff00', '0000ff', 'ffff00', 'ff00ff', '00ffff',
    '000000', 'ffffff', '808080', 'ffa500', 'ffc0cb', '8b5cf6',
    'ef4444', '3b82f6', '22c55e', 'eab308', 'ec4899', 'f97316',
    '06b6d4', '6366f1', '14b8a6', 'f43f5e', 'f59e0b', '84cc16',
    '10b981', '0ea5e9', 'd946ef', 'fb7185', '1e293b', '4b5563'
  ];
  
  for (const hex of commonColors) {
    getColorName(hex);
  }
}

// ============ PRE-CACHE ON IMPORT ============
if (typeof window === 'undefined') {
  preCacheColorNames();
}