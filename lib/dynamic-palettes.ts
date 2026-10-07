// lib/dynamic-palettes.ts
import chroma from 'chroma-js';
import { getCachedColors } from './colors.shared';
import { getColorName } from './color-utils';

// ============ VALIDATION & HELPERS ============

export function normalizeHex(hex: string): string {
  let clean = hex.trim();
  clean = clean.replace(/^#/, '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) {
    throw new Error(`Invalid hex color format: ${hex}. Expected format: #RRGGBB or RRGGBB`);
  }
  return `#${clean.toUpperCase()}`;
}

export function isValidHex(hex: string): boolean {
  try {
    normalizeHex(hex);
    return true;
  } catch {
    return false;
  }
}

/** Throws on invalid hex input — an invalid color is not the same as "zero contrast". */
export function getContrastRatio(color1: string, color2: string): number {
  return chroma.contrast(normalizeHex(color1), normalizeHex(color2));
}

/** Boolean check: returns false if either color is invalid. */
export function isAccessible(color1: string, color2: string, level: 'AA' | 'AAA' = 'AA'): boolean {
  if (!isValidHex(color1) || !isValidHex(color2)) return false;
  const ratio = getContrastRatio(color1, color2);
  return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
}

// ============ CORE HELPERS — HSL-based color manipulation ============
// These preserve hue and saturation, unlike chroma.brighten/darken
// which operate in LAB space and desaturate colors.
// NOTE: HSL lightness is NOT perceptually uniform (use OKLCH if you need that).

interface HSL {
  h: number; // 0–360
  s: number; // 0–1
  l: number; // 0–1
}

const MIN_L = 0.02; // fromHSL clamps lightness to [MIN_L, MAX_L]
const MAX_L = 0.98;

/** Palette-level lightness range: themed palettes never collapse to near-black / near-white. */
const PAL_MIN_L = 0.12;
const PAL_MAX_L = 0.92;

/** Saturation used when the input is gray, so hue-based harmonies still produce color. */
const ACHROMATIC_THRESHOLD = 0.05;
const ACHROMATIC_FALLBACK_S = 0.45;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** True HSL of a hex color (gray stays gray). */
function getTrueHSL(hex: string): HSL {
  const c = chroma(normalizeHex(hex));
  return {
    h: c.get('hsl.h') || 0,
    s: c.get('hsl.s') || 0,
    l: c.get('hsl.l'),
  };
}

/** HSL used by harmony generators — gray inputs get a fallback saturation. */
function getHSL(hex: string): HSL {
  const hslVal = getTrueHSL(hex);
  if (hslVal.s < ACHROMATIC_THRESHOLD) {
    return { ...hslVal, s: ACHROMATIC_FALLBACK_S };
  }
  return hslVal;
}

/** Build a hex from HSL — clamped safely */
function fromHSL(h: number, s: number, l: number): string {
  const hh = (((h % 360) + 360) % 360) || 0;
  const ss = Math.max(0, Math.min(1, Number.isFinite(s) ? s : 0));
  const ll = Math.max(MIN_L, Math.min(MAX_L, Number.isFinite(l) ? l : 0.5)); // keep off pure black/white
  return chroma(hh, ss, ll, 'hsl').hex().toUpperCase();
}

/** Full-range HSL builder (used by shade/tint ladders and intentionally dark/light palettes). */
function hslFull(h: number, s: number, l: number): string {
  return fromHSL(h, s, l);
}

/** Palette-safe HSL builder: lightness is kept inside [PAL_MIN_L, PAL_MAX_L]. */
function hsl(h: number, s: number, l: number): string {
  return fromHSL(h, s, clamp(Number.isFinite(l) ? l : 0.5, PAL_MIN_L, PAL_MAX_L));
}

/** Shift hue by degrees (preserves saturation and lightness) */
function shiftHue(hex: string, degrees: number): string {
  const { h, s, l } = getHSL(hex);
  return fromHSL(h + degrees, s, l);
}

/** Darken by HSL lightness delta (positive value = darker) */
function darken(hex: string, delta: number): string {
  const { h, s, l } = getHSL(hex);
  return fromHSL(h, s, l - delta);
}

/**
 * Pull lightness toward mid-range so dark/light bases both give usable ladders.
 * (0.02 -> 0.33, 0.5 -> 0.5, 0.98 -> 0.67)
 */
const midL = (l: number) => 0.5 + (l - 0.5) * 0.35;

/**
 * Absolute lightness target with a small base-dependent nudge.
 * `k` controls how much of the (compressed) base lightness leaks into the target.
 */
const slot = (target: number, l: number, k = 0.6) =>
  clamp(target + (midL(l) - 0.5) * k, PAL_MIN_L, PAL_MAX_L);

/** "Light" slot derived from a multiplier (> 1) on compressed lightness — always actually light. */
const lt = (l: number, mult: number) => clamp(midL(l) * mult, 0.62, PAL_MAX_L);

/** Pastel-friendly saturation: never gray, never neon. */
const pastelSat = (s: number, mult = 1) => clamp(s * mult, 0.35, 0.85);

/** Vivid saturation: always punchy. */
const vividSat = (s: number) => clamp(s * 1.1, 0.7, 1);

// ---- Hue windows (named themes keep their identity, anchored on the base hue) ----

type HueWindow = readonly [number, number];

/**
 * Pull a hue into [lo, hi] (degrees, lo may be negative to wrap through 0).
 * Inside the window -> unchanged. Outside -> snapped to the nearest edge.
 */
function pullIntoWindow(h: number, [lo, hi]: HueWindow): number {
  const mid = (lo + hi) / 2;
  const half = (hi - lo) / 2;
  const d = ((((h - mid) % 360) + 540) % 360) - 180; // signed distance from window center, [-180, 180)
  return Math.abs(d) <= half ? mid + d : mid + Math.sign(d) * half;
}

