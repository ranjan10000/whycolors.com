"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaWhatsapp,
  FaPinterest,
} from "react-icons/fa";
import { Share2, Check } from "lucide-react";

interface SocialShareProps {
  hex: string;
  colorName: string;
  url?: string;
  imageUrl?: string;
}

// ✅ Helper: hex → rgb
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "").trim();

  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;

  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

// ✅ Helper: hex → hsl
function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export default function SocialShare({
  hex,
  colorName,
  url: explicitUrl,
  imageUrl,
}: SocialShareProps) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  // ✅ Compute RGB/HSL from hex
  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => hexToHsl(hex), [hex]);

  useEffect(() => {
    const finalUrl = explicitUrl || window.location.href;
    setUrl(finalUrl);

    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      setCanNativeShare(true);
    }
  }, [explicitUrl]);

  // ✅ Dynamic share text
  const shareTitle = `${colorName} ${hex.toUpperCase()}`;

  const shareText = rgb && hsl
    ? `Explore ${colorName} (${hex.toUpperCase()}) — RGB(${rgb.r}, ${rgb.g}, ${rgb.b}), HSL(${hsl.h}°, ${hsl.s}%, ${hsl.l}%). Discover its shades, tints, tones, palettes, complementary colors, and harmonies.`
    : `Explore ${colorName} (${hex.toUpperCase()}) with shades, tints, tones, palettes, complementary colors, and harmonies.`;

  const shareDescription = rgb && hsl
    ? `Explore ${colorName} (${hex.toUpperCase()}) with RGB(${rgb.r}, ${rgb.g}, ${rgb.b}), HSL(${hsl.h}°, ${hsl.s}%, ${hsl.l}%), color shades, tints, tones, palettes, complementary colors, and harmonious combinations.`
    : `Explore ${colorName} (${hex.toUpperCase()}) with shades, tints, tones, palettes, complementary colors, and harmonious combinations.`;

  const handleNativeShare = useCallback(async () => {
    if (!canNativeShare) return;
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url,
      });
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        console.error("Native share failed:", err);
      }
    }
  }, [canNativeShare, shareTitle, shareText, url]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  if (!url) {
    return <div className="flex justify-center items-center gap-2 h-10" />;
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);
  const encodedDesc = encodeURIComponent(shareDescription);

  const pinterestHref = imageUrl
    ? `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodeURIComponent(imageUrl)}&description=${encodedDesc}`
    : `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedDesc}`;

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {/* Native / Copy share */}
      {canNativeShare ? (
        <button
          onClick={handleNativeShare}
          className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full transition-all hover:scale-110 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 border border-gray-200 dark:border-gray-700"
          aria-label="Share"
          title="Share"
        >
          <Share2 className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={handleCopyLink}
          className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full transition-all hover:scale-110 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 border border-gray-200 dark:border-gray-700"
          aria-label={copied ? "Copied!" : "Copy link"}
          title={copied ? "Copied!" : "Copy link"}
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-500" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
        </button>
      )}

      {/* Twitter / X */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full transition-all hover:scale-110 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-500 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-700"
        aria-label="Share on Twitter"
      >
        <FaTwitter className="w-4 h-4" />
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full transition-all hover:scale-110 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-700"
        aria-label="Share on Facebook"
      >
        <FaFacebook className="w-4 h-4" />
      </a>

      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full transition-all hover:scale-110 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-700"
        aria-label="Share on LinkedIn"
      >
        <FaLinkedin className="w-4 h-4" />
      </a>

      {/* Pinterest */}
      <a
        href={pinterestHref}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full transition-all hover:scale-110 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 border border-gray-200 dark:border-gray-700"
        aria-label="Share on Pinterest"
      >
        <FaPinterest className="w-4 h-4" />
      </a>

      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full transition-all hover:scale-110 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-500 dark:hover:text-green-400 border border-gray-200 dark:border-gray-700"
        aria-label="Share on WhatsApp"
      >
        <FaWhatsapp className="w-4 h-4" />
      </a>
    </div>
  );
}