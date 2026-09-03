'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useColor } from '@/context/ColorContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  hexToRgb, 
  hexToHsl, 
  hexToHsv, 
  hexToCmyk,
  getContrastColor,
  getColorName,
  getColorFamily,   // ✅ Added
  isValidHex,
} from '@/lib/color-utils';
import { Copy, Check, Home, ChevronRight, Sparkles, Sliders, Palette, Layers, RefreshCw, Loader2, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import ColorWheel from './ColorWheel';
import ColorConversions from './ColorConversions';
import ColorShades from './ColorShades';
import ColorHarmonies from './ColorHarmonies';
import SimilarColors from './SimilarColors';
import GradientGenerator from './GradientGenerator';
import ColorShadesTailwind from './ColorShadesTailwind';
import ColorDynamicFAQ from './ColorDynamicFAQ';
import ColorChart from './ColorChart';
import SocialShare from './SocialShare';

interface ColorDetailProps {
  hex: string;
  colorName?: string;
  colorFamily?: string;
  rgb?: string | null;
  hsl?: string | null;
  hsv?: string | null;
  cmyk?: string | null;
  contrast?: string;
}

export default function ColorDetail({ hex: initialHex }: ColorDetailProps) {
  const { currentColor, setColor, recentColors, isLoading, setIsLoading } = useColor();
  const { isDark, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState(`#${initialHex.toUpperCase()}`);
  const [mounted, setMounted] = useState(false);

  const hex = currentColor;
  const fullHex = `#${hex.toUpperCase()}`;

  // ✅ Dynamic - updates when hex changes
  const colorName = useMemo(() => getColorName(hex), [hex]);
  const colorFamily = useMemo(() => getColorFamily(hex) || 'Color', [hex]);
  
  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => hexToHsl(hex), [hex]);
  const hsv = useMemo(() => hexToHsv(hex), [hex]);
  const cmyk = useMemo(() => hexToCmyk(hex), [hex]);
  const contrastColor = useMemo(() => getContrastColor(hex), [hex]);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle color selection from ColorChart
  const handleColorHistorySelect = useCallback((hex: string) => {
    const cleanHex = hex.replace('#', '').toLowerCase();
    setColor(cleanHex);
    setInputValue(`#${cleanHex.toUpperCase()}`);
  }, [setColor]);

  // Handle initial color load
  useEffect(() => {
    if (initialHex && initialHex !== hex) {
      setIsLoading(true);
      
      requestAnimationFrame(() => {
        setColor(initialHex);
        setInputValue(`#${initialHex.toUpperCase()}`);
        
        setTimeout(() => {
          setIsLoading(false);
        }, 100);
      });
    } else {
      setIsLoading(false);
    }
  }, [initialHex]);

  const handleCopy = async (text: string, format: string = 'hex') => {
    if (!text || text === '—') return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setCopiedFormat(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    setInputValue(value);
    
    let cleanHex = value.replace('#', '').replace(/[^a-fA-F0-9]/g, '');
    
    if (cleanHex.length === 6 && isValidHex(cleanHex)) {
      const newHex = cleanHex.toLowerCase();
      setColor(newHex);
    } else if (cleanHex.length === 3 && /^[a-fA-F0-9]{3}$/i.test(cleanHex)) {
      const expanded = cleanHex.split('').map(c => c + c).join('');
      setColor(expanded.toLowerCase());
    }
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value.replace('#', '').toLowerCase();
    if (isValidHex(newHex)) {
      setColor(newHex);
      setInputValue(`#${newHex.toUpperCase()}`);
    }
  };

  const handleColorWheelChange = (newHex: string) => {
    const cleanHex = newHex.replace('#', '').toLowerCase();
    if (isValidHex(cleanHex)) {
      setColor(cleanHex);
      setInputValue(`#${cleanHex.toUpperCase()}`);
    }
  };

  const formatData = [
    { label: 'RGB', value: rgb, format: 'rgb' },
    { label: 'HSL', value: hsl, format: 'hsl' },
    { label: 'HSV', value: hsv, format: 'hsv' },
    { label: 'CMYK', value: cmyk, format: 'cmyk' },
  ];

  // Don't render until mounted
  if (!mounted) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div 
        className={`min-h-screen p-4 sm:p-6 md:p-10 ${
          isDark ? 'bg-[#090911] text-gray-100' : 'bg-white text-gray-800'
        }`}
        role="status"
        aria-live="polite"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-4">
            <div className="relative w-20 h-20 mx-auto">
              <div className={`absolute inset-0 border-4 rounded-full ${
                isDark ? 'border-white/10' : 'border-gray-200'
              }`}></div>
              <div className="absolute inset-0 border-4 border-[#7c3aed] rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className={`font-medium animate-pulse ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading color...
            </p>
            <div className={`flex items-center justify-center gap-2 text-sm ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>#{initialHex.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`min-h-screen p-4 sm:p-6 md:p-10 selection:bg-[#7c3aed]/20 ${
        isDark ? 'bg-[#090911] text-gray-100' : 'bg-gray-50 text-gray-800'
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Breadcrumb Navigation with Social Share */}
        <nav 
          className={`flex items-center justify-between gap-2 text-xs md:text-sm font-medium ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}
          aria-label="Breadcrumb"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <Link 
              href="/" 
              className={`transition-colors flex items-center gap-1.5 p-1 rounded-md ${
                isDark ? 'hover:text-white hover:bg-white/5' : 'hover:text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="Home"
            >
              <Home className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Home</span>
            </Link>
            <ChevronRight className={`w-3.5 h-3.5 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} aria-hidden="true" />
            <Link 
              href="/color" 
              className={`transition-colors p-1 rounded-md ${
                isDark ? 'hover:text-white hover:bg-white/5' : 'hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Color Studio
            </Link>
            <ChevronRight className={`w-3.5 h-3.5 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} aria-hidden="true" />
            <div 
              className={`flex items-center gap-2 px-2.5 py-1 rounded-full ${
                isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-100 border-gray-200 text-gray-700'
              } border`}
              aria-current="page"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: fullHex }} aria-hidden="true" />
              <span className="font-mono">{fullHex}</span>
            </div>
          </div>

          <div className="flex-shrink-0">
            <SocialShare 
              hex={hex} 
              colorName={colorName} 
              isDark={isDark} 
            />
          </div>
        </nav>

        {/* Hero Banner Header */}
        <header 
          className={`relative overflow-hidden backdrop-blur-xl border rounded-2xl p-6 sm:p-8 shadow-lg transition-all duration-300 ${
            isDark 
              ? 'bg-[#131322]/80 border-white/10 shadow-2xl' 
              : 'bg-white/90 border-gray-200 shadow-lg'
          }`}
        >
          <div 
            className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-[100px] opacity-10 pointer-events-none transition-all duration-700"
            style={{ backgroundColor: fullHex }}
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-8 justify-between">
            
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
              <div className="relative group flex-shrink-0">
                <div 
                  className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border shadow-lg cursor-pointer transition-all duration-300 group-hover:scale-105 group-hover:rotate-1 ${
                    isDark ? 'border-white/20 shadow-2xl' : 'border-gray-200 shadow-lg'
                  }`}
                  style={{ 
                    backgroundColor: fullHex,
                    boxShadow: isDark 
                      ? `0 12px 40px -8px ${fullHex}60, inset 0 1px 1px rgba(255,255,255,0.1)`
                      : `0 12px 40px -8px ${fullHex}40, inset 0 1px 1px rgba(255,255,255,0.5)`
                  }}
                  onClick={() => document.getElementById('color-picker')?.click()}
                  role="button"
                  tabIndex={0}
                  aria-label="Click to pick a color"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      document.getElementById('color-picker')?.click();
                    }
                  }}
                />
                <div className={`absolute -bottom-2 right-2 rounded-md px-2 py-0.5 shadow-sm ${
                  isDark ? 'bg-[#0a0a14] border-white/15' : 'bg-white border-gray-200'
                } border`}>
                  <span className={`text-[10px] font-mono tracking-wider ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}>#{hex}</span>
                </div>
                <input
                  id="color-picker"
                  type="color"
                  value={fullHex}
                  onChange={handlePickerChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Choose a color"
                />
              </div>

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
                      className={`text-2xl sm:text-4xl font-extrabold rounded-xl px-4 py-1.5 w-44 sm:w-52 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] font-mono transition-all shadow-inner border ${
                        isDark ? 'border-white/20' : 'border-gray-200'
                      }`}
                      style={{ 
                        color: contrastColor,
                        backgroundColor: fullHex,
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}
                      aria-label="HEX color code input"
                    />
                    <button
                      onClick={() => handleCopy(fullHex, 'hex')}
                      className={`ml-2.5 p-2.5 border rounded-xl transition-all active:scale-95 shadow-md ${
                        isDark 
                          ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white/90' 
                          : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700'
                      }`}
                      aria-label={copied && copiedFormat === 'hex' ? 'Copied!' : 'Copy HEX Code'}
                      title="Copy HEX Code"
                    >
                      {copied && copiedFormat === 'hex' ? (
                        <Check className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                      ) : (
                        <Copy className="w-5 h-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                {/* ✅ H1 with dynamic color name */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {colorName}
                  <span className="ml-3 text-sm sm:text-base font-mono font-normal text-gray-500 dark:text-gray-400">
                    #{hex.toUpperCase()}
                  </span>
                </h1>

                {/* ✅ Dynamic color family badge */}
                <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                  <span className={`px-3.5 py-1 border rounded-full text-xs font-semibold tracking-wide backdrop-blur-md ${
                    isDark 
                      ? 'bg-white/10 border-white/10 text-gray-200' 
                      : 'bg-gray-100 border-gray-200 text-gray-700'
                  }`}>
                    {colorFamily} Family
                  </span>
                </div>
              </div>
            </div>

            {/* Color Format Data */}
            <div 
              className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 w-full lg:w-auto min-w-[280px]"
              role="group"
              aria-label="Color format values"
            >
              {formatData.map((item) => (
                <div 
                  key={item.label}
                  onClick={() => item.value && handleCopy(item.value, item.format)}
                  className={`group border rounded-xl p-3 transition-all ${
                    isDark 
                      ? 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 hover:border-white/30' 
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-[#7c3aed]/30'
                  } ${item.value ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                  role="button"
                  tabIndex={item.value ? 0 : -1}
                  aria-label={item.value ? `Copy ${item.label} value ${item.value}` : `${item.label} not available`}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && item.value) {
                      e.preventDefault();
                      handleCopy(item.value, item.format);
                    }
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${
                      isDark ? 'text-gray-200' : 'text-gray-500'
                    }`}>{item.label}</span>
                    {item.value && (
                      <div className="flex items-center gap-1">
                        {copied && copiedFormat === item.format ? (
                          <Check className="w-3 h-3 text-emerald-400" aria-hidden="true" />
                        ) : (
                          <Copy className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${
                            isDark ? 'text-gray-500' : 'text-gray-400'
                          }`} aria-hidden="true" />
                        )}
                      </div>
                    )}
                  </div>
                  <p className={`font-mono text-xs sm:text-sm font-medium truncate ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                    {item.value || '—'}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </header>

        {/* Recent Color History Swatches */}
        {recentColors.length > 0 && (
          <section 
            className={`border rounded-2xl p-4 sm:p-5 shadow-sm ${
              isDark ? 'bg-[#131322]/60 border-white/10' : 'bg-white/90 border-gray-200'
            }`}
            aria-label="Recent color history"
          >
            <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${
              isDark ? 'text-gray-300' : 'text-gray-500'
            }`}>
              <Layers className="w-3.5 h-3.5 text-[#7c3aed]" aria-hidden="true" />
              Palette History
            </h3>
            <div className="flex gap-2.5 flex-wrap" role="list">
              {recentColors.map((color, index) => (
                <button
                  key={`${color}-${index}`}
                  onClick={() => {
                    setColor(color);
                    setInputValue(`#${color.toUpperCase()}`);
                  }}
                  className={`relative w-10 h-10 rounded-xl border transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] ${
                    color === hex 
                      ? `border-[#7c3aed] ring-2 ring-[#7c3aed] ring-offset-2 shadow-lg scale-105 ${
                          isDark ? 'ring-offset-[#090911]' : 'ring-offset-white'
                        }` 
                      : isDark ? 'border-white/10 hover:border-white/40' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: `#${color}` }}
                  aria-label={`Color ${color.toUpperCase()}`}
                  aria-current={color === hex ? 'true' : 'false'}
                  title={`#${color.toUpperCase()}`}
                  role="listitem"
                />
              ))}
            </div>
          </section>
        )}

        {/* Interactive Color Wheel Section */}
        <section 
          className={`border rounded-2xl p-4 shadow-sm ${
            isDark ? 'bg-[#131322]/80 border-white/10' : 'bg-white/90 border-gray-200'
          }`}
          aria-labelledby="color-wheel-title"
        >
          <div className={`flex items-center justify-between mb-6 pb-4 border-b ${
            isDark ? 'border-white/10' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className={`p-2 border rounded-lg ${
                isDark ? 'bg-[#8b5cf6]/20 border-[#8b5cf6]/30 text-[#a78bfa]' : 'bg-[#7c3aed]/10 border-[#7c3aed]/20 text-[#7c3aed]'
              }`} aria-hidden="true">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 id="color-wheel-title" className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Interactive Color Wheel
                </h2>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Explore hues, lightness, and color harmonies in real-time
                </p>
              </div>
            </div>
            <span className={`hidden sm:inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium ${
              isDark 
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                : 'text-emerald-600 bg-emerald-50 border-emerald-200'
            } border`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" aria-hidden="true" />
              Synchronized
            </span>
          </div>
          <ColorWheel hex={hex} onColorChange={handleColorWheelChange} />
        </section>

        {/* ColorChart Component */}
        <ColorChart 
          currentHex={hex}
          isDark={isDark}
          onColorSelect={handleColorHistorySelect}
        />

        {/* Detailed Modular Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section 
            className={`border rounded-2xl p-4 shadow-sm ${
              isDark ? 'bg-[#131322]/80 border-white/10' : 'bg-white/90 border-gray-200'
            }`}
            aria-labelledby="conversions-title"
          >
            <h2 id="conversions-title" className={`text-lg font-bold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              <Palette className="w-4 h-4 text-[#7c3aed]" aria-hidden="true" />
              Color Conversions
            </h2>
            <ColorConversions hex={hex} />
          </section>

          <section 
            className={`border rounded-2xl p-4 shadow-sm ${
              isDark ? 'bg-[#131322]/80 border-white/10' : 'bg-white/90 border-gray-200'
            }`}
            aria-labelledby="shades-title"
          >
            <h2 id="shades-title" className={`text-lg font-bold mb-4 flex items-center gap-2 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              <Palette className="w-4 h-4 text-[#7c3aed]" aria-hidden="true" />
              Shades & Tints
            </h2>
            <ColorShades hex={hex} />
          </section>
        </div>
        
        <section 
          className={`border rounded-2xl p-4 shadow-sm ${
            isDark ? 'bg-[#131322]/80 border-white/10' : 'bg-white/90 border-gray-200'
          }`}
          aria-labelledby="tailwind-title"
        >
          <h2 id="tailwind-title" className={`text-lg font-bold mb-4 flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            <Palette className="w-4 h-4 text-[#7c3aed]" aria-hidden="true" />
            Tailwind Color Shades
          </h2>
          <ColorShadesTailwind hex={hex} />
        </section>

        <section 
          className={`border rounded-2xl p-4 shadow-sm ${
            isDark ? 'bg-[#131322]/80 border-white/10' : 'bg-white/90 border-gray-200'
          }`}
          aria-labelledby="harmonies-title"
        >
          <h2 id="harmonies-title" className={`text-lg sm:text-xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>Color Harmonies</h2>
          <ColorHarmonies hex={hex} />
        </section>

        <section 
          className={`border rounded-2xl p-4 shadow-sm ${
            isDark ? 'bg-[#131322]/80 border-white/10' : 'bg-white/90 border-gray-200'
          }`}
          aria-labelledby="similar-title"
        >
          <h2 id="similar-title" className={`text-lg sm:text-xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>Similar Colors</h2>
          <SimilarColors hex={hex} />
        </section>

        <section 
          className={`border rounded-2xl p-4 shadow-sm ${
            isDark ? 'bg-[#131322]/80 border-white/10' : 'bg-white/90 border-gray-200'
          }`}
          aria-labelledby="gradient-title"
        >
          <h2 id="gradient-title" className={`text-lg sm:text-xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>Gradient Generator</h2>
          <GradientGenerator hex={hex} />
        </section>

        <ColorDynamicFAQ 
          hex={hex}
          colorName={colorName}
          isDark={isDark}
        />
      </div>
    </div>
  );
}