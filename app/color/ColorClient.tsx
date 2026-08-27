// app/color/ColorClient.tsx
'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
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
  Disc,
  X,
} from 'lucide-react';
import { getColorName, sanitizeHex, isValidHex } from '@/lib/color-utils';
import { useTheme } from '@/contexts/ThemeContext';

// ================ CONSTANTS ================
const COPY_TIMEOUT = 2000;
const SEARCH_ERROR_TIMEOUT = 3000;
const BRAND_COLOR = '#7c3aed';

// ================ TYPES ================
interface ColorClientProps {
  initialColors: string[];
  totalColors: number;
}

// ================ HOOK: useThemeStyles ================
const useThemeStyles = (isDark: boolean) => {
  return useMemo(() => ({
    bg: isDark ? 'bg-[#090a0f]' : 'bg-gray-50',
    text: isDark ? 'text-white' : 'text-gray-900',
    textMuted: isDark ? 'text-gray-400' : 'text-gray-600',
    textSecondary: isDark ? 'text-gray-500' : 'text-gray-500',
    border: isDark ? 'border-white/10' : 'border-gray-200',
    borderHover: isDark ? 'hover:border-violet-500/50' : 'hover:border-violet-400',
    card: isDark ? 'bg-[#12131a]' : 'bg-white',
    cardHover: isDark 
      ? 'hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/10' 
      : 'hover:border-violet-400 hover:shadow-2xl hover:shadow-violet-500/10',
    input: isDark 
      ? 'bg-[#090a0f] border-white/10 text-white placeholder-gray-500' 
      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400',
    inputFocus: 'focus:border-violet-500 focus:ring-1 focus:ring-violet-500',
    button: isDark 
      ? 'bg-violet-600 hover:bg-violet-500 active:scale-95 text-white shadow-lg shadow-violet-600/20' 
      : 'bg-violet-600 hover:bg-violet-500 active:scale-95 text-white shadow-lg shadow-violet-600/30',
    buttonHover: isDark ? 'hover:bg-violet-500' : 'hover:bg-violet-500',
    badge: isDark 
      ? 'bg-violet-500/10 border-violet-500/30 text-violet-400' 
      : 'bg-violet-100 border-violet-300 text-violet-700',
    toolCard: isDark 
      ? 'bg-[#12131a] border-white/10 hover:border-violet-500/50 hover:bg-white/[0.02]' 
      : 'bg-white border-gray-200 hover:border-violet-400 hover:bg-violet-50/50',
    toolCardHover: isDark 
      ? 'group-hover:text-violet-400 group-hover:scale-110' 
      : 'group-hover:text-violet-600 group-hover:scale-110',
    footer: isDark 
      ? 'bg-[#12131a]/50 border-white/5' 
      : 'bg-white/50 border-gray-200',
    cardText: isDark ? 'text-white' : 'text-gray-900',
    cardSubtext: isDark ? 'text-gray-400' : 'text-gray-600',
    cardBg: isDark ? 'bg-[#12131a]/90' : 'bg-white/90',
    cardBorder: isDark ? 'border-white/5' : 'border-gray-100',
    actionButton: isDark 
      ? 'bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white' 
      : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900',
    searchBg: isDark ? 'bg-[#12131a]' : 'bg-white',
    searchBorder: isDark ? 'border-white/10' : 'border-gray-200',
    searchShadow: isDark ? 'shadow-2xl' : 'shadow-lg',
    errorText: 'text-red-400',
    emptyText: isDark ? 'text-gray-400' : 'text-gray-500',
  }), [isDark]);
};

// ================ COMPONENT: Header ================
interface HeaderProps {
  totalColors: number;
  isDark: boolean;
}

const Header = ({ totalColors, isDark }: HeaderProps) => {
  const styles = useThemeStyles(isDark);
  
  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 ${styles.border}`}>
      <div>
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${styles.text}`}>
            Color Explorer
          </h1>
          <span className={`px-3 py-1 border rounded-full text-xs font-semibold flex items-center gap-1.5 ${styles.badge}`}>
            <Sparkles className="w-3 h-3" />
            {totalColors.toLocaleString()} colors
          </span>
        </div>
        <p className={`text-sm ${styles.textMuted}`}>
          Explore, discover, and analyze any color in real-time
        </p>
      </div>
    </div>
  );
};

// ================ COMPONENT: HexSearch ================
interface HexSearchProps {
  onSearch: (hex: string) => void;
  error: string;
  onErrorClear: () => void;
  isDark: boolean;
}

