// lib/dynamic-palettes.ts
import chroma from 'chroma-js';
import { getCachedColors, generateColorName, hexToRgb } from './colors.shared';
import { getColorName } from './color-utils'; // ✅ This is the proper one

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

// ============ COLOR NAMES - USING PROPER getColorName ============

let colorNamesCache: string[] | null = null;
let colorDefinitionCache: Map<string, { name: string; hex: string }> | null = null;

export function getAllColorNames(): string[] {
  if (colorNamesCache) return colorNamesCache;
  
  const allColors = getCachedColors(500);
  const names: string[] = [];
  const usedNames = new Set<string>();
  
  for (const hex of allColors) {
    // ✅ Use the proper getColorName from color-utils
    let baseName = getColorName(`#${hex}`);
    let uniqueName = baseName;
    
    // Handle duplicates
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

// ✅ This now properly uses the imported getColorName
export function getColorNameFromHex(hex: string): string {
  try {
    const normalizedHex = normalizeHex(hex);
    // Use the proper getColorName function
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

export function generateMonochromatic(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  const s = color.get('hsl.s');
  for (let i = 0; i < count; i++) {
    const lightness = 0.15 + (i / (count - 1)) * 0.6;
    colors.push(chroma(h, s, lightness).hex());
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
    chroma(color).set('hsl.h', h + 120).hex(),
    chroma(color).set('hsl.h', h + 240).hex(),
    chroma(color).set('hsl.h', h + 60).hex(),
    chroma(color).set('hsl.h', h + 300).hex(),
  ];
}

export function generateDoubleSplit(hex: string): string[] {
  const color = chroma(normalizeHex(hex));
  const h = color.get('hsl.h');
  return [
    hex,
    chroma(color).set('hsl.h', h + 30).hex(),
    chroma(color).set('hsl.h', h + 60).hex(),
    chroma(color).set('hsl.h', h + 180).hex(),
    chroma(color).set('hsl.h', h + 210).hex(),
    chroma(color).set('hsl.h', h + 240).hex(),
  ];
}

export function generateAdjacent(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  for (let i = 0; i < count; i++) {
    const hue = (h + i * 10 - 20) % 360;
    colors.push(chroma(hue, 0.6, 0.5).hex());
  }
  return colors;
}

export function generateAlternating(hex: string, count: number = 6): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  for (let i = 0; i < count; i++) {
    const hue = i % 2 === 0 ? h : (h + 180) % 360;
    const lightness = 0.3 + (i / (count - 1)) * 0.4;
    colors.push(chroma(hue, 0.6, lightness).hex());
  }
  return colors;
}

export function generateRainbow(hex: string): string[] {
  const color = chroma(normalizeHex(hex));
  const h = color.get('hsl.h');
  const colors: string[] = [];
  for (let i = 0; i < 6; i++) {
    const hue = (h + i * 60) % 360;
    colors.push(chroma(hue, 0.8, 0.5).hex());
  }
  return colors;
}

// ============ MOOD-BASED PALETTES ============

export function generatePastel(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const lightness = 45 + t * 40;
    const sat = 30 + t * 20;
    colors.push(color.set('hsl.s', sat / 100).set('hsl.l', lightness / 100).hex());
  }
  return colors;
}

export function generateVibrant(hex: string): string[] {
  const color = chroma(normalizeHex(hex));
  return [
    color.set('hsl.s', 0.8).set('hsl.l', 0.3).hex(),
    color.set('hsl.s', 0.9).set('hsl.l', 0.4).hex(),
    color.set('hsl.s', 1.0).set('hsl.l', 0.5).hex(),
    color.set('hsl.s', 0.9).set('hsl.l', 0.6).hex(),
    color.set('hsl.s', 0.8).set('hsl.l', 0.7).hex()
  ];
}

export function generateMuted(hex: string): string[] {
  const color = chroma(normalizeHex(hex));
  return [
    color.set('hsl.s', 0.2).set('hsl.l', 0.3).hex(),
    color.set('hsl.s', 0.3).set('hsl.l', 0.4).hex(),
    color.set('hsl.s', 0.4).set('hsl.l', 0.5).hex(),
    color.set('hsl.s', 0.3).set('hsl.l', 0.6).hex(),
    color.set('hsl.s', 0.2).set('hsl.l', 0.7).hex()
  ];
}

export function generateDark(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const shades: string[] = [];
  for (let i = 0; i < count; i++) {
    shades.push(color.darken(0.3 + i * 0.2).hex());
  }
  return shades;
}

export function generateLight(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const tints: string[] = [];
  for (let i = 0; i < count; i++) {
    tints.push(color.brighten(0.3 + i * 0.2).hex());
  }
  return tints;
}

export function generateWarm(hex: string): string {
  return chroma(normalizeHex(hex)).set('hsl.h', '+15').hex();
}

export function generateCool(hex: string): string {
  return chroma(normalizeHex(hex)).set('hsl.h', '-15').hex();
}

export function generateNeutralPalette(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const baseHue = color.get('hsl.h');
  for (let i = 0; i < count; i++) {
    const saturation = 0.1 + (i / (count - 1)) * 0.15;
    const lightness = 0.2 + (i / (count - 1)) * 0.5;
    colors.push(chroma(baseHue, saturation, lightness).hex());
  }
  return colors;
}

export function generateGradient(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const lightness = 0.2 + t * 0.5;
    const saturation = 0.5 + t * 0.3;
    colors.push(chroma(h + t * 30, saturation, lightness).hex());
  }
  return colors;
}

// ============ THEMATIC PALETTES ============

export function generateWarmPalette(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  for (let i = 0; i < count; i++) {
    const warmHue = (h + i * 15) % 360;
    const saturation = 0.6 + (i / (count - 1)) * 0.3;
    const lightness = 0.3 + (i / (count - 1)) * 0.4;
    colors.push(chroma(warmHue, saturation, lightness).hex());
  }
  return colors;
}

export function generateCoolPalette(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  for (let i = 0; i < count; i++) {
    const coolHue = (h + i * 20 + 180) % 360;
    const saturation = 0.5 + (i / (count - 1)) * 0.4;
    const lightness = 0.3 + (i / (count - 1)) * 0.4;
    colors.push(chroma(coolHue, saturation, lightness).hex());
  }
  return colors;
}

export function generateNeon(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  for (let i = 0; i < count; i++) {
    const hue = (h + i * 40) % 360;
    colors.push(chroma(hue, 1, 0.6).hex());
  }
  return colors;
}

export function generateEarth(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const baseHue = color.get('hsl.h');
  const earthHues = [baseHue, (baseHue + 30) % 360, (baseHue + 60) % 360, (baseHue + 90) % 360, (baseHue + 120) % 360];
  for (const hue of earthHues) {
    colors.push(chroma(hue, 0.4, 0.4).hex());
  }
  return colors;
}

export function generateOcean(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const baseHue = color.get('hsl.h');
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const hue = (baseHue + i * 20 + 180) % 360;
    const saturation = 0.5 + t * 0.3;
    const lightness = 0.3 + t * 0.4;
    colors.push(chroma(hue, saturation, lightness).hex());
  }
  return colors;
}

