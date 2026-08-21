'use client';

import { useState, useMemo } from 'react';
import { Copy, Check, Palette } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ColorHarmoniesProps {
  hex: string;
  onColorSelect?: (hex: string) => void;
}

interface HarmonyGroup {
  name: string;
  colors: { h: number; s: number; l: number; hex: string }[];
}

export default function ColorHarmonies({ hex, onColorSelect }: ColorHarmoniesProps) {
  const { isDark } = useTheme();
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // Normalize incoming HEX safely
  const cleanHex = useMemo(() => {
    const raw = hex.replace(/^#/, '');
    return `#${raw.padStart(6, '0').slice(0, 6)}`.toUpperCase();
  }, [hex]);

  // Derive HSL values dynamically
  const baseHsl = useMemo(() => {
    return hexToHsl(cleanHex);
  }, [cleanHex]);

  // Compute all Color Harmonies
  const harmonies = useMemo<HarmonyGroup[]>(() => {
    if (!baseHsl) return [];

    const [h, s, l] = baseHsl;

    const buildColorObj = (hueOffset: number, sat = s, light = l) => {
      const finalHue = (h + hueOffset + 360) % 360;
      return {
        h: finalHue,
        s: sat,
        l: light,
        hex: hslToHex(finalHue, sat, light),
      };
    };

    return [
      {
        name: 'Complementary',
        colors: [buildColorObj(0), buildColorObj(180)],
      },
      {
        name: 'Split Complementary',
        colors: [buildColorObj(0), buildColorObj(150), buildColorObj(210)],
      },
      {
        name: 'Triadic',
        colors: [buildColorObj(0), buildColorObj(120), buildColorObj(240)],
      },
      {
        name: 'Tetradic',
        colors: [buildColorObj(0), buildColorObj(90), buildColorObj(180), buildColorObj(270)],
      },
      {
        name: 'Analogous',
        colors: [buildColorObj(-30), buildColorObj(0), buildColorObj(30)],
      },
      {
        name: 'Monochromatic',
        colors: [
          buildColorObj(0, s, Math.max(15, l - 30)),
          buildColorObj(0, s, Math.max(25, l - 15)),
          buildColorObj(0, s, l),
          buildColorObj(0, s, Math.min(85, l + 15)),
          buildColorObj(0, s, Math.min(95, l + 30)),
        ],
      },
    ];
  }, [baseHsl]);

  const handleCopy = async (colorHex: string) => {
    try {
      await navigator.clipboard.writeText(colorHex);
      setCopiedColor(colorHex);
      if (onColorSelect) onColorSelect(colorHex);
      setTimeout(() => setCopiedColor(null), 1800);
    } catch (err) {
      console.error('Failed to copy color:', err);
    }
  };

  if (!baseHsl) return null;

  return (
    <div className="w-full space-y-5">
      {/* Premium Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Palette className={`w-4 h-4 animate-pulse ${
            isDark ? 'text-[#a78bfa]' : 'text-[#7c3aed]'
          }`} />
          <h3 className={`text-sm font-semibold tracking-wide ${
            isDark ? 'text-white/90' : 'text-gray-800'
          }`}>
            Color Harmonies
          </h3>
        </div>
        <span className={`text-[11px] font-medium tracking-wider uppercase ${
          isDark ? 'text-white' : 'text-gray-600'
        }`}>
          Click Swatch to Copy
        </span>
      </div>

      {/* Harmonies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {harmonies.map(({ name, colors }) => (
          <div
            key={name}
            className={`group relative backdrop-blur-xl rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between ${
              isDark
                ? 'bg-[#131322]/80 border border-white/10 hover:border-white/20 hover:shadow-xl hover:shadow-[#8b5cf6]/5'
                : 'bg-white/80 border border-gray-200 hover:border-[#7c3aed]/30 hover:shadow-xl hover:shadow-[#7c3aed]/10'
            }`}
          >
            <div>
              {/* Harmony Name */}
              <div className="flex items-center justify-between mb-3.5">
                <span className={`text-xs font-semibold transition-colors ${
                  isDark
                    ? 'text-white group-hover:text-white'
                    : 'text-gray-700 group-hover:text-gray-900'
                }`}>
                  {name}
                </span>
                <span className={`text-[10px] font-mono ${
                  isDark ? 'text-white' : 'text-gray-600'
                }`}>
                  {colors.length} Colors
                </span>
              </div>

              {/* Color Swatches Row */}
              <div className="flex gap-2.5 flex-wrap items-center">
                {colors.map((colorItem, index) => {
                  const isCopied = copiedColor === colorItem.hex;

                  return (
                    <button
                      key={`${name}-${colorItem.hex}-${index}`}
                      type="button"
                      onClick={() => handleCopy(colorItem.hex)}
                      className="group/swatch relative flex flex-col items-center flex-1 min-w-[48px] cursor-pointer"
                    >
                      {/* Swatch Box */}
                      <div
                        className={`relative w-full h-12 rounded-xl border transition-all duration-300 group-hover/swatch:scale-105 group-hover/swatch:shadow-lg overflow-hidden active:scale-95 ${
                          isDark ? 'border-white/15' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: colorItem.hex }}
                      >
                        {/* Glass Overlay on Hover */}
                        <div className={`absolute inset-0 opacity-0 group-hover/swatch:opacity-100 transition-opacity duration-200 flex items-center justify-center ${
                          isDark ? 'bg-black/30' : 'bg-black/20'
                        }`}>
                          {isCopied ? (
                            <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                          ) : (
                            <Copy className="w-4 h-4 text-white stroke-[2.5]" />
                          )}
                        </div>

                        {/* Copied Toast Indicator */}
                        {isCopied && (
                          <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-emerald-500 text-[8px] font-bold text-white rounded shadow animate-in fade-in zoom-in duration-150">
                            Copied
                          </span>
                        )}
                      </div>

                      {/* HEX Label */}
                      <span className={`text-[10px] font-mono transition-colors mt-1.5 tracking-tighter ${
                        isDark
                          ? 'text-white group-hover/swatch:text-[#a78bfa]'
                          : 'text-gray-600 group-hover/swatch:text-[#7c3aed]'
                      }`}>
                        {colorItem.hex}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Standalone Color Conversion Utilities
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