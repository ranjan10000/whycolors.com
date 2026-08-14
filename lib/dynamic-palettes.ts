// lib/dynamic-palettes.ts
import chroma from 'chroma-js';
import { getCachedColors, generateColorName, hexToRgb } from './colors.shared';
import { getColorName } from './color-utils';

// ============ VALIDATION & HELPERS ============

export function normalizeHex(hex: string): string {
  let clean = hex.trim();
  clean = clean.replace(/^#/, '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) {
    throw new Error(`Invalid hex color format: ${hex}. Expected format: #RRGGBB or RRGGBB`);
  }
  return `#${clean.toUpperCase()}`;
}

export function isValidHex(hex: string): boolean {
  try {
    const normalized = normalizeHex(hex);
    return /^#[0-9A-Fa-f]{6}$/.test(normalized);
  } catch {
    return false;
  }
}

export function getContrastRatio(color1: string, color2: string): number {
  try {
    return chroma.contrast(normalizeHex(color1), normalizeHex(color2));
  } catch {
    return 0;
  }
}

export function isAccessible(color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean {
  const ratio = getContrastRatio(color1, color2);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}

// ============ SAFE COLOR HELPER ============

function safeSetColor(
  base: chroma.Color,
  hue: number,
  saturation: number,
  lightness: number
): string {
  try {
    const h = ((hue % 360) + 360) % 360;
    const s = Math.min(1, Math.max(0, saturation));
    const l = Math.min(1, Math.max(0, lightness));
    return chroma(h, s, l, 'hsl').hex();
  } catch (error) {
    console.warn(`Chroma failed for h:${hue}, s:${saturation}, l:${lightness}`, error);
    return base.hex();
  }
}

function safeSetHue(base: chroma.Color, hue: number): string {
  try {
    const h = ((hue % 360) + 360) % 360;
    const s = base.get('hsl.s');
    const l = base.get('hsl.l');
    return chroma(h, s, l, 'hsl').hex();
  } catch (error) {
    console.warn(`Hue set failed for: ${hue}`, error);
    return base.hex();
  }
}

// ============ SHADE GENERATION ============

export function generateShades(hex: string, count: number = 9): string[] {
  const color = chroma(normalizeHex(hex));
  const shades: string[] = [];
  for (let i = 0; i < count; i++) {
    const lightness = 10 + (i / (count - 1)) * 85;
    shades.push(color.set('hsl.l', lightness / 100).hex());
  }
  return shades;
}

// ============ COLOR NAMES ============

let colorNamesCache: string[] | null = null;
let colorDefinitionCache: Map<string, { name: string; hex: string }> | null = null;

export function getAllColorNames(): string[] {
  if (colorNamesCache) return colorNamesCache;
  
  const allColors = getCachedColors(500);
  const names: string[] = [];
  const usedNames = new Set<string>();
  
  for (const hex of allColors) {
    let baseName = getColorName(`#${hex}`);
    let uniqueName = baseName;
    let counter = 1;
    while (usedNames.has(uniqueName)) {
      uniqueName = `${baseName} ${counter++}`;
    }
    usedNames.add(uniqueName);
    names.push(uniqueName);
  }
  
  colorNamesCache = names;
  return names;
}

export function getColorCount(): number {
  return getAllColorNames().length;
}

function buildColorDefinitionCache() {
  if (colorDefinitionCache) return colorDefinitionCache;
  
  colorDefinitionCache = new Map();
  const names = getAllColorNames();
  const colors = getCachedColors(500);
  
  for (let i = 0; i < Math.min(names.length, colors.length); i++) {
    const hex = `#${colors[i].toUpperCase()}`;
    colorDefinitionCache.set(names[i], { name: names[i], hex });
  }
  
  return colorDefinitionCache;
}

export function getColorDefinition(colorName: string) {
  const cache = buildColorDefinitionCache();
  const result = cache.get(colorName);
  if (!result) return null;
  
  return {
    name: result.name.charAt(0).toUpperCase() + result.name.slice(1),
    hex: result.hex,
    shades: generateShades(result.hex),
  };
}

export function getColorNameFromHex(hex: string): string {
  try {
    const normalizedHex = normalizeHex(hex);
    const name = getColorName(normalizedHex);
    return name;
  } catch {
    return 'Unknown Color';
  }
}

// ============ HARMONIC PALETTES ============

export function generateComplementary(hex: string): string[] {
  const color = chroma(normalizeHex(hex));
  return [
    hex,
    color.set('hsl.h', '+180').hex(),
    color.set('hsl.h', '+180').brighten(0.5).hex(),
    color.brighten(0.5).hex(),
    color.set('hsl.h', '+180').darken(0.5).hex()
  ];
}

export function generateAnalogous(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const step = 30 / (count - 1);
  for (let i = 0; i < count; i++) {
    const offset = -30 + i * step;
    colors.push(color.set('hsl.h', `${offset}`).hex());
  }
  return colors;
}

export function generateTriadic(hex: string): string[] {
  const color = chroma(normalizeHex(hex));
  return [0, 120, 240].map(hue => color.set('hsl.h', `+${hue}`).hex());
}

export function generateTetradic(hex: string): string[] {
  const color = chroma(normalizeHex(hex));
  return [0, 90, 180, 270].map(hue => color.set('hsl.h', `+${hue}`).hex());
}

export function generateSplitComplementary(hex: string): string[] {
  const color = chroma(normalizeHex(hex));
  return [
    hex,
    color.set('hsl.h', '+150').hex(),
    color.set('hsl.h', '+210').hex(),
    color.set('hsl.h', '+150').brighten(0.5).hex(),
    color.set('hsl.h', '+210').darken(0.5).hex()
  ];
}

export function generateSquare(hex: string): string[] {
  const color = chroma(normalizeHex(hex));
  return [0, 90, 180, 270].map(hue => color.set('hsl.h', `+${hue}`).hex());
}

// ============ FIXED: Monochromatic ============

export function generateMonochromatic(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  const baseSat = color.get('hsl.s');
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const lightness = 0.15 + t * 0.6;
    const saturation = baseSat * (1 - t * 0.2);
    colors.push(chroma(h, saturation, lightness, 'hsl').hex());
  }
  return colors;
}

