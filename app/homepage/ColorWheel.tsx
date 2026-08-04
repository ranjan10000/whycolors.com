// app/homepage/ColorWheel.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, Check, Palette, Sparkles, Copy } from "lucide-react";

type ColorFormatType = "HEX" | "RGB" | "HSL";

const HARMONY_MODES = [
  { id: "analogous", label: "Analogous" },
  { id: "monochromatic", label: "Monochromatic" },
  { id: "complementary", label: "Complementary" },
  { id: "triadic", label: "Triadic" },
  { id: "tetradic", label: "Tetradic" },
  { id: "square", label: "Square" },
];

const FORMATS: ColorFormatType[] = ["HEX", "RGB", "HSL"];

const hslToHex = (h: number, s: number, l: number) => {
  const sNorm = Math.max(0, Math.min(100, s)) / 100;
  const lNorm = Math.max(0, Math.min(100, l)) / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  const rr = Math.round((r + m) * 255);
  const gg = Math.round((g + m) * 255);
  const bb = Math.round((b + m) * 255);

  return `#${rr.toString(16).padStart(2, "0")}${gg.toString(16).padStart(2, "0")}${bb.toString(16).padStart(2, "0")}`.toUpperCase();
};

const hexToHslValues = (hex: string): [number, number, number] | null => {
  const cleanHex = hex.replace("#", "");
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
};

interface ColorWheelProps {
  hex: string;
  onColorChange: (hex: string) => void;
}

