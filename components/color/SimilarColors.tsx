'use client';

import { useState, useMemo } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface SimilarColorsProps {
  hex: string;
  onColorSelect?: (hex: string) => void;
}

interface ColorVariation {
  color: string;
  label: string;
  isOriginal?: boolean;
}

export default function SimilarColors({ hex, onColorSelect }: SimilarColorsProps) {
  const { isDark } = useTheme();
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Normalize HEX input safely
  const cleanHex = useMemo(() => {
    const raw = hex.replace(/^#/, '');
    return `#${raw.padStart(6, '0').slice(0, 6)}`.toUpperCase();
  }, [hex]);

  // Generate perceptually rich variations using HSL space
  const similarColors = useMemo<ColorVariation[]>(() => {
    const hsl = hexToHsl(cleanHex);
    if (!hsl) return [];

    const [h, s, l] = hsl;

    const variations = [
      { dh: 0, ds: 0, dl: 0, label: 'Original', isOriginal: true },
      { dh: 14, ds: 0, dl: 0, label: 'Warmer' },
      { dh: -14, ds: 0, dl: 0, label: 'Cooler' },
      { dh: 0, ds: 25, dl: 0, label: 'Vibrant' },
      { dh: 0, ds: -25, dl: 0, label: 'Muted' },
      { dh: 0, ds: 0, dl: 14, label: 'Lighter' },
      { dh: 0, ds: 0, dl: -14, label: 'Darker' },
      { dh: 30, ds: 5, dl: 0, label: 'Shift +' },
      { dh: -30, ds: 5, dl: 0, label: 'Shift -' },
      { dh: 0, ds: 15, dl: 10, label: 'Soft Tint' },
    ];

    return variations.map(({ dh, ds, dl, label, isOriginal }) => {
      const newH = (h + dh + 360) % 360;
      const newS = Math.max(0, Math.min(100, s + ds));
      const newL = Math.max(0, Math.min(100, l + dl));

      return {
        color: hslToHex(newH, newS, newL),
        label,
        isOriginal: !!isOriginal,
      };
    });
  }, [cleanHex]);

  const handleCopy = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      if (onColorSelect) onColorSelect(color);
      setTimeout(() => setCopiedColor(null), 1800);
    } catch (err) {
      console.error('Failed to copy color:', err);
    }
  };

  if (similarColors.length === 0) return null;

  return (
    <div className="w-full space-y-4">
      {/* Premium Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sparkles className={`w-4 h-4 animate-pulse ${
            isDark ? 'text-[#a78bfa]' : 'text-[#7c3aed]'
          }`} />
          <h3 className={`text-sm font-semibold tracking-wide ${
            isDark ? 'text-white/90' : 'text-gray-800'
          }`}>
            Similar Palette Variations
          </h3>
        </div>
        <span className={`text-[11px] font-medium tracking-wider uppercase ${
          isDark ? 'text-white/40' : 'text-gray-400'
        }`}>
          Click to Copy
        </span>
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
        {similarColors.map(({ color, label, isOriginal }) => {
          const isCopied = copiedColor === color;

          return (
            <button
              key={`${label}-${color}`}
              type="button"
              onClick={() => handleCopy(color)}
              className={`group relative flex flex-col items-center backdrop-blur-xl p-3 rounded-2xl border transition-all duration-300 text-left cursor-pointer active:scale-95 ${
                isDark
                  ? 'bg-[#131322]/80 border-white/10 hover:border-white/25 hover:shadow-2xl hover:shadow-[#8b5cf6]/10'
                  : 'bg-white/90 border-gray-200 hover:border-[#7c3aed]/40 hover:shadow-xl hover:shadow-[#7c3aed]/10'
              }`}
            >
              {/* Swatch Image Container */}
              <div
                className={`relative w-full aspect-square rounded-xl transition-all duration-300 overflow-hidden group-hover:shadow-lg ${
                  isOriginal
                    ? isDark
                      ? 'ring-2 ring-[#8b5cf6] ring-offset-2 ring-offset-[#131322] shadow-lg shadow-[#8b5cf6]/25'
                      : 'ring-2 ring-[#7c3aed] ring-offset-2 ring-offset-white shadow-lg shadow-[#7c3aed]/20'
                    : isDark
                      ? 'border border-white/15'
                      : 'border border-gray-200'
                }`}
                style={{ backgroundColor: color }}
              >
                {/* Active/Original Badge */}
                {isOriginal && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-md border border-white/10 text-[9px] font-bold text-white uppercase tracking-wider rounded-full shadow-sm">
                    Active
                  </span>
                )}

                {/* Glass Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className={`p-2.5 backdrop-blur-md rounded-full border text-white shadow-xl transform scale-75 group-hover:scale-100 transition-transform duration-300 ${
                    isDark
                      ? 'bg-white/20 border-white/30'
                      : 'bg-white/30 border-white/50'
                  }`}>
                    {isCopied ? (
                      <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
                    ) : (
                      <Copy className="w-4 h-4 text-white stroke-[2.5]" />
                    )}
                  </div>
                </div>

                {/* Copied Toast Indicator */}
                {isCopied && (
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-emerald-500/90 backdrop-blur-md text-[10px] font-bold text-white rounded-md shadow-md animate-in fade-in zoom-in duration-200">
                    Copied!
                  </span>
                )}
              </div>

              {/* Text Info */}
              <div className="mt-2.5 w-full text-center space-y-0.5">
                <span className={`text-xs font-semibold transition-colors block truncate ${
                  isDark
                    ? 'text-white/80 group-hover:text-white'
                    : 'text-gray-700 group-hover:text-gray-900'
                }`}>
                  {label}
                </span>
                <span className={`text-[11px] font-mono transition-colors block tracking-wider ${
                  isDark
                    ? 'text-white/40 group-hover:text-[#a78bfa]'
                    : 'text-gray-400 group-hover:text-[#7c3aed]'
                }`}>
                  {color}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Internal Color Conversion Helpers
function hexToHsl(hex: string): [number, number, number] | null {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return null;

  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0, g = 0, b = 0;

  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (val: number) =>
    Math.round((val + m) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}