export function generateCompound(hex: string): string[] {
  const color = chroma(normalizeHex(hex));
  const h = color.get('hsl.h');
  return [
    hex,
    chroma(color).set('hsl.h', h + 15).brighten(0.2).hex(),
    chroma(color).set('hsl.h', h + 30).darken(0.3).hex(),
    chroma(color).set('hsl.h', h + 45).saturate(0.2).hex(),
    chroma(color).set('hsl.h', h + 60).desaturate(0.2).hex(),
  ];
}

export function generateSplit(hex: string): string[] {
  const color = chroma(normalizeHex(hex));
  const h = color.get('hsl.h');
  return [
    hex,
    safeSetHue(color, h + 120),
    safeSetHue(color, h + 240),
    safeSetHue(color, h + 60),
    safeSetHue(color, h + 300),
  ];
}

export function generateDoubleSplit(hex: string): string[] {
  const color = chroma(normalizeHex(hex));
  const h = color.get('hsl.h');
  return [
    hex,
    safeSetHue(color, h + 30),
    safeSetHue(color, h + 60),
    safeSetHue(color, h + 180),
    safeSetHue(color, h + 210),
    safeSetHue(color, h + 240),
  ];
}

// ============ FIXED: Adjacent ============

export function generateAdjacent(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  const baseSat = color.get('hsl.s');
  const baseLight = color.get('hsl.l');
  
  // Center the palette around the base color
  const range = 40;
  const startHue = h - range / 2;
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const hue = (startHue + t * range) % 360;
    const saturation = baseSat * (0.7 + t * 0.3);
    const lightness = baseLight * (0.7 + t * 0.3);
    colors.push(chroma(hue, saturation, lightness, 'hsl').hex());
  }
  return colors;
}

