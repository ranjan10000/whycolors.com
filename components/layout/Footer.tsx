'use client';

import { Palette, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-[#0f0f1a] border-t border-gray-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#7c3aed]" />
            <span className="text-sm font-semibold text-gray-800 dark:text-white">
              Why<span className="text-[#7c3aed]">Colors</span>
            </span>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-500">
            &copy; {currentYear} WhyColors. All rights reserved.
          </p>
          
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>Made with love</span>
          </div>
        </div>
      </div>
    </footer>
  );
}