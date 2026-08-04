// app/color/ColorClient.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Copy, 
  Check, 
  Palette, 
  RefreshCw, 
  Sparkles, 
  ArrowRight,
  Layers,
  Disc
} from 'lucide-react';
import { getColorName, sanitizeHex } from '@/lib/color-utils';

interface ColorClientProps {
  initialColors: string[];
  totalColors: number;
}

export default function ColorClient({ initialColors, totalColors }: ColorClientProps) {
  const [hexInput, setHexInput] = useState('');
  const [searchError, setSearchError] = useState('');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleHexSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = sanitizeHex(hexInput);
    if (sanitized) {
      window.location.href = `/color/${sanitized}`;
    } else {
      setSearchError('Please enter a valid hex color (e.g., ff0000 or f00)');
      setTimeout(() => setSearchError(''), 3000);
    }
  };

  const copyToClipboard = (e: React.MouseEvent, hex: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`#${hex.toUpperCase()}`);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 p-4 sm:p-6 lg:p-10 select-none">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Color Explorer
              </h1>
              <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/30 rounded-full text-xs text-violet-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                {totalColors.toLocaleString()} colors
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Explore, discover, and analyze any color in real-time
            </p>
          </div>
        </div>

        {/* Hex Input Search Box */}
        <div className="relative p-2 bg-[#12131a] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleHexSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative flex items-center">
              <span className="absolute left-4 text-gray-400 font-mono font-bold text-base">#</span>
              <input
                type="text"
                placeholder="Enter hex color (e.g. ff0000 or f00)"
                value={hexInput}
                onChange={(e) => {
                  setHexInput(e.target.value);
                  setSearchError('');
                }}
                className="w-full bg-[#090a0f] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white font-mono placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition text-sm sm:text-base"
              />
              {searchError && (
                <p className="absolute -bottom-6 left-2 text-xs font-medium text-red-400">
                  {searchError}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-violet-600 hover:bg-violet-500 active:scale-95 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Explore</span>
            </button>
          </form>
          <div className="px-3 pt-2 text-[11px] text-gray-500 flex items-center gap-2">
            <span>Try:</span>
            <span className="font-mono text-gray-400">FF0000</span> • 
            <span className="font-mono text-gray-400">00FF00</span> • 
            <span className="font-mono text-gray-400">0000FF</span>
          </div>
        </div>

        {/* Popular Colors Grid */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-wide">Popular Colors</h2>
            <Link 
              href="/color/palettes" 
              className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition flex items-center gap-1.5 bg-violet-500/10 hover:bg-violet-500/20 px-3 py-1.5 rounded-lg border border-violet-500/20"
            >
              <span>View Palettes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
            {initialColors.map((hex) => {
              const fullHex = `#${hex.toUpperCase()}`;
              const colorName = getColorName(hex);
              const isCopied = copiedHex === hex;

              return (
                <Link
                  key={hex}
                  href={`/color/${hex}`}
                  className="group relative bg-[#12131a] border border-white/10 rounded-2xl overflow-hidden hover:border-violet-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10 flex flex-col"
                >
                  {/* Top Color Banner */}
                  <div 
                    className="w-full h-36 sm:h-40 transition-transform duration-500 group-hover:scale-[1.02]"
                    style={{ backgroundColor: fullHex }}
                  />

                  {/* Bottom Image-Style Bar */}
                  <div className="bg-[#12131a]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-t border-white/5">
                    <div className="truncate pr-2">
                      <p className="text-sm font-bold text-white truncate capitalize group-hover:text-violet-400 transition">
                        {colorName || 'Color Swatch'}
                      </p>
                      <p className="text-xs font-mono text-gray-400 tracking-wider mt-0.5">
                        {fullHex}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => copyToClipboard(e, hex)}
                        title="Copy Hex Code"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition cursor-pointer"
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      
                      <div className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition">
                        <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Tools Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link 
            href="/color/wheel" 
            className="group bg-[#12131a] border border-white/10 rounded-2xl p-5 text-center hover:border-violet-500/50 transition duration-300 hover:bg-white/[0.02]"
          >
            <Disc className="w-7 h-7 mx-auto mb-2 text-violet-400 group-hover:scale-110 transition duration-300" />
            <span className="text-sm font-semibold text-white group-hover:text-violet-400 transition">
              Color Wheel
            </span>
          </Link>

          <Link 
            href="/color/convert" 
            className="group bg-[#12131a] border border-white/10 rounded-2xl p-5 text-center hover:border-violet-500/50 transition duration-300 hover:bg-white/[0.02]"
          >
            <RefreshCw className="w-7 h-7 mx-auto mb-2 text-violet-400 group-hover:scale-110 transition duration-300" />
            <span className="text-sm font-semibold text-white group-hover:text-violet-400 transition">
              Converter
            </span>
          </Link>

          <Link 
            href="/color/palettes" 
            className="group bg-[#12131a] border border-white/10 rounded-2xl p-5 text-center hover:border-violet-500/50 transition duration-300 hover:bg-white/[0.02]"
          >
            <Palette className="w-7 h-7 mx-auto mb-2 text-violet-400 group-hover:scale-110 transition duration-300" />
            <span className="text-sm font-semibold text-white group-hover:text-violet-400 transition">
              Palettes
            </span>
          </Link>

          <Link 
            href="/color/gradient" 
            className="group bg-[#12131a] border border-white/10 rounded-2xl p-5 text-center hover:border-violet-500/50 transition duration-300 hover:bg-white/[0.02]"
          >
            <Layers className="w-7 h-7 mx-auto mb-2 text-violet-400 group-hover:scale-110 transition duration-300" />
            <span className="text-sm font-semibold text-white group-hover:text-violet-400 transition">
              Gradient
            </span>
          </Link>
        </div>

        {/* Footer Stats */}
        <div className="p-4 bg-[#12131a]/50 border border-white/5 rounded-2xl text-center">
          <p className="text-xs text-gray-400 font-medium tracking-wide">
            ✦ {totalColors.toLocaleString()} colors available • Static generation • Fast & SEO friendly
          </p>
        </div>

      </div>
    </div>
  );
}