const HUE_WINDOWS = {
  sunset: [-70, 50], // purple / magenta / red / orange / yellow
  forest: [90, 160], // yellow-green -> green -> green-teal
  earth: [15, 80], // browns / ochre / olive
  matcha: [70, 130], // tea greens
  mocha: [15, 40], // coffee browns
  caramel: [20, 48], // caramel / toffee
  honey: [30, 52], // honey / almond
  moonlit: [190, 240], // cool gray-blue
  aurora: [120, 290], // green -> teal -> blue -> violet
  warm: [-30, 65], // reds -> oranges -> yellows
  cool: [150, 270], // greens -> blues -> violets
} as const satisfies Record<string, HueWindow>;

/**
 * Build `count` colors. `t` goes 0 → 1 (safe for count = 1, no divide-by-zero).
 * Count is floored and clamped to at least 1.
 */
function scale(count: number, fn: (t: number, i: number) => string): string[] {
  const n = Math.max(1, Math.floor(Number.isFinite(count) ? count : 1));
  return Array.from({ length: n }, (_, i) => fn(n > 1 ? i / (n - 1) : 0, i));
}

/** Like `scale`, but slot 1 is always the user's base color. */
function baseFirst(
  base: string,
  count: number,
  fn: (t: number, i: number) => string
): string[] {
  const n = Math.max(1, Math.floor(Number.isFinite(count) ? count : 1));
  if (n === 1) return [base];
  return [base, ...scale(n - 1, fn)];
}

/** Nudge lightness of `color` until it meets `min` contrast against `bg`. */
function ensureContrast(color: string, bg: string, min: number): string {
  const { h, s, l } = getTrueHSL(color);
  const bgIsLight = chroma(normalizeHex(bg)).luminance() > 0.5;
  const dir = bgIsLight ? -1 : 1;
  let cur = l;
  for (let k = 0; k < 100; k++) {
    const candidate = fromHSL(h, s, cur);
    if (getContrastRatio(candidate, bg) >= min) return candidate;
    cur += dir * 0.01;
  }
  return bgIsLight ? '#000000' : '#FFFFFF';
}

// ============ SHADE GENERATION ============

export function generateShades(hex: string, count: number = 9): string[] {
  const normalized = normalizeHex(hex);
  const { h, s, l: baseL } = getTrueHSL(normalized);

  if (!Number.isFinite(count) || count <= 1) return [normalized];
  const n = Math.floor(count);

  // Bounds adapt to the base so the order (dark → base → light) never breaks
  // (kept inside fromHSL's clamp range so shades never collapse onto the clamp)
  const minL = clamp(Math.min(0.05, baseL * 0.5), MIN_L, Math.max(MIN_L, baseL));
  const maxL = clamp(Math.max(0.95, baseL + (1 - baseL) * 0.5), Math.min(MAX_L, baseL), MAX_L);

  // Split dark/light shade counts proportionally to where the base sits
  const total = n - 1;
  const darkRatio = (baseL - minL) / (maxL - minL);
  const darkCount = clamp(Math.round(total * darkRatio), 0, total);
  const lightCount = total - darkCount;

  const shades: string[] = [];

  for (let i = 0; i < darkCount; i++) {
    const t = (i + 1) / (darkCount + 1);
    const lightness = minL + (baseL - minL) * t;
    shades.push(hslFull(h, s * (0.85 + 0.15 * t), lightness)); // slightly desaturate the dark end
  }

  shades.push(normalized);

  for (let i = 0; i < lightCount; i++) {
    const t = (i + 1) / (lightCount + 1);
    const lightness = baseL + (maxL - baseL) * t;
    shades.push(hslFull(h, s * (1 - 0.15 * t), lightness)); // slightly desaturate the light end
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
    const baseName = getColorName(`#${hex}`);
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
    return getColorName(normalizeHex(hex));
  } catch {
    return 'Unknown Color';
  }
}

// ============ HARMONIC PALETTES ============

/** [light base, light complement, BASE, dark base, dark complement] — partners stay usable on dark/light bases. */
export function generateComplementary(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const lightL = slot(0.78, l, 0.5);
  const darkL = slot(0.24, l, 0.5);
  return [
    hsl(h, s, lightL),
    hsl(h + 180, s, lightL),
    norm,
    hsl(h, s, darkL),
    hsl(h + 180, s, darkL),
  ];
}

export function generateAnalogous(hex: string, count: number = 5): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  return scale(count, (t) => hslFull(h - 30 + t * 60, s, l));
}

export function generateTriadic(hex: string): string[] {
  const norm = normalizeHex(hex);
  return [0, 120, 240].map((deg) => shiftHue(norm, deg));
}

/** Tetradic (rectangle): two complementary pairs, 60° apart */
export function generateTetradic(hex: string): string[] {
  const norm = normalizeHex(hex);
  return [0, 60, 180, 240].map((deg) => shiftHue(norm, deg));
}

export function generateSplitComplementary(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const m = midL(l);
  return [
    norm,
    hsl(h + 150, s, m),
    hsl(h + 210, s, m),
    hsl(h + 150, s, m + 0.2),
    hsl(h + 210, s, m - 0.15),
  ];
}

/** Square: four colors evenly spaced 90° apart */
export function generateSquare(hex: string): string[] {
  const norm = normalizeHex(hex);
  return [0, 90, 180, 270].map((deg) => shiftHue(norm, deg));
}

export function generateMonochromatic(hex: string, count: number = 5): string[] {
  const norm = normalizeHex(hex);
  const { h, s } = getTrueHSL(norm);
  return scale(count, (t) => hslFull(h, s * (1 - t * 0.2), 0.15 + t * 0.6));
}

export function generateCompound(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const m = midL(l);
  return [
    norm,
    hsl(h + 15, s, m + 0.15),
    hsl(h + 30, s * 0.9, m - 0.15),
    hsl(h + 45, Math.min(1, s * 1.2), m),
    hsl(h + 60, s * 0.8, m),
  ];
}

/** Hexadic: six-ish hues at 0/60/120/240/300 (complement omitted) */
export function generateHexadic(hex: string): string[] {
  const norm = normalizeHex(hex);
  return [0, 120, 240, 60, 300].map((deg) => shiftHue(norm, deg));
}

