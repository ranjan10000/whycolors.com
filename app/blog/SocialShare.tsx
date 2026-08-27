"use client";

import { useState, useEffect } from "react";
import { FaTwitter, FaFacebook, FaLinkedin, FaWhatsapp } from "react-icons/fa";

export default function SocialShare({ title }: { title: string }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    // This only runs on the client after hydration
    setUrl(window.location.href);
  }, []);

  // Don't render links until we have the URL on client
  if (!url) {
    return <div className="flex justify-center gap-4 h-12" />; // Placeholder with same height
  }

  const text = encodeURIComponent(`Check out this article: ${title}`);
  const encodedUrl = encodeURIComponent(url);

  return (
    <div className="flex justify-center gap-3">
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