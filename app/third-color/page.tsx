'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  findThirdColors,
  buildTrio,
  analyzeBaseColors,
  getColorInfo,
  isValidHex,
  preCacheColorNames,
  type ColorSuggestion,
} from './third-color-utils';
import ThirdColorFAQ from './third-color-faq';

const WCAG_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  AAA: {
    bg: 'bg-green-100 dark:bg-green-900/40',
    text: 'text-green-700 dark:text-green-300',
    label: 'AAA ✅',
  },
  AA: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    label: 'AA ✅',
  },
  'AA-Large': {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-300',
    label: 'AA Large ⚠️',
  },
  FAIL: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
    label: 'FAIL ❌',
  },
};

export default function ThirdColorFinder() {
  const [base1, setBase1] = useState('#0E94CD');
  const [base2, setBase2] = useState('#331AEA');
  const [selected, setSelected] = useState<ColorSuggestion | null>(null);

  useEffect(() => {
    preCacheColorNames();
  }, []);

  const suggestions = useMemo(() => {
    if (!isValidHex(base1) || !isValidHex(base2)) return [];
    return findThirdColors(base1, base2, 8);
  }, [base1, base2]);

  const trio = useMemo(() => {
    if (!isValidHex(base1) || !isValidHex(base2)) return null;
    return buildTrio(base1, base2, selected?.hex);
  }, [base1, base2, selected]);

  const analysis = useMemo(() => {
    if (!isValidHex(base1) || !isValidHex(base2)) return null;
    return analyzeBaseColors(base1, base2);
  }, [base1, base2]);

  const info1 = useMemo(() => getColorInfo(base1), [base1]);
  const info2 = useMemo(() => getColorInfo(base2), [base2]);

  const bestSuggestion = suggestions[0];

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white p-6 md:p-10 transition-colors">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-3">
        Third Color Finder
      </h1>
      <p className="text-center text-base text-neutral-500 dark:text-neutral-400 mb-10">
        Pick two base colors — we&apos;ll suggest the perfect third with WCAG contrast info.
      </p>

      {/* Base color pickers */}
      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-6">
        {[
          { label: 'Base Color 1', value: base1, set: setBase1, info: info1 },
          { label: 'Base Color 2', value: base2, set: setBase2, info: info2 },
        ].map((c, i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm dark:shadow-none transition-colors"
          >
            <label className="block text-base text-neutral-500 dark:text-neutral-400 mb-3">
              {c.label}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={c.value}
                onChange={(e) => c.set(e.target.value)}
                className="w-16 h-16 rounded-lg cursor-pointer bg-transparent border border-neutral-300 dark:border-neutral-700"
              />
              <input
                type="text"
                value={c.value}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) c.set(v);
                }}
                className="flex-1 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-lg px-3 py-2 font-mono text-base outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="mt-3 text-base">
              <p className="font-semibold">{c.info.name}</p>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                Family: {c.info.family} • HSL({c.info.hsl.hue}, {c.info.hsl.saturation}%, {c.info.hsl.lightness}%)
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Base analysis warning */}
      {analysis && !analysis.isBalanced && (
        <div className="max-w-3xl mx-auto mb-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700/50 rounded-xl p-4 transition-colors">
          <p className="text-yellow-800 dark:text-yellow-300 text-base mb-2">
            ⚠️ {analysis.warning}
          </p>
          {analysis.suggestion && (
            <div className="flex items-center gap-3 text-base">
              <span className="text-neutral-600 dark:text-neutral-300">Try:</span>
              <button
                onClick={() => {
                  if (analysis.suggestion!.base === 'base1') setBase1(analysis.suggestion!.newHex);
                  else setBase2(analysis.suggestion!.newHex);
                }}
                className="flex items-center gap-2 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-lg px-3 py-1.5 transition"
              >
                <span
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: analysis.suggestion.newHex }}
                />
                <span className="font-mono text-sm">{analysis.suggestion.newHex}</span>
                <span className="text-neutral-500 dark:text-neutral-400 text-sm">
                  for {analysis.suggestion.base}
                </span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Best match highlight */}
      {bestSuggestion && (
        <div className="max-w-3xl mx-auto mb-8 text-center">
          <p className="text-base text-neutral-500 dark:text-neutral-400 mb-1">Best match</p>
          <p className="text-3xl font-bold">
            {bestSuggestion.name}{' '}
            <span className="text-neutral-400 dark:text-neutral-500 font-mono text-lg">
              {bestSuggestion.hex}
            </span>{' '}
            <span
              className={`text-sm px-2.5 py-1 rounded ${WCAG_STYLES[bestSuggestion.wcagLevel].bg} ${WCAG_STYLES[bestSuggestion.wcagLevel].text}`}
            >
              {WCAG_STYLES[bestSuggestion.wcagLevel].label}
            </span>
          </p>
          {bestSuggestion.score < 40 && (
            <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-2">
              Low score — no perfect contrast match found for these base colors.
            </p>
          )}
        </div>
      )}

      {/* Suggestions */}
      <h2 className="text-2xl font-semibold mb-5 text-center">Matching Third Colors</h2>

      {suggestions.length === 0 ? (
        <p className="text-center text-neutral-400 dark:text-neutral-500 text-base">
          Enter valid hex colors.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {suggestions.map((s) => {
            const wcag = WCAG_STYLES[s.wcagLevel];
            return (
              <button
                key={s.hex}
                onClick={() => setSelected(s)}
                className={`text-left rounded-xl overflow-hidden border transition ${
                  selected?.hex === s.hex
                    ? 'border-red-500 ring-2 ring-red-500'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
                }`}
              >
                <div className="h-28 w-full" style={{ backgroundColor: s.hex }} />
                <div className="p-3 bg-white dark:bg-neutral-900 transition-colors">
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="font-bold text-base truncate">{s.name}</p>
                    <span className="text-sm bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded shrink-0">
                      {s.score}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">
                    {s.hex}
                  </p>

                  <div
                    className={`mt-1.5 inline-block text-xs px-2 py-0.5 rounded ${wcag.bg} ${wcag.text}`}
                  >
                    {wcag.label}
                  </div>

                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 line-clamp-2">
                    {s.reason}
                  </p>
                  <div className="flex gap-2 mt-1.5 text-xs text-neutral-400 dark:text-neutral-500 font-mono">
                    <span>C1: {s.contrastWith[base1.toUpperCase()] ?? '-'}</span>
                    <span>C2: {s.contrastWith[base2.toUpperCase()] ?? '-'}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Trio Preview */}
      {trio && (
        <div className="mt-12 max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold mb-4 text-center">Trio Preview</h3>
          <div className="flex rounded-2xl overflow-hidden h-32 shadow-xl">
            <div className="flex-1 flex items-end p-3" style={{ backgroundColor: trio.primary }}>
              <span className="text-sm font-mono bg-black/40 text-white px-2 py-1 rounded">
                {trio.primary}
              </span>
            </div>
            <div className="flex-1 flex items-end p-3" style={{ backgroundColor: trio.secondary }}>
              <span className="text-sm font-mono bg-black/40 text-white px-2 py-1 rounded">
                {trio.secondary}
              </span>
            </div>
            <div className="flex-1 flex items-end p-3" style={{ backgroundColor: trio.accent }}>
              <span className="text-sm font-mono bg-black/40 text-white px-2 py-1 rounded">
                {trio.accent}
              </span>
            </div>
          </div>
          <div className="mt-4 text-center text-base space-y-1">
            <p>
              Accent: <span className="font-semibold">{trio.accentInfo.name}</span>{' '}
              <span className="text-neutral-400 dark:text-neutral-500">
                ({trio.accentInfo.harmony})
              </span>
            </p>
            <p
              className={
                trio.wcagAA
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-yellow-600 dark:text-yellow-400'
              }
            >
              {trio.wcagAA
                ? '✅ WCAG AA compliant against both base colors'
                : '⚠️ Some contrast ratios below 4.5'}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto mt-12">
        <ThirdColorFAQ
          base1={base1}
          base2={base2}
          base1Name={info1.name}
          base2Name={info2.name}
          suggestions={suggestions}
          bestSuggestion={bestSuggestion ?? null}
          trio={trio}
          analysis={analysis}
        />
      </div>
    </main>
  );
}