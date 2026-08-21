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

  // Color format data for mapping
  const colorFormats = [
    { 
      id: "hex", 
      label: "HEX", 
      value: colorInfo.hex,
      ariaLabel: "Copy HEX value" 
    },
    { 
      id: "rgb", 
      label: "RGB", 
      value: formatRGB,
      ariaLabel: "Copy RGB value" 
    },
    { 
      id: "hsl", 
      label: "HSL", 
      value: formatHSL,
      ariaLabel: "Copy HSL value" 
    },
    { 
      id: "cmyk", 
      label: "CMYK", 
      value: formatCMYK,
      ariaLabel: "Copy CMYK value" 
    },
  ];

  return (
    <section 
      className="mt-9 glass overflow-hidden rounded-[2rem] bg-white/76 dark:bg-[#191a1e]/76 border border-[#101114]/9 dark:border-white/11 shadow-[0_24px_64px_rgba(19,20,24,0.09)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-[18px]"
      aria-labelledby="color-info-title"
    >
      <div className="p-6 sm:p-9">
        <h2 id="color-info-title" className="sr-only">
          Color Information
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Map through color formats */}
          {colorFormats.map((format) => (
            <div 
              key={format.id}
              className="rounded-2xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-4 group"
              role="region"
              aria-label={`${format.label} color format`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#686b74] dark:text-[#a8abb4]">
                  {format.label}
                </p>
                <button
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 rounded hover:bg-[#101114]/10 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#FF5A36] dark:focus:ring-[#ff7e5c]"
                  onClick={() => handleCopy(format.value, format.id)}
                  aria-label={format.ariaLabel}
                  aria-live="polite"
                >
                  {copiedField === format.id ? (
                    <Check className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-[#686b74] dark:text-[#a8abb4]" aria-hidden="true" />
                  )}
                </button>
              </div>
              <p 
                className="mt-2 font-mono text-sm font-semibold select-all"
                aria-label={`${format.label} value ${format.value}`}
              >
                {format.value}
              </p>
            </div>
          ))}

          {/* HSV - Full width */}
          <div 
            className="rounded-2xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-4 group sm:col-span-2 lg:col-span-4"
            role="region"
            aria-label="HSV color format"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#686b74] dark:text-[#a8abb4]">
                HSV
              </p>
              <button
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1.5 rounded hover:bg-[#101114]/10 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#FF5A36] dark:focus:ring-[#ff7e5c]"
                onClick={() => handleCopy(formatHSV, "hsv")}
                aria-label="Copy HSV value"
                aria-live="polite"
              >
                {copiedField === "hsv" ? (
                  <Check className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-[#686b74] dark:text-[#a8abb4]" aria-hidden="true" />
                )}
              </button>
            </div>
            <p 
              className="mt-2 font-mono text-sm font-semibold select-all"
              aria-label={`HSV value ${formatHSV}`}
            >
              {formatHSV}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}