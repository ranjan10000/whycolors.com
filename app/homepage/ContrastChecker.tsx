// app/homepage/ContrastChecker.tsx
"use client";

import { useState } from "react";

interface ContrastCheckerProps {
  initialFg?: string;
  initialBg?: string;
}

export default function ContrastChecker({ 
  initialFg = "#101114", 
  initialBg = "#FFFFFF" 
}: ContrastCheckerProps) {
  const [contrastFg, setContrastFg] = useState(initialFg);
  const [contrastBg, setContrastBg] = useState(initialBg);

  const hexToRgb = (hex: string) => {
    const clean = hex.replace("#", "");
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
  };

  const luminance = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    return [r, g, b]
      .map((channel) => {
        const value = channel / 255;
        return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
      })
      .reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
  };

  const getContrastInfo = () => {
    const ratio =
      (Math.max(luminance(contrastFg), luminance(contrastBg)) + 0.05) /
      (Math.min(luminance(contrastFg), luminance(contrastBg)) + 0.05);
    const rounded = ratio.toFixed(1);
    let status = "Needs improvement";
    let message = "Needs stronger contrast for accessible body text.";
    if (ratio >= 7) {
      status = "AAA";
      message = "Normal text AAA, large text AAA, and UI contrast pass.";
    } else if (ratio >= 4.5) {
      status = "AA";
      message = "Normal text AA and large text AAA pass.";
    } else if (ratio >= 3) {
      status = "AA";
      message = "Large text AA passes; normal body text needs improvement.";
    }
    return { ratio: rounded, status, message };
  };

  const contrastData = getContrastInfo();

  return (
    <section id="contrast" className="mx-auto mt-16 max-w-7xl">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass rounded-[2rem] p-6 sm:p-8 bg-white/76 dark:bg-[#191a1e]/76 border border-[#101114]/9 dark:border-white/11 shadow-[0_24px_64px_rgba(19,20,24,0.09)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-[18px]">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#686b74] dark:text-[#a8abb4]">
            Accessibility
          </p>
          <h2 className="mt-3 font-['Fraunces',serif] text-2xl font-bold tracking-[-0.045em]">
            Contrast checker
          </h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <label className="mb-2 block text-sm font-bold">Foreground</label>
              <div className="flex items-center gap-3 rounded-xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-2">
                <input
                  className="h-10 w-10 cursor-pointer"
                  type="color"
                  value={contrastFg}
                  onChange={(e) => setContrastFg(e.target.value)}
                />
                <span className="font-mono text-sm">{contrastFg}</span>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold">Background</label>
              <div className="flex items-center gap-3 rounded-xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-2">
                <input
                  className="h-10 w-10 cursor-pointer"
                  type="color"
                  value={contrastBg}
                  onChange={(e) => setContrastBg(e.target.value)}
                />
                <span className="font-mono text-sm">{contrastBg}</span>
              </div>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#686b74] dark:text-[#a8abb4]">
              Accessibility check
            </p>
            <p className="mt-2 text-sm font-semibold">{contrastData.message}</p>
          </div>
        </div>

        <div
          className="flex min-h-[330px] flex-col justify-between rounded-[2rem] p-7 sm:p-10 transition-colors"
          style={{
            color: contrastFg,
            backgroundColor: contrastBg,
          }}
        >
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em]">Contrast</p>
              <p className="mt-2 text-6xl font-bold tracking-[-0.06em]">
                {contrastData.ratio}:1
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-2 text-sm font-bold ${
                contrastData.status === "AAA"
                  ? "bg-[#d9f6e8] text-[#087348]"
                  : "bg-[#ffe3de] text-[#bb3d2a]"
              }`}
            >
              {contrastData.status}
            </span>
          </div>
          <div>
            <p className="font-['Fraunces',serif] text-2xl font-bold tracking-[-0.04em]">
              Live preview
            </p>
            <p className="mt-3 max-w-xl leading-relaxed">
              This text demonstrates the contrast ratio between the selected foreground and
              background colors.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}