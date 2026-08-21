'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, Palette, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface ColorWheelProps {
  hex: string;
  onColorChange?: (hex: string) => void;
}

interface HarmonyMode {
  id: string;
  label: string;
}

const HARMONY_MODES: HarmonyMode[] = [
  { id: 'analogous', label: 'Analogous' },
  { id: 'monochromatic', label: 'Monochromatic' },
  { id: 'complementary', label: 'Complementary' },
  { id: 'triadic', label: 'Triadic' },
  { id: 'tetradic', label: 'Tetradic' },
  { id: 'square', label: 'Square' },
];

const FORMATS = ['HEX', 'RGB', 'HSL'] as const;
type ColorFormat = (typeof FORMATS)[number];

const CANVAS_SIZE = 280;
const RADIUS = 130;
const CX = CANVAS_SIZE / 2;
const CY = CANVAS_SIZE / 2;

export default function ColorWheel({ hex, onColorChange }: ColorWheelProps) {
  const { isDark } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(80);
  const [lightness, setLightness] = useState(50);
  const [format, setFormat] = useState<ColorFormat>('HSL');
  const [harmonyMode, setHarmonyMode] = useState('analogous');
  const [isFormatOpen, setIsFormatOpen] = useState(false);

  // ✅ Track mouse position for preview
  const [mouseHue, setMouseHue] = useState<number | null>(null);
  const [mouseSat, setMouseSat] = useState<number | null>(null);

  // Sync external hex prop to internal state
  useEffect(() => {
    if (hex) {
      const hsl = hexToHslValues(hex);
      if (hsl) {
        const [h, s, l] = hsl;
        setHue(h);
        setSaturation(s);
        setLightness(l);
      }
    }
  }, [hex]);

  // ✅ Draw color wheel with current lightness
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw the wheel with current lightness
    for (let angle = 0; angle < 360; angle += 0.5) {
      const startAngle = ((angle - 0.5) * Math.PI) / 180;
      const endAngle = ((angle + 0.5) * Math.PI) / 180;

      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.arc(CX, CY, RADIUS, startAngle, endAngle);
      ctx.closePath();

      // ✅ Use current lightness for the wheel
      const gradient = ctx.createRadialGradient(CX, CY, 0, CX, CY, RADIUS);
      gradient.addColorStop(0, `hsl(${angle}, 100%, ${Math.min(lightness + 30, 95)}%)`);
      gradient.addColorStop(0.5, `hsl(${angle}, 100%, ${lightness}%)`);
      gradient.addColorStop(1, `hsl(${angle}, 100%, ${Math.max(lightness - 30, 10)}%)`);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // ✅ Add center highlight for better visibility
    const centerGradient = ctx.createRadialGradient(CX, CY, 0, CX, CY, RADIUS * 0.4);
    centerGradient.addColorStop(0, `rgba(255,255,255,${Math.max(0, 1 - lightness / 100)})`);
    centerGradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(CX, CY, RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = centerGradient;
    ctx.fill();

  }, [lightness]); // ✅ Redraw when lightness changes

  // Get color from mouse position
  const getColorFromPosition = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scale = rect.width / CANVAS_SIZE;

    const x = (clientX - rect.left) / scale;
    const y = (clientY - rect.top) / scale;
    const dx = x - CX;
    const dy = y - CY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > RADIUS) return null;

    const newHue = (Math.atan2(dy, dx) * (180 / Math.PI) + 360) % 360;
    const newSat = Math.min(100, Math.max(0, Math.round((Math.min(dist, RADIUS) / RADIUS) * 100)));

    return { hue: newHue, saturation: newSat };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const color = getColorFromPosition(e.clientX, e.clientY);
    if (color) {
      setMouseHue(color.hue);
      setMouseSat(color.saturation);
    } else {
      setMouseHue(null);
      setMouseSat(null);
    }
  }, [getColorFromPosition]);

  const handleMouseLeave = useCallback(() => {
    setMouseHue(null);
    setMouseSat(null);
  }, []);

  // Pick color on click/drag
  const pickColor = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scale = rect.width / CANVAS_SIZE;

      const x = (clientX - rect.left) / scale;
      const y = (clientY - rect.top) / scale;
      const dx = x - CX;
      const dy = y - CY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > RADIUS) return;

      const newHue = (Math.atan2(dy, dx) * (180 / Math.PI) + 360) % 360;
      const newSat = Math.min(100, Math.max(0, Math.round((Math.min(dist, RADIUS) / RADIUS) * 100)));

      setHue(newHue);
      setSaturation(newSat);

      if (onColorChange) {
        onColorChange(hslToHex(newHue, newSat, lightness));
      }
    },
    [lightness, onColorChange]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    pickColor(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // Update preview on hover
    const color = getColorFromPosition(e.clientX, e.clientY);
    if (color) {
      setMouseHue(color.hue);
      setMouseSat(color.saturation);
    } else {
      setMouseHue(null);
      setMouseSat(null);
    }

    // Pick color when dragging
    if (isDragging) {
      pickColor(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setIsDragging(false);
    }
  };

  // Pin position - shows SELECTED color
  const markerAngle = (hue * Math.PI) / 180;
  const markerRadius = (saturation / 100) * RADIUS;
  const markerX = CX + markerRadius * Math.cos(markerAngle);
  const markerY = CY + markerRadius * Math.sin(markerAngle);

  // Mouse preview position
  const showPreview = mouseHue !== null && mouseSat !== null && !isDragging;
  const previewAngle = showPreview ? (mouseHue * Math.PI) / 180 : 0;
  const previewRadius = showPreview ? (mouseSat / 100) * RADIUS : 0;
  const previewX = CX + previewRadius * Math.cos(previewAngle);
  const previewY = CY + previewRadius * Math.sin(previewAngle);

  // Dynamic harmony calculation
  const harmonyColors = useMemo((): [number, number, number][] => {
    const colors: [number, number, number][] = [];
    const h = hue;
    const s = saturation;
    const l = lightness;

    switch (harmonyMode) {
      case 'analogous':
        [-30, -15, 0, 15, 30].forEach((offset) => {
          colors.push([(h + offset + 360) % 360, s, l]);
        });
        break;
      case 'monochromatic':
        [20, 35, 50, 65, 80].forEach((light) => {
          colors.push([h, s, Math.min(light, 90)]);
        });
        break;
      case 'complementary':
        colors.push([h, s, l]);
        colors.push([(h + 180) % 360, s, l]);
        colors.push([(h + 180) % 360, s, Math.min(l + 15, 90)]);
        colors.push([(h + 180) % 360, Math.max(s - 10, 10), Math.max(l - 10, 10)]);
        colors.push([h, s, Math.min(l + 20, 90)]);
        break;
      case 'triadic':
        [0, 120, 240].forEach((offset) => {
          colors.push([(h + offset) % 360, s, l]);
        });
        break;
      case 'tetradic':
      case 'square':
        [0, 90, 180, 270].forEach((offset) => {
          colors.push([(h + offset) % 360, s, l]);
        });
        break;
      default:
        colors.push([h, s, l]);
    }
    return colors;
  }, [hue, saturation, lightness, harmonyMode]);

  const formatColor = (h: number, s: number, l: number): string => {
    switch (format) {
      case 'HEX':
        return hslToHex(h, s, l);
      case 'RGB': {
        const hexVal = hslToHex(h, s, l);
        const r = parseInt(hexVal.slice(1, 3), 16);
        const g = parseInt(hexVal.slice(3, 5), 16);
        const b = parseInt(hexVal.slice(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
      }
      default:
        return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
    }
  };

  const handleLightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLight = parseInt(e.target.value, 10);
    setLightness(newLight);
    if (onColorChange) {
      onColorChange(hslToHex(hue, saturation, newLight));
    }
  };

  const handleSwatchClick = (h: number, s: number, l: number) => {
    setHue(h);
    setSaturation(s);
    setLightness(l);
    if (onColorChange) {
      onColorChange(hslToHex(h, s, l));
    }
  };

  const currentColor = `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`;

  return (
    <div className="w-full max-w-5xl mx-auto select-none">
      {/* Harmony Modes Buttons */}
      <div className="w-full flex flex-wrap justify-center gap-2 mb-6" role="tablist" aria-label="Color Harmonies">
        {HARMONY_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={harmonyMode === mode.id}
            onClick={() => setHarmonyMode(mode.id)}
            className={`border rounded-lg px-3 py-1.5 text-xs transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7c3aed] ${
              harmonyMode === mode.id
                ? isDark
                  ? 'border-[#8b5cf6] bg-[#8b5cf6]/30 text-white font-semibold'
                  : 'border-[#7c3aed] bg-[#7c3aed]/20 text-gray-800 font-semibold'
                : isDark
                  ? 'border-white/20 text-white/80 hover:border-white/40'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
        {/* Left Side: Color Wheel */}
        <div className="flex flex-col items-center">
          {/* Format Selector & Color Preview */}
          <div className="w-full flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <button
                type="button"
                aria-expanded={isFormatOpen}
                aria-label="Select color format"
                onClick={() => setIsFormatOpen(!isFormatOpen)}
                className={`flex items-center gap-1 text-sm font-medium rounded-md px-2.5 py-1 transition focus:outline-none focus:ring-2 focus:ring-[#7c3aed] ${
                  isDark
                    ? 'text-white/80 border border-white/20 hover:bg-white/5'
                    : 'text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{format}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {isFormatOpen && (
                <div className={`absolute top-full left-0 z-20 mt-1 rounded-lg overflow-hidden min-w-[90px] shadow-lg ${
                  isDark
                    ? 'bg-[#1a1a2e] border border-[#2d2d4a]'
                    : 'bg-white border border-gray-200'
                }`}>
                  {FORMATS.map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => {
                        setFormat(fmt);
                        setIsFormatOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-sm transition ${
                        isDark
                          ? `hover:bg-white/5 ${format === fmt ? 'text-[#8b5cf6] bg-white/5 font-semibold' : 'text-white/80'}`
                          : `hover:bg-gray-50 ${format === fmt ? 'text-[#7c3aed] bg-gray-50 font-semibold' : 'text-gray-700'}`
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div
              className={`w-6 h-6 rounded-md border flex-shrink-0 shadow-sm ${
                isDark ? 'border-white/20' : 'border-gray-200'
              }`}
              style={{ backgroundColor: currentColor }}
            />

            <p className={`text-sm font-mono font-medium flex-1 truncate ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>
              {formatColor(hue, saturation, lightness)}
            </p>
          </div>

          {/* Wheel Canvas Container */}
          <div
            ref={containerRef}
            className="relative w-[280px] h-[280px] cursor-crosshair touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onMouseLeave={handleMouseLeave}
          >
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className={`w-full h-full rounded-full shadow-xl ${
                isDark ? 'border border-white/10' : 'border border-gray-200'
              }`}
            />

            {/* Mouse Preview Ring */}
            {showPreview && (
              <div
                className="absolute w-6 h-6 rounded-full border-2 border-white/80 pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-150"
                style={{
                  left: `${(previewX / CANVAS_SIZE) * 100}%`,
                  top: `${(previewY / CANVAS_SIZE) * 100}%`,
                  backgroundColor: `hsl(${mouseHue}, ${mouseSat}%, ${lightness}%)`,
                  boxShadow: isDark ? '0 0 16px rgba(0,0,0,0.6)' : '0 0 16px rgba(0,0,0,0.15)',
                  opacity: 0.9,
                }}
              />
            )}

            {/* Selected Color Pin */}
            <div
              className="absolute w-4 h-4 rounded-full border-2 border-white pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
              style={{
                left: `${(markerX / CANVAS_SIZE) * 100}%`,
                top: `${(markerY / CANVAS_SIZE) * 100}%`,
                backgroundColor: currentColor,
                boxShadow: isDark
                  ? '0 0 12px rgba(0,0,0,0.8), 0 0 20px rgba(139, 92, 246, 0.4)'
                  : '0 0 12px rgba(0,0,0,0.2), 0 0 20px rgba(124, 58, 237, 0.2)',
                zIndex: 10,
              }}
            />
          </div>

          {/* Lightness Slider */}
          <div className="w-[280px] mt-5 flex flex-col gap-1">
            <label htmlFor="lightness-slider" className={`text-xs flex justify-between ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <span>Dark</span>
              <span>Lightness: {lightness}%</span>
              <span>Light</span>
            </label>
            <input
              id="lightness-slider"
              type="range"
              min="10"
              max="90"
              value={lightness}
              onChange={handleLightnessChange}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#7c3aed] ${
                isDark ? 'accent-[#8b5cf6]' : 'accent-[#7c3aed]'
              }`}
              style={{
                background: `linear-gradient(to right, 
                  hsl(${hue}, ${saturation}%, 10%), 
                  hsl(${hue}, ${saturation}%, 50%), 
                  hsl(${hue}, ${saturation}%, 90%))`,
              }}
            />
          </div>
        </div>

        {/* Right Side: Harmony Palettes */}
        <div className="flex-1 w-full max-w-md">
          <div className={`rounded-xl p-4 shadow-lg ${
            isDark
              ? 'bg-[#1a1a2e] border border-[#2d2d4a]'
              : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <Palette className={`w-4 h-4 ${isDark ? 'text-[#8b5cf6]' : 'text-[#7c3aed]'}`} />
              <h4 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {harmonyMode.charAt(0).toUpperCase() + harmonyMode.slice(1)} Palette
              </h4>
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                ({harmonyColors.length} colors)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {harmonyColors.map(([h, s, l], index) => {
                const swatchColor = `hsl(${h}, ${s}%, ${l}%)`;
                const hexValue = hslToHex(h, s, l);
                const isActive = Math.round(h) === Math.round(hue) && 
                                Math.round(s) === Math.round(saturation) && 
                                Math.round(l) === Math.round(lightness);

                return (
                  <button
                    key={`${harmonyMode}-${Math.round(h)}-${Math.round(s)}-${Math.round(l)}-${index}`}
                    type="button"
                    onClick={() => handleSwatchClick(h, s, l)}
                    className={`group relative flex flex-col items-center p-2 rounded-lg border transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] ${
                      isActive
                        ? isDark
                          ? 'border-[#8b5cf6] bg-[#8b5cf6]/10 shadow-lg shadow-[#8b5cf6]/20'
                          : 'border-[#7c3aed] bg-[#7c3aed]/10 shadow-md shadow-[#7c3aed]/10'
                        : isDark
                          ? 'border-white/10 hover:border-white/30 hover:bg-white/5'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div
                      className="w-full aspect-square rounded-lg shadow-sm transition-all group-hover:shadow-md"
                      style={{ backgroundColor: swatchColor }}
                    />
                    <span className={`text-[10px] font-mono mt-1.5 truncate w-full text-center ${
                      isDark ? 'text-gray-200' : 'text-gray-500'
                    }`}>
                      {hexValue}
                    </span>
                    {isActive && (
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center shadow-sm ${
                        isDark ? 'bg-[#8b5cf6]' : 'bg-[#7c3aed]'
                      }`}>
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Color Info */}
            <div className={`mt-3 p-2 rounded-lg border ${
              isDark
                ? 'bg-[#0f0f1a] border-white/5'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className={isDark ? 'text-gray-200' : 'text-gray-500'}>
                  Selected Output:
                </span>
                <span className={`font-mono font-medium ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  {formatColor(hue, saturation, lightness)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Color Utility Helpers */
function hexToHslValues(hex: string): [number, number, number] | null {
  const cleanHex = hex.replace('#', '');
  if (!/^[a-fA-F0-9]{6}$/i.test(cleanHex)) return null;

  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

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

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const rr = Math.round((r + m) * 255);
  const gg = Math.round((g + m) * 255);
  const bb = Math.round((b + m) * 255);

  return `#${rr.toString(16).padStart(2, '0')}${gg.toString(16).padStart(2, '0')}${bb.toString(16).padStart(2, '0')}`.toUpperCase();
}