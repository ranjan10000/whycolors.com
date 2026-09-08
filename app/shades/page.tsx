'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getColors } from '@/lib/color-cache';
import { getColorName, sanitizeHex, isValidHex } from '@/lib/color-utils'; // Import these
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { Search, Palette, Loader2, X } from 'lucide-react';

// Fallback colors (hardcoded - removed duplicates)
const FALLBACK_COLORS = [
  'ff0000', '00ff00', '0000ff', 'ffff00', 'ff00ff', '00ffff',
  '000000', 'ffffff', '808080', 'ffa500', 'ffc0cb', '8b5cf6',
  'ef4444', '3b82f6', '22c55e', 'eab308', 'ec4899', 'f97316',
  '06b6d4', '6366f1', '14b8a6', 'f43f5e', 'f59e0b', '84cc16',
  '10b981', '0ea5e9', 'd946ef', 'fb7185', '1e293b', '4b5563',
  'a78bfa', 'c084fc', 'fca5a5', 'fcd34d', '6ee7b7', '93c5fd',
  'c4b5fd', 'fda4af', 'fde68a', 'a7f3d0', 'bfdbfe', 'fecdd3',
  'fef3c7', '6b7280', '374151', '111827', '030712',
];

// Constants
const SEARCH_ERROR_TIMEOUT = 3000;

