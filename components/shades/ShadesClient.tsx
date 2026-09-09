// components/shades/ShadesClient.tsx
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useColor } from '@/context/ColorContext';
import { useTheme } from '@/contexts/ThemeContext';
import ShadesFAQ from '@/components/shades/ShadesFAQ';
import {
  ChevronRight,
  Copy,
  Check,
  Palette,
  Search,
  Sliders,
  Info,
  ChevronDown,
  ChevronUp,
  Home,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  generateShades,
  type Shade,
  getUniqueColorNames,
} from '@/components/shades/shade-generator';
import { getColorName, getColorFamily } from '@/lib/color-utils';
import SocialShare from '@/components/color/SocialShare';

interface ShadesClientProps {
  colorName?: string;
  colorFamily?: string;
}

const DEFAULT_HEX = '32cd32';

function normalizeHex(value: string | undefined): string {
  if (!value) {
    return DEFAULT_HEX;
  }

  const cleanHex = value
    .replace(/^#/, '')
    .trim()
    .toLowerCase();

  return /^[0-9a-f]{6}$/.test(cleanHex)
    ? cleanHex
    : DEFAULT_HEX;
}

export default function ShadesClient({
  colorName: propColorName,
  colorFamily: propColorFamily,
}: ShadesClientProps) {
  const { isDark } = useTheme();
  const { currentColor, setColor } = useColor();
  const params = useParams();

  /*
   * ============================================================
   * LOCAL UI STATE
   * ============================================================
   */

  const [copied, setCopied] = useState<string | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<
    'all' | 'light' | 'dark' | 'tint' | 'tone' | 'shade'
  >('all');
  const [showColorWheel, setShowColorWheel] = useState(false);
  const [showNames, setShowNames] = useState(true);
  const [showAllNames, setShowAllNames] = useState(false);
  const [showAllShadeNames, setShowAllShadeNames] = useState(false);

  /*
   * ============================================================
   * URL COLOR
   *
   * IMPORTANT:
   * URL is ONLY used to initialize the ColorContext.
   * After initialization, currentColor is the source of truth.
   * ============================================================
   */

  const rawHexFromUrl = params?.hex as string | undefined;

  const hexFromUrl = useMemo(() => {
    return normalizeHex(rawHexFromUrl);
  }, [rawHexFromUrl]);

  /*
   * ============================================================
   * INITIALIZE CONTEXT FROM URL
   *
   * We use a ref so the URL value does not overwrite a color
   * selected interactively by the user.
   * ============================================================
   */

  const initializedUrlHexRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hexFromUrl) {
      return;
    }

    /*
     * Only initialize once for this particular route color.
     *
     * Example:
     * URL = /shades/32cd32
     * Context becomes 32cd32
     *
     * User selects ff0000
     * Context becomes ff0000
     *
     * This effect does NOT change it back to 32cd32.
     */
    if (initializedUrlHexRef.current === hexFromUrl) {
      return;
    }

    initializedUrlHexRef.current = hexFromUrl;

    if (currentColor !== hexFromUrl) {
      setColor(hexFromUrl);
    }
  }, [hexFromUrl, currentColor, setColor]);

  /*
   * ============================================================
   * LIVE COLOR
   *
   * This is the most important change.
   *
   * currentColor = live source of truth
   * URL = initial/default value only
   * ============================================================
   */

  const hex = useMemo(() => {
    const normalizedCurrentColor = normalizeHex(currentColor);

    /*
     * If context has a valid color, always use it.
     * Otherwise fall back to URL color.
     */
    if (
      currentColor &&
      /^[0-9a-f]{6}$/i.test(
        currentColor.replace(/^#/, '').trim()
      )
    ) {
      return normalizedCurrentColor;
    }

    return hexFromUrl;
  }, [currentColor, hexFromUrl]);

  const fullHex = `#${hex.toUpperCase()}`;

  /*
   * ============================================================
   * INPUT VALUE
   * ============================================================
   */

  const [inputValue, setInputValue] = useState(fullHex);

  /*
   * Keep the text input synchronized with the LIVE color.
   *
   * This means:
   * picker -> context -> input
   */
  useEffect(() => {
    setInputValue(fullHex);
  }, [fullHex]);

  /*
   * ============================================================
   * CONTRAST COLOR
   * ============================================================
   */

  const contrastColor = useMemo(() => {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const luminance =
      (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? '#000000' : '#ffffff';
  }, [hex]);

  /*
   * ============================================================
   * FORMAT DATA
   * ============================================================
   */

  const formatData = useMemo(() => {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    /*
     * Proper HSL calculation.
     *
     * The previous implementation was not actually calculating HSL.
     */
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const delta = max - min;

    let h = 0;

    if (delta !== 0) {
      if (max === rNorm) {
        h =
          60 *
          (((gNorm - bNorm) / delta) % 6);
      } else if (max === gNorm) {
        h =
          60 *
          ((bNorm - rNorm) / delta + 2);
      } else {
        h =
          60 *
          ((rNorm - gNorm) / delta + 4);
      }
    }

    if (h < 0) {
      h += 360;
    }

    const l = (max + min) / 2;

    let s = 0;

    if (delta !== 0) {
      s = delta / (1 - Math.abs(2 * l - 1));
    }

    const hsl = `hsl(${Math.round(h)}, ${Math.round(
      s * 100
    )}%, ${Math.round(l * 100)}%)`;

    return [
      {
        label: 'HEX',
        value: fullHex,
        format: 'hex',
      },
      {
        label: 'RGB',
        value: `rgb(${r}, ${g}, ${b})`,
        format: 'rgb',
      },
      {
        label: 'HSL',
        value: hsl,
        format: 'hsl',
      },
      {
        label: 'CSS',
        value: fullHex,
        format: 'css',
      },
    ];
  }, [hex, fullHex]);

  /*
   * ============================================================
   * COLOR NAME
   *
   * IMPORTANT:
   * Do NOT permanently use propColorName here.
   * The displayed name must follow the LIVE color.
   * ============================================================
   */

  const colorName = useMemo(() => {
    const liveName = getColorName(hex);

    return liveName || propColorName || 'Color';
  }, [hex, propColorName]);

  /*
   * ============================================================
   * COLOR FAMILY
   * ============================================================
   */

  const colorFamily = useMemo(() => {
    const liveFamily = getColorFamily(hex);

    return liveFamily || propColorFamily || 'Color';
  }, [hex, propColorFamily]);

  /*
   * ============================================================
   * GENERATE SHADES
   *
   * Automatically recalculates whenever LIVE hex changes.
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

    return uniqueNames.slice(0, 20);
  }, [uniqueNames, showAllNames]);

  const hasMoreNames = uniqueNames.length > 20;

  /*
   * ============================================================
   * FILTER SHADES
   * ============================================================
   */

  const filteredShades = useMemo(() => {
    let shades = allShades;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();

      shades = shades.filter(
        (shade) =>
          shade.hex.toLowerCase().includes(term) ||
          (shade.name &&
            shade.name.toLowerCase().includes(term))
      );
    }

    if (filter !== 'all') {
      shades = shades.filter(
        (shade) => shade.type === filter
      );
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
   * UNIQUE SHADES WITH NAMES
   * ============================================================
   */

  const uniqueShadesWithNames = useMemo(() => {
    const shadeMap = new Map<string, Shade>();

    allShades.forEach((shade) => {
      if (shade.name && !shadeMap.has(shade.name)) {
        shadeMap.set(shade.name, shade);
      }
    });

    return Array.from(shadeMap.values());
  }, [allShades]);

  const displayedUniqueShades = useMemo(() => {
    if (showAllShadeNames) {
      return uniqueShadesWithNames;
    }

    return uniqueShadesWithNames.slice(0, 20);
  }, [uniqueShadesWithNames, showAllShadeNames]);

  const hasMoreUniqueShades =
    uniqueShadesWithNames.length > 20;

  /*
   * ============================================================
   * COLOR PICKER
   *
   * IMPORTANT:
   * NO router.push()
   *
   * URL remains unchanged.
   * ============================================================
   */

  const handlePickerChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newHex = e.target.value
      .replace(/^#/, '')
      .toLowerCase();

    if (!/^[0-9a-f]{6}$/.test(newHex)) {
      return;
    }

    /*
     * Update the global color context.
     *
     * This automatically updates:
     * - HEX
     * - RGB
     * - HSL
     * - color name
     * - family
     * - all shades
     * - unique names
     * - statistics
     * - previews
     * - SocialShare
     * - every other hex-dependent section
     */
    setColor(newHex);
    setInputValue(`#${newHex.toUpperCase()}`);
  };

  /*
   * ============================================================
   * HEX INPUT
   *
   * Updates Context only.
   * URL remains unchanged.
   * ============================================================
   */

  const handleColorChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    setInputValue(value);

    const cleanHex = value
      .replace(/^#/, '')
      .replace(/[^a-fA-F0-9]/g, '')
      .slice(0, 6);

    /*
     * Only update the live color when a complete valid
     * six-digit HEX value has been entered.
     */
    if (
      cleanHex.length === 6 &&
      /^[0-9a-fA-F]{6}$/.test(cleanHex)
    ) {
      const normalizedHex = cleanHex.toLowerCase();

      setColor(normalizedHex);
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
      setCopiedFormat(id);

      window.setTimeout(() => {
        setCopied(null);
        setCopiedFormat(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
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
   * TOGGLES
   * ============================================================
   */

  const toggleShowAllNames = () => {
    setShowAllNames((previous) => !previous);
  };

  const toggleShowAllShadeNames = () => {
    setShowAllShadeNames((previous) => !previous);
  };

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <div
      className={`min-h-screen p-4 sm:p-6 md:p-8 ${
        isDark
          ? 'bg-[#090911] text-gray-100'
          : 'bg-gray-50 text-gray-800'
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ======================================================
            BREADCRUMB NAVIGATION
        ====================================================== */}

        <nav
          className={`flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-2 text-xs md:text-sm font-medium ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}
          aria-label="Breadcrumb"
        >
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start w-full sm:w-auto">
            <Link
              href="/"
              className={`transition-colors flex items-center gap-1.5 p-1 rounded-md ${
                isDark
                  ? 'hover:text-white hover:bg-white/5'
                  : 'hover:text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="Home"
            >
              <Home
                className="w-3.5 h-3.5"
                aria-hidden="true"
              />
              <span className="hidden xs:inline">
                Home
              </span>
            </Link>

            <ChevronRight
              className={`w-3.5 h-3.5 ${
                isDark
                  ? 'text-gray-600'
                  : 'text-gray-300'
              }`}
              aria-hidden="true"
            />

            <Link
              href="/shades"
              className={`transition-colors p-1 rounded-md ${
                isDark
                  ? 'hover:text-white hover:bg-white/5'
                  : 'hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Shades
            </Link>

            <ChevronRight
              className={`w-3.5 h-3.5 ${
                isDark
                  ? 'text-gray-600'
                  : 'text-gray-300'
              }`}
              aria-hidden="true"
            />

            <div
              className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-full ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-gray-100 border-gray-200 text-gray-700'
              } border`}
              aria-current="page"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: fullHex }}
                aria-hidden="true"
              />

              <span className="font-mono text-[10px] sm:text-xs">
                {fullHex}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() =>
                setShowNames((previous) => !previous)
              }
              className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                showNames
                  ? 'text-white'
                  : isDark
                  ? 'hover:bg-white/10 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
              style={
                showNames
                  ? { backgroundColor: fullHex }
                  : undefined
              }
              aria-label="Toggle color names"
              title="Toggle color names"
            >
              <Info className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() =>
                setShowColorWheel(
                  (previous) => !previous
                )
              }
              className={`p-1.5 sm:p-2 rounded-full transition-colors ${
                isDark
                  ? 'hover:bg-white/10 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
              aria-label="Toggle color wheel"
            >
              <Sliders className="w-4 h-4" />
            </button>

            <SocialShare
              hex={hex}
              colorName={colorName}
              isDark={isDark}
            />
          </div>
        </nav>

        {/* ======================================================
            HERO + HEADER
        ====================================================== */}

        <header
          className={`relative overflow-hidden backdrop-blur-xl border rounded-2xl p-6 sm:p-8 shadow-lg transition-all duration-300 ${
            isDark
              ? 'bg-[#131322]/80 border-white/10 shadow-2xl'
              : 'bg-white/90 border-gray-200 shadow-lg'
          }`}
        >
          <div
            className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-[100px] opacity-10 pointer-events-none transition-all duration-700"
            style={{ backgroundColor: fullHex }}
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-8 justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full lg:w-auto">
              <div className="relative group flex-shrink-0">
                <div
                  className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border shadow-lg cursor-pointer transition-all duration-300 group-hover:scale-105 group-hover:rotate-1 ${
                    isDark
                      ? 'border-white/20 shadow-2xl'
                      : 'border-gray-200 shadow-lg'
                  }`}
                  style={{
                    backgroundColor: fullHex,
                    boxShadow: isDark
                      ? `0 12px 40px -8px ${fullHex}60, inset 0 1px 1px rgba(255,255,255,0.1)`
                      : `0 12px 40px -8px ${fullHex}40, inset 0 1px 1px rgba(255,255,255,0.5)`,
                  }}
                  onClick={() =>
                    document
                      .getElementById('color-picker')
                      ?.click()
                  }
                  role="button"
                  tabIndex={0}
                  aria-label="Click to pick a color"
                  onKeyDown={(e) => {
                    if (
                      e.key === 'Enter' ||
                      e.key === ' '
                    ) {
                      e.preventDefault();

                      document
                        .getElementById('color-picker')
                        ?.click();
                    }
                  }}
                />

                <div
                  className={`absolute -bottom-2 right-2 rounded-md px-2 py-0.5 shadow-sm ${
                    isDark
                      ? 'bg-[#0a0a14] border-white/15'
                      : 'bg-white border-gray-200'
                  } border`}
                >
                  <span
                    className={`text-[10px] font-mono tracking-wider ${
                      isDark
                        ? 'text-gray-300'
                        : 'text-gray-600'
                    }`}
                  >
                    #{hex}
                  </span>
                </div>

                <input
                  id="color-picker"
                  type="color"
                  value={fullHex}
                  onChange={handlePickerChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Choose a color"
                />
              </div>

              <div className="space-y-3 text-center sm:text-left w-full">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <div className="relative inline-flex items-center">
                    <label
                      htmlFor="color-hex-input"
                      className="sr-only"
                    >
                      Enter HEX color code
                    </label>

                    <input
                      id="color-hex-input"
                      type="text"
                      value={inputValue}
                      onChange={handleColorChange}
                      spellCheck={false}
                      autoComplete="off"
                      inputMode="text"
                      maxLength={7}
                      className={`text-2xl sm:text-4xl font-extrabold rounded-xl px-4 py-1.5 w-44 sm:w-52 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] font-mono transition-all shadow-inner border ${
                        isDark
                          ? 'border-white/20'
                          : 'border-gray-200'
                      }`}
                      style={{
                        color: contrastColor,
                        backgroundColor: fullHex,
                        textShadow:
                          '0 1px 2px rgba(0,0,0,0.1)',
                      }}
                      aria-label="HEX color code input"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(fullHex, 'hex')
                      }
                      className={`ml-2.5 p-2.5 border rounded-xl transition-all active:scale-95 shadow-md ${
                        isDark
                          ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white/90'
                          : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700'
                      }`}
                      aria-label={
                        copied &&
                        copiedFormat === 'hex'
                          ? 'Copied!'
                          : 'Copy HEX Code'
                      }
                      title="Copy HEX Code"
                    >
                      {copied &&
                      copiedFormat === 'hex' ? (
                        <Check
                          className="w-5 h-5 text-emerald-400"
                          aria-hidden="true"
                        />
                      ) : (
                        <Copy
                          className="w-5 h-5"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </div>
                </div>

                <h1
                  className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight ${
                    isDark
                      ? 'text-white'
                      : 'text-gray-900'
                  }`}
                >
                  {colorName}

                  <span className="ml-3 text-sm sm:text-base font-mono font-normal text-gray-500 dark:text-gray-400">
                    #{hex.toUpperCase()}
                  </span>
                </h1>

                <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                  <span
                    className={`px-3.5 py-1 border rounded-full text-xs font-semibold tracking-wide backdrop-blur-md ${
                      isDark
                        ? 'bg-white/10 border-white/10 text-gray-200'
                        : 'bg-gray-100 border-gray-200 text-gray-700'
                    }`}
                  >
                    {colorFamily} Family
                  </span>

                  <span
                    className={`text-sm ${
                      isDark
                        ? 'text-gray-400'
                        : 'text-gray-500'
                    }`}
                  >
                    {filteredShades.length} shades,{' '}
                    {allShades.length} variations total
                  </span>
                </div>
              </div>
            </div>

            {/* ==================================================
                COLOR FORMAT DATA
            ================================================== */}

            <div
              className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 w-full lg:w-auto min-w-[280px]"
              role="group"
              aria-label="Color format values"
            >
              {formatData.map((item) => (
                <div
                  key={item.label}
                  onClick={() =>
                    item.value &&
                    handleCopy(
                      item.value,
                      item.format
                    )
                  }
                  className={`group border rounded-xl p-3 transition-all ${
                    isDark
                      ? 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 hover:border-white/30'
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-[#7c3aed]/30'
                  } ${
                    item.value
                      ? 'cursor-pointer'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  role="button"
                  tabIndex={item.value ? 0 : -1}
                  aria-label={
                    item.value
                      ? `Copy ${item.label} value ${item.value}`
                      : `${item.label} not available`
                  }
                  onKeyDown={(e) => {
                    if (
                      (e.key === 'Enter' ||
                        e.key === ' ') &&
                      item.value
                    ) {
                      e.preventDefault();

                      handleCopy(
                        item.value,
                        item.format
                      );
                    }
                  }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest ${
                        isDark
                          ? 'text-gray-200'
                          : 'text-gray-500'
                      }`}
                    >
                      {item.label}
                    </span>

                    {item.value && (
                      <div className="flex items-center gap-1">
                        {copied &&
                        copiedFormat ===
                          item.format ? (
                          <Check
                            className="w-3 h-3 text-emerald-400"
                            aria-hidden="true"
                          />
                        ) : (
                          <Copy
                            className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${
                              isDark
                                ? 'text-gray-500'
                                : 'text-gray-400'
                            }`}
                            aria-hidden="true"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  <p
                    className={`font-mono text-xs sm:text-sm font-medium truncate ${
                      isDark
                        ? 'text-white'
                        : 'text-gray-800'
                    }`}
                  >
                    {item.value || '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </header>

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

          <div className="flex flex-wrap gap-2">
            {[
              'all',
              'light',
              'dark',
              'tint',
              'tone',
              'shade',
            ].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setFilter(type as typeof filter)
                }
                className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                  filter === type
                    ? 'bg-[#7c3aed] text-white'
                    : isDark
                    ? 'bg-white/5 hover:bg-white/10 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {type === 'all'
                  ? 'All'
                  : type}
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
                    {uniqueNames.length} distinct
                    shades identified
                  </p>
                </div>
              </div>

              {hasMoreNames && (
                <button
                  type="button"
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
              {displayedNames.map((name) => {
                const shadeWithName =
                  allShades.find(
                    (shade) => shade.name === name
                  );

                const colorHex =
                  shadeWithName?.hex || '#888888';

                return (
                  <span
                    key={`${name}-${colorHex}`}
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
                  <button
                    type="button"
                    className="text-indigo-500 hover:underline"
                    onClick={toggleShowAllNames}
                  >
                    + {uniqueNames.length - 20}{' '}
                    more
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================
            UNIQUE SHADES WITH NAMES - GRID
        ====================================================== */}

        {uniqueShadesWithNames.length > 0 && (
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
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-emerald-50 text-emerald-600'
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
                    Unique Shades
                  </h2>

                  <p
                    className={`text-[11px] ${
                      isDark
                        ? 'text-gray-400'
                        : 'text-gray-500'
                    }`}
                  >
                    {
                      uniqueShadesWithNames.length
                    }{' '}
                    distinct shades with color names
                  </p>
                </div>
              </div>

              {hasMoreUniqueShades && (
                <button
                  type="button"
                  onClick={toggleShowAllShadeNames}
                  className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/15 text-emerald-300 border border-emerald-500/20'
                      : 'bg-emerald-50/80 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60'
                  }`}
                  aria-label={
                    showAllShadeNames
                      ? 'Show less'
                      : 'Show all unique shades'
                  }
                >
                  <span>
                    {showAllShadeNames
                      ? 'Show Less'
                      : `Show All (${uniqueShadesWithNames.length})`}
                  </span>

                  {showAllShadeNames ? (
                    <ChevronUp className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
                  )}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0 overflow-hidden rounded-xl">
              {displayedUniqueShades.map(
                (shade) => (
                  <div
                    key={shade.id}
                    className="group relative aspect-[1.35/1] flex items-center justify-center cursor-pointer transition-all duration-300 hover:z-10 hover:scale-[1.03] hover:shadow-xl"
                    style={{
                      backgroundColor: shade.hex,
                    }}
                    title={`${shade.name} - ${shade.hex}`}
                    onClick={() =>
                      handleCopy(
                        shade.hex,
                        shade.id
                      )
                    }
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (
                        e.key === 'Enter' ||
                        e.key === ' '
                      ) {
                        e.preventDefault();

                        handleCopy(
                          shade.hex,
                          shade.id
                        );
                      }
                    }}
                  >
                    <span className="relative z-10 px-3 text-center text-white text-sm sm:text-base font-bold drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-105">
                      {shade.name}
                    </span>

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                    <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-medium text-white/0 group-hover:text-white/90 transition-all duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                      {shade.hex.toUpperCase()}
                    </span>

                    {copied === shade.id && (
                      <div className="absolute top-2 right-2 z-20">
                        <Check className="w-4 h-4 text-emerald-400 drop-shadow-lg" />
                      </div>
                    )}
                  </div>
                )
              )}
            </div>

            {hasMoreUniqueShades && (
              <div
                className={`mt-3 pt-3 border-t text-[11px] font-medium flex items-center justify-between ${
                  isDark
                    ? 'border-white/5 text-gray-400'
                    : 'border-gray-100 text-gray-500'
                }`}
              >
                <span>
                  {showAllShadeNames
                    ? `Showing all ${uniqueShadesWithNames.length} unique shades`
                    : `Showing 20 of ${uniqueShadesWithNames.length} unique shades`}
                </span>

                {!showAllShadeNames && (
                  <button
                    type="button"
                    className="text-emerald-500 hover:underline"
                    onClick={
                      toggleShowAllShadeNames
                    }
                  >
                    +{' '}
                    {uniqueShadesWithNames.length -
                      20}{' '}
                    more
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================
            SHADES GRID
        ====================================================== */}

        {Object.entries(groupedShades).map(
          ([type, shades]) => (
            <section
              key={type}
              className="space-y-3"
            >
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
                        backgroundColor:
                          shade.hex,
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

                      {showNames &&
                        shade.name && (
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
                        type="button"
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
        <ShadesFAQ colorName={colorName} hex={hex} colorFamily={colorFamily} />
    </div>
  );
}
