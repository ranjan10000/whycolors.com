// app/color/palettes/page.tsx
'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { getAllColorNames, getColorDefinition, getColorNameFromHex, generateAllPalettes } from '@/lib/dynamic-palettes';
import { useTheme } from '@/contexts/ThemeContext';
import { getColorName } from '@/lib/color-utils';
import { Sparkles, Palette, Copy, Check, Loader2 } from 'lucide-react';

// Number of colors to load per batch
const BATCH_SIZE = 48;
const INITIAL_LOAD = 24;

// ============ SKELETON COMPONENT ============
function ColorSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div className={`rounded-xl p-4 text-center animate-pulse ${
      isDark
        ? 'bg-[#1a1a2e] border border-[#2d2d4a]'
        : 'bg-white border border-gray-200'
    }`}>
      <div className="relative">
        <div className={`w-16 h-16 rounded-full mx-auto mb-3 ${
          isDark ? 'bg-[#2d2d4a]' : 'bg-gray-200'
        }`} />
        <div className="flex justify-center gap-1 mt-1 mb-2">
          <div className={`w-4 h-1 rounded-full ${isDark ? 'bg-[#2d2d4a]' : 'bg-gray-200'}`} />
          <div className={`w-4 h-1 rounded-full ${isDark ? 'bg-[#2d2d4a]' : 'bg-gray-200'}`} />
          <div className={`w-4 h-1 rounded-full ${isDark ? 'bg-[#2d2d4a]' : 'bg-gray-200'}`} />
        </div>
      </div>
      <div className={`h-4 rounded ${isDark ? 'bg-[#2d2d4a]' : 'bg-gray-200'} w-20 mx-auto mb-2`} />
      <div className={`h-3 rounded ${isDark ? 'bg-[#2d2d4a]' : 'bg-gray-200'} w-16 mx-auto mb-3`} />
      <div className={`h-6 rounded-full ${isDark ? 'bg-[#2d2d4a]' : 'bg-gray-200'} w-24 mx-auto`} />
    </div>
  );
}