// ============ FIXED: Alternating ============

export function generateAlternating(hex: string, count: number = 6): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  const baseSat = color.get('hsl.s');
  const baseLight = color.get('hsl.l');
  
  for (let i = 0; i < count; i++) {
    const hue = i % 2 === 0 ? h : (h + 180) % 360;
    const saturation = baseSat * 0.9;
    const lightness = baseLight * (0.8 + (i % 2) * 0.15);
    colors.push(chroma(hue, saturation, lightness, 'hsl').hex());
  }
  return colors;
}

// ============ FIXED: Rainbow ============

export function generateRainbow(hex: string, count: number = 6): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const baseSat = color.get('hsl.s');
  const baseLight = color.get('hsl.l');
  
  // Full spectrum rainbow hues
  const rainbowHues = [0, 60, 120, 180, 240, 300];
  
  for (let i = 0; i < Math.min(count, rainbowHues.length); i++) {
    const hue = rainbowHues[i];
    const saturation = Math.min(1, baseSat * 1.2);
    const lightness = 0.5 + (i / (rainbowHues.length - 1)) * 0.1;
    colors.push(chroma(hue, saturation, lightness, 'hsl').hex());
  }
  
  while (colors.length < count) {
    const lastIndex = colors.length;
    const hue = (lastIndex * 60) % 360;
    colors.push(chroma(hue, 0.8, 0.5, 'hsl').hex());
  }
  
  return colors;
}

// ============ MOOD-BASED PALETTES ============

export function generatePastel(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  const baseSat = color.get('hsl.s');
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const hue = (h - 20 + i * 10) % 360;
    const saturation = baseSat * (0.2 + t * 0.2);
    const lightness = 0.6 + t * 0.3;
    colors.push(chroma(hue, saturation, lightness, 'hsl').hex());
  }
  return colors;
}

export function generateVibrant(hex: string): string[] {
  const color = chroma(normalizeHex(hex));
  const h = color.get('hsl.h');
  const baseSat = color.get('hsl.s');
  const baseLight = color.get('hsl.l');
  
  return [
    chroma(h - 20, Math.min(1, baseSat * 1.1), baseLight * 0.6, 'hsl').hex(),
    chroma(h - 10, Math.min(1, baseSat * 1.2), baseLight * 0.7, 'hsl').hex(),
    chroma(h, Math.min(1, baseSat * 1.3), baseLight * 0.8, 'hsl').hex(),
    chroma(h + 10, Math.min(1, baseSat * 1.1), baseLight * 0.9, 'hsl').hex(),
    chroma(h + 20, baseSat * 0.9, baseLight * 1.0, 'hsl').hex(),
  ];
}

export function generateMuted(hex: string): string[] {
  const color = chroma(normalizeHex(hex));
  const h = color.get('hsl.h');
  const baseSat = color.get('hsl.s');
  const baseLight = color.get('hsl.l');
  
  const colors: string[] = [];
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const hue = (h - 20 + i * 10) % 360;
    const saturation = baseSat * (0.15 + t * 0.15);
    const lightness = baseLight * (0.6 + t * 0.3);
    colors.push(chroma(hue, saturation, lightness, 'hsl').hex());
  }
  return colors;
}

// ============ FIXED: Dark and Light ============

export function generateDark(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  const s = color.get('hsl.s');
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const lightness = 0.05 + t * 0.35;
    const saturation = s * (1 - t * 0.2);
    colors.push(chroma(h, saturation, lightness, 'hsl').hex());
  }
  return colors;
}

export function generateLight(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  const s = color.get('hsl.s');
  const l = color.get('hsl.l');
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const lightness = l + t * (0.9 - l);
    const saturation = s * (1 - t * 0.2);
    colors.push(chroma(h, saturation, lightness, 'hsl').hex());
  }
  return colors;
}

// ============ FIXED: Warm and Cool ============

