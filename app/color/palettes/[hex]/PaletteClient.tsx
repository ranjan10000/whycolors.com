// app/color/palettes/[hex]/PaletteClient.tsx
'use client';

import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import type {
  ChangeEvent,
  KeyboardEvent,
} from 'react';

import { useTheme } from '@/contexts/ThemeContext';
import {
  Copy,
  Grid3x3,
  LayoutList,
  Check,
} from 'lucide-react';

import {
  generateAllPalettes,
  normalizeHex,
  getColorNameFromHex,
} from '@/lib/dynamic-palettes';
import DynamicSocialShare from '@/app/DynamicSocialShare';
import { isValidHex } from '@/lib/color-utils';

interface PaletteType {
  id: string;
  label: string;
  colors: string[];
}

interface PaletteClientProps {
  hex: string;
  fullHex: string;
  colorName: string;
  paletteTypes: PaletteType[];
}

type ViewMode = 'grid' | 'strip';

type HistoryMode = 'push' | 'replace' | 'none';

const COPY_TIMEOUT = 2000;
const COLOR_PICKER_ID = 'palette-color-picker';
const DEBOUNCE_DELAY = 300;

/**
 * Returns readable foreground color for a HEX background.
 */
function getTextColor(hexValue: string): string {
  try {
    const clean = hexValue.replace('#', '').trim();

    if (clean.length < 6) {
      return '#17191D';
    }

    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);

    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
      return '#17191D';
    }

    return r * 0.299 + g * 0.587 + b * 0.114 > 170
      ? '#17191D'
      : '#FFFFFF';
  } catch {
    return '#17191D';
  }
}

/**
 * Converts 3-digit HEX to 6-digit HEX.
 */
function expandShortHex(value: string): string {
  const clean = value
    .replace('#', '')
    .trim();

  if (clean.length !== 3) {
    return clean;
  }

  return clean
    .split('')
    .map((char) => char + char)
    .join('');
}

/**
 * Extracts and validates a HEX value from user input.
 *
 * Returns a normalized 6-digit HEX without '#',
 * or null when the value is incomplete/invalid.
 */
function normalizeInputHex(value: string): string | null {
  const cleanHex = value
    .replace('#', '')
    .replace(/[^a-fA-F0-9]/g, '')
    .trim();

  if (cleanHex.length !== 3 && cleanHex.length !== 6) {
    return null;
  }

  if (!isValidHex(cleanHex)) {
    return null;
  }

  return expandShortHex(cleanHex).toLowerCase();
}