export default function ColorWheel({ hex, onColorChange }: ColorWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(80);
  const [lightness, setLightness] = useState(50);
  const [format, setFormat] = useState<ColorFormatType>("HEX");
  const [harmonyMode, setHarmonyMode] = useState("analogous");
  const [isFormatOpen, setIsFormatOpen] = useState(false);
  const [mouseHue, setMouseHue] = useState<number | null>(null);
  const [mouseSat, setMouseSat] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const CANVAS_SIZE = 280;
  const RADIUS = 130;
  const CX = CANVAS_SIZE / 2;
  const CY = CANVAS_SIZE / 2;

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
    const ctx = canvas.getContext("2d");
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
      const centerLight = Math.min(lightness + 30, 95);
      const edgeLight = Math.max(lightness - 30, 10);

      gradient.addColorStop(0, `hsl(${angle}, 100%, ${centerLight}%)`);
      gradient.addColorStop(0.5, `hsl(${angle}, 100%, ${lightness}%)`);
      gradient.addColorStop(1, `hsl(${angle}, 100%, ${edgeLight}%)`);

      ctx.fillStyle = gradient;
      ctx.fill();
    }

    const centerGradient = ctx.createRadialGradient(CX, CY, 0, CX, CY, RADIUS * 0.6);
    centerGradient.addColorStop(0, `rgba(255,255,255,${Math.max(0, 1 - lightness / 100)})`);
    centerGradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.beginPath();
    ctx.arc(CX, CY, RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = centerGradient;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(CX, CY, RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(CX, CY, RADIUS * 0.85, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(CX, CY, RADIUS * 0.95, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    ctx.stroke();
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

  const pickColor = useCallback(
    (clientX: number, clientY: number) => {
      const color = getColorFromPosition(clientX, clientY);
      if (!color) return;

      setHue(color.hue);
      setSaturation(color.saturation);
      onColorChange(hslToHex(color.hue, color.saturation, lightness));
    },
    [getColorFromPosition, lightness, onColorChange]
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

  const handleMouseLeave = useCallback(() => {
    setMouseHue(null);
    setMouseSat(null);
  }, []);

  const handleLightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLight = parseInt(e.target.value, 10);
    setLightness(newLight);
    onColorChange(hslToHex(hue, saturation, newLight));
  };

  const handleSwatchClick = (h: number, s: number, l: number) => {
    setHue(h);
    setSaturation(s);
    setLightness(l);
    onColorChange(hslToHex(h, s, l));
  };

  const handleCopyColor = async (color: string, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(color);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      // Silent fail
    }
  };

  const harmonyColors = (() => {
    const colors: [number, number, number][] = [];
    const h = hue;
    const s = saturation;
    const l = lightness;

    switch (harmonyMode) {
      case "analogous":
        [-30, -15, 0, 15, 30].forEach((offset) => {
          colors.push([(h + offset + 360) % 360, s, l]);
        });
        break;
      case "monochromatic":
        [20, 35, 50, 65, 80].forEach((light) => {
          colors.push([h, s, Math.min(light, 90)]);
        });
        break;
      case "complementary":
        colors.push([h, s, l]);
        colors.push([(h + 180) % 360, s, l]);
        colors.push([(h + 180) % 360, s, Math.min(l + 15, 90)]);
        colors.push([(h + 180) % 360, Math.max(s - 10, 10), Math.max(l - 10, 10)]);
        colors.push([h, s, Math.min(l + 20, 90)]);
        break;
      case "triadic":
        [0, 120, 240].forEach((offset) => {
          colors.push([(h + offset) % 360, s, l]);
        });
        break;
      case "tetradic":
      case "square":
        [0, 90, 180, 270].forEach((offset) => {
          colors.push([(h + offset) % 360, s, l]);
        });
        break;
      default:
        colors.push([h, s, l]);
    }
    return colors;
  })();

  const formatColor = (h: number, s: number, l: number): string => {
    switch (format) {
      case "HEX":
        return hslToHex(h, s, l);
      case "RGB": {
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

  const currentColor = `hsl(${Math.round(hue)}, ${Math.round(saturation)}%, ${Math.round(lightness)}%)`;

  const markerAngle = (hue * Math.PI) / 180;
  const markerRadius = (saturation / 100) * RADIUS;
  const markerX = CX + markerRadius * Math.cos(markerAngle);
  const markerY = CY + markerRadius * Math.sin(markerAngle);

  const showPreview = mouseHue !== null && mouseSat !== null && !isDragging;
  const previewAngle = showPreview ? (mouseHue * Math.PI) / 180 : 0;
  const previewRadius = showPreview ? (mouseSat / 100) * RADIUS : 0;
  const previewX = CX + previewRadius * Math.cos(previewAngle);
  const previewY = CY + previewRadius * Math.sin(previewAngle);

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
          </div>
          <h3 className="font-['Fraunces',serif] text-xl sm:text-2xl font-bold tracking-[-0.03em] text-[#101114] dark:text-[#f7f7f4]">
            Interactive Color Wheel
          </h3>
          <p className="text-sm text-[#686b74] dark:text-[#a8abb4]">
            Pick colors visually and explore harmonies
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFormatOpen(!isFormatOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#101114] dark:text-[#f7f7f4] bg-white/76 dark:bg-[#191a1e]/76 border border-[#101114]/9 dark:border-white/11 rounded-xl px-3 py-2 hover:bg-white/90 dark:hover:bg-[#191a1e]/90 transition shadow-sm"
            >
              <span>{format}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>
            {isFormatOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-30 w-28 bg-white dark:bg-[#191a1e] border border-[#101114]/9 dark:border-white/11 rounded-xl shadow-xl overflow-hidden py-1 backdrop-blur">
                {FORMATS.map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => {
                      setFormat(fmt);
                      setIsFormatOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition ${
                      format === fmt
                        ? "text-[#101114] dark:text-[#f7f7f4] bg-[#101114]/5 dark:bg-white/5 font-semibold"
                        : "text-[#686b74] dark:text-[#a8abb4] hover:bg-[#101114]/5 dark:hover:bg-white/5"
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/76 dark:bg-[#191a1e]/76 border border-[#101114]/9 dark:border-white/11 rounded-xl">
            <div
              className="w-6 h-6 rounded-lg border border-[#101114]/9 dark:border-white/11 shadow-sm"
              style={{ backgroundColor: currentColor }}
            />
            <span className="text-xs font-mono font-semibold text-[#101114] dark:text-[#f7f7f4]">
              {formatColor(hue, saturation, lightness)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mb-6">
        {HARMONY_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setHarmonyMode(mode.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
              harmonyMode === mode.id
                ? "bg-[#101114] text-[#f7f7f4] dark:bg-[#f7f7f4] dark:text-[#101114] shadow-sm"
                : "text-[#686b74] dark:text-[#a8abb4] hover:bg-[#101114]/5 dark:hover:bg-white/5"
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col items-center bg-white/76 dark:bg-[#191a1e]/76 border border-[#101114]/9 dark:border-white/11 rounded-2xl p-6 shadow-sm">
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
              className="w-full h-full rounded-full shadow-lg"
            />

            {showPreview && (
              <div
                className="absolute w-5 h-5 rounded-full border-2 border-white pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 shadow-md"
                style={{
                  left: `${(previewX / CANVAS_SIZE) * 100}%`,
                  top: `${(previewY / CANVAS_SIZE) * 100}%`,
                  backgroundColor: `hsl(${mouseHue}, ${mouseSat}%, ${lightness}%)`,
                  opacity: 0.85,
                }}
              />
            )}

            <div
              className="absolute w-5 h-5 rounded-full border-2 border-white pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-150 shadow-lg"
              style={{
                left: `${(markerX / CANVAS_SIZE) * 100}%`,
                top: `${(markerY / CANVAS_SIZE) * 100}%`,
                backgroundColor: currentColor,
                boxShadow: "0 0 0 2px rgba(16,17,20,0.15), 0 4px 12px rgba(0,0,0,0.25)",
                zIndex: 10,
              }}
            />
          </div>

          <div className="w-full max-w-[280px] mt-5">
            <div className="flex justify-between items-center text-xs text-[#686b74] dark:text-[#a8abb4] font-medium mb-1.5">
              <span>Dark</span>
              <span className="font-semibold text-[#101114] dark:text-[#f7f7f4]">
                Lightness {lightness}%
              </span>
              <span>Light</span>
            </div>
            <input
              id="lightness-slider"
              type="range"
              min="10"
              max="90"
              value={lightness}
              onChange={handleLightnessChange}
              className="w-full h-2 rounded-full appearance-none cursor-pointer focus:outline-none"
              style={{
                background: `linear-gradient(to right, 
                  hsl(${hue}, ${saturation}%, 10%), 
                  hsl(${hue}, ${saturation}%, 50%), 
                  hsl(${hue}, ${saturation}%, 90%))`,
              }}
            />
          </div>
        </div>

        <div className="bg-white/76 dark:bg-[#191a1e]/76 border border-[#101114]/9 dark:border-white/11 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#101114] dark:text-[#f7f7f4]" />
              <h4 className="text-sm font-semibold capitalize text-[#101114] dark:text-[#f7f7f4]">
                {harmonyMode} Palette
              </h4>
            </div>
            <span className="text-xs text-[#686b74] dark:text-[#a8abb4] font-medium">
              {harmonyColors.length} colors
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {harmonyColors.map(([h, s, l], index) => {
              const hexValue = hslToHex(h, s, l);
              const displayColor = formatColor(h, s, l);
              const isActive =
                Math.round(h) === Math.round(hue) &&
                Math.round(s) === Math.round(saturation) &&
                Math.round(l) === Math.round(lightness);

              return (
                <div
                  key={`${harmonyMode}-${Math.round(h)}-${Math.round(s)}-${Math.round(l)}-${index}`}
                  onClick={() => handleSwatchClick(h, s, l)}
                  className={`group relative flex flex-col p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                    isActive
                      ? "border-[#101114] dark:border-[#f7f7f4] bg-[#101114]/5 dark:bg-white/5"
                      : "border-[#101114]/9 dark:border-white/11 hover:border-[#101114]/20 dark:hover:border-white/20"
                  }`}
                >
                  <div
                    className="w-full aspect-video rounded-lg shadow-xs transition-shadow group-hover:shadow-sm"
                    style={{ backgroundColor: `hsl(${h}, ${s}%, ${l}%)` }}
                  />
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[11px] font-mono font-semibold text-[#101114] dark:text-[#f7f7f4] truncate">
                      {hexValue}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopyColor(displayColor, index, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[#101114]/10 dark:hover:bg-white/10"
                      aria-label="Copy color"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3 text-[#686b74] dark:text-[#a8abb4]" />
                      )}
                    </button>
                  </div>
                  {isActive && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#101114] dark:bg-[#f7f7f4] rounded-full flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5 text-[#f7f7f4] dark:text-[#101114]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}