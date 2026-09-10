"use client";

import { useState, useRef, useCallback } from "react";
import { ImageUp, Check } from "lucide-react";
import { getColorName } from "@/lib/color-utils";

interface ImagePaletteExtractorProps {
  onCopy?: (text: string) => Promise<void> | void;
  onShowToast?: (message: string) => void;
}

interface ExtractedColor {
  hex: string; // without "#", uppercase, e.g. "FF5A36"
  name: string; // e.g. "Tomato"
}

export default function ImagePaletteExtractor({
  onCopy,
  onShowToast,
}: ImagePaletteExtractorProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imagePalette, setImagePalette] = useState<ExtractedColor[]>([]);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // ---- Helpers ----
  const rgbToHex = (r: number, g: number, b: number) => {
    return (
      "#" +
      [r, g, b]
        .map((value) =>
          Math.max(0, Math.min(255, Math.round(value)))
            .toString(16)
            .padStart(2, "0")
        )
        .join("")
        .toUpperCase()
    );
  };

  const hexToRgb = (hex: string) => {
    const clean = hex.replace("#", "");
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
  };

  const getLuminance = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    return [r, g, b]
      .map((channel) => {
        const value = channel / 255;
        return value <= 0.03928
          ? value / 12.92
          : Math.pow((value + 0.055) / 1.055, 2.4);
      })
      .reduce(
        (total, value, index) =>
          total + value * [0.2126, 0.7152, 0.0722][index],
        0
      );
  };

  // ---- Copy Handler ----
  const handleCopy = useCallback(
    async (text: string) => {
      try {
        if (onCopy) {
          await onCopy(text);
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
        }
        setCopiedHex(text);
        setTimeout(() => setCopiedHex(null), 1500);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    },
    [onCopy]
  );

  // ---- Extract Colors + Names ----
  const extractImageColors = useCallback((image: HTMLImageElement) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const size = 100;
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(image, 0, 0, size, size);
    const pixels = ctx.getImageData(0, 0, size, size).data;

    const buckets: Record<string, number> = {};
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const alpha = pixels[i + 3];
      if (alpha < 30) continue;

      const quantR = Math.round(r / 16) * 16;
      const quantG = Math.round(g / 16) * 16;
      const quantB = Math.round(b / 16) * 16;
      const key = rgbToHex(quantR, quantG, quantB);
      buckets[key] = (buckets[key] || 0) + 1;
    }

    const topHexes = Object.entries(buckets)
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0])
      .filter((color, index, list) => index === 0 || color !== list[index - 1])
      .slice(0, 5);

    while (topHexes.length < 5) {
      topHexes.push("#CCCCCC");
    }

    const paletteWithNames: ExtractedColor[] = topHexes.map((hex) => {
      const clean = hex.replace("#", "");
      return {
        hex: clean,
        name: getColorName(clean),
      };
    });

    setImagePalette(paletteWithNames);
  }, []);

  // ---- Image Upload Handler ----
  const handleImageUpload = useCallback(
    (file: File) => {
      if (!file) return;
      const url = URL.createObjectURL(file);
      setUploadedImage(url);

      const img = new Image();
      img.onload = () => {
        extractImageColors(img);
        if (imageRef.current) {
          imageRef.current.src = url;
          imageRef.current.classList.remove("hidden");
        }
        URL.revokeObjectURL(url);
        onShowToast?.("Colors extracted successfully!");
      };
      img.onerror = () => {
        onShowToast?.("Error loading image");
      };
      img.src = url;
    },
    [extractImageColors, onShowToast]
  );

  // ---- Clear Image ----
  const handleClearImage = () => {
    setUploadedImage(null);
    setImagePalette([]);
    if (imageRef.current) {
      imageRef.current.classList.add("hidden");
      imageRef.current.src = "";
    }
  };

  return (
    <section id="image-palette" className="mx-auto mt-16 max-w-7xl">
      <div className="glass rounded-[2rem] p-6 sm:p-8 bg-white/76 dark:bg-[#191a1e]/76 border border-[#101114]/9 dark:border-white/11 shadow-[0_24px_64px_rgba(19,20,24,0.09)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-[18px]">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Left - Controls */}