export default function PaletteClient({
  hex,
  fullHex,
  colorName,
  paletteTypes: initialPaletteTypes,
}: PaletteClientProps) {
  const { isDark } = useTheme();

  const [copiedColor, setCopiedColor] =
    useState<string | null>(null);

  const [copiedAll, setCopiedAll] =
    useState<string | null>(null);

  const [viewMode, setViewMode] =
    useState<ViewMode>('grid');

  const [paletteTypes, setPaletteTypes] =
    useState<PaletteType[]>(initialPaletteTypes);

  const [currentColor, setCurrentColor] =
    useState<string>(normalizeHex(fullHex));

  const [currentColorName, setCurrentColorName] =
    useState<string>(colorName);

  const [copyMessage, setCopyMessage] =
    useState<string | null>(null);

  const [inputValue, setInputValue] =
    useState<string>(
      `#${normalizeHex(fullHex)
        .replace('#', '')
        .toUpperCase()}`
    );

  const copyColorTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyAllTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * ============================================================
   * DYNAMIC H1 + BREADCRUMB + DOCUMENT TITLE
   * ============================================================
   *
   * H1 itself is server-rendered in page.tsx.
   * We update its text dynamically when the color changes.
   */
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const h1Name =
      document.getElementById('palette-h1-name');

    const h1Hex =
      document.getElementById('palette-h1-hex');

    if (h1Name) {
      h1Name.textContent = currentColorName;
    }

    if (h1Hex) {
      h1Hex.textContent = currentColor;
    }

    const breadcrumbDot =
      document.getElementById(
        'palette-breadcrumb-dot'
      );

    const breadcrumbHex =
      document.getElementById(
        'palette-breadcrumb-hex'
      );

    if (breadcrumbDot) {
      breadcrumbDot.style.backgroundColor =
        currentColor;
    }

    if (breadcrumbHex) {
      breadcrumbHex.textContent = currentColor;
    }

    document.title =
      `${currentColorName} Color Palettes (${currentColor})`;
  }, [currentColorName, currentColor]);

  /**
   * ============================================================
   * GENERATE PALETTES
   * ============================================================
   */
  const generatePalettesForColor = useCallback(
    (colorHex: string): PaletteType[] => {
      try {
        const normalized = normalizeHex(colorHex);

        const palettes =
          generateAllPalettes(normalized);

        /**
         * Avoid a Record<string, string[]> cast.
         *
         * Object.entries() keeps this compatible even if
         * generateAllPalettes() has a more specific return type.
         */
        const paletteEntries =
          Object.entries(palettes);

        return initialPaletteTypes.map((type) => {
          const entry = paletteEntries.find(
            ([key]) => key === type.id
          );

          return {
            ...type,
            colors:
              entry?.[1] ?? [normalized],
          };
        });
      } catch (error) {
        console.error(
          'Error generating palettes:',
          error
        );

        return initialPaletteTypes;
      }
    },
    [initialPaletteTypes]
  );

  /**
   * ============================================================
   * UPDATE BROWSER URL
   * ============================================================
   */
  const updateBrowserUrl = useCallback(
    (
      normalizedColor: string,
      historyMode: HistoryMode
    ) => {
      if (
        typeof window === 'undefined' ||
        historyMode === 'none'
      ) {
        return;
      }

      const cleanHex = normalizedColor
        .replace('#', '')
        .toLowerCase();

      const newPath =
        `/color/palettes/${cleanHex}`;

      const currentPath =
        window.location.pathname;

      if (currentPath === newPath) {
        return;
      }

      if (historyMode === 'push') {
        window.history.pushState(
          {
            hex: cleanHex,
          },
          '',
          newPath
        );
      } else {
        window.history.replaceState(
          {
            hex: cleanHex,
          },
          '',
          newPath
        );
      }
    },
    []
  );

  /**
   * ============================================================
   * UPDATE PALETTE
   * ============================================================
   *
   * This function updates React state.
   *
   * History behavior is explicitly controlled:
   *
   * push    → intentional navigation, e.g. Enter
   * replace → live typing / color picker
   * none    → browser Back / Forward
   *
   * This prevents accidental history spam.
   */
  const updatePalette = useCallback(
    (
      newColor: string,
      historyMode: HistoryMode = 'replace'
    ) => {
      if (!newColor) {
        return;
      }

      const cleanInput = newColor
        .replace('#', '')
        .trim();

      if (!isValidHex(cleanInput)) {
        return;
      }

      try {
        const normalized =
          normalizeHex(`#${cleanInput}`);

        /**
         * Avoid unnecessary regeneration.
         */
        if (
          normalized.toLowerCase() ===
          currentColor.toLowerCase()
        ) {
          /**
           * Still keep the input synchronized.
           */
          setInputValue(
            normalized.toUpperCase()
          );

          updateBrowserUrl(
            normalized,
            historyMode
          );

          return;
        }

        const newPalettes =
          generatePalettesForColor(normalized);

        const name =
          getColorNameFromHex(normalized);

        setCurrentColor(normalized);
        setCurrentColorName(name);
        setPaletteTypes(newPalettes);

        /**
         * This programmatic update is safe because
         * the input effect compares the normalized value
         * with currentColor before generating again.
         */
        setInputValue(
          normalized.toUpperCase()
        );

        updateBrowserUrl(
          normalized,
          historyMode
        );
      } catch (error) {
        console.error(
          'Error updating palette:',
          error
        );
      }
    },
    [
      currentColor,
      generatePalettesForColor,
      updateBrowserUrl,
    ]
  );

  /**
   * ============================================================
   * BROWSER BACK / FORWARD SUPPORT
   * ============================================================
   */
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handlePopState = () => {
      const pathname =
        window.location.pathname;

      const match =
        pathname.match(
          /^\/color\/palettes\/([a-fA-F0-9]{3,6})\/?$/
        );

      if (!match) {
        return;
      }

      const cleanHex = match[1];

      if (!isValidHex(cleanHex)) {
        return;
      }

      /**
       * IMPORTANT:
       * historyMode = none
       *
       * So Back/Forward never creates
       * another history entry.
       */
      updatePalette(
        `#${cleanHex}`,
        'none'
      );
    };

    window.addEventListener(
      'popstate',
      handlePopState
    );

    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState
      );
    };
  }, [updatePalette]);

  /**
   * ============================================================
   * COLOR PICKER
   * ============================================================
   *
   * Native color picker can fire many change events while
   * selecting. Therefore use replaceState instead of pushState.
   *
   * This keeps browser history clean.
   */
  const handlePickerChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement>
    ) => {
      const newHex = e.target.value;

      if (!newHex) {
        return;
      }

      const cleanHex =
        newHex.replace('#', '');

      if (!isValidHex(cleanHex)) {
        return;
      }

      updatePalette(
        `#${cleanHex}`,
        'replace'
      );
    },
    [updatePalette]
  );

  /**
   * ============================================================
   * TEXT INPUT → DEBOUNCED COLOR UPDATE
   * ============================================================
   *
   * IMPORTANT:
   * No skip ref is required.
   *
   * Programmatic input updates are ignored when the normalized
   * input already equals currentColor.
   */
  useEffect(() => {
    const normalizedHex =
      normalizeInputHex(inputValue);

    if (!normalizedHex) {
      return;
    }

    const normalizedWithHash =
      `#${normalizedHex}`;

    /**
     * This is the key duplicate-update protection.
     *
     * Picker / Enter / Back button can update inputValue
     * programmatically. If it already represents currentColor,
     * do nothing.
     */
    if (
      normalizedWithHash.toLowerCase() ===
      currentColor.toLowerCase()
    ) {
      return;
    }

    const timer =
      setTimeout(() => {
        updatePalette(
          normalizedWithHash,
          'replace'
        );
      }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(timer);
    };
  }, [
    inputValue,
    currentColor,
    updatePalette,
  ]);

  /**
   * ============================================================
   * HEX INPUT CHANGE
   * ============================================================
   */
  const handleColorChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement>
    ) => {
      const value = e.target.value;

      /**
       * Allow only # + HEX characters.
       */
      const cleanValue = value
        .replace(/[^#a-fA-F0-9]/g, '');

      /**
       * Maximum:
       * # + 6 HEX characters
       */
      const normalizedValue =
        cleanValue.startsWith('#')
          ? `#${cleanValue
              .slice(1)
              .replace(/#/g, '')
              .slice(0, 6)}`
          : cleanValue
              .replace(/#/g, '')
              .slice(0, 6);

      setInputValue(normalizedValue);
    },
    []
  );

  /**
   * ============================================================
   * ENTER KEY
   * ============================================================
   *
   * Enter represents an intentional navigation action,
   * so it uses pushState.
   */
  const handleInputKeyDown = useCallback(
    (
      e: KeyboardEvent<HTMLInputElement>
    ) => {
      if (e.key !== 'Enter') {
        return;
      }

      e.preventDefault();

      const normalizedHex =
        normalizeInputHex(inputValue);

      if (!normalizedHex) {
        return;
      }

      updatePalette(
        `#${normalizedHex}`,
        'push'
      );
    },
    [inputValue, updatePalette]
  );

  /**
   * ============================================================
   * COPY SINGLE COLOR
   * ============================================================
   */
  const handleCopy = useCallback(
    async (color: string) => {
      let copiedSuccessfully = false;

      try {
        if (
          typeof navigator !== 'undefined' &&
          navigator.clipboard
        ) {
          await navigator.clipboard.writeText(
            color
          );

          copiedSuccessfully = true;
        }
      } catch {
        copiedSuccessfully = false;
      }

      /**
       * Clipboard fallback.
       */
      if (!copiedSuccessfully) {
        try {
          const textArea =
            document.createElement('textarea');

          textArea.value = color;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          textArea.setAttribute(
            'readonly',
            ''
          );

          document.body.appendChild(
            textArea
          );

          textArea.focus();
          textArea.select();

          copiedSuccessfully =
            document.execCommand('copy');

          document.body.removeChild(
            textArea
          );
        } catch (fallbackError) {
          console.error(
            'Failed to copy color:',
            fallbackError
          );

          copiedSuccessfully = false;
        }
      }

      if (!copiedSuccessfully) {
        setCopyMessage(
          'Unable to copy color'
        );

        return;
      }

      setCopiedColor(color);

      setCopyMessage(
        `${color} copied to clipboard!`
      );

      if (
        copyColorTimeoutRef.current
      ) {
        clearTimeout(
          copyColorTimeoutRef.current
        );
      }

      copyColorTimeoutRef.current =
        setTimeout(() => {
          setCopiedColor(null);
          setCopyMessage(null);
        }, COPY_TIMEOUT);
    },
    []
  );

  /**
   * ============================================================
   * COPY ALL COLORS
   * ============================================================
   */
  const handleCopyAll = useCallback(
    async (
      colors: string[],
      label: string
    ) => {
      const allColors =
        colors.join(', ');

      let copiedSuccessfully = false;

      try {
        if (
          typeof navigator !== 'undefined' &&
          navigator.clipboard
        ) {
          await navigator.clipboard.writeText(
            allColors
          );

          copiedSuccessfully = true;
        }
      } catch {
        copiedSuccessfully = false;
      }

      /**
       * Clipboard fallback.
       */
      if (!copiedSuccessfully) {
        try {
          const textArea =
            document.createElement('textarea');

          textArea.value = allColors;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          textArea.setAttribute(
            'readonly',
            ''
          );

          document.body.appendChild(
            textArea
          );

          textArea.focus();
          textArea.select();

          copiedSuccessfully =
            document.execCommand('copy');

          document.body.removeChild(
            textArea
          );
        } catch (error) {
          console.error(
            'Failed to copy all colors:',
            error
          );

          copiedSuccessfully = false;
        }
      }

      if (!copiedSuccessfully) {
        setCopyMessage(
          'Unable to copy colors'
        );

        return;
      }

      setCopiedAll(label);

      setCopyMessage(
        `${label} colors copied to clipboard!`
      );

      if (
        copyAllTimeoutRef.current
      ) {
        clearTimeout(
          copyAllTimeoutRef.current
        );
      }

      copyAllTimeoutRef.current =
        setTimeout(() => {
          setCopiedAll(null);
          setCopyMessage(null);
        }, COPY_TIMEOUT);
    },
    []
  );

  /**
   * ============================================================
   * PRECOMPUTE TEXT COLORS
   * ============================================================
   *
   * Instead of calling getTextColor() repeatedly during every
   * render, calculate it once whenever paletteTypes changes.
   */
  const textColorMap = useMemo(() => {
    const map = new Map<
      string,
      string
    >();

    for (const type of paletteTypes) {
      for (const color of type.colors) {
        const key = color.toLowerCase();

        if (!map.has(key)) {
          map.set(
            key,
            getTextColor(color)
          );
        }
      }
    }

    return map;
  }, [paletteTypes]);

  /**
   * ============================================================
   * CLEANUP
   * ============================================================
   */
  useEffect(() => {
    return () => {
      if (
        copyColorTimeoutRef.current
      ) {
        clearTimeout(
          copyColorTimeoutRef.current
        );
      }

      if (
        copyAllTimeoutRef.current
      ) {
        clearTimeout(
          copyAllTimeoutRef.current
        );
      }
    };
  }, []);

  /**
   * ============================================================
   * RENDER
   * ============================================================
   */
  return (
    <div
      className={`max-w-8xl mx-auto p-3 sm:p-4 md:p-6 min-h-screen ${
        isDark
          ? 'bg-[#090911]'
          : 'bg-gray-50'
      }`}
    >
      {/* ======================================================
          COPY MESSAGE
      ====================================================== */}
      {copyMessage && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-black/80 text-white text-sm font-medium shadow-xl animate-in fade-in slide-in-from-top-4"
          role="status"
          aria-live="polite"
        >
          {copyMessage}
        </div>
      )}

      {/* ======================================================
          HEADER
      ====================================================== */}
      <div className="relative mb-8 sm:mb-10">
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
          {/* ==================================================
              COLOR PICKER
          ================================================== */}
          <div className="relative group flex-shrink-0">
            <div
              className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:rotate-1 ${
                isDark
                  ? 'border-white/20 shadow-2xl'
                  : 'border-gray-200 shadow-lg'
              }`}
              style={{
                backgroundColor:
                  currentColor,
                boxShadow: isDark
                  ? `0 12px 40px -8px ${currentColor}60, inset 0 1px 1px rgba(255,255,255,0.1)`
                  : `0 12px 40px -8px ${currentColor}40, inset 0 1px 1px rgba(255,255,255,0.5)`,
              }}
            />

            {/* HEX badge */}
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
                {currentColor}
              </span>
            </div>

            {/* Actual native color picker */}
            <input
              id={COLOR_PICKER_ID}
              type="color"
              value={currentColor}
              onChange={handlePickerChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Choose a color"
            />
          </div>

          {/* ==================================================
              COLOR INFORMATION
          ================================================== */}
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
                  onKeyDown={
                    handleInputKeyDown
                  }
                  maxLength={7}
                  autoComplete="off"
                  spellCheck={false}
                  className={`text-2xl sm:text-4xl font-extrabold rounded-xl px-4 py-1.5 w-44 sm:w-52 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] font-mono transition-all shadow-inner border ${
                    isDark
                      ? 'border-white/20'
                      : 'border-gray-200'
                  }`}
                  style={{
                    color:
                      textColorMap.get(
                        currentColor.toLowerCase()
                      ) ?? '#17191D',
                    backgroundColor:
                      currentColor,
                    textShadow:
                      '0 1px 2px rgba(0,0,0,0.1)',
                  }}
                  aria-label="HEX color code input"
                />

                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      currentColor
                    )
                  }
                  className={`ml-2.5 p-2.5 border rounded-xl transition-all active:scale-95 shadow-md ${
                    isDark
                      ? 'bg-white/10 hover:bg-white/20 border-white/10 text-white/90'
                      : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700'
                  }`}
                  aria-label={
                    copiedColor ===
                    currentColor
                      ? 'Copied!'
                      : 'Copy HEX Code'
                  }
                  title="Copy HEX Code"
                >
                  {copiedColor ===
                  currentColor ? (
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

            {/* Badges */}
            <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
              <span
                className={`px-3.5 py-1 border rounded-full text-xs font-semibold tracking-wide backdrop-blur-md ${
                  isDark
                    ? 'bg-white/10 border-white/10 text-gray-200'
                    : 'bg-gray-100 border-gray-200 text-gray-700'
                }`}
              >
                Color Palette
              </span>

              <span
                className={`px-3.5 py-1 border rounded-full text-xs font-semibold tracking-wide backdrop-blur-md ${
                  isDark
                    ? 'bg-white/10 border-white/10 text-gray-200'
                    : 'bg-gray-100 border-gray-200 text-gray-700'
                }`}
              >
                {paletteTypes.length}{' '}
                Palettes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          VIEW MODE TOGGLE
      ====================================================== */}
      <div className="flex justify-end mb-6">
        <div
          className={`inline-flex rounded-xl border p-1 ${
            isDark
              ? 'border-gray-700 bg-[#1a1a2e]'
              : 'border-gray-200 bg-white'
          }`}
        >
          <button
            type="button"
            onClick={() =>
              setViewMode('grid')
            }
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-[#7c3aed] text-white'
                : isDark
                ? 'text-gray-400 hover:text-white hover:bg-white/10'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="Grid view"
            aria-current={
              viewMode === 'grid'
                ? 'true'
                : 'false'
            }
          >
            <Grid3x3
              className="w-4 h-4"
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            onClick={() =>
              setViewMode('strip')
            }
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'strip'
                ? 'bg-[#7c3aed] text-white'
                : isDark
                ? 'text-gray-400 hover:text-white hover:bg-white/10'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            aria-label="Strip view"
            aria-current={
              viewMode === 'strip'
                ? 'true'
                : 'false'
            }
          >
            <LayoutList
              className="w-4 h-4"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {/* ======================================================
          PALETTE TYPES
      ====================================================== */}
      <div className="grid grid-cols-1 gap-6">
        {paletteTypes.map((type) => {
          const isBaseColor =
            type.colors.some(
              (color) =>
                color.toLowerCase() ===
                currentColor.toLowerCase()
            );

          const colorCount =
            type.colors.length;

          return (
            <div
              key={type.id}
              className={`rounded-xl p-4 transition-all ${
                isDark
                  ? 'bg-[#1a1a2e] border border-[#2d2d4a] hover:border-[#8b5cf6]/50'
                  : 'bg-white border border-gray-200 hover:border-[#7c3aed]/50'
              } ${
                isBaseColor
                  ? 'border-purple-500/50 ring-1 ring-purple-500/30'
                  : ''
              }`}
            >
              {/* Palette title */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <h3
                  className={`text-base font-medium ${
                    isDark
                      ? 'text-white'
                      : 'text-gray-800'
                  }`}
                >
                  {type.label}
                </h3>

                <span
                  className={`text-xs ${
                    isDark
                      ? 'text-gray-500'
                      : 'text-gray-400'
                  }`}
                >
                  ({colorCount} colors)
                </span>

                {isBaseColor && (
                  <span className="text-[10px] font-bold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full">
                    Contains Base
                  </span>
                )}
              </div>

              {/* ==================================================
                  GRID VIEW
              ================================================== */}
            {viewMode === 'grid' && (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-0 overflow-hidden rounded-xl">
    {type.colors.map((color: string, i: number) => {
      const isCopied = copiedColor === color;
      const isBase = color.toLowerCase() === currentColor.toLowerCase();
      const textColor = textColorMap.get(color.toLowerCase()) ?? '#17191D';
      const num = String(i + 1).padStart(2, '0');

      // ✅ Compute info
      const clean = color.replace('#', '');
      const r = parseInt(clean.slice(0, 2), 16);
      const g = parseInt(clean.slice(2, 4), 16);
      const b = parseInt(clean.slice(4, 6), 16);
      const colorName = getColorNameFromHex(color);

      return (
        <button
          key={`${type.id}-${color}-${i}`}
          type="button"
          className="group relative flex flex-col justify-between p-4 sm:p-5 min-h-[200px] sm:min-h-[240px] cursor-pointer transition-all hover:z-20 text-left w-full overflow-hidden"
          style={{
            backgroundColor: color,
            color: textColor,
          }}
          onClick={() => handleCopy(color)}
          aria-label={`Copy color ${i + 1}: ${color}. ${colorName}. RGB ${r}, ${g}, ${b}`}
        >
          {/* Top: number */}
          <span className="text-xs font-bold tracking-[0.18em] opacity-80 relative z-10">
            {num}
          </span>

          {/* Base badge */}
          {isBase && (
            <span className="absolute top-2 right-2 text-[8px] font-bold bg-black/30 px-1.5 py-0.5 rounded z-10">
              BASE
            </span>
          )}

          {/* Bottom: hex + copy */}
          <div className="relative z-10">
            <p className="font-mono text-base sm:text-lg font-bold tracking-tight">
              {color.toUpperCase()}
            </p>

            <span
              className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                isCopied ? 'bg-white/30' : 'bg-white/10'
              }`}
              style={{
                color: textColor,
                border: `1px solid ${textColor}40`,
              }}
            >
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isCopied ? 'Copied!' : 'Copy'}</span>
            </span>
          </div>

          {/* ✅ HOVER OVERLAY — Extra info */}
          <div
            className="absolute inset-0 flex flex-col justify-center gap-2.5 p-4 sm:p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none"
            style={{
              backgroundColor: isDark
                ? 'rgba(0, 0, 0, 0.88)'
                : 'rgba(255, 255, 255, 0.94)',
              color: isDark ? '#ffffff' : '#111827',
            }}
          >
            {/* Color name */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 mb-0.5">
                Name
              </p>
              <p className="text-sm sm:text-base font-bold truncate">
                {colorName}
              </p>
            </div>

            {/* RGB */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 mb-0.5">
                RGB
              </p>
              <p className="text-xs font-mono font-semibold">
                {r}, {g}, {b}
              </p>
            </div>

            {/* Hex */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 mb-0.5">
                HEX
              </p>
              <p className="text-xs font-mono font-bold">
                {color.toUpperCase()}
              </p>
            </div>

            {/* Click hint */}
            <p className="text-[10px] opacity-60 mt-auto flex items-center gap-1">
              <Copy className="w-3 h-3" aria-hidden="true" />
              Click to copy
            </p>
          </div>
        </button>
      );
    })}
  </div>
)}

              {/* ==================================================
                  STRIP VIEW
              ================================================== */}
              {viewMode === 'strip' && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyAll(
                        type.colors,
                        type.label
                      )
                    }
                    className="w-full group relative"
                    aria-label={`Copy all ${type.label} colors`}
                  >
                    <div
                      className={`w-full h-12 sm:h-14 rounded-lg overflow-hidden transition-all group-hover:scale-[1.002] group-hover:shadow-lg ${
                        isDark
                          ? 'shadow-black/30'
                          : 'shadow-gray-200/50'
                      }`}
                      style={{
                        background:
                          `linear-gradient(to right, ${type.colors.join(
                            ', '
                          )})`,
                      }}
                    >
                      <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                        <span className="text-white text-xs font-bold px-3 py-1.5 rounded-lg bg-black/50 shadow-lg">
                          {copiedAll ===
                          type.label
                            ? '✓ Copied All!'
                            : 'Copy All'}
                        </span>
                      </div>
                    </div>

                    {copiedAll ===
                      type.label && (
                      <span className="absolute -top-1 -right-1 text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                        ✓ All Copied
                      </span>
                    )}
                  </button>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 px-1">
                    {type.colors.map(
                      (
                        color: string,
                        i: number
                      ) => {
                        const isCopied =
                          copiedColor ===
                          color;

                        const isBase =
                          color.toLowerCase() ===
                          currentColor.toLowerCase();

                        return (
                          <button
                            key={`${type.id}-${color}-${i}`}
                            type="button"
                            onClick={() =>
                              handleCopy(
                                color
                              )
                            }
                            className={`text-xs font-mono font-medium transition hover:scale-105 text-center ${
                              isDark
                                ? 'text-gray-300 hover:text-white'
                                : 'text-gray-600 hover:text-gray-900'
                            } ${
                              isCopied
                                ? 'text-emerald-500 font-bold'
                                : ''
                            } ${
                              isBase
                                ? 'font-bold text-purple-500'
                                : ''
                            }`}
                            aria-label={`Copy ${color}`}
                          >
                            {color}
                            {isCopied &&
                              ' ✓'}
                            {isBase &&
                              ' ★'}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
       <div className="my-6">
         <DynamicSocialShare
    hex={currentColor.replace('#', '').toLowerCase()}
    colorName={currentColorName}
    imageUrl={`https://www.whycolors.com/api/og/palette?hex=${currentColor
      .replace('#', '')
      .toLowerCase()}`}
  />
      </div>
    </div>
  );
}