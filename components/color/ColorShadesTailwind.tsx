// components/color/ColorShadesTailwind.tsx
'use client';

import { useState } from 'react';
import { hexToRgbArray, rgbToHex } from '@/lib/color-utils';
import { useTheme } from '@/contexts/ThemeContext';
import { Check, Copy } from 'lucide-react';

interface ColorShadesProps {
  hex: string;
}

/* ==================== HSL Utilities ==================== */

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;

  const max = Math.max(rN, gN, bN);
  const min = Math.min(rN, gN, bN);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rN) h = ((gN - bN) / d + (gN < bN ? 6 : 0)) / 6;
    else if (max === gN) h = ((bN - rN) / d + 2) / 6;
    else h = ((rN - gN) / d + 4) / 6;
  }

  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  const sN = Math.max(0, Math.min(100, s)) / 100;
  const lN = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * lN - 1)) * sN;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lN - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (v: number) =>
    Math.round((v + m) * 255).toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/* ==================== Component ==================== */

export default function ColorShadesTailwind({ hex }: ColorShadesProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const { isDark } = useTheme();

  const cleanHex = hex.startsWith('#') ? hex : `#${hex}`;
  const rgb = hexToRgbArray(cleanHex);

  if (!rgb) return null;

  const [r, g, b] = rgb;
  const [h, s, l] = rgbToHsl(r, g, b);

  const copyToClipboard = (colorHex: string) => {
    navigator.clipboard.writeText(colorHex.toUpperCase());
    setCopiedHex(colorHex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  // -------------------- TINTS (Lighter) --------------------
  // Proportional steps: lighten toward white based on remaining headroom (100 - l)
  // This guarantees every tint is distinct regardless of base lightness.
  const tintFractions = [0.12, 0.25, 0.4, 0.55, 0.72, 0.88];
  const tints = tintFractions.map((fraction, i) => {
    const newL = l + (100 - l) * fraction;
    const newHex = hslToHex(h, s, newL);
    return {
      hex: newHex,
      percentage: Math.round(fraction * 100),
      lightness: newL,
      step: i + 1,
    };
  });

  // -------------------- SHADES (Darker) --------------------
  // Proportional steps: darken toward black based on remaining (l)
  // This guarantees every shade is distinct regardless of base lightness.
  const shadeFractions = [0.15, 0.3, 0.48, 0.65, 0.8, 0.92];
  const shades = shadeFractions.map((fraction, i) => {
    const newL = l * (1 - fraction);
    const newHex = hslToHex(h, s, newL);
    return {
      hex: newHex,
      percentage: Math.round(fraction * 100),
      lightness: newL,
      step: i + 1,
    };
  });

  const getTextColor = (hexColor: string) => {
    const rgbArr = hexToRgbArray(hexColor);
    if (!rgbArr) return '#ffffff';
    const [rr, gg, bb] = rgbArr;
    const luminance = (0.299 * rr + 0.587 * gg + 0.114 * bb) / 255;
    return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {copiedHex && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 text-xs px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 ${
            isDark
              ? 'bg-[#1a1a2e]/90 border border-[#8b5cf6]/30 text-purple-300'
              : 'bg-white/90 border border-purple-200 text-purple-700'
          }`}
        >
          <Check className="w-3.5 h-3.5 text-purple-500" aria-hidden="true" />
          <span>
            Copied <strong className="font-mono">{copiedHex.toUpperCase()}</strong>
          </span>
        </div>
      )}

      {/* ==================== TINTS ==================== */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4
            className={`text-xs font-semibold uppercase tracking-wider ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Tints (Lighter)
          </h4>
          <span
            className={`text-[10px] font-medium ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            + White Mix
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {tints.map((item, index) => {
            const textColor = getTextColor(item.hex);
            const isCopied = copiedHex === item.hex;
            return (
              <button
                key={`tint-${index}`}
                onClick={() => copyToClipboard(item.hex)}
                className="group flex flex-col items-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg"
                aria-label={`Copy tint ${item.hex}`}
              >
                <div
                  className={`w-full aspect-square rounded-lg border shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg ${
                    isDark
                      ? 'border-white/10 hover:border-purple-500/50'
                      : 'border-gray-200 hover:border-purple-300'
                  } relative overflow-hidden`}
                  style={{ backgroundColor: item.hex }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    {isCopied ? (
                      <Check
                        className="w-4 h-4 drop-shadow"
                        style={{ color: textColor }}
                      />
                    ) : (
                      <span
                        className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded-full shadow-sm backdrop-blur-sm"
                        style={{
                          color: textColor,
                          backgroundColor:
                            textColor === '#ffffff'
                              ? 'rgba(0,0,0,0.4)'
                              : 'rgba(255,255,255,0.8)',
                        }}
                      >
                        +{item.percentage}%
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`text-xs font-mono uppercase transition-colors ${
                    isDark
                      ? 'text-gray-200 group-hover:text-purple-400'
                      : 'text-gray-700 group-hover:text-purple-600'
                  }`}
                >
                  {item.hex}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================== SHADES ==================== */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4
            className={`text-xs font-semibold uppercase tracking-wider ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            Shades (Darker)
          </h4>
          <span
            className={`text-[10px] font-medium ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            + Black Mix
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {shades.map((item, index) => {
            const textColor = getTextColor(item.hex);
            const isCopied = copiedHex === item.hex;
            return (
              <button
                key={`shade-${index}`}
                onClick={() => copyToClipboard(item.hex)}
                className="group flex flex-col items-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-lg"
                aria-label={`Copy shade ${item.hex}`}
              >
                <div
                  className={`w-full aspect-square rounded-lg border shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg ${
                    isDark
                      ? 'border-white/10 hover:border-purple-500/50'
                      : 'border-gray-200 hover:border-purple-300'
                  } relative overflow-hidden`}
                  style={{ backgroundColor: item.hex }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    {isCopied ? (
                      <Check
                        className="w-4 h-4 drop-shadow"
                        style={{ color: textColor }}
                      />
                    ) : (
                      <span
                        className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded-full shadow-sm backdrop-blur-sm"
                        style={{
                          color: textColor,
                          backgroundColor:
                            textColor === '#ffffff'
                              ? 'rgba(0,0,0,0.4)'
                              : 'rgba(255,255,255,0.8)',
                        }}
                      >
                        −{item.percentage}%
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`text-xs font-mono uppercase transition-colors ${
                    isDark
                      ? 'text-gray-200 group-hover:text-purple-400'
                      : 'text-gray-700 group-hover:text-purple-600'
                  }`}
                >
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