// lib/shade-generator.ts
import chroma from 'chroma-js';
import colorNamer from 'color-namer';
import { sanitizeHex, hexToRgbArray, rgbToHex } from '@/lib/color-utils';

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

// LRU Cache for color names
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

/**
 * Get a color name using color-namer library with caching
 */
export function getShadeColorName(hex: string): string | null {
  try {
    // Check cache first
    const cached = nameCache.get(hex);
    if (cached) return cached;

    const cleanHex = hex.replace('#', '');
    
    // Use color-namer to get the color name
    const result = colorNamer(`#${cleanHex}`);
    
    let name = '';
    
    // Try palettes in order of accuracy
    const paletteOrder = ['ntc', 'pantone', 'css', 'html', 'x11', 'basic'];
    
    for (const paletteName of paletteOrder) {
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
    
    if (!name) {
      name = 'Custom Color';
    }
    
    // Clean up the name
    let finalName = name
      .replace(/#[0-9a-f]{6}/gi, '')
      .replace(/\([^)]*\)/g, '')
      .trim();
    
    // Capitalize first letter of each word
    finalName = finalName.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    // Cache the result
    nameCache.set(hex, finalName);
    
    return finalName;
  } catch (error) {
    return null;
  }
}

/**
 * Generate unique color names for shades based on their properties
 */
export function generateShadeName(hex: string, type: string, index: number, total: number): string {
  const colorName = getShadeColorName(hex);
  
  if (colorName) {
    // Add descriptive suffix based on shade type
    let suffix = '';
    const percent = Math.round((index / total) * 100);
    
    switch (type) {
      case 'tint':
        if (percent < 20) suffix = 'Light';
        else if (percent < 40) suffix = 'Lighter';
        else if (percent < 60) suffix = 'Very Light';
        else if (percent < 80) suffix = 'Ultra Light';
        else suffix = 'Pure White';
        break;
      case 'shade':
        if (percent < 20) suffix = 'Dark';
        else if (percent < 40) suffix = 'Darker';
        else if (percent < 60) suffix = 'Very Dark';
        else if (percent < 80) suffix = 'Ultra Dark';
        else suffix = 'Pure Black';
        break;
      case 'tone':
        if (percent < 25) suffix = 'Muted';
        else if (percent < 50) suffix = 'More Muted';
        else if (percent < 75) suffix = 'Very Muted';
        else suffix = 'Almost Gray';
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
  
  // Fallback to type-based naming
  const typeNames: Record<string, string> = {
    tint: 'Tint',
    shade: 'Shade',
    tone: 'Tone',
    light: 'Light',
    dark: 'Dark',
  };
  
  return `${typeNames[type] || 'Color'} ${index + 1}`;
}

/**
 * Generate comprehensive shade information
 */
function getShadeMetadata(hex: string, type: string, index: number, total: number): Shade {
  const color = chroma(hex);
  const hsl = color.hsl();
  const luminance = color.luminance();
  
  return {
    id: `${type}-${index}`,
    hex: hex.toUpperCase(),
    name: generateShadeName(hex, type, index, total),
    type: type as Shade['type'],
    lightness: hsl[2] || 0,
    saturation: hsl[1] || 0,
    hue: hsl[0] || 0,
    luminance: luminance,
  };
}

export function generateShades(hex: string, count: number = 120): Shade[] {
  const cleanHex = sanitizeHex(hex);
  if (!cleanHex) return [];
  
  const rgb = hexToRgbArray(cleanHex);
  if (!rgb) return [];
  
  const baseColor = chroma(`#${cleanHex}`);
  const shades: Shade[] = [];
  
  // 1. TINTS (adding white) - 30 shades
  const tintCount = 30;
  for (let i = 0; i < tintCount; i++) {
    const mix = i / (tintCount - 1);
    const mixed = chroma.mix(baseColor, '#ffffff', mix, 'lch');
    const mixedHex = mixed.hex();
    shades.push(getShadeMetadata(mixedHex, 'tint', i, tintCount));
  }
  
  // 2. SHADES (adding black) - 30 shades
  const shadeCount = 30;
  for (let i = 0; i < shadeCount; i++) {
    const mix = i / (shadeCount - 1);
    const mixed = chroma.mix(baseColor, '#000000', mix, 'lch');
    const mixedHex = mixed.hex();
    shades.push(getShadeMetadata(mixedHex, 'shade', i, shadeCount));
  }
  
  // 3. TONES (adding gray) - 30 shades
  const toneCount = 30;
  for (let i = 0; i < toneCount; i++) {
    const mix = i / (toneCount - 1);
    const gray = chroma('#808080');
    const mixed = chroma.mix(baseColor, gray, mix, 'lch');
    const mixedHex = mixed.hex();
    shades.push(getShadeMetadata(mixedHex, 'tone', i, toneCount));
  }
  
  // 4. LIGHT variations - 15 shades
  const lightCount = 15;
  for (let i = 0; i < lightCount; i++) {
    const lightFactor = 0.3 + (i / (lightCount - 1)) * 0.7;
    const lightColor = chroma(`#${cleanHex}`).brighten(lightFactor);
    const lightHex = lightColor.hex();
    shades.push(getShadeMetadata(lightHex, 'light', i, lightCount));
  }
  
  // 5. DARK variations - 15 shades
  const darkCount = 15;
  for (let i = 0; i < darkCount; i++) {
    const darkFactor = 0.3 + (i / (darkCount - 1)) * 0.7;
    const darkColor = chroma(`#${cleanHex}`).darken(darkFactor);
    const darkHex = darkColor.hex();
    shades.push(getShadeMetadata(darkHex, 'dark', i, darkCount));
  }
  
  // Remove duplicates (keep first occurrence)
  const uniqueMap = new Map<string, Shade>();
  for (const shade of shades) {
    if (!uniqueMap.has(shade.hex)) {
      uniqueMap.set(shade.hex, shade);
    }
  }
  
  // Convert to array and sort by lightness
  let result = Array.from(uniqueMap.values())
    .sort((a, b) => a.luminance - b.luminance);
  
  // Limit to requested count
  if (result.length > count) {
    // Keep evenly distributed shades
    const step = result.length / count;
    const selected: Shade[] = [];
    for (let i = 0; i < count; i++) {
      const index = Math.floor(i * step);
      if (index < result.length) {
        selected.push(result[index]);
      }
    }
    result = selected;
  }
  
  return result;
}

/**
 * Get unique color names from shades
 */
export function getUniqueColorNames(shades: Shade[]): string[] {
  const names = new Set<string>();
  shades.forEach(shade => {
    if (shade.name) {
      // Extract base name (without suffix)
      const baseName = shade.name.split(' ').slice(0, -1).join(' ') || shade.name;
      names.add(baseName);
    }
  });
  return Array.from(names);
}

/**
 * Get shade statistics with color names
 */
export function getShadeStatistics(shades: Shade[]) {
  const types = shades.reduce((acc, s) => {
    acc[s.type] = (acc[s.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const avgLightness = shades.reduce((sum, s) => sum + s.luminance, 0) / shades.length;
  const avgSaturation = shades.reduce((sum, s) => sum + s.saturation, 0) / shades.length;
  
  // Get unique color names
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

// Pre-cache common colors for faster loading
export function preCacheShadeNames() {
  const commonColors = [
    'ff0000', '00ff00', '0000ff', 'ffff00', 'ff00ff', '00ffff',
    '000000', 'ffffff', '808080', 'ffa500', 'ffc0cb', '8b5cf6',
    'ef4444', '3b82f6', '22c55e', 'eab308', 'ec4899', 'f97316',
  ];
  
  for (const hex of commonColors) {
    const shades = generateShades(hex, 10);
    shades.forEach(shade => {
      if (shade.hex) {
        getShadeColorName(shade.hex);
      }
    });
  }
}

// Auto pre-cache on import (server-side only)
if (typeof window === 'undefined') {
  preCacheShadeNames();
}