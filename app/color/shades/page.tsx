'use client';

import { useState } from 'react';
import { hexToRgbArray, rgbToHex } from '@/lib/color-utils';
import { useTheme } from '@/contexts/ThemeContext';

export default function ShadesPage() {
  const { isDark } = useTheme();
  const [color, setColor] = useState('#8b5cf6');
  const [shadeCount, setShadeCount] = useState(10);
  
  const generateShades = (baseHex: string, count: number): string[] => {
    const rgb = hexToRgbArray(baseHex.replace('#', ''));
    if (!rgb) return [];
    
    const [r, g, b] = rgb;
    const shades: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const factor = i / (count - 1);
      const newR = Math.round(r * (1 - factor * 0.8));
      const newG = Math.round(g * (1 - factor * 0.8));
      const newB = Math.round(b * (1 - factor * 0.8));
      shades.push(rgbToHex([newR, newG, newB]));
    }
    
    return shades;
  };
  
  const generateTints = (baseHex: string, count: number): string[] => {
    const rgb = hexToRgbArray(baseHex.replace('#', ''));
    if (!rgb) return [];
    
    const [r, g, b] = rgb;
    const tints: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const factor = i / (count - 1);
      const newR = Math.round(r + (255 - r) * factor * 0.8);
      const newG = Math.round(g + (255 - g) * factor * 0.8);
      const newB = Math.round(b + (255 - b) * factor * 0.8);
      tints.push(rgbToHex([newR, newG, newB]));
    }
    
    return tints;
  };
  
  const shades = generateShades(color, shadeCount);
  const tints = generateTints(color, shadeCount);
  
  return (
    <div className={`max-w-4xl mx-auto p-6 min-h-screen ${
      isDark ? 'bg-[#090911]' : 'bg-gray-50'
    }`}>
      <h1 className={`text-3xl font-bold mb-2 ${
        isDark ? 'text-white' : 'text-gray-800'
      }`}>
        Shades Generator
      </h1>
      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
        Generate shades and tints from a base color
      </p>
      
      <div className={`mt-6 rounded-xl p-6 border ${
        isDark 
          ? 'bg-[#1a1a2e] border-[#2d2d4a]' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className={`w-16 h-16 rounded-lg cursor-pointer border ${
              isDark ? 'border-[#2d2d4a]' : 'border-gray-300'
            }`}
          />
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className={`px-4 py-2 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#7c3aed] ${
              isDark
                ? 'bg-[#0f0f1a] border border-[#2d2d4a] text-white'
                : 'bg-gray-50 border border-gray-200 text-gray-800'
            }`}
          />
          <div className="flex-1 min-w-[150px]">
            <label className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Number of shades
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="3"
                max="20"
                value={shadeCount}
                onChange={(e) => setShadeCount(parseInt(e.target.value))}
                className={`flex-1 ${isDark ? 'accent-[#8b5cf6]' : 'accent-[#7c3aed]'}`}
              />
              <span className={`text-sm font-mono ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {shadeCount}
              </span>
            </div>
          </div>
        </div>
        
        {/* Shades */}
        <div className="mb-6">
          <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-600'}`}>
            Shades (Darker)
          </h3>
          <div className="flex flex-wrap gap-1">
            {shades.map((s, i) => (
              <div key={`shade-${i}`} className="flex-1 min-w-[40px]">
                <div 
                  className={`w-full h-16 rounded border ${
                    isDark ? 'border-[#2d2d4a]' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: s }}
                />
                <p className={`text-xs mt-1 text-center font-mono ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>{s}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Base Color */}
        <div className="mb-6">
          <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Base Color
          </h3>
          <div className="flex-1">
            <div 
              className={`w-full h-16 rounded border-2 ${
                isDark ? 'border-[#8b5cf6]' : 'border-[#7c3aed]'
              }`}
              style={{ backgroundColor: color }}
            />
            <p className={`text-xs mt-1 text-center font-mono ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}>{color}</p>
          </div>
        </div>
        
        {/* Tints */}
        <div>
          <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-600'}`}>
            Tints (Lighter)
          </h3>
          <div className="flex flex-wrap gap-1">
            {tints.map((t, i) => (
              <div key={`tint-${i}`} className="flex-1 min-w-[40px]">
                <div 
                  className={`w-full h-16 rounded border ${
                    isDark ? 'border-[#2d2d4a]' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: t }}
                />
                <p className={`text-xs mt-1 text-center font-mono ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>{t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}