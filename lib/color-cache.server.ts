// lib/color-cache.server.ts
import fs from 'fs';
import path from 'path';
import { getCachedColors, generateAllColors } from './colors.shared';

const CACHE_FILE = path.join(process.cwd(), 'public', 'colors-cache.json');
let MEMORY_CACHE: string[] | null = null;

const TOTAL_COLORS = 20000;
const COLOR_PAGE_COUNT = 15000;  // Changed from 7500 to 15000
const PALETTE_PAGE_COUNT = 10000;  // Changed from 7500 to 10000
const SHADE_PAGE_COUNT = 5000;  // Changed from 2500 to 5000
export function getColors(): string[] {
  if (MEMORY_CACHE) {
    return MEMORY_CACHE;
  }

  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf-8');
      const loadedColors = JSON.parse(data);
      if (Array.isArray(loadedColors) && loadedColors.length > 0) {
        MEMORY_CACHE = loadedColors;
        console.log(`✅ Loaded ${MEMORY_CACHE.length} colors from cache`);
        console.log(`✅ Loaded ${MEMORY_CACHE.length} colors in total memory cache`);
        return MEMORY_CACHE;
      }
    }
  } catch (error) {
    console.warn('Could not load color cache:', error);
  }

  console.log(`🔄 Generating ${TOTAL_COLORS} colors...`);
  const generatedColors = getCachedColors(TOTAL_COLORS);
  MEMORY_CACHE = generatedColors;
  
  try {
    // Ensure public directory exists
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(CACHE_FILE, JSON.stringify(MEMORY_CACHE), 'utf-8');
    console.log(`💾 Saved ${MEMORY_CACHE.length} colors to cache`);
  } catch (error) {
    console.warn('Could not save color cache:', error);
  }

  return MEMORY_CACHE;
}

export function getColorPageColors(): string[] {
  const allColors = getColors();
  return allColors.slice(0, COLOR_PAGE_COUNT);  // Now returns first 15,000
}

export function getPalettePageColors(): string[] {
  const allColors = getColors();
  return allColors.slice(PALETTE_PAGE_COUNT, TOTAL_COLORS);  // Returns remaining 5,000
}

export function getShadePageColors(): string[] {
  const allColors = getColors();
  return allColors.slice(SHADE_PAGE_COUNT, TOTAL_COLORS);  // Returns remaining 5,000
}

// Clear cache (useful for development)
export function clearColorCache() {
  MEMORY_CACHE = null;
  try {
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE);
      console.log('🗑️ Cache cleared');
    }
  } catch (error) {
    console.warn('Could not clear cache:', error);
  }
}