// app/about/page.tsx
'use client';

import { useTheme } from '@/contexts/ThemeContext';
import Link from 'next/link';
import { 
  Palette, 
  Copy, 
  Search, 
  Heart, 
  SwatchBook,
  Paintbrush,
  Eye,
  Palette as ColorWheel,
  Repeat,
  Grid,
  Contrast,
  Layers,
  Crosshair,
  Sliders,
  Shuffle,
  Droplet,
  Code,
  FileText,
  GitCompare,
  BookOpen
} from 'lucide-react';

export default function AboutPage() {
  const { isDark } = useTheme();

  const tools = [
    { name: 'Color Palettes', icon: <Palette className="w-4 h-4" />, desc: 'Generate beautiful color harmonies' },
    { name: 'Color Wheel', icon: <ColorWheel className="w-4 h-4" />, desc: 'Visual color relationships' },
    { name: 'Color Converter', icon: <Repeat className="w-4 h-4" />, desc: 'Convert between color formats' },
    { name: 'Gradient Generator', icon: <Paintbrush className="w-4 h-4" />, desc: 'Create stunning gradients' },
    { name: 'Contrast Checker', icon: <Contrast className="w-4 h-4" />, desc: 'Check accessibility contrast' },
    { name: 'Color Shades', icon: <Layers className="w-4 h-4" />, desc: 'Explore color shades and tints' },
    { name: 'Color Finder', icon: <Crosshair className="w-4 h-4" />, desc: 'Find colors from images' },
    { name: 'Color Mixer', icon: <Sliders className="w-4 h-4" />, desc: 'Mix colors interactively' },
    { name: 'Random Color', icon: <Shuffle className="w-4 h-4" />, desc: 'Generate random colors' },
    { name: 'Color Picker', icon: <Droplet className="w-4 h-4" />, desc: 'Pick and preview colors' },
    { name: 'Color Codes', icon: <Code className="w-4 h-4" />, desc: 'Get color codes for any color' },
    { name: 'Color Name Finder', icon: <FileText className="w-4 h-4" />, desc: 'Find color names' },
    { name: 'Color Compare', icon: <GitCompare className="w-4 h-4" />, desc: 'Compare colors side by side' },
    { name: 'Color Blog', icon: <BookOpen className="w-4 h-4" />, desc: 'Learn about colors' },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#090911]' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className={`text-sm ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
          >
            ← Back to Home
          </Link>
        </div>

        {/* Content */}
        <div className={`rounded-2xl p-6 sm:p-8 border ${
          isDark ? 'bg-[#1a1a2e] border-[#2d2d4a]' : 'bg-white border-gray-200'
        }`}>
          
          <div className="text-center mb-8">
            <SwatchBook className={`w-14 h-14 mx-auto mb-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            <h1 className={`text-3xl sm:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Why Colors?
            </h1>
            <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Complete color toolkit for designers and developers
            </p>
          </div>

          <div className="space-y-6">
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              WhyColors is a free color toolkit with to help you work with colors efficiently. 
              From palette generation to contrast checking, we've got you covered.
            </p>

            {/* All Tools Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tools.map((tool) => (
                <div 
                  key={tool.name}
                  className={`flex items-center gap-3 p-3 rounded-xl transition ${
                    isDark ? 'bg-[#0d0d1a] hover:bg-[#14142a]' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className={`${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                    {tool.icon}
                  </span>
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {tool.name}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {tool.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className={`pt-4 border-t ${isDark ? 'border-[#2d2d4a]' : 'border-gray-200'}`}>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <Heart className="inline w-4 h-4 text-red-400 mr-1" fill="#f87171" />
                Free. No accounts. No sign-ups. Just colors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}