export function generateDoubleSplit(hex: string): string[] {
  const norm = normalizeHex(hex);
  return [0, 30, 60, 180, 210, 240].map((deg) => shiftHue(norm, deg));
}

export function generateAdjacent(hex: string, count: number = 5): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const range = 40;
  const startHue = h - range / 2;
  return scale(count, (t) =>
    hslFull(startHue + t * range, s * (0.85 + t * 0.15), l * (0.85 + t * 0.15))
  );
}

/**
 * Alternating: base first, then base-hue / complement alternate while lightness
 * progresses, so every slot is distinct.
 */
export function generateAlternating(hex: string, count: number = 6): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const m = midL(l);
  const n = Math.max(1, Math.floor(Number.isFinite(count) ? count : 1));
  if (n === 1) return [norm];

  const out: string[] = [norm];
  for (let i = 1; i < n; i++) {
    const t = i / (n - 1);
    const isComp = i % 2 === 1;
    const lightness = m + (isComp ? 0.1 : -0.1) + (t - 0.5) * 0.3;
    out.push(hsl(isComp ? h + 180 : h, s * (0.9 + (isComp ? 0.1 : 0)), lightness));
  }
  return out;
}

/** Rainbow anchored on the base hue: base first, then evenly spaced hues around the wheel. */
export function generateRainbow(hex: string, count: number = 6): string[] {
  const norm = normalizeHex(hex);
  const { h, s } = getHSL(norm);
  const n = Math.max(1, Math.floor(Number.isFinite(count) ? count : 1));
  if (n === 1) return [norm];

  const sat = clamp(s * 1.1, 0.6, 0.95);
  const out: string[] = [norm];
  for (let i = 1; i < n; i++) {
    out.push(hsl(h + (i * 360) / n, sat, 0.5 + ((i % 3) - 1) * 0.04));
  }
  return out;
}

// ============ MOOD-BASED PALETTES ============

export function generatePastel(hex: string, count: number = 5): string[] {
  const norm = normalizeHex(hex);
  const { h, s } = getHSL(norm);
  return scale(count, (t, i) => hslFull(h - 20 + i * 10, s * (0.25 + t * 0.15), 0.7 + t * 0.15));
}

export function generateVibrant(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const sv = clamp(s * 1.2, 0.65, 1);
  return [
    hsl(h - 20, sv, slot(0.38, l, 0.4)),
    hsl(h - 10, sv, slot(0.45, l, 0.4)),
    hsl(h, Math.min(1, sv * 1.05), slot(0.5, l, 0.4)),
    hsl(h + 10, sv, slot(0.57, l, 0.4)),
    hsl(h + 20, sv, slot(0.64, l, 0.4)),
  ];
}

export function generateMuted(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  return scale(5, (t, i) => hsl(h - 20 + i * 10, s * (0.2 + t * 0.15), slot(0.4 + t * 0.3, l, 0.4)));
}

export function generateDark(hex: string, count: number = 5): string[] {
  const norm = normalizeHex(hex);
  const { h, s } = getTrueHSL(norm);
  return scale(count, (t) => hslFull(h, s * (1 - t * 0.2), 0.05 + t * 0.35));
}

export function generateLight(hex: string, count: number = 5): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getTrueHSL(norm);
  return scale(count, (t) => hslFull(h, s * (1 - t * 0.2), l + t * (0.9 - l)));
}

/** Warm palette — hues stay inside the warm window (reds → oranges → yellows) */
export function generateWarmPalette(hex: string, count: number = 5): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const W = HUE_WINDOWS.warm;
  const a = pullIntoWindow(h, W);
  const sat = clamp(s, 0.45, 0.95);
  return scale(count, (t) =>
    hsl(pullIntoWindow(a - 20 + t * 40, W), sat * (0.75 + t * 0.25), slot(0.32 + t * 0.38, l, 0.3))
  );
}

/** Cool palette — hues stay inside the cool window (greens → blues → violets) */
export function generateCoolPalette(hex: string, count: number = 5): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const W = HUE_WINDOWS.cool;
  const a = pullIntoWindow(h, W);
  const sat = clamp(s, 0.45, 0.95);
  return scale(count, (t) =>
    hsl(pullIntoWindow(a - 30 + t * 60, W), sat * (0.7 + t * 0.3), slot(0.32 + t * 0.38, l, 0.3))
  );
}

export function generateNeutralPalette(hex: string, count: number = 5): string[] {
  const norm = normalizeHex(hex);
  const { h, s } = getTrueHSL(norm);
  return scale(count, (t) => hslFull(h, s * (0.05 + t * 0.15), 0.2 + t * 0.5));
}

export function generateGradient(hex: string, count: number = 5): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  return scale(count, (t) =>
    hsl(h - 20 + t * 40, clamp(s, 0.35, 1) * (0.7 + t * 0.3), slot(0.32 + t * 0.38, l, 0.3))
  );
}

export function generateNeon(hex: string, count: number = 5): string[] {
  const norm = normalizeHex(hex);
  const { h, s } = getHSL(norm);
  return scale(count, (t, i) => hslFull(h - 40 + i * 20, Math.min(1, s * 1.3), 0.45 + t * 0.3));
}

/** Earth: base first, then browns / ochre / olive from the earth hue window. */
export function generateEarth(hex: string, count: number = 5): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const W = HUE_WINDOWS.earth;
  const a = pullIntoWindow(h, W);
  const sat = clamp(s, 0.25, 0.55);
  return baseFirst(norm, count, (t) =>
    hsl(pullIntoWindow(a + (t - 0.5) * 50, W), sat * (0.8 + 0.2 * t), slot(0.28 + t * 0.36, l, 0.3))
  );
}

export function generateOcean(hex: string, count: number = 5): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  return scale(count, (t, i) => hslFull(h - 20 + i * 10, s * (0.7 + t * 0.3), l * (0.4 + t * 0.4)));
}

