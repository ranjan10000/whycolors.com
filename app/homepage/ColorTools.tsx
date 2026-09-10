"use client";

import { useState, useCallback } from "react";
import { Sparkles } from "lucide-react";
import ImageColorExtractor from "./ImageColorExtractor";
import GlassMorphism from "./GlassMorphism";
import Neumorphism from "./Neumorphism";
import BoxShadow from "./BoxShadow";
import GradientBuilder from "./GradientBuilder";
import ImagePaletteExtractor from "./ImagePaletteExtractor";

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
  onShowToast,
}: ColorToolsProps) {
  const hexToRgb = (hex: string) => {
    const clean = hex.replace("#", "");
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
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

    return `#${rr.toString(16).padStart(2, "0")}${gg
      .toString(16)
      .padStart(2, "0")}${bb.toString(16).padStart(2, "0")}`.toUpperCase();
  };

  const renderColorSwatch = useCallback(
    (color: string, label: string, name?: string) => {
      const luminance = (hex: string) => {
        const { r, g, b } = hexToRgb(hex);
        return [r, g, b]
          .map((channel) => {
            const value = channel / 255;
            return value <= 0.03928
              ? value / 12.92
              : Math.pow((value + 0.055) / 1.055, 2.4);
          })
          .reduce(
            (total, value, index) =>
              total + value * [0.2126, 0.7152, 0.0722][index],
            0
          );
      };

      const isLight = luminance(color) > 0.5;
      return (
        <button
          key={`${color}-${label}`}
          className="swatch-button min-h-28 p-3 text-left flex-1"
          style={{ background: color, color: isLight ? "#101114" : "#FFFFFF" }}
          onClick={() => onCopy(color)}
          aria-label={`Copy ${name ?? color}`}
        >
          <span className="block text-xs font-bold">{label}</span>
          {name && (
            <span className="mt-1 block truncate text-[11px] font-semibold">
              {name}
            </span>
          )}
          <span className="mt-4 block font-mono text-xs">{color}</span>
        </button>
      );
    },
    [onCopy]
  );

  const generatePalette = useCallback(() => {
    const { h, s } = colorInfo.hsl;
    const lightness = [22, 38, 55, 70, 86];
    const values = lightness.map((l, i) =>
      hslToHex(h, Math.max(28, s - i * 5), l)
    );
    return values.map((color, i) =>
      renderColorSwatch(color, ["900", "700", "500", "300", "100"][i])
    );
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
      tailwind: tailwind.map((color, i) =>
        renderColorSwatch(color, ["100", "300", "500", "700", "900"][i])
      ),
      material: material.map((color, i) =>
        renderColorSwatch(color, ["50", "200", "500", "700", "900"][i])
      ),
    };
  }, [colorInfo.hsl, renderColorSwatch]);

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
          <div
            className="overflow-hidden rounded-[2rem] border border-[#101114]/9 dark:border-white/11"
            aria-live="polite"
          >
            <div className="grid min-h-[290px] grid-cols-5">
              {generatePalette()}
            </div>
          </div>
        </div>
      </section>

      <GradientBuilder
        color={mainColor}
        onCopy={onCopy}
        onShowToast={onShowToast}
      />

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
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
          <GlassMorphism color={mainColor} onCopy={onCopy} onShowToast={onShowToast} />
          <Neumorphism color={mainColor} onCopy={onCopy} onShowToast={onShowToast} />
          <BoxShadow color={mainColor} onCopy={onCopy} onShowToast={onShowToast} />
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

      {/* ✅ Image Palette Extractor — separate component */}
      <ImagePaletteExtractor onCopy={onCopy} onShowToast={onShowToast} />

      <section id="image-color-extractor" className="mx-auto mt-16 max-w-7xl">
        <div className="glass rounded-[2rem] p-6 sm:p-8 bg-white/76 dark:bg-[#191a1e]/76 border border-[#101114]/9 dark:border-white/11 shadow-[0_24px_64px_rgba(19,20,24,0.09)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-[18px]">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#686b74] dark:text-[#a8abb4]">
            Extractor
          </p>
          <h2 className="mt-2 font-['Fraunces',serif] text-2xl font-bold tracking-[-0.045em]">
            Image Color Extractor & Palette Builder
          </h2>
          <ImageColorExtractor />
        </div>
      </section>
    </>
  );
}