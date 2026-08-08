"use client";

import { useState, useRef, useCallback } from "react";
import { Copy, Sparkles, ImageUp, Download, Contrast } from "lucide-react";

interface ColorFormat {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
  cmyk: { c: number; m: number; y: number; k: number };
}

interface ColorToolsProps {
  mainColor: string;
  colorInfo: ColorFormat;
  onCopy: (text: string) => Promise<void> | void;
  onShowToast: (message: string) => void;
}

export default function ColorTools({ 
  mainColor, 
  colorInfo, 
  onCopy, 
  onShowToast 
}: ColorToolsProps) {
  const [gradientStart, setGradientStart] = useState("#FF5A36");
  const [gradientEnd, setGradientEnd] = useState("#7CC3FF");
  const [gradientDirection, setGradientDirection] = useState("to right");
  const [glassBlur, setGlassBlur] = useState(16);
  const [glassOpacity, setGlassOpacity] = useState(28);
  const [neoDepth, setNeoDepth] = useState(12);
  const [neoDark, setNeoDark] = useState(false);
  const [shadowX, setShadowX] = useState(12);
  const [shadowY, setShadowY] = useState(12);
  const [shadowBlur, setShadowBlur] = useState(24);
  const [shadowOpacity, setShadowOpacity] = useState(20);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imagePalette, setImagePalette] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const hexToRgb = (hex: string) => {
    const clean = hex.replace("#", "");
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return (
      "#" +
      [r, g, b]
        .map((value) =>
          Math.max(0, Math.min(255, Math.round(value)))
            .toString(16)
            .padStart(2, "0")
        )
        .join("")
        .toUpperCase()
    );
  };

  const hslToHex = (h: number, s: number, l: number) => {
    const sNorm = Math.max(0, Math.min(100, s)) / 100;
    const lNorm = Math.max(0, Math.min(100, l)) / 100;
    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = lNorm - c / 2;

    let r = 0, g = 0, b = 0;

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
  };

  const renderColorSwatch = useCallback((color: string, label: string) => {
    const luminance = (hex: string) => {
      const { r, g, b } = hexToRgb(hex);
      return [r, g, b]
        .map((channel) => {
          const value = channel / 255;
          return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
        })
        .reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
    };

    const isLight = luminance(color) > 0.5;
    return (
      <button
        key={color}
        className="swatch-button min-h-28 p-3 text-left flex-1"
        style={{ background: color, color: isLight ? "#101114" : "#FFFFFF" }}
        onClick={() => onCopy(color)}
        aria-label={`Copy ${color}`}
      >
        <span className="block text-xs font-bold">{label}</span>
        <span className="mt-8 block font-mono text-xs">{color}</span>
      </button>
    );
  }, [onCopy]);

  const generatePalette = useCallback(() => {
    const { h, s } = colorInfo.hsl;
    const lightness = [22, 38, 55, 70, 86];
    const values = lightness.map((l, i) => hslToHex(h, Math.max(28, s - i * 5), l));
    return values.map((color, i) => renderColorSwatch(color, ["900", "700", "500", "300", "100"][i]));
  }, [colorInfo.hsl, renderColorSwatch]);

  const updateSystemScales = useCallback(() => {
    const { h, s } = colorInfo.hsl;
    const tailwind = [95, 82, 68, 53, 38].map((l, i) =>
      hslToHex(h, Math.max(30, s - i * 4), l)
    );
    const material = [92, 76, 60, 45, 31].map((l, i) =>
      hslToHex(h, Math.max(35, s - i * 2), l)
    );
    return {
      tailwind: tailwind.map((color, i) => renderColorSwatch(color, ["100", "300", "500", "700", "900"][i])),
      material: material.map((color, i) => renderColorSwatch(color, ["50", "200", "500", "700", "900"][i])),
    };
  }, [colorInfo.hsl, renderColorSwatch]);

  const getGradientCSS = useCallback(() => {
    return `linear-gradient(${gradientDirection}, ${gradientStart}, ${gradientEnd})`;
  }, [gradientDirection, gradientStart, gradientEnd]);

  const getGlassCSS = useCallback(() => {
    const opacity = glassOpacity / 100;
    return `background: rgba(255,255,255,${opacity.toFixed(2)}); backdrop-filter: blur(${glassBlur}px);`;
  }, [glassOpacity, glassBlur]);

  const getNeoCSS = useCallback(() => {
    const surface = neoDark ? "#24262b" : "#e7ebef";
    const darkShade = neoDark ? "#17191d" : "#bec2c6";
    const lightShade = neoDark ? "#31343a" : "#ffffff";
    return `background: ${surface}; box-shadow: ${neoDepth}px ${neoDepth}px ${neoDepth * 2}px ${darkShade}, -${neoDepth}px -${neoDepth}px ${neoDepth * 2}px ${lightShade};`;
  }, [neoDark, neoDepth]);

  const getShadowCSS = useCallback(() => {
    const opacity = shadowOpacity / 100;
    return `box-shadow: ${shadowX}px ${shadowY}px ${shadowBlur}px rgba(16,17,20,${opacity.toFixed(2)});`;
  }, [shadowX, shadowY, shadowBlur, shadowOpacity]);

  const extractImageColors = useCallback((image: HTMLImageElement) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    
    const size = 100;
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(image, 0, 0, size, size);
    const pixels = ctx.getImageData(0, 0, size, size).data;
    
    const buckets: Record<string, number> = {};
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const alpha = pixels[i + 3];
      if (alpha < 30) continue;
      
      const quantR = Math.round(r / 16) * 16;
      const quantG = Math.round(g / 16) * 16;
      const quantB = Math.round(b / 16) * 16;
      const key = rgbToHex(quantR, quantG, quantB);
      buckets[key] = (buckets[key] || 0) + 1;
    }
    
    const colors = Object.entries(buckets)
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0])
      .filter((color, index, list) => index === 0 || color !== list[index - 1])
      .slice(0, 5);
    
    while (colors.length < 5) {
      colors.push("#CCCCCC");
    }
    
    setImagePalette(colors);
  }, []);

  const handleImageUpload = useCallback(
    (file: File) => {
      if (!file) return;
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      
      const img = new Image();
      img.onload = () => {
        extractImageColors(img);
        if (imageRef.current) {
          imageRef.current.src = url;
          imageRef.current.classList.remove("hidden");
        }
        URL.revokeObjectURL(url);
        onShowToast("Colors extracted successfully!");
      };
      img.onerror = () => {
        onShowToast("Error loading image");
      };
      img.src = url;
    },
    [extractImageColors, onShowToast]
  );

  const gradientCSS = getGradientCSS();
  const glassCSS = getGlassCSS();
  const neoCSS = getNeoCSS();
  const shadowCSS = getShadowCSS();
  const scales = updateSystemScales();

  return (
    <>
      {/* Palette Generation */}
      <section id="palette" className="mx-auto mt-16 max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="glass rounded-[2rem] p-6 sm:p-8 bg-white/76 dark:bg-[#191a1e]/76 border border-[#101114]/9 dark:border-white/11 shadow-[0_24px_64px_rgba(19,20,24,0.09)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-[18px]">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#686b74] dark:text-[#a8abb4]">
              Palette
            </p>
            <h2 className="mt-3 font-['Fraunces',serif] text-2xl font-bold tracking-[-0.045em]">
              Generate palette
            </h2>
            <p className="mt-4 leading-relaxed text-[#686b74] dark:text-[#a8abb4]">
              Create a harmonious color palette from your selected color.
            </p>
            <button
              className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#ff5a36] px-5 py-3 font-bold text-white transition-transform hover:-translate-y-0.5 dark:bg-[#ff7e5c]"
              type="button"
              onClick={generatePalette}
            >
              <Sparkles className="h-4 w-4" />
              Generate
            </button>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-[#101114]/9 dark:border-white/11" aria-live="polite">
            <div className="grid min-h-[290px] grid-cols-5">{generatePalette()}</div>
          </div>
        </div>
      </section>

      {/* Gradient Builder */}
      <section id="gradient" className="mx-auto mt-16 max-w-7xl">
        <div className="glass rounded-[2rem] p-6 sm:p-8 bg-white/76 dark:bg-[#191a1e]/76 border border-[#101114]/9 dark:border-white/11 shadow-[0_24px_64px_rgba(19,20,24,0.09)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-[18px]">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#686b74] dark:text-[#a8abb4]">
            Gradient
          </p>
          <h2 className="mt-2 font-['Fraunces',serif] text-2xl font-bold tracking-[-0.045em]">
            Build gradients
          </h2>
          <div className="mt-7 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div
              className="min-h-[260px] rounded-3xl shadow-inner transition-all duration-300"
              style={{ background: gradientCSS }}
            />
            <div className="flex flex-col justify-between gap-6">
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <div>
                  <label className="mb-2 block text-sm font-bold">Start color</label>
                  <div className="flex items-center gap-3 rounded-xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-2">
                    <input
                      className="h-10 w-10 cursor-pointer"
                      type="color"
                      value={gradientStart}
                      onChange={(e) => setGradientStart(e.target.value)}
                    />
                    <span className="font-mono text-sm">{gradientStart}</span>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold">End color</label>
                  <div className="flex items-center gap-3 rounded-xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-2">
                    <input
                      className="h-10 w-10 cursor-pointer"
                      type="color"
                      value={gradientEnd}
                      onChange={(e) => setGradientEnd(e.target.value)}
                    />
                    <span className="font-mono text-sm">{gradientEnd}</span>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold">Direction</label>
                  <select
                    className="w-full rounded-xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] px-3 py-3 text-sm"
                    value={gradientDirection}
                    onChange={(e) => setGradientDirection(e.target.value)}
                  >
                    <option value="to right">To right</option>
                    <option value="to bottom right">To bottom right</option>
                    <option value="to bottom">To bottom</option>
                    <option value="135deg">Diagonal</option>
                  </select>
                </div>
              </div>
              <div className="rounded-2xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#686b74] dark:text-[#a8abb4]">
                  CSS
                </p>
                <div className="flex items-center gap-2">
                  <code className="min-w-0 flex-1 break-all text-sm">{gradientCSS}</code>
                  <button
                    className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10"
                    type="button"
                    onClick={() => onCopy(gradientCSS)}
                    aria-label="Copy gradient CSS"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <button
                className="inline-flex min-h-12 w-fit items-center gap-2 rounded-xl bg-[#ff5a36] px-5 py-3 font-bold text-white transition-transform hover:-translate-y-0.5 dark:bg-[#ff7e5c]"
                type="button"
                onClick={() => {
                  const blob = new Blob([`.gradient {\n  background: ${gradientCSS};\n}\n`], {
                    type: "text/css",
                  });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "whycolors-gradient.css";
                  link.click();
                  URL.revokeObjectURL(url);
                  onShowToast("CSS downloaded");
                }}
              >
                <Download className="h-4 w-4" />
                Download CSS
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Effects */}
      <section id="effects" className="mx-auto mt-16 max-w-7xl">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#686b74] dark:text-[#a8abb4]">
            Effects
          </p>
          <h2 className="mt-2 font-['Fraunces',serif] text-2xl font-bold tracking-[-0.045em]">
            Visual effects
          </h2>
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          {/* Glass Morphism */}
          <article className="glass overflow-hidden rounded-[2rem] bg-white/76 dark:bg-[#191a1e]/76 border border-[#101114]/9 dark:border-white/11 shadow-[0_24px_64px_rgba(19,20,24,0.09)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-[18px]">
            <div
              className="min-h-[240px] grid place-items-center overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #fed8cb, #a9d9fb)",
              }}
            >
              <div
                className="w-[82%] max-w-[310px] p-8 rounded-2xl border border-white/55 shadow-[0_20px_45px_rgba(27,35,48,0.18)] transition-all duration-200"
                style={{
                  background: `rgba(255,255,255,${glassOpacity / 100})`,
                  backdropFilter: `blur(${glassBlur}px)`,
                  WebkitBackdropFilter: `blur(${glassBlur}px)`,
                }}
              >
                <p className="text-sm font-bold uppercase tracking-[0.12em] opacity-70">Glass card</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-[#101114]">
                  Soft, layered depth.
                </p>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold">Glass morphism</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#686b74] dark:text-[#a8abb4]">
                Create modern, frosted glass effects with blur and opacity.
              </p>
              <label className="mt-5 block text-sm font-bold">Blur</label>
              <input
                className="range-input mt-2 w-full accent-[#ff5a36] dark:accent-[#ff7e5c]"
                type="range"
                min="0"
                max="30"
                value={glassBlur}
                onChange={(e) => setGlassBlur(Number(e.target.value))}
              />
              <label className="mt-4 block text-sm font-bold">Opacity</label>
              <input
                className="range-input mt-2 w-full accent-[#ff5a36] dark:accent-[#ff7e5c]"
                type="range"
                min="10"
                max="85"
                value={glassOpacity}
                onChange={(e) => setGlassOpacity(Number(e.target.value))}
              />
              <div className="mt-5 rounded-2xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-3">
                <div className="flex items-center gap-2">
                  <code className="min-w-0 flex-1 break-all text-xs">{glassCSS}</code>
                  <button
                    className="rounded-lg p-2"
                    type="button"
                    onClick={() => onCopy(glassCSS)}
                    aria-label="Copy glass CSS"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Neumorphism */}
          <article className="glass overflow-hidden rounded-[2rem] bg-white/76 dark:bg-[#191a1e]/76 border border-[#101114]/9 dark:border-white/11 shadow-[0_24px_64px_rgba(19,20,24,0.09)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-[18px]">
            <div
              className="min-h-[240px] grid place-items-center transition-all duration-200"
              style={{ background: neoDark ? "#24262b" : "#e7ebef" }}
            >
              <div
                className="w-[150px] h-[150px] grid place-items-center rounded-[28px] transition-all duration-200"
                style={{
                  background: neoDark ? "#24262b" : "#e7ebef",
                  boxShadow: `${neoDepth}px ${neoDepth}px ${neoDepth * 2}px ${neoDark ? "#17191d" : "#bec2c6"}, -${neoDepth}px -${neoDepth}px ${neoDepth * 2}px ${neoDark ? "#31343a" : "#ffffff"}`,
                  color: neoDark ? "#ffffff" : "#101114",
                }}
              >
                <Contrast className="h-8 w-8" />
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-bold">Neumorphism</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#686b74] dark:text-[#a8abb4]">
                Soft, extruded UI elements with subtle depth.
              </p>
              <label className="mt-5 block text-sm font-bold">Depth</label>
              <input
                className="range-input mt-2 w-full accent-[#ff5a36] dark:accent-[#ff7e5c]"
                type="range"
                min="4"
                max="28"
                value={neoDepth}
                onChange={(e) => setNeoDepth(Number(e.target.value))}
              />
              <button
                className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#ff5a36] px-4 py-2 font-bold text-white transition-transform hover:-translate-y-0.5 dark:bg-[#ff7e5c]"
                type="button"
                onClick={() => setNeoDark(!neoDark)}
              >
                <Contrast className="h-4 w-4" />
                Toggle mode
              </button>
              <div className="mt-5 rounded-2xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-3">
                <div className="flex items-center gap-2">
                  <code className="min-w-0 flex-1 break-all text-xs">{neoCSS}</code>
                  <button
                    className="rounded-lg p-2"
                    type="button"
                    onClick={() => onCopy(neoCSS)}
                    aria-label="Copy neumorphism CSS"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Box Shadow */}
          <article className="glass overflow-hidden rounded-[2rem] bg-white/76 dark:bg-[#191a1e]/76 border border-[#101114]/9 dark:border-white/11 shadow-[0_24px_64px_rgba(19,20,24,0.09)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-[18px]">
            <div
              className="min-h-[240px] grid place-items-center"
              style={{
                background: "linear-gradient(135deg, #f8f6f2, #e8e4df)",
              }}
            >
              <div
                className="w-[150px] h-[130px] rounded-2xl bg-white transition-shadow duration-200"
                style={{
                  boxShadow: `${shadowX}px ${shadowY}px ${shadowBlur}px rgba(16,17,20,${shadowOpacity / 100})`,
                }}
              />
            </div>
            <div className="p-6">
              <h3 className="font-bold">Box shadow</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#686b74] dark:text-[#a8abb4]">
                Fine-tune shadow position, blur, and opacity.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold">X</label>
                  <input
                    className="range-input mt-2 w-full accent-[#ff5a36] dark:accent-[#ff7e5c]"
                    type="range"
                    min="-30"
                    max="30"
                    value={shadowX}
                    onChange={(e) => setShadowX(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold">Y</label>
                  <input
                    className="range-input mt-2 w-full accent-[#ff5a36] dark:accent-[#ff7e5c]"
                    type="range"
                    min="-30"
                    max="30"
                    value={shadowY}
                    onChange={(e) => setShadowY(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold">Blur</label>
                  <input
                    className="range-input mt-2 w-full accent-[#ff5a36] dark:accent-[#ff7e5c]"
                    type="range"
                    min="0"
                    max="60"
                    value={shadowBlur}
                    onChange={(e) => setShadowBlur(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold">Opacity</label>
                  <input
                    className="range-input mt-2 w-full accent-[#ff5a36] dark:accent-[#ff7e5c]"
                    type="range"
                    min="5"
                    max="50"
                    value={shadowOpacity}
                    onChange={(e) => setShadowOpacity(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-3">
                <div className="flex items-center gap-2">
                  <code className="min-w-0 flex-1 break-all text-xs">{shadowCSS}</code>
                  <button
                    className="rounded-lg p-2"
                    type="button"
                    onClick={() => onCopy(shadowCSS)}
                    aria-label="Copy box shadow CSS"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Color Scales */}
      <section id="color-scales" className="mx-auto mt-16 max-w-7xl">
        <div className="glass rounded-[2rem] p-6 sm:p-8 bg-white/76 dark:bg-[#191a1e]/76 border border-[#101114]/9 dark:border-white/11 shadow-[0_24px_64px_rgba(19,20,24,0.09)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-[18px]">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#686b74] dark:text-[#a8abb4]">
                Scales
              </p>
              <h2 className="mt-2 font-['Fraunces',serif] text-2xl font-bold tracking-[-0.045em]">
                Color scales
              </h2>
            </div>
            <p className="text-sm text-[#686b74] dark:text-[#a8abb4]">
              Click any swatch to copy
            </p>
          </div>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="font-bold">Tailwind</h3>
              <div className="mt-4 grid grid-cols-5 overflow-hidden rounded-2xl border border-[#101114]/9 dark:border-white/11">
                {scales.tailwind}
              </div>
            </div>
            <div>
              <h3 className="font-bold">Material</h3>
              <div className="mt-4 grid grid-cols-5 overflow-hidden rounded-2xl border border-[#101114]/9 dark:border-white/11">
                {scales.material}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Palette Extractor */}
      <section id="image-palette" className="mx-auto mt-16 max-w-7xl">
        <div className="glass rounded-[2rem] p-6 sm:p-8 bg-white/76 dark:bg-[#191a1e]/76 border border-[#101114]/9 dark:border-white/11 shadow-[0_24px_64px_rgba(19,20,24,0.09)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-[18px]">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#686b74] dark:text-[#a8abb4]">
                Extractor
              </p>
              <h2 className="mt-2 font-['Fraunces',serif] text-2xl font-bold tracking-[-0.045em]">
                Image palette
              </h2>
              <p className="mt-4 leading-relaxed text-[#686b74] dark:text-[#a8abb4]">
                Upload an image to extract its dominant colors.
              </p>
              <button
                className="mt-7 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-[#ff5a36] px-5 py-3 font-bold text-white transition-transform hover:-translate-y-0.5 dark:bg-[#ff7e5c]"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageUp className="h-4 w-4" />
                Upload image
              </button>
              <input
                ref={fileInputRef}
                id="image-upload"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
              {uploadedImage && (
                <button
                  className="mt-3 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl bg-gray-200 px-4 py-2 text-sm font-bold text-[#101114] transition-colors hover:bg-gray-300 dark:bg-[#2a2b30] dark:text-[#f7f7f4] dark:hover:bg-[#3a3b40]"
                  type="button"
                  onClick={() => {
                    setUploadedImage(null);
                    setImagePalette([]);
                    if (imageRef.current) {
                      imageRef.current.classList.add("hidden");
                      imageRef.current.src = "";
                    }
                  }}
                >
                  Clear image
                </button>
              )}
            </div>
            <div>
              <div className="grid min-h-[220px] place-items-center overflow-hidden rounded-3xl border border-dashed border-[#101114]/9 dark:border-white/11 bg-black/[0.03] p-4 dark:bg-white/[0.03]">
                {uploadedImage ? (
                  <img
                    ref={imageRef}
                    className="max-h-[290px] w-full rounded-2xl object-contain"
                    src={uploadedImage}
                    alt="Uploaded image"
                  />
                ) : (
                  <p className="text-center text-sm text-[#686b74] dark:text-[#a8abb4]">
                    Upload an image to extract colors
                  </p>
                )}
              </div>
              <div className="mt-5 grid grid-cols-5 overflow-hidden rounded-2xl border border-[#101114]/9 dark:border-white/11">
                {imagePalette.length > 0 ? (
                  imagePalette.map((color, i) =>
                    renderColorSwatch(color, `${i + 1}`)
                  )
                ) : (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="min-h-28 bg-[#e5e5e5] dark:bg-[#2a2b30] flex items-center justify-center text-xs text-[#686b74] dark:text-[#a8abb4]"
                    >
                      Empty
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}