'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  mixColors,
  getColorName,
  distributePercentages,
} from '@/lib/color-utils';
import MixFAQ from './MixFAQ';

// ============ TYPES ============
interface ColorEntry {
  id: string;
  hex: string;
  weight: number;
}

type SortKey = 'index' | 'hex' | 'percent' | 'name';
type SortDir = 'asc' | 'desc';
type ViewMode = 'compact' | 'detailed';

// ============ UNIQUE ID ============
let idCounter = 0;
const genId = () => `c-${++idCounter}`;

// ============ VALIDATION ============
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

// ============ PRESETS ============
const PRESETS = [
  { label: 'White + Black', colors: ['#FFFFFF', '#000000'] },
  { label: 'Red + Blue', colors: ['#FF0000', '#0000FF'] },
  { label: 'Cyan + Magenta', colors: ['#00FFFF', '#FF00FF'] },
  { label: 'Yellow + Blue', colors: ['#FFFF00', '#0000FF'] },
  { label: 'RGB', colors: ['#FF0000', '#00FF00', '#0000FF'] },
  { label: 'CMY', colors: ['#00FFFF', '#FF00FF', '#FFFF00'] },
  { label: 'Sunset', colors: ['#FF6B6B', '#FFD93D', '#6BCB77'] },
  {
    label: 'Rainbow',
    colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
  },
];

// ============ DEFAULT ============
const DEFAULT_COLORS: ColorEntry[] = [
  { id: genId(), hex: '#FFFFFF', weight: 0.5 },
  { id: genId(), hex: '#000000', weight: 0.5 },
];

// ============ MIX N COLORS ============
function mixNColors(colors: ColorEntry[]): { hex: string; name: string } {
  const valid = colors.filter((c) => HEX_RE.test(c.hex));
  if (valid.length === 0) return { hex: '#000000', name: 'Black' };
  if (valid.length === 1) {
    return {
      hex: valid[0].hex.toUpperCase(),
      name: getColorName(valid[0].hex),
    };
  }

  const total = valid.reduce((s, c) => s + c.weight, 0);
  if (total <= 0) return { hex: '#000000', name: 'Black' };

  let result = valid[0].hex;
  let accumulated = valid[0].weight;

  for (let i = 1; i < valid.length; i++) {
    accumulated += valid[i].weight;
    const ratio = accumulated === 0 ? 0 : valid[i].weight / accumulated;
    result = mixColors(result, valid[i].hex, ratio).hex;
  }

  return { hex: result.toUpperCase(), name: getColorName(result) };
}

