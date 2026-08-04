'use client';

import { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  hexToRgb, 
  hexToHsl, 
  hexToHsv, 
  hexToCmyk
} from '@/lib/color-utils';

interface ColorConversionsProps {
  hex: string;
}

interface ConversionItem {
  label: string;
  subLabel: string;
  value: string;
}

export default function ColorConversions({ hex }: ColorConversionsProps) {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState<string | null>(null);

  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;

  const conversions: ConversionItem[] = [
    { 
      label: 'HEX', 
      subLabel: 'Web & Digital', 
      value: `#${cleanHex.toUpperCase()}` 
    },
    { 
      label: 'RGB', 
      subLabel: 'Red, Green, Blue', 
      value: hexToRgb(cleanHex) || '—' 
    },
    { 
      label: 'HSL', 
      subLabel: 'Hue, Saturation, Lightness', 
      value: hexToHsl(cleanHex) || '—' 
    },
    { 
      label: 'HSV', 
      subLabel: 'Hue, Saturation, Value', 
      value: hexToHsv(cleanHex) || '—' 
    },
    { 
      label: 'CMYK', 
      subLabel: 'Print Media Format', 
      value: hexToCmyk(cleanHex) || '—' 
    },
  ];

  const handleCopy = async (text: string, label: string) => {
    if (text === '—') return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`backdrop-blur-md rounded-2xl p-6 shadow-lg relative ${
      isDark 
        ? 'bg-[#131322]/80 border border-white/10' 
        : 'bg-white/80 border border-[#e2e8f0]'
    }`}>
      {/* Section Header */}
      <div className={`flex items-center justify-between pb-4 mb-6 border-b ${
        isDark ? 'border-white/10' : 'border-[#e2e8f0]'
      }`}>
        <div className="flex items-center gap-2">
          <Sparkles className={`w-4 h-4 ${isDark ? 'text-[#a78bfa]' : 'text-purple-600'}`} />
          <h3 className={`text-base font-semibold tracking-wide ${
            isDark ? 'text-white/90' : 'text-[#101114]'
          }`}>
            Color Formats
          </h3>
        </div>
        <span className={`text-xs font-mono ${isDark ? 'text-white/40' : 'text-[#686b74]'}`}>
          5 Formats
        </span>
      </div>

      {/* Conversion Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {conversions.map(({ label, subLabel, value }) => {
          const isCopied = copied === label;
          const isValid = value !== '—';

          return (
            <div
              key={label}
              onClick={() => isValid && handleCopy(value, label)}
              className={`group relative overflow-hidden rounded-xl border transition-all duration-300 p-4 cursor-pointer select-none ${
                isCopied
                  ? isDark
                    ? 'border-purple-500 bg-purple-900/30 shadow-lg shadow-purple-900/20'
                    : 'border-purple-500 bg-purple-50 shadow-md shadow-purple-100'
                  : isDark
                    ? 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 hover:shadow-md'
                    : 'border-[#e2e8f0] bg-[#f8f9fa] hover:border-purple-400 hover:bg-[#f3f4f6] hover:shadow-md'
              }`}
            >
              {/* Top Row: Label & Sublabel + Copy Button */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wider font-mono ${
                      isDark ? 'text-[#a78bfa]' : 'text-purple-700'
                    }`}>
                      {label}
                    </span>
                  </div>
                  <p className={`text-[11px] font-normal ${
                    isDark ? 'text-white/50' : 'text-[#686b74]'
                  }`}>
                    {subLabel}
                  </p>
                </div>

                {isValid && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(value, label);
                    }}
                    className={`p-1.5 rounded-lg border transition-all duration-200 ${
                      isCopied
                        ? isDark
                          ? 'bg-emerald-900/50 border-emerald-500 text-emerald-400 scale-105'
                          : 'bg-emerald-100 border-emerald-400 text-emerald-700 scale-105'
                        : isDark
                          ? 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/30'
                          : 'bg-white border-[#e2e8f0] text-[#686b74] hover:text-[#101114] hover:border-purple-400'
                    }`}
                    title={`Copy ${label}`}
                  >
                    {isCopied ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>

              {/* Bottom Row: Value Output */}
              <div className="flex items-center justify-between mt-1">
                <p className={`text-sm font-mono font-medium tracking-tight break-all ${
                  isDark ? 'text-white/80' : 'text-[#101114]'
                }`}>
                  {value}
                </p>

                {/* Micro Toast Feedback */}
                {isCopied && (
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md animate-in fade-in zoom-in-95 ${
                    isDark 
                      ? 'text-emerald-400 bg-emerald-900/50 border border-emerald-500/30'
                      : 'text-emerald-700 bg-emerald-100 border border-emerald-300'
                  }`}>
                    Copied!
                  </span>
                )}
              </div>

              {/* Decorative Subtle Accent Line */}
              <div 
                className={`absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-300 ${
                  isCopied 
                    ? 'bg-emerald-500' 
                    : isDark
                      ? 'bg-purple-500/0 group-hover:bg-purple-500/40'
                      : 'bg-purple-500/0 group-hover:bg-purple-500/30'
                }`} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}