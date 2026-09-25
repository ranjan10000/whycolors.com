'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

// ============ TYPES ============

interface ColorEntry {
  id: string;
  hex: string;
  weight: number;
}

interface MixFAQProps {
  colors: ColorEntry[];
  result: {
    hex: string;
    name: string;
  };
  percentages: number[];
  totalWeight: number;
}

// ============ LOCAL HELPERS ============

function normalizeHex(hex: string): string {
  const clean = hex.replace('#', '').trim().toUpperCase();

  if (!/^[0-9A-F]{6}$/.test(clean)) {
    return '000000';
  }

  return clean;
}

function hexToRgb(hex: string): {
  r: number;
  g: number;
  b: number;
} {
  const clean = normalizeHex(hex);

  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function hexToHsl(hex: string): {
  h: number;
  s: number;
  l: number;
} {
  const { r, g, b } = hexToRgb(hex);

  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;

  const max = Math.max(rN, gN, bN);
  const min = Math.min(rN, gN, bN);

  let h = 0;
  let s = 0;

  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;

    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    if (max === rN) {
      h = ((gN - bN) / d + (gN < bN ? 6 : 0)) / 6;
    } else if (max === gN) {
      h = ((bN - rN) / d + 2) / 6;
    } else {
      h = ((rN - gN) / d + 4) / 6;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function getRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);

  const toLinear = (channel: number): number => {
    const value = channel / 255;

    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  };

  return (
    0.2126 * toLinear(r) +
    0.7152 * toLinear(g) +
    0.0722 * toLinear(b)
  );
}

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getRelativeLuminance(hex1);
  const l2 = getRelativeLuminance(hex2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

function getBrightnessLabel(hex: string): string {
  const { l } = hexToHsl(hex);

  if (l <= 10) return 'very dark';
  if (l <= 25) return 'dark';
  if (l <= 40) return 'medium-dark';
  if (l <= 60) return 'medium';
  if (l <= 75) return 'light';
  if (l <= 90) return 'very light';

  return 'near-white';
}

function getTemperatureLabel(hex: string): string {
  const { h, s } = hexToHsl(hex);

  if (s <= 10) {
    return 'neutral';
  }

  if (h < 60 || h >= 300) {
    return 'warm';
  }

  if (h >= 180 && h < 300) {
    return 'cool';
  }

  return 'balanced';
}

// ============ COMPONENT ============

export default function MixFAQ({
  colors,
  result,
  percentages,
  totalWeight,
}: MixFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  const fullHex = `#${normalizeHex(result.hex)}`;

  const allZero =
    totalWeight <= 0 ||
    colors.every((color) => color.weight <= 0);

  const faqs = useMemo(() => {
    const count = colors.length;

    const totalPct = percentages.reduce(
      (sum, percentage) => sum + percentage,
      0
    );

    const uniqueHexes = new Set(
      colors.map((color) => normalizeHex(color.hex))
    );

    const duplicateCount = colors.length - uniqueHexes.size;
    const hasDuplicates = duplicateCount > 0;

    // Find the largest normalized percentage.
    const dominantIdx =
      percentages.length > 0
        ? percentages.reduce(
            (bestIndex, percentage, index) =>
              percentage > (percentages[bestIndex] ?? 0)
                ? index
                : bestIndex,
            0
          )
        : -1;

    const dominant =
      dominantIdx >= 0 ? colors[dominantIdx] : undefined;

    const dominantPct =
      dominantIdx >= 0
        ? percentages[dominantIdx] ?? 0
        : 0;

    const formula =
      colors.length > 0
        ? colors
            .map((color, index) => {
              const percentage = percentages[index] ?? 0;
              return `${normalizeHex(color.hex)} × ${percentage}%`;
            })
            .join(' + ') + ` = ${fullHex}`
        : `No input colors = ${fullHex}`;

    // ------------------------------------------------------------
    // Result information
    // ------------------------------------------------------------

    const whiteContrast = getContrastRatio(fullHex, '#FFFFFF');
    const blackContrast = getContrastRatio(fullHex, '#000000');

    const bestTextColor =
      whiteContrast >= blackContrast ? 'white' : 'black';

    const bestContrast = Math.max(whiteContrast, blackContrast);

    const isAANormal = bestContrast >= 4.5;
    const isAALarge = bestContrast >= 3;
    const isAAANormal = bestContrast >= 7;

    const brightness = getBrightnessLabel(fullHex);
    const temperature = getTemperatureLabel(fullHex);

    const hsl = hexToHsl(fullHex);
    const rgb = hexToRgb(fullHex);
    const luminance = getRelativeLuminance(fullHex);

    // ✅ FIX #3: Safe display name
    const displayName = result.name?.trim() || 'Unnamed Color';

    // ------------------------------------------------------------
    // FAQ
    // ------------------------------------------------------------

    return [
      {
        id: 'result',

        question: `What color is the mixed result ${fullHex}?`,

        answer: allZero
          ? `All color weights are currently 0, so the mixer has no weighted color contribution to calculate. The current result is ${fullHex}. Increase at least one color weight to generate a weighted mix.`
          : `The mixed result of your ${count} color${
              count !== 1 ? 's' : ''
            } is ${fullHex}, identified as "${displayName}".

It is a ${brightness}, ${temperature} color with:

• H: ${hsl.h}°
• S: ${hsl.s}%
• L: ${hsl.l}%
• Relative luminance: ${luminance.toFixed(3)}

This is the final color produced by the mixer's weighted RGB blending process.`,
      },

      {
        id: 'formula',

        question: `How was ${fullHex} computed from the colors?`,

        answer: allZero
          ? `No weighted mix can be calculated while every color has a weight of 0.

Current result: ${fullHex}.`
          : `The current normalized weight distribution is:

${formula}

The percentages describe each color's normalized share of the total weight.

The actual color calculation uses the mixer's weighted RGB blending process. If the implementation blends colors sequentially, the order of the input colors can affect the final RGB result.`,
      },

      {
        id: 'algorithm',

        question: 'What mixing algorithm is used?',

        answer: `This mixer uses weighted RGB color blending.

The process works with the RGB channels of each input color rather than simulating physical paint or additive light.

Conceptually:

1. Each color has a numeric weight.
2. The weights determine the relative contribution of each color.
3. RGB channel values are combined according to those weighted contributions.
4. The resulting RGB channels are converted back into a HEX color.

The percentages shown in the interface describe the normalized weight distribution.

If the underlying mixer performs the blending sequentially, changing the order of the colors can also change the final result. This is different from a simple order-independent weighted average.`,
      },

      {
        id: 'dominant',

        question: 'Which color dominates the mix?',

        answer: allZero
          ? `No color currently dominates because all weights are 0.`
          : dominant
            ? `${normalizeHex(
                dominant.hex
              )} has the largest normalized share at ${dominantPct}%.

It therefore has the largest individual contribution to the mix.

To move the result toward another color, increase that color's weight or reduce the dominant color's weight.`
            : `There is not enough weighted color data to determine a dominant color.`,
      },

      {
        id: 'weights',

        question: 'How do the weights affect the result?',

        answer: `Weights are relative.

For example, weights:

1 : 1 : 2

have the same proportions as:

0.5 : 0.5 : 1

Both represent:

25% / 25% / 50%

The important factor is the ratio between the weights, not their absolute scale.

However, the exact final color also depends on the RGB blending method used by the mixer.`,
      },

      {
        id: 'percentages',

        question:
          'What do the percentages next to each color mean?',

        answer: allZero
          ? `All weights are currently 0, so there is no meaningful percentage distribution to display.

Increase at least one color weight to see normalized percentages.`
          : `Each percentage represents that color's normalized share of the total input weight.

For ${count} color${
              count !== 1 ? 's' : ''
            }, the displayed percentages currently add up to ${totalPct}%.

The UI may use integer rounding when displaying percentages. If the implementation uses a largest-remainder allocation, the displayed integer percentages can be made to sum exactly to 100%.`,
      },

      {
        id: 'muddy',

        question:
          'Why does the result look muddy or gray with many colors?',

        answer: `Mixing several different RGB colors can move the final result toward less saturated colors.

When colors from different hue regions contribute similar amounts, their RGB channel values can converge toward neutral or muted colors such as gray, brown, olive, or other desaturated tones.

This is normal behavior for RGB interpolation.

If you want a more vivid result, try using fewer colors or adjusting their weights so one or more colors have a stronger contribution.`,
      },

      {
        id: 'unique',

        question: 'Are there duplicate colors in this mix?',

        answer: hasDuplicates
          ? `Yes. There are ${duplicateCount} duplicate color entr${
              duplicateCount !== 1 ? 'ies' : 'y'
            } among your ${colors.length} input${
              colors.length !== 1 ? 's' : ''
            }.

Duplicate colors are still separate entries, so their weights contribute independently.

If two entries contain the same HEX value, combining their weights would normally preserve the same overall weighted contribution.`
          : `No duplicates were found. All ${colors.length} input color${
              colors.length !== 1 ? 's are' : ' is'
            } unique.`,
      },

      {
        id: 'accessibility',

        question: `Is ${fullHex} accessible for text?`,

        answer: `For ${fullHex} as a background:

• White text: ${whiteContrast.toFixed(2)}:1
• Black text: ${blackContrast.toFixed(2)}:1

The stronger contrast is ${bestContrast.toFixed(2)}:1 with ${bestTextColor} text.

WCAG contrast checks for that stronger text/background combination:

• Normal text — AA (4.5:1): ${
            isAANormal ? '✅ Pass' : '❌ Fail'
          }
• Large text — AA (3:1): ${
            isAALarge ? '✅ Pass' : '❌ Fail'
          }
• Normal text — AAA (7:1): ${
            isAAANormal ? '✅ Pass' : '❌ Fail'
          }

These checks describe the contrast between this background and the selected black or white text. Actual accessibility should be evaluated for the specific text size, weight, UI context, and foreground/background combination you intend to use.`,
      },

      {
        id: 'export',

        question: 'How can I save or share this mix?',

        answer: `Use the export controls in the Mix Breakdown section, if available.

Typical export options include:

• Copy Formula — ${formula}
• Copy Table — useful for spreadsheets or text editors
• Download CSV — useful for Excel or Google Sheets
• Download JSON — useful for structured data and code

The exported data can preserve the input colors, their weights or percentages, and the final result ${fullHex}.`,
      },

      {
        id: 'presets',

        question: 'Why do the presets give such different results?',

        answer: `Presets use predefined groups of colors and weights.

Different groups can produce very different results because RGB blending depends on the RGB channel values and relative contributions of the input colors.

For example:

• RGB-style combinations can move toward neutral colors when their channels balance.
• Warm multi-hue combinations can produce muted orange, brown, or olive-like results.
• Black and white combinations produce grayscale results.

Presets are starting points. Adjusting individual weights lets you steer the final result.`,
      },

      {
        id: 'hex-vs-rgb',

        question: `What's the difference between HEX and RGB for this color?`,

        answer: `HEX and RGB are two representations of the same color.

For ${fullHex}:

• HEX: ${fullHex}
• RGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})

HEX uses hexadecimal notation and is commonly used in CSS and HTML.

RGB uses decimal values from 0 to 255 for the red, green, and blue channels.

Both representations describe the same RGB color.`,
      },
    ];
  }, [colors, result, percentages, totalWeight]);

  return (
    <section
      className="border border-neutral-200 dark:border-white/10 rounded-2xl p-4 shadow-sm bg-white/90 dark:bg-[#131322]/80 transition-colors"
      aria-labelledby="mixfaq-title"
    >
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-200 dark:border-white/10">
        <div
          className="p-2.5 border rounded-lg bg-purple-100 dark:bg-[#8b5cf6]/20 border-purple-300 dark:border-[#8b5cf6]/30 text-purple-700 dark:text-[#a78bfa]"
          aria-hidden="true"
        >
          <HelpCircle className="w-6 h-6" />
        </div>

        <div>
          <h2
            id="mixfaq-title"
            className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white"
          >
            Mix FAQ
          </h2>

          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Frequently Asked Questions about mixing {colors.length} color
            {colors.length !== 1 ? 's' : ''} → {fullHex}
          </p>
        </div>
      </div>

      {/* FAQ LIST */}
      <div className="space-y-3">
        {faqs.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={item.id}
              className={`border rounded-xl transition-all duration-200 border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 ${
                isOpen ? 'shadow-md' : ''
              }`}
            >
              {/* QUESTION */}
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                className={`w-full flex items-center justify-between p-4 text-left transition-colors rounded-xl ${
                  isOpen
                    ? 'bg-neutral-50 dark:bg-white/5'
                    : 'hover:bg-neutral-50 dark:hover:bg-white/5'
                }`}
                aria-expanded={isOpen}
                aria-controls={`mixfaq-answer-${index}`}
              >
                <span
                  id={`mixfaq-question-${index}`}
                  className="font-semibold text-base text-neutral-800 dark:text-neutral-200 pr-4"
                >
                  {item.question}
                </span>

                {isOpen ? (
                  <ChevronUp
                    className="w-5 h-5 flex-shrink-0 text-neutral-500 dark:text-neutral-400"
                    aria-hidden="true"
                  />
                ) : (
                  <ChevronDown
                    className="w-5 h-5 flex-shrink-0 text-neutral-500 dark:text-neutral-400"
                    aria-hidden="true"
                  />
                )}
              </button>

              {/* ANSWER */}
              <div
                id={`mixfaq-answer-${index}`}
                role="region"
                aria-labelledby={`mixfaq-question-${index}`}
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-4 text-base leading-relaxed whitespace-pre-line text-neutral-600 dark:text-neutral-300">
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}