const HexSearch = ({ onSearch, error, onErrorClear, isDark }: HexSearchProps) => {
  const styles = useThemeStyles(isDark);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = sanitizeHex(inputValue);
    if (sanitized && isValidHex(sanitized)) {
      onSearch(sanitized);
      setInputValue('');
    }
  }, [inputValue, onSearch]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-fA-F0-9]/g, '');
    setInputValue(value);
    onErrorClear();
  }, [onErrorClear]);

  const handleClear = useCallback(() => {
    setInputValue('');
    onErrorClear();
    inputRef.current?.focus();
  }, [onErrorClear]);

  const handleExampleClick = useCallback((example: string) => {
    setInputValue(example);
    onSearch(example);
  }, [onSearch]);

  const examples = useMemo(() => ['FF0000', '00FF00', '0000FF'], []);

  return (
    <div className={`relative p-2 border rounded-2xl backdrop-blur-xl ${styles.searchBg} ${styles.searchBorder} ${styles.searchShadow}`}>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative flex items-center">
          <span className={`absolute left-4 font-mono font-bold text-base ${styles.textMuted}`}>#</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter hex color (e.g. ff0000 or f00)"
            value={inputValue}
            onChange={handleInputChange}
            className={`w-full border rounded-xl pl-9 pr-10 py-3 font-mono transition text-sm sm:text-base ${styles.input} ${styles.inputFocus}`}
            aria-label="Enter HEX color code"
            aria-invalid={!!error}
            aria-describedby={error ? "search-error" : undefined}
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className={`absolute right-3 p-1 rounded-full transition ${
                isDark 
                  ? 'hover:bg-white/10 text-gray-500 hover:text-white' 
                  : 'hover:bg-gray-200 text-gray-400 hover:text-gray-700'
              }`}
              aria-label="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {error && (
            <p id="search-error" className={`absolute -bottom-6 left-2 text-xs font-medium ${styles.errorText}`}>
              {error}
            </p>
          )}
        </div>
        <button
          type="submit"
          className={`px-8 py-3 font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${styles.button}`}
          disabled={!inputValue}
        >
          <Search className="w-4 h-4" />
          <span>Explore</span>
        </button>
      </form>
      <div className={`px-3 pt-2 text-[11px] flex items-center gap-2 flex-wrap ${styles.textSecondary}`}>
        <span>Try:</span>
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => handleExampleClick(example)}
            className={`font-mono transition ${
              isDark 
                ? 'text-gray-400 hover:text-violet-400 hover:underline' 
                : 'text-gray-500 hover:text-violet-600 hover:underline'
            }`}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
};

// ================ COMPONENT: ColorCard ================
interface ColorCardProps {
  hex: string;
  onCopy: (hex: string) => void;
  copiedHex: string | null;
  isDark: boolean;
}

const ColorCard = ({ hex, onCopy, copiedHex, isDark }: ColorCardProps) => {
  const styles = useThemeStyles(isDark);
  const fullHex = `#${hex.toUpperCase()}`;
  const colorName = getColorName(hex);
  const isCopied = copiedHex === hex;

  return (
    <Link
      href={`/color/${hex}`}
      className={`group relative border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${styles.card} ${styles.border} ${styles.cardHover}`}
    >
      {/* Top Color Banner */}
      <div 
        className="w-full h-36 sm:h-40 transition-transform duration-500 group-hover:scale-[1.02]"
        style={{ backgroundColor: fullHex }}
        role="img"
        aria-label={`Color swatch for ${colorName || fullHex}`}
      />

      {/* Bottom Bar */}
      <div className={`px-4 py-3 flex items-center justify-between border-t ${styles.cardBg} ${styles.cardBorder}`}>
        <div className="truncate pr-2">
          <p className={`text-sm font-bold truncate capitalize transition ${styles.cardText} group-hover:text-violet-400`}>
            {colorName || 'Color Swatch'}
          </p>
          <p className={`text-xs font-mono tracking-wider mt-0.5 ${styles.cardSubtext}`}>
            {fullHex}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCopy(hex);
            }}
            title="Copy Hex Code"
            className={`p-2 rounded-lg transition cursor-pointer ${styles.actionButton}`}
            aria-label={isCopied ? 'Copied!' : `Copy ${fullHex}`}
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          
          <div 
            className={`p-2 rounded-lg transition ${styles.actionButton}`}
            aria-hidden="true"
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          </div>
        </div>
      </div>
    </Link>
  );
};

// ================ COMPONENT: ColorGrid ================
interface ColorGridProps {
  colors: string[];
  onCopy: (hex: string) => void;
  copiedHex: string | null;
  isDark: boolean;
}

const ColorGrid = ({ colors, onCopy, copiedHex, isDark }: ColorGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
      {colors.map((hex) => (
        <ColorCard
          key={hex}
          hex={hex}
          onCopy={onCopy}
          copiedHex={copiedHex}
          isDark={isDark}
        />
      ))}
    </div>
  );
};

// ================ COMPONENT: QuickTools ================
interface Tool {
  href: string;
  icon: React.ReactNode;
  label: string;
}

interface QuickToolsProps {
  isDark: boolean;
}

