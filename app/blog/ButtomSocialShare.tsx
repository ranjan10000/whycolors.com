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
  title: string;
  imageUrl?: string;
  description?: string;
}

export default function SocialShare({
  title,
  imageUrl,
  description,
}: SocialShareProps) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    // This only runs on the client after hydration
    setUrl(window.location.href);

    // Check if native Web Share API is supported
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      setCanNativeShare(true);
    }
  }, []);

  const handleNativeShare = useCallback(async () => {
    if (!canNativeShare) return;
    try {
      await navigator.share({
        title,
        text: description || `Check out this article: ${title}`,
        url,
      });
    } catch (err) {
      // User cancelled or error — silently ignore (user cancellation is common)
      if ((err as Error)?.name !== "AbortError") {
        console.error("Native share failed:", err);
      }
    }
  }, [canNativeShare, title, description, url]);

  // Fallback: copy link to clipboard
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Legacy fallback
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

  // Don't render links until we have the URL on client
  if (!url) {
    return <div className="flex justify-center gap-3 h-12" />;
  }

  const text = encodeURIComponent(`Check out this article: ${title}`);
  const encodedUrl = encodeURIComponent(url);

  const encodedMedia = imageUrl ? encodeURIComponent(imageUrl) : "";
  const encodedDescription = encodeURIComponent(
    description || `Check out this article: ${title}`
  );

  const pinterestHref = imageUrl
    ? `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedMedia}&description=${encodedDescription}`
    : `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedDescription}`;

  return (
    <div className="flex justify-center gap-3 flex-wrap">
      {/* ✨ Native / Normal Share — mobile-ல இது OS share sheet open ஆகும் */}
      {canNativeShare ? (
        <button
          onClick={handleNativeShare}
          className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full transition-all duration-200 hover:scale-110 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 border border-gray-200 dark:border-gray-700"
          aria-label="Share"
          title="Share"
        >
          <Share2 className="w-5 h-5" />
        </button>
      ) : (
        // Fallback for desktop browsers without Web Share API
        <button
          onClick={handleCopyLink}
          className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full transition-all duration-200 hover:scale-110 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 border border-gray-200 dark:border-gray-700"
          aria-label={copied ? "Link copied" : "Copy link"}
          title={copied ? "Copied!" : "Copy link"}
        >
          {copied ? (
            <Check className="w-5 h-5 text-emerald-500" />
          ) : (
            <Share2 className="w-5 h-5" />
          )}
        </button>
      )}

      {/* Twitter */}
      <a
        href={`https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full transition-all duration-200 hover:scale-110 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-500 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-700"
        aria-label="Share on Twitter"
      >
        <FaTwitter className="text-xl" />
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full transition-all duration-200 hover:scale-110 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-700"
        aria-label="Share on Facebook"
      >
        <FaFacebook className="text-xl" />
      </a>

      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full transition-all duration-200 hover:scale-110 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-700"
        aria-label="Share on LinkedIn"
      >
        <FaLinkedin className="text-xl" />
      </a>

      {/* Pinterest */}
      <a
        href={pinterestHref}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full transition-all duration-200 hover:scale-110 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 border border-gray-200 dark:border-gray-700"
        aria-label="Share on Pinterest"
      >
        <FaPinterest className="text-xl" />
      </a>

      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${text}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full transition-all duration-200 hover:scale-110 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-500 dark:hover:text-green-400 border border-gray-200 dark:border-gray-700"
        aria-label="Share on WhatsApp"
      >
        <FaWhatsapp className="text-xl" />
      </a>
    </div>
  );
}