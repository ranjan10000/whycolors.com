// lib/shade-generator.ts
import chroma from 'chroma-js';
import colorNamer from 'color-namer';
import { sanitizeHex, hexToRgbArray } from '@/lib/color-utils';

/* ============================================================
 * TYPES
 * ============================================================ */

export interface Shade {
  id: string;
  hex: string;
  name: string | null;
  type: 'tint' | 'shade' | 'tone' | 'light' | 'dark';
  lightness: number;
  saturation: number;
  hue: number;
  luminance: number;
}

interface RawShade {
  hex: string;
  type: 'tint' | 'shade' | 'tone' | 'light' | 'dark';
  originalIndex: number;
  originalTotal: number;
}

/* ============================================================
 * CONSTANTS
 * ============================================================ */

const MIN_LIGHTNESS = 0.18;   // avoid dark brown/maroon
const MAX_LIGHTNESS = 0.85;   // avoid near-white
const MIN_SATURATION = 0.15;  // absolute floor (avoid gray)
const HUE_TOLERANCE = 25;     // base hue ±25°

// ✅ Lightness-aware saturation requirements
// Dark shades → higher saturation needed (avoid brown)
// Light shades → lower saturation ok
const SAT_REQUIREMENT = {
  dark: 0.30,    // lightness < 0.35
  medium: 0.22,  // lightness 0.35–0.55
  light: 0.15,   // lightness > 0.55
};

const DARK_LIGHTNESS_THRESHOLD = 0.35;
const MEDIUM_LIGHTNESS_THRESHOLD = 0.55;

const TINT_COUNT = 30;
const SHADE_COUNT = 30;
const TONE_COUNT = 30;
const LIGHT_COUNT = 15;
const DARK_COUNT = 15;

/* ============================================================
 * LRU CACHE FOR COLOR NAMES
 * ============================================================ */

class ColorNameCache {
  private cache = new Map<string, string>();
  private maxSize = 1000;

  get(hex: string): string | null {
    return this.cache.get(hex) || null;
  }

  set(hex: string, name: string): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(hex, name);
  }

  clear(): void {
    this.cache.clear();
  }
}

const nameCache = new ColorNameCache();

/* ============================================================
 * COLOR NAMING
 * ============================================================ */

export function getShadeColorName(hex: string): string | null {
  try {
    const cached = nameCache.get(hex);
    if (cached) return cached;

    const cleanHex = hex.replace('#', '');
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
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    nameCache.set(hex, finalName);
    return finalName;
  } catch {
    return null;
  }
}

export function generateShadeName(
  hex: string,
  type: string,
  index: number,
  total: number
): string {
  const colorName = getShadeColorName(hex);

  if (colorName) {
    if (index === 0) return `${colorName} Base`;

    const percent =
      total > 1 ? Math.min(100, Math.max(0, (index / (total - 1)) * 100)) : 0;

    let suffix = '';

    switch (type) {
      case 'tint':
        if (percent < 25) suffix = 'Light';
        else if (percent < 50) suffix = 'Lighter';
        else if (percent < 75) suffix = 'Very Light';
        else suffix = 'Ultra Light';
        break;
      case 'shade':
        if (percent < 25) suffix = 'Dark';
        else if (percent < 50) suffix = 'Darker';
        else if (percent < 75) suffix = 'Very Dark';
        else suffix = 'Ultra Dark';
        break;
      case 'tone':
        if (percent < 25) suffix = 'Muted';
        else if (percent < 50) suffix = 'More Muted';
        else if (percent < 75) suffix = 'Very Muted';
        else suffix = 'Ultra Muted';
        break;
      case 'light':
        if (percent < 25) suffix = 'Bright';
        else if (percent < 50) suffix = 'Brighter';
        else if (percent < 75) suffix = 'Very Bright';
        else suffix = 'Ultra Bright';
        break;
      case 'dark':
        if (percent < 25) suffix = 'Deep';
        else if (percent < 50) suffix = 'Deeper';
        else if (percent < 75) suffix = 'Very Deep';
        else suffix = 'Ultra Deep';
        break;
      default:
        suffix = `Variant ${index + 1}`;
    }

    return `${colorName} ${suffix}`;
  }

  const typeNames: Record<string, string> = {
    tint: 'Tint',
    shade: 'Shade',
    tone: 'Tone',
    light: 'Light',
    dark: 'Dark',
  };

  return `${typeNames[type] || 'Color'} ${index + 1}`;
}

/* ============================================================
 * METADATA
 * ============================================================ */

