'use client';

import { useState, useMemo, useEffect } from 'react';
import { Copy, Check, Plus, Trash2 } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface GradientGeneratorProps {
  hex?: string;
}

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

const DIRECTIONS = [
  { label: 'Right', value: 'to right' },
  { label: 'Bottom', value: 'to bottom' },
  { label: 'Diagonal', value: 'to bottom right' },
  { label: '45°', value: '45deg' },
  { label: '135°', value: '135deg' },
];

export default function GradientGenerator({ hex = '#8B5CF6' }: GradientGeneratorProps) {
  const { isDark } = useTheme();
  
  // Normalize incoming hex
  const baseColor = useMemo(() => {
    const cleanHex = hex.replace(/^#/, '');
    return `#${cleanHex.padStart(6, '0').slice(0, 6)}`.toUpperCase();
  }, [hex]);

  // Compute complementary color
  const complementaryColor = useMemo(() => {
    const clean = baseColor.replace('#', '');
    const r = 255 - parseInt(clean.substring(0, 2), 16);
    const g = 255 - parseInt(clean.substring(2, 4), 16);
    const b = 255 - parseInt(clean.substring(4, 6), 16);

    const toHex = (num: number) => num.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }, [baseColor]);

  const getMiddleColor = (color1: string, color2: string): string => {
    const c1 = color1.replace('#', '');
    const c2 = color2.replace('#', '');
    
    const r1 = parseInt(c1.substring(0, 2), 16);
    const g1 = parseInt(c1.substring(2, 4), 16);
    const b1 = parseInt(c1.substring(4, 6), 16);
    
    const r2 = parseInt(c2.substring(0, 2), 16);
    const g2 = parseInt(c2.substring(2, 4), 16);
    const b2 = parseInt(c2.substring(4, 6), 16);
    
    const r = Math.round((r1 + r2) / 2);
    const g = Math.round((g1 + g2) / 2);
    const b = Math.round((b1 + b2) / 2);
    
    const toHex = (num: number) => num.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };

  // State
  const [direction, setDirection] = useState('to right');
  const [gradientType, setGradientType] = useState<'linear' | 'radial' | 'conic'>('linear');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Initialize color stops
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { id: '1', color: baseColor, position: 0 },
    { id: '2', color: complementaryColor, position: 100 },
  ]);

  // Update color stops when hex prop changes
  useEffect(() => {
    setColorStops([
      { id: '1', color: baseColor, position: 0 },
      { id: '2', color: complementaryColor, position: 100 },
    ]);
  }, [baseColor, complementaryColor]);

  // Add a new color stop
  const addStop = () => {
    if (colorStops.length >= 5) return;
    const newId = Date.now().toString();
    const lastPosition = colorStops[colorStops.length - 1]?.position || 100;
    const newPosition = Math.min(100, lastPosition);

    setColorStops([
      ...colorStops,
      { id: newId, color: '#3B82F6', position: newPosition },
    ]);
  };

  // Remove a color stop
  const removeStop = (id: string) => {
    if (colorStops.length <= 2) return;
    setColorStops(colorStops.filter((stop) => stop.id !== id));
  };

  // Update stop attributes
  const updateStop = (id: string, key: 'color' | 'position', value: string | number) => {
    setColorStops(
      colorStops.map((stop) => (stop.id === id ? { ...stop, [key]: value } : stop))
    );
  };

  // Build active gradient CSS
  const activeGradientCSS = useMemo(() => {
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
    const stopsString = sortedStops
      .map((stop) => `${stop.color} ${stop.position}%`)
      .join(', ');

    if (gradientType === 'radial') {
      return `radial-gradient(circle at center, ${stopsString})`;
    }
    if (gradientType === 'conic') {
      return `conic-gradient(from 0deg at 50% 50%, ${stopsString})`;
    }
    return `linear-gradient(${direction}, ${stopsString})`;
  }, [colorStops, direction, gradientType]);

  const presetGradients = useMemo(() => {
    const c1 = colorStops[0]?.color || baseColor;
    const c2 = colorStops[colorStops.length - 1]?.color || complementaryColor;

    return [
      { 
        id: 'linear-main', 
        name: 'Linear Directional', 
        css: `linear-gradient(${direction}, ${c1}, ${c2})` 
      },
      { 
        id: 'radial-center', 
        name: 'Soft Radial Focus', 
        css: `radial-gradient(circle at center, ${c1}, ${c2})` 
      },
      { 
        id: 'conic-sweep', 
        name: 'Conic Sweep', 
        css: `conic-gradient(from 180deg at 50% 50%, ${c1}, ${c2}, ${c1})` 
      },
      { 
        id: 'tri-blend', 
        name: 'Three-Stop Linear', 
        css: `linear-gradient(${direction}, ${c1}, ${getMiddleColor(c1, c2)}, ${c2})` 
      },
      { 
        id: 'radial-corner', 
        name: 'Corner Glow', 
        css: `radial-gradient(circle at top left, ${c1}, ${c2})` 
      },
      { 
        id: 'soft-fade', 
        name: 'Soft Multi-Stop', 
        css: `linear-gradient(135deg, ${c1} 0%, ${c2} 50%, ${c1} 100%)` 
      },
    ];
  }, [colorStops, direction, baseColor, complementaryColor, getMiddleColor]);

  // Copy handler
  const handleCopy = async (css: string, id: string) => {
    try {
      await navigator.clipboard.writeText(`background: ${css};`);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy CSS:', err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 font-sans">
      {/* Live Main Gradient Preview */}
      <div className={`relative w-full h-48 sm:h-64 rounded-2xl border shadow-lg overflow-hidden p-6 flex flex-col justify-end transition-all duration-300 ${
        isDark ? 'border-white/10' : 'border-gray-200'
      }`}>
        <div
          className="absolute inset-0 transition-all duration-500 ease-in-out"
          style={{ background: activeGradientCSS }}
        />
        <div className={`relative z-10 flex items-center justify-between backdrop-blur-md p-3.5 rounded-xl border shadow-sm ${
          isDark 
            ? 'bg-black/40 border-white/10' 
            : 'bg-white/90 border-gray-200'
        }`}>
          <code className={`text-xs sm:text-sm font-mono truncate mr-3 ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}>
            background: {activeGradientCSS};
          </code>
          <button
            onClick={() => handleCopy(activeGradientCSS, 'active-main')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-medium rounded-lg transition active:scale-95 flex-shrink-0"
          >
            {copiedId === 'active-main' ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-300" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy CSS</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl border shadow-md ${
        isDark 
          ? 'bg-[#1a1a2e] border-[#2d2d4a]' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Left Column */}
        <div className="space-y-4">
          <label className={`text-xs font-semibold uppercase tracking-wider ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Gradient Style
          </label>
          <div className="flex gap-2">
            {(['linear', 'radial', 'conic'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setGradientType(type)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize border transition ${
                  gradientType === type
                    ? 'bg-[#7c3aed] border-[#7c3aed] text-white'
                    : isDark
                      ? 'bg-[#2d2d4a]/50 border-white/10 text-gray-200 hover:text-white hover:bg-[#2d2d4a]'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {gradientType === 'linear' && (
            <>
              <label className={`text-xs font-semibold uppercase tracking-wider block pt-2 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Direction Angle
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {DIRECTIONS.map((dir) => (
                  <button
                    key={dir.value}
                    onClick={() => setDirection(dir.value)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition ${
                      direction === dir.value
                        ? 'bg-[#7c3aed] border-[#7c3aed] text-white'
                        : isDark
                          ? 'bg-[#2d2d4a]/50 border-white/10 text-gray-200 hover:text-white hover:bg-[#2d2d4a]'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    {dir.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className={`text-xs font-semibold uppercase tracking-wider ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Color Stops ({colorStops.length}/5)
            </label>
            {colorStops.length < 5 && (
              <button
                onClick={addStop}
                className={`flex items-center gap-1 text-xs font-medium transition ${
                  isDark 
                    ? 'text-[#8b5cf6] hover:text-[#a78bfa]' 
                    : 'text-[#7c3aed] hover:text-[#6d28d9]'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stop</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {colorStops.map((stop) => (
              <div
                key={stop.id}
                className={`flex items-center gap-2 p-2 rounded-xl border ${
                  isDark 
                    ? 'bg-[#2d2d4a]/40 border-white/5' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <input
                  type="color"
                  value={stop.color}
                  onChange={(e) => updateStop(stop.id, 'color', e.target.value)}
                  className="w-7 h-7 rounded-lg border-0 bg-transparent cursor-pointer flex-shrink-0"
                />
                <input
                  type="text"
                  value={stop.color.toUpperCase()}
                  onChange={(e) => updateStop(stop.id, 'color', e.target.value)}
                  className={`w-20 text-xs font-mono text-center py-1 rounded border ${
                    isDark 
                      ? 'bg-[#1a1a2e] border-white/10 text-gray-200' 
                      : 'bg-white border-gray-200 text-gray-700'
                  }`}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={stop.position}
                  onChange={(e) => updateStop(stop.id, 'position', Number(e.target.value))}
                  className={`flex-1 cursor-pointer ${
                    isDark ? 'accent-[#8b5cf6]' : 'accent-[#7c3aed]'
                  }`}
                />
                <span className={`text-xs font-mono w-8 text-right ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {stop.position}%
                </span>
                {colorStops.length > 2 && (
                  <button
                    onClick={() => removeStop(stop.id)}
                    className={`p-1 transition ${
                      isDark ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preset Gradients */}
      <div className="space-y-3">
        <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Preset Variations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {presetGradients.map(({ id, name, css }) => (
            <div
              key={id}
              className={`rounded-xl p-3 space-y-2.5 transition shadow-sm hover:shadow-md group ${
                isDark 
                  ? 'bg-[#1a1a2e] border border-[#2d2d4a] hover:border-white/20' 
                  : 'bg-white border border-gray-200 hover:border-[#7c3aed]/30'
              }`}
            >
              <div
                className={`w-full h-28 rounded-lg border shadow-inner transition-all duration-300 group-hover:scale-[1.01] ${
                  isDark ? 'border-white/10' : 'border-gray-200'
                }`}
                style={{ background: css }}
              />
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>{name}</span>
                <button
                  onClick={() => handleCopy(css, id)}
                  className={`p-1.5 rounded-lg transition ${
                    isDark 
                      ? 'hover:bg-[#2d2d4a] text-gray-400 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-400 hover:text-[#7c3aed]'
                  }`}
                  title="Copy CSS code"
                >
                  {copiedId === id ? (
                    <Check className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}