export function generateWarmPalette(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  const baseSat = color.get('hsl.s');
  const baseLight = color.get('hsl.l');
  
  // Start at the complementary hue (opposite on color wheel)
  const startHue = (h + 180) % 360;
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const warmHue = (startHue + i * 15) % 360;
    const saturation = baseSat * (0.6 + t * 0.4);
    const lightness = baseLight * (0.4 + t * 0.5);
    colors.push(chroma(warmHue, saturation, lightness, 'hsl').hex());
  }
  return colors;
}

export function generateCoolPalette(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  const baseSat = color.get('hsl.s');
  const baseLight = color.get('hsl.l');
  
  // Start at the base hue and move cooler
  const startHue = (h - 20) % 360;
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const coolHue = (startHue - i * 15) % 360;
    const saturation = baseSat * (0.5 + t * 0.5);
    const lightness = baseLight * (0.3 + t * 0.5);
    colors.push(chroma(coolHue, saturation, lightness, 'hsl').hex());
  }
  return colors;
}

// ============ FIXED: Neutral ============

export function generateNeutralPalette(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const baseHue = color.get('hsl.h');
  const baseSat = color.get('hsl.s');
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const saturation = baseSat * (0.05 + t * 0.15);
    const lightness = 0.2 + t * 0.5;
    colors.push(chroma(baseHue, saturation, lightness, 'hsl').hex());
  }
  return colors;
}

// ============ FIXED: Gradient ============

export function generateGradient(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  const baseSat = color.get('hsl.s');
  const baseLight = color.get('hsl.l');
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const hue = (h - 20 + t * 40) % 360;
    const saturation = baseSat * (0.6 + t * 0.4);
    const lightness = baseLight * (0.4 + t * 0.6);
    colors.push(chroma(hue, saturation, lightness, 'hsl').hex());
  }
  return colors;
}

// ============ FIXED: Thematic Palettes ============

export function generateNeon(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  const baseSat = color.get('hsl.s');
  
  for (let i = 0; i < count; i++) {
    const hue = (h - 40 + i * 20) % 360;
    const saturation = Math.min(1, baseSat * 1.3);
    const lightness = 0.45 + (i / (count - 1)) * 0.3;
    colors.push(chroma(hue, saturation, lightness, 'hsl').hex());
  }
  return colors;
}

export function generateEarth(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const baseHue = color.get('hsl.h');
  const baseSat = color.get('hsl.s');
  const baseLight = color.get('hsl.l');
  
  const earthHues = [
    baseHue,
    (baseHue + 30) % 360,
    (baseHue + 60) % 360,
    (baseHue + 90) % 360,
    (baseHue + 120) % 360
  ];
  
  for (let i = 0; i < count; i++) {
    const saturation = baseSat * (0.3 + (i / (count - 1)) * 0.3);
    const lightness = baseLight * (0.4 + (i / (count - 1)) * 0.4);
    colors.push(chroma(earthHues[i], saturation, lightness, 'hsl').hex());
  }
  return colors;
}

export function generateOcean(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const baseHue = color.get('hsl.h');
  const baseSat = color.get('hsl.s');
  const baseLight = color.get('hsl.l');
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const hue = (baseHue - 20 + i * 10) % 360;
    const saturation = baseSat * (0.6 + t * 0.4);
    const lightness = baseLight * (0.3 + t * 0.5);
    colors.push(chroma(hue, saturation, lightness, 'hsl').hex());
  }
  return colors;
}

export function generateSunset(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const baseHue = color.get('hsl.h');
  const baseSat = color.get('hsl.s');
  const baseLight = color.get('hsl.l');
  
  const sunsetHues = [
    (baseHue + 300) % 360,
    (baseHue + 315) % 360,
    (baseHue + 330) % 360,
    (baseHue + 345) % 360,
    (baseHue + 360) % 360
  ];
  
  for (let i = 0; i < count; i++) {
    const saturation = Math.min(1, baseSat * (0.7 + (i / (count - 1)) * 0.3));
    const lightness = baseLight * (0.4 + (i / (count - 1)) * 0.5);
    colors.push(chroma(sunsetHues[i], saturation, lightness, 'hsl').hex());
  }
  return colors;
}

