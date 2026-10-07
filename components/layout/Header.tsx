'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Palette, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '#color-picker', label: 'Color Picker' },
  { href: '#color-wheel', label: 'Color Wheel' },
  { href: '#palette', label: 'Palettes' },
  { href: '#gradient', label: 'Gradient' },
  { href: '#effects', label: 'Effects' },
  { href: '#color-scales', label: 'Color Scales' },
  { href: '#image-palette', label: 'Image Palette' },
  { href: '#contrast', label: 'Contrast Checker' },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    setActiveHash(window.location.hash);
    const onHashChange = () => setActiveHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetId = href.replace('#', '');

    if (pathname === '/') {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', href);
        setActiveHash(href);
      }
    } else {
      window.location.href = `/${href}`;
    }
  };

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-gray-900 dark:text-white">
          <Palette className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          <span>Why<span className="text-violet-600 dark:text-violet-400">Colors</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === '/' && activeHash === link.href;
            return (
              <a
                key={link.href}
                href={pathname === '/' ? link.href : `/${link.href}`}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900"
          >
            {theme === 'light' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900 lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={pathname === '/' ? link.href : `/${link.href}`}
                onClick={(e) => handleNavClick(e, link.href)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}