export default function MixResultPage() {
  const [colors, setColors] = useState<ColorEntry[]>(DEFAULT_COLORS);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState<SortKey>('index');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('detailed');
  const [copied, setCopied] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ============ DARK MODE ============
  useEffect(() => {
    const check = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const hasDarkClass = document.documentElement.classList.contains('dark');
      setIsDark(prefersDark || hasDarkClass);
    };
    check();

    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', check);

    return () => {
      observer.disconnect();
      mq.removeEventListener('change', check);
    };
  }, []);

  // ============ TIMER CLEANUP ============
  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // ============ COMPUTED ============
  const mixed = useMemo(() => mixNColors(colors), [colors]);

  const rawTotalWeight = useMemo(
    () => colors.reduce((s, c) => s + c.weight, 0),
    [colors]
  );
  const allWeightsZero = rawTotalWeight <= 0;

  const pcts = useMemo(
    () => distributePercentages(colors.map((c) => c.weight)),
    [colors]
  );
  const pctSum = pcts.reduce((s, p) => s + p, 0);

  // ============ TABLE DATA ============
  const tableData = useMemo(() => {
    const rows = colors.map((c, i) => ({
      id: c.id,
      index: i + 1,
      hex: c.hex.toUpperCase(),
      rawHex: c.hex,
      name: HEX_RE.test(c.hex) ? getColorName(c.hex) : '—',
      percent: pcts[i] ?? 0,
      rawPercent: pcts[i] ?? 0,
    }));

    if (sortKey === 'index') {
      return sortDir === 'asc' ? rows : [...rows].reverse();
    }

    return [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'hex') cmp = a.hex.localeCompare(b.hex);
      else if (sortKey === 'percent') cmp = a.rawPercent - b.rawPercent;
      else if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [colors, sortKey, sortDir, pcts]);

  // ============ ACTIONS ============
  const addColor = () => {
    const defaults = [
      '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
      '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#14B8A6',
    ];
    const used = new Set(colors.map((c) => c.hex.toUpperCase()));
    const newHex = defaults.find((h) => !used.has(h.toUpperCase())) ?? '#888888';
    setColors([...colors, { id: genId(), hex: newHex, weight: 0.5 }]);
  };

  const removeColor = (id: string) => {
    if (colors.length <= 1) return;
    setColors(colors.filter((c) => c.id !== id));
    setDrafts((d) => {
      const next = { ...d };
      delete next[id];
      return next;
    });
  };

  const updateColor = (id: string, hex: string) => {
    if (!HEX_RE.test(hex)) return;
    setColors(colors.map((c) => (c.id === id ? { ...c, hex } : c)));
  };

  const updateWeight = (id: string, weight: number) => {
    const next = colors.map((c) => (c.id === id ? { ...c, weight } : c));
    const total = next.reduce((s, c) => s + c.weight, 0);
    if (total <= 0) {
      setColors(next.map((c) => (c.id === id ? { ...c, weight: 0.01 } : c)));
    } else {
      setColors(next);
    }
  };

  const handleHexChange = (id: string, value: string) => {
    if (!/^#[0-9a-fA-F]{0,6}$/.test(value)) return;
    setDrafts((d) => ({ ...d, [id]: value }));
    if (HEX_RE.test(value)) {
      setColors(colors.map((c) => (c.id === id ? { ...c, hex: value } : c)));
    }
  };

  const handleHexBlur = (id: string) => {
    setDrafts((d) => {
      const next = { ...d };
      delete next[id];
      return next;
    });
  };

  const applyPreset = (presetColors: string[]) => {
    setColors(presetColors.map((hex) => ({ id: genId(), hex, weight: 0.5 })));
    setDrafts({});
  };

  // ============ SORT ============
  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortArrow = (key: SortKey) => {
    if (sortKey !== key) return '↕';
    return sortDir === 'asc' ? '↑' : '↓';
  };

  const ariaSort = (key: SortKey): 'ascending' | 'descending' | 'none' => {
    if (sortKey !== key) return 'none';
    return sortDir === 'asc' ? 'ascending' : 'descending';
  };

  // ============ COPY / EXPORT ============
  const showCopied = (label: string) => {
    setCopied(label);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setCopied(null), 1500);
  };

  const copyText = async (text: string, label: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        showCopied(label);
        return;
      }
      throw new Error('clipboard unavailable');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) showCopied(label);
      else showCopied('copy-failed');
    }
  };

  const getFormulaText = () =>
    colors
      .map((c, i) => `${c.hex.toUpperCase()} × ${pcts[i] ?? 0}%`)
      .join(' + ') + ` = ${mixed.hex}`;

  const getTableText = () => {
    const header = '#\tHex\tName\t%';
    const rows = tableData.map(
      (r) => `${r.index}\t${r.hex}\t${r.name}\t${r.percent}%`
    );
    const footer = `Total\t\t\t${pctSum}%`;
    return [header, ...rows, footer].join('\n');
  };

  const copyFormula = () => copyText(getFormulaText(), 'formula');
  const copyTable = () => copyText(getTableText(), 'table');
  const copyHex = () => copyText(mixed.hex, 'hex');

  const downloadCSV = () => {
    const escapeCsv = (v: string | number) => {
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = ['#', 'Hex', 'Name', 'Percentage'];
    const rows = tableData.map((r) => [r.index, r.hex, r.name, `${r.percent}%`]);
    const total = ['', '', 'Total', `${pctSum}%`];
    const csv = [header, ...rows, total]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `color-mix-${mixed.hex.replace('#', '')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showCopied('csv');
  };

  const downloadJSON = () => {
    const data = {
      result: mixed,
      colors: tableData.map((r) => ({
        index: r.index,
        hex: r.hex,
        name: r.name,
        percent: r.percent,
      })),
      formula: getFormulaText(),
      totalPercent: pctSum,
      createdAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `color-mix-${mixed.hex.replace('#', '')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showCopied('json');
  };

  // ============ WEIGHT-AWARE GRADIENT ============
  const gradientStops = useMemo(() => {
    if (colors.length === 0) return '#000';
    if (colors.length === 1) return colors[0].hex;
    let acc = 0;
    const stops: string[] = [];
    colors.forEach((c, i) => {
      const pct = pcts[i] ?? 0;
      stops.push(`${c.hex} ${acc}%`);
      acc += pct;
      stops.push(`${c.hex} ${Math.min(100, acc)}%`);
    });
    return `linear-gradient(to right, ${stops.join(', ')})`;
  }, [colors, pcts]);

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white p-4 sm:p-6 md:p-10 transition-colors">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2 sm:mb-3">
        Color Mixer
      </h1>
      <p className="text-center text-sm sm:text-base text-neutral-500 dark:text-neutral-400 mb-6 sm:mb-8 px-4">
        Mix colors and see the result in real-time
      </p>

      <div className="max-w-4xl mx-auto bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm dark:shadow-none transition-colors">
        {/* HEADER — ✅ Mobile: stacked, Desktop: row */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Colors: <span className="text-red-500 font-semibold">{colors.length}</span>
          </p>
          <button
            type="button"
            onClick={addColor}
            className="text-sm bg-red-500 hover:bg-red-600 text-white px-3.5 py-2 rounded-lg transition font-semibold w-full sm:w-auto"
          >
            ＋ Add Color
          </button>
        </div>

        {/* ALL-ZERO WARNING */}
        {allWeightsZero && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs">
            ⚠️ All weights are 0 — result defaults to #000000. Increase at least one weight.
          </div>
        )}

        {/* COLOR ROWS */}
        <div className="space-y-3 mb-6">
          {colors.map((c, i) => (
            <div
              key={c.id}
              className="bg-neutral-100 dark:bg-neutral-800/50 rounded-xl p-3 border border-neutral-200 dark:border-neutral-800 transition-colors"
            >
              {/* Row 1: number, picker, hex, %, remove */}
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <span className="text-xs sm:text-sm font-mono text-neutral-400 dark:text-neutral-500 w-4 sm:w-5 shrink-0">
                  {i + 1}
                </span>
                <input
                  type="color"
                  value={HEX_RE.test(c.hex) ? c.hex : '#000000'}
                  onChange={(e) => updateColor(c.id, e.target.value)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded cursor-pointer bg-transparent border border-neutral-300 dark:border-neutral-700 shrink-0"
                />
                <input
                  type="text"
                  value={drafts[c.id] ?? c.hex.toUpperCase()}
                  onChange={(e) => handleHexChange(c.id, e.target.value)}
                  onBlur={() => handleHexBlur(c.id)}
                  className="flex-1 min-w-0 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2 sm:px-2.5 py-2 text-xs sm:text-sm font-mono outline-none focus:ring-2 focus:ring-red-500 text-neutral-900 dark:text-white"
                />
                <span className="text-xs sm:text-sm font-mono text-neutral-500 dark:text-neutral-400 w-10 sm:w-12 text-right shrink-0">
                  {pcts[i] ?? 0}%
                </span>
                <button
                  type="button"
                  onClick={() => removeColor(c.id)}
                  disabled={colors.length <= 1}
                  className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400 text-base font-bold transition disabled:opacity-20 disabled:cursor-not-allowed shrink-0"
                  aria-label="Remove color"
                >
                  −
                </button>
              </div>
              {/* Row 2: weight slider */}
              <div className="flex items-center gap-2 sm:gap-3 pl-7 sm:pl-8">
                <span className="text-xs text-neutral-500 dark:text-neutral-500 shrink-0">
                  Weight
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={c.weight}
                  onChange={(e) => updateWeight(c.id, parseFloat(e.target.value))}
                  className="flex-1 accent-red-500 min-w-0"
                  aria-label={`Weight for color ${i + 1}`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* GRADIENT */}
        <div className="mb-1">
          <p className="text-[10px] text-neutral-500 dark:text-neutral-500 mb-1">
            Weight-aware gradient (proportional to %)
          </p>
          <div
            className="h-4 rounded-full border border-neutral-200 dark:border-neutral-800"
            style={{ background: gradientStops }}
          />
        </div>

        {/* MIXED RESULT */}
        <div className="text-center mt-6">
          <div
            className="w-full h-32 sm:h-40 rounded-xl mb-3 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 relative group"
            style={{ backgroundColor: mixed.hex }}
          >
            <span className="text-sm sm:text-base font-mono bg-black/40 text-white px-3 py-1 rounded">
              {mixed.hex}
            </span>
            <button
              type="button"
              onClick={copyHex}
              className="absolute top-2 right-2 text-xs sm:text-sm bg-black/60 hover:bg-black/80 text-white px-2.5 py-1 rounded opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition"
            >
              {copied === 'hex' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <p className="font-bold text-lg sm:text-xl">{mixed.name}</p>
        </div>

        {/* BREAKDOWN TABLE */}
        <div className="mt-6">
          {/* Header with view toggle + actions */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              📊 Mix Breakdown
            </p>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="inline-flex rounded-lg bg-neutral-200 dark:bg-neutral-800 p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('compact')}
                  className={`px-2.5 py-1.5 rounded-md transition ${
                    viewMode === 'compact'
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  Compact
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('detailed')}
                  className={`px-2.5 py-1.5 rounded-md transition ${
                    viewMode === 'detailed'
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  Detailed
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={copyFormula}
                  className="text-xs bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 px-2 sm:px-2.5 py-1.5 rounded-lg transition"
                >
                  {copied === 'formula' ? '✓' : 'Formula'}
                </button>
                <button
                  type="button"
                  onClick={copyTable}
                  className="text-xs bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 px-2 sm:px-2.5 py-1.5 rounded-lg transition"
                >
                  {copied === 'table' ? '✓' : 'Table'}
                </button>
                <button
                  type="button"
                  onClick={downloadCSV}
                  className="text-xs bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 px-2 sm:px-2.5 py-1.5 rounded-lg transition"
                >
                  {copied === 'csv' ? '✓' : '⬇ CSV'}
                </button>
                <button
                  type="button"
                  onClick={downloadJSON}
                  className="text-xs bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 px-2 sm:px-2.5 py-1.5 rounded-lg transition"
                >
                  {copied === 'json' ? '✓' : '⬇ JSON'}
                </button>
              </div>
            </div>
          </div>

          {/* ✅ Table with horizontal scroll on mobile */}
          <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
            <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
              <table className="w-full text-xs sm:text-sm min-w-[480px]">
                <thead className="bg-neutral-100 dark:bg-neutral-800/80 text-neutral-500 dark:text-neutral-400">
                  <tr>
                    <th
                      className="text-left px-2 sm:px-3 py-2 sm:py-2.5 font-medium w-8 sm:w-10"
                      aria-sort={ariaSort('index')}
                    >
                      <button
                        type="button"
                        onClick={() => handleSort('index')}
                        className="inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-neutral-200"
                      >
                        # <span className="text-[11px] opacity-60" aria-hidden="true">{sortArrow('index')}</span>
                      </button>
                    </th>
                    <th className="text-left px-2 sm:px-3 py-2 sm:py-2.5 font-medium w-10 sm:w-12">Sw</th>
                    <th
                      className="text-left px-2 sm:px-3 py-2 sm:py-2.5 font-medium"
                      aria-sort={ariaSort('hex')}
                    >
                      <button
                        type="button"
                        onClick={() => handleSort('hex')}
                        className="inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-neutral-200"
                      >
                        Hex <span className="text-[11px] opacity-60" aria-hidden="true">{sortArrow('hex')}</span>
                      </button>
                    </th>
                    {viewMode === 'detailed' && (
                      <th
                        className="text-left px-2 sm:px-3 py-2 sm:py-2.5 font-medium hidden sm:table-cell"
                        aria-sort={ariaSort('name')}
                      >
                        <button
                          type="button"
                          onClick={() => handleSort('name')}
                          className="inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-neutral-200"
                        >
                          Name <span className="text-[11px] opacity-60" aria-hidden="true">{sortArrow('name')}</span>
                        </button>
                      </th>
                    )}
                    <th
                      className="text-right px-2 sm:px-3 py-2 sm:py-2.5 font-medium"
                      aria-sort={ariaSort('percent')}
                    >
                      <button
                        type="button"
                        onClick={() => handleSort('percent')}
                        className="inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-neutral-200 ml-auto"
                      >
                        % <span className="text-[11px] opacity-60" aria-hidden="true">{sortArrow('percent')}</span>
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {tableData.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-neutral-100 dark:hover:bg-neutral-800/40 transition"
                    >
                      <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-neutral-400 dark:text-neutral-500 font-mono">
                        {r.index}
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-2.5">
                        <div
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded border border-neutral-300 dark:border-neutral-700"
                          style={{ backgroundColor: r.rawHex }}
                        />
                      </td>
                      <td className="px-2 sm:px-3 py-2 sm:py-2.5 font-mono text-neutral-800 dark:text-neutral-200">
                        {r.hex}
                      </td>
                      {viewMode === 'detailed' && (
                        <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-neutral-500 dark:text-neutral-400 hidden sm:table-cell truncate max-w-[120px]">
                          {r.name}
                        </td>
                      )}
                      <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-right">
                        {viewMode === 'detailed' ? (
                          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                            <div className="w-10 sm:w-16 bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 overflow-hidden hidden xs:block">
                              <div
                                className="h-2 rounded-full transition-all"
                                style={{
                                  width: `${r.percent}%`,
                                  backgroundColor: r.rawHex,
                                }}
                              />
                            </div>
                            <span className="font-mono text-red-500 dark:text-red-400 font-semibold text-xs sm:text-sm">
                              {r.percent}%
                            </span>
                          </div>
                        ) : (
                          <span className="font-mono text-red-500 dark:text-red-400 font-semibold">
                            {r.percent}%
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-neutral-100 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300">
                  <tr>
                    <td
                      colSpan={viewMode === 'detailed' ? 4 : 3}
                      className="px-2 sm:px-3 py-2 sm:py-2.5 text-right font-medium hidden sm:table-cell"
                    >
                      Total
                    </td>
                    <td
                      colSpan={viewMode === 'detailed' ? 3 : 2}
                      className="px-2 sm:px-3 py-2 sm:py-2.5 text-right font-medium sm:hidden"
                    >
                      Total
                    </td>
                    <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-right font-mono font-bold text-red-500 dark:text-red-400">
                      {pctSum}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* FORMULA */}
          <div className="mt-3 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg p-3 sm:p-3.5 border border-neutral-200 dark:border-neutral-800 transition-colors">
            <div className="flex justify-between items-center mb-1.5">
              <p className="text-xs text-neutral-500 dark:text-neutral-500">
                Weight distribution:
              </p>
              <button
                type="button"
                onClick={copyFormula}
                className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 transition"
              >
                {copied === 'formula' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs sm:text-sm font-mono text-neutral-700 dark:text-neutral-300 break-all leading-relaxed">
              {colors.map((c, i) => {
                const pct = pcts[i] ?? 0;
                return (
                  <span key={c.id}>
                    <span
                      className="inline-block w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm mr-1 align-middle border border-neutral-300 dark:border-neutral-700"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-neutral-800 dark:text-neutral-200">
                      {c.hex.toUpperCase()}
                    </span>
                    <span className="text-neutral-400 dark:text-neutral-500">
                      {' '}
                      × {pct}%
                    </span>
                    {i < colors.length - 1 && (
                      <span className="text-neutral-400 dark:text-neutral-500"> + </span>
                    )}
                  </span>
                );
              })}
              <span className="text-neutral-400 dark:text-neutral-500"> = </span>
              <span className="font-bold" style={{ color: mixed.hex }}>
                {mixed.hex}
              </span>
            </p>
          </div>
        </div>

        {/* PRESETS */}
        <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800 transition-colors">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
            Quick presets:
          </p>
          <div className="flex gap-1.5 sm:gap-2 flex-wrap">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p.colors)}
                className="text-xs sm:text-sm bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-4xl mx-auto mt-8 sm:mt-10">
        <MixFAQ
          colors={colors}
          result={mixed}
          percentages={pcts}
          totalWeight={rawTotalWeight}
        />
      </div>

      {/* TOAST — ✅ Better mobile positioning */}
      {copied && (
        <div
          className={`fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 text-white text-sm sm:text-base px-4 sm:px-5 py-2.5 rounded-lg shadow-lg z-50 text-center ${
            copied === 'copy-failed' ? 'bg-red-600' : 'bg-green-600'
          }`}
        >
          {copied === 'csv'
            ? '✓ CSV downloaded'
            : copied === 'json'
            ? '✓ JSON downloaded'
            : copied === 'copy-failed'
            ? '✗ Copy failed'
            : `✓ Copied ${copied}`}
        </div>
      )}
    </main>
  );
}