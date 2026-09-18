// components/shades/ShadesClient.tsx
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useColor } from '@/context/ColorContext';
import { useTheme } from '@/contexts/ThemeContext';
import ShadesFAQ from '@/components/shades/ShadesFAQ';
import {
  Copy,
  Check,
  Palette,
  Search,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import {
  generateShades,
  type Shade,
  getUniqueColorNames,
} from '@/components/shades/shade-generator';
import { getColorName, getColorFamily } from '@/lib/color-utils';

/* ============================================================
 * CONSTANTS
 * ============================================================ */

const DEFAULT_HEX = '32cd32';
const INITIAL_VISIBLE_COUNT = 20;

type FilterType = 'all' | 'light' | 'dark' | 'tint' | 'tone' | 'shade';

const FILTER_OPTIONS: FilterType[] = [
  'all',
  'light',
  'dark',
  'tint',
  'tone',
  'shade',
];

/* ============================================================
 * HELPERS
 * ============================================================ */

function normalizeHex(value: string | undefined): string {
  if (!value) return DEFAULT_HEX;
  const cleanHex = value.replace(/^#/, '').trim().toLowerCase();
  return /^[0-9a-f]{6}$/.test(cleanHex) ? cleanHex : DEFAULT_HEX;
}

function isValidHex(value: string | undefined | null): boolean {
  if (!value) return false;
  return /^[0-9a-f]{6}$/i.test(value.replace(/^#/, '').trim());
}

function getContrastTextColor(hexColor: string): string {
  const clean = hexColor.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#111827' : '#ffffff';
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    tint: 'Tints (Lighter)',
    shade: 'Shades (Darker)',
    tone: 'Tones (Muted)',
    light: 'Light Variations',
    dark: 'Dark Variations',
  };
  return labels[type] || type;
}

/* ============================================================
 * PROPS
 * ============================================================ */

interface ShadesClientProps {
  colorName?: string;
  colorFamily?: string;
  fullHex?: string;
  initialHex?: string;
}

/* ============================================================
 * COMPONENT
 * ============================================================ */

export default function ShadesClient({
  colorName: propColorName,
  colorFamily: propColorFamily,
  initialHex: propInitialHex,
}: ShadesClientProps) {
  const { isDark } = useTheme();
  const { currentColor, setColor } = useColor();
  const params = useParams();

  /* ---------- STATE ---------- */
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showAllNames, setShowAllNames] = useState(false);
  const [showAllShadeNames, setShowAllShadeNames] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  /* ---------- HEX RESOLUTION ---------- */
  const rawHexFromUrl = params?.hex as string | undefined;

  const hexFromUrl = useMemo(
    () => normalizeHex(propInitialHex || rawHexFromUrl),
    [propInitialHex, rawHexFromUrl]
  );

  /* ---------- CONTEXT READY CHECK ---------- */
  const isContextReady = useMemo(() => {
    return isValidHex(currentColor);
  }, [currentColor]);

  /* ============================================================
   * ✅ INITIAL URL SYNC
   * ============================================================
   * Only runs when URL changes (not on picker change)
   * ============================================================ */
  const initializedUrlHexRef = useRef<string | null>(null);

  useEffect(() => {
    if (!hexFromUrl) return;
    if (initializedUrlHexRef.current === hexFromUrl) return;

    initializedUrlHexRef.current = hexFromUrl;

    if (currentColor !== hexFromUrl) {
      setColor(hexFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hexFromUrl]); // ✅ Only hexFromUrl — picker changes preserved

  /* ============================================================
   * ✅ HEX — URL priority for first render, context after
   * ============================================================
   * 1. URL hex valid + context not initialized → URL (no flash)
   * 2. Context ready → context (picker dynamic)
   * 3. Fallback → DEFAULT_HEX
   * ============================================================ */
  const hex = useMemo(() => {
    // Priority 1: URL hex (before context sync — prevents flash)
    if (
      isValidHex(hexFromUrl) &&
      initializedUrlHexRef.current !== hexFromUrl
    ) {
      return hexFromUrl;
    }

    // Priority 2: Context color (picker changes)
    if (isContextReady && currentColor) {
      return normalizeHex(currentColor);
    }

    // Priority 3: URL fallback
    if (isValidHex(hexFromUrl)) {
      return hexFromUrl;
    }

    return DEFAULT_HEX;
  }, [hexFromUrl, isContextReady, currentColor]);

  const fullHex = useMemo(() => `#${hex.toUpperCase()}`, [hex]);

  /* ---------- INPUT VALUE ---------- */
  const [inputValue, setInputValue] = useState(fullHex);

  useEffect(() => {
    setInputValue(fullHex);
  }, [fullHex]);

  /* ---------- CONTRAST ---------- */
  const contrastColor = useMemo(
    () => getContrastTextColor(fullHex),
    [fullHex]
  );

  /* ---------- FORMAT DATA ---------- */
  const formatData = useMemo(() => {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
      if (max === rNorm) h = 60 * (((gNorm - bNorm) / delta) % 6);
      else if (max === gNorm) h = 60 * ((bNorm - rNorm) / delta + 2);
      else h = 60 * ((rNorm - gNorm) / delta + 4);
    }
    if (h < 0) h += 360;

    const l = (max + min) / 2;
    const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    const hsl = `hsl(${Math.round(h)}, ${Math.round(
      s * 100
    )}%, ${Math.round(l * 100)}%)`;

    return [
      { label: 'HEX', value: fullHex, format: 'hex' },
      { label: 'RGB', value: `rgb(${r}, ${g}, ${b})`, format: 'rgb' },
      { label: 'HSL', value: hsl, format: 'hsl' },
      { label: 'CSS', value: fullHex, format: 'css' },
    ];
  }, [hex, fullHex]);

  /* ---------- COLOR NAME / FAMILY ---------- */
  const colorName = useMemo(() => {
    return getColorName(hex) || propColorName || 'Color';
  }, [hex, propColorName]);

  const colorFamily = useMemo(() => {
    return getColorFamily(hex) || propColorFamily || 'Color';
  }, [hex, propColorFamily]);

  /* ---------- DYNAMIC H1 / TITLE ---------- */
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const h1Name = document.getElementById('shades-h1-name');
    const h1Hex = document.getElementById('shades-h1-hex');
    if (h1Name) h1Name.textContent = colorName;
    if (h1Hex) h1Hex.textContent = fullHex;

    const breadcrumbDot = document.getElementById('shades-breadcrumb-dot');
    const breadcrumbHex = document.getElementById('shades-breadcrumb-hex');
    if (breadcrumbDot) breadcrumbDot.style.backgroundColor = fullHex;
    if (breadcrumbHex) breadcrumbHex.textContent = fullHex;
  }, [colorName, fullHex]);

  /* ---------- SHADES GENERATION ---------- */
  const allShades = useMemo(() => generateShades(hex, 120), [hex]);

  const filteredShades = useMemo(() => {
    let shades = allShades;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
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

  const uniqueNames = useMemo(
    () => getUniqueColorNames(filteredShades),
    [filteredShades]
  );

  const displayedNames = useMemo(
    () =>
      showAllNames
        ? uniqueNames
        : uniqueNames.slice(0, INITIAL_VISIBLE_COUNT),
    [uniqueNames, showAllNames]
  );

  const hasMoreNames = uniqueNames.length > INITIAL_VISIBLE_COUNT;

  const uniqueShadesWithNames = useMemo(() => {
    const shadeMap = new Map<string, Shade>();
    filteredShades.forEach((shade) => {
      if (shade.name && !shadeMap.has(shade.name)) {
        shadeMap.set(shade.name, shade);
      }
    });
    return Array.from(shadeMap.values());
  }, [filteredShades]);

  const displayedUniqueShades = useMemo(
    () =>
      showAllShadeNames
        ? uniqueShadesWithNames
        : uniqueShadesWithNames.slice(0, INITIAL_VISIBLE_COUNT),
    [uniqueShadesWithNames, showAllShadeNames]
  );

  const hasMoreUniqueShades =
    uniqueShadesWithNames.length > INITIAL_VISIBLE_COUNT;

  const nameToHex = useMemo(() => {
    const map = new Map<string, string>();
    filteredShades.forEach((shade) => {
      if (shade.name && !map.has(shade.name)) {
        map.set(shade.name, shade.hex);
      }
    });
    return map;
  }, [filteredShades]);

  const groupedShades = useMemo(() => {
    const groups: Record<string, Shade[]> = {};
    filteredShades.forEach((shade) => {
      if (!groups[shade.type]) groups[shade.type] = [];
      groups[shade.type].push(shade);
    });
    return groups;
  }, [filteredShades]);

  /* ---------- HANDLERS ---------- */
  const handleCopy = async (text: string, id: string, format?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setCopiedFormat(format ?? id);
      window.setTimeout(() => {
        setCopiedId(null);
        setCopiedFormat(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value.replace(/^#/, '').toLowerCase();
    if (!/^[0-9a-f]{6}$/.test(newHex)) return;
    setColor(newHex);
    setInputValue(`#${newHex.toUpperCase()}`);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const cleanHex = value
      .replace(/^#/, '')
      .replace(/[^a-fA-F0-9]/g, '')
      .slice(0, 6);

    if (cleanHex.length === 6 && /^[0-9a-fA-F]{6}$/.test(cleanHex)) {
      setColor(cleanHex.toLowerCase());
    }
  };

  const handleHexKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const clean = inputValue.replace(/^#/, '');
      if (/^[0-9a-fA-F]{6}$/.test(clean)) {
        setColor(clean.toLowerCase());
      }
    }
  };

  const toggleShowAllNames = () => setShowAllNames((p) => !p);
  const toggleShowAllShadeNames = () => setShowAllShadeNames((p) => !p);

  /* ---------- DOWNLOAD PNG ---------- */
  const handleDownloadShades = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const shadesToExport = uniqueShadesWithNames;
      if (shadesToExport.length === 0) {
        setIsDownloading(false);
        return;
      }

      const COLS = 5;
      const PADDING = 24;
      const HEADER_HEIGHT = 80;
      const FOOTER_HEIGHT = 56;
      const CELL_W = 200;
      const CELL_H = 148;

      const rows = Math.ceil(shadesToExport.length / COLS);
      const canvasW = COLS * CELL_W + PADDING * 2;
      const canvasH =
        rows * CELL_H + PADDING * 2 + HEADER_HEIGHT + FOOTER_HEIGHT;

      const dpr = 2;
      const canvas = document.createElement('canvas');
      canvas.width = canvasW * dpr;
      canvas.height = canvasH * dpr;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');
      ctx.scale(dpr, dpr);

      // Background
      ctx.fillStyle = isDark ? '#11111d' : '#ffffff';
      ctx.fillRect(0, 0, canvasW, canvasH);

      // Header
      const headerY = PADDING;
      const swatchSize = 48;
      const r = 12;

      ctx.fillStyle = fullHex;
      ctx.beginPath();
      ctx.moveTo(PADDING + r, headerY);
      ctx.lineTo(PADDING + swatchSize - r, headerY);
      ctx.quadraticCurveTo(
        PADDING + swatchSize,
        headerY,
        PADDING + swatchSize,
        headerY + r
      );
      ctx.lineTo(PADDING + swatchSize, headerY + swatchSize - r);
      ctx.quadraticCurveTo(
        PADDING + swatchSize,
        headerY + swatchSize,
        PADDING + swatchSize - r,
        headerY + swatchSize
      );
      ctx.lineTo(PADDING + r, headerY + swatchSize);
      ctx.quadraticCurveTo(
        PADDING,
        headerY + swatchSize,
        PADDING,
        headerY + swatchSize - r
      );
      ctx.lineTo(PADDING, headerY + r);
      ctx.quadraticCurveTo(PADDING, headerY, PADDING + r, headerY);
      ctx.closePath();
      ctx.fill();

      const textX = PADDING + swatchSize + 16;
      ctx.fillStyle = isDark ? '#ffffff' : '#111827';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.textBaseline = 'top';
      ctx.fillText(`${colorName} Shades`, textX, headerY + 2);

      ctx.fillStyle = isDark ? '#9ca3af' : '#6b7280';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.fillText(
        `${fullHex}  •  ${shadesToExport.length} unique named shades`,
        textX,
        headerY + 30
      );

      // Grid
      const gridStartY = PADDING + HEADER_HEIGHT;

      shadesToExport.forEach((shade, index) => {
        const col = index % COLS;
        const row = Math.floor(index / COLS);
        const x = PADDING + col * CELL_W;
        const y = gridStartY + row * CELL_H;

        ctx.fillStyle = shade.hex;
        ctx.fillRect(x, y, CELL_W, CELL_H);

        const textColor = getContrastTextColor(shade.hex);

        ctx.fillStyle = textColor;
        ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const maxTextWidth = CELL_W - 24;
        let displayName = shade.name || 'Unnamed';
        if (ctx.measureText(displayName).width > maxTextWidth) {
          while (
            displayName.length > 3 &&
            ctx.measureText(displayName + '…').width > maxTextWidth
          ) {
            displayName = displayName.slice(0, -1);
          }
          displayName += '…';
        }

        ctx.fillText(displayName, x + CELL_W / 2, y + CELL_H / 2 - 8);

        ctx.font = '12px ui-monospace, SFMono-Regular, monospace';
        ctx.fillStyle = textColor;
        ctx.globalAlpha = 0.85;
        ctx.fillText(
          shade.hex.toUpperCase(),
          x + CELL_W / 2,
          y + CELL_H / 2 + 16
        );
        ctx.globalAlpha = 1;
      });

      ctx.textAlign = 'left';

      // Footer watermark
      const footerTop = canvasH - FOOTER_HEIGHT;

      ctx.strokeStyle = isDark
        ? 'rgba(255,255,255,0.08)'
        : 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PADDING, footerTop);
      ctx.lineTo(canvasW - PADDING, footerTop);
      ctx.stroke();

      ctx.fillStyle = isDark ? '#9ca3af' : '#6b7280';
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        'www.whycolors.com',
        canvasW / 2,
        footerTop + FOOTER_HEIGHT / 2 - 6
      );

      ctx.font = '11px system-ui, -apple-system, sans-serif';
      ctx.fillStyle = isDark ? '#6b7280' : '#9ca3af';
      ctx.fillText(
        'Free color tools, shades & palettes',
        canvasW / 2,
        footerTop + FOOTER_HEIGHT / 2 + 14
      );

      // Download
      const safeColorName = colorName
        .replace(/[^a-z0-9]+/gi, '-')
        .toLowerCase();
      const filename = `${safeColorName}-${hex}-shades.png`;

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  /* ============================================================
   * RENDER
   * ============================================================ */
  return (
    <div
      className={`min-h-screen p-4 sm:p-6 md:p-8 ${
        isDark ? 'bg-[#090911] text-gray-100' : 'bg-gray-50 text-gray-800'
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HERO + HEADER */}
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
                    document.getElementById('color-picker')?.click()
                  }
                  role="button"
                  tabIndex={0}
                  aria-label="Click to pick a color"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      document.getElementById('color-picker')?.click();
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
                      isDark ? 'text-gray-300' : 'text-gray-600'
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
                    <label htmlFor="color-hex-input" className="sr-only">
                      Enter HEX color code
                    </label>

                    <input
                      id="color-hex-input"
                      type="text"
                      value={inputValue}
                      onChange={handleColorChange}
                      onKeyDown={handleHexKeyDown}
                      spellCheck={false}
                      autoComplete="off"
                      inputMode="text"
                      maxLength={7}
                      className={`text-2xl sm:text-4xl font-extrabold rounded-xl px-4 py-1.5 w-44 sm:w-52 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] font-mono transition-all shadow-inner border ${
                        isDark ? 'border-white/20' : 'border-gray-200'
                      }`}
                      style={{
                        color: contrastColor,
                        backgroundColor: fullHex,
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      }}
                      aria-label="HEX color code input"
                    />

                    <button
                      type="button"
                      onClick={() => handleCopy(fullHex, 'hex', 'hex')}
                      className={`ml-2.5 p-2.5 border rounded-xl transition-all active:scale-95 shadow-md ${
                        isDark
                          ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white/90'
                          : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700'
                      }`}
                      aria-label={
                        copiedId === 'hex' && copiedFormat === 'hex'
                          ? 'Copied!'
                          : 'Copy HEX Code'
                      }
                      title="Copy HEX Code"
                    >
                      {copiedId === 'hex' && copiedFormat === 'hex' ? (
                        <Check
                          className="w-5 h-5 text-emerald-400"
                          aria-hidden="true"
                        />
                      ) : (
                        <Copy className="w-5 h-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

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
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {filteredShades.length} shades, {allShades.length}{' '}
                    variations total
                  </span>
                </div>
              </div>
            </div>

            {/* COLOR FORMAT DATA */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 w-full lg:w-auto min-w-[280px]"
              role="group"
              aria-label="Color format values"
            >
              {formatData.map((item) => {
                const isCopied =
                  copiedId === item.format &&
                  copiedFormat === item.format;

                return (
                  <div
                    key={item.label}
                    onClick={() =>
                      item.value &&
                      handleCopy(item.value, item.format, item.format)
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
                        (e.key === 'Enter' || e.key === ' ') &&
                        item.value
                      ) {
                        e.preventDefault();
                        handleCopy(item.value, item.format, item.format);
                      }
                    }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest ${
                          isDark ? 'text-gray-200' : 'text-gray-500'
                        }`}
                      >
                        {item.label}
                      </span>

                      {item.value && (
                        <div className="flex items-center gap-1">
                          {isCopied ? (
                            <Check
                              className="w-3 h-3 text-emerald-400"
                              aria-hidden="true"
                            />
                          ) : (
                            <Copy
                              className={`w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ${
                                isDark ? 'text-gray-500' : 'text-gray-400'
                              }`}
                              aria-hidden="true"
                            />
                          )}
                        </div>
                      )}
                    </div>

                    <p
                      className={`font-mono text-xs sm:text-sm font-medium truncate ${
                        isDark ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {item.value || '—'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </header>

        {/* SEARCH + FILTER */}
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
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}
            />

            <input
              type="text"
              placeholder="Search by hex or color name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-[#7c3aed] outline-none ${
                isDark
                  ? 'bg-[#0a0a14] border-white/10 text-white placeholder:text-gray-500'
                  : 'bg-white border-gray-300 text-gray-800 placeholder:text-gray-400'
              }`}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((type) => (
              <button
                key={type}
                type="button"
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

        {/* COLOR NAMES */}
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
                  <div
                    className={`text-sm font-bold tracking-wide ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Color Names Found
                  </div>

                  <p
                    className={`text-[11px] ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {uniqueNames.length} distinct shades identified
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
                    showAllNames ? 'Show less names' : 'Show all names'
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
                const colorHex = nameToHex.get(name) ?? '#888888';

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
                      style={{ backgroundColor: colorHex }}
                    />
                    <span className="capitalize tracking-tight">{name}</span>
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
                    : `Showing ${INITIAL_VISIBLE_COUNT} of ${uniqueNames.length} names`}
                </span>

                {!showAllNames && (
                  <button
                    type="button"
                    className="text-indigo-500 hover:underline"
                    onClick={toggleShowAllNames}
                  >
                    + {uniqueNames.length - INITIAL_VISIBLE_COUNT} more
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* UNIQUE SHADES WITH NAMES - GRID */}
        {uniqueShadesWithNames.length > 0 && (
          <div
            className={`p-4 sm:p-5 rounded-2xl transition-all ${
              isDark
                ? 'bg-gradient-to-b from-[#18182a]/90 to-[#11111d]/90 border border-white/10 shadow-xl shadow-black/40'
                : 'bg-white border border-gray-100 shadow-xl shadow-gray-200/50'
            }`}
          >
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
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
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {colorName} Shades
                  </h2>

                  <p
                    className={`text-[11px] ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    {uniqueShadesWithNames.length} distinct shades with color
                    names
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleDownloadShades}
                  disabled={isDownloading}
                  className={`group flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
                    isDark
                      ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/70'
                  }`}
                  aria-label="Download shades as PNG image"
                  title="Download shades as PNG image"
                >
                  {isDownloading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Preparing…</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 transition-transform group-hover:translate-y-0.5" />
                      <span>Download PNG</span>
                    </>
                  )}
                </button>

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
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0 overflow-hidden rounded-xl">
              {displayedUniqueShades.map((shade) => {
                const shadeTextColor = getContrastTextColor(shade.hex);
                const isLightShade = shadeTextColor === '#111827';

                return (
                  <div
                    key={shade.id}
                    className="group relative aspect-[1.35/1] flex items-center justify-center cursor-pointer transition-all duration-300 hover:z-10 hover:scale-[1.03] hover:shadow-xl"
                    style={{ backgroundColor: shade.hex }}
                    title={`${shade.name} - ${shade.hex}`}
                    onClick={() => handleCopy(shade.hex, shade.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCopy(shade.hex, shade.id);
                      }
                    }}
                  >
                    <span
                      className="relative z-10 px-3 text-center text-sm sm:text-base font-bold transition-transform duration-300 group-hover:scale-105"
                      style={{
                        color: shadeTextColor,
                        textShadow: isLightShade
                          ? '0 1px 1px rgba(0,0,0,0.15)'
                          : '0 1px 2px rgba(0,0,0,0.5)',
                      }}
                    >
                      {shade.name}
                    </span>

                    <div
                      className={`absolute inset-0 transition-colors duration-300 ${
                        isLightShade
                          ? 'group-hover:bg-black/5'
                          : 'group-hover:bg-black/10'
                      }`}
                    />

                    <span
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-medium opacity-0 group-hover:opacity-90 transition-all duration-300"
                      style={{
                        color: shadeTextColor,
                        textShadow: isLightShade
                          ? '0 1px 1px rgba(0,0,0,0.2)'
                          : '0 1px 2px rgba(0,0,0,0.5)',
                      }}
                    >
                      {shade.hex.toUpperCase()}
                    </span>

                    {copiedId === shade.id && (
                      <div className="absolute top-2 right-2 z-20">
                        <Check
                          className="w-4 h-4 drop-shadow-lg"
                          style={{
                            color: isLightShade ? '#059669' : '#34d399',
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
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
                    : `Showing ${INITIAL_VISIBLE_COUNT} of ${uniqueShadesWithNames.length} unique shades`}
                </span>

                {!showAllShadeNames && (
                  <button
                    type="button"
                    className="text-emerald-500 hover:underline"
                    onClick={toggleShowAllShadeNames}
                  >
                    +{' '}
                    {uniqueShadesWithNames.length - INITIAL_VISIBLE_COUNT}{' '}
                    more
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* SHADES GRID */}
        {Object.entries(groupedShades).map(([type, shades]) => (
          <section key={type} className="space-y-3">
            <h2
              className={`text-lg font-semibold flex items-center gap-2 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}
            >
              {getTypeLabel(type)}
              <span
                className={`text-sm font-normal ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
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
                    style={{ backgroundColor: shade.hex }}
                  />

                  <div
                    className={`p-2 text-center ${
                      isDark ? 'bg-[#0a0a14]' : 'bg-white'
                    }`}
                  >
                    <p
                      className="font-mono text-xs font-medium truncate cursor-pointer hover:text-[#7c3aed] transition-colors"
                      onClick={() => handleCopy(shade.hex, shade.id)}
                      title={`Click to copy ${shade.hex}`}
                    >
                      {shade.hex}
                    </p>

                    {shade.name && (
                      <p
                        className={`text-[10px] truncate mt-0.5 ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}
                        title={shade.name}
                      >
                        {shade.name}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopy(shade.hex, shade.id)}
                      className={`mt-1 p-1 rounded-md transition-all opacity-0 group-hover:opacity-100 ${
                        isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                      }`}
                      aria-label="Copy color"
                    >
                      {copiedId === shade.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy
                          className={`w-3 h-3 ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}
                        />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* EMPTY STATE */}
        {filteredShades.length === 0 && (
          <div
            className={`text-center py-20 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No shades found</p>
            <p className="text-sm">Try adjusting your search or filter</p>
          </div>
        )}

        {/* STATISTICS FOOTER */}
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
                  isDark ? 'text-white' : 'text-gray-800'
                }`}
              >
                {filteredShades.length}
              </p>
              <p
                className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Total Shades
              </p>
            </div>

            <div>
              <p
                className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}
              >
                {Object.keys(groupedShades).length}
              </p>
              <p
                className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Color Families
              </p>
            </div>

            <div>
              <p
                className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}
              >
                {uniqueNames.length}
              </p>
              <p
                className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Unique Color Names
              </p>
            </div>

            <div>
              <p
                className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}
              >
                {allShades.length}
              </p>
              <p
                className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Total Variations
              </p>
            </div>
          </div>
        </div>
      </div>

      <ShadesFAQ
        colorName={colorName}
        hex={hex}
        colorFamily={colorFamily}
      />
    </div>
  );
}