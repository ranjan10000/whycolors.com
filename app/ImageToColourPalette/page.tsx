'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Pipette,
  Sparkles,
  ImageUp,
  FolderOpen,
  X,
  Palette,
  Copy,
  Download,
  Layers,
} from 'lucide-react';
import { getColorName } from '@/lib/color-utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ColourBucket {
  r: number;
  g: number;
  b: number;
  count: number;
}

interface PaletteColour {
  r: number;
  g: number;
  b: number;
  hex: string;
  name: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

function colourDistance(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number }
): number {
  return Math.sqrt(
    Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2)
  );
}

function extractPalette(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  count: number = 5
): PaletteColour[] {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return [];

  const maxDimension = 170;
  const scale = Math.min(
    maxDimension / image.naturalWidth,
    maxDimension / image.naturalHeight,
    1
  );
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  const pixels = context.getImageData(0, 0, width, height).data;
  const buckets = new Map<string, ColourBucket>();

  for (let index = 0; index < pixels.length; index += 16) {
    const alpha = pixels[index + 3];
    if (alpha < 180) continue;

    const r = pixels[index];
    const g = pixels[index + 1];
    const b = pixels[index + 2];
    const brightness = (r + g + b) / 3;
    if (brightness < 18 || brightness > 246) continue;

    const key = [Math.round(r / 24), Math.round(g / 24), Math.round(b / 24)].join('-');
    const bucket = buckets.get(key) || { r: 0, g: 0, b: 0, count: 0 };
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    bucket.count += 1;
    buckets.set(key, bucket);
  }

  const candidates = Array.from(buckets.values())
    .map((bucket) => ({
      r: Math.round(bucket.r / bucket.count),
      g: Math.round(bucket.g / bucket.count),
      b: Math.round(bucket.b / bucket.count),
      count: bucket.count,
    }))
    .sort((a, b) => b.count - a.count);

  const minDistance = count <= 5 ? 56 : count <= 8 ? 38 : 26;

  const selected: { r: number; g: number; b: number; count: number }[] = [];
  for (const candidate of candidates) {
    if (selected.every((colour) => colourDistance(colour, candidate) > minDistance)) {
      selected.push(candidate);
    }
    if (selected.length === count) break;
  }

  for (const candidate of candidates) {
    if (selected.length === count) break;
    if (!selected.includes(candidate)) selected.push(candidate);
  }

  return selected.map((colour) => {
    const hex = rgbToHex(colour.r, colour.g, colour.b);
    const cleanHex = hex.replace('#', '').toLowerCase();
    return {
      ...colour,
      hex,
      name: getColorName(cleanHex),
    };
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ImageToColourPalette() {
  const [activePalette, setActivePalette] = useState<PaletteColour[]>([]);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewAlt, setPreviewAlt] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusTone, setStatusTone] = useState<'success' | 'error'>('success');
  const [isDragging, setIsDragging] = useState(false);
  const [colourCount, setColourCount] = useState(5);
  const [activeTab, setActiveTab] = useState<'palette' | 'strip'>('palette');

  const imageInputRef = useRef<HTMLInputElement>(null);
  const samplingCanvasRef = useRef<HTMLCanvasElement>(null);
  const stripCanvasRef = useRef<HTMLCanvasElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const loadedImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const setStatus = useCallback(
    (message: string, tone: 'success' | 'error' = 'success') => {
      setStatusMessage(message);
      setStatusTone(tone);
    },
    []
  );

  // -----------------------------------------------------------------------
  // Clipboard
  // -----------------------------------------------------------------------
  const copyText = useCallback(
    async (text: string, successText: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setStatus(successText, 'success');
      } catch {
        const helper = document.createElement('textarea');
        helper.value = text;
        helper.style.position = 'fixed';
        helper.style.opacity = '0';
        document.body.appendChild(helper);
        helper.select();
        document.execCommand('copy');
        helper.remove();
        setStatus(successText, 'success');
      }
    },
    [setStatus]
  );

  // -----------------------------------------------------------------------
  // Image loading & palette extraction
  // -----------------------------------------------------------------------
  const loadImage = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        setStatus('Please choose an image file to create a palette.', 'error');
        return;
      }

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      const objectUrl = URL.createObjectURL(file);
      objectUrlRef.current = objectUrl;

      const loadedImage = new Image();
      loadedImage.onload = () => {
        loadedImageRef.current = loadedImage;
        setPreviewSrc(objectUrl);
        setPreviewAlt(`Preview of ${file.name}`);

        const canvas = samplingCanvasRef.current;
        if (!canvas) return;

        const palette = extractPalette(loadedImage, canvas, colourCount);
        if (!palette.length) {
          setStatus(
            'This image did not contain enough visible colour information.',
            'error'
          );
          return;
        }

        setActivePalette(palette);
        setStatus(
          'Palette created. Click any swatch to copy its HEX value.',
          'success'
        );
      };

      loadedImage.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setStatus('That image could not be read. Please try another file.', 'error');
      };

      loadedImage.src = objectUrl;
    },
    [colourCount, setStatus]
  );

  useEffect(() => {
    const img = loadedImageRef.current;
    const canvas = samplingCanvasRef.current;
    if (!img || !canvas || !previewSrc) return;

    const palette = extractPalette(img, canvas, colourCount);
    if (palette.length) {
      setActivePalette(palette);
      setStatus(`Palette updated to ${palette.length} colours.`, 'success');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colourCount]);

  // -----------------------------------------------------------------------
  // Reset
  // -----------------------------------------------------------------------
  const resetTool = useCallback(() => {
    if (imageInputRef.current) imageInputRef.current.value = '';
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    loadedImageRef.current = null;
    setPreviewSrc(null);
    setPreviewAlt('');
    setActivePalette([]);
    setStatus('', 'success');
    setActiveTab('palette');
  }, [setStatus]);

  // -----------------------------------------------------------------------
  // Download palette as PNG — respects current theme
  // -----------------------------------------------------------------------
  const downloadPalette = useCallback(() => {
    if (!activePalette.length) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ✅ Detect theme from document (works with Tailwind dark: class)
    const isDark = document.documentElement.classList.contains('dark');

    // Theme-aware colours
    const bgColor = isDark ? '#18181B' : '#F6F0E5';
    const textColor = isDark ? '#F4F4F5' : '#20221E';
    const nameColor = isDark ? '#A3B18A' : '#8D9470';
    const subTextColor = isDark ? '#A1A1AA' : '#706B61';

    const swatchMinWidth = 180;
    const width = Math.max(1600, activePalette.length * swatchMinWidth + 120);
    const height = 545;
    const margin = 60;
    const swatchWidth = (width - margin * 2) / activePalette.length;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = textColor;
    ctx.font = '700 42px DM Sans, sans-serif';
    ctx.fillText('IMAGE COLOUR PALETTE', margin, 72);

    ctx.fillStyle = subTextColor;
    ctx.font = '400 22px DM Sans, sans-serif';
    ctx.fillText('Generated with Image To Colour Palette', margin, 108);

    const hexFontSize = activePalette.length > 8 ? 20 : 25;
    const nameFontSize = activePalette.length > 8 ? 15 : 18;
    const rgbFontSize = activePalette.length > 8 ? 13 : 16;

    activePalette.forEach((colour, index) => {
      const x = margin + index * swatchWidth;

      ctx.fillStyle = colour.hex;
      ctx.fillRect(x, 155, swatchWidth - 12, 215);

      ctx.fillStyle = textColor;
      ctx.font = `700 ${hexFontSize}px DM Sans, sans-serif`;
      ctx.fillText(colour.hex, x, 415);

      ctx.fillStyle = nameColor;
      ctx.font = `600 ${nameFontSize}px DM Sans, sans-serif`;
      ctx.fillText(colour.name, x, 445);

      ctx.fillStyle = subTextColor;
      ctx.font = `400 ${rgbFontSize}px DM Sans, sans-serif`;
      ctx.fillText(`RGB ${colour.r}, ${colour.g}, ${colour.b}`, x, 475);
    });

    const link = document.createElement('a');
    link.download = 'image-colour-palette.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    setStatus('Your palette PNG is downloading.', 'success');
  }, [activePalette, setStatus]);

  // -----------------------------------------------------------------------
  // Download seamless strip as PNG — respects current theme
  // -----------------------------------------------------------------------
  const downloadStrip = useCallback(() => {
    if (!activePalette.length) return;

    const canvas = stripCanvasRef.current || document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isDark = document.documentElement.classList.contains('dark');

    const labelBg = isDark ? '#18181B' : '#F6F0E5';
    const textColor = isDark ? '#F4F4F5' : '#20221E';
    const nameColor = isDark ? '#A3B18A' : '#8D9470';
    const subTextColor = isDark ? '#A1A1AA' : '#706B61';
    const dividerColor = isDark
      ? 'rgba(255,255,255,0.15)'
      : 'rgba(32,34,30,0.15)';
    const borderColor = isDark
      ? 'rgba(255,255,255,0.2)'
      : 'rgba(32,34,30,0.2)';

    const bandHeight = 360;
    const labelHeight = 140;
    const bandWidth = 240;
    const height = bandHeight + labelHeight;
    const width = activePalette.length * bandWidth;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = labelBg;
    ctx.fillRect(0, 0, width, height);

    activePalette.forEach((colour, index) => {
      const x = index * bandWidth;

      ctx.fillStyle = colour.hex;
      ctx.fillRect(x, 0, bandWidth, bandHeight);

      ctx.strokeStyle = dividerColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, bandHeight);
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = '700 26px DM Sans, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(colour.hex, x + 20, bandHeight + 48);

      ctx.fillStyle = nameColor;
      ctx.font = '600 22px DM Sans, sans-serif';
      ctx.fillText(colour.name, x + 20, bandHeight + 88);

      ctx.fillStyle = subTextColor;
      ctx.font = '400 16px DM Sans, sans-serif';
      ctx.fillText(
        `RGB ${colour.r}, ${colour.g}, ${colour.b}`,
        x + 20,
        bandHeight + 118
      );
    });

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, bandHeight);
    ctx.lineTo(width, bandHeight);
    ctx.stroke();

    const link = document.createElement('a');
    link.download = 'seamless-colour-strip.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    setStatus('Your seamless strip is downloading.', 'success');
  }, [activePalette, setStatus]);

  // -----------------------------------------------------------------------
  // Drag & drop handlers
  // -----------------------------------------------------------------------
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      loadImage(e.dataTransfer.files[0]);
    },
    [loadImage]
  );

  const gridClass =
    activePalette.length <= 5
      ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
      : activePalette.length <= 8
        ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-4'
        : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-4';

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#20221e] dark:bg-[#0a0a0a]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-soft-light"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,.55) .6px, transparent .6px)',
          backgroundSize: '7px 7px',
        }}
        aria-hidden="true"
      />

      {/* Header */}
      <header className="relative z-10 w-full px-5 pt-7 sm:px-8 lg:px-12 lg:pt-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between border-b border-white/15 pb-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e85c4a] text-[#20221e]"
              aria-hidden="true"
            >
              <Pipette className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold leading-none text-[#f6f0e5]">
                Image To Colour Palette
              </h1>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-sm text-[#d9d0c1] sm:flex">
            <Sparkles className="h-4 w-4 text-[#e85c4a]" aria-hidden="true" />
            <span>Extract colours from any image</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 w-full px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto grid max-w-8xl gap-6 lg:grid-cols-[.87fr_1.13fr]">
          {/* Upload Panel */}
          <section className="rounded-[2rem] bg-[#f6f0e5] p-5 shadow-2xl shadow-black/20 dark:bg-[#18181b] dark:shadow-black/50 sm:p-7">
            <div className="mb-6">
              <p className="mb-2 text-xs font-bold uppercase tracking-[.17em] text-[#e85c4a]">
                Step 01
              </p>
              <h2 className="font-serif text-3xl font-bold leading-tight text-[#20221e] dark:text-[#f4f4f5]">
                Upload your image
              </h2>
              <p className="mt-3 max-w-md leading-relaxed text-[#59574f] dark:text-[#a1a1aa]">
                Drop an image below or browse your files. We&apos;ll extract the
                most prominent tones from it.
              </p>
            </div>

            <div
              id="upload-zone"
              className={`rounded-[1.5rem] bg-[#eee5d7] p-6 text-center transition-all duration-200 dark:bg-[#27272a] sm:p-9 ${
                isDragging
                  ? 'scale-[1.01] border-[1.5px] border-solid border-[#e85c4a] bg-[#fff8ed] dark:bg-[#3f3f46]'
                  : 'border-[1.5px] border-dashed border-[#a69b88] dark:border-[#52525b]'
              }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#20221e] text-[#f6f0e5] dark:bg-[#f4f4f5] dark:text-[#18181b]"
                aria-hidden="true"
              >
                <ImageUp className="h-6 w-6" />
              </div>
              <p className="mt-5 font-bold text-[#20221e] dark:text-[#f4f4f5]">
                Drag &amp; drop your image here
              </p>
              <p className="mt-1 text-sm text-[#706b61] dark:text-[#a1a1aa]">
                or click the button below to browse
              </p>

              <label
                htmlFor="image-input"
                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#e85c4a] px-5 py-3 font-bold text-[#20221e] shadow-sm transition hover:-translate-y-0.5 hover:brightness-105 focus-within:outline focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-[#20221e] dark:focus-within:outline-[#f4f4f5]"
              >
                <FolderOpen className="h-4 w-4" aria-hidden="true" />
                <span>Choose an image</span>
              </label>
              <input
                id="image-input"
                ref={imageInputRef}
                className="sr-only"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(e) => loadImage(e.target.files?.[0])}
              />
              <p className="mt-5 text-xs text-[#80796e] dark:text-[#71717a]">
                PNG, JPG, WebP or GIF
              </p>
            </div>

            {previewSrc && (
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[.15em] text-[#706b61] dark:text-[#a1a1aa]">
                    Preview
                  </p>
                  <button
                    id="clear-image-button"
                    type="button"
                    onClick={resetTool}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-[#20221e] transition hover:bg-[#e3d7c6] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#20221e] dark:text-[#f4f4f5] dark:hover:bg-[#3f3f46] dark:focus:outline-[#f4f4f5]"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Clear</span>
                  </button>
                </div>
                <div className="overflow-hidden rounded-[1.25rem] border border-[#d4c9b8] bg-[#e9e0d1] dark:border-[#3f3f46] dark:bg-[#27272a] [background-image:linear-gradient(45deg,#d6c9b6_25%,transparent_25%),linear-gradient(-45deg,#d6c9b6_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#d6c9b6_75%),linear-gradient(-45deg,transparent_75%,#d6c9b6_75%)] dark:[background-image:linear-gradient(45deg,#3f3f46_25%,transparent_25%),linear-gradient(-45deg,#3f3f46_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#3f3f46_75%),linear-gradient(-45deg,transparent_75%,#3f3f46_75%)] [background-size:20px_20px] [background-position:0_0,0_10px,10px_-10px,-10px_0]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    id="image-preview"
                    className="block h-52 w-full object-contain"
                    src={previewSrc}
                    alt={previewAlt}
                  />
                </div>
              </div>
            )}
          </section>

          {/* Palette Panel */}
          <section className="rounded-[2rem] bg-[#f6f0e5] p-5 shadow-2xl shadow-black/20 dark:bg-[#18181b] dark:shadow-black/50 sm:p-7">
            <div className="flex flex-col gap-4 border-b border-[#d4c9b8] pb-6 dark:border-[#3f3f46] sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[.17em] text-[#e85c4a]">
                  Step 02
                </p>
                <h2 className="font-serif text-3xl font-bold leading-tight text-[#20221e] dark:text-[#f4f4f5]">
                  Your colour palette
                </h2>
              </div>
              <span
                id="colour-count"
                className="rounded-full bg-[#e5dac9] px-3 py-1.5 text-xs font-bold text-[#706b61] dark:bg-[#27272a] dark:text-[#a1a1aa]"
                aria-live="polite"
              >
                {activePalette.length} colours
              </span>
            </div>

            {/* Colour count selector */}
            <div className="mb-1 mt-5 rounded-2xl bg-[#eee5d7] p-4 dark:bg-[#27272a]">
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="colour-count-range"
                  className="text-xs font-bold uppercase tracking-[.15em] text-[#706b61] dark:text-[#a1a1aa]"
                >
                  Number of colours
                </label>
                <span className="rounded-full bg-[#20221e] px-2.5 py-1 text-xs font-bold text-[#f6f0e5] dark:bg-[#f4f4f5] dark:text-[#18181b]">
                  {colourCount}
                </span>
              </div>
              <input
                id="colour-count-range"
                type="range"
                min={3}
                max={12}
                step={1}
                value={colourCount}
                onChange={(e) => setColourCount(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#d4c9b8] accent-[#e85c4a] dark:bg-[#3f3f46]"
              />
              <div className="mt-1 flex justify-between text-[10px] font-semibold text-[#80796e] dark:text-[#71717a]">
                <span>3</span>
                <span>6</span>
                <span>9</span>
                <span>12</span>
              </div>
            </div>

            {/* Tabs */}
            {activePalette.length > 0 && (
              <div className="mt-5 flex gap-2 rounded-full bg-[#eee5d7] p-1.5 dark:bg-[#27272a]">
                <button
                  type="button"
                  onClick={() => setActiveTab('palette')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                    activeTab === 'palette'
                      ? 'bg-[#20221e] text-[#f6f0e5] shadow-sm dark:bg-[#f4f4f5] dark:text-[#18181b]'
                      : 'text-[#706b61] hover:bg-[#e3d7c6] dark:text-[#a1a1aa] dark:hover:bg-[#3f3f46]'
                  }`}
                >
                  <Palette className="h-4 w-4" aria-hidden="true" />
                  <span>Palette</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('strip')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                    activeTab === 'strip'
                      ? 'bg-[#20221e] text-[#f6f0e5] shadow-sm dark:bg-[#f4f4f5] dark:text-[#18181b]'
                      : 'text-[#706b61] hover:bg-[#e3d7c6] dark:text-[#a1a1aa] dark:hover:bg-[#3f3f46]'
                  }`}
                >
                  <Layers className="h-4 w-4" aria-hidden="true" />
                  <span>Seamless Strip</span>
                </button>
              </div>
            )}

            {/* Empty state */}
            {activePalette.length === 0 && (
              <div
                id="empty-palette"
                className="flex min-h-[315px] flex-col items-center justify-center px-4 text-center"
              >
                <div
                  className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#e5dac9] text-[#8d9470] dark:bg-[#27272a] dark:text-[#a3b18a]"
                  aria-hidden="true"
                >
                  <Palette className="h-7 w-7" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#20221e] dark:text-[#f4f4f5]">
                  No palette yet
                </h3>
                <p className="mt-2 max-w-sm leading-relaxed text-[#706b61] dark:text-[#a1a1aa]">
                  Upload an image to see its dominant colours appear here as
                  swatches you can copy.
                </p>
              </div>
            )}

            {/* Palette view */}
            {activePalette.length > 0 && activeTab === 'palette' && (
              <div
                id="palette-grid"
                className={`grid gap-3 pt-6 ${gridClass}`}
                aria-live="polite"
              >
                {activePalette.map((colour, index) => (
                  <SwatchCard
                    key={`${colour.hex}-${index}`}
                    colour={colour}
                    index={index}
                    onCopy={copyText}
                  />
                ))}
              </div>
            )}

            {/* Seamless Strip view */}
            {activePalette.length > 0 && activeTab === 'strip' && (
              <div id="seamless-strip" className="pt-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-[.15em] text-[#706b61] dark:text-[#a1a1aa]">
                  Seamless Colour Strip
                </p>

                <div className="overflow-hidden rounded-2xl border border-[#d4c9b8] shadow-sm dark:border-[#3f3f46]">
                  <div className="flex h-32 w-full sm:h-40">
                    {activePalette.map((colour, index) => (
                      <button
                        key={`${colour.hex}-${index}`}
                        type="button"
                        onClick={() =>
                          copyText(
                            colour.hex,
                            `${colour.name} (${colour.hex}) copied.`
                          )
                        }
                        className="group relative flex-1 cursor-copy transition-transform hover:z-10 hover:scale-y-105 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#20221e] dark:focus:outline-[#f4f4f5]"
                        style={{ background: colour.hex }}
                        aria-label={`Copy ${colour.name} ${colour.hex}`}
                        title={`${colour.name} — ${colour.hex} (click to copy)`}
                      >
                        <span className="sr-only">
                          {colour.name} {colour.hex}
                        </span>
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                          <span className="rounded-full bg-black/70 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                            {colour.hex}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#706b61] dark:text-[#a1a1aa]">
                  <span>
                    {activePalette.length} seamless bands — click any band to
                    copy
                  </span>
                  <span className="font-mono">
                    {activePalette.map((c) => c.hex).join(' · ')}
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() =>
                      copyText(
                        activePalette.map((c) => c.hex).join(', '),
                        'All strip colours copied.'
                      )
                    }
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#20221e] px-5 py-3 font-bold text-[#f6f0e5] transition hover:brightness-125 focus:outline focus:outline-2 focus:outline-offset-3 focus:outline-[#e85c4a] dark:bg-[#f4f4f5] dark:text-[#18181b]"
                  >
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    <span>Copy strip colours</span>
                  </button>
                  <button
                    type="button"
                    onClick={downloadStrip}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#8d9470] px-5 py-3 font-bold text-[#20221e] transition hover:brightness-110 focus:outline focus:outline-2 focus:outline-offset-3 focus:outline-[#20221e] dark:bg-[#a3b18a] dark:text-[#18181b] dark:focus:outline-[#f4f4f5]"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    <span>Download strip PNG</span>
                  </button>
                </div>
              </div>
            )}

            {/* Palette actions */}
            {activePalette.length > 0 && activeTab === 'palette' && (
              <div className="mt-6 flex flex-col gap-3 border-t border-[#d4c9b8] pt-5 dark:border-[#3f3f46] sm:flex-row">
                <button
                  id="copy-all-button"
                  type="button"
                  onClick={() =>
                    copyText(
                      activePalette
                        .map((c) => `${c.name} — ${c.hex}`)
                        .join('\n'),
                      'All colours copied to clipboard.'
                    )
                  }
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#20221e] px-5 py-3 font-bold text-[#f6f0e5] transition hover:brightness-125 focus:outline focus:outline-2 focus:outline-offset-3 focus:outline-[#e85c4a] dark:bg-[#f4f4f5] dark:text-[#18181b]"
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  <span>Copy all HEX</span>
                </button>
                <button
                  id="download-button"
                  type="button"
                  onClick={downloadPalette}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#8d9470] px-5 py-3 font-bold text-[#20221e] transition hover:brightness-110 focus:outline focus:outline-2 focus:outline-offset-3 focus:outline-[#20221e] dark:bg-[#a3b18a] dark:text-[#18181b] dark:focus:outline-[#f4f4f5]"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span>Download PNG</span>
                </button>
              </div>
            )}

            <p
              id="status-message"
              className="mt-4 min-h-[1.5rem] text-center text-sm font-medium transition-opacity"
              style={{
                color: statusTone === 'error' ? '#b43d31' : undefined,
              }}
              role="status"
              aria-live="polite"
            >
              {statusMessage}
            </p>
          </section>
        </div>
      </main>

      <canvas ref={samplingCanvasRef} className="hidden" aria-hidden="true" />
      <canvas ref={stripCanvasRef} className="hidden" aria-hidden="true" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Swatch Card sub-component
// ---------------------------------------------------------------------------
function SwatchCard({
  colour,
  index,
  onCopy,
}: {
  colour: PaletteColour;
  index: number;
  onCopy: (text: string, successText: string) => void;
}) {
  const copyColour = () => {
    onCopy(colour.hex, `${colour.name} (${colour.hex}) copied to clipboard.`);
  };

  return (
    <article
      className="overflow-hidden rounded-2xl border border-[#d4c9b8] bg-[#fffaf1] shadow-sm dark:border-[#3f3f46] dark:bg-[#27272a]"
      style={{
        animation: 'rise .38s ease both',
        animationDelay: `${index * 55}ms`,
      }}
    >
      <button
        type="button"
        className="relative h-[92px] w-full cursor-copy text-left sm:h-[114px]"
        style={{ background: colour.hex }}
        aria-label={`Copy ${colour.name} ${colour.hex}`}
        onClick={copyColour}
      >
        <span className="sr-only">Copy colour</span>
        <span className="pointer-events-none absolute inset-0 border border-[rgba(32,34,30,.1)] dark:border-[rgba(255,255,255,.1)]" />
      </button>
      <div className="p-3">
        <p className="font-bold tracking-wide text-[#20221e] dark:text-[#f4f4f5]">
          {colour.hex}
        </p>
        <p className="mt-0.5 text-xs font-semibold text-[#8d9470] dark:text-[#a3b18a]">
          {colour.name}
        </p>
        <p className="mt-1 text-xs text-[#706b61] dark:text-[#a1a1aa]">
          RGB {colour.r}, {colour.g}, {colour.b}
        </p>
        <button
          type="button"
          onClick={copyColour}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#eee5d7] px-2 py-2 text-xs font-bold text-[#20221e] transition hover:-translate-y-0.5 hover:bg-[#e3d7c6] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[#20221e] dark:bg-[#3f3f46] dark:text-[#f4f4f5] dark:hover:bg-[#52525b] dark:focus:outline-[#f4f4f5]"
        >
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Copy</span>
        </button>
      </div>
    </article>
  );
}