// lib/palette-types.ts
import { PALETTE_NAMES, type AllPalettes, type PaletteName } from '@/lib/dynamic-palettes';

// Record<PaletteName, string> => compile error if a label is missing or a key is misspelled.
export const PALETTE_LABELS: Record<PaletteName, string> = {
  // Basic harmonies
  'shades': 'Shades',
  'complementary': 'Complementary',
  'analogous': 'Analogous',
  'triadic': 'Triadic',
  'tetradic': 'Tetradic',
  'split-complementary': 'Split Complementary',
  'square': 'Square',

  // Mood-based
  'pastel': 'Pastel',
  'vibrant': 'Vibrant',
  'muted': 'Muted',
  'dark': 'Dark Shades',
  'light': 'Light Tints',
  'warm': 'Warm Palette',
  'cool': 'Cool Palette',

  // Design palettes
  'quiet-luxury': 'Quiet Luxury',
  'gothic-noir': 'Gothic Noir',
  'cozy-campfire': 'Cozy Campfire',
  'lavender-lullaby': 'Lavender Lullaby',

  // Makeup palettes
  'soft-glam': 'Soft Glam',
  'berry-martini': 'Berry Martini',
  'neutrals': 'Neutrals',

  // Advanced harmonies
  'monochromatic': 'Monochromatic',
  'compound': 'Compound',
  'neutral': 'Neutral',
  'gradient': 'Gradient',

  // Thematic
  'neon': 'Neon',
  'earth': 'Earth',
  'ocean': 'Ocean',
  'sunset': 'Sunset',
  'forest': 'Forest',
  'vintage': 'Vintage',
  'modern': 'Modern',

  // Special combinations
  'pastel-neon': 'Pastel Neon',
  'monochrome-dark': 'Dark Monochrome',
  'monochrome-light': 'Light Monochrome',
  'accent': 'Accent Palette',
  'gradient-warm': 'Warm Gradient',
  'gradient-cool': 'Cool Gradient',
  'hexadic': 'Hexadic', // was "split"
  'double-split': 'Double Split',
  'adjacent': 'Adjacent',
  'alternating': 'Alternating',
  'rainbow': 'Rainbow',
  'tint-shade-scale': 'Tint & Shade Scale (10 colors)',
  'ui-palette': 'UI Palette',
  'clash': 'Clash Palette',
  'saturation-scale': 'Saturation Scale',

  // Cafe & flavors
  'vanilla-latte': 'Vanilla Latte',
  'salted-caramel': 'Salted Caramel',
  'matcha-latte': 'Matcha Latte',
  'berry-blast': 'Berry Blast',
  'honey-almond': 'Honey Almond',
  'mocha': 'Mocha',

  // Cosmic & dreamy
  'stardust': 'Stardust',
  'cyberpunk-night': 'Cyberpunk Night',
  'moonlit-silver': 'Moonlit Silver',
  'aurora-borealis': 'Aurora Borealis',
  'galaxy': 'Galaxy',
  'dreamscape': 'Dreamscape',

  // Vintage & editorial
  'velvet-romance': 'Velvet Romance',
  'antique-parchment': 'Antique Parchment',
  'retro-funk': 'Retro Funk',
  'desert-oasis': 'Desert Oasis',
  'vintage-rose': 'Vintage Rose',
  'editorial': 'Editorial',

  // Tech & functional
  'glassmorphism': 'Glassmorphism Bases',
  'retro-terminal': 'Retro Terminal',
  'accessible-high-contrast': 'High Contrast (A11y)',
  'brand-identity': 'Brand Identity',
  'neubrutalism': 'Neubrutalism',
  'dark-mode-ui': 'Dark Mode UI',

  // More themed
  'cyber-lime': 'Cyber Lime / Brat',
  'nordic-scandi': 'Nordic Scandi',
  'industrial-concrete': 'Industrial Concrete',
  'mediterranean': 'Mediterranean Villa',
  'spring-bloom': 'Spring Bloom',
  'autumn-whimsy': 'Autumn Whimsy',
  'winter-solstice': 'Winter Solstice',
  'synthwave-80s': 'Synthwave 80s',
  'kawaii-pastel': 'Kawaii Pastel',
  'renaissance': 'Renaissance Oil',
  'pop-art': '60s Pop Art',
};

export interface PaletteType {
  id: PaletteName;
  label: string;
  colors: string[];
}

/** Replaces the hand-written paletteTypes array. Order follows the registry. */
export function buildPaletteTypes(palettes: AllPalettes): PaletteType[] {
  return PALETTE_NAMES.map((id) => ({
    id,
    label: PALETTE_LABELS[id],
    colors: palettes[id],
  }));
}