<div className="flex flex-col">
  <div>
    <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#686b74] dark:text-[#a8abb4]">
      Extractor
    </p>
    <h2 className="mt-2 font-['Fraunces',serif] text-2xl font-bold tracking-[-0.045em]">
      Image palette
    </h2>
    <p className="mt-4 leading-relaxed text-[#686b74] dark:text-[#a8abb4]">
      Upload an image to extract its dominant colors.
    </p>
  </div>

  <div className="mt-7 flex flex-col items-start gap-3">
    <button
      className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-[#ff5a36] px-5 py-3 font-bold text-white transition-transform hover:-translate-y-0.5 dark:bg-[#ff7e5c]"
      type="button"
      onClick={() => fileInputRef.current?.click()}
    >
      <ImageUp className="h-4 w-4" />
      Upload image
    </button>

    <input
      ref={fileInputRef}
      id="image-upload"
      type="file"
      accept="image/*"
      className="sr-only"
      aria-label="Upload an image to extract colors"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleImageUpload(file);
      }}
    />

    {uploadedImage && (
      <button
        className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl bg-gray-200 px-4 py-2 text-sm font-bold text-[#101114] transition-colors hover:bg-gray-300 dark:bg-[#2a2b30] dark:text-[#f7f7f4] dark:hover:bg-[#3a3b40]"
        type="button"
        onClick={handleClearImage}
      >
        Clear image
      </button>
    )}
  </div>
</div>

          {/* Right - Preview + Palette */}
          <div>
            <div className="grid min-h-[220px] place-items-center overflow-hidden rounded-3xl border border-dashed border-[#101114]/9 dark:border-white/11 bg-black/[0.03] p-4 dark:bg-white/[0.03]">
              {uploadedImage ? (
                <img
                  ref={imageRef}
                  className="max-h-[290px] w-full rounded-2xl object-contain"
                  src={uploadedImage}
                  alt="Uploaded image"
                />
              ) : (
                <p className="text-center text-sm text-[#686b74] dark:text-[#a8abb4]">
                  Upload an image to extract colors
                </p>
              )}
            </div>

            {/* Swatches with Color Name */}
            <div className="mt-5 grid grid-cols-5 overflow-hidden rounded-2xl border border-[#101114]/9 dark:border-white/11">
              {imagePalette.length > 0
                ? imagePalette.map((color, i) => {
                    const fullHex = `#${color.hex}`;
                    const isLight = getLuminance(fullHex) > 0.5;
                    const textColor = isLight ? "#101114" : "#FFFFFF";
                    const isCopied = copiedHex === fullHex;

                    return (
                      <button
                        key={`${color.hex}-${i}`}
                        type="button"
                        className="swatch-button min-h-28 p-3 text-left flex-1 transition-transform hover:scale-[1.02] focus:outline-none"
                        style={{ background: fullHex, color: textColor }}
                        onClick={() => handleCopy(fullHex)}
                        aria-label={`${color.name}, hex ${fullHex}, click to copy`}
                        title={`${color.name} — ${fullHex}`}
                      >
                        <span className="block text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="mt-1 block truncate text-[11px] font-semibold">
                          {color.name}
                        </span>
                        <span className="mt-4 block font-mono text-xs">
                          {isCopied ? (
                            <span className="inline-flex items-center gap-1">
                              <Check className="h-3 w-3" /> Copied
                            </span>
                          ) : (
                            fullHex
                          )}
                        </span>
                      </button>
                    );
                  })
                : Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex min-h-28 items-center justify-center bg-[#e5e5e5] text-xs text-[#686b74] dark:bg-[#2a2b30] dark:text-[#a8abb4]"
                      role="img"
                      aria-label="Empty color swatch placeholder"
                    >
                      Empty
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}