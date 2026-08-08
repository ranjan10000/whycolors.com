// app/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Palette, Moon, Sun, Copy } from "lucide-react";
import ColorWheel from "./homepage/ColorWheel";
import ColorInfo from "./homepage/ColorInfo";
import ColorTools from "./homepage/ColorTools";
import ContrastChecker from "./homepage/ContrastChecker";

type ColorFormat = {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
  cmyk: { c: number; m: number; y: number; k: number };
};

const hexToRgb = (hex: string) => {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
};

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const rgbToHsv = (r: number, g: number, b: number) => {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  return { h, s: Math.round(max === 0 ? 0 : (d / max) * 100), v: Math.round(max * 100) };
};

const rgbToCmyk = (r: number, g: number, b: number) => {
  const k = 1 - Math.max(r / 255, g / 255, b / 255);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - r / 255 - k) / (1 - k)) * 100),
    m: Math.round(((1 - g / 255 - k) / (1 - k)) * 100),
    y: Math.round(((1 - b / 255 - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
};

const getColorInfo = (hex: string): ColorFormat => {
  const { r, g, b } = hexToRgb(hex);
  return {
    hex: hex.toUpperCase(),
    rgb: { r, g, b },
    hsl: rgbToHsl(r, g, b),
    hsv: rgbToHsv(r, g, b),
    cmyk: rgbToCmyk(r, g, b),
  };
};

export default function Home() {
  const [mainColor, setMainColor] = useState("#FF5A36");
  const [colorInfo, setColorInfo] = useState<ColorFormat>(() =>
    getColorInfo("#FF5A36")
  );
  const [isDark, setIsDark] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 1700);
  }, []);

  const copyText = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        showToast("Copied to clipboard");
      } catch {
        showToast("Copy unavailable");
      }
    },
    [showToast]
  );

  const updateColorInfo = useCallback(
    (hex: string) => {
      const info = getColorInfo(hex);
      setColorInfo(info);
      setMainColor(hex);
    },
    []
  );

  const handleColorChange = useCallback(
    (hex: string) => {
      updateColorInfo(hex);
    },
    [updateColorInfo]
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className="min-h-screen w-full bg-[#f7f7f4] text-[#101114] transition-colors dark:bg-[#0d0e10] dark:text-[#f7f7f4]">
      <div className="fixed top-[-13rem] left-[-12rem] h-96 w-96 rounded-full bg-[#ff896f] opacity-20 blur-[70px] pointer-events-none" />
      <div className="fixed right-[-13rem] bottom-[-14rem] h-96 w-96 rounded-full bg-[#7ad6ff] opacity-20 blur-[70px] pointer-events-none" />
      <main id="top" className="w-full px-4 pb-16 pt-12 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl animate-[rise_0.65s_both]">
            <p className="mb-4 inline-flex rounded-full border border-[#101114]/9 bg-white/45 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#686b74] dark:border-white/11 dark:bg-white/5 dark:text-[#a8abb4]">
              whycolors.com
            </p>
            <h1 className="font-['Fraunces',serif] max-w-3xl text-4xl leading-[0.98] tracking-[-0.05em] sm:text-5xl lg:text-6xl">
              Build better <br className="sm:hidden" />
              color systems
            </h1>
            <p className="mt-5 max-w-2xl leading-relaxed text-[#686b74] dark:text-[#a8abb4]">
              Premium color tools for designers and developers. Pick, convert, and fine-tune
              colors in real time.
            </p>
          </div>

          {/* Color Picker Section */}
          <section id="color-picker" className="mt-9 glass overflow-hidden rounded-[2rem] bg-white/76 dark:bg-[#191a1e]/76 border border-[#101114]/9 dark:border-white/11 shadow-[0_24px_64px_rgba(19,20,24,0.09)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-[18px] animate-[rise_0.65s_both] delay-100">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              <div className="relative min-h-[360px] overflow-hidden bg-[#1a1a1d] p-6 sm:p-9">
                <div
                  className="absolute inset-0 opacity-75"
                  style={{
                    background: `radial-gradient(circle at 20% 20%, #fcd36b 0%, transparent 30%), radial-gradient(circle at 78% 22%, #ff6f61 0%, transparent 32%), radial-gradient(circle at 60% 80%, #7cc3ff 0%, transparent 36%), linear-gradient(130deg, #241f34, #12252c)`,
                  }}
                />
                <div className="relative flex h-full min-h-[330px] flex-col justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/65">
                      Interactive
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-white">Color picker</h2>
                  </div>
                  <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div
                      className="h-40 w-40 rounded-full border-[10px] border-white/20 shadow-2xl transition-colors duration-300 sm:h-48 sm:w-48"
                      style={{ backgroundColor: mainColor }}
                    />
                    <div className="rounded-2xl bg-black/20 p-3 backdrop-blur">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-white/70">
                        Choose color
                      </label>
                      <input
                        className="h-14 w-14 rounded-full cursor-pointer"
                        type="color"
                        value={mainColor}
                        onChange={(e) => updateColorInfo(e.target.value)}
                        aria-label="Choose a color"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-9">
                <div className="mb-7 flex items-center justify-between gap-5">
                  <div>
                    <p className="font-medium text-[#686b74] dark:text-[#a8abb4]">Live value</p>
                    <p className="mt-1 text-4xl font-bold tracking-[-0.04em]">{colorInfo.hex}</p>
                  </div>
                  <button
                    className="copy-btn inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#101114] px-5 py-3 text-sm font-bold text-[#f7f7f4] hover:opacity-85 dark:bg-[#f7f7f4] dark:text-[#101114]"
                    type="button"
                    onClick={() => copyText(colorInfo.hex)}
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#686b74] dark:text-[#a8abb4]">
                      RGB
                    </p>
                    <p className="mt-2 font-mono text-sm font-semibold">
                      rgb({colorInfo.rgb.r}, {colorInfo.rgb.g}, {colorInfo.rgb.b})
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#686b74] dark:text-[#a8abb4]">
                      HSL
                    </p>
                    <p className="mt-2 font-mono text-sm font-semibold">
                      hsl({colorInfo.hsl.h}, {colorInfo.hsl.s}%, {colorInfo.hsl.l}%)
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#686b74] dark:text-[#a8abb4]">
                      HSV
                    </p>
                    <p className="mt-2 font-mono text-sm font-semibold">
                      hsv({colorInfo.hsv.h}, {colorInfo.hsv.s}%, {colorInfo.hsv.v}%)
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#686b74] dark:text-[#a8abb4]">
                      CMYK
                    </p>
                    <p className="mt-2 font-mono text-sm font-semibold">
                      cmyk({colorInfo.cmyk.c}, {colorInfo.cmyk.m}, {colorInfo.cmyk.y}, {colorInfo.cmyk.k})
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-4 sm:col-span-2">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#686b74] dark:text-[#a8abb4]">
                      CSS variable
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="truncate font-mono text-sm font-semibold">
                        --brand-color: {colorInfo.hex};
                      </p>
                      <button
                        className="rounded-lg p-2 text-[#686b74] hover:bg-black/5 dark:hover:bg-white/10"
                        type="button"
                        onClick={() => copyText(`--brand-color: ${colorInfo.hex};`)}
                        aria-label="Copy CSS variable"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Color Wheel */}
          <section id="color-wheel" className="mt-9 glass overflow-hidden rounded-[2rem] bg-white/76 dark:bg-[#191a1e]/76 border border-[#101114]/9 dark:border-white/11 shadow-[0_24px_64px_rgba(19,20,24,0.09)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-[18px] animate-[rise_0.65s_both] delay-100">
            <div className="p-6 sm:p-9">
              <div className="flex flex-col items-center gap-6">
                <div className="w-full max-w-3xl">
                  <ColorWheel 
                    hex={mainColor} 
                    onColorChange={handleColorChange}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Color Info */}
          <ColorInfo colorInfo={colorInfo} onCopy={copyText} />

          {/* Color Tools */}
          <ColorTools 
            mainColor={mainColor}
            colorInfo={colorInfo}
            onCopy={copyText}
            onShowToast={showToast}
          />

          {/* Contrast Checker */}
          <ContrastChecker />
        </div>
      </main>
      <div
        className={`pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#101114] px-4 py-3 text-sm font-bold text-white shadow-xl transition-all duration-300 ${
          toastMessage ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
        }`}
        role="status"
        aria-live="polite"
      >
        {toastMessage}
      </div>
    </div>
  );
}