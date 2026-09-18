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
      const scroll = () => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.history.pushState(null, '', href);
          setActiveHash(href); // manual update since pushState doesn't fire hashchange
        }
      };

      if (document.getElementById(targetId)) {
        scroll();
      } else {
        setTimeout(scroll, 300);
      }
    } else {
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
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div className="text-lg font-bold text-gray-800 dark:text-white">
                Why<span className="text-[#7c3aed]">Colors</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === '/' && activeHash === link.href;
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

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

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

          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-white/10">
            <div className="px-4 py-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">WhyColors v1.0</p>
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