// app/color/palettes/[hex]/PaletteClient.tsx
'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Copy, Sparkles, Grid3x3, LayoutList, Palette, X } from 'lucide-react';
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
  const [currentColor, setCurrentColor] = useState<string>(fullHex);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [tempColor, setTempColor] = useState<string>(fullHex);
  const [currentColorName, setCurrentColorName] = useState<string>(colorName);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const generatePalettesForColor = useCallback((colorHex: string) => {
    try {
      const normalized = normalizeHex(colorHex);
      const palettes = generateAllPalettes(normalized);
      const paletteMap: Record<string, string[]> = palettes as any;
      
      return initialPaletteTypes.map(type => ({
        ...type,
        colors: paletteMap[type.id] || [colorHex],
      }));
    } catch (error) {
      console.error('Error generating palettes:', error);
      return initialPaletteTypes;
    }
  }, [initialPaletteTypes]);

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
      
      const cleanHex = normalized.replace('#', '');
      window.history.pushState({}, '', `/color/palettes/${cleanHex.toLowerCase()}`);
      
      setIsGenerating(false);
      setIsColorPickerOpen(false);
      setCopyMessage('Palette updated successfully!');
      setTimeout(() => setCopyMessage(null), 3000);
    } catch (error) {
      console.error('Error applying color change:', error);
      setIsGenerating(false);
      setCopyMessage('Failed to update palette. Please try again.');
      setTimeout(() => setCopyMessage(null), 3000);
    }
  }, [tempColor, generatePalettesForColor]);
  
  const handleCopy = useCallback(async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setCopyMessage(`${color} copied to clipboard!`);
      setTimeout(() => {
        setCopiedColor(null);
        setCopyMessage(null);
      }, 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = color;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedColor(color);
      setCopyMessage(`${color} copied to clipboard!`);
      setTimeout(() => {
        setCopiedColor(null);
        setCopyMessage(null);
      }, 2000);
    }
  }, []);

  const handleCopyAll = useCallback((colors: string[], label: string) => {
    const allColors = colors.join(', ');
    navigator.clipboard.writeText(allColors);
    setCopiedAll(label);
    setCopyMessage(`${label} colors copied to clipboard!`);
    setTimeout(() => {
      setCopiedAll(null);
      setCopyMessage(null);
    }, 2000);
  }, []);

  const getTextColor = useCallback((hex: string) => {
    try {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      if (isNaN(r) || isNaN(g) || isNaN(b)) return '#17191D';
      return (r * 0.299 + g * 0.587 + b * 0.114) > 170 ? '#17191D' : '#FFFFFF';
    } catch {
      return '#17191D';
    }
  }, []);

  // Keyboard shortcut: Escape to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isColorPickerOpen) {
        setTempColor(currentColor);
        setIsColorPickerOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isColorPickerOpen, currentColor]);

  return (
    <div className={`max-w-6xl mx-auto p-3 sm:p-4 md:p-6 min-h-screen ${
      isDark ? 'bg-[#090911]' : 'bg-gray-50'
    }`}>
      {/* Status Message */}
      {copyMessage && (
        <div 
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-black/80 text-white text-sm font-medium shadow-xl animate-in fade-in slide-in-from-top-4"
          role="status"
          aria-live="polite"
        >
          {copyMessage}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <div className="grid grid-cols-[auto_1fr] gap-4 sm:gap-6 items-start">
          <div 
            className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl border-2 shadow-xl cursor-pointer transition-all hover:scale-105 hover:shadow-2xl ${
              isDark ? 'border-white/20' : 'border-gray-200'
            }`}
            style={{ backgroundColor: currentColor }}
            onClick={() => setIsColorPickerOpen(true)}
            title="Click to change color"
            role="button"
            tabIndex={0}
            aria-label="Change base color"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsColorPickerOpen(true);
              }
            }}
          />
          
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold truncate ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                {currentColorName} Palettes
              </h1>
              
              <div className={`flex p-1 rounded-lg border ml-auto ${
                isDark ? 'bg-[#1a1a2e] border-[#2d2d4a]' : 'bg-gray-100 border-gray-200'
              }`} role="group" aria-label="View mode toggle">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    viewMode === 'grid'
                      ? 'bg-purple-600 text-white shadow-md'
                      : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-pressed={viewMode === 'grid'}
                >
                  <Grid3x3 className="w-3.5 h-3.5 inline mr-1.5" />
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('strip')}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    viewMode === 'strip'
                      ? 'bg-purple-600 text-white shadow-md'
                      : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-pressed={viewMode === 'strip'}
                >
                  <LayoutList className="w-3.5 h-3.5 inline mr-1.5" />
                  Strip
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-sm font-mono ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>{currentColor}</span>
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>|</span>
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {viewMode === 'grid' ? 'Color swatches' : 'Gradient preview'}
              </span>
              <button
                onClick={() => setIsColorPickerOpen(true)}
                className={`ml-2 flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  isDark
                    ? 'bg-[#1a1a2e] text-gray-300 hover:bg-[#2d2d4a] hover:text-white border border-[#2d2d4a]'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                Change Color
              </button>
            </div>
            <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Explore all color harmonies and palettes for {currentColor}
            </p>
          </div>
        </div>

        {/* Color Picker Modal */}
        {isColorPickerOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="color-picker-title"
          >
            <div className={`rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto ${
              isDark ? 'bg-[#1a1a2e] border border-[#2d2d4a]' : 'bg-white border border-gray-200'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 id="color-picker-title" className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
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
                  aria-label="Close color picker"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-[auto_1fr] gap-4 mb-4">
                <input
                  type="color"
                  value={tempColor}
                  onChange={(e) => setTempColor(e.target.value)}
                  className="w-20 h-20 rounded-xl cursor-pointer border-2 border-purple-500"
                  aria-label="Choose color"
                />
                <div className="flex flex-col gap-2">
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
                    aria-label="Enter hex color"
                  />
                  <div className="grid grid-cols-6 gap-2">
                    {['#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#F5FF33', '#33FFF5'].map((preset) => (
                      <button
                        key={preset}
                        className="w-full aspect-square rounded-full border-2 border-white/20 hover:scale-110 transition-transform"
                        style={{ backgroundColor: preset }}
                        onClick={() => setTempColor(preset)}
                        aria-label={`Preset color ${preset}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setTempColor(currentColor);
                    setIsColorPickerOpen(false);
                  }}
                  className={`py-2 rounded-xl font-medium transition-all ${
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
                  className="py-2 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Updating...' : 'Apply Color'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Loading State */}
      {isGenerating && (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="grid grid-cols-5 gap-0 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-56 bg-gray-200 dark:bg-gray-700"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Palette Types */}
      {!isGenerating && (
        <div className="grid grid-cols-1 gap-6">
          {paletteTypes.map((type) => {
            const isBaseColor = type.colors.some(c => c.toLowerCase() === currentColor.toLowerCase());
            const colorCount = type.colors.length;
            
            return (
              <div 
                key={type.id}
                className={`rounded-xl p-4 transition-all ${
                  isDark
                    ? 'bg-[#1a1a2e] border border-[#2d2d4a] hover:border-[#8b5cf6]/50'
                    : 'bg-white border border-gray-200 hover:border-[#7c3aed]/50'
                } ${isBaseColor ? 'border-purple-500/50 ring-1 ring-purple-500/30' : ''}`}
              >
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <h3 className={`text-base font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {type.label}
                  </h3>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    ({colorCount} colors)
                  </span>
                  {isBaseColor && (
                    <span className="text-[10px] font-bold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full">
                      Contains Base
                    </span>
                  )}
                </div>
                
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-0 overflow-hidden rounded-xl border border-[#d8cfbf] dark:border-gray-700">
                    {type.colors.map((color: string, i: number) => {
                      const isCopied = copiedColor === color;
                      const isBase = color.toLowerCase() === currentColor.toLowerCase();
                      const textColor = getTextColor(color);
                      const num = String(i + 1).padStart(2, '0');
                      
                      return (
                        <div
                          key={i}
                          className="group relative flex flex-col justify-between p-4 sm:p-5 min-h-[200px] sm:min-h-[240px] cursor-pointer border-r border-b border-[#d8cfbf] dark:border-gray-700 last:border-r-0 transition-all hover:transform hover:-translate-y-1 hover:shadow-lg hover:z-10"
                          style={{ backgroundColor: color, color: textColor }}
                          onClick={() => handleCopy(color)}
                          role="button"
                          tabIndex={0}
                          aria-label={`Copy color ${i + 1}: ${color}`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleCopy(color);
                            }
                          }}
                        >
                          {/* Number - 01, 02, 03, etc. */}
                          <span className="text-xs font-bold tracking-[0.18em] opacity-80">
                            {num}
                          </span>
                          
                          <div>
                            {/* Hex code */}
                            <p className="font-mono text-base sm:text-lg font-bold tracking-tight">
                              {color}
                            </p>
                            
                            {/* Copy button */}
                            <button
                              className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-all hover:bg-white/20 ${
                                isCopied ? 'bg-white/30' : 'bg-white/10 hover:bg-white/20'
                              }`}
                              style={{ 
                                color: textColor,
                                border: `1px solid ${textColor}40`
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(color);
                              }}
                              aria-label={`Copy ${color}`}
                            >
                              <Copy className="h-3.5 w-3.5" />
                              <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                            </button>
                            
                            {/* BASE badge */}
                            {isBase && (
                              <span className="absolute top-2 right-2 text-[8px] font-bold bg-black/30 px-1.5 py-0.5 rounded">
                                BASE
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {viewMode === 'strip' && (
                  <div className="space-y-3">
                    <button
                      onClick={() => handleCopyAll(type.colors, type.label)}
                      className="w-full group relative"
                      aria-label={`Copy all ${type.label} colors`}
                    >
                      <div 
                        className={`w-full h-12 sm:h-14 rounded-lg overflow-hidden transition-all group-hover:scale-[1.002] group-hover:shadow-lg ${
                          isDark ? 'shadow-black/30' : 'shadow-gray-200/50'
                        }`}
                        style={{
                          background: `linear-gradient(to right, ${type.colors.join(', ')})`,
                        }}
                      >
                        <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                          <span className="text-white text-xs font-bold px-3 py-1.5 rounded-lg bg-black/50 shadow-lg">
                            {copiedAll === type.label ? '✓ Copied All!' : 'Copy All'}
                          </span>
                        </div>
                      </div>
                      {copiedAll === type.label && (
                        <span className="absolute -top-1 -right-1 text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                          ✓ All Copied
                        </span>
                      )}
                    </button>
                    
                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 px-1">
                      {type.colors.map((color: string, i: number) => {
                        const isCopied = copiedColor === color;
                        const isBase = color.toLowerCase() === currentColor.toLowerCase();
                        return (
                          <button
                            key={i}
                            onClick={() => handleCopy(color)}
                            className={`text-xs font-mono font-medium transition hover:scale-105 text-center ${
                              isDark
                                ? 'text-gray-300 hover:text-white'
                                : 'text-gray-600 hover:text-gray-900'
                            } ${isCopied ? 'text-emerald-500 font-bold' : ''} ${isBase ? 'font-bold text-purple-500' : ''}`}
                            aria-label={`Copy ${color}`}
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
      )}
    </div>
  );
}