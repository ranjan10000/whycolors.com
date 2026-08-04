// components/color/ColorShadesTailwind.tsx
'use client';

import { useState } from 'react';
import { hexToRgbArray, rgbToHex } from '@/lib/color-utils';

interface ColorShadesProps {
  hex: string;
}

export default function ColorShadesTailwind({ hex }: ColorShadesProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Normalize hex input
  const cleanHex = hex.startsWith('#') ? hex : `#${hex}`;
  const rgb = hexToRgbArray(cleanHex);

  if (!rgb) return null;

  const [r, g, b] = rgb;

  const copyToClipboard = (colorHex: string) => {
    navigator.clipboard.writeText(colorHex.toUpperCase());
    setCopiedHex(colorHex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  // Generate Shades (Mix with Black)
  const shades = Array.from({ length: 6 }, (_, i) => {
    const factor = (i + 1) * 0.14;
    const newR = Math.max(0, Math.round(r * (1 - factor)));
    const newG = Math.max(0, Math.round(g * (1 - factor)));
    const newB = Math.max(0, Math.round(b * (1 - factor)));
    return {
      hex: rgbToHex([newR, newG, newB]),
      percentage: Math.round(factor * 100),
    };
  });

  // Generate Tints (Mix with White)
  const tints = Array.from({ length: 6 }, (_, i) => {
    const factor = (i + 1) * 0.14;
    const newR = Math.min(255, Math.round(r + (255 - r) * factor));
    const newG = Math.min(255, Math.round(g + (255 - g) * factor));
    const newB = Math.min(255, Math.round(b + (255 - b) * factor));
    return {
      hex: rgbToHex([newR, newG, newB]),
      percentage: Math.round(factor * 100),
    };
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {copiedHex && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-purple-50 border border-purple-200 text-purple-700 text-xs px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg">
          <svg className="w-3.5 h-3.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span>Copied <strong className="font-mono">{copiedHex.toUpperCase()}</strong></span>
        </div>
      )}

      {/* Tints Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600">Tints (Lighter)</h4>
          <span className="text-[10px] text-gray-400 font-medium">+White</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {tints.map((item, index) => (
            <button
              key={`tint-${index}`}
              onClick={() => copyToClipboard(item.hex)}
              className="group flex flex-col items-center gap-1.5"
            >
              <div
                className="w-full aspect-square rounded-lg border border-gray-200 shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg group-hover:border-purple-300 relative overflow-hidden"
                style={{ backgroundColor: item.hex }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  {copiedHex === item.hex ? (
                    <svg className="w-4 h-4 text-gray-700 drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity text-gray-700 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">
                      +{item.percentage}%
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-gray-500 group-hover:text-purple-600 font-mono uppercase transition-colors">{item.hex}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Shades Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-600">Shades (Darker)</h4>
          <span className="text-[10px] text-gray-400 font-medium">+Black</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {shades.map((item, index) => (
            <button
              key={`shade-${index}`}
              onClick={() => copyToClipboard(item.hex)}
              className="group flex flex-col items-center gap-1.5"
            >
              <div
                className="w-full aspect-square rounded-lg border border-gray-200 shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg group-hover:border-purple-300 relative overflow-hidden"
                style={{ backgroundColor: item.hex }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  {copiedHex === item.hex ? (
                    <svg className="w-4 h-4 text-white drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm">
                      +{item.percentage}%
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-gray-500 group-hover:text-purple-600 font-mono uppercase transition-colors">{item.hex}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}