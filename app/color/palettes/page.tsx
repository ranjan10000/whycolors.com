// app/color/palettes/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getAllColorNames, getColorDefinition } from '@/lib/dynamic-palettes';
import { useTheme } from '@/contexts/ThemeContext';

export default function PalettesPage() {
  const { isDark } = useTheme();
  const [hexInput, setHexInput] = useState('');
  const colorNames = getAllColorNames();
  const displayColors = colorNames.slice(0, 20);
  
  const handleHexSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHex = hexInput.replace('#', '').toLowerCase();
    if (/^[a-f0-9]{6}$/.test(cleanHex)) {
      window.location.href = `/color/palettes/${cleanHex}`;
    }
  };
  
  return (
    <div className={`max-w-6xl mx-auto p-6 min-h-screen ${
      isDark ? 'bg-[#090911]' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}>
          Color Palettes
        </h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Explore color harmonies and palettes for any color
        </p>
      </div>
      
      {/* Hex Input */}
      <div className={`mb-8 p-4 rounded-xl border ${
        isDark 
          ? 'bg-[#1a1a2e] border-[#2d2d4a]' 
          : 'bg-white border-gray-200'
      }`}>
        <form onSubmit={handleHexSubmit} className="flex gap-3">
          <input
            type="text"
            placeholder="Enter hex color (e.g., ff0000)"
            value={hexInput}
            onChange={(e) => setHexInput(e.target.value)}
            className={`flex-1 rounded-lg px-4 py-2 placeholder-gray-500 focus:outline-none focus:border-[#7c3aed] ${
              isDark
                ? 'bg-[#0f0f1a] border border-[#2d2d4a] text-white'
                : 'bg-gray-50 border border-gray-200 text-gray-800'
            }`}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg font-medium transition"
          >
            Generate
          </button>
        </form>
        <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Try: ff0000, 00ff00, 0000ff, or any 6-digit hex
        </p>
      </div>
      
      {/* Color Grid - Sends HEX CODE instead of color name */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayColors.map((colorName) => {
          const color = getColorDefinition(colorName);
          if (!color) return null;
          
          // ✅ Get the hex code without the # symbol
          const hexCode = color.hex.replace('#', '').toLowerCase();
          
          return (
            <Link
              key={colorName}
              href={`/color/palettes/${hexCode}`}
              className={`group rounded-xl p-4 transition-all hover:shadow-xl text-center ${
                isDark
                  ? 'bg-[#1a1a2e] border border-[#2d2d4a] hover:border-[#8b5cf6] hover:shadow-[#8b5cf6]/10'
                  : 'bg-white border border-gray-200 hover:border-[#7c3aed] hover:shadow-[#7c3aed]/10'
              }`}
            >
              <div 
                className={`w-16 h-16 rounded-full border-2 transition-all group-hover:scale-110 mx-auto mb-3 ${
                  isDark 
                    ? 'border-white/10 group-hover:border-[#8b5cf6]' 
                    : 'border-gray-200 group-hover:border-[#7c3aed]'
                }`}
                style={{ backgroundColor: color.hex }}
              />
              <h3 className={`font-medium transition ${
                isDark
                  ? 'text-white group-hover:text-[#8b5cf6]'
                  : 'text-gray-800 group-hover:text-[#7c3aed]'
              }`}>
                {color.name}
              </h3>
              <p className={`text-xs mt-1 font-mono ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {color.hex}
              </p>
            </Link>
          );
        })}
      </div>
      
      {/* Show all colors link */}
      <div className="mt-8 text-center">
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          + {colorNames.length - 20} more colors available
        </p>
        <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Or try any hex: /color/palettes/ff6b35
        </p>
      </div>
    </div>
  );
}