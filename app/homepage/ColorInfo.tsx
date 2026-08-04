"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface ColorFormat {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
  cmyk: { c: number; m: number; y: number; k: number };
}

interface ColorInfoProps {
  colorInfo: ColorFormat;
  onCopy: (text: string) => Promise<void> | void;
}

export default function ColorInfo({ colorInfo, onCopy }: ColorInfoProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    await onCopy(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const formatRGB = `rgb(${colorInfo.rgb.r}, ${colorInfo.rgb.g}, ${colorInfo.rgb.b})`;
  const formatHSL = `hsl(${colorInfo.hsl.h}, ${colorInfo.hsl.s}%, ${colorInfo.hsl.l}%)`;
  const formatCMYK = `cmyk(${colorInfo.cmyk.c}, ${colorInfo.cmyk.m}, ${colorInfo.cmyk.y}, ${colorInfo.cmyk.k})`;
  const formatHSV = `hsv(${colorInfo.hsv.h}, ${colorInfo.hsv.s}%, ${colorInfo.hsv.v}%)`;

  return (
    <section className="mt-9 glass overflow-hidden rounded-[2rem] bg-white/76 dark:bg-[#191a1e]/76 border border-[#101114]/9 dark:border-white/11 shadow-[0_24px_64px_rgba(19,20,24,0.09)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-[18px]">
      <div className="p-6 sm:p-9">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* HEX */}
          <div className="rounded-2xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-4 group">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#686b74] dark:text-[#a8abb4]">HEX</p>
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[#101114]/10 dark:hover:bg-white/10"
                onClick={() => handleCopy(colorInfo.hex, "hex")}
                aria-label="Copy HEX"
              >
                {copiedField === "hex" ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-[#686b74] dark:text-[#a8abb4]" />
                )}
              </button>
            </div>
            <p className="mt-2 font-mono text-sm font-semibold">{colorInfo.hex}</p>
          </div>

          {/* RGB */}
          <div className="rounded-2xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-4 group">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#686b74] dark:text-[#a8abb4]">RGB</p>
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[#101114]/10 dark:hover:bg-white/10"
                onClick={() => handleCopy(formatRGB, "rgb")}
                aria-label="Copy RGB"
              >
                {copiedField === "rgb" ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-[#686b74] dark:text-[#a8abb4]" />
                )}
              </button>
            </div>
            <p className="mt-2 font-mono text-sm font-semibold">{formatRGB}</p>
          </div>

          {/* HSL */}
          <div className="rounded-2xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-4 group">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#686b74] dark:text-[#a8abb4]">HSL</p>
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[#101114]/10 dark:hover:bg-white/10"
                onClick={() => handleCopy(formatHSL, "hsl")}
                aria-label="Copy HSL"
              >
                {copiedField === "hsl" ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-[#686b74] dark:text-[#a8abb4]" />
                )}
              </button>
            </div>
            <p className="mt-2 font-mono text-sm font-semibold">{formatHSL}</p>
          </div>

          {/* CMYK */}
          <div className="rounded-2xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-4 group">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#686b74] dark:text-[#a8abb4]">CMYK</p>
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[#101114]/10 dark:hover:bg-white/10"
                onClick={() => handleCopy(formatCMYK, "cmyk")}
                aria-label="Copy CMYK"
              >
                {copiedField === "cmyk" ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-[#686b74] dark:text-[#a8abb4]" />
                )}
              </button>
            </div>
            <p className="mt-2 font-mono text-sm font-semibold">{formatCMYK}</p>
          </div>

          {/* HSV - Additional row for full coverage */}
          <div className="rounded-2xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-4 group sm:col-span-2 lg:col-span-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#686b74] dark:text-[#a8abb4]">HSV</p>
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[#101114]/10 dark:hover:bg-white/10"
                onClick={() => handleCopy(formatHSV, "hsv")}
                aria-label="Copy HSV"
              >
                {copiedField === "hsv" ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-[#686b74] dark:text-[#a8abb4]" />
                )}
              </button>
            </div>
            <p className="mt-2 font-mono text-sm font-semibold">{formatHSV}</p>
          </div>
        </div>
      </div>
    </section>
  );
}