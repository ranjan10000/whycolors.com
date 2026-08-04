'use client';

import { useState } from 'react';
import ColorWheel from '@/components/color/ColorWheel';
import { hexToRgb, hexToHsl } from '@/lib/color-utils';
import { useTheme } from '@/contexts/ThemeContext';

export default function ColorWheelPage() {
  const { isDark } = useTheme();
  const [color, setColor] = useState('#8B5CF6');

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('#')) {
      val = `#${val}`;
    }
    // Allow typing valid hex characters up to 7 characters (#FFFFFF)
    if (/^#?[0-9A-Fa-f]{0,6}$/.test(val)) {
      setColor(val);
    }
  };

  const cleanHex = color.replace('#', '');
  const isValidHex = cleanHex.length === 6 || cleanHex.length === 3;

  return (
    <div className={`max-w-7xl mx-auto p-6 min-h-screen ${
      isDark ? 'bg-[#090911]' : 'bg-gray-50'
    }`}>
      <h1 className={`text-3xl font-bold mb-2 ${
        isDark ? 'text-white' : 'text-gray-800'
      }`}>
        Color Wheel
      </h1>
      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
        Visualize colors and their relationships on the color wheel
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Left Column: Color Wheel Display */}
        <div className={`rounded-xl p-6 flex items-center justify-center min-h-[350px] border ${
          isDark 
            ? 'bg-[#1a1a2e] border-[#2d2d4a]' 
            : 'bg-white border-gray-200'
        }`}>
          <ColorWheel hex={isValidHex ? cleanHex : '8B5CF6'} />
        </div>

        {/* Right Column: Controls & Values */}
        <div className="space-y-4">
          <div className={`rounded-xl p-6 border ${
            isDark 
              ? 'bg-[#1a1a2e] border-[#2d2d4a]' 
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-sm font-medium mb-4 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Color Controls
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm mb-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Pick a Color
                </label>
                <input
                  type="color"
                  value={isValidHex ? (color.startsWith('#') ? color : `#${color}`) : '#8B5CF6'}
                  onChange={handleColorChange}
                  className={`w-full h-12 rounded-lg cursor-pointer border p-1 ${
                    isDark ? 'border-[#2d2d4a] bg-transparent' : 'border-gray-200 bg-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm mb-2 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  HEX
                </label>
                <input
                  type="text"
                  value={color.toUpperCase()}
                  onChange={handleHexInputChange}
                  maxLength={7}
                  placeholder="#8B5CF6"
                  className={`w-full px-4 py-2 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-[#7c3aed] ${
                    isDark
                      ? 'bg-[#0f0f1a] border border-[#2d2d4a] text-white'
                      : 'bg-gray-50 border border-gray-200 text-gray-800'
                  }`}
                />
              </div>

              <div className={`grid grid-cols-2 gap-4 pt-2 border-t ${
                isDark ? 'border-[#2d2d4a]' : 'border-gray-200'
              }`}>
                <div>
                  <label className={`block text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    RGB
                  </label>
                  <p className={`font-mono text-sm mt-1 ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                    {isValidHex ? hexToRgb(cleanHex) || '—' : '—'}
                  </p>
                </div>
                <div>
                  <label className={`block text-sm ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    HSL
                  </label>
                  <p className={`font-mono text-sm mt-1 ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                    {isValidHex ? hexToHsl(cleanHex) || '—' : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Color Harmonies Preview */}
          <div className={`rounded-xl p-6 border ${
            isDark 
              ? 'bg-[#1a1a2e] border-[#2d2d4a]' 
              : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-sm font-medium mb-3 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Color Palette
            </h3>
            <div className="flex gap-2">
              {getHarmonies(isValidHex ? cleanHex : '8B5CF6').map((h, i) => (
                <div key={i} className="flex-1">
                  <div
                    className={`w-full h-12 rounded-lg border transition-colors ${
                      isDark ? 'border-[#2d2d4a]' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: h }}
                  />
                  <p className={`text-[10px] mt-1 text-center font-mono uppercase ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {h}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Generates complementary and split-complementary variations 
 * instead of purely random values.
 */
function getHarmonies(hex: string): string[] {
  const baseHex = `#${hex.slice(0, 6).padStart(6, '0')}`;
  
  // Calculate simple color variations by shifting values
  const num = parseInt(hex.slice(0, 6).padStart(6, '0'), 16);
  if (isNaN(num)) return [baseHex, baseHex, baseHex, baseHex, baseHex];

  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  // Generate 4 deterministic color variations based on the base RGB
  const toHex = (red: number, green: number, blue: number) =>
    `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1).toUpperCase()}`;

  return [
    baseHex.toUpperCase(),
    toHex(255 - r, 255 - g, 255 - b),                  // Inverted/Complementary
    toHex((r + 50) % 256, (g + 100) % 256, (b + 150) % 256), // Shift 1
    toHex((r + 100) % 256, (g + 150) % 256, (b + 50) % 256), // Shift 2
    toHex((r + 150) % 256, (g + 50) % 256, (b + 100) % 256), // Shift 3
  ];
}