/** Sunset: base first, then purple → magenta → red → orange → yellow (window-constrained). */
export function generateSunset(hex: string, count: number = 5): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const W = HUE_WINDOWS.sunset;
  const a = pullIntoWindow(h, W);
  const sat = clamp(s, 0.6, 0.95);
  return baseFirst(norm, count, (t) =>
    hsl(pullIntoWindow(a + (t - 0.5) * 90, W), sat, slot(0.35 + t * 0.35, l, 0.3))
  );
}

/** Forest: base first, then greens from the forest hue window, dark → light. */
export function generateForest(hex: string, count: number = 5): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const W = HUE_WINDOWS.forest;
  const a = pullIntoWindow(h, W);
  const sat = clamp(s, 0.35, 0.7);
  return baseFirst(norm, count, (t) =>
    hsl(pullIntoWindow(a + (t - 0.5) * 50, W), sat * (0.8 + 0.2 * t), slot(0.22 + t * 0.4, l, 0.3))
  );
}

export function generateVintage(hex: string, count: number = 5): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  return scale(count, (t, i) => hsl(h - 20 + i * 10, s * (0.2 + t * 0.15), slot(0.45 + t * 0.3, l, 0.4)));
}

export function generateModern(hex: string, count: number = 5): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  return scale(count, (t, i) =>
    hsl(h - 30 + i * 15, Math.min(1, s * (0.8 + t * 0.2)), slot(0.4 + t * 0.3, l, 0.4))
  );
}

export function generatePastelNeon(hex: string, count: number = 5): string[] {
  const norm = normalizeHex(hex);
  const { h, s } = getHSL(norm);
  return scale(count, (_t, i) => {
    const isPastel = i % 2 === 0;
    return hslFull(h - 40 + i * 20, isPastel ? s * 0.35 : Math.min(1, s * 1.3), isPastel ? 0.75 : 0.5);
  });
}

export function generateMonochromeDark(hex: string, count: number = 5): string[] {
  const norm = normalizeHex(hex);
  const { h, s } = getTrueHSL(norm);
  return scale(count, (t) => hslFull(h, s * (1 - t * 0.2), 0.03 + t * 0.27));
}

export function generateMonochromeLight(hex: string, count: number = 5): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getTrueHSL(norm);
  return scale(count, (t) => hslFull(h, s * (1 - t * 0.2), l + t * (0.92 - l)));
}

export function generateAccent(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const lightness = [0.5, 0.58, 0.46, 0.54];
  const colors: string[] = [norm];
  for (let i = 0; i < 4; i++) {
    colors.push(
      hsl(h + 45 + i * 45, clamp(s * (0.8 + i * 0.05), 0.4, 0.95), slot(lightness[i], l, 0.3))
    );
  }
  return colors;
}

/** Warm gradient: stays inside the warm hue window. */
export function generateGradientWarm(hex: string, count: number = 5): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const W = HUE_WINDOWS.warm;
  const a = pullIntoWindow(h, W);
  const sat = clamp(s, 0.45, 0.95);
  return scale(count, (t) =>
    hsl(pullIntoWindow(a - 15 + t * 30, W), sat * (0.7 + t * 0.3), slot(0.32 + t * 0.38, l, 0.3))
  );
}

/** Cool gradient: stays inside the cool hue window. */
export function generateGradientCool(hex: string, count: number = 5): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const W = HUE_WINDOWS.cool;
  const a = pullIntoWindow(h, W);
  const sat = clamp(s, 0.45, 0.95);
  return scale(count, (t) =>
    hsl(pullIntoWindow(a + 15 - t * 30, W), sat * (0.7 + t * 0.3), slot(0.32 + t * 0.38, l, 0.3))
  );
}

// ============ MAKEUP ============

export function generateSoftGlam(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const m = midL(l);
  return [
    norm,
    hsl(h, s * 0.6, lt(l, 1.3)),
    hsl(h + 10, s * 0.7, m * 0.75),
    hsl(h + 20, s * 0.5, lt(l, 1.4)),
    hsl(h, s * 0.4, m * 0.5),
    hsl(h + 30, s * 0.7, m * 0.7),
  ];
}

export function generateBerryMartini(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const m = midL(l);
  return [
    norm,
    hsl(h + 20, s * 0.95, m * 0.85),
    hsl(h - 20, s * 0.85, m * 0.55),
    hsl(h + 40, s * 0.7, lt(l, 1.2)),
    hsl(h + 60, s * 0.6, m * 0.35),
  ];
}

export function generateNeutrals(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const m = midL(l);
  return [
    norm,
    hsl(h, s * 0.15, lt(l, 1.4)),
    hsl(h, s * 0.25, m * 0.85),
    hsl(h, s * 0.1, m * 0.55),
    hsl(h, s * 0.2, m * 0.35),
  ];
}

// ============ DESIGN & AESTHETIC ============

export function generateQuietLuxury(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const m = midL(l);
  return [
    norm,
    hsl(h, s * 0.25, lt(l, 1.4)),
    hsl(h + 20, s * 0.35, m * 0.8),
    hsl(h, s * 0.15, m * 0.4),
    hsl(h + 40, s * 0.2, m * 0.6),
  ];
}

/** Intentionally dark palette, but never pure black. */
export function generateGothicNoir(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const m = midL(l);
  return [
    norm,
    hslFull(h, s, Math.max(0.06, m * 0.35)),
    hslFull(h + 180, s * 0.6, Math.max(0.05, m * 0.25)),
    hsl(h, s * 0.4, m * 0.65),
    hslFull(h + 90, s * 0.3, Math.max(0.04, m * 0.15)),
  ];
}

export function generateCozyCampfire(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const m = midL(l);
  return [
    norm,
    hsl(h + 30, s * 0.85, lt(l, 1.2)),
    hsl(h + 60, s * 0.7, m * 0.55),
    hsl(h + 15, s * 0.75, lt(l, 1.35)),
    hsl(h + 45, s * 0.6, m * 0.4),
  ];
}

