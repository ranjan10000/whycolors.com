// components/ColorChart.tsx
'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Copy, Check, Palette, Sparkles, Eye, Droplet } from 'lucide-react';

// ================ CONSTANTS ================
const COPY_TIMEOUT = 2000;

// ================ UTILITY FUNCTIONS ================

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  let cleanHex = hex.replace('#', '').trim();

  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(char => char + char).join('');
  }

  if (!/^[a-fA-F0-9]{6}$/i.test(cleanHex)) return null;

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return { r, g, b };
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

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
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const lNorm = Math.max(0, Math.min(100, l)) / 100;
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

  const rr = Math.round((r + m) * 255);
  const gg = Math.round((g + m) * 255);
  const bb = Math.round((b + m) * 255);

  return `${rr.toString(16).padStart(2, '0')}${gg.toString(16).padStart(2, '0')}${bb.toString(16).padStart(2, '0')}`.toUpperCase();
}

// ================ DYNAMIC COLOR GENERATION ================

const generateDynamicPalette = (currentHex: string): { hex: string; name: string; description: string }[] => {
  const rgb = hexToRgb(currentHex);
  if (!rgb) return [];

  const [h, s] = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const baseSaturation = s < 20 ? 90 : s;

  const steps = [
    { l: 97, name: 'Cloud', description: 'Subtle whisper' },
    { l: 88, name: 'Mist', description: 'Soft breath' },
    { l: 78, name: 'Frost', description: 'Gentle glow' },
    { l: 65, name: 'Dawn', description: 'Warm embrace' },
    { l: 50, name: 'Core', description: 'True essence' },
    { l: 38, name: 'Dusk', description: 'Deep mystery' },
    { l: 28, name: 'Shadow', description: 'Quiet depth' },
    { l: 18, name: 'Abyss', description: 'Dark elegance' },
    { l: 10, name: 'Void', description: 'Midnight soul' },
    { l: 4,  name: 'Obsidian', description: 'Pure darkness' },
  ];

  const palette = steps.map((step) => ({
    hex: hslToHex(h, baseSaturation, step.l),
    name: step.name,
    description: step.description,
  }));

  const cleanHexUpper = currentHex.replace('#', '').toUpperCase();
  const exists = palette.some(p => p.hex === cleanHexUpper);
  if (!exists && cleanHexUpper) {
    palette[4] = { hex: cleanHexUpper, name: 'Selected', description: 'Your choice' };
  }

  return palette;
};

// ================ COMPONENT: Glass Color Bar ================
interface ColorBarProps {
  hex: string;
  name: string;
  isDark: boolean;
  isActive: boolean;
  onCopy: (e: React.MouseEvent, hex: string) => void;
  isCopied: boolean;
}

const GlassColorBar = React.memo(({ hex, name, isDark, isActive, onCopy, isCopied }: ColorBarProps) => {
  const fullHex = `#${hex}`;
  const isLight = parseInt(hex.substring(0, 2), 16) > 200;

  const handleCopyClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCopy(e, hex);
  }, [hex, onCopy]);

  return (
    <div
      className={`relative group flex-1 min-w-[55px] sm:min-w-[70px] h-40 sm:h-52 md:h-64 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
        isActive
          ? 'shadow-2xl shadow-violet-500/30 scale-[1.02] ring-2 ring-violet-400 ring-offset-2 ring-offset-transparent'
          : 'shadow-lg hover:shadow-xl hover:scale-[1.01]'
      }`}
      style={{ backgroundColor: fullHex }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10 pointer-events-none" />
      
      {/* ===== HOVER OVERLAY - Shows on hover ===== */}
      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-sm pointer-events-none">
        <button
          onClick={handleCopyClick}
          className="pointer-events-auto p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/20"
          aria-label={`Copy ${fullHex}`}
          title="Copy HEX"
        >
          {isCopied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
        </button>
        <span className="text-xs font-mono text-white mt-3 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10 pointer-events-none">
          {fullHex}
        </span>
        {/* ✅ Color name appears here on hover */}
        <span className="text-[9px] font-medium text-white/90 mt-1.5 tracking-wider uppercase pointer-events-none">
          {name}
        </span>
      </div>

      {isActive && (
        <>
          <div className="absolute top-3 right-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500 shadow-lg shadow-violet-500/50"></span>
            </span>
          </div>
          <div className="absolute bottom-3 left-3 right-3 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent rounded-full" />
        </>
      )}
    </div>
  );
});
GlassColorBar.displayName = 'GlassColorBar';