// ============ MAIN COMPONENT ============
export default function PalettesPage() {
  const { isDark } = useTheme();
  const [hexInput, setHexInput] = useState('');
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allColorNames, setAllColorNames] = useState<string[]>([]);
  const [colorDefinitions, setColorDefinitions] = useState<Map<string, any>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  
  // Load color names lazily
  useEffect(() => {
    if (!isInitialized) {
      setIsLoading(true);
      const loadColors = () => {
        try {
          const names = getAllColorNames();
          setAllColorNames(names);
          
          // Pre-cache definitions for visible colors
          const defs = new Map();
          const initialNames = names.slice(0, BATCH_SIZE * 2);
          for (const name of initialNames) {
            const def = getColorDefinition(name);
            if (def) defs.set(name, def);
          }
          setColorDefinitions(defs);
        } catch (error) {
          console.error('Error loading colors:', error);
          // Fallback colors
          const fallback = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown'];
          setAllColorNames(fallback);
        } finally {
          setIsLoading(false);
          setIsInitialized(true);
        }
      };
      
      const timer = setTimeout(loadColors, 100);
      return () => clearTimeout(timer);
    }
  }, [isInitialized]);
  
  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (!isInitialized || allColorNames.length === 0) return;
    
    if (visibleCount >= allColorNames.length) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          loadMoreColors();
        }
      },
      { threshold: 0.1 }
    );
    
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isInitialized, allColorNames, visibleCount, isLoading]);
  
  // Get color definition with caching
  const getColorDefinitionCached = useCallback((name: string) => {
    if (colorDefinitions.has(name)) {
      return colorDefinitions.get(name);
    }
    
    const def = getColorDefinition(name);
    if (def) {
      setColorDefinitions(prev => new Map(prev).set(name, def));
    }
    return def;
  }, [colorDefinitions]);
  
  // Get visible colors with lazy loading
  const displayColors = useMemo(() => {
    return allColorNames.slice(0, visibleCount);
  }, [allColorNames, visibleCount]);
  
  const hasMore = visibleCount < allColorNames.length;
  
  // Load more colors
  const loadMoreColors = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    
    requestAnimationFrame(() => {
      const newCount = Math.min(visibleCount + BATCH_SIZE, allColorNames.length);
      const newNames = allColorNames.slice(visibleCount, newCount);
      
      const newDefs = new Map(colorDefinitions);
      for (const name of newNames) {
        if (!newDefs.has(name)) {
          const def = getColorDefinition(name);
          if (def) newDefs.set(name, def);
        }
      }
      
      setColorDefinitions(newDefs);
      setVisibleCount(newCount);
      setIsLoading(false);
    });
  }, [isLoading, hasMore, visibleCount, allColorNames, colorDefinitions]);
  
  // Load all colors (for "Show All" button)
  const showAllColors = useCallback(() => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    requestAnimationFrame(() => {
      const newDefs = new Map(colorDefinitions);
      for (const name of allColorNames) {
        if (!newDefs.has(name)) {
          const def = getColorDefinition(name);
          if (def) newDefs.set(name, def);
        }
      }
      
      setColorDefinitions(newDefs);
      setVisibleCount(allColorNames.length);
      setIsLoading(false);
    });
  }, [isLoading, allColorNames, colorDefinitions]);
  
  // Save recent colors
  const addRecentColor = useCallback((hex: string) => {
    const cleanHex = hex.replace('#', '').toLowerCase();
    setRecentColors(prev => {
      const filtered = prev.filter(h => h !== cleanHex);
      const newRecent = [cleanHex, ...filtered].slice(0, 8);
      localStorage.setItem('recentColors', JSON.stringify(newRecent));
      return newRecent;
    });
  }, []);
  
  const handleHexSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHex = hexInput.replace('#', '').toLowerCase();
    if (/^[a-f0-9]{6}$/.test(cleanHex)) {
      addRecentColor(cleanHex);
      window.location.href = `/color/palettes/${cleanHex}`;
    }
  };
  
  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };
  
  // Get palette preview
  const getPalettePreview = useCallback((hex: string) => {
    try {
      const palettes = generateAllPalettes(hex);
      return palettes.complementary.slice(0, 3);
    } catch {
      return [hex, hex, hex];
    }
  }, []);
  
  // Check if color is light
  const isLightColor = useCallback((hex: string): boolean => {
    try {
      const clean = hex.replace('#', '');
      const r = parseInt(clean.substring(0, 2), 16);
      const g = parseInt(clean.substring(2, 4), 16);
      const b = parseInt(clean.substring(4, 6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5;
    } catch {
      return true;
    }
  }, []);
  
  // ============ RENDER SKELETON LOADERS ============
  const renderSkeletons = (count: number = INITIAL_LOAD) => {
    return Array.from({ length: count }).map((_, index) => (
      <ColorSkeleton key={`skeleton-${index}`} isDark={isDark} />
    ));
  };
  
  // Loading state - Show skeletons
  if (!isInitialized) {
    return (
      <div className={`max-w-7xl mx-auto p-4 md:p-6 min-h-screen ${
        isDark ? 'bg-[#090911]' : 'bg-gray-50'
      }`}>
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-8 h-8 rounded ${isDark ? 'bg-[#2d2d4a]' : 'bg-gray-200'} animate-pulse`} />
            <div className={`h-9 w-48 rounded ${isDark ? 'bg-[#2d2d4a]' : 'bg-gray-200'} animate-pulse`} />
          </div>
          <div className={`h-5 w-64 rounded ${isDark ? 'bg-[#2d2d4a]' : 'bg-gray-200'} animate-pulse`} />
        </div>
        
        {/* Input Skeleton */}
        <div className={`mb-6 p-4 rounded-xl border ${
          isDark 
            ? 'bg-[#1a1a2e] border-[#2d2d4a]' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex-1 w-full">
              <div className={`h-5 w-48 rounded mb-1.5 ${isDark ? 'bg-[#2d2d4a]' : 'bg-gray-200'} animate-pulse`} />
              <div className="flex gap-2">
                <div className={`flex-1 h-11 rounded-lg ${isDark ? 'bg-[#0f0f1a]' : 'bg-gray-100'} animate-pulse`} />
                <div className={`w-28 h-11 rounded-lg ${isDark ? 'bg-[#2d2d4a]' : 'bg-gray-200'} animate-pulse`} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Grid Skeletons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {renderSkeletons()}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`max-w-7xl mx-auto p-4 md:p-6 min-h-screen ${
      isDark ? 'bg-[#090911]' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Palette className={`w-8 h-8 ${isDark ? 'text-[#8b5cf6]' : 'text-[#7c3aed]'}`} />
          <h1 className={`text-3xl md:text-4xl font-bold ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            Color Palettes
          </h1>
        </div>
      </div>
      
      {/* Hex Input - Generate Only */}
      <div className={`mb-6 p-4 rounded-xl border ${
        isDark 
          ? 'bg-[#1a1a2e] border-[#2d2d4a]' 
          : 'bg-white border-gray-200'
      }`}>
        <form onSubmit={handleHexSubmit} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex-1 w-full">
            <label className={`block text-sm font-medium mb-1.5 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Enter a hex color to generate palettes
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="#ff0000 or ff0000"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                className={`flex-1 rounded-lg px-3 py-2.5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] ${
                  isDark
                    ? 'bg-[#0f0f1a] border border-[#2d2d4a] text-white'
                    : 'bg-gray-50 border border-gray-200 text-gray-800'
                }`}
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg font-medium transition whitespace-nowrap flex items-center gap-2"
              >
                <Sparkles size={16} />
                Generate
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Recent Colors */}
      {recentColors.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              🕐 Recent Colors
            </h2>
            <button
              onClick={() => {
                localStorage.removeItem('recentColors');
                setRecentColors([]);
              }}
              className={`text-xs ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentColors.map(hex => {
              const fullHex = `#${hex.toUpperCase()}`;
              const name = getColorName(fullHex);
              return (
                <Link
                  key={hex}
                  href={`/color/palettes/${hex}`}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition hover:scale-105 ${
                    isDark
                      ? 'bg-[#1a1a2e] border border-[#2d2d4a] hover:border-[#8b5cf6]'
                      : 'bg-white border border-gray-200 hover:border-[#7c3aed]'
                  }`}
                >
                  <div 
                    className="w-5 h-5 rounded-full border border-white/20"
                    style={{ backgroundColor: fullHex }}
                  />
                  <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {fullHex}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Color Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {displayColors.map((colorName) => {
          const color = getColorDefinitionCached(colorName);
          if (!color) return null;
          
          const hexCode = color.hex.replace('#', '').toLowerCase();
          const isLight = isLightColor(color.hex);
          const palettePreview = getPalettePreview(color.hex);
          const isCopied = copiedHex === color.hex;
          
          return (
            <div
              key={colorName}
              className={`group rounded-xl p-4 transition-all hover:shadow-xl text-center ${
                isDark
                  ? 'bg-[#1a1a2e] border border-[#2d2d4a] hover:border-[#8b5cf6] hover:shadow-[#8b5cf6]/10'
                  : 'bg-white border border-gray-200 hover:border-[#7c3aed] hover:shadow-[#7c3aed]/10'
              }`}
            >
              <div className="relative">
                <Link href={`/color/palettes/${hexCode}`}>
                  <div className="relative">
                    <div 
                      className={`w-16 h-16 rounded-full border-2 transition-all group-hover:scale-110 mx-auto mb-3 ${
                        isDark 
                          ? 'border-white/10 group-hover:border-[#8b5cf6]' 
                          : 'border-gray-200 group-hover:border-[#7c3aed]'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="flex justify-center gap-1 mt-1 mb-2">
                      {palettePreview.map((c, i) => (
                        <div
                          key={i}
                          className="w-4 h-1 rounded-full transition-all group-hover:h-1.5"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </Link>
                
                <button
                  onClick={() => copyToClipboard(color.hex)}
                  className={`absolute top-0 right-0 p-1.5 rounded-full transition ${
                    isDark
                      ? 'bg-[#0f0f1a] hover:bg-[#2d2d4a] text-gray-400 hover:text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
              
              <Link href={`/color/palettes/${hexCode}`}>
                <h3 className={`font-medium text-sm transition line-clamp-1 ${
                  isDark
                    ? 'text-white group-hover:text-[#8b5cf6]'
                    : 'text-gray-800 group-hover:text-[#7c3aed]'
                }`}>
                  {color.name}
                </h3>
                <p className={`text-xs mt-1 font-mono ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {color.hex}
                </p>
              </Link>
              
              <Link
                href={`/color/palettes/${hexCode}`}
                className={`mt-3 inline-block text-xs px-3 py-1 rounded-full transition ${
                  isDark
                    ? 'bg-[#0f0f1a] text-gray-400 hover:bg-[#2d2d4a] hover:text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`}
              >
                View Palettes
              </Link>
            </div>
          );
        })}
        
        {/* Show skeleton loaders while loading more */}
        {isLoading && hasMore && renderSkeletons(12)}
      </div>
      
      {/* Load More / Show All */}
      {allColorNames.length > 0 && (
        <div className="mt-8 flex flex-col items-center gap-3">
          {hasMore ? (
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={loadMoreColors}
                disabled={isLoading}
                className={`px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2 ${
                  isLoading
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                } ${
                  isDark
                    ? 'bg-[#1a1a2e] border border-[#2d2d4a] text-white hover:border-[#8b5cf6]'
                    : 'bg-white border border-gray-200 text-gray-800 hover:border-[#7c3aed]'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More ({Math.min(BATCH_SIZE, allColorNames.length - visibleCount)})
                  </>
                )}
              </button>
              <button
                onClick={showAllColors}
                disabled={isLoading}
                className={`px-6 py-2.5 rounded-lg font-medium transition ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                } ${
                  isDark
                    ? 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white'
                    : 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white'
                }`}
              >
                Show All {allColorNames.length}
              </button>
            </div>
          ) : (
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              ✦ Showing all {allColorNames.length} colors
            </p>
          )}
          
          {/* Intersection Observer target for infinite scroll */}
          {hasMore && !isLoading && (
            <div ref={loadMoreRef} className="h-4 w-full" />
          )}
          
          {!hasMore && (
            <div className={`text-xs mt-2 px-4 py-2 rounded-lg ${
              isDark ? 'bg-[#1a1a2e] text-gray-400' : 'bg-gray-100 text-gray-600'
            }`}>
              💡 Enter a hex color above to generate custom palettes
            </div>
          )}
        </div>
      )}
      
      {/* Empty State - For when no colors load */}
      {allColorNames.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className={`text-4xl mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
            🎨
          </div>
          <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            No colors available
          </h3>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Please check your color data configuration
          </p>
        </div>
      )}
      
      {/* Footer Stats */}
      <div className={`mt-8 pt-6 border-t text-center text-xs ${
        isDark ? 'border-[#1a1a2e] text-gray-600' : 'border-gray-200 text-gray-400'
      }`}>
        <p>
          {allColorNames.length} colors • 
          {recentColors.length > 0 && ` ${recentColors.length} recent`}
        </p>
        <p className="mt-1">
          Click any color to explore all harmonies • Copy hex by clicking the copy icon
        </p>
      </div>
    </div>
  );
}