'use client';

import { useState } from 'react';
import { getContrastColor } from '@/lib/color-utils';
import { useTheme } from '@/contexts/ThemeContext';

export default function ContrastPage() {
  const { isDark } = useTheme();
  const [color1, setColor1] = useState('#8b5cf6');
  const [color2, setColor2] = useState('#ffffff');
  
  const getContrastRatio = (c1: string, c2: string): number => {
    const rgb1 = hexToRgbValues(c1);
    const rgb2 = hexToRgbValues(c2);
    if (!rgb1 || !rgb2) return 0;
    
    const l1 = calculateLuminance(rgb1);
    const l2 = calculateLuminance(rgb2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };
  
  const contrast = getContrastRatio(color1, color2);
  const isAA = contrast >= 4.5;
  const isAAA = contrast >= 7;
  
  return (
    <div className={`max-w-4xl mx-auto p-6 min-h-screen ${
      isDark ? 'bg-[#090911]' : 'bg-gray-50'
    }`}>
      <h1 className={`text-3xl font-bold mb-2 ${
        isDark ? 'text-white' : 'text-gray-800'
      }`}>
        Contrast Checker
      </h1>
      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
        Check color contrast for accessibility
      </p>
      
      <div className={`mt-6 rounded-xl p-6 border ${
        isDark 
          ? 'bg-[#1a1a2e] border-[#2d2d4a]' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className={`block text-sm mb-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Text Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={color1}
                onChange={(e) => setColor1(e.target.value)}
                className={`w-12 h-12 rounded-lg cursor-pointer border ${
                  isDark ? 'border-[#2d2d4a]' : 'border-gray-200'
                }`}
              />
              <input
                type="text"
                value={color1}
                onChange={(e) => setColor1(e.target.value)}
                className={`flex-1 px-3 py-2 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#7c3aed] ${
                  isDark
                    ? 'bg-[#0f0f1a] border border-[#2d2d4a] text-white'
                    : 'bg-gray-50 border border-gray-200 text-gray-800'
                }`}
              />
            </div>
          </div>
          <div>
            <label className={`block text-sm mb-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Background Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={color2}
                onChange={(e) => setColor2(e.target.value)}
                className={`w-12 h-12 rounded-lg cursor-pointer border ${
                  isDark ? 'border-[#2d2d4a]' : 'border-gray-200'
                }`}
              />
              <input
                type="text"
                value={color2}
                onChange={(e) => setColor2(e.target.value)}
                className={`flex-1 px-3 py-2 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#7c3aed] ${
                  isDark
                    ? 'bg-[#0f0f1a] border border-[#2d2d4a] text-white'
                    : 'bg-gray-50 border border-gray-200 text-gray-800'
                }`}
              />
            </div>
          </div>
        </div>
        
        {/* Preview */}
        <div 
          className="p-8 rounded-lg text-center border border-gray-200 dark:border-white/10"
          style={{ backgroundColor: color2 }}
        >
          <p className="text-2xl font-bold" style={{ color: color1 }}>
            The quick brown fox jumps over the lazy dog
          </p>
          <p className="text-sm mt-2" style={{ color: color1, opacity: 0.7 }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
        </div>
        
        {/* Results */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg text-center border ${
            isDark 
              ? 'bg-[#0f0f1a] border-[#2d2d4a]' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Contrast Ratio
            </p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {contrast.toFixed(2)}:1
            </p>
          </div>
          <div className={`p-4 rounded-lg text-center border ${
            isDark 
              ? 'bg-[#0f0f1a] border-[#2d2d4a]' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              WCAG AA
            </p>
            <p className={`text-2xl font-bold ${isAA ? 'text-green-500' : 'text-red-500'}`}>
              {isAA ? '✅ Pass' : '❌ Fail'}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Minimum 4.5:1
            </p>
          </div>
          <div className={`p-4 rounded-lg text-center border ${
            isDark 
              ? 'bg-[#0f0f1a] border-[#2d2d4a]' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              WCAG AAA
            </p>
            <p className={`text-2xl font-bold ${isAAA ? 'text-green-500' : 'text-red-500'}`}>
              {isAAA ? '✅ Pass' : '❌ Fail'}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Minimum 7:1
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function hexToRgbValues(hex: string): [number, number, number] | null {
  const cleanHex = hex.replace('#', '');
  if (!/^[a-fA-F0-9]{6}$/.test(cleanHex)) return null;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return [r, g, b];
}

function calculateLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}