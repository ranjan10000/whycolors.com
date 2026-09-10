'use client';

import Link from 'next/link';
import { Palette, Heart, Sparkles, Shield, ChevronUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const footerLinks = {
  tools: [
    { label: 'Colors', href: '/color' },
    { label: 'Shades', href: '/shades' },
    { label: 'Custom Palettes', href: '/color/palettes' },
    { label: 'Palettes', href: '#palette' },
    { label: 'Effects', href: '#effects' },
    { label: 'Color Wheel', href: '#color-wheel' },
    { label: 'Color Picker', href: '#color-picker' },
    { label: 'Gradient Generator', href: '#gradient' },
    { label: 'Color Scales', href: '#color-scales' },
    { label: 'Image Palette', href: '#image-palette' },
    { label: 'Image Color Extractor', href: '#image-color-extractor' },
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
  const [isVisible, setIsVisible] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  // Footer animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  // Back to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer 
        ref={footerRef}
        className={`
          bg-white dark:bg-[#0f0f1a] border-t border-gray-200 dark:border-white/10
          transition-all duration-700 ease-out
          ${isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-16'
          }
        `}
      >
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
                Your ultimate color toolkit for Designers, Developers and Creative Professionals. 
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
                {footerLinks.tools.map((link, index) => (
                  <li 
                    key={link.href}
                    className={`
                      transition-all duration-500 ease-out
                      ${isVisible 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-8'
                      }
                    `}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
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

            {/* Company Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#7c3aed]" />
                Company
              </h3>
              <ul className="space-y-2.5">
                {footerLinks.company.map((link, index) => (
                  <li 
                    key={link.href}
                    className={`
                      transition-all duration-500 ease-out
                      ${isVisible 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-8'
                      }
                    `}
                    style={{ transitionDelay: `${(index + footerLinks.tools.length) * 50}ms` }}
                  >
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
          <div 
            className={`
              py-6 border-t border-gray-200 dark:border-white/10
              transition-all duration-700 ease-out delay-300
              ${isVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-8'
              }
            `}
          >
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

      {/* Floating Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={`
          fixed bottom-8 right-8 z-50
          w-12 h-12 rounded-full
          bg-gradient-to-br from-[#7c3aed] to-[#a78bfa]
          text-white shadow-lg
          flex items-center justify-center
          transition-all duration-300 ease-out
          hover:scale-110 hover:shadow-xl
          active:scale-95
          ${showBackToTop 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 translate-y-8 pointer-events-none'
          }
        `}
        aria-label="Back to top"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </>
  );
}