export function generateLavenderLullaby(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s } = getHSL(norm);
  const ps = pastelSat(s);
  return [
    norm,
    hsl(h + 20, ps, 0.86),
    hsl(h + 40, ps, 0.9),
    hsl(h + 180, ps, 0.82),
    hsl(h + 60, ps, 0.88),
  ];
}

export function generateTintShadeScale(hex: string, count: number = 10): string[] {
  const norm = normalizeHex(hex);
  const { h, s } = getTrueHSL(norm);
  return scale(count, (t) => hslFull(h, s, 0.05 + t * 0.9));
}

/**
 * UI palette: primary (base) + two analogous neighbors + a soft neutral surface + one complement accent.
 * Saturation is capped so it reads like a real product palette, not a clash.
 */
export function generateUIPalette(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const sat = clamp(Math.min(s, 0.6), 0.25, 0.6);
  const m = midL(l);
  return [
    norm,
    hsl(h + 25, sat, m),
    hsl(h - 25, sat * 0.9, m + 0.1),
    hsl(h, 0.12, 0.92),
    hsl(h + 180, sat, 0.5),
  ];
}

export function generateClash(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const m = midL(l);
  return [
    norm,
    hsl(h + 120, s, lt(l, 1.15)),
    hsl(h + 240, s * 0.9, m * 0.85),
    hsl(h + 60, s * 0.95, lt(l, 1.1)),
    hsl(h + 300, s * 0.85, m * 0.75),
  ];
}

export function generateSaturationScale(hex: string, count: number = 5): string[] {
  const norm = normalizeHex(hex);
  const { h, l } = getHSL(norm);
  return scale(count, (t) => hslFull(h, 0.1 + t * 0.9, l));
}

// ============ CAFE & FLAVORS ============

/** Creamy light tones + one roast accent. */
export function generateVanillaLatte(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h } = getHSL(norm);
  return [
    norm,
    hsl(h, 0.4, 0.92),
    hsl(h + 20, 0.45, 0.82),
    hsl(h + 10, 0.35, 0.7),
    hsl(h + 30, 0.5, 0.5),
  ];
}

/** Caramel: base + toffee / dark caramel / cream / salt (caramel hue window). */
export function generateSaltedCaramel(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const W = HUE_WINDOWS.caramel;
  const a = pullIntoWindow(h, W);
  const sat = clamp(s, 0.45, 0.85);
  return [
    norm,
    hsl(pullIntoWindow(a + 8, W), sat, slot(0.5, l, 0.3)),
    hsl(pullIntoWindow(a - 5, W), sat * 0.8, slot(0.32, l, 0.3)),
    hsl(pullIntoWindow(a + 14, W), sat * 0.6, 0.78),
    hsl(pullIntoWindow(a + 18, W), 0.2, 0.92),
  ];
}

/** Matcha: base + tea greens / milk / dark leaf (matcha hue window). */
export function generateMatchaLatte(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const W = HUE_WINDOWS.matcha;
  const a = pullIntoWindow(h, W);
  const sat = clamp(s, 0.35, 0.7);
  return [
    norm,
    hsl(a, sat, slot(0.42, l, 0.3)),
    hsl(pullIntoWindow(a + 15, W), sat * 0.6, 0.62),
    hsl(pullIntoWindow(a - 10, W), sat * 0.4, 0.85),
    hsl(pullIntoWindow(a - 5, W), sat * 0.8, 0.25),
  ];
}

export function generateBerryBlast(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const m = midL(l);
  return [
    norm,
    hsl(h + 40, s * 0.95, m * 0.85),
    hsl(h + 20, s * 0.85, lt(l, 1.15)),
    hsl(h + 60, s * 0.8, m * 0.65),
    hsl(h + 80, s * 0.7, m * 0.9),
  ];
}

/** Honey almond: base + honey / almond / toasted tones (honey hue window). */
export function generateHoneyAlmond(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const W = HUE_WINDOWS.honey;
  const a = pullIntoWindow(h, W);
  const sat = clamp(s, 0.4, 0.85);
  return [
    norm,
    hsl(pullIntoWindow(a + 5, W), sat, slot(0.62, l, 0.3)),
    hsl(a, sat * 0.5, 0.82),
    hsl(pullIntoWindow(a - 8, W), sat * 0.45, 0.7),
    hsl(pullIntoWindow(a - 12, W), sat * 0.5, 0.35),
  ];
}

/** Mocha: base + dark roast / mid / latte / cream (mocha hue window). */
export function generateMocha(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const W = HUE_WINDOWS.mocha;
  const a = pullIntoWindow(h, W);
  const sat = clamp(s, 0.3, 0.6);
  return [
    norm,
    hsl(a, sat, slot(0.3, l, 0.3)),
    hsl(pullIntoWindow(a + 8, W), sat * 0.9, 0.5),
    hsl(pullIntoWindow(a + 15, W), sat * 0.7, 0.72),
    hsl(pullIntoWindow(a + 22, W), sat * 0.5, 0.88),
  ];
}

// ============ COSMIC & DREAMY ============

export function generateStardust(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const m = midL(l);
  return [
    norm,
    hsl(h + 180, s * 0.3, lt(l, 1.4)),
    hsl(h + 240, s * 0.4, m * 0.85),
    hsl(h + 300, s * 0.5, m * 0.65),
    hsl(h + 60, s * 0.2, lt(l, 1.35)),
  ];
}

export function generateCyberpunkNight(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { s, l } = getHSL(norm);
  return [
    norm,
    hslFull(180, s * 0.95, Math.max(0.35, l * 0.75)),
    hslFull(300, s * 0.9, Math.max(0.4, l * 0.9)),
    hslFull(60, s * 0.6, Math.max(0.15, l * 0.4)),
    hslFull(240, s * 0.8, Math.max(0.25, l * 0.5)),
  ];
}

