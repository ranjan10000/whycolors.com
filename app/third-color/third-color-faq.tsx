// third-color-faq.tsx
'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import type { ColorSuggestion, BaseAnalysis } from './third-color-utils';

interface ThirdColorFAQProps {
  base1: string;
  base2: string;
  base1Name: string;
  base2Name: string;
  suggestions: ColorSuggestion[];
  bestSuggestion: ColorSuggestion | null;
  trio: {
    primary: string;
    secondary: string;
    accent: string;
    accentInfo: ColorSuggestion;
    wcagAA: boolean;
  } | null;
  analysis: BaseAnalysis | null;
}

/**
 * Returns a human-readable WCAG contrast label.
 *
 * Note:
 * This classification is based on the minimum contrast ratio
 * between the suggested color and the two base colors.
 */
function getContrastLabel(ratio: number): string {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
}

/**
 * Returns a human-readable score label.
 *
 * This describes the tool's internal ranking score.
 * It should not be treated as a WCAG/accessibility rating.
 */
function getScoreLabel(score: number): string {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'very good';
  if (score >= 55) return 'good';
  if (score >= 40) return 'fair';
  if (score >= 25) return 'weak';
  return 'poor';
}

export default function ThirdColorFAQ({
  base1,
  base2,
  base1Name,
  base2Name,
  suggestions,
  bestSuggestion,
  trio,
  analysis,
}: ThirdColorFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  const faqs = useMemo(() => {
    const clean1 = base1.toUpperCase();
    const clean2 = base2.toUpperCase();

    const count = suggestions.length;
    const hasSuggestions = count > 0;
    const hasBestSuggestion = Boolean(bestSuggestion);

    const bestHex = bestSuggestion?.hex ?? '';
    const bestName = bestSuggestion?.name ?? '';
    const bestScore = bestSuggestion?.score ?? null;
    const bestWcag = bestSuggestion?.wcagLevel ?? '';
    const bestMinContrast = bestSuggestion?.minContrast ?? null;

    const bestC1 = bestSuggestion?.contrastWith?.[clean1] ?? null;
    const bestC2 = bestSuggestion?.contrastWith?.[clean2] ?? null;

    const scoreLabel =
      bestScore !== null ? getScoreLabel(bestScore) : '';

    const wcagLabel =
      bestMinContrast !== null
        ? getContrastLabel(bestMinContrast)
        : '';

    const currentResultText = hasBestSuggestion
      ? `${bestHex} (${bestName})`
      : 'No result yet';

    return [
      // ============================================================
      // 1. OVERVIEW
      // ============================================================
      {
        id: 'overview',
        question: 'What does the Third Color Finder actually do?',
        answer: hasSuggestions
          ? `You give two base colors — ${clean1} (${base1Name}) and ${clean2} (${base2Name}) — and this tool looks for a third color that:

1. Stands out against both bases using contrast ratios
2. Follows supported color-harmony relationships
3. Can work as an accent, button, icon, or other UI color

The tool evaluated ${count} candidate${count === 1 ? '' : 's'} for your current bases and ranked the available results. The current top result is ${currentResultText}.`
          : `You give two base colors — ${clean1} (${base1Name}) and ${clean2} (${base2Name}) — and this tool looks for a third color that:

1. Stands out against both bases
2. Follows supported color-harmony relationships
3. Can work as an accent, button, icon, or other UI color

Enter valid base colors to generate and rank the third-color suggestions.`,
      },

      // ============================================================
      // 2. HOW SCORING WORKS
      // ============================================================
      {
        id: 'scoring',
        question: 'How is each suggestion scored?',
        answer: `Each candidate receives an internal 0–100-style ranking score based on several factors used by the tool.

The scoring considers:

1. Minimum contrast
The weaker of the two contrast ratios matters most because the third color needs to work against both base colors.

2. Average contrast
The average contrast can provide an additional signal for how balanced the result is across the two bases.

3. WCAG-related bonuses
Candidates that meet stronger contrast thresholds against both bases can receive additional score weight.

4. Color harmony
Candidates can receive additional weight according to their supported harmony relationship, such as complementary, triadic, split-complementary, analogous, or monochromatic.

The score is the tool's ranking metric. It is separate from the WCAG badge, which describes contrast accessibility.

${
  hasBestSuggestion
    ? `Your current top result is ${bestScore}/100 — ${scoreLabel}.`
    : 'A score will appear after valid suggestions are generated.'
}`,
      },

      // ============================================================
      // 3. WCAG EXPLAINED
      // ============================================================
      {
        id: 'wcag',
        question:
          'What do the WCAG badges (AAA / AA / AA Large / FAIL) mean?',
        answer: `WCAG contrast levels describe how much contrast exists between the suggested color and the base colors.

• AAA — minimum contrast of 7:1
• AA — minimum contrast of 4.5:1
• AA Large — minimum contrast of 3:1 for qualifying large text
• FAIL — below 3:1

The tool uses the minimum contrast of the two base-color comparisons because the suggested color needs to be evaluated against both bases.

Large-text thresholds are based on WCAG's definition of large text rather than simply using an arbitrary pixel size.

${
  hasBestSuggestion && bestMinContrast !== null
    ? `Current result: ${bestWcag} with a minimum contrast of ${bestMinContrast.toFixed(
        2
      )}:1 (${wcagLabel}).`
    : 'The current WCAG result will appear when a suggestion is available.'
}`,
      },

      // ============================================================
      // 4. WHY MIN NOT AVG
      // ============================================================
      {
        id: 'min-vs-avg',
        question:
          'Why does the tool use minimum contrast instead of only the average?',
        answer: `Because a high average can hide a weak contrast on one of the bases.

For example, imagine a color with:

• 8:1 contrast against Base 1
• 1.2:1 contrast against Base 2

The average is 4.6:1, but the color still has very poor contrast against Base 2.

Using the minimum contrast makes the weaker relationship visible:

• Both base colors are evaluated
• A strong result cannot hide a weak result behind an average
• The tool can prioritize colors that work more consistently across the pair

This is why a color that looks strong against one base can still rank lower if it performs poorly against the other.`,
      },

      // ============================================================
      // 5. HARMONY TYPES
      // ============================================================
      {
        id: 'harmonies',
        question:
          'What are complementary, triadic, and split-complementary harmonies?',
        answer: `These are common color-wheel relationships used by the tool:

• Complementary — colors positioned approximately opposite each other on the color wheel.
• Triadic — three colors distributed approximately 120° apart.
• Split-Complementary — colors positioned around the complement, creating a softer variation of a complementary relationship.
• Analogous — neighboring hues on the color wheel.
• Monochromatic — variations of a color using changes in lightness and/or saturation.

Each suggestion can be tagged with its harmony type. Harmony is one of the factors used by the ranking system; it does not replace the contrast check.`,
      },

      // ============================================================
      // 6. BASE ANALYSIS
      // ============================================================
      {
        id: 'base-analysis',
        question:
          'Why did I get a warning about my two base colors?',
        answer: !analysis
          ? `The base-color analysis is not available yet.

Enter valid base colors and allow the tool to calculate the relationship between them. The analysis can then show the lightness and hue differences and, when applicable, provide a suggestion for adjusting one of the bases.`
          : !analysis.isBalanced
            ? `Your two bases currently have approximately ${Math.round(
                analysis.levelDiff * 100
              )}% lightness difference and ${Math.round(
                analysis.hueDiff
              )}° hue difference.

For this tool's base-balance check, a stronger separation can come from either:

• A sufficiently large lightness gap
• A sufficiently large hue gap

Right now, the current analysis does not meet the tool's balance conditions, so finding a third color that contrasts strongly with both bases may be more difficult.

${
  analysis.suggestion
    ? `Suggestion: change ${
        analysis.suggestion.base === 'base1' ? 'Base 1' : 'Base 2'
      } to ${analysis.suggestion.newHex} — ${
        analysis.suggestion.reason
      }.`
    : 'Suggestion: adjust the lightness or hue of one of the base colors and try again.'
}`
            : `Your two bases currently meet the tool's balance conditions, so the algorithm has more room to find third-color candidates.

Current balance:

• Lightness gap: ${Math.round(
                analysis.levelDiff * 100
              )}%
• Hue gap: ${Math.round(analysis.hueDiff)}°

A balanced pair does not guarantee that every candidate will pass WCAG, but it can give the algorithm more useful options.`,
      },

      // ============================================================
      // 7. BEST MATCH
      // ============================================================
      {
        id: 'best-match',
        question: hasBestSuggestion
          ? `Why is ${bestHex} ranked as the best match?`
          : 'Why has no best match been selected yet?',
        answer: hasBestSuggestion
          ? `${bestHex} (${bestName}) currently has the highest ranking score among the available suggestions.

Its current details are:

• Contrast vs Base 1 (${clean1}): ${
              bestC1 !== null ? `${bestC1.toFixed(2)}:1` : 'Not available'
            }
• Contrast vs Base 2 (${clean2}): ${
              bestC2 !== null ? `${bestC2.toFixed(2)}:1` : 'Not available'
            }
• WCAG level: ${bestWcag || 'Not available'}
• Harmony: ${bestSuggestion?.harmony ?? 'Not available'}
• Reason: ${bestSuggestion?.reason ?? 'Not available'}

The ranking combines the tool's scoring factors, including contrast and harmony. The score itself is not a replacement for checking the actual WCAG contrast ratios.`
          : `There is no best match yet.

A best match is selected after the tool has valid base colors and has generated candidate suggestions.`,
      },

      // ============================================================
      // 8. LOW SCORE
      // ============================================================
      {
        id: 'low-score',
        question: hasBestSuggestion
          ? `The best score is ${bestScore}. What does that mean?`
          : 'What does the score mean?',
        answer: !hasBestSuggestion
          ? `The score is the tool's internal ranking value for comparing the generated candidates.

It considers factors such as contrast and color harmony. The score should be read together with the individual C1/C2 contrast ratios and WCAG badge.

No score is available until the tool generates suggestions.`
          : bestScore !== null && bestScore >= 85
            ? `${bestScore}/100 is in the tool's "excellent" score range.

This indicates that the candidate ranks strongly according to the tool's scoring model. Still check the individual C1/C2 contrast values and WCAG badge for the specific text or UI use case.`
            : bestScore !== null && bestScore >= 70
              ? `${bestScore}/100 is in the tool's "very good" score range.

The candidate ranks strongly according to the tool's scoring model. For text, always verify the WCAG badge and the individual contrast ratios rather than relying on the score alone.`
              : bestScore !== null && bestScore >= 55
                ? `${bestScore}/100 is in the tool's "good" score range.

The candidate may be useful for accents, buttons, icons, or other UI elements depending on the actual contrast values. Check C1, C2, and the WCAG level for text usage.`
                : bestScore !== null && bestScore >= 40
                  ? `${bestScore}/100 is in the tool's "fair" score range.

The candidate may still be useful for decorative or non-text UI purposes. If you need accessible text, verify the actual WCAG contrast ratios.`
                  : `${bestScore}/100 is in the tool's lower score range.

This means the current candidates do not rank strongly according to the tool's scoring model. Consider adjusting one of the base colors and generating the suggestions again.`,
      },

      // ============================================================
      // 9. C1 C2 NUMBERS
      // ============================================================
      {
        id: 'c1-c2',
        question:
          'What are the "C1" and "C2" numbers under each suggestion?',
        answer: `These are the contrast ratios between the suggested color and each base color:

• C1 = contrast against Base Color 1 (${clean1})
• C2 = contrast against Base Color 2 (${clean2})

The contrast ratio follows the WCAG relative-luminance formula:

(L1 + 0.05) / (L2 + 0.05)

where L1 is the lighter relative luminance and L2 is the darker relative luminance.

Useful reference points:

• 1:1 = no luminance contrast
• 3:1 = minimum contrast ratio used for qualifying large text
• 4.5:1 = minimum contrast ratio for normal-sized text under WCAG AA
• 7:1 = WCAG AAA contrast ratio for normal-sized text
• 21:1 = maximum possible contrast ratio

For a color to meet AA contrast against both bases, both C1 and C2 need to meet the applicable threshold.`,
      },

      // ============================================================
      // 10. TRIO PREVIEW
      // ============================================================
      {
        id: 'trio',
        question: 'What is the Trio Preview at the bottom?',
        answer: trio
          ? `The Trio Preview combines your two base colors with the selected accent:

• Primary: ${trio.primary}
• Secondary: ${trio.secondary}
• Accent: ${trio.accent} (${trio.accentInfo.name}, ${trio.accentInfo.harmony})

The WCAG indicator checks whether the selected accent reaches the tool's AA contrast requirement against both bases.

Current result: ${
              trio.wcagAA
                ? 'Yes — the accent meets the tool’s AA contrast check against both bases.'
                : 'No — at least one of the accent-to-base contrast checks is below 4.5:1.'
            }

Clicking another suggestion can replace the accent and update the trio preview.`
          : `No trio is available yet.

Enter valid base colors and generate suggestions. Once a candidate is selected, the Trio Preview can show the two bases together with the selected accent.`,
      },

      // ============================================================
      // 11. WHY SOME COLORS ARE MISSING
      // ============================================================
      {
        id: 'missing',
        question:
          "Why don't I see the color I wanted as a suggestion?",
        answer: `The tool does not attempt to display every possible color.

Candidates can be filtered or ranked based on factors such as:

1. Supported harmony relationships
2. The minimum contrast requirement
3. The candidate's ranking score
4. The number of results the interface chooses to display

A color you expected may therefore be missing because it does not meet one of the candidate conditions or does not rank highly enough to appear in the visible results.

The tool is a recommendation aid rather than a rule that says which colors you must use. If you already have a specific color in mind, you can evaluate its contrast ratios separately.`,
      },

      // ============================================================
      // 12. DARK VS LIGHT
      // ============================================================
      {
        id: 'dark-light',
        question:
          'Do dark and light mode affect the suggestions?',
        answer: `The color suggestions are based on the base-color values supplied to the algorithm rather than the surrounding website theme.

Contrast ratios are mathematically independent of whether the surrounding interface is displayed in dark mode or light mode.

What can change with the website theme is the surrounding UI of the tool itself. The color-generation and contrast calculations use the supplied color values.`,
      },

      // ============================================================
      // 13. USAGE
      // ============================================================
      {
        id: 'usage',
        question: 'How do I use the result in my project?',
        answer: `Each suggestion provides information that can help you decide how to use the color:

• Hex code — useful for CSS, Tailwind, Figma, and other design tools
• WCAG level — summarizes the minimum contrast result
• C1 and C2 — show the exact contrast ratios against both bases
• Harmony type — explains the color relationship used by the algorithm

A practical workflow is:

1. Choose your two base colors
2. Review the generated suggestions
3. Check the C1 and C2 contrast ratios
4. Check the WCAG level for text-related use
5. Use the Trio Preview to see the three colors together
6. If the available results are weak, adjust one of the base colors and try again

The internal score is useful for comparing candidates, but it should not replace the actual contrast values.`,
      },

      // ============================================================
      // 14. CACHE
      // ============================================================
      {
        id: 'performance',
        question: 'Why is the result instant when I change colors?',
        answer: `The tool can use cached calculations to avoid repeating expensive work for the same inputs.

The current implementation can cache:

1. Third-color suggestions
Previously calculated base-color pairs can be reused instead of recalculated.

2. Color-name lookups
Color-name calculations can also be cached because repeated name generation can be relatively expensive.

This can make repeated color combinations feel much faster after they have already been calculated.

The cache is an implementation detail and does not change the underlying color values or scoring rules.`,
      },
    ];
  }, [
    base1,
    base2,
    base1Name,
    base2Name,
    suggestions,
    bestSuggestion,
    trio,
    analysis,
  ]);

  return (
    <section
      className="border border-neutral-200 dark:border-white/10 rounded-2xl p-4 shadow-sm bg-white/90 dark:bg-[#131322]/80 transition-colors"
      aria-labelledby="thirdcolorfaq-title"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-200 dark:border-white/10">
        <div
          className="p-2.5 border rounded-lg bg-purple-100 dark:bg-[#8b5cf6]/20 border-purple-300 dark:border-[#8b5cf6]/30 text-purple-700 dark:text-[#a78bfa]"
          aria-hidden="true"
        >
          <HelpCircle className="w-6 h-6" />
        </div>

        <div>
          <h2
            id="thirdcolorfaq-title"
            className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white"
          >
            Third Color FAQ
          </h2>

          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            How we find a third color for {base1.toUpperCase()} +{' '}
            {base2.toUpperCase()}
          </p>
        </div>
      </div>

      {/* FAQ List */}
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
              {/* Question */}
              <button
                type="button"
                onClick={() => toggleFAQ(index)}
                className={`w-full flex items-center justify-between p-4 text-left transition-colors rounded-xl ${
                  isOpen
                    ? 'bg-neutral-50 dark:bg-white/5'
                    : 'hover:bg-neutral-50 dark:hover:bg-white/5'
                }`}
                aria-expanded={isOpen}
                aria-controls={`thirdcolorfaq-answer-${index}`}
              >
                <span
                  id={`thirdcolorfaq-question-${index}`}
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

              {/* Answer */}
              <div
                id={`thirdcolorfaq-answer-${index}`}
                role="region"
                aria-labelledby={`thirdcolorfaq-question-${index}`}
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