function getShadeMetadata(
  hex: string,
  type: Shade['type'],
  index: number,
  total: number
): Shade {
  const color = chroma(hex);
  const hsl = color.hsl();
  const luminance = color.luminance();

  return {
    id: `${type}-${index}`,
    hex: hex.toUpperCase(),
    name: generateShadeName(hex, type, index, total),
    type,
    lightness: hsl[2] || 0,
    saturation: hsl[1] || 0,
    hue: hsl[0] || 0,
    luminance,
  };
}

/* ============================================================
 * HELPER: Lightness-aware minimum saturation
 * ============================================================ */

/**
 * ✅ Dark shades-ல் அதிக saturation தேவை (brown avoid)
 * ✅ Light shades-ல் குறைவான saturation OK
 */
function getMinSaturationForLightness(lightness: number): number {
  if (lightness < DARK_LIGHTNESS_THRESHOLD) {
    return SAT_REQUIREMENT.dark;
  }
  if (lightness < MEDIUM_LIGHTNESS_THRESHOLD) {
    return SAT_REQUIREMENT.medium;
  }
  return SAT_REQUIREMENT.light;
}

/* ============================================================
 * HELPER: Hue difference (with wraparound)
 * ============================================================ */

function getHueDifference(hue1: number, hue2: number): number {
  let diff = Math.abs(hue1 - hue2);
  if (diff > 180) diff = 360 - diff;
  return diff;
}

/* ============================================================
 * CORE: GENERATE SHADES
 * ============================================================ */

export function generateShades(hex: string, count: number = 120): Shade[] {
  const cleanHex = sanitizeHex(hex);
  if (!cleanHex) return [];

  const rgb = hexToRgbArray(cleanHex);
  if (!rgb) return [];

  const baseColor = chroma(`#${cleanHex}`);
  const baseHsl = baseColor.hsl();

  const baseHue = baseHsl[0] || 0;
  const baseSat = baseHsl[1] || 0;
  const baseLum = baseHsl[2] || 0.5;

  const isNeutralBase = baseSat < MIN_SATURATION;
  const rawShades: RawShade[] = [];

  /* ---------- 1. TINTS (lighter) ---------- */
  for (let i = 0; i < TINT_COUNT; i++) {
    const t = i / (TINT_COUNT - 1);
    const l = baseLum + (MAX_LIGHTNESS - baseLum) * t;
    const s = isNeutralBase
      ? baseSat
      : Math.max(MIN_SATURATION, baseSat * (1 - t * 0.6));

    const mixedHex = chroma.hsl(baseHue, s, l).hex();
    rawShades.push({
      hex: mixedHex.toUpperCase(),
      type: 'tint',
      originalIndex: i,
      originalTotal: TINT_COUNT,
    });
  }

  /* ---------- 2. SHADES (darker) ---------- */
  for (let i = 0; i < SHADE_COUNT; i++) {
    const t = i / (SHADE_COUNT - 1);
    const l = baseLum + (MIN_LIGHTNESS - baseLum) * t;
    const s = isNeutralBase
      ? baseSat
      : Math.max(MIN_SATURATION, baseSat * (1 - t * 0.25));

    const mixedHex = chroma.hsl(baseHue, s, l).hex();
    rawShades.push({
      hex: mixedHex.toUpperCase(),
      type: 'shade',
      originalIndex: i,
      originalTotal: SHADE_COUNT,
    });
  }

  /* ---------- 3. TONES (muted) ---------- */
  for (let i = 0; i < TONE_COUNT; i++) {
    const t = i / (TONE_COUNT - 1);
    const l = baseLum + (0.5 - baseLum) * t * 0.4;
    const s = isNeutralBase
      ? baseSat
      : Math.max(MIN_SATURATION, baseSat * (1 - t * 0.7));

    const mixedHex = chroma.hsl(baseHue, s, l).hex();
    rawShades.push({
      hex: mixedHex.toUpperCase(),
      type: 'tone',
      originalIndex: i,
      originalTotal: TONE_COUNT,
    });
  }

  /* ---------- 4. LIGHT variations ---------- */
  for (let i = 0; i < LIGHT_COUNT; i++) {
    const t = i / (LIGHT_COUNT - 1);
    const l = Math.min(MAX_LIGHTNESS, baseLum + t * 0.35);
    const s = isNeutralBase
      ? baseSat
      : Math.max(MIN_SATURATION, baseSat * (1 - t * 0.4));

    const lightHex = chroma.hsl(baseHue, s, l).hex();
    rawShades.push({
      hex: lightHex.toUpperCase(),
      type: 'light',
      originalIndex: i,
      originalTotal: LIGHT_COUNT,
    });
  }

  /* ---------- 5. DARK variations ---------- */
  for (let i = 0; i < DARK_COUNT; i++) {
    const t = i / (DARK_COUNT - 1);
    const l = Math.max(MIN_LIGHTNESS, baseLum - t * 0.35);
    const s = isNeutralBase
      ? baseSat
      : Math.max(MIN_SATURATION, baseSat * (1 - t * 0.2));

    const darkHex = chroma.hsl(baseHue, s, l).hex();
    rawShades.push({
      hex: darkHex.toUpperCase(),
      type: 'dark',
      originalIndex: i,
      originalTotal: DARK_COUNT,
    });
  }

  /* ---------- DEDUPE ---------- */
  const uniqueMap = new Map<string, RawShade>();
  for (const item of rawShades) {
    if (!uniqueMap.has(item.hex)) {
      uniqueMap.set(item.hex, item);
    }
  }

  /* ---------- CONVERT TO METADATA ---------- */
  let shades: Shade[] = Array.from(uniqueMap.values()).map((item) =>
    getShadeMetadata(item.hex, item.type, item.originalIndex, item.originalTotal)
  );

  /* ============================================================
   * ✅ HUE-FAMILY FILTER (with lightness-aware saturation)
   * ============================================================
   * Base neutral-ஆ இல்லைனா, base hue-க்கு close-ஆ இருக்கும் shades
   * மட்டும் வைத்துக்கொள்.
   *
   * Filters:
   * 1. Lightness: MIN_LIGHTNESS ≤ l ≤ MAX_LIGHTNESS
   * 2. Saturation: lightness-aware requirement
   *    - Dark shades → high saturation (0.30)
   *    - Medium → 0.22
   *    - Light → 0.15
   * 3. Hue: |baseHue - shadeHue| ≤ HUE_TOLERANCE
   * ============================================================ */
  if (!isNeutralBase) {
    shades = shades.filter((shade) => {
      const { saturation, lightness, hue } = shade;

      // ❌ Lightness extremes
      if (lightness < MIN_LIGHTNESS) return false;
      if (lightness > MAX_LIGHTNESS) return false;

      // ❌ Lightness-aware saturation requirement
      const minSatRequired = getMinSaturationForLightness(lightness);
      if (saturation < minSatRequired) return false;

      // ❌ Hue check
      const hueDiff = getHueDifference(baseHue, hue);
      if (hueDiff > HUE_TOLERANCE) return false;

      return true;
    });
  }

  /* ---------- SORT BY LUMINANCE ---------- */
  let result = shades.sort((a, b) => a.luminance - b.luminance);

  /* ---------- LIMIT COUNT ---------- */
  if (result.length > count) {
    const step = result.length / count;
    const selected: Shade[] = [];
    for (let i = 0; i < count; i++) {
      const index = Math.floor(i * step);
      if (index < result.length) selected.push(result[index]);
    }
    result = selected;
  }

  return result;
}