export default function ShadesIndexPage() {
  const { isDark } = useTheme();
  const [colors, setColors] = useState<Array<{ hex: string; name: string }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchError, setSearchError] = useState('');

  // Load colors on mount
  useEffect(() => {
    let colorList: string[] = [];
    
    try {
      // Try to get colors from cache
      const cached = getColors();
      if (cached && cached.length > 0) {
        colorList = cached;
        console.log(`✅ Loaded ${colorList.length} colors from cache`);
      } else {
        throw new Error('No colors in cache');
      }
    } catch (error) {
      console.warn('⚠️ Using fallback colors:', error);
      colorList = FALLBACK_COLORS;
    }
    
    // Remove duplicates using Set
    const uniqueColors = [...new Set(colorList)];
    console.log(`📊 Unique colors: ${uniqueColors.length} (removed ${colorList.length - uniqueColors.length} duplicates)`);
    
    // Map to color objects with names
    const sorted = uniqueColors
      .map(hex => {
        try {
          return {
            hex,
            name: getColorName(hex),
          };
        } catch (e) {
          return {
            hex,
            name: hex.toUpperCase(),
          };
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    
    setColors(sorted);
    setLoading(false);
  }, []);

  // Handle color search navigation (like in ColorClient)
  const handleColorSearch = useCallback((hex: string) => {
    const sanitized = sanitizeHex(hex);
    if (sanitized && isValidHex(sanitized)) {
      window.location.href = `/shades/${sanitized}`;
    } else {
      setSearchError('Please enter a valid hex color (e.g., ff0000 or f00)');
      setTimeout(() => {
        setSearchError('');
      }, SEARCH_ERROR_TIMEOUT);
    }
  }, []);

  // Clear search error
  const clearSearchError = useCallback(() => {
    setSearchError('');
  }, []);

  // Filter colors based on search (only for text search, not hex)
  const filteredColors = useMemo(() => {
    if (!searchTerm.trim()) return colors;
    
    const term = searchTerm.toLowerCase();
    return colors.filter(
      c => 
        c.hex.toLowerCase().includes(term) || 
        c.name.toLowerCase().includes(term)
    );
  }, [colors, searchTerm]);

  // Check if search term is a hex code
  const isHexSearch = useMemo(() => {
    const clean = searchTerm.replace(/^#/, '').trim();
    return /^[0-9a-f]{3,6}$/i.test(clean);
  }, [searchTerm]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? 'bg-[#090911]' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#7c3aed] animate-spin mx-auto" />
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading colors...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 sm:p-6 md:p-8 ${
      isDark ? 'bg-[#090911] text-gray-100' : 'bg-gray-50 text-gray-800'
    }`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Palette className="w-8 h-8 text-[#7c3aed]" />
            <h1 className="text-3xl sm:text-4xl font-bold">
              All Color Shades
            </h1>
          </div>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Browse colors with their shades, tints, and variations
          </p>
          {colors.length === 0 && (
            <p className="mt-2 text-sm text-yellow-500">
              ⚠️ No colors loaded. Using fallback colors.
            </p>
          )}
        </header>

        {/* Search - Like ColorClient's HexSearch */}
        <div className="mb-6">
          <div className={`relative p-2 border rounded-2xl backdrop-blur-xl ${
            isDark 
              ? 'bg-[#12131a] border-white/10 shadow-2xl' 
              : 'bg-white border-gray-200 shadow-lg'
          }`}>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const cleanTerm = searchTerm.replace(/^#/, '').trim();
                if (cleanTerm) {
                  handleColorSearch(cleanTerm);
                }
              }}
              className="flex flex-col sm:flex-row gap-2"
            >
              <div className="flex-1 relative flex items-center">
                <span className={`absolute left-4 font-mono font-bold text-base ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>#</span>
                <input
                  type="text"
                  placeholder="Search color by name or enter hex (e.g. ff0000)"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    clearSearchError();
                  }}
                  className={`w-full border rounded-xl pl-9 pr-10 py-3 font-mono transition text-sm sm:text-base ${
                    isDark 
                      ? 'bg-[#090a0f] border-white/10 text-white placeholder-gray-500' 
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                  } focus:border-violet-500 focus:ring-1 focus:ring-violet-500`}
                  aria-label="Search colors or enter HEX code"
                  aria-invalid={!!searchError}
                  aria-describedby={searchError ? "search-error" : undefined}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      clearSearchError();
                    }}
                    className={`absolute right-3 p-1 rounded-full transition ${
                      isDark 
                        ? 'hover:bg-white/10 text-gray-500 hover:text-white' 
                        : 'hover:bg-gray-200 text-gray-400 hover:text-gray-700'
                    }`}
                    aria-label="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                {searchError && (
                  <p id="search-error" className={`absolute -bottom-6 left-2 text-xs font-medium text-red-400`}>
                    {searchError}
                  </p>
                )}
              </div>
              <button
                type="submit"
                className={`px-8 py-3 font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                  isDark 
                    ? 'bg-violet-600 hover:bg-violet-500 active:scale-95 text-white shadow-lg shadow-violet-600/20' 
                    : 'bg-violet-600 hover:bg-violet-500 active:scale-95 text-white shadow-lg shadow-violet-600/30'
                }`}
                disabled={!searchTerm}
              >
                <Search className="w-4 h-4" />
                <span>Explore</span>
              </button>
            </form>
            
            {/* Quick example buttons */}
            <div className={`px-3 pt-2 text-[11px] flex items-center gap-2 flex-wrap ${
              isDark ? 'text-gray-500' : 'text-gray-500'
            }`}>
              <span>Try:</span>
              {['FF0000', '00FF00', '0000FF'].map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => {
                    setSearchTerm(example);
                    handleColorSearch(example);
                  }}
                  className={`font-mono transition ${
                    isDark 
                      ? 'text-gray-400 hover:text-violet-400 hover:underline' 
                      : 'text-gray-500 hover:text-violet-600 hover:underline'
                  }`}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
          
          {/* Search hint for text filtering */}
          <p className={`text-xs mt-2 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            💡 Type a color name to filter the list, or enter a hex code to go directly to that color's shades
          </p>
        </div>

        {/* Results count */}
        <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {searchTerm && !isHexSearch ? (
            <>Showing {filteredColors.length} of {colors.length} colors (filtered by "{searchTerm}")</>
          ) : searchTerm && isHexSearch ? (
            <>Searching for hex #{searchTerm.replace(/^#/, '').toUpperCase()}...</>
          ) : (
            <>Showing all {colors.length} colors</>
          )}
        </p>

        {/* Color Grid */}
        {filteredColors.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredColors.map(({ hex, name }) => (
              <Link
                key={`${hex}-${name}`}
                href={`/shades/${hex}`}
                className={`group block rounded-xl border overflow-hidden hover:shadow-xl transition-all hover:scale-105 ${
                  isDark 
                    ? 'bg-[#131322] border-white/10 hover:border-white/30' 
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div 
                  className="w-full aspect-square"
                  style={{ backgroundColor: `#${hex}` }}
                />
                <div className="p-2.5 text-center">
                  <p className="font-mono text-xs font-medium truncate">
                    #{hex.toUpperCase()}
                  </p>
                  <p className={`text-[10px] truncate ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={`text-center py-20 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No colors found</p>
            <p className="text-sm">Try a different search term</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 bg-[#7c3aed] text-white rounded-lg hover:bg-[#6d28d9] transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className={`mt-8 text-center text-sm ${
          isDark ? 'text-gray-500' : 'text-gray-400'
        }`}>
          <p>{filteredColors.length} colors displayed • {colors.length} total colors</p>
        </footer>
      </div>
    </div>
  );
}