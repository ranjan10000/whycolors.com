// lib/dynamic-palettes.ts
import chroma from 'chroma-js';

// ✅ Generate shades for ANY color
export function generateShades(hex: string, count: number = 9): string[] {
  const color = chroma(hex);
  const shades: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const lightness = 10 + (i / (count - 1)) * 85;
    shades.push(color.set('hsl.l', lightness / 100).hex());
  }
  
  return shades;
}


// ✅ Add this function to get all color names
export function getAllColorNames(): string[] {
  // Define common color names
  const colorNames = [
    'red', 'orange', 'yellow', 'green', 'blue', 'purple', 
    'pink', 'teal', 'cyan', 'indigo', 'rose', 'amber',
    'lime', 'emerald', 'sky', 'violet', 'fuchsia', 'coral',
    'navy', 'olive', 'mint', 'peach', 'lavender', 'sage',
    'terracotta', 'charcoal', 'ivory', 'gold', 'silver', 'brown'
  ];
  
  return colorNames;
}

// ✅ Add this function to get color definition
export function getColorDefinition(colorName: string) {
  const hexMap: Record<string, string> = {
    'red': '#EF4444',
    'orange': '#F97316',
    'yellow': '#EAB308',
    'green': '#22C55E',
    'blue': '#3B82F6',
    'purple': '#8B5CF6',
    'pink': '#EC4899',
    'teal': '#14B8A6',
    'cyan': '#06B6D4',
    'indigo': '#6366F1',
    'rose': '#F43F5E',
    'amber': '#F59E0B',
    'lime': '#84CC16',
    'emerald': '#10B981',
    'sky': '#0EA5E9',
    'violet': '#8B5CF6',
    'fuchsia': '#D946EF',
    'coral': '#FB7185',
    'navy': '#1E293B',
    'olive': '#4B5563',
    'mint': '#34D399',
    'peach': '#FDBA74',
    'lavender': '#C4B5FD',
    'sage': '#86EFAC',
    'terracotta': '#C2410C',
    'charcoal': '#1F2937',
    'ivory': '#FEF3C7',
    'gold': '#F59E0B',
    'silver': '#9CA3AF',
    'brown': '#92400E'
  };
  
  const hex = hexMap[colorName];
  if (!hex) return null;
  
  return {
    name: colorName.charAt(0).toUpperCase() + colorName.slice(1),
    hex: hex,
    shades: generateShades(hex),
  };
}

// ✅ Generate complementary palette
export function generateComplementary(hex: string): string[] {
  const color = chroma(hex);
  return [
    hex,
    color.set('hsl.h', '+180').hex(),
    color.set('hsl.h', '+180').brighten(0.5).hex(),
    color.brighten(0.5).hex(),
    color.set('hsl.h', '+180').darken(0.5).hex()
  ];
}

// ✅ Generate analogous palette
export function generateAnalogous(hex: string, count: number = 5): string[] {
  const color = chroma(hex);
  const colors: string[] = [];
  const step = 30 / (count - 1);
  
  for (let i = 0; i < count; i++) {
    const offset = -30 + i * step;
    colors.push(color.set('hsl.h', `${offset}`).hex());
  }
  
  return colors;
}

// ✅ Generate triadic palette
export function generateTriadic(hex: string): string[] {
  const color = chroma(hex);
  return [0, 120, 240].map(hue => 
    color.set('hsl.h', `+${hue}`).hex()
  );
}

// ✅ Generate tetradic palette
export function generateTetradic(hex: string): string[] {
  const color = chroma(hex);
  return [0, 90, 180, 270].map(hue => 
    color.set('hsl.h', `+${hue}`).hex()
  );
}

// ✅ Generate split complementary
export function generateSplitComplementary(hex: string): string[] {
  const color = chroma(hex);
  return [
    hex,
    color.set('hsl.h', '+150').hex(),
    color.set('hsl.h', '+210').hex(),
    color.set('hsl.h', '+150').brighten(0.5).hex(),
    color.set('hsl.h', '+210').darken(0.5).hex()
  ];
}

// ✅ Generate square palette
export function generateSquare(hex: string): string[] {
  const color = chroma(hex);
  return [0, 90, 180, 270].map(hue => 
    color.set('hsl.h', `+${hue}`).hex()
  );
}