export function generateForest(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const baseHue = color.get('hsl.h');
  const baseSat = color.get('hsl.s');
  const baseLight = color.get('hsl.l');
  
  const forestHues = [
    (baseHue + 80) % 360,
    (baseHue + 95) % 360,
    (baseHue + 110) % 360,
    (baseHue + 125) % 360,
    (baseHue + 140) % 360
  ];
  
  for (let i = 0; i < count; i++) {
    const saturation = baseSat * (0.3 + (i / (count - 1)) * 0.3);
    const lightness = baseLight * (0.25 + (i / (count - 1)) * 0.5);
    colors.push(chroma(forestHues[i], saturation, lightness, 'hsl').hex());
  }
  return colors;
}

export function generateVintage(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const baseHue = color.get('hsl.h');
  const baseSat = color.get('hsl.s');
  const baseLight = color.get('hsl.l');
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const hue = (baseHue - 20 + i * 10) % 360;
    const saturation = baseSat * (0.15 + t * 0.15);
    const lightness = baseLight * (0.4 + t * 0.4);
    colors.push(chroma(hue, saturation, lightness, 'hsl').hex());
  }
  return colors;
}

export function generateModern(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const baseHue = color.get('hsl.h');
  const baseSat = color.get('hsl.s');
  const baseLight = color.get('hsl.l');
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const hue = (baseHue - 30 + i * 15) % 360;
    const saturation = Math.min(1, baseSat * (0.7 + t * 0.3));
    const lightness = baseLight * (0.5 + t * 0.4);
    colors.push(chroma(hue, saturation, lightness, 'hsl').hex());
  }
  return colors;
}

export function generatePastelNeon(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const baseHue = color.get('hsl.h');
  const baseSat = color.get('hsl.s');
  
  for (let i = 0; i < count; i++) {
    const hue = (baseHue - 40 + i * 20) % 360;
    const isPastel = i % 2 === 0;
    const saturation = isPastel ? baseSat * 0.3 : Math.min(1, baseSat * 1.3);
    const lightness = isPastel ? 0.7 : 0.5;
    colors.push(chroma(hue, saturation, lightness, 'hsl').hex());
  }
  return colors;
}

// ============ FIXED: Monochrome Dark and Light ============

export function generateMonochromeDark(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  const s = color.get('hsl.s');
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const lightness = 0.02 + t * 0.28;
    const saturation = s * (1 - t * 0.2);
    colors.push(chroma(h, saturation, lightness, 'hsl').hex());
  }
  return colors;
}

export function generateMonochromeLight(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  const s = color.get('hsl.s');
  const l = color.get('hsl.l');
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const lightness = l + t * (0.92 - l);
    const saturation = s * (1 - t * 0.2);
    colors.push(chroma(h, saturation, lightness, 'hsl').hex());
  }
  return colors;
}

// ============ FIXED: Accent ============

export function generateAccent(hex: string): string[] {
  const color = chroma(normalizeHex(hex));
  const baseHue = color.get('hsl.h');
  const baseSat = color.get('hsl.s');
  const baseLight = color.get('hsl.l');
  const colors: string[] = [hex];
  
  for (let i = 0; i < 4; i++) {
    const hue = (baseHue + 45 + i * 45) % 360;
    const saturation = baseSat * (0.7 + i * 0.1);
    const lightness = baseLight * (0.6 + i * 0.15);
    colors.push(chroma(hue, saturation, lightness, 'hsl').hex());
  }
  return colors;
}

// ============ FIXED: Gradient Warm and Cool ============

export function generateGradientWarm(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  const baseSat = color.get('hsl.s');
  const baseLight = color.get('hsl.l');
  
  const startHue = (h + 180) % 360;
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const hue = (startHue + t * 30) % 360;
    const saturation = baseSat * (0.6 + t * 0.4);
    const lightness = baseLight * (0.4 + t * 0.5);
    colors.push(chroma(hue, saturation, lightness, 'hsl').hex());
  }
  return colors;
}

