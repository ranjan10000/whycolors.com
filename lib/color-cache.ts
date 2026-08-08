// lib/color-cache.ts
let clientColorCache: string[] | null = null;

export function getColorCache(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }
  
  if (clientColorCache !== null) {
    return clientColorCache;
  }
  
  const preloaded = (window as any).__COLORS_CACHE;
  if (Array.isArray(preloaded)) {
    clientColorCache = preloaded;
    return clientColorCache;
  }
  
  return [];
}

export const getColors = getColorCache;

export function setColorCache(colors: string[]) {
  clientColorCache = colors;
  if (typeof window !== 'undefined') {
    (window as any).__COLORS_CACHE = colors;
  }
}

export function clearColorCache() {
  clientColorCache = null;
  if (typeof window !== 'undefined') {
    delete (window as any).__COLORS_CACHE;
  }
}