// ✅ Generate pastel palette
export function generatePastel(hex: string, count: number = 5): string[] {
  const color = chroma(hex);
  const colors: string[] = [];
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const lightness = 45 + t * 40;
    const sat = 30 + t * 20;
    colors.push(color.set('hsl.s', sat / 100).set('hsl.l', lightness / 100).hex());
  }
  
  return colors;
}

// ✅ Generate vibrant palette
export function generateVibrant(hex: string): string[] {
  const color = chroma(hex);
  return [
    color.set('hsl.s', 0.8).set('hsl.l', 0.3).hex(),
    color.set('hsl.s', 0.9).set('hsl.l', 0.4).hex(),
    color.set('hsl.s', 1.0).set('hsl.l', 0.5).hex(),
    color.set('hsl.s', 0.9).set('hsl.l', 0.6).hex(),
    color.set('hsl.s', 0.8).set('hsl.l', 0.7).hex()
  ];
}

// ✅ Generate muted palette
export function generateMuted(hex: string): string[] {
  const color = chroma(hex);
  return [
    color.set('hsl.s', 0.2).set('hsl.l', 0.3).hex(),
    color.set('hsl.s', 0.3).set('hsl.l', 0.4).hex(),
    color.set('hsl.s', 0.4).set('hsl.l', 0.5).hex(),
    color.set('hsl.s', 0.3).set('hsl.l', 0.6).hex(),
    color.set('hsl.s', 0.2).set('hsl.l', 0.7).hex()
  ];
}

// ✅ Generate dark shades
export function generateDark(hex: string, count: number = 5): string[] {
  const color = chroma(hex);
  const shades: string[] = [];
  for (let i = 0; i < count; i++) {
    shades.push(color.darken(0.3 + i * 0.2).hex());
  }
  return shades;
}

// ✅ Generate light tints
export function generateLight(hex: string, count: number = 5): string[] {
  const color = chroma(hex);
  const tints: string[] = [];
  for (let i = 0; i < count; i++) {
    tints.push(color.brighten(0.3 + i * 0.2).hex());
  }
  return tints;
}

// ✅ Generate warm variant
export function generateWarm(hex: string): string {
  return chroma(hex).set('hsl.h', '+15').hex();
}

// ✅ Generate cool variant
export function generateCool(hex: string): string {
  return chroma(hex).set('hsl.h', '-15').hex();
}

// ✅ Generate ALL palettes for ANY color
export function generateAllPalettes(hex: string) {
  return {
    shades: generateShades(hex),
    complementary: generateComplementary(hex),
    analogous: generateAnalogous(hex),
    triadic: generateTriadic(hex),
    tetradic: generateTetradic(hex),
    'split-complementary': generateSplitComplementary(hex),
    square: generateSquare(hex),
    pastel: generatePastel(hex),
    vibrant: generateVibrant(hex),
    muted: generateMuted(hex),
    dark: generateDark(hex),
    light: generateLight(hex),
    warm: generateWarm(hex),
    cool: generateCool(hex),
  };
}

// ✅ Get color name from hex (if possible)
export function getColorNameFromHex(hex: string): string {
  const color = chroma(hex);
  const h = Math.round(color.get('hsl.h'));
  const s = Math.round(color.get('hsl.s'));
  const l = Math.round(color.get('hsl.l'));
  
  // Determine color name based on hue
  let baseName = '';
  if (h >= 0 && h < 15) baseName = 'Red';
  else if (h >= 15 && h < 45) baseName = 'Orange';
  else if (h >= 45 && h < 75) baseName = 'Yellow';
  else if (h >= 75 && h < 150) baseName = 'Green';
  else if (h >= 150 && h < 190) baseName = 'Teal';
  else if (h >= 190 && h < 220) baseName = 'Cyan';
  else if (h >= 220 && h < 260) baseName = 'Blue';
  else if (h >= 260 && h < 290) baseName = 'Purple';
  else if (h >= 290 && h < 330) baseName = 'Pink';
  else baseName = 'Red';
  
  // Add brightness descriptor
  if (l < 20) return `Dark ${baseName}`;
  if (l > 80) return `Light ${baseName}`;
  if (s < 20) return `Grayish ${baseName}`;
  if (s > 80) return `Vibrant ${baseName}`;
  
  return baseName;
}