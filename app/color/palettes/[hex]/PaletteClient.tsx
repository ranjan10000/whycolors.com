// app/color/palettes/[hex]/PaletteClient.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Copy, Sparkles, RefreshCw, Grid3x3, LayoutList, Check, Palette, X } from 'lucide-react';
import { generateAllPalettes, normalizeHex, getColorNameFromHex } from '@/lib/dynamic-palettes';

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
  paletteTypes: initialPaletteTypes 
}: PaletteClientProps) {
  const { isDark } = useTheme();
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [paletteTypes, setPaletteTypes] = useState(initialPaletteTypes);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState<string>('all');
  const [currentColor, setCurrentColor] = useState<string>(fullHex);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [tempColor, setTempColor] = useState<string>(fullHex);
  const [currentColorName, setCurrentColorName] = useState<string>(colorName);

  // Generate all palettes for a given color using the library
  const generatePalettesForColor = useCallback((colorHex: string) => {
    try {
      const normalized = normalizeHex(colorHex);
      const palettes = generateAllPalettes(normalized);
      const name = getColorNameFromHex(normalized);
      
      // Map the palette object to the format expected by the UI
      const paletteMap: Record<string, string[]> = palettes as any;
      
      // Update palette types with new colors
      return initialPaletteTypes.map(type => ({
        ...type,
        colors: paletteMap[type.id] || [colorHex],
      }));
    } catch (error) {
      console.error('Error generating palettes:', error);
      return initialPaletteTypes;
    }
  }, [initialPaletteTypes]);

  // Apply color change - updates all palettes using the library
  const applyColorChange = useCallback(() => {
    const newColor = tempColor;
    setIsGenerating(true);
    
    try {
      const normalized = normalizeHex(newColor);
      const newPalettes = generatePalettesForColor(normalized);
      const name = getColorNameFromHex(normalized);
      
      setCurrentColor(normalized);
      setCurrentColorName(name);
      setPaletteTypes(newPalettes);
      
      // Update URL without navigation
      const cleanHex = normalized.replace('#', '');
      window.history.pushState({}, '', `/color/palettes/${cleanHex.toLowerCase()}`);
      
      setIsGenerating(false);
      setIsColorPickerOpen(false);
    } catch (error) {
      console.error('Error applying color change:', error);
      setIsGenerating(false);
    }
  }, [tempColor, generatePalettesForColor]);

  // Generate new palette for a specific type
  const generatePalette = useCallback((type: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const allPalettes = generateAllPalettes(currentColor);
        const paletteMap: Record<string, string[]> = allPalettes as any;
        
        const newPalettes = paletteTypes.map(p => {
          if (p.id === type) {
            return { ...p, colors: paletteMap[type] || [currentColor] };
          }
          return p;
        });
        setPaletteTypes(newPalettes);
      } catch (error) {
        console.error('Error generating palette:', error);
      }
      setIsGenerating(false);
    }, 300);
  }, [paletteTypes, currentColor]);
  
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

  // Get palette options
  const paletteOptions = [
    { id: 'all', label: 'All Palettes' },
    ...paletteTypes.map(p => ({ id: p.id, label: p.label })),
  ];

  return (
    <div className={`max-w-6xl mx-auto p-3 sm:p-4 md:p-6 min-h-screen ${
      isDark ? 'bg-[#090911]' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4 mb-2">
          <div 
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 shadow-xl flex-shrink-0 cursor-pointer transition-transform hover:scale-105 ${
              isDark ? 'border-white/20' : 'border-gray-200'
            }`}
            style={{ backgroundColor: currentColor }}
            onClick={() => setIsColorPickerOpen(true)}
            title="Click to change color"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold truncate ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                {currentColorName} Palettes
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
                  <Grid3x3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline mr-1" />
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
                  <LayoutList className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline mr-1" />
                  Strip
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
              <span className={`text-xs sm:text-sm font-mono ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>{currentColor}</span>
              <span className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>|</span>
              <span className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {viewMode === 'grid' ? 'Color swatches' : 'Gradient preview'}
              </span>
              <button
                onClick={() => setIsColorPickerOpen(true)}
                className={`ml-2 flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all ${
                  isDark
                    ? 'bg-[#1a1a2e] text-gray-300 hover:bg-[#2d2d4a] hover:text-white border border-[#2d2d4a]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <Palette className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Change Color
              </button>
            </div>
          </div>
        </div>

        {/* Color Picker Modal */}
        {isColorPickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl ${
              isDark ? 'bg-[#1a1a2e] border border-[#2d2d4a]' : 'bg-white border border-gray-200'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Choose a Color
                </h3>
                <button
                  onClick={() => {
                    setTempColor(currentColor);
                    setIsColorPickerOpen(false);
                  }}
                  className={`p-1 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-[#2d2d4a] text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <input
                  type="color"
                  value={tempColor}
                  onChange={(e) => setTempColor(e.target.value)}
                  className="w-20 h-20 rounded-xl cursor-pointer border-2 border-purple-500"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={tempColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^#?[0-9A-Fa-f]{0,6}$/.test(val.replace('#', ''))) {
                        const formatted = val.startsWith('#') ? val : `#${val}`;
                        setTempColor(formatted);
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-mono border transition-all ${
                      isDark
                        ? 'bg-[#090911] border-[#2d2d4a] text-white focus:border-purple-500'
                        : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-purple-500'
                    }`}
                    placeholder="#RRGGBB"
                  />
                  <div className="flex gap-2 mt-2">
                    {['#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#F5FF33', '#33FFF5'].map((preset) => (
                      <button
                        key={preset}
                        className="w-6 h-6 rounded-full border-2 border-white/20 hover:scale-110 transition-transform"
                        style={{ backgroundColor: preset }}
                        onClick={() => setTempColor(preset)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setTempColor(currentColor);
                    setIsColorPickerOpen(false);
                  }}
                  className={`flex-1 py-2 rounded-xl font-medium transition-all ${
                    isDark
                      ? 'bg-[#2d2d4a] text-gray-300 hover:bg-[#3d3d5a]'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={applyColorChange}
                  disabled={isGenerating}
                  className="flex-1 py-2 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Updating...' : 'Apply Color'}
                </button>
              </div>
            </div>
          </div>
        )}
        <p className={`text-sm sm:text-base mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Explore all color harmonies and palettes for {currentColor}
        </p>
      </div>
      
      {/* All Palette Types */}
      <div className="space-y-4 sm:space-y-6">
        {paletteTypes.map((type) => {
          const isBaseColor = type.colors.some(c => c.toLowerCase() === currentColor.toLowerCase());
          return (
            <div 
              key={type.id}
              className={`rounded-xl p-3 sm:p-4 transition-all ${
                isDark
                  ? 'bg-[#1a1a2e] border border-[#2d2d4a] hover:border-[#8b5cf6]/50'
                  : 'bg-white border border-gray-200 hover:border-[#7c3aed]/50'
              } ${isBaseColor ? 'border-purple-500/50 ring-1 ring-purple-500/30' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm sm:text-base font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {type.label}
                  </h3>
                  <span className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    ({type.colors.length} colors)
                  </span>
                  {isBaseColor && (
                    <span className="text-[8px] sm:text-[10px] font-bold text-purple-500 bg-purple-500/10 px-1.5 py-0.5 rounded-full">
                      Contains Base
                    </span>
                  )}
                </div>
                <button
                  onClick={() => generatePalette(type.id)}
                  disabled={isGenerating}
                  className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-all ${
                    isGenerating
                      ? 'bg-gray-500 cursor-not-allowed text-white'
                      : isDark
                        ? 'bg-[#2d2d4a] hover:bg-[#3d3d5a] text-gray-300 hover:text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {isGenerating ? (
                    <RefreshCw className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  )}
                  <span className="hidden xs:inline">Regenerate</span>
                </button>
              </div>
              
              {/* Grid View - Responsive */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
                  {type.colors.map((color: string, i: number) => {
                    const isCopied = copiedColor === color;
                    const isBase = color.toLowerCase() === currentColor.toLowerCase();
                    return (
                      <button
                        key={i}
                        onClick={() => handleCopy(color)}
                        className="group relative"
                      >
                        <div 
                          className={`w-full aspect-square rounded-lg border transition-all group-hover:scale-105 group-hover:shadow-lg ${
                            isBase ? 'ring-2 ring-purple-500 ring-offset-2 dark:ring-offset-[#1a1a2e]' : ''
                          } ${
                            isDark
                              ? 'border-white/10 group-hover:border-white/30'
                              : 'border-gray-200 group-hover:border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        >
                          {isBase && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[6px] sm:text-[8px] font-bold text-white drop-shadow-lg bg-black/30 px-1 py-0.5 rounded">
                                BASE
                              </span>
                            </div>
                          )}
                        </div>
                        <p className={`text-center text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs font-mono mt-1 truncate transition ${
                          isDark
                            ? 'text-gray-300 group-hover:text-white'
                            : 'text-gray-600 group-hover:text-gray-900'
                        } ${isBase ? 'font-bold text-purple-500' : ''}`}>
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
                      const isBase = color.toLowerCase() === currentColor.toLowerCase();
                      return (
                        <button
                          key={i}
                          onClick={() => handleCopy(color)}
                          className={`text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs font-mono font-medium transition hover:scale-105 text-center ${
                            isDark
                              ? 'text-gray-300 hover:text-white'
                              : 'text-gray-600 hover:text-gray-900'
                          } ${isCopied ? 'text-emerald-500 font-bold' : ''} ${isBase ? 'font-bold text-purple-500' : ''}`}
                        >
                          {color}
                          {isCopied && ' ✓'}
                          {isBase && ' ★'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}