'use client';

import { useState } from 'react';
import { hexToRgbArray, rgbToHex } from '@/lib/color-utils';
import { useTheme } from '@/contexts/ThemeContext';

interface ColorShadesProps {
  hex: string;
}

export default function ColorShades({ hex }: ColorShadesProps) {
  const { isDark } = useTheme();
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Normalize hex input
  const cleanHex = hex.startsWith('#') ? hex : `#${hex}`;
  const rgb = hexToRgbArray(cleanHex);

  if (!rgb) return null;

  const [r, g, b] = rgb;

  const copyToClipboard = (colorHex: string) => {
    navigator.clipboard.writeText(colorHex.toUpperCase());
    setCopiedHex(colorHex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  // Generate Shades (Mix with Black)
  const shades = Array.from({ length: 6 }, (_, i) => {
    const factor = (i + 1) * 0.14;
    const newR = Math.max(0, Math.round(r * (1 - factor)));
    const newG = Math.max(0, Math.round(g * (1 - factor)));
    const newB = Math.max(0, Math.round(b * (1 - factor)));
    return {
      hex: rgbToHex([newR, newG, newB]),
      percentage: Math.round(factor * 100),
    };
  });

  // Generate Tints (Mix with White)
  const tints = Array.from({ length: 6 }, (_, i) => {
    const factor = (i + 1) * 0.14;
    const newR = Math.min(255, Math.round(r + (255 - r) * factor));
    const newG = Math.min(255, Math.round(g + (255 - g) * factor));
    const newB = Math.min(255, Math.round(b + (255 - b) * factor));
    return {
      hex: rgbToHex([newR, newG, newB]),
      percentage: Math.round(factor * 100),
    };
  });

  return (
    <div className={`space-y-8 backdrop-blur-md border rounded-2xl p-6 shadow-xl relative overflow-hidden ${
      isDark 
        ? 'bg-[#131322]/80 border-white/10' 
        : 'bg-white/90 border-gray-200'
    }`}>
      
      {/* Toast Notification */}
      {copiedHex && (
        <div className={`absolute top-4 right-4 z-20 flex items-center gap-2 text-xs px-3 py-1.5 rounded-full backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 ${
          isDark
            ? 'bg-purple-500/10 border border-purple-500/30 text-purple-300'
            : 'bg-purple-50 border border-purple-200 text-purple-700'
        }`}>
          <svg className={`w-3.5 h-3.5 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>Copied <strong className="font-mono">{copiedHex.toUpperCase()}</strong></span>
        </div>
      )}

      {/* Base Color Header */}
      <div className={`flex items-center justify-between pb-4 border-b ${
        isDark ? 'border-white/10' : 'border-gray-200'
      }`}>
        <div>
          <h3 className={`text-base font-semibold tracking-wide ${
            isDark ? 'text-white/90' : 'text-gray-800'
          }`}>Color Variations</h3>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-white' : 'text-gray-500'}`}>
            Click any swatch to copy value
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
          isDark 
            ? 'bg-white/5 border-white/10' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div 
            className="w-4 h-4 rounded-full shadow-inner border border-gray-300 dark:border-white/20" 
            style={{ backgroundColor: cleanHex }}
          />
          <span className={`text-xs font-mono font-medium uppercase ${
            isDark ? 'text-white/80' : 'text-gray-700'
          }`}>{cleanHex}</span>
        </div>
      </div>

      {/* Tints Section (Lighter) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className={`text-xs font-semibold uppercase tracking-wider ${
            isDark ? 'text-gray-200' : 'text-gray-500'
          }`}>Tints (Lighter)</h4>
          <span className={`text-[10px] font-mono ${isDark ? 'text-white' : 'text-gray-400'}`}>
            +White Mix
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {tints.map((item, index) => {
            const isCopied = copiedHex === item.hex;
            return (
              <button
                key={`tint-${index}`}
                onClick={() => copyToClipboard(item.hex)}
                className="group relative flex flex-col items-center focus:outline-none"
              >
                <div 
                  className={`w-full h-16 rounded-xl border shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl relative flex items-center justify-center overflow-hidden ${
                    isDark 
                      ? 'border-white/10 group-hover:border-purple-400' 
                      : 'border-gray-200 group-hover:border-purple-300'
                  }`}
                  style={{ 
                    backgroundColor: item.hex,
                    boxShadow: isDark 
                      ? `0 4px 20px -5px ${item.hex}50`
                      : `0 4px 20px -5px ${item.hex}30`
                  }}
                >
                  <div className={`absolute inset-0 transition-colors ${
                    isDark 
                      ? 'bg-white/0 group-hover:bg-white/10' 
                      : 'bg-black/0 group-hover:bg-black/5'
                  }`} />
                  {isCopied ? (
                    <svg className={`w-5 h-5 drop-shadow-md z-10 animate-in zoom-in-50 ${
                      isDark ? 'text-white' : 'text-gray-700'
                    }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className={`text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded-full shadow-sm ${
                      isDark 
                        ? 'text-white bg-white/20 backdrop-blur-sm' 
                        : 'text-gray-700 bg-white/90 backdrop-blur-sm'
                    }`}>
                      +{item.percentage}%
                    </span>
                  )}
                </div>
                <span className={`text-[11px] font-mono uppercase transition-colors mt-2 ${
                  isDark 
                    ? 'text-white group-hover:text-[#a78bfa]' 
                    : 'text-gray-600 group-hover:text-purple-600'
                }`}>
                  {item.hex}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shades Section (Darker) */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className={`text-xs font-semibold uppercase tracking-wider ${
            isDark ? 'text-gray-200' : 'text-gray-500'
          }`}>Shades (Darker)</h4>
          <span className={`text-[10px] font-mono ${isDark ? 'text-white' : 'text-gray-400'}`}>
            +Black Mix
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {shades.map((item, index) => {
            const isCopied = copiedHex === item.hex;
            return (
              <button
                key={`shade-${index}`}
                onClick={() => copyToClipboard(item.hex)}
                className="group relative flex flex-col items-center focus:outline-none"
              >
                <div 
                  className={`w-full h-16 rounded-xl border shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl relative flex items-center justify-center overflow-hidden ${
                    isDark 
                      ? 'border-white/10 group-hover:border-purple-400' 
                      : 'border-gray-200 group-hover:border-purple-300'
                  }`}
                  style={{ 
                    backgroundColor: item.hex,
                    boxShadow: isDark 
                      ? `0 4px 20px -5px ${item.hex}50`
                      : `0 4px 20px -5px ${item.hex}30`
                  }}
                >
                  <div className={`absolute inset-0 transition-colors ${
                    isDark 
                      ? 'bg-black/0 group-hover:bg-black/30' 
                      : 'bg-white/0 group-hover:bg-white/20'
                  }`} />
                  {isCopied ? (
                    <svg className="w-5 h-5 text-white drop-shadow-md z-10 animate-in zoom-in-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">
                      +{item.percentage}%
                    </span>
                  )}
                </div>
                <span className={`text-[11px] font-mono uppercase transition-colors mt-2 ${
                  isDark 
                    ? 'text-white group-hover:text-[#a78bfa]' 
                    : 'text-gray-600 group-hover:text-purple-600'
                }`}>
                  {item.hex}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}