/* ============================================================
 * HELPERS
 * ============================================================ */

export function getUniqueColorNames(shades: Shade[]): string[] {
  const names = new Set<string>();

  const suffixRegex =
    /\s+(Base|Light|Lighter|Very Light|Ultra Light|Dark|Darker|Very Dark|Ultra Dark|Muted|More Muted|Very Muted|Ultra Muted|Bright|Brighter|Very Bright|Ultra Bright|Deep|Deeper|Very Deep|Ultra Deep|Variant\s+\d+)$/i;

  shades.forEach((shade) => {
    if (shade.name) {
      const cleanBaseName = shade.name.replace(suffixRegex, '').trim();
      names.add(cleanBaseName);
    }
  });

  return Array.from(names);
}

export function getShadeStatistics(shades: Shade[]) {
  if (shades.length === 0) {
    return {
      total: 0,
      types: {},
      avgLightness: 0,
      avgSaturation: 0,
      lightest: '',
      darkest: '',
      uniqueColors: 0,
      colorNames: [],
    };
  }

  const types = shades.reduce((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const avgLightness =
    shades.reduce((sum, s) => sum + s.luminance, 0) / shades.length;
  const avgSaturation =
    shades.reduce((sum, s) => sum + s.saturation, 0) / shades.length;

  const uniqueNames = getUniqueColorNames(shades);

  return {
    total: shades.length,
    types,
    avgLightness,
    avgSaturation,
    lightest: shades[shades.length - 1]?.hex || '',
    darkest: shades[0]?.hex || '',
    uniqueColors: uniqueNames.length,
    colorNames: uniqueNames,
  };
}

/* ============================================================
 * PRE-CACHE
 * ============================================================ */

export function preCacheShadeNames() {
  const commonColors = [
    '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#000000', '#FFFFFF', '#808080', '#FFA500', '#FFC0CB', '#8B5CF6',
  ];

  for (const hex of commonColors) {
    getShadeColorName(hex);
  }
}