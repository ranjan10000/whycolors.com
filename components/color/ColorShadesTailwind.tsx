// components/color/ColorShadesTailwind.tsx
'use client';

import { useState } from 'react';
import { hexToRgbArray, rgbToHex } from '@/lib/color-utils';
import { useTheme } from '@/contexts/ThemeContext';
import { Check, Copy } from 'lucide-react';

interface ColorShadesProps {
  hex: string;
}

export default function ColorShadesTailwind({ hex }: ColorShadesProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const { isDark } = useTheme();

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

  // Helper to determine text color based on background
  const getTextColor = (hexColor: string) => {
    const rgb = hexToRgbArray(hexColor);
    if (!rgb) return '#ffffff';
    const [r, g, b] = rgb;
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {copiedHex && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 text-xs px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 ${
          isDark 
            ? 'bg-[#1a1a2e]/90 border border-[#8b5cf6]/30 text-purple-300' 
            : 'bg-white/90 border border-purple-200 text-purple-700'
        }`}>
          <Check className="w-3.5 h-3.5 text-purple-500" aria-hidden="true" />
          <span>Copied <strong className="font-mono">{copiedHex.toUpperCase()}</strong></span>
        </div>
      )}

      {/* Tints Section */}
      <div>
        <div className={`flex justify-between items-center mb-3 ${
          isDark ? 'border-white/5' : 'border-gray-100'
        }`}>
          <h4 className={`text-xs font-semibold uppercase tracking-wider ${
            isDark ? 'text-gray-300' : 'text-gray-500'
          }`}>
            Tints (Lighter)
          </h4>
          <span className={`text-[10px] font-medium ${
            isDark ? 'text-gray-400' : 'text-gray-400'
          }`}>
            +White
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {tints.map((item, index) => {
            const textColor = getTextColor(item.hex);
            return (
              <button
                key={`tint-${index}`}
                onClick={() => copyToClipboard(item.hex)}
                className="group flex flex-col items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg"
                aria-label={`Copy tint ${item.hex}`}
              >
                <div
                  className={`w-full aspect-square rounded-lg border shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg ${
                    isDark ? 'border-white/10 hover:border-purple-500/50' : 'border-gray-200 hover:border-purple-300'
                  } relative overflow-hidden`}
                  style={{ backgroundColor: item.hex }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    {copiedHex === item.hex ? (
                      <Check className="w-4 h-4 drop-shadow" style={{ color: textColor }} />
                    ) : (
                      <span 
                        className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded-full shadow-sm backdrop-blur-sm"
                        style={{ 
                          color: textColor,
                          backgroundColor: textColor === '#ffffff' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.8)'
                        }}
                      >
                        +{item.percentage}%
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-[10px] font-mono uppercase transition-colors ${
                  isDark ? 'text-gray-200 group-hover:text-purple-400' : 'text-gray-600 group-hover:text-purple-600'
                }`}>
                  {item.hex}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shades Section */}
      <div>
        <div className={`flex justify-between items-center mb-3 ${
          isDark ? 'border-white/5' : 'border-gray-100'
        }`}>
          <h4 className={`text-xs font-semibold uppercase tracking-wider ${
            isDark ? 'text-gray-300' : 'text-gray-500'
          }`}>
            Shades (Darker)
          </h4>
          <span className={`text-[10px] font-medium ${
            isDark ? 'text-gray-400' : 'text-gray-400'
          }`}>
            +Black
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {shades.map((item, index) => {
            const textColor = getTextColor(item.hex);
            return (
              <button
                key={`shade-${index}`}
                onClick={() => copyToClipboard(item.hex)}
                className="group flex flex-col items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg"
                aria-label={`Copy shade ${item.hex}`}
              >
                <div
                  className={`w-full aspect-square rounded-lg border shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg ${
                    isDark ? 'border-white/10 hover:border-purple-500/50' : 'border-gray-200 hover:border-purple-300'
                  } relative overflow-hidden`}
                  style={{ backgroundColor: item.hex }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    {copiedHex === item.hex ? (
                      <Check className="w-4 h-4 drop-shadow" style={{ color: textColor }} />
                    ) : (
                      <span 
                        className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded-full shadow-sm backdrop-blur-sm"
                        style={{ 
                          color: textColor,
                          backgroundColor: textColor === '#ffffff' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.8)'
                        }}
                      >
                        +{item.percentage}%
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-[10px] font-mono uppercase transition-colors ${
                  isDark ? 'text-gray-200 group-hover:text-purple-400' : 'text-gray-600 group-hover:text-purple-600'
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