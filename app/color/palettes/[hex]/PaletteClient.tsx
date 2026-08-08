// app/color/palettes/[hex]/PaletteClient.tsx
'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface PaletteClientProps {
  hex: string;
  fullHex: string;
  colorName: string;
  paletteTypes: Array<{
    id: string;
    label: string;
    colors: string[];
  }>;
}

type ViewMode = 'grid' | 'strip';

export default function PaletteClient({ 
  hex, 
  fullHex, 
  colorName, 
  paletteTypes 
}: PaletteClientProps) {
  const { isDark } = useTheme();
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const handleCopy = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  const handleCopyAll = (colors: string[], label: string) => {
    const allColors = colors.join(', ');
    navigator.clipboard.writeText(allColors);
    setCopiedAll(label);
    setTimeout(() => setCopiedAll(null), 2000);
  };

  return (
    <div className={`max-w-6xl mx-auto p-3 sm:p-4 md:p-6 min-h-screen ${
      isDark ? 'bg-[#090911]' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4 mb-2">
          <div 
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 shadow-xl flex-shrink-0 ${
              isDark ? 'border-white/20' : 'border-gray-200'
            }`}
            style={{ backgroundColor: fullHex }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold truncate ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                {colorName} Palettes
              </h1>
              
              {/* View Toggle - Responsive */}
              <div className={`flex p-1 rounded-lg border w-fit ${
                isDark ? 'bg-[#1a1a2e] border-[#2d2d4a]' : 'bg-gray-100 border-gray-200'
              }`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs font-medium transition-all ${
                    viewMode === 'grid'
                      ? 'bg-purple-600 text-white shadow-md'
                      : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('strip')}
                  className={`px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-xs font-medium transition-all ${
                    viewMode === 'strip'
                      ? 'bg-purple-600 text-white shadow-md'
                      : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Strip
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
              <span className={`text-xs sm:text-sm font-mono ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>{fullHex}</span>
              <span className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>|</span>
              <span className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {viewMode === 'grid' ? 'Color swatches' : 'Gradient preview'}
              </span>
            </div>
          </div>
        </div>
        <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Explore all color harmonies and palettes for {fullHex}
        </p>
      </div>
      
      {/* All Palette Types */}
      <div className="space-y-4 sm:space-y-6">
        {paletteTypes.map((type) => (
          <div 
            key={type.id}
            className={`rounded-xl p-3 sm:p-4 transition-all ${
              isDark
                ? 'bg-[#1a1a2e] border border-[#2d2d4a] hover:border-[#8b5cf6]/50'
                : 'bg-white border border-gray-200 hover:border-[#7c3aed]/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <h3 className={`text-sm sm:text-base font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {type.label}
              </h3>
              <span className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                ({type.colors.length} colors)
              </span>
            </div>
            
            {/* Grid View - Responsive */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
                {type.colors.map((color: string, i: number) => {
                  const isCopied = copiedColor === color;
                  return (
                    <button
                      key={i}
                      onClick={() => handleCopy(color)}
                      className="group relative"
                    >
                      <div 
                        className={`w-full aspect-square rounded-lg border transition-all group-hover:scale-105 group-hover:shadow-lg ${
                          isDark
                            ? 'border-white/10 group-hover:border-white/30'
                            : 'border-gray-200 group-hover:border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                      <p className={`text-center text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs font-mono mt-1 truncate transition ${
                        isDark
                          ? 'text-gray-300 group-hover:text-white'
                          : 'text-gray-600 group-hover:text-gray-900'
                      }`}>
                        {color}
                      </p>
                      {isCopied && (
                        <span className="absolute -top-1 -right-1 text-[8px] sm:text-[10px] bg-emerald-500 text-white px-1 sm:px-1.5 py-0.5 rounded-full shadow-lg">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Strip View - Responsive */}
            {viewMode === 'strip' && (
              <div className="space-y-2">
                <button
                  onClick={() => handleCopyAll(type.colors, type.label)}
                  className="w-full group relative"
                >
                  <div 
                    className={`w-full h-10 xs:h-12 sm:h-14 rounded-lg overflow-hidden transition-all group-hover:scale-[1.002] group-hover:shadow-lg ${
                      isDark ? 'shadow-black/30' : 'shadow-gray-200/50'
                    }`}
                    style={{
                      background: `linear-gradient(to right, ${type.colors.join(', ')})`,
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                      <span className="text-white text-[10px] xs:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-black/50 shadow-lg">
                        {copiedAll === type.label ? '✓ Copied All!' : 'Copy All'}
                      </span>
                    </div>
                  </div>
                  {copiedAll === type.label && (
                    <span className="absolute -top-1 -right-1 text-[8px] sm:text-[10px] bg-emerald-500 text-white px-1 sm:px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                      ✓ All Copied
                    </span>
                  )}
                </button>
                
                {/* Responsive hex codes in strip view */}
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1 sm:gap-2 px-1">
                  {type.colors.map((color: string, i: number) => {
                    const isCopied = copiedColor === color;
                    return (
                      <button
                        key={i}
                        onClick={() => handleCopy(color)}
                        className={`text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs font-mono font-medium transition hover:scale-105 text-center ${
                          isDark
                            ? 'text-gray-300 hover:text-white'
                            : 'text-gray-600 hover:text-gray-900'
                        } ${isCopied ? 'text-emerald-500 font-bold' : ''}`}
                      >
                        {color}
                        {isCopied && ' ✓'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className={`mt-6 sm:mt-8 p-3 sm:p-4 rounded-xl text-center border ${
        isDark
          ? 'bg-[#1a1a2e]/50 border-[#2d2d4a]/50'
          : 'bg-gray-100/50 border-gray-200/50'
      }`}>
        <p className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          ✦ Click any color to copy • {viewMode === 'grid' ? 'Grid view' : 'Gradient strip view'} • Powered by chroma-js
        </p>
      </div>
    </div>
  );
}