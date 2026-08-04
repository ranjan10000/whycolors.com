// app/color/palettes/[hex]/PaletteClient.tsx
'use client'; // ✅ Client Component for interactivity

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface PaletteClientProps {
  hex: string;
  fullHex: string;
  colorName: string;
  paletteTypes: Array<{
    id: string;
    label: string;
    icon: string;
    colors: string[];
  }>;
}

export default function PaletteClient({ 
  hex, 
  fullHex, 
  colorName, 
  paletteTypes 
}: PaletteClientProps) {
  const { isDark } = useTheme();
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const handleCopy = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <div className={`max-w-6xl mx-auto p-6 min-h-screen ${
      isDark ? 'bg-[#090911]' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div 
            className={`w-16 h-16 rounded-full border-2 shadow-xl ${
              isDark ? 'border-white/20' : 'border-gray-200'
            }`}
            style={{ backgroundColor: fullHex }}
          />
          <div>
            <h1 className={`text-3xl font-bold ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              {colorName} Palettes
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-sm font-mono ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>{fullHex}</span>
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>|</span>
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Generated dynamically
              </span>
            </div>
          </div>
        </div>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Explore all color harmonies and palettes for {fullHex}
        </p>
      </div>
      
      {/* All Palette Types */}
      <div className="space-y-6">
        {paletteTypes.map((type) => (
          <div 
            key={type.id}
            className={`rounded-xl p-4 transition-all ${
              isDark
                ? 'bg-[#1a1a2e] border border-[#2d2d4a] hover:border-[#8b5cf6]/50'
                : 'bg-white border border-gray-200 hover:border-[#7c3aed]/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{type.icon}</span>
              <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {type.label}
              </h3>
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                ({type.colors.length} colors)
              </span>
            </div>
            
            <div className="flex gap-2">
              {type.colors.map((color: string, i: number) => {
                const isCopied = copiedColor === color;
                return (
                  <button
                    key={i}
                    onClick={() => handleCopy(color)}
                    className="group flex-1 relative"
                  >
                    <div 
                      className={`w-full h-12 rounded-lg border transition-all group-hover:scale-105 group-hover:shadow-lg ${
                        isDark
                          ? 'border-white/10 group-hover:border-white/30'
                          : 'border-gray-200 group-hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                    <p className={`text-center text-[10px] font-mono mt-1 truncate transition ${
                      isDark
                        ? 'text-gray-500 group-hover:text-white'
                        : 'text-gray-400 group-hover:text-gray-700'
                    }`}>
                      {color}
                    </p>
                    {isCopied && (
                      <span className="absolute -top-2 -right-2 text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className={`mt-8 p-4 rounded-xl text-center border ${
        isDark
          ? 'bg-[#1a1a2e]/50 border-[#2d2d4a]/50'
          : 'bg-gray-100/50 border-gray-200/50'
      }`}>
        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          ✦ All palettes generated using chroma-js color science • Try any color!
        </p>
      </div>
    </div>
  );
}