export function generateGradientCool(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  const baseSat = color.get('hsl.s');
  const baseLight = color.get('hsl.l');
  
  const startHue = (h - 20) % 360;
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const hue = (startHue - t * 30) % 360;
    const saturation = baseSat * (0.5 + t * 0.5);
    const lightness = baseLight * (0.3 + t * 0.5);
    colors.push(chroma(hue, saturation, lightness, 'hsl').hex());
  }
  return colors;
}

// ============ NEW PALETTES ============

// 1. Tint & Shade Scale (10 colors)
export function generateTintShadeScale(hex: string, count: number = 10): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  const s = color.get('hsl.s');
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const lightness = 0.05 + t * 0.9;
    colors.push(chroma(h, s, lightness, 'hsl').hex());
  }
  return colors;
}

// 2. UI Palette (Primary, Secondary, Success, Warning, Danger)
export function generateUIPalette(hex: string): string[] {
  const color = chroma(normalizeHex(hex));
  const h = color.get('hsl.h');
  const s = color.get('hsl.s');
  const l = color.get('hsl.l');
  
  return [
    hex, // Primary
    chroma((h + 30) % 360, Math.min(1, s * 0.8), Math.min(1, l * 0.9), 'hsl').hex(), // Secondary
    chroma((h + 120) % 360, Math.min(1, s * 0.7), Math.min(1, l * 0.5), 'hsl').hex(), // Success
    chroma((h + 50) % 360, Math.min(1, s * 0.9), Math.min(1, l * 0.6), 'hsl').hex(), // Warning
    chroma((h + 180) % 360, Math.min(1, s * 0.9), Math.min(1, l * 0.5), 'hsl').hex(), // Danger
  ];
}

// 3. Clash Palette (High contrast)
export function generateClash(hex: string): string[] {
  const color = chroma(normalizeHex(hex));
  const h = color.get('hsl.h');
  const s = color.get('hsl.s');
  const l = color.get('hsl.l');
  
  return [
    hex,
    chroma((h + 120) % 360, s, Math.min(1, l * 1.2), 'hsl').hex(),
    chroma((h + 240) % 360, s * 0.8, l * 0.8, 'hsl').hex(),
    chroma((h + 60) % 360, s * 0.9, Math.min(1, l * 1.1), 'hsl').hex(),
    chroma((h + 300) % 360, s * 0.7, l * 0.7, 'hsl').hex(),
  ];
}

// 4. Saturation Scale (Same hue, varying saturation)
export function generateSaturationScale(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  const l = color.get('hsl.l');
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const saturation = 0.1 + t * 0.9;
    colors.push(chroma(h, saturation, l, 'hsl').hex());
  }
  return colors;
}

// 5. Seasonal Palettes
// ============ FIXED: Seasonal Palettes ============




// ============ CACHING ============

const paletteCache = new Map<string, ReturnType<typeof generateAllPalettes>>();

export function getCachedPalettes(hex: string) {
  const normalizedHex = normalizeHex(hex);
  if (!paletteCache.has(normalizedHex)) {
    paletteCache.set(normalizedHex, generateAllPalettes(normalizedHex));
  }
  return paletteCache.get(normalizedHex)!;
}

// ============ GENERATE ALL PALETTES ============