/** Moonlit silver: base + cool gray-blue silvers (moonlit hue window, low saturation). */
export function generateMoonlitSilver(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h } = getHSL(norm);
  const W = HUE_WINDOWS.moonlit;
  const a = pullIntoWindow(h, W);
  return [
    norm,
    hsl(a, 0.12, 0.88),
    hsl(pullIntoWindow(a + 10, W), 0.18, 0.7),
    hsl(pullIntoWindow(a - 10, W), 0.25, 0.5),
    hsl(pullIntoWindow(a + 15, W), 0.35, 0.28),
  ];
}

/** Aurora: base + green → teal → blue → violet bands (aurora hue window). */
export function generateAuroraBorealis(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const W = HUE_WINDOWS.aurora;
  const a = pullIntoWindow(h, W);
  const sat = clamp(s, 0.55, 0.9);
  const offsets = [-60, -20, 25, 65];
  const lights = [0.5, 0.55, 0.6, 0.68];
  return [
    norm,
    ...offsets.map((off, i) =>
      hsl(pullIntoWindow(a + off, W), sat * (0.95 - i * 0.07), slot(lights[i], l, 0.3))
    ),
  ];
}

/** Galaxy: intentionally deep, but never pure black. */
export function generateGalaxy(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const m = midL(l);
  return [
    norm,
    hslFull(h + 240, s * 0.85, Math.max(0.08, m * 0.4)),
    hsl(h + 300, s * 0.7, m * 0.55),
    hsl(h + 180, s * 0.6, m * 0.4),
    hsl(h + 60, s * 0.4, m * 0.7),
  ];
}

export function generateDreamscape(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s } = getHSL(norm);
  const ps = pastelSat(s);
  return [
    norm,
    hsl(h + 60, ps, 0.88),
    hsl(h + 120, ps, 0.82),
    hsl(h + 180, ps, 0.86),
    hsl(h + 240, ps, 0.84),
  ];
}

// ============ VINTAGE & EDITORIAL ============

export function generateVelvetRomance(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const m = midL(l);
  return [
    norm,
    hsl(h + 10, s * 0.95, m * 0.7),
    hsl(h + 20, s * 0.8, m * 0.85),
    hsl(h + 40, s * 0.6, lt(l, 1.15)),
    hsl(h + 60, s * 0.4, lt(l, 1.25)),
  ];
}

export function generateAntiqueParchment(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const m = midL(l);
  return [
    norm,
    hsl(h + 30, s * 0.3, lt(l, 1.35)),
    hsl(h + 20, s * 0.4, m * 0.85),
    hsl(h + 40, s * 0.2, m * 0.65),
    hsl(h + 50, s * 0.15, m * 0.45),
  ];
}

export function generateRetroFunk(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  return [
    norm,
    hsl(h + 60, s * 0.95, slot(0.5, l, 0.4)),
    hsl(h + 120, s * 0.9, slot(0.45, l, 0.4)),
    hsl(h + 180, s * 0.8, slot(0.52, l, 0.4)),
    hsl(h + 240, s * 0.7, slot(0.58, l, 0.4)),
  ];
}

export function generateDesertOasis(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const m = midL(l);
  return [
    norm,
    hsl(h + 30, s * 0.7, m * 0.8),
    hsl(h + 180, s * 0.6, m * 0.7),
    hsl(h + 60, s * 0.5, m * 0.55),
    hsl(h + 20, s * 0.4, lt(l, 1.3)),
  ];
}

export function generateVintageRose(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const m = midL(l);
  return [
    norm,
    hsl(h + 15, s * 0.6, m * 0.85),
    hsl(h + 30, s * 0.4, lt(l, 1.2)),
    hsl(h + 45, s * 0.5, m * 0.65),
    hsl(h + 60, s * 0.3, m * 0.9),
  ];
}

export function generateEditorial(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const m = midL(l);
  return [
    norm,
    hslFull(h, s * 0.15, Math.max(0.08, m * 0.25)),
    hsl(h + 30, s * 0.3, m * 0.75),
    hsl(h, s * 0.1, lt(l, 1.4)),
    hsl(h + 180, s * 0.3, m * 0.55),
  ];
}

// ============ TECH & FUNCTIONAL ============

export function generateGlassmorphism(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s } = getHSL(norm);
  return [
    norm,
    hsl(h, clamp(s * 0.4, 0.2, 0.5), 0.95),
    hsl(h + 30, clamp(s * 0.35, 0.2, 0.45), 0.9),
    hsl(h, 0.2, 0.82),
    hsl(h, 0.2, 0.3),
  ];
}

export function generateRetroTerminal(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { s, l } = getHSL(norm);
  return [
    norm,
    hslFull(120, s * 0.85, Math.max(0.4, l * 0.85)),
    hslFull(60, s * 0.9, Math.max(0.55, l * 0.9)),
    hslFull(120, s * 0.3, Math.max(0.05, l * 0.2)),
    hslFull(120, s * 0.4, Math.max(0.75, l * 1.1)),
  ];
}

/**
 * Palette with contrast-adjusted text/accent colors.
 * Returns [base, on-base text, light background, body text, accent, brand-on-light].
 * Contrast targets are enforced only where a color is explicitly adjusted:
 *  - on-base text: better of black/white against the base
 *  - body text: >= 7:1 on the light background
 *  - accent and brand-on-light: >= 4.5:1 on the light background
 * NOTE: brand-on-light is a lightness-adjusted variant of the base. When the base already
 * passes contrast (so the adjustment would return the base itself), a slightly darker variant
 * is used instead so slots 01 and 06 are never duplicates (except for extreme near-black bases
 * where no darker variant exists).
 */
export function generateAccessibleHighContrast(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s } = getHSL(norm);

  const bgLight = hslFull(h, s * 0.3, 0.96);
  const text = ensureContrast(hslFull(h, s * 0.5, 0.2), bgLight, 7);
  const accent = ensureContrast(shiftHue(norm, 180), bgLight, 4.5);

  let brandOnLight = ensureContrast(norm, bgLight, 4.5);
  if (brandOnLight === norm) {
    for (const delta of [0.08, 0.05, 0.03]) {
      const alt = ensureContrast(darken(norm, delta), bgLight, 4.5);
      if (alt !== norm) {
        brandOnLight = alt;
        break;
      }
    }
  }

  const onBase =
    getContrastRatio('#FFFFFF', norm) >= getContrastRatio('#000000', norm) ? '#FFFFFF' : '#000000';

  return [norm, onBase, bgLight, text, accent, brandOnLight];
}

