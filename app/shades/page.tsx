'use client';

import { useState, useEffect, useMemo } from 'react';
import { getColors } from '@/lib/color-cache';
import { getColorName } from '@/lib/color-utils';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { Search, Palette, Loader2 } from 'lucide-react';

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

export default function ShadesIndexPage() {
  const { isDark } = useTheme();
  const [colors, setColors] = useState<Array<{ hex: string; name: string }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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

  // Filter colors based on search
  const filteredColors = useMemo(() => {
    if (!searchTerm.trim()) return colors;
    
    const term = searchTerm.toLowerCase();
    return colors.filter(
      c => 
        c.hex.toLowerCase().includes(term) || 
        c.name.toLowerCase().includes(term)
    );
  }, [colors, searchTerm]);

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
            Browse {colors.length} colors with their shades, tints, and variations
          </p>
          {colors.length === 0 && (
            <p className="mt-2 text-sm text-yellow-500">
              ⚠️ No colors loaded. Using fallback colors.
            </p>
          )}
        </header>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <input
            type="text"
            placeholder="Search by name or hex code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full max-w-md pl-10 pr-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-[#7c3aed] outline-none ${
              isDark 
                ? 'bg-[#131322] border-white/10 text-white placeholder:text-gray-500' 
                : 'bg-white border-gray-300 text-gray-800 placeholder:text-gray-400'
            }`}
          />
        </div>

        {/* Results count */}
        <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Showing {filteredColors.length} of {colors.length} colors
          {searchTerm && ` (filtered by "${searchTerm}")`}
        </p>

        {/* Color Grid */}
        {filteredColors.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filteredColors.map(({ hex, name }) => (
              <Link
                key={`${hex}-${name}`} // Use combination to ensure uniqueness
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
          {colors.length === 0 && (
            <p className="mt-2 text-xs text-yellow-500">
              ⚠️ No colors loaded. Please check the console for errors.
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}