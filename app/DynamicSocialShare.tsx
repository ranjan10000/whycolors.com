"use client";

import { useState, useEffect, useCallback } from "react";
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

export default function SocialShare({
  hex,
  colorName,
  url: explicitUrl,
  imageUrl,
}: SocialShareProps) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

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

  const shareTitle = `${colorName} ${hex.toUpperCase()}`;
  const shareText = `Check out ${colorName} color (${hex.toUpperCase()})`;
  const shareDescription = `Explore ${colorName} color details, palettes, shades & harmonies`;

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

  // Placeholder — centered
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
    // ✅ FIX: Added justify-center for centre alignment
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