'use client';

import Link from 'next/link';
import { Palette, Heart, Mail, Sparkles, Zap, Shield, BookOpen } from 'lucide-react';

const footerLinks = {
  tools: [
    { label: 'Palettes', href: '#palette' },
    { label: 'Effects', href: '#effects' },
    { label: 'Color Wheel', href: '#color-wheel' },
    { label: 'Color Picker', href: '#color-picker' },
    { label: 'Gradient Generator', href: '#gradient' },
    { label: 'Color Scales', href: '#color-scales' },
    { label: 'Image Palette', href: '#image-palette' },
     { label: 'Image Color Extractor', href: '#image-color-extractor' },
    
  ],
  resources: [
    // { label: 'Accessibility', href: '#contrast' },
    // { label: 'Color Theory', href: '#color-theory' },
    // { label: 'Blog', href: '/blog' },
    // { label: 'Documentation', href: '/docs' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Blog', href: '/blog' },
  ],
};


export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-[#0f0f1a] border-t border-gray-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800 dark:text-white">
                Why<span className="text-[#7c3aed]">Colors</span>
              </span>
            </Link>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
              Your ultimate color toolkit for designers and developers. 
              Create beautiful palettes, test accessibility, and explore color harmonies.
            </p>
          
          </div>

          {/* Tools Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7c3aed]" />
              Tools
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.tools.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#7c3aed] dark:hover:text-[#a78bfa] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#7c3aed]" />
              Resources
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#7c3aed] dark:hover:text-[#a78bfa] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#7c3aed]" />
              Company
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#7c3aed] dark:hover:text-[#a78bfa] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-200 dark:border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#7c3aed]" />
              <span className="text-xs text-gray-500 dark:text-gray-500">
                &copy; {currentYear} WhyColors. All rights reserved.
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
                <span>Made with love</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}