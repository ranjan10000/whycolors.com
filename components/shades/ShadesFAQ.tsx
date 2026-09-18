// components/shades/ShadesFAQ.tsx
'use client';

import { useState, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import chroma from 'chroma-js';
import {
  ChevronDown,
  ChevronUp,
  Droplet,
  Palette,
  Eye,
  Accessibility,
  Brain,
  Sun,
  Moon,
  Zap,
} from 'lucide-react';
import {
  hexToRgbArray,
  hexToHsl,
  hexToHsv,
  hexToCmyk,
  getColorName,
  getColorFamily,
  getContrastColor,
} from '@/lib/color-utils';

interface ShadesFAQProps {
  colorName: string;
  hex: string;
  colorFamily?: string;
}

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
}

export default function ShadesFAQ({
  colorName,
  hex,
  colorFamily: _colorFamily,
}: ShadesFAQProps) {
  const { isDark } = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const fullHex = `#${hex.toUpperCase()}`;

  /* ============================================================
   * COLOR DATA
   * ============================================================ */
  const colorData = useMemo(() => {
    const rgbArray = hexToRgbArray(hex);
    const rgb = rgbArray
      ? { r: rgbArray[0], g: rgbArray[1], b: rgbArray[2] }
      : { r: 0, g: 0, b: 0 };

    const hslStr = hexToHsl(hex);
    const hsvStr = hexToHsv(hex);
    const cmykStr = hexToCmyk(hex);
    const contrast = getContrastColor(hex);
    const family = getColorFamily(hex);
    const name = getColorName(hex);

    // Parse HSL
    let hsl = { h: 0, s: 0, l: 0 };
    if (hslStr) {
      const match = hslStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      if (match) {
        hsl = {
          h: parseInt(match[1]),
          s: parseInt(match[2]),
          l: parseInt(match[3]),
        };
      }
    }

    // Parse HSV
    let hsv = { h: 0, s: 0, v: 0 };
    if (hsvStr) {
      const match = hsvStr.match(/hsv\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      if (match) {
        hsv = {
          h: parseInt(match[1]),
          s: parseInt(match[2]),
          v: parseInt(match[3]),
        };
      }
    }

    // Parse CMYK
    let cmyk = { c: 0, m: 0, y: 0, k: 0 };
    if (cmykStr) {
      const match = cmykStr.match(
        /cmyk\((\d+)%,\s*(\d+)%,\s*(\d+)%,\s*(\d+)%\)/
      );
      if (match) {
        cmyk = {
          c: parseInt(match[1]),
          m: parseInt(match[2]),
          y: parseInt(match[3]),
          k: parseInt(match[4]),
        };
      }
    }

    const similarColors = getSimilarColors(hex);
    const complementary = getComplementaryColor(hex);
    const splitComplement1 = rotateHue(hex, 150);
    const splitComplement2 = rotateHue(hex, -150);
    const luminance = getLuminance(hex);
    const contrastOnWhite = getContrastRatio(hex, 'ffffff');
    const contrastOnBlack = getContrastRatio(hex, '000000');
    const colorTemperature = getColorTemperature(hex);
    const colorPsychology = getColorPsychology(name, hex);
    const colorDescription = getColorDescription(name, hex);

    return {
      rgb,
      hsl,
      hsv,
      cmyk,
      similarColors,
      complementary,
      splitComplement1,
      splitComplement2,
      luminance,
      contrastOnWhite,
      contrastOnBlack,
      colorTemperature,
      colorPsychology,
      colorDescription,
      contrast,
      family,
    };
  }, [hex]);

  /* ============================================================
   * FAQ ITEMS
   * ============================================================ */
  const faqItems = useMemo<FAQItem[]>(() => {
    const baseColor = colorName;
    const data = colorData;

    // Dynamic descriptive words
    const saturationWord =
      data.hsv.s > 70
        ? 'highly saturated'
        : data.hsv.s > 50
        ? 'moderately saturated'
        : 'muted';

    const brightnessWord =
      data.hsv.v > 70
        ? 'bright'
        : data.hsv.v > 50
        ? 'medium-bright'
        : 'dark';

    const designTipEnd =
      data.hsv.v > 70
        ? " It's ideal for creating visual impact and energy in designs."
        : data.hsv.v > 50
        ? ' It works well for balanced, professional designs.'
        : " It's suitable for subtle and sophisticated designs.";

    return [
      {
        question: `What color is ${baseColor} (${fullHex})?`,
        answer: (
          <div className="space-y-2">
            <p>
              <strong>{baseColor}</strong> is a{' '}
              <strong>{data.colorDescription}</strong> color.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              <div
                className={`p-2 rounded-lg text-center ${
                  isDark ? 'bg-white/5' : 'bg-gray-50'
                }`}
              >
                <p className="text-xs opacity-75">RGB</p>
                <p className="text-sm font-mono">
                  {data.rgb.r}, {data.rgb.g}, {data.rgb.b}
                </p>
              </div>
              <div
                className={`p-2 rounded-lg text-center ${
                  isDark ? 'bg-white/5' : 'bg-gray-50'
                }`}
              >
                <p className="text-xs opacity-75">HSL</p>
                <p className="text-sm font-mono">
                  {data.hsl.h}°, {data.hsl.s}%, {data.hsl.l}%
                </p>
              </div>
              <div
                className={`p-2 rounded-lg text-center ${
                  isDark ? 'bg-white/5' : 'bg-gray-50'
                }`}
              >
                <p className="text-xs opacity-75">CMYK</p>
                <p className="text-sm font-mono">
                  {data.cmyk.c}%, {data.cmyk.m}%, {data.cmyk.y}%,{' '}
                  {data.cmyk.k}%
                </p>
              </div>
              <div
                className={`p-2 rounded-lg text-center ${
                  isDark ? 'bg-white/5' : 'bg-gray-50'
                }`}
              >
                <p className="text-xs opacity-75">HSV</p>
                <p className="text-sm font-mono">
                  {data.hsv.h}°, {data.hsv.s}%, {data.hsv.v}%
                </p>
              </div>
            </div>
          </div>
        ),
      },
      {
        question: `What colors are similar to ${baseColor} (${fullHex})?`,
        answer: (
          <div className="space-y-2">
            <p>Colors similar to {baseColor} include:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {data.similarColors.length > 0 ? (
                data.similarColors.map((color, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg flex items-center gap-2 ${
                      isDark ? 'bg-white/5' : 'bg-gray-50'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: color.hex }}
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {color.name}
                      </p>
                      <p className="text-[10px] font-mono opacity-75">
                        {color.hex}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm opacity-75">No close matches found</p>
              )}
            </div>
          </div>
        ),
      },
      {
        question: `What color palette goes well with ${baseColor}?`,
        answer: (
          <div className="space-y-3">
            <p>
              Here are some color palettes that work well with {baseColor}:
            </p>

            <div
              className={`p-3 rounded-lg ${
                isDark ? 'bg-white/5' : 'bg-gray-50'
              }`}
            >
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Palette className="w-4 h-4" aria-hidden="true" />
                Complementary Palette
              </h4>
              <div className="flex gap-2">
                <div
                  className="w-10 h-10 rounded-lg border"
                  style={{ backgroundColor: fullHex }}
                  title={fullHex}
                />
                <div
                  className="w-10 h-10 rounded-lg border"
                  style={{ backgroundColor: data.complementary }}
                  title={data.complementary}
                />
                <div
                  className="w-10 h-10 rounded-lg border"
                  style={{ backgroundColor: `#${darkenHex(hex, 0.2)}` }}
                  title={`#${darkenHex(hex, 0.2)}`}
                />
                <div
                  className="w-10 h-10 rounded-lg border"
                  style={{ backgroundColor: `#${lightenHex(hex, 0.3)}` }}
                  title={`#${lightenHex(hex, 0.3)}`}
                />
              </div>
              <p className="text-xs opacity-75 mt-1">
                {fullHex} + {data.complementary} + dark/light variations
              </p>
            </div>

            <div
              className={`p-3 rounded-lg ${
                isDark ? 'bg-white/5' : 'bg-gray-50'
              }`}
            >
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Droplet className="w-4 h-4" aria-hidden="true" />
                Monochromatic Palette
              </h4>
              <div className="flex gap-2">
                <div
                  className="w-10 h-10 rounded-lg border"
                  style={{ backgroundColor: `#${lightenHex(hex, 0.6)}` }}
                />
                <div
                  className="w-10 h-10 rounded-lg border"
                  style={{ backgroundColor: `#${lightenHex(hex, 0.3)}` }}
                />
                <div
                  className="w-10 h-10 rounded-lg border"
                  style={{ backgroundColor: fullHex }}
                />
                <div
                  className="w-10 h-10 rounded-lg border"
                  style={{ backgroundColor: `#${darkenHex(hex, 0.3)}` }}
                />
                <div
                  className="w-10 h-10 rounded-lg border"
                  style={{ backgroundColor: `#${darkenHex(hex, 0.6)}` }}
                />
              </div>
              <p className="text-xs opacity-75 mt-1">
                Various shades of {baseColor}
              </p>
            </div>
          </div>
        ),
      },
      {
        question: `How do I use ${baseColor} in my design?`,
        answer: (
          <div className="space-y-2">
            <p>
              Based on its color properties, {baseColor} works well for:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Call-to-action buttons</strong> -{' '}
                {parseFloat(data.contrastOnWhite) >= 4.5
                  ? '✅ Good'
                  : '⚠️ Check'}{' '}
                contrast (on white: {data.contrastOnWhite}:1)
              </li>
              <li>
                <strong>Brand accents</strong> -{' '}
                {data.colorPsychology.split(' • ').slice(0, 3).join(' ')}
              </li>
              <li>
                <strong>{data.colorTemperature} color schemes</strong> - Pairs
                well with{' '}
                {data.colorTemperature === 'Warm'
                  ? 'yellows and oranges'
                  : 'blues and purples'}
              </li>
              <li>
                <strong>
                  {data.hsv.v > 70 ? 'High-impact' : 'Subtle'} design elements
                </strong>{' '}
                -{' '}
                {data.hsv.v > 70
                  ? 'Creates strong visual hierarchy'
                  : 'Creates calm, professional look'}
              </li>
            </ul>
            <div
              className={`p-3 rounded-lg mt-2 ${
                isDark ? 'bg-white/5' : 'bg-gray-50'
              }`}
            >
              <p className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4" aria-hidden="true" />
                Design Tip:
              </p>
              <p className="text-sm opacity-75">
                Use {fullHex} as your primary color with neutral backgrounds
                for maximum impact.
                {data.hsv.v > 70
                  ? ' Light tints work great for backgrounds, dark shades for text.'
                  : ' Consider using brighter variations for accents.'}
              </p>
            </div>
          </div>
        ),
      },
      {
        question: `What are the accessibility considerations for ${baseColor}?`,
        answer: (
          <div className="space-y-2">
            <p>
              Color accessibility is important. Here's how {baseColor}{' '}
              performs:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Contrast on white</strong>:{' '}
                <span className="font-mono">
                  {data.contrastOnWhite}:1
                </span>
                {parseFloat(data.contrastOnWhite) < 4.5 ? (
                  <span className="text-red-400 ml-2">
                    ⚠️ Below WCAG AA (4.5:1 minimum)
                  </span>
                ) : (
                  <span className="text-emerald-400 ml-2">
                    ✅ Passes WCAG AA
                  </span>
                )}
              </li>
              <li>
                <strong>Contrast on black</strong>:{' '}
                <span className="font-mono">
                  {data.contrastOnBlack}:1
                </span>
                {parseFloat(data.contrastOnBlack) < 4.5 ? (
                  <span className="text-red-400 ml-2">
                    ⚠️ Below WCAG AA
                  </span>
                ) : (
                  <span className="text-emerald-400 ml-2">
                    ✅ Passes WCAG AA
                  </span>
                )}
              </li>
              <li>
                <strong>Best for</strong>:{' '}
                {parseFloat(data.contrastOnWhite) >= 4.5
                  ? 'Text, UI elements'
                  : 'Headlines, large text, and UI elements'}
              </li>
              <li>
                <strong>Avoid</strong>:{' '}
                {parseFloat(data.contrastOnWhite) < 4.5
                  ? 'Small text on white backgrounds'
                  : 'No major accessibility issues'}
              </li>
            </ul>
            <div
              className={`p-3 rounded-lg mt-2 ${
                isDark ? 'bg-white/5' : 'bg-gray-50'
              }`}
            >
              <p className="text-sm font-medium flex items-center gap-2">
                <Accessibility className="w-4 h-4" aria-hidden="true" />
                Accessibility Tip:
              </p>
              <p className="text-sm opacity-75">
                {parseFloat(data.contrastOnWhite) < 4.5
                  ? `For text, use ${fullHex} on dark backgrounds or dark shades on white backgrounds to ensure readable contrast.`
                  : `${fullHex} works well on both light and dark backgrounds. Use lighter tints for backgrounds and darker shades for text.`}
              </p>
            </div>
          </div>
        ),
      },
      {
        question: `How is ${baseColor} perceived in color psychology?`,
        answer: (
          <div className="space-y-2">
            <p>
              <strong>{baseColor}</strong> evokes these psychological
              associations:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              {data.colorPsychology.split(' • ').map((point, i) => {
                const parts = point.split(':');
                return (
                  <li key={i}>
                    {parts.length > 1 ? (
                      <>
                        <strong>{parts[0].trim()}</strong> -{' '}
                        {parts.slice(1).join(':').trim()}
                      </>
                    ) : (
                      <span>{point}</span>
                    )}
                  </li>
                );
              })}
            </ul>
            <div
              className={`p-3 rounded-lg mt-2 ${
                isDark ? 'bg-white/5' : 'bg-gray-50'
              }`}
            >
              <p className="text-sm font-medium flex items-center gap-2">
                <Brain className="w-4 h-4" aria-hidden="true" />
                Psychological Insight:
              </p>
              <p className="text-sm opacity-75">
                {fullHex} {getColorInsight(hex, colorName)}
              </p>
            </div>
          </div>
        ),
      },
      {
        question: `What are the best complementary colors for ${baseColor}?`,
        answer: (
          <div className="space-y-2">
            <p>
              Here are the best complementary colors for {baseColor} based on
              color theory:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
              <div
                className={`p-3 rounded-lg ${
                  isDark ? 'bg-white/5' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border flex-shrink-0"
                    style={{ backgroundColor: data.complementary }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium">Complementary</p>
                    <p className="text-[10px] font-mono opacity-75">
                      {data.complementary}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] opacity-60 mt-1.5">
                  Direct opposite on color wheel (180°)
                </p>
              </div>

              <div
                className={`p-3 rounded-lg ${
                  isDark ? 'bg-white/5' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border flex-shrink-0"
                    style={{
                      backgroundColor: `#${data.splitComplement1}`,
                    }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium">Split-Complement</p>
                    <p className="text-[10px] font-mono opacity-75">
                      #{data.splitComplement1}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] opacity-60 mt-1.5">
                  Adjacent to complementary (+150°)
                </p>
              </div>

              <div
                className={`p-3 rounded-lg ${
                  isDark ? 'bg-white/5' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded border flex-shrink-0"
                    style={{
                      backgroundColor: `#${data.splitComplement2}`,
                    }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium">Split-Complement</p>
                    <p className="text-[10px] font-mono opacity-75">
                      #{data.splitComplement2}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] opacity-60 mt-1.5">
                  Adjacent to complementary (−150°)
                </p>
              </div>
            </div>
          </div>
        ),
      },
      /* ============================================================
       * ✅ FIXED: Luminance & brightness section
       * - Label: "Perceived brightness" (accurate formula name)
       * - Analysis: dynamic brightness word (matches data)
       * - Design tip: middle ground for V 50-70
       * ============================================================ */
      {
        question: `What is the luminance and brightness of ${baseColor}?`,
        answer: (
          <div className="space-y-2">
            <p>Technical properties of {baseColor}:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Perceived brightness</strong>:{' '}
                <span className="font-mono">
                  {data.luminance.toFixed(3)}
                </span>{' '}
                (Range: 0 = black, 1 = white)
              </li>
              <li>
                <strong>Brightness (HSV V)</strong>: {data.hsv.v}% (
                {data.hsv.v > 70
                  ? 'High brightness ✅'
                  : data.hsv.v > 50
                  ? 'Medium brightness'
                  : 'Low brightness'}
                )
              </li>
              <li>
                <strong>Saturation</strong>: {data.hsv.s}% (
                {data.hsv.s > 70
                  ? 'Highly saturated ✅'
                  : data.hsv.s > 50
                  ? 'Medium saturation'
                  : 'Muted'}
                )
              </li>
              <li>
                <strong>Color temperature</strong>: {data.colorTemperature}
                {data.colorTemperature === 'Warm' ? (
                  <Sun
                    className="w-4 h-4 inline ml-1"
                    aria-hidden="true"
                  />
                ) : (
                  <Moon
                    className="w-4 h-4 inline ml-1"
                    aria-hidden="true"
                  />
                )}
              </li>
            </ul>
            <div
              className={`p-3 rounded-lg mt-2 ${
                isDark ? 'bg-white/5' : 'bg-gray-50'
              }`}
            >
              <p className="text-sm font-medium flex items-center gap-2">
                <Eye className="w-4 h-4" aria-hidden="true" />
                Analysis:
              </p>
              <p className="text-sm opacity-75">
                {baseColor} is a {saturationWord}, {brightnessWord} color with
                a {data.colorTemperature.toLowerCase()} temperature.
                {designTipEnd}
              </p>
            </div>
          </div>
        ),
      },
    ];
  }, [colorName, hex, isDark, colorData]);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  /* ============================================================
   * RENDER
   * ============================================================ */
  return (
    <div
      className={`rounded-2xl border transition-all ${
        isDark
          ? 'bg-[#131322]/80 border-white/10'
          : 'bg-white/90 border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              isDark
                ? 'bg-indigo-500/10 text-indigo-400'
                : 'bg-indigo-50 text-indigo-600'
            }`}
          >
            <Eye className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2
              className={`text-lg sm:text-xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              About {colorName} Color
            </h2>
            <p
              className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              Color information, palettes, and design tips
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Items */}
      <div className="p-4 sm:p-6 space-y-3">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={index}
              className={`rounded-xl border transition-all ${
                isOpen
                  ? isDark
                    ? 'border-indigo-500/30 bg-indigo-500/5'
                    : 'border-indigo-200 bg-indigo-50/30'
                  : isDark
                  ? 'border-white/5 hover:border-white/15'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(index)}
                className="w-full flex items-center justify-between gap-4 p-4 text-left transition-colors"
                aria-expanded={isOpen}
              >
                <span
                  role="heading"
                  aria-level={3}
                  className={`font-medium text-sm sm:text-base ${
                    isDark ? 'text-gray-200' : 'text-gray-800'
                  }`}
                >
                  {item.question}
                </span>
                <span
                  className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${
                    isOpen
                      ? isDark
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'bg-indigo-100 text-indigo-600'
                      : isDark
                      ? 'bg-white/5 text-gray-400'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                  aria-hidden="true"
                >
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-4 h-4" aria-hidden="true" />
                  )}
                </span>
              </button>

              {isOpen && (
                <div
                  className={`px-4 pb-4 text-sm ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className={`p-4 sm:p-6 border-t ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p
            className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            📊 Data from actual color analysis • {faqItems.length} color
            insights
          </p>
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: fullHex }}
              aria-hidden="true"
            />
            <span
              className={`text-xs font-mono ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              {fullHex}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * DYNAMIC HELPER FUNCTIONS
 * ============================================================ */

function getSimilarColors(
  hex: string
): Array<{ name: string; hex: string }> {
  const rgbArray = hexToRgbArray(hex);
  if (!rgbArray) return [];

  const [r, g, b] = rgbArray;
  const allColors = generateDynamicColors(hex);

  const seen = new Set<string>();
  const baseHex = hex.replace('#', '').toLowerCase();

  return allColors
    .map((color) => {
      const cRgb = hexToRgbArray(color.hex.replace('#', ''));
      if (!cRgb) return { ...color, diff: Infinity };
      const [cr, cg, cb] = cRgb;
      const diff = Math.sqrt(
        Math.pow(r - cr, 2) + Math.pow(g - cg, 2) + Math.pow(b - cb, 2)
      );
      return { ...color, diff };
    })
    .filter((color) => {
      const key = color.hex.replace('#', '').toLowerCase();
      if (key === baseHex) return false;
      if (color.diff < 15) return false;
      if (color.diff > 100) return false;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 6)
    .map(({ name, hex }) => ({ name, hex }));
}

function generateDynamicColors(
  hex: string
): Array<{ name: string; hex: string }> {
  const rgbArray = hexToRgbArray(hex);
  if (!rgbArray) return [];

  const [r, g, b] = rgbArray;
  const colors: Array<{ name: string; hex: string }> = [];

  const variations = [
    { name: 'Lighter', factor: 0.3 },
    { name: 'Darker', factor: -0.3 },
    { name: 'More Red', factor: 0.2, channel: 'r' },
    { name: 'More Green', factor: 0.2, channel: 'g' },
    { name: 'More Blue', factor: 0.2, channel: 'b' },
    { name: 'Less Red', factor: -0.2, channel: 'r' },
    { name: 'Less Green', factor: -0.2, channel: 'g' },
    { name: 'Less Blue', factor: -0.2, channel: 'b' },
  ];

  for (const variation of variations) {
    let newR = r,
      newG = g,
      newB = b;

    if (variation.channel === 'r') {
      newR = Math.max(0, Math.min(255, r + r * variation.factor));
    } else if (variation.channel === 'g') {
      newG = Math.max(0, Math.min(255, g + g * variation.factor));
    } else if (variation.channel === 'b') {
      newB = Math.max(0, Math.min(255, b + b * variation.factor));
    } else if (variation.factor > 0) {
      newR = Math.min(255, r + (255 - r) * variation.factor);
      newG = Math.min(255, g + (255 - g) * variation.factor);
      newB = Math.min(255, b + (255 - b) * variation.factor);
    } else {
      newR = r * (1 + variation.factor);
      newG = g * (1 + variation.factor);
      newB = b * (1 + variation.factor);
    }

    const hexStr = rgbToHexStr(
      Math.round(newR),
      Math.round(newG),
      Math.round(newB)
    );
    const name = getColorName(hexStr);
    colors.push({ name, hex: `#${hexStr}` });
  }

  // Analogous colors
  const hslStr = hexToHsl(hex);
  if (hslStr) {
    const match = hslStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      const h = parseInt(match[1]);
      const s = parseInt(match[2]);
      const l = parseInt(match[3]);

      for (const shift of [30, -30, 60, -60]) {
        const newH = (h + shift + 360) % 360;
        const hslColor = chroma(`hsl(${newH}, ${s}%, ${l}%)`);
        const hexStr = hslColor.hex().replace('#', '');
        const name = getColorName(hexStr);
        colors.push({ name, hex: `#${hexStr}` });
      }
    }
  }

  // Complementary
  const compHex = getComplementaryColor(hex).replace('#', '');
  const compName = getColorName(compHex);
  colors.push({ name: `Complementary - ${compName}`, hex: `#${compHex}` });

  // Dedupe
  const seen = new Set<string>();
  return colors
    .filter((color) => {
      const key = color.hex.toLowerCase();
      if (key === hex.toLowerCase() || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 12);
}

function rgbToHexStr(r: number, g: number, b: number): string {
  return `${Math.max(0, Math.min(255, Math.round(r)))
    .toString(16)
    .padStart(2, '0')}${Math.max(0, Math.min(255, Math.round(g)))
    .toString(16)
    .padStart(2, '0')}${Math.max(0, Math.min(255, Math.round(b)))
    .toString(16)
    .padStart(2, '0')}`;
}

function getComplementaryColor(hex: string): string {
  const rgb = hexToRgbArray(hex);
  if (!rgb) return '#FFFFFF';

  const [r, g, b] = rgb;
  const compR = (255 - r).toString(16).padStart(2, '0');
  const compG = (255 - g).toString(16).padStart(2, '0');
  const compB = (255 - b).toString(16).padStart(2, '0');
  return `#${compR}${compG}${compB}`;
}

function rotateHue(hex: string, degrees: number): string {
  const hslStr = hexToHsl(hex);
  if (!hslStr) return hex.replace('#', '');

  const match = hslStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return hex.replace('#', '');

  const h = (parseInt(match[1]) + degrees + 360) % 360;
  const s = parseInt(match[2]);
  const l = parseInt(match[3]);

  try {
    const color = chroma(`hsl(${h}, ${s}%, ${l}%)`);
    return color.hex().replace('#', '');
  } catch {
    return hex.replace('#', '');
  }
}

function getLuminance(hex: string): number {
  const rgb = hexToRgbArray(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((v) => v / 255);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function getContrastRatio(hex1: string, hex2: string): string {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return ratio.toFixed(1);
}

function getColorTemperature(hex: string): string {
  const hslStr = hexToHsl(hex);
  if (!hslStr) return 'Neutral';

  const match = hslStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return 'Neutral';

  const h = parseInt(match[1]);
  if (h >= 0 && h < 60) return 'Warm';
  if (h >= 60 && h < 180) return 'Cool';
  if (h >= 180 && h < 240) return 'Cool';
  if (h >= 240 && h < 300) return 'Cool';
  return 'Warm';
}

function getColorPsychology(colorName: string, hex: string): string {
  const hsvStr = hexToHsv(hex);
  const hslStr = hexToHsl(hex);
  if (!hsvStr || !hslStr) return 'Psychology: data unavailable';

  const hsvMatch = hsvStr.match(/hsv\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  const hslMatch = hslStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!hsvMatch || !hslMatch) return 'Psychology: data unavailable';

  const hsv = {
    h: parseInt(hsvMatch[1]),
    s: parseInt(hsvMatch[2]),
    v: parseInt(hsvMatch[3]),
  };
  const hsl = {
    h: parseInt(hslMatch[1]),
    s: parseInt(hslMatch[2]),
    l: parseInt(hslMatch[3]),
  };

  const isWarm = hsl.h < 60 || hsl.h > 300;
  const isBright = hsv.v > 70;
  const isSaturated = hsv.s > 70;
  const rgb = hexToRgbArray(hex);
  if (!rgb) return 'Psychology: data unavailable';

  const [r, g, b] = rgb;
  const psychology: string[] = [];

  if (isBright && isSaturated) {
    psychology.push('Energy: high excitement and innovation');
    psychology.push('Creativity: inspires new ideas');
  }

  if (isWarm) {
    psychology.push('Warmth: friendly and approachable');
    psychology.push('Energy: uplifting and dynamic');
  } else {
    psychology.push('Calm: professional and composed');
    psychology.push('Trust: reliable and stable');
  }

  if (hsv.v > 80) {
    psychology.push('Visibility: attention-grabbing');
  }

  if (hsv.s < 50) {
    psychology.push('Subtlety: sophisticated and refined');
  }

  if (r > g && r > b) {
    psychology.push('Passion: intensity and drive');
  }

  if (b > r && b > g) {
    psychology.push('Depth: introspection and calm');
  }

  if (g > r && g > b) {
    psychology.push('Balance: harmony and growth');
  }

  return psychology.join(' • ');
}

function getColorDescription(colorName: string, hex: string): string {
  const hsvStr = hexToHsv(hex);
  const hslStr = hexToHsl(hex);
  if (!hsvStr || !hslStr) return 'custom color';

  const hsvMatch = hsvStr.match(/hsv\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  const hslMatch = hslStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!hsvMatch || !hslMatch) return 'custom color';

  const hsv = {
    h: parseInt(hsvMatch[1]),
    s: parseInt(hsvMatch[2]),
    v: parseInt(hsvMatch[3]),
  };
  const hsl = {
    h: parseInt(hslMatch[1]),
    s: parseInt(hslMatch[2]),
    l: parseInt(hslMatch[3]),
  };

  const isWarm = hsl.h < 60 || hsl.h > 300;
  const isBright = hsv.v > 70;
  const isSaturated = hsv.s > 70;
  const isLight = hsl.l > 70;
  const isDark = hsl.l < 30;

  const parts: string[] = [];

  if (isDark) parts.push('deep');
  if (isLight) parts.push('light');
  if (isBright) parts.push('vibrant');
  if (isSaturated) parts.push('saturated');
  if (!isSaturated && !isBright) parts.push('muted');
  parts.push(isWarm ? 'warm' : 'cool');

  const rgb = hexToRgbArray(hex);
  if (!rgb) return parts.join(' ');

  const [r, g, b] = rgb;
  let family = 'neutral';
  if (r > g && r > b) family = 'red';
  else if (g > r && g > b) family = 'green';
  else if (b > r && b > g) family = 'blue';

  parts.push(family);
  return parts.join(' ');
}

function getColorInsight(hex: string, colorName: string): string {
  const hsvStr = hexToHsv(hex);
  const hslStr = hexToHsl(hex);
  if (!hsvStr || !hslStr)
    return 'has unique properties for design applications.';

  const hsvMatch = hsvStr.match(/hsv\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  const hslMatch = hslStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!hsvMatch || !hslMatch)
    return 'has unique properties for design applications.';

  const hsv = {
    h: parseInt(hsvMatch[1]),
    s: parseInt(hsvMatch[2]),
    v: parseInt(hsvMatch[3]),
  };
  const hsl = {
    h: parseInt(hslMatch[1]),
    s: parseInt(hslMatch[2]),
    l: parseInt(hslMatch[3]),
  };

  const isWarm = hsl.h < 60 || hsl.h > 300;
  const isBright = hsv.v > 70;
  const isSaturated = hsv.s > 70;
  const isLight = hsl.l > 70;

  if (isWarm && isBright && isSaturated) {
    return `combines the passion of red with the friendliness of orange, making it ideal for brands that want to feel both exciting and approachable.`;
  }

  if (!isWarm && isBright && isSaturated) {
    return `creates a sense of trust and professionalism while maintaining visual impact, perfect for tech and corporate brands.`;
  }

  if (isWarm && !isBright) {
    return `offers a sophisticated, earthy feel that works well for natural and organic brands.`;
  }

  if (!isWarm && !isBright && isSaturated) {
    return `provides a deep, rich color that conveys luxury and quality.`;
  }

  if (isLight && isWarm) {
    return `brings a soft, gentle warmth that's perfect for wellness and lifestyle brands.`;
  }

  if (isLight && !isWarm) {
    return `offers a clean, airy feel that works well for minimal and modern designs.`;
  }

  return 'has unique properties that make it versatile for various design applications.';
}

function lightenHex(hex: string, amount: number): string {
  const rgb = hexToRgbArray(hex);
  if (!rgb) return hex;
  const [r, g, b] = rgb;
  const newR = Math.min(255, Math.round(r + (255 - r) * amount));
  const newG = Math.min(255, Math.round(g + (255 - g) * amount));
  const newB = Math.min(255, Math.round(b + (255 - b) * amount));
  return `${newR.toString(16).padStart(2, '0')}${newG
    .toString(16)
    .padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

function darkenHex(hex: string, amount: number): string {
  const rgb = hexToRgbArray(hex);
  if (!rgb) return hex;
  const [r, g, b] = rgb;
  const newR = Math.max(0, Math.round(r * (1 - amount)));
  const newG = Math.max(0, Math.round(g * (1 - amount)));
  const newB = Math.max(0, Math.round(b * (1 - amount)));
  return `${newR.toString(16).padStart(2, '0')}${newG
    .toString(16)
    .padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}