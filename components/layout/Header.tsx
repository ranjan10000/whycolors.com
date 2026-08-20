'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Palette, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '#palette', label: 'Palettes' },
  { href: '#effects', label: 'Effects' },
  { href: '#contrast', label: 'Contrast Checker' },
  { href: '#color-wheel', label: 'Color Wheel' },
  { href: '#color-picker', label: 'Color Picker' },
  { href: '#gradient', label: 'Gradient' },
  { href: '#color-scales', label: 'Color Scales' },
  { href: '#image-palette', label: 'Image Palette' },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle navigation click - works on both home and other pages
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    const targetId = href.replace('#', '');
    
    if (pathname === '/') {
      // On home page - scroll to section
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update URL without page reload
        window.history.pushState(null, '', href);
      } else {
        // If element not found, try to find it after a small delay (for lazy loaded content)
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      }
    } else {
      // On other pages - navigate to home with hash
      window.location.href = `/${href}`;
    }
  };

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#131322]/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div className="text-lg font-bold text-gray-800 dark:text-white">
                Why<span className="text-[#7c3aed]">Colors</span>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#131322]/90 backdrop-blur-xl border-b border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - Link to home */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-white">
                Why<span className="text-[#7c3aed]">Colors</span>
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === '/' && window.location.hash === link.href;
                return (
                  <a
                    key={link.href}
                    href={pathname === '/' ? link.href : `/${link.href}`}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                      isActive
                        ? 'text-[#7c3aed] dark:text-[#a78bfa] bg-purple-50 dark:bg-purple-900/20'
                        : 'text-[#686b74] dark:text-[#a8abb4] hover:text-[#101114] dark:hover:text-[#f7f7f4] hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </a>
                );
              })}
            </nav>

            {/* Right side - Theme toggle + Mobile menu button */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-all flex-shrink-0"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-400" />
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-16 right-0 z-40 w-full max-w-sm h-[calc(100vh-4rem)] bg-white dark:bg-[#131322] shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <nav className="flex flex-col p-4 h-full overflow-y-auto">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={pathname === '/' ? link.href : `/${link.href}`}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:text-[#7c3aed] dark:hover:text-[#a78bfa] hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all"
              >
                {link.label}
              </a>
            ))}
          </div>
          
          {/* Mobile Menu Footer */}
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/10">
            <div className="px-4 py-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                WhyColors v1.0
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Color tools for everyone
              </p>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}