export function generateBrandIdentity(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  return [
    norm,
    hsl(h, s * 0.9, slot(0.42, l, 0.4)),
    hsl(h, s * 0.95, slot(0.28, l, 0.4)),
    hsl(h + 180, s * 0.7, slot(0.55, l, 0.4)),
    hsl(h, clamp(s * 0.4, 0.15, 0.5), 0.9),
    hsl(h, s * 0.6, slot(0.16, l, 0.3)),
  ];
}

export function generateNeubrutalism(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s } = getHSL(norm);
  const sv = vividSat(s);
  return [
    norm,
    hsl(h + 60, sv, 0.62),
    hsl(h + 180, sv, 0.6),
    hsl(h + 300, sv, 0.65),
    '#000000',
  ];
}

export function generateDarkModeUI(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  return [
    norm,
    hslFull(h, s * 0.4, Math.max(0.08, l * 0.3)),
    hslFull(h, s * 0.5, Math.max(0.12, l * 0.35)),
    hslFull(h, s * 0.55, Math.max(0.18, l * 0.45)),
    hslFull(h, s * 0.65, Math.max(0.28, l * 0.65)),
  ];
}

// ============ MORE THEMED PALETTES ============

/** Cyber lime: base + brat-style lime, cyan, magenta, yellow — all vivid. */
export function generateCyberLime(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { s } = getHSL(norm);
  const sv = vividSat(s);
  return [
    norm,
    hsl(74, 1, 0.45),
    hsl(180, sv, 0.5),
    hsl(300, sv, 0.6),
    hsl(58, sv, 0.55),
  ];
}

export function generateNordicScandi(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h } = getHSL(norm);
  return [
    norm,
    hsl(h, 0.12, 0.94),
    hsl(h, 0.15, 0.84),
    hsl(h + 180, 0.3, 0.82),
    hsl(h, 0.12, 0.38),
  ];
}

export function generateIndustrialConcrete(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const m = midL(l);
  return [
    norm,
    hsl(h, s * 0.1, m * 0.9 + 0.2),
    hsl(h, s * 0.2, m * 0.65 + 0.1),
    hsl(h + 30, s * 0.3, m * 0.45),
    hsl(h, s * 0.05, m * 0.18),
  ];
}

export function generateMediterranean(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { s, l } = getHSL(norm);
  const m = midL(l);
  return [
    norm,
    hsl(200, s * 0.8, m * 0.9),
    hsl(40, s * 0.7, m * 1.1),
    hsl(60, s * 0.5, lt(l, 1.3)),
    hsl(120, s * 0.6, m * 0.7),
  ];
}

export function generateSpringBloom(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s } = getHSL(norm);
  const ps = pastelSat(s);
  return [
    norm,
    hsl(h + 30, ps, 0.82),
    hsl(120, ps, 0.75),
    hsl(180, ps, 0.85),
    hsl(h + 60, ps, 0.88),
  ];
}

export function generateAutumnWhimsy(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const m = midL(l);
  return [
    norm,
    hsl(h + 30, s * 0.9, m * 0.9),
    hsl(50, s * 0.8, m * 1.1),
    hsl(120, s * 0.5, m * 0.75),
    hsl(h + 45, s * 0.6, lt(l, 1.3)),
  ];
}

export function generateWinterSolstice(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const m = midL(l);
  return [
    norm,
    hsl(200, s * 0.3, lt(l, 1.4)),
    hsl(220, s * 0.4, m * 1.1),
    hsl(h, 0.1, 0.9),
    hsl(240, s * 0.5, m * 0.4),
  ];
}

export function generateSynthwave80s(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { s } = getHSL(norm);
  const sv = vividSat(s);
  return [
    norm,
    hsl(310, sv, 0.6),
    hsl(180, sv, 0.55),
    hsl(270, clamp(sv * 0.9, 0.6, 1), 0.45),
    hsl(50, sv, 0.6),
  ];
}

export function generateKawaiiPastel(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { s } = getHSL(norm);
  const ps = pastelSat(s);
  return [
    norm,
    hsl(340, ps, 0.86),
    hsl(180, ps, 0.85),
    hsl(240, ps, 0.88),
    hsl(60, ps, 0.85),
  ];
}

export function generateRenaissance(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { h, s, l } = getHSL(norm);
  const m = midL(l);
  return [
    norm,
    hsl(h + 20, s * 0.7, m * 0.8),
    hsl(h + 40, s * 0.6, m * 1.05),
    hsl(h + 180, s * 0.5, m * 0.9),
    hsl(h + 60, s * 0.3, lt(l, 1.3)),
  ];
}

export function generatePopArt(hex: string): string[] {
  const norm = normalizeHex(hex);
  const { s } = getHSL(norm);
  const sv = vividSat(s);
  return [
    norm,
    hsl(0, sv, 0.52),
    hsl(52, sv, 0.58),
    hsl(220, sv, 0.5),
    '#000000',
  ];
}

// ============ PALETTE REGISTRY ============
// Single source of truth. Keys are kebab-case so CSS variables / Tailwind keys stay consistent.

type PaletteGenerator = (hex: string, count?: number) => string[];