export function generateSunset(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const baseHue = color.get('hsl.h');
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const hue = (baseHue + i * 25 + 300) % 360;
    const saturation = 0.7 + t * 0.2;
    const lightness = 0.4 + t * 0.3;
    colors.push(chroma(hue, saturation, lightness).hex());
  }
  return colors;
}

export function generateForest(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const baseHue = color.get('hsl.h');
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const hue = (baseHue + i * 15 + 80) % 360;
    const saturation = 0.4 + t * 0.3;
    const lightness = 0.25 + t * 0.4;
    colors.push(chroma(hue, saturation, lightness).hex());
  }
  return colors;
}

export function generateVintage(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const baseHue = color.get('hsl.h');
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const hue = (baseHue + i * 20) % 360;
    const saturation = 0.3 + t * 0.15;
    const lightness = 0.5 + t * 0.25;
    colors.push(chroma(hue, saturation, lightness).hex());
  }
  return colors;
}

export function generateModern(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const baseHue = color.get('hsl.h');
  for (let i = 0; i < count; i++) {
    const hue = (baseHue + i * 30) % 360;
    const saturation = 0.8;
    const lightness = 0.35 + (i / (count - 1)) * 0.4;
    colors.push(chroma(hue, saturation, lightness).hex());
  }
  return colors;
}

