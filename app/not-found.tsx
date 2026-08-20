'use client';

import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { Home, Palette, Search, ArrowLeft, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function NotFound() {
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const popularColors = [
    { name: 'Purple', hex: '#7C3AED' },
    { name: 'Blue', hex: '#3B82F6' },
    { name: 'Red', hex: '#EF4444' },
    { name: 'Green', hex: '#22C55E' },
    { name: 'Orange', hex: '#F97316' },
    { name: 'Pink', hex: '#EC4899' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      const cleanHex = searchValue.replace('#', '').trim();
      if (/^[0-9a-fA-F]{6}$/.test(cleanHex) || /^[0-9a-fA-F]{3}$/.test(cleanHex)) {
        window.location.href = `/color/${cleanHex}`;
      } else {
        window.location.href = `/search?q=${encodeURIComponent(searchValue)}`;
      }
    }
  };

  const primaryColor = '#7c3aed';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 transition-colors duration-300 ${
      isDark ? 'bg-[#090911] text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-2xl w-full space-y-8 text-center">
        
        {/* 404 Number with Colorful Gradient - Using #7c3aed */}
        <div className="relative">
          <div className={`absolute inset-0 blur-3xl opacity-30 rounded-full ${
            isDark ? 'bg-[#7c3aed]' : 'bg-[#7c3aed]'
          }`} style={{ top: '-40%', left: '-20%', width: '140%', height: '140%' }} />
          
          <h1 className="relative text-8xl sm:text-9xl font-extrabold tracking-tighter" style={{ color: '#7c3aed' }}>
            404
          </h1>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-bold flex items-center justify-center gap-3">
            Page Not Found
          </h2>
          <p className={`text-base sm:text-lg ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Oops! The color page you're looking for doesn't exist or was moved.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search for a color (e.g., #7C3AED or purple)..."
            className={`w-full pl-5 pr-12 py-3.5 rounded-2xl border-2 focus:outline-none focus:ring-2 transition-all ${
              isDark 
                ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-[#7c3aed] focus:ring-[#7c3aed]/50' 
                : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[#7c3aed] focus:ring-[#7c3aed]/50'
            }`}
          />
          <button
            type="submit"
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-colors ${
              isDark 
                ? 'text-gray-400 hover:text-white hover:bg-white/10' 
                : 'text-gray-400 hover:text-[#7c3aed] hover:bg-purple-50'
            }`}
          >
            <Search className="w-5 h-5" />
          </button>
        </form>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 text-white shadow-lg"
            style={{ 
              backgroundColor: '#7c3aed',
              boxShadow: '0 10px 30px -10px rgba(124, 58, 237, 0.5)'
            }}
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          
          <Link
            href="/color"
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 border-2 ${
              isDark 
                ? 'border-white/10 hover:border-white/30 text-white' 
                : 'border-gray-200 hover:border-[#7c3aed] text-gray-700 hover:text-[#7c3aed]'
            }`}
          >
            <Palette className="w-4 h-4" />
            Color Studio
          </Link>

          <button
            onClick={() => window.history.back()}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 border-2 ${
              isDark 
                ? 'border-white/10 hover:border-white/30 text-white' 
                : 'border-gray-200 hover:border-[#7c3aed] text-gray-700 hover:text-[#7c3aed]'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Popular Colors Section */}
        <div className="pt-6">
          <div className={`flex items-center justify-center gap-2 text-sm font-medium mb-4 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <Sparkles className="w-4 h-4" style={{ color: '#7c3aed' }} />
            Try these popular colors
            <Sparkles className="w-4 h-4" style={{ color: '#7c3aed' }} />
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {popularColors.map((color) => (
              <Link
                key={color.hex}
                href={`/color/${color.hex.replace('#', '')}`}
                className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all hover:scale-105 ${
                  isDark 
                    ? 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10' 
                    : 'bg-white border-gray-200 hover:border-[#7c3aed] hover:shadow-md'
                }`}
              >
                <span 
                  className="w-4 h-4 rounded-full border shadow-inner flex-shrink-0 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.hex }}
                />
                <span className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {color.name}
                </span>
                <span className={`text-xs font-mono ${
                  isDark ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  {color.hex}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Random Color Suggestion */}
        <div className="pt-4">
          <Link
            href={`/color/${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`}
            className={`text-sm inline-flex items-center gap-2 transition-colors ${
              isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-[#7c3aed]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: '#7c3aed' }} />
            Feeling lucky? Try a random color
          </Link>
        </div>

        {/* Footer */}
        <div className={`pt-8 text-xs ${
          isDark ? 'text-gray-600' : 'text-gray-400'
        }`}>
          <p>© {new Date().getFullYear()} WhyColors.com — Your ultimate color toolkit</p>
        </div>
        
      </div>
    </div>
  );
}