const QuickTools = ({ isDark }: QuickToolsProps) => {
  const styles = useThemeStyles(isDark);
  
  const tools: Tool[] = useMemo(() => [
    { href: '/color/wheel', icon: <Disc className="w-7 h-7" />, label: 'Color Wheel' },
    { href: '/color/convert', icon: <RefreshCw className="w-7 h-7" />, label: 'Converter' },
    { href: '/color/palettes', icon: <Palette className="w-7 h-7" />, label: 'Palettes' },
    { href: '/color/gradient', icon: <Layers className="w-7 h-7" />, label: 'Gradient' },
  ], []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {tools.map((tool) => (
        <Link 
          key={tool.label}
          href={tool.href}
          className={`group rounded-2xl p-5 text-center transition duration-300 ${styles.toolCard}`}
        >
          <div className={`mx-auto mb-2 transition duration-300 ${styles.toolCardHover}`}>
            {tool.icon}
          </div>
          <span className={`text-sm font-semibold transition duration-300 ${styles.toolCardHover}`}>
            {tool.label}
          </span>
        </Link>
      ))}
    </div>
  );
};

// ================ COMPONENT: FooterStats ================
interface FooterStatsProps {
  totalColors: number;
  isDark: boolean;
}

// ================ COMPONENT: SectionHeader ================
interface SectionHeaderProps {
  title: string;
  isDark: boolean;
  action?: {
    href: string;
    label: string;
  };
}

const SectionHeader = ({ title, isDark, action }: SectionHeaderProps) => {
  const styles = useThemeStyles(isDark);
  
  return (
    <div className="flex items-center justify-between">
      <h2 className={`text-xl font-bold tracking-wide ${styles.text}`}>{title}</h2>
      {action && (
        <Link 
          href={action.href}
          className={`text-xs font-semibold transition flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
            isDark 
              ? 'text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20' 
              : 'text-violet-600 hover:text-violet-700 bg-violet-100 hover:bg-violet-200 border-violet-300'
          }`}
        >
          <span>{action.label}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
};

// ================ HOOK: useColorSearch ================
const useColorSearch = (initialColors: string[]) => {
  const [hexInput, setHexInput] = useState('');
  const [searchError, setSearchError] = useState('');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [displayColors, setDisplayColors] = useState(initialColors);

  const handleSearch = useCallback((hex: string) => {
    const sanitized = sanitizeHex(hex);
    if (sanitized && isValidHex(sanitized)) {
      window.location.href = `/color/${sanitized}`;
    } else {
      setSearchError('Please enter a valid hex color (e.g., ff0000 or f00)');
      setTimeout(() => {
        setSearchError('');
      }, SEARCH_ERROR_TIMEOUT);
    }
  }, []);

  const clearSearchError = useCallback(() => {
    setSearchError('');
  }, []);

  const handleCopy = useCallback((hex: string) => {
    navigator.clipboard.writeText(`#${hex.toUpperCase()}`);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), COPY_TIMEOUT);
  }, []);

  // Filter colors based on search
  const filteredColors = useMemo(() => {
    if (!hexInput) return displayColors;
    const searchTerm = hexInput.toLowerCase();
    return displayColors.filter(hex => 
      hex.toLowerCase().includes(searchTerm) ||
      getColorName(hex).toLowerCase().includes(searchTerm)
    );
  }, [displayColors, hexInput]);

  // Reset to initial colors when search is cleared
  useEffect(() => {
    if (!hexInput) {
      setDisplayColors(initialColors);
    }
  }, [hexInput, initialColors]);

  const setHexInputWithSearch = useCallback((value: string) => {
    setHexInput(value);
    if (!value) {
      setDisplayColors(initialColors);
    }
  }, [initialColors]);

  return {
    hexInput,
    setHexInput: setHexInputWithSearch,
    searchError,
    clearSearchError,
    handleSearch,
    handleCopy,
    copiedHex,
    filteredColors,
  };
};

// ================ MAIN COMPONENT: ColorClient ================
export default function ColorClient({ initialColors, totalColors }: ColorClientProps) {
  const { isDark } = useTheme();
  const styles = useThemeStyles(isDark);
  
  const {
    hexInput,
    setHexInput,
    searchError,
    clearSearchError,
    handleSearch,
    handleCopy,
    copiedHex,
    filteredColors,
  } = useColorSearch(initialColors);

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-10 select-none ${styles.bg}`}>
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <Header totalColors={totalColors} isDark={isDark} />

        {/* Hex Input Search Box */}
        <HexSearch
          onSearch={handleSearch}
          error={searchError}
          onErrorClear={clearSearchError}
          isDark={isDark}
        />

        {/* Popular Colors Grid */}
        <div className="space-y-5">
          <SectionHeader 
            title="Popular Colors" 
            isDark={isDark}
            action={{ href: '/color/palettes', label: 'View Palettes' }}
          />

          {filteredColors.length > 0 ? (
            <ColorGrid
              colors={filteredColors}
              onCopy={handleCopy}
              copiedHex={copiedHex}
              isDark={isDark}
            />
          ) : (
            <div className={`text-center py-12 ${styles.emptyText}`}>
              <p>No colors found matching &quot;{hexInput}&quot;</p>
            </div>
          )}
        </div>

        {/* Quick Tools Grid */}
        <QuickTools isDark={isDark} />
      </div>
    </div>
  );
}