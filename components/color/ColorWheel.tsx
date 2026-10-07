'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, Palette, Check, Copy } from 'lucide-react';
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

const CANVAS_SIZE = 300;
const RADIUS = 140;
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
  const [format, setFormat] = useState<ColorFormat>('HEX');
  const [harmonyMode, setHarmonyMode] = useState('analogous');
  const [isFormatOpen, setIsFormatOpen] = useState(false);
  const [mouseHue, setMouseHue] = useState<number | null>(null);
  const [mouseSat, setMouseSat] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    for (let angle = 0; angle < 360; angle += 0.5) {
      const startAngle = ((angle - 0.5) * Math.PI) / 180;
      const endAngle = ((angle + 0.5) * Math.PI) / 180;

      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.arc(CX, CY, RADIUS, startAngle, endAngle);
      ctx.closePath();

      const gradient = ctx.createRadialGradient(CX, CY, 0, CX, CY, RADIUS);
      gradient.addColorStop(0, `hsl(${angle}, 100%, ${Math.min(lightness + 30, 95)}%)`);
      gradient.addColorStop(0.5, `hsl(${angle}, 100%, ${lightness}%)`);
      gradient.addColorStop(1, `hsl(${angle}, 100%, ${Math.max(lightness - 30, 10)}%)`);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    const centerGradient = ctx.createRadialGradient(CX, CY, 0, CX, CY, RADIUS * 0.4);
    centerGradient.addColorStop(0, `rgba(255,255,255,${Math.max(0, 1 - lightness / 100) * 0.6})`);
    centerGradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(CX, CY, RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = centerGradient;
    ctx.fill();
  }, [lightness]);

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

  const handleMouseLeave = useCallback(() => {
    setMouseHue(null);
    setMouseSat(null);
  }, []);

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
    const color = getColorFromPosition(e.clientX, e.clientY);
    if (color) {
      setMouseHue(color.hue);
      setMouseSat(color.saturation);
    } else {
      setMouseHue(null);
      setMouseSat(null);
    }

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

  const markerAngle = (hue * Math.PI) / 180;
  const markerRadius = (saturation / 100) * RADIUS;
  const markerX = CX + markerRadius * Math.cos(markerAngle);
  const markerY = CY + markerRadius * Math.sin(markerAngle);

  const showPreview = mouseHue !== null && mouseSat !== null && !isDragging;
  const previewAngle = showPreview ? (mouseHue * Math.PI) / 180 : 0;
  const previewRadius = showPreview ? (mouseSat / 100) * RADIUS : 0;
  const previewX = CX + previewRadius * Math.cos(previewAngle);
  const previewY = CY + previewRadius * Math.sin(previewAngle);

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

  const handleCopyColor = async (color: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(color);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      // silent fail
    }
  };

  const currentColor = `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`;
  const currentHex = hslToHex(hue, saturation, lightness);

  // Reusable card style
  const cardStyle = isDark
    ? 'bg-[#0f0f1a] border border-white/[0.06]'
    : 'bg-white border border-gray-200/70';

  const mutedText = isDark ? 'text-gray-400' : 'text-gray-500';
  const strongText = isDark ? 'text-white' : 'text-gray-900';

  return (
    <div className="w-full max-w-6xl mx-auto select-none">

      {/* ============ HEADER ============ */}
      <div className="text-center mb-8">
        <p className={`text-base ${mutedText}`}>
          Click or drag to pick colors. Explore harmonies below.
        </p>
      </div>

      {/* ============ HARMONY MODE TABS ============ */}
      <div
        className="w-full flex flex-wrap justify-center gap-2 mb-8"
        role="tablist"
        aria-label="Color Harmonies"
      >
        {HARMONY_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={harmonyMode === mode.id}
            onClick={() => setHarmonyMode(mode.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] ${
              harmonyMode === mode.id
                ? isDark
                  ? 'bg-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/30'
                  : 'bg-[#7c3aed] text-white shadow-lg shadow-[#7c3aed]/30'
                : isDark
                  ? 'bg-white/[0.04] text-gray-300 hover:bg-white/[0.08]'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* ============ MAIN GRID ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ============ LEFT: COLOR WHEEL CARD ============ */}
        <div className={`lg:col-span-3 rounded-3xl p-6 sm:p-8 ${cardStyle}`}>

          {/* Top row: hex display + format picker */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl shadow-lg ${isDark ? 'ring-1 ring-white/10' : 'ring-1 ring-black/5'}`}
                style={{ backgroundColor: currentColor }}
              />
              <div>
                <div className={`text-xs uppercase tracking-wider font-medium ${mutedText}`}>
                  Selected
                </div>
                <div className={`text-xl font-mono font-bold ${strongText}`}>
                  {currentHex}
                </div>
              </div>
            </div>

            {/* Format dropdown */}
            <div className="relative">
              <button
                type="button"
                aria-expanded={isFormatOpen}
                aria-label="Select color format"
                onClick={() => setIsFormatOpen(!isFormatOpen)}
                className={`flex items-center gap-1.5 text-sm font-medium rounded-full px-3.5 py-2 transition focus:outline-none focus:ring-2 focus:ring-[#7c3aed] ${
                  isDark
                    ? 'bg-white/[0.06] text-white hover:bg-white/[0.1]'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                <span>{format}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {isFormatOpen && (
                <div
                  className={`absolute top-full right-0 z-20 mt-2 rounded-xl overflow-hidden min-w-[110px] shadow-xl ${
                    isDark
                      ? 'bg-[#1a1a2e] border border-[#2d2d4a]'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  {FORMATS.map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => {
                        setFormat(fmt);
                        setIsFormatOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition ${
                        isDark
                          ? `hover:bg-white/5 ${format === fmt ? 'text-[#a78bfa] bg-white/5 font-semibold' : 'text-gray-300'}`
                          : `hover:bg-gray-50 ${format === fmt ? 'text-[#7c3aed] bg-gray-50 font-semibold' : 'text-gray-700'}`
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Wheel */}
          <div className="flex flex-col items-center">
            <div
              ref={containerRef}
              className="relative cursor-crosshair touch-none"
              style={{ width: CANVAS_SIZE, height: CANVAS_SIZE, maxWidth: '100%' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onMouseLeave={handleMouseLeave}
            >
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className={`w-full h-full rounded-full ${
                  isDark
                    ? 'shadow-[0_0_60px_-15px_rgba(139,92,246,0.3)]'
                    : 'shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)]'
                }`}
              />

              {/* Mouse preview */}
              {showPreview && (
                <div
                  className="absolute w-6 h-6 rounded-full border-2 border-white pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 shadow-lg"
                  style={{
                    left: `${(previewX / CANVAS_SIZE) * 100}%`,
                    top: `${(previewY / CANVAS_SIZE) * 100}%`,
                    backgroundColor: `hsl(${mouseHue}, ${mouseSat}%, ${lightness}%)`,
                    opacity: 0.9,
                  }}
                />
              )}

              {/* Current marker */}
              <div
                className="absolute w-5 h-5 rounded-full border-[3px] border-white pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-150"
                style={{
                  left: `${(markerX / CANVAS_SIZE) * 100}%`,
                  top: `${(markerY / CANVAS_SIZE) * 100}%`,
                  backgroundColor: currentColor,
                  boxShadow: isDark
                    ? '0 0 0 1px rgba(255,255,255,0.2), 0 4px 14px rgba(0,0,0,0.6)'
                    : '0 0 0 1px rgba(0,0,0,0.1), 0 4px 14px rgba(0,0,0,0.25)',
                  zIndex: 10,
                }}
              />
            </div>

            {/* Lightness slider */}
            <div className="w-full max-w-[300px] mt-6">
              <div className={`flex justify-between items-center text-xs font-medium mb-2 ${mutedText}`}>
                <span>Dark</span>
                <span className={strongText}>Lightness · {lightness}%</span>
                <span>Light</span>
              </div>
              <input
                id="lightness-slider"
                type="range"
                min="10"
                max="90"
                value={lightness}
                onChange={handleLightnessChange}
                className={`w-full h-3 rounded-full appearance-none cursor-pointer focus:outline-none ${isDark ? 'accent-[#8b5cf6]' : 'accent-[#7c3aed]'}`}
                style={{
                  background: `linear-gradient(to right, 
                    hsl(${hue}, ${saturation}%, 10%), 
                    hsl(${hue}, ${saturation}%, 50%), 
                    hsl(${hue}, ${saturation}%, 90%))`,
                }}
              />
            </div>
          </div>

          {/* Three format values */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
            {[
              { label: 'HEX', value: hslToHex(hue, saturation, lightness) },
              {
                label: 'RGB',
                value: (() => {
                  const hv = hslToHex(hue, saturation, lightness);
                  const r = parseInt(hv.slice(1, 3), 16);
                  const g = parseInt(hv.slice(3, 5), 16);
                  const b = parseInt(hv.slice(5, 7), 16);
                  return `${r}, ${g}, ${b}`;
                })(),
              },
              {
                label: 'HSL',
                value: `${Math.round(hue)}°, ${Math.round(saturation)}%, ${Math.round(lightness)}%`,
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className={`rounded-xl p-3 text-center transition ${
                  isDark ? 'bg-white/[0.04]' : 'bg-gray-50'
                }`}
              >
                <div className={`text-[11px] uppercase tracking-wider font-semibold mb-1 ${mutedText}`}>
                  {label}
                </div>
                <div className={`text-sm font-mono font-medium truncate ${strongText}`}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============ RIGHT: HARMONY PALETTE CARD ============ */}
        <div className={`lg:col-span-2 rounded-3xl p-6 sm:p-8 ${cardStyle}`}>
          <div className="flex items-center gap-2 mb-5">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-[#8b5cf6]/15' : 'bg-[#7c3aed]/10'}`}>
              <Palette className={`w-5 h-5 ${isDark ? 'text-[#a78bfa]' : 'text-[#7c3aed]'}`} />
            </div>
            <div>
              <h3 className={`text-base font-semibold capitalize ${strongText}`}>
                {harmonyMode} Palette
              </h3>
              <p className={`text-xs ${mutedText}`}>
                {harmonyColors.length} harmonious colors
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {harmonyColors.map(([h, s, l], index) => {
              const hexValue = hslToHex(h, s, l);
              const swatchColor = `hsl(${h}, ${s}%, ${l}%)`;
              const isActive =
                Math.round(h) === Math.round(hue) &&
                Math.round(s) === Math.round(saturation) &&
                Math.round(l) === Math.round(lightness);
              const isCopied = copiedIndex === index;

              return (
                <div
                  key={`${harmonyMode}-${index}-${hexValue}`}
                  className={`group flex items-center gap-3 p-2 rounded-2xl cursor-pointer transition-all ${
                    isActive
                      ? isDark
                        ? 'ring-2 ring-[#8b5cf6] bg-[#8b5cf6]/[0.08]'
                        : 'ring-2 ring-[#7c3aed] bg-[#7c3aed]/[0.06]'
                      : isDark
                        ? 'hover:bg-white/[0.04]'
                        : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSwatchClick(h, s, l)}
                >
                  {/* Big swatch */}
                  <div
                    className={`w-14 h-14 rounded-xl flex-shrink-0 shadow-sm ${
                      isDark ? 'ring-1 ring-white/10' : 'ring-1 ring-black/5'
                    }`}
                    style={{ backgroundColor: swatchColor }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-mono font-semibold truncate ${strongText}`}>
                      {hexValue}
                    </div>
                    <div className={`text-xs truncate ${mutedText}`}>
                      hsl({Math.round(h)}, {Math.round(s)}%, {Math.round(l)}%)
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {isActive && (
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isDark ? 'bg-[#8b5cf6]' : 'bg-[#7c3aed]'}`}>
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleCopyColor(hexValue, index, e)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition opacity-0 group-hover:opacity-100 focus:opacity-100 ${
                        isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'
                      }`}
                      aria-label="Copy hex"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className={`w-4 h-4 ${mutedText}`} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Palette preview strip at bottom */}
          <div className="mt-6">
            <div className={`text-xs uppercase tracking-wider font-semibold mb-2 ${mutedText}`}>
              Full Palette
            </div>
            <div className="flex rounded-xl overflow-hidden h-10 ring-1 ring-black/5 dark:ring-white/10">
              {harmonyColors.map(([h, s, l], i) => (
                <div
                  key={i}
                  className="flex-1 transition-all hover:flex-[1.5]"
                  style={{ backgroundColor: `hsl(${h}, ${s}%, ${l}%)` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== Color Utility Helpers ==================== */

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