const PALETTE_GENERATORS = {
  // Basic harmonies
  'shades': generateShades,
  'complementary': generateComplementary,
  'analogous': generateAnalogous,
  'triadic': generateTriadic,
  'tetradic': generateTetradic,
  'split-complementary': generateSplitComplementary,
  'square': generateSquare,

  // Mood-based
  'pastel': generatePastel,
  'vibrant': generateVibrant,
  'muted': generateMuted,
  'dark': generateDark,
  'light': generateLight,
  'warm': generateWarmPalette,
  'cool': generateCoolPalette,

  // Design palettes
  'quiet-luxury': generateQuietLuxury,
  'gothic-noir': generateGothicNoir,
  'cozy-campfire': generateCozyCampfire,
  'lavender-lullaby': generateLavenderLullaby,

  // Makeup palettes
  'soft-glam': generateSoftGlam,
  'berry-martini': generateBerryMartini,
  'neutrals': generateNeutrals,

  // Advanced harmonies
  'monochromatic': generateMonochromatic,
  'compound': generateCompound,
  'neutral': generateNeutralPalette,
  'gradient': generateGradient,

  // Thematic
  'neon': generateNeon,
  'earth': generateEarth,
  'ocean': generateOcean,
  'sunset': generateSunset,
  'forest': generateForest,
  'vintage': generateVintage,
  'modern': generateModern,

  // Special combinations
  'pastel-neon': generatePastelNeon,
  'monochrome-dark': generateMonochromeDark,
  'monochrome-light': generateMonochromeLight,
  'accent': generateAccent,
  'gradient-warm': generateGradientWarm,
  'gradient-cool': generateGradientCool,
  'hexadic': generateHexadic,
  'double-split': generateDoubleSplit,
  'adjacent': generateAdjacent,
  'alternating': generateAlternating,
  'rainbow': generateRainbow,

  'tint-shade-scale': generateTintShadeScale,
  'ui-palette': generateUIPalette,
  'clash': generateClash,
  'saturation-scale': generateSaturationScale,

  // Cafe & flavors
  'vanilla-latte': generateVanillaLatte,
  'salted-caramel': generateSaltedCaramel,
  'matcha-latte': generateMatchaLatte,
  'berry-blast': generateBerryBlast,
  'honey-almond': generateHoneyAlmond,
  'mocha': generateMocha,

  // Cosmic & dreamy
  'stardust': generateStardust,
  'cyberpunk-night': generateCyberpunkNight,
  'moonlit-silver': generateMoonlitSilver,
  'aurora-borealis': generateAuroraBorealis,
  'galaxy': generateGalaxy,
  'dreamscape': generateDreamscape,

  // Vintage & editorial
  'velvet-romance': generateVelvetRomance,
  'antique-parchment': generateAntiqueParchment,
  'retro-funk': generateRetroFunk,
  'desert-oasis': generateDesertOasis,
  'vintage-rose': generateVintageRose,
  'editorial': generateEditorial,

  // Tech & functional
  'glassmorphism': generateGlassmorphism,
  'retro-terminal': generateRetroTerminal,
  'accessible-high-contrast': generateAccessibleHighContrast,
  'brand-identity': generateBrandIdentity,
  'neubrutalism': generateNeubrutalism,
  'dark-mode-ui': generateDarkModeUI,

  // More themed
  'cyber-lime': generateCyberLime,
  'nordic-scandi': generateNordicScandi,
  'industrial-concrete': generateIndustrialConcrete,
  'mediterranean': generateMediterranean,
  'spring-bloom': generateSpringBloom,
  'autumn-whimsy': generateAutumnWhimsy,
  'winter-solstice': generateWinterSolstice,
  'synthwave-80s': generateSynthwave80s,
  'kawaii-pastel': generateKawaiiPastel,
  'renaissance': generateRenaissance,
  'pop-art': generatePopArt,
} satisfies Record<string, PaletteGenerator>; // needs TS >= 4.9

export type PaletteName = keyof typeof PALETTE_GENERATORS;
export type AllPalettes = Record<PaletteName, string[]>;

export const PALETTE_NAMES = Object.keys(PALETTE_GENERATORS) as PaletteName[];

/**
 * Generate a single palette by name (no need to compute all 90).
 * `count` is honored by generators that support it; fixed-size generators ignore it.
 */
export function generatePalette(hex: string, name: PaletteName, count?: number): string[] {
  const generator: PaletteGenerator | undefined = PALETTE_GENERATORS[name];
  if (!generator) {
    throw new Error(`Palette "${name}" not found`);
  }
  return generator(normalizeHex(hex), count);
}

// ============ CACHING (bounded LRU) ============

const MAX_PALETTE_CACHE_SIZE = 500;
const paletteCache = new Map<string, AllPalettes>();

export function getCachedPalettes(hex: string): AllPalettes {
  const normalizedHex = normalizeHex(hex);
  const cached = paletteCache.get(normalizedHex);

  if (cached) {
    // refresh recency
    paletteCache.delete(normalizedHex);
    paletteCache.set(normalizedHex, cached);
    return cached;
  }

  const fresh = generateAllPalettes(normalizedHex);
  paletteCache.set(normalizedHex, fresh);

  if (paletteCache.size > MAX_PALETTE_CACHE_SIZE) {
    const oldestKey = paletteCache.keys().next().value;
    if (oldestKey !== undefined) paletteCache.delete(oldestKey);
  }

  return fresh;
}

// ============ GENERATE ALL PALETTES ============

export function generateAllPalettes(hex: string): AllPalettes {
  const normalizedHex = normalizeHex(hex); // throws on invalid input

  const result = {} as AllPalettes;
  for (const name of PALETTE_NAMES) {
    result[name] = PALETTE_GENERATORS[name](normalizedHex);
  }
  return result;
}

// ============ UTILITY FUNCTIONS ============

export function getPaletteInfo(hex: string) {
  const normalizedHex = normalizeHex(hex);
  const palettes = getCachedPalettes(normalizedHex);
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

export function exportPaletteAsCSS(hex: string, paletteName: PaletteName, count?: number): string {
  const colors = generatePalette(hex, paletteName, count);
  return colors
    .map((color, index) => `  --color-${paletteName}-${index + 1}: ${color};`)
    .join('\n');
}

export function exportPaletteAsTailwind(hex: string, paletteName: PaletteName, count?: number): string {
  const colors = generatePalette(hex, paletteName, count);
  const tailwindObj: Record<string, string> = {};
  colors.forEach((color, index) => {
    tailwindObj[`${paletteName}-${index + 1}`] = color;
  });
  return JSON.stringify(tailwindObj, null, 2);
}