export function generatePastelNeon(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const baseHue = color.get('hsl.h');
  for (let i = 0; i < count; i++) {
    const hue = (baseHue + i * 35) % 360;
    const saturation = i % 2 === 0 ? 0.3 : 0.9;
    const lightness = i % 2 === 0 ? 0.8 : 0.6;
    colors.push(chroma(hue, saturation, lightness).hex());
  }
  return colors;
}

export function generateMonochromeDark(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  const s = color.get('hsl.s');
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const lightness = 0.1 + t * 0.25;
    const sat = s * (1 - t * 0.3);
    colors.push(chroma(h, sat, lightness).hex());
  }
  return colors;
}

export function generateMonochromeLight(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  const s = color.get('hsl.s');
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const lightness = 0.5 + t * 0.3;
    const sat = s * (1 - t * 0.3);
    colors.push(chroma(h, sat, lightness).hex());
  }
  return colors;
}

export function generateAccent(hex: string): string[] {
  const color = chroma(normalizeHex(hex));
  const baseHue = color.get('hsl.h');
  const colors: string[] = [hex];
  for (let i = 0; i < 4; i++) {
    const hue = (baseHue + 45 + i * 45) % 360;
    colors.push(chroma(hue, 0.7, 0.5).hex());
  }
  return colors;
}

export function generateGradientWarm(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const hue = (h + t * 30) % 360;
    const saturation = 0.6 + t * 0.2;
    const lightness = 0.3 + t * 0.4;
    colors.push(chroma(hue, saturation, lightness).hex());
  }
  return colors;
}

export function generateGradientCool(hex: string, count: number = 5): string[] {
  const color = chroma(normalizeHex(hex));
  const colors: string[] = [];
  const h = color.get('hsl.h');
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const hue = (h + t * 30 + 180) % 360;
    const saturation = 0.6 + t * 0.2;
    const lightness = 0.3 + t * 0.4;
    colors.push(chroma(hue, saturation, lightness).hex());
  }
  return colors;
}

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
    shades: generateShades(normalizedHex),
    complementary: generateComplementary(normalizedHex),
    analogous: generateAnalogous(normalizedHex),
    triadic: generateTriadic(normalizedHex),
    tetradic: generateTetradic(normalizedHex),
    'split-complementary': generateSplitComplementary(normalizedHex),
    square: generateSquare(normalizedHex),
    monochromatic: generateMonochromatic(normalizedHex),
    compound: generateCompound(normalizedHex),
    split: generateSplit(normalizedHex),
    doubleSplit: generateDoubleSplit(normalizedHex),
    adjacent: generateAdjacent(normalizedHex),
    alternating: generateAlternating(normalizedHex),
    rainbow: generateRainbow(normalizedHex),
    pastel: generatePastel(normalizedHex),
    vibrant: generateVibrant(normalizedHex),
    muted: generateMuted(normalizedHex),
    dark: generateDark(normalizedHex),
    light: generateLight(normalizedHex),
    warm: generateWarmPalette(normalizedHex),
    cool: generateCoolPalette(normalizedHex),
    neutral: generateNeutralPalette(normalizedHex),
    gradient: generateGradient(normalizedHex),
    neon: generateNeon(normalizedHex),
    earth: generateEarth(normalizedHex),
    ocean: generateOcean(normalizedHex),
    sunset: generateSunset(normalizedHex),
    forest: generateForest(normalizedHex),
    vintage: generateVintage(normalizedHex),
    modern: generateModern(normalizedHex),
    pastelNeon: generatePastelNeon(normalizedHex),
    monochromeDark: generateMonochromeDark(normalizedHex),
    monochromeLight: generateMonochromeLight(normalizedHex),
    accent: generateAccent(normalizedHex),
    gradientWarm: generateGradientWarm(normalizedHex),
    gradientCool: generateGradientCool(normalizedHex),
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