export function generateAllPalettes(hex: string) {
  const normalizedHex = normalizeHex(hex);
  if (!isValidHex(normalizedHex)) {
    throw new Error(`Invalid hex color format: ${hex}. Expected format: #RRGGBB or RRGGBB`);
  }

  return {
    // Basic harmonies
    shades: generateShades(normalizedHex),
    complementary: generateComplementary(normalizedHex),
    analogous: generateAnalogous(normalizedHex),
    triadic: generateTriadic(normalizedHex),
    tetradic: generateTetradic(normalizedHex),
    'split-complementary': generateSplitComplementary(normalizedHex),
    square: generateSquare(normalizedHex),
    
    // Mood-based
    pastel: generatePastel(normalizedHex),
    vibrant: generateVibrant(normalizedHex),
    muted: generateMuted(normalizedHex),
    dark: generateDark(normalizedHex),
    light: generateLight(normalizedHex),
    warm: generateWarmPalette(normalizedHex),
    cool: generateCoolPalette(normalizedHex),
    
    // Advanced harmonies
    monochromatic: generateMonochromatic(normalizedHex),
    compound: generateCompound(normalizedHex),
    neutral: generateNeutralPalette(normalizedHex),
    gradient: generateGradient(normalizedHex),
    
    // Thematic
    neon: generateNeon(normalizedHex),
    earth: generateEarth(normalizedHex),
    ocean: generateOcean(normalizedHex),
    sunset: generateSunset(normalizedHex),
    forest: generateForest(normalizedHex),
    vintage: generateVintage(normalizedHex),
    modern: generateModern(normalizedHex),
    
    // Special combinations
    pastelNeon: generatePastelNeon(normalizedHex),
    monochromeDark: generateMonochromeDark(normalizedHex),
    monochromeLight: generateMonochromeLight(normalizedHex),
    accent: generateAccent(normalizedHex),
    gradientWarm: generateGradientWarm(normalizedHex),
    gradientCool: generateGradientCool(normalizedHex),
    split: generateSplit(normalizedHex),
    doubleSplit: generateDoubleSplit(normalizedHex),
    adjacent: generateAdjacent(normalizedHex),
    alternating: generateAlternating(normalizedHex),
    rainbow: generateRainbow(normalizedHex),

      tintShadeScale: generateTintShadeScale(normalizedHex),
    uiPalette: generateUIPalette(normalizedHex),
    clash: generateClash(normalizedHex),
    saturationScale: generateSaturationScale(normalizedHex),

 
  };
}

// ============ UTILITY FUNCTIONS ============

export function getPaletteInfo(hex: string) {
  const normalizedHex = normalizeHex(hex);
  if (!isValidHex(normalizedHex)) {
    throw new Error(`Invalid hex color format: ${hex}`);
  }

  const palettes = generateAllPalettes(normalizedHex);
  const colorName = getColorNameFromHex(normalizedHex);
  const color = chroma(normalizedHex);
  
  return {
    hex: normalizedHex,
    colorName,
    hsl: color.hsl(),
    rgb: color.rgb(),
    contrastWhite: getContrastRatio(normalizedHex, '#FFFFFF'),
    contrastBlack: getContrastRatio(normalizedHex, '#000000'),
    accessibleOnWhite: isAccessible(normalizedHex, '#FFFFFF'),
    accessibleOnBlack: isAccessible(normalizedHex, '#000000'),
    palettes,
  };
}

// ============ EXPORT PALETTE AS VARIOUS FORMATS ============

export function exportPaletteAsCSS(hex: string, paletteName: keyof ReturnType<typeof generateAllPalettes>): string {
  const normalizedHex = normalizeHex(hex);
  const palettes = generateAllPalettes(normalizedHex);
  const colors = palettes[paletteName];
  if (!Array.isArray(colors)) {
    throw new Error(`Palette "${paletteName}" not found or not an array`);
  }
  return colors.map((color, index) => `  --color-${paletteName}-${index + 1}: ${color};`).join('\n');
}

export function exportPaletteAsTailwind(hex: string, paletteName: keyof ReturnType<typeof generateAllPalettes>): string {
  const normalizedHex = normalizeHex(hex);
  const palettes = generateAllPalettes(normalizedHex);
  const colors = palettes[paletteName];
  if (!Array.isArray(colors)) {
    throw new Error(`Palette "${paletteName}" not found or not an array`);
  }
  const tailwindObj: Record<string, string> = {};
  colors.forEach((color, index) => {
    tailwindObj[`${paletteName}-${index + 1}`] = color;
  });
  return JSON.stringify(tailwindObj, null, 2);
}