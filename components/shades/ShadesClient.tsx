// components/shades/ShadesClient.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useColor } from '@/context/ColorContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  ChevronLeft,
  Copy,
  Check,
  Palette,
  Search,
  Sliders,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  generateShades,
  type Shade,
  getUniqueColorNames,
} from '@/components/shades/shade-generator';
import { getColorName, getColorFamily } from '@/lib/color-utils';

interface ShadesClientProps {
  colorName?: string;
  colorFamily?: string;
}

export default function ShadesClient({
  colorName: propColorName,
  colorFamily: propColorFamily,
}: ShadesClientProps) {
  const { isDark } = useTheme();
  const { currentColor, setColor } = useColor();
  const router = useRouter();
  const params = useParams();

  const [copied, setCopied] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<
    'all' | 'light' | 'dark' | 'tint' | 'tone' | 'shade'
  >('all');
  const [showColorWheel, setShowColorWheel] = useState(false);
  const [showNames, setShowNames] = useState(true);
  const [showAllNames, setShowAllNames] = useState(false);

  /*
   * ============================================================
   * COLOR SOURCE
   * ============================================================
   *
   * URL color is the source of truth.
   *
   * This prevents the picker from initially showing an old
   * currentColor (for example violet) before changing to the
   * actual color from the URL.
   */

  const rawHexFromUrl = params?.hex as string | undefined;

  const hexFromUrl = useMemo(() => {
    if (!rawHexFromUrl) {
      return '32cd32';
    }

    const cleanHex = rawHexFromUrl
      .replace('#', '')
      .trim()
      .toLowerCase();

    return /^[0-9a-f]{6}$/.test(cleanHex) ? cleanHex : '32cd32';
  }, [rawHexFromUrl]);

  /*
   * IMPORTANT:
   * URL must have priority over currentColor.
   */
  const hex = hexFromUrl;

  const fullHex = `#${hex.toUpperCase()}`;

  /*
   * ============================================================
   * INPUT VALUE
   * ============================================================
   */

  const [inputValue, setInputValue] = useState(fullHex);

  /*
   * Sync input with URL color.
   */
  useEffect(() => {
    setInputValue(fullHex);
  }, [fullHex]);

  /*
   * ============================================================
   * SYNC URL COLOR WITH CONTEXT
   * ============================================================
   *
   * Context is updated only after the URL color is known.
   *
   * This avoids the old violet/default color being displayed
   * during the initial render.
   */

  useEffect(() => {
    if (hexFromUrl && currentColor !== hexFromUrl) {
      setColor(hexFromUrl);
    }
  }, [hexFromUrl, currentColor, setColor]);

  /*
   * ============================================================
   * COLOR NAME
   * ============================================================
   */

  const colorName = useMemo(() => {
    if (propColorName) {
      return propColorName;
    }

    return getColorName(hex);
  }, [hex, propColorName]);

  /*
   * ============================================================
   * COLOR FAMILY
   * ============================================================
   */

  const colorFamily = useMemo(() => {
    if (propColorFamily) {
      return propColorFamily;
    }

    return getColorFamily(hex) || 'Color';
  }, [hex, propColorFamily]);

  /*
   * ============================================================
   * GENERATE SHADES
   * ============================================================
   */

  const allShades = useMemo(() => {
    return generateShades(hex, 120);
  }, [hex]);

  /*
   * ============================================================
   * UNIQUE COLOR NAMES
   * ============================================================
   */

  const uniqueNames = useMemo(() => {
    return getUniqueColorNames(allShades);
  }, [allShades]);

  /*
   * ============================================================
   * DISPLAYED NAMES
   * ============================================================
   */

  const displayedNames = useMemo(() => {
    if (showAllNames) {
      return uniqueNames;
    }

    return uniqueNames.slice(0, 35);
  }, [uniqueNames, showAllNames]);

  const hasMoreNames = uniqueNames.length > 35;

  /*
   * ============================================================
   * FILTER SHADES
   * ============================================================
   */

  const filteredShades = useMemo(() => {
    let shades = allShades;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();

      shades = shades.filter(
        (shade) =>
          shade.hex.toLowerCase().includes(term) ||
          (shade.name && shade.name.toLowerCase().includes(term))
      );
    }

    if (filter !== 'all') {
      shades = shades.filter((shade) => shade.type === filter);
    }

    return shades;
  }, [allShades, searchTerm, filter]);

  /*
   * ============================================================
   * GROUP SHADES BY TYPE
   * ============================================================
   */

  const groupedShades = useMemo(() => {
    const groups: Record<string, Shade[]> = {};

    filteredShades.forEach((shade) => {
      if (!groups[shade.type]) {
        groups[shade.type] = [];
      }

      groups[shade.type].push(shade);
    });

    return groups;
  }, [filteredShades]);

  /*
   * ============================================================
   * COLOR PICKER
   * ============================================================
   */

  const handlePickerChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newHex = e.target.value
      .replace('#', '')
      .toLowerCase();

    if (!/^[0-9a-f]{6}$/.test(newHex)) {
      return;
    }

    /*
     * Update context immediately.
     */
    setColor(newHex);

    /*
     * Update input immediately.
     */
    setInputValue(`#${newHex.toUpperCase()}`);

    /*
     * Update URL.
     */
    router.push(`/shades/${newHex}`, {
      scroll: false,
    });
  };

  /*
   * ============================================================
   * HEX INPUT
   * ============================================================
   */

  const handleColorChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    setInputValue(value);

    const cleanHex = value
      .replace('#', '')
      .replace(/[^a-fA-F0-9]/g, '');

    if (cleanHex.length === 6) {
      const normalizedHex = cleanHex.toLowerCase();

      setColor(normalizedHex);

      router.push(`/shades/${normalizedHex}`, {
        scroll: false,
      });
    }
  };

  /*
   * ============================================================
   * COPY COLOR
   * ============================================================
   */

  const handleCopy = async (
    text: string,
    id: string
  ) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(id);

      setTimeout(() => {
        setCopied(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  /*
   * ============================================================
   * TYPE LABEL
   * ============================================================
   */

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      tint: 'Tints (Lighter)',
      shade: 'Shades (Darker)',
      tone: 'Tones (Muted)',
      light: 'Light Variations',
      dark: 'Dark Variations',
    };

    return labels[type] || type;
  };

  /*
   * ============================================================
   * TOGGLE NAMES
   * ============================================================
   */

  const toggleShowAllNames = () => {
    setShowAllNames(!showAllNames);
  };

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <div
      className={`p-4 sm:p-6 md:p-8 ${
        isDark
          ? 'bg-[#090911] text-gray-100'
          : 'bg-gray-50 text-gray-800'
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ======================================================
            HERO + HEADER
        ====================================================== */}

        <div
          className={`flex flex-wrap items-center justify-between gap-4 ${
            isDark ? 'border-white/10' : 'border-gray-200'
          } border-b pb-4`}
        >
          <div className="flex items-center gap-4 sm:gap-6">

            {/* Back */}
            <Link
              href={`/color/${hex}`}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'hover:bg-white/10'
                  : 'hover:bg-gray-200'
              }`}
              aria-label="Back to color"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>

            {/* ==================================================
                COLOR PICKER
            ================================================== */}

            <div className="relative flex-shrink-0">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl shadow-lg border-2 border-white dark:border-gray-700"
                style={{
                  backgroundColor: fullHex,
                }}
              />

              <input
                type="color"
                value={fullHex}
                onChange={handlePickerChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-xl"
                aria-label="Choose a color"
              />
            </div>

            {/* ==================================================
                COLOR INFORMATION
            ================================================== */}

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  {colorName} Color Shades
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">

                {/* HEX INPUT */}
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleColorChange}
                  className={`text-sm font-mono px-3 py-1 rounded-lg border focus:ring-2 focus:ring-[#7c3aed] focus:outline-none w-28 ${
                    isDark
                      ? 'bg-[#0a0a14] border-white/10 text-white'
                      : 'bg-gray-100 border-gray-200 text-gray-800'
                  }`}
                  aria-label="Enter HEX color code"
                />

                {/* FAMILY */}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isDark
                      ? 'bg-white/5 text-gray-400'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {colorFamily}
                </span>

                {/* NAMES */}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    isDark
                      ? 'bg-white/5 text-gray-400'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {uniqueNames.length} names
                </span>
              </div>

              <p
                className={`text-sm ${
                  isDark
                    ? 'text-gray-400'
                    : 'text-gray-500'
                } mt-1`}
              >
                {filteredShades.length} shades •{' '}
                {allShades.length} total variations
              </p>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="flex items-center gap-2">

            {/* SHOW NAMES */}
            <button
              onClick={() => setShowNames(!showNames)}
              className={`p-2 rounded-lg transition-colors ${
                showNames
                  ? 'bg-[#7c3aed] text-white'
                  : isDark
                  ? 'hover:bg-white/10'
                  : 'hover:bg-gray-200'
              }`}
              aria-label="Toggle color names"
              title="Toggle color names"
            >
              <Info className="w-5 h-5" />
            </button>

            {/* COLOR WHEEL */}
            <button
              onClick={() =>
                setShowColorWheel(!showColorWheel)
              }
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'hover:bg-white/10'
                  : 'hover:bg-gray-200'
              }`}
              aria-label="Toggle color wheel"
            >
              <Sliders className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================
            SEARCH + FILTER
        ====================================================== */}

        <div
          className={`flex flex-wrap gap-4 items-center p-4 rounded-xl border ${
            isDark
              ? 'bg-[#131322]/80 border-white/10'
              : 'bg-white/90 border-gray-200'
          }`}
        >
          {/* SEARCH */}

          <div className="flex-1 min-w-[200px] relative">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isDark
                  ? 'text-gray-500'
                  : 'text-gray-400'
              }`}
            />

            <input
              type="text"
              placeholder="Search by hex or color name..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#7c3aed] outline-none ${
                isDark
                  ? 'bg-[#0a0a14] border-white/10 text-white placeholder:text-gray-500'
                  : 'bg-white border-gray-300 text-gray-800 placeholder:text-gray-400'
              }`}
            />
          </div>

          {/* FILTER */}

          <div className="flex flex-wrap gap-2">
            {(
              [
                'all',
                'light',
                'dark',
                'tint',
                'tone',
                'shade',
              ] as const
            ).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                  filter === type
                    ? 'bg-[#7c3aed] text-white'
                    : isDark
                    ? 'bg-white/5 hover:bg-white/10 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {type === 'all' ? 'All' : type}
              </button>
            ))}
          </div>
        </div>

        {/* ======================================================
            COLOR WHEEL PREVIEW
        ====================================================== */}

        {showColorWheel && (
          <div
            className={`p-4 rounded-xl border ${
              isDark
                ? 'bg-[#131322]/80 border-white/10'
                : 'bg-white/90 border-gray-200'
            }`}
          >
            <h3
              className={`text-sm font-semibold mb-3 ${
                isDark
                  ? 'text-gray-300'
                  : 'text-gray-600'
              }`}
            >
              Color Wheel Preview ({allShades.length}{' '}
              colors)
            </h3>

            <div className="flex flex-wrap gap-1.5">
              {allShades
                .slice(0, 48)
                .map((shade) => (
                  <div
                    key={shade.id}
                    className="w-8 h-8 rounded-lg transition-transform hover:scale-110 cursor-pointer relative group"
                    style={{
                      backgroundColor: shade.hex,
                    }}
                    title={`${shade.hex} - ${
                      shade.name || 'Unnamed'
                    }`}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-0.5 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white pointer-events-none">
                      {shade.name || shade.hex}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ======================================================
            COLOR NAMES
        ====================================================== */}

        {uniqueNames.length > 0 && (
          <div
            className={`p-5 rounded-2xl backdrop-blur-md transition-all ${
              isDark
                ? 'bg-gradient-to-b from-[#18182a]/90 to-[#11111d]/90 border border-white/10 shadow-xl shadow-black/40'
                : 'bg-white/80 border border-gray-100 shadow-xl shadow-gray-200/50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl ${
                    isDark
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : 'bg-indigo-50 text-indigo-600'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                </div>

                <div>
                  <h2
                    className={`text-sm font-bold tracking-wide ${
                      isDark
                        ? 'text-white'
                        : 'text-gray-900'
                    }`}
                  >
                    Color Names Found
                  </h2>

                  <p
                    className={`text-[11px] ${
                      isDark
                        ? 'text-gray-400'
                        : 'text-gray-500'
                    }`}
                  >
                    {uniqueNames.length} distinct shades
                    identified
                  </p>
                </div>
              </div>

              {hasMoreNames && (
                <button
                  onClick={toggleShowAllNames}
                  className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/15 text-indigo-300 border border-indigo-500/20'
                      : 'bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60'
                  }`}
                  aria-label={
                    showAllNames
                      ? 'Show less names'
                      : 'Show all names'
                  }
                >
                  <span>
                    {showAllNames
                      ? 'Show Less'
                      : `Show All (${uniqueNames.length})`}
                  </span>

                  {showAllNames ? (
                    <ChevronUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
                  )}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700">
              {displayedNames.map((name, i) => {
                const shadeWithName = allShades.find(
                  (s) => s.name === name
                );

                const colorHex =
                  shadeWithName?.hex || '#888888';

                return (
                  <span
                    key={i}
                    className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 ${
                      isDark
                        ? 'bg-[#1e1e32]/80 hover:bg-[#282844] text-gray-200 border border-white/5 hover:border-white/20'
                        : 'bg-gray-50 hover:bg-white text-gray-700 border border-gray-200/80 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    title={`${name} - ${colorHex}`}
                  >
                    <span
                      className="w-3 h-3 rounded-md flex-shrink-0 shadow-inner transition-transform group-hover:scale-110"
                      style={{
                        backgroundColor: colorHex,
                      }}
                    />

                    <span className="capitalize tracking-tight">
                      {name}
                    </span>
                  </span>
                );
              })}
            </div>

            {hasMoreNames && (
              <div
                className={`mt-3 pt-3 border-t text-[11px] font-medium flex items-center justify-between ${
                  isDark
                    ? 'border-white/5 text-gray-400'
                    : 'border-gray-100 text-gray-500'
                }`}
              >
                <span>
                  {showAllNames
                    ? `Showing all ${uniqueNames.length} names`
                    : `Showing 20 of ${uniqueNames.length} names`}
                </span>

                {!showAllNames && (
                  <span
                    className="text-indigo-500 cursor-pointer hover:underline"
                    onClick={toggleShowAllNames}
                  >
                    + {uniqueNames.length - 20} more
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================
            UNIQUE COLOR NAME SWATCH GRID
        ====================================================== */}

        {uniqueNames.length > 0 && (
          <div
            className={`p-4 sm:p-5 rounded-2xl transition-all ${
              isDark
                ? 'bg-gradient-to-b from-[#18182a]/90 to-[#11111d]/90 border border-white/10 shadow-xl shadow-black/40'
                : 'bg-white border border-gray-100 shadow-xl shadow-gray-200/50'
            }`}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-xl ${
                    isDark
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : 'bg-indigo-50 text-indigo-600'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                </div>

                <div>
                  <h2
                    className={`text-sm font-bold tracking-wide ${
                      isDark
                        ? 'text-white'
                        : 'text-gray-900'
                    }`}
                  >
                    Unique shades
                  </h2>

                  <p
                    className={`text-[11px] ${
                      isDark
                        ? 'text-gray-400'
                        : 'text-gray-500'
                    }`}
                  >
                    {uniqueNames.length} distinct shades
                    identified
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0 overflow-hidden rounded-xl">
              {displayedNames.map((name, i) => {
                const shadeWithName = allShades.find(
                  (s) =>
                    s.name?.toLowerCase() ===
                    name?.toLowerCase()
                );

                const shadeExact = allShades.find(
                  (s) => s.name === name
                );

                const foundShade =
                  shadeWithName || shadeExact;

                let colorHex = foundShade?.hex;

                if (!colorHex) {
                  const anyShade = allShades.find(
                    (s) =>
                      s.name &&
                      s.name
                        .toLowerCase()
                        .includes(name.toLowerCase())
                  );

                  colorHex = anyShade?.hex;
                }

                const finalColorHex =
                  colorHex || '#888888';

                return (
                  <div
                    key={`${name}-${i}`}
                    className="group relative aspect-[1.35/1] flex items-center justify-center cursor-pointer transition-all duration-300 hover:z-10 hover:scale-[1.03] hover:shadow-xl"
                    style={{
                      backgroundColor: finalColorHex,
                    }}
                    title={`${name} - ${finalColorHex}`}
                  >
                    <span className="relative z-10 px-3 text-center text-white text-sm sm:text-base font-bold drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105">
                      {name}
                    </span>

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-medium text-white/0 group-hover:text-white/90 transition-all duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                      {finalColorHex.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================
            SHADES GRID
        ====================================================== */}

        {Object.entries(groupedShades).map(
          ([type, shades]) => (
            <section key={type} className="space-y-3">
              <h2
                className={`text-lg font-semibold flex items-center gap-2 ${
                  isDark
                    ? 'text-gray-200'
                    : 'text-gray-700'
                }`}
              >
                {getTypeLabel(type)}

                <span
                  className={`text-sm font-normal ${
                    isDark
                      ? 'text-gray-400'
                      : 'text-gray-500'
                  }`}
                >
                  ({shades.length})
                </span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {shades.map((shade) => (
                  <div
                    key={shade.id}
                    className={`group relative rounded-xl border overflow-hidden transition-all hover:scale-105 hover:shadow-xl ${
                      isDark
                        ? 'border-white/10 hover:border-white/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="w-full aspect-square"
                      style={{
                        backgroundColor: shade.hex,
                      }}
                    />

                    <div
                      className={`p-2 text-center ${
                        isDark
                          ? 'bg-[#0a0a14]'
                          : 'bg-white'
                      }`}
                    >
                      <p
                        className="font-mono text-xs font-medium truncate cursor-pointer hover:text-[#7c3aed] transition-colors"
                        onClick={() =>
                          handleCopy(
                            shade.hex,
                            shade.id
                          )
                        }
                        title={`Click to copy ${shade.hex}`}
                      >
                        {shade.hex}
                      </p>

                      {showNames && shade.name && (
                        <p
                          className={`text-[10px] truncate mt-0.5 ${
                            isDark
                              ? 'text-gray-300'
                              : 'text-gray-600'
                          }`}
                          title={shade.name}
                        >
                          {shade.name}
                        </p>
                      )}

                      <button
                        onClick={() =>
                          handleCopy(
                            shade.hex,
                            shade.id
                          )
                        }
                        className={`mt-1 p-1 rounded-md transition-all opacity-0 group-hover:opacity-100 ${
                          isDark
                            ? 'hover:bg-white/10'
                            : 'hover:bg-gray-100'
                        }`}
                        aria-label="Copy color"
                      >
                        {copied === shade.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy
                            className={`w-3 h-3 ${
                              isDark
                                ? 'text-gray-400'
                                : 'text-gray-500'
                            }`}
                          />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        )}

        {/* ======================================================
            EMPTY STATE
        ====================================================== */}

        {filteredShades.length === 0 && (
          <div
            className={`text-center py-20 ${
              isDark
                ? 'text-gray-400'
                : 'text-gray-500'
            }`}
          >
            <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />

            <p className="text-lg font-medium">
              No shades found
            </p>

            <p className="text-sm">
              Try adjusting your search or filter
            </p>
          </div>
        )}

        {/* ======================================================
            STATISTICS FOOTER
        ====================================================== */}

        <div
          className={`mt-8 p-4 rounded-xl border ${
            isDark
              ? 'bg-[#131322]/80 border-white/10'
              : 'bg-white/90 border-gray-200'
          }`}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">

            <div>
              <p
                className={`text-2xl font-bold ${
                  isDark
                    ? 'text-white'
                    : 'text-gray-800'
                }`}
              >
                {filteredShades.length}
              </p>

              <p
                className={`text-xs ${
                  isDark
                    ? 'text-gray-400'
                    : 'text-gray-500'
                }`}
              >
                Total Shades
              </p>
            </div>

            <div>
              <p
                className={`text-2xl font-bold ${
                  isDark
                    ? 'text-white'
                    : 'text-gray-800'
                }`}
              >
                {Object.keys(groupedShades).length}
              </p>

              <p
                className={`text-xs ${
                  isDark
                    ? 'text-gray-400'
                    : 'text-gray-500'
                }`}
              >
                Color Families
              </p>
            </div>

            <div>
              <p
                className={`text-2xl font-bold ${
                  isDark
                    ? 'text-white'
                    : 'text-gray-800'
                }`}
              >
                {uniqueNames.length}
              </p>

              <p
                className={`text-xs ${
                  isDark
                    ? 'text-gray-400'
                    : 'text-gray-500'
                }`}
              >
                Unique Color Names
              </p>
            </div>

            <div>
              <p
                className={`text-2xl font-bold ${
                  isDark
                    ? 'text-white'
                    : 'text-gray-800'
                }`}
              >
                {allShades.length}
              </p>

              <p
                className={`text-xs ${
                  isDark
                    ? 'text-gray-400'
                    : 'text-gray-500'
                }`}
              >
                Total Variations
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}