// ================ MAIN COMPONENT: Premium ColorChart ================
export default function ColorChart({
  currentHex,
  isDark,
  onColorSelect,
}: {
  currentHex: string;
  isDark: boolean;
  onColorSelect: (hex: string) => void;
}) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  
  // Initialize selectedHex from props
  const [selectedHex, setSelectedHex] = useState(() => {
    return currentHex?.replace('#', '').toUpperCase() || '6C63FF';
  });

  // Use ref to track previous currentHex value
  const prevCurrentHexRef = useRef<string>(currentHex);

  // Update selectedHex when currentHex prop changes from parent
  useEffect(() => {
    if (currentHex) {
      const cleanCurrent = currentHex.replace('#', '').toUpperCase();
      // Only update if different to avoid unnecessary re-renders
      if (cleanCurrent !== selectedHex) {
        setSelectedHex(cleanCurrent);
      }
    }
  }, [currentHex]);

  const handleCopy = useCallback((e: React.MouseEvent, hex: string) => {
    e.preventDefault();
    e.stopPropagation();
    const cleanHex = hex.replace('#', '');
    navigator.clipboard.writeText(`#${cleanHex}`).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = `#${cleanHex}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    });
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), COPY_TIMEOUT);
  }, []);

  const handleColorSelect = useCallback((hex: string) => {
    const cleanHex = hex.replace('#', '').toUpperCase();
    setSelectedHex(cleanHex);
    onColorSelect(cleanHex);
  }, [onColorSelect]);

  const dynamicPalette = useMemo(() => {
    const hexToUse = selectedHex || currentHex?.replace('#', '') || '6C63FF';
    return generateDynamicPalette(`#${hexToUse}`);
  }, [selectedHex, currentHex]);
  
  const cleanCurrentHex = selectedHex || currentHex?.replace('#', '') || '6C63FF';

  if (dynamicPalette.length === 0) {
    return (
      <div className={`p-8 rounded-3xl text-center transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-gray-100 to-gray-200'
      }`}>
        <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          ✨ No colors available
        </p>
      </div>
    );
  }

  return (
    <div className={`relative p-6 sm:p-8 rounded-3xl transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-[#0f1015] to-gray-900 border border-white/5 shadow-2xl' 
        : 'bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200/50 shadow-2xl'
    }`}>
      
      {/* Premium Header */}
      <div className="flex flex-wrap items-center justify-between mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2.5 rounded-xl ${
            isDark ? 'bg-violet-500/20' : 'bg-violet-500/10'
          }`}>
            <Sparkles className={`w-5 h-5 ${isDark ? 'text-violet-400' : 'text-violet-600'}`} />
          </div>
          <div>
            <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Color Spectrum
            </h2>
            <p className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Dynamic palette generator
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
            isDark ? 'bg-white/5' : 'bg-gray-100'
          }`}>
            <Palette className={`w-3.5 h-3.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {dynamicPalette.length} Shades
            </span>
          </div>
          {copiedHex && (
            <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full animate-in fade-in slide-in-from-top-2">
              ✓ Copied!
            </span>
          )}
        </div>
      </div>

      {/* Premium Color Bars */}
      <div className="flex gap-3 sm:gap-4 mb-10 p-4 overflow-x-auto scrollbar-thin scrollbar-thumb-violet-500/20 scrollbar-track-transparent">
        {dynamicPalette.map((color) => (
          <GlassColorBar
            key={color.hex}
            hex={color.hex}
            name={color.name}
            isDark={isDark}
            isActive={cleanCurrentHex.toUpperCase() === color.hex.toUpperCase()}
            onCopy={handleCopy}
            isCopied={copiedHex === color.hex}
          />
        ))}
      </div>
      
      {/* Premium Status Bar */}
      <div className={`mt-8 p-5 rounded-2xl border transition-all duration-300 ${
        isDark 
          ? 'bg-white/5 border-white/10 backdrop-blur-sm' 
          : 'bg-gray-50/50 border-gray-200/50 backdrop-blur-sm'
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="relative w-14 h-14 rounded-xl shadow-lg transition-all duration-300 overflow-hidden"
              style={{ backgroundColor: `#${cleanCurrentHex}` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className={`text-[10px] font-bold tracking-widest uppercase ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Current Selection
                </p>
                <Eye className="w-3 h-3 text-violet-400" />
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <p className={`font-mono text-lg sm:text-2xl font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  #{cleanCurrentHex}
                </p>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`}>
                  {dynamicPalette.find(c => c.hex.toUpperCase() === cleanCurrentHex.toUpperCase())?.name || 'Custom'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {copiedHex === cleanCurrentHex && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                <Check className="w-3.5 h-3.5" />
                Copied!
              </span>
            )}
            <div className={`p-2 rounded-lg ${
              isDark ? 'bg-white/5' : 'bg-gray-100'
            }`}>
              <Droplet className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Gradient Border */}
      <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-violet-500/10 via-transparent to-violet-500/10 blur-2xl pointer-events-none" />
    </div>
  );
}