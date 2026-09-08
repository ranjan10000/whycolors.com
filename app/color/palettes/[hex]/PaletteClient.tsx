// app/color/palettes/[hex]/PaletteClient.tsx
'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Copy, Grid3x3, LayoutList, Palette, X, Check } from 'lucide-react';
import { generateAllPalettes, normalizeHex, getColorNameFromHex } from '@/lib/dynamic-palettes';
import SocialShare from '@/components/color/SocialShare';
import { isValidHex } from '@/lib/color-utils';

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

// Constants
const COPY_TIMEOUT = 2000;
const MESSAGE_TIMEOUT = 3000;
const COLOR_PICKER_ID = 'color-picker';
const DEBOUNCE_DELAY = 300; // Auto-update delay

export default function PaletteClient({ 
  hex, 
  fullHex, 
  colorName, 
  paletteTypes: initialPaletteTypes 
}: PaletteClientProps) {
  const { isDark } = useTheme();
  
  // State
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [paletteTypes, setPaletteTypes] = useState(initialPaletteTypes);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentColor, setCurrentColor] = useState<string>(fullHex);
  const [currentColorName, setCurrentColorName] = useState<string>(colorName);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(`#${hex.toUpperCase()}`);

  // Memoized helpers
  const getTextColor = useCallback((hex: string) => {
    try {
      const clean = hex.replace('#', '');
      const r = parseInt(clean.slice(0, 2), 16);
      const g = parseInt(clean.slice(2, 4), 16);
      const b = parseInt(clean.slice(4, 6), 16);
      if (isNaN(r) || isNaN(g) || isNaN(b)) return '#17191D';
      return (r * 0.299 + g * 0.587 + b * 0.114) > 170 ? '#17191D' : '#FFFFFF';
    } catch {
      return '#17191D';
    }
  }, []);

  // Generate palettes for a given color
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

  // 🔥 AUTO UPDATE - Updates palettes when color changes
  const updatePalette = useCallback((newColor: string) => {
    if (!newColor || !isValidHex(newColor.replace('#', ''))) return;
    
    setIsGenerating(true);
    
    try {
      const normalized = normalizeHex(newColor);
      const newPalettes = generatePalettesForColor(normalized);
      const name = getColorNameFromHex(normalized);
      
      setCurrentColor(normalized);
      setCurrentColorName(name);
      setPaletteTypes(newPalettes);
      setInputValue(normalized.toUpperCase());
      
      const cleanHex = normalized.replace('#', '');
      window.history.pushState({}, '', `/color/palettes/${cleanHex.toLowerCase()}`);
      
      setIsGenerating(false);
    } catch (error) {
      console.error('Error updating palette:', error);
      setIsGenerating(false);
    }
  }, [generatePalettesForColor]);

  // 🔥 AUTO COLOR CHANGE - From color picker
  const handlePickerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    const cleanHex = newHex.replace('#', '');
    if (isValidHex(cleanHex)) {
      const formattedHex = `#${cleanHex}`;
      // Auto update immediately
      updatePalette(formattedHex);
    }
  }, [updatePalette]);

  // 🔥 AUTO COLOR CHANGE - From text input with debounce
  useEffect(() => {
    const cleanHex = inputValue.replace('#', '').replace(/[^a-fA-F0-9]/g, '');
    
    if (cleanHex.length === 6 && isValidHex(cleanHex)) {
      const newHex = `#${cleanHex.toLowerCase()}`;
      const timer = setTimeout(() => {
        updatePalette(newHex);
      }, DEBOUNCE_DELAY);
      return () => clearTimeout(timer);
    } else if (cleanHex.length === 3 && /^[a-fA-F0-9]{3}$/i.test(cleanHex)) {
      const expanded = cleanHex.split('').map(c => c + c).join('');
      const newHex = `#${expanded.toLowerCase()}`;
      const timer = setTimeout(() => {
        updatePalette(newHex);
      }, DEBOUNCE_DELAY);
      return () => clearTimeout(timer);
    }
  }, [inputValue, updatePalette]);

  // 🔥 AUTO COLOR CHANGE - Handle text input
  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Only allow valid HEX characters
    const cleanValue = value.replace(/[^#a-fA-F0-9]/g, '');
    setInputValue(cleanValue);
  }, []);

  // 🔥 AUTO COLOR CHANGE - Handle Enter key for instant update
  const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cleanHex = inputValue.replace('#', '').replace(/[^a-fA-F0-9]/g, '');
      if (cleanHex.length === 6 && isValidHex(cleanHex)) {
        updatePalette(`#${cleanHex}`);
      }
    }
  }, [inputValue, updatePalette]);

  // Copy handlers
  const handleCopy = useCallback(async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setCopyMessage(`${color} copied to clipboard!`);
      setTimeout(() => {
        setCopiedColor(null);
        setCopyMessage(null);
      }, COPY_TIMEOUT);
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
      }, COPY_TIMEOUT);
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
    }, COPY_TIMEOUT);
  }, []);

  // Render loading state
  if (isGenerating) {
    return (
      <div className={`max-w-8xl mx-auto p-3 sm:p-4 md:p-6 min-h-screen ${
        isDark ? 'bg-[#090911]' : 'bg-gray-50'
      }`}>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className={`h-8 w-48 rounded mb-4 ${
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`}></div>
              <div className={`grid grid-cols-5 gap-0 rounded-xl overflow-hidden border ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                {[...Array(5)].map((_, j) => (
                  <div key={j} className={`h-56 ${
                    isDark ? 'bg-gray-700' : 'bg-gray-200'
                  }`}></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-8xl mx-auto p-3 sm:p-4 md:p-6 min-h-screen ${
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

      {/* Header Section */}
      <div className="relative mb-8 sm:mb-10">
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
          {/* Color Swatch */}
          <div className="relative group flex-shrink-0">
            <div 
              className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border shadow-lg cursor-pointer transition-all duration-300 group-hover:scale-105 group-hover:rotate-1 ${
                isDark ? 'border-white/20 shadow-2xl' : 'border-gray-200 shadow-lg'
              }`}
              style={{ 
                backgroundColor: currentColor,
                boxShadow: isDark 
                  ? `0 12px 40px -8px ${currentColor}60, inset 0 1px 1px rgba(255,255,255,0.1)`
                  : `0 12px 40px -8px ${currentColor}40, inset 0 1px 1px rgba(255,255,255,0.5)`
              }}
              onClick={() => document.getElementById(COLOR_PICKER_ID)?.click()}
              role="button"
              tabIndex={0}
              aria-label="Click to pick a color"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  document.getElementById(COLOR_PICKER_ID)?.click();
                }
              }}
            />
            <div className={`absolute -bottom-2 right-2 rounded-md px-2 py-0.5 shadow-sm ${
              isDark ? 'bg-[#0a0a14] border-white/15' : 'bg-white border-gray-200'
            } border`}>
              <span className={`text-[10px] font-mono tracking-wider ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>{currentColor}</span>
            </div>
            <input
              id={COLOR_PICKER_ID}
              type="color"
              value={currentColor}
              onChange={handlePickerChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Choose a color"
            />
          </div>

          {/* Color Info */}
          <div className="space-y-3 text-center sm:text-left w-full">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <div className="relative inline-flex items-center">
                <label htmlFor="color-hex-input" className="sr-only">
                  Enter HEX color code
                </label>
                <input
                  id="color-hex-input"
                  type="text"
                  value={inputValue}
                  onChange={handleColorChange}
                  onKeyDown={handleInputKeyDown}
                  className={`text-2xl sm:text-4xl font-extrabold rounded-xl px-4 py-1.5 w-44 sm:w-52 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] font-mono transition-all shadow-inner border ${
                    isDark ? 'border-white/20' : 'border-gray-200'
                  }`}
                  style={{ 
                    color: getTextColor(currentColor),
                    backgroundColor: currentColor,
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                  aria-label="HEX color code input"
                />
                <button
                  onClick={() => handleCopy(currentColor)}
                  className={`ml-2.5 p-2.5 border rounded-xl transition-all active:scale-95 shadow-md ${
                    isDark 
                      ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white/90' 
                      : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700'
                  }`}
                  aria-label={copiedColor === currentColor ? 'Copied!' : 'Copy HEX Code'}
                  title="Copy HEX Code"
                >
                  {copiedColor === currentColor ? (
                    <Check className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                  ) : (
                    <Copy className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              {currentColorName} Color Palettes
              <span className="ml-3 text-sm sm:text-base font-mono font-normal text-gray-500 dark:text-gray-400">
                {currentColor}
              </span>
            </h1>

            <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
              <span className={`px-3.5 py-1 border rounded-full text-xs font-semibold tracking-wide backdrop-blur-md ${
                isDark 
                  ? 'bg-white/10 border-white/10 text-gray-200' 
                  : 'bg-gray-100 border-gray-200 text-gray-700'
              }`}>
                Color Palette
              </span>
              <span className={`px-3.5 py-1 border rounded-full text-xs font-semibold tracking-wide backdrop-blur-md ${
                isDark 
                  ? 'bg-white/10 border-white/10 text-gray-200' 
                  : 'bg-gray-100 border-gray-200 text-gray-700'
              }`}>
                {paletteTypes.length} Palettes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-end mb-6">
        <div className={`inline-flex rounded-xl border p-1 ${
          isDark ? 'border-gray-700 bg-[#1a1a2e]' : 'border-gray-200 bg-white'
        }`}>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-[#7c3aed] text-white'
                : isDark 
                  ? 'text-gray-400 hover:text-white hover:bg-white/10' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="Grid view"
            aria-current={viewMode === 'grid' ? 'true' : 'false'}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('strip')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'strip'
                ? 'bg-[#7c3aed] text-white'
                : isDark 
                  ? 'text-gray-400 hover:text-white hover:bg-white/10' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="Strip view"
            aria-current={viewMode === 'strip' ? 'true' : 'false'}
          >
            <LayoutList className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Palette Types */}
      <div className="grid grid-cols-1 gap-6">
        {paletteTypes.map((type) => {
          const isBaseColor = type.colors.some(c => 
            c.toLowerCase() === currentColor.toLowerCase()
          );
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
                        key={`${type.id}-${i}`}
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
                        <span className="text-xs font-bold tracking-[0.18em] opacity-80">
                          {num}
                        </span>
                        
                        <div>
                          <p className="font-mono text-base sm:text-lg font-bold tracking-tight">
                            {color}
                          </p>
                          
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
                          key={`${type.id}-${i}`}
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
    </div>
  );
}