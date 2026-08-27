// components/SocialShare.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Share2, Link2, Check, X } from 'lucide-react';

interface SocialShareProps {
  hex: string;
  colorName: string;
  isDark: boolean;
}

export default function SocialShare({ hex, colorName, isDark }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const fullHex = `#${hex.toUpperCase()}`;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `🎨 Check out this beautiful color ${fullHex} (${colorName})!`;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowShare(false);
      }
    };

    if (showShare) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShare]);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(shareText)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    email: `mailto:?subject=${encodeURIComponent(`${colorName} - ${fullHex}`)}&body=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${colorName} - ${fullHex}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      setShowShare(!showShare);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSocialShare = (platform: keyof typeof shareLinks) => {
    const url = shareLinks[platform];
    window.open(url, '_blank', 'width=600,height=400');
    setShowShare(false);
  };

  // SVG Icons for social platforms
  const SocialIcons = {
    Facebook: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    Twitter: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    LinkedIn: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    Pinterest: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.244 3.768-5.487 0-2.866-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.398.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.748-1.378l-.744 2.803c-.269 1.045-1.004 2.352-1.498 3.149 1.129.348 2.329.535 3.583.535 6.607 0 11.985-5.367 11.985-11.987C24 5.367 18.633 0 12.017 0z"/>
      </svg>
    ),
    WhatsApp: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    Telegram: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
    Email: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z"/>
        <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z"/>
      </svg>
    ),
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Main Share Button */}
      <button
        onClick={handleShare}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 whitespace-nowrap ${
          isDark 
            ? 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-200 hover:text-white' 
            : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700 hover:text-gray-900'
        }`}
        aria-label="Share this color"
      >
        <Share2 className="w-4 h-4" />
        <span className="text-sm font-medium">Share</span>
      </button>

      {/* Share Options Dropdown */}
      {showShare && (
        <div 
          className={`absolute right-0 mt-2 w-72 rounded-2xl border shadow-2xl p-3 z-50 ${
            isDark 
              ? 'bg-[#1a1a2e] border-white/20' 
              : 'bg-white border-gray-200'
          }`}
          style={{
            minWidth: '280px',
            maxHeight: '500px',
            overflowY: 'auto'
          }}
          role="menu"
        >
          <div className="flex flex-col gap-1">
            {/* Header */}
            <div className={`px-2 py-1 mb-1 text-xs font-semibold uppercase tracking-wider ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Share on
            </div>

            {/* Facebook */}
            <button
              onClick={() => handleSocialShare('facebook')}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all w-full ${
                isDark 
                  ? 'hover:bg-white/10 text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              role="menuitem"
            >
              <span className="text-[#1877f2]">
                <SocialIcons.Facebook />
              </span>
              <span className="text-sm font-medium">Facebook</span>
            </button>

            {/* Twitter / X */}
            <button
              onClick={() => handleSocialShare('twitter')}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all w-full ${
                isDark 
                  ? 'hover:bg-white/10 text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              role="menuitem"
            >
              <span className="text-[#000000] dark:text-white">
                <SocialIcons.Twitter />
              </span>
              <span className="text-sm font-medium">Twitter / X</span>
            </button>

            {/* LinkedIn */}
            <button
              onClick={() => handleSocialShare('linkedin')}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all w-full ${
                isDark 
                  ? 'hover:bg-white/10 text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              role="menuitem"
            >
              <span className="text-[#0a66c2]">
                <SocialIcons.LinkedIn />
              </span>
              <span className="text-sm font-medium">LinkedIn</span>
            </button>

            {/* Pinterest */}
            <button
              onClick={() => handleSocialShare('pinterest')}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all w-full ${
                isDark 
                  ? 'hover:bg-white/10 text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              role="menuitem"
            >
              <span className="text-[#E60023]">
                <SocialIcons.Pinterest />
              </span>
              <span className="text-sm font-medium">Pinterest</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={() => handleSocialShare('whatsapp')}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all w-full ${
                isDark 
                  ? 'hover:bg-white/10 text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              role="menuitem"
            >
              <span className="text-[#25D366]">
                <SocialIcons.WhatsApp />
              </span>
              <span className="text-sm font-medium">WhatsApp</span>
            </button>

            {/* Telegram */}
            <button
              onClick={() => handleSocialShare('telegram')}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all w-full ${
                isDark 
                  ? 'hover:bg-white/10 text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              role="menuitem"
            >
              <span className="text-[#26A5E4]">
                <SocialIcons.Telegram />
              </span>
              <span className="text-sm font-medium">Telegram</span>
            </button>

            {/* Email */}
            <button
              onClick={() => handleSocialShare('email')}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all w-full ${
                isDark 
                  ? 'hover:bg-white/10 text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              role="menuitem"
            >
              <span className="text-[#EA4335]">
                <SocialIcons.Email />
              </span>
              <span className="text-sm font-medium">Email</span>
            </button>

            {/* Divider */}
            <div className={`my-2 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`} />

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all w-full ${
                copied 
                  ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                  : isDark 
                    ? 'hover:bg-white/10 text-gray-200' 
                    : 'hover:bg-gray-100 text-gray-700'
              }`}
              role="menuitem"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-medium">Copied to clipboard!</span>
                </>
              ) : (
                <>
                  <Link2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Copy Link</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className={`my-1 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`} />

            {/* Close button */}
            <button
              onClick={() => setShowShare(false)}
              className={`flex items-center justify-center gap-2 p-2 rounded-xl transition-all w-full ${
                isDark 
                  ? 'hover:bg-white/10 text-gray-400 hover:text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              <X className="w-4 h-4" />
              <span className="text-sm">Close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}