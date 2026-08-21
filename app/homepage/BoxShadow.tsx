import React, { useState, useCallback, useMemo } from 'react';
import { Copy, Check, X, Palette, Sparkles } from 'lucide-react';

interface BoxShadowProps {
  color: string;
  onCopy: (text: string) => Promise<void> | void;
  onShowToast: (message: string) => void;
}

interface ShadowConfig {
  x: number;
  y: number;
  blur: number;
  opacity: number;
  spread: number;
  inset: boolean;
}

const BoxShadow: React.FC<BoxShadowProps> = ({ color, onCopy: parentOnCopy, onShowToast }) => {
  const [config, setConfig] = useState<ShadowConfig>({
    x: 8,
    y: 8,
    blur: 20,
    opacity: 25,
    spread: 0,
    inset: false,
  });
  const [boxColor, setBoxColor] = useState<string>(color);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Helper: Hex to RGBA
  const hexToRgba = useCallback((hex: string, alpha: number) => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }, []);

  // Generate shadow CSS
  const generateShadow = useCallback(() => {
    const { x, y, blur, opacity, spread, inset } = config;
    const insetPrefix = inset ? 'inset ' : '';
    const shadowColor = hexToRgba(color, opacity / 100);
    return `${insetPrefix}${x}px ${y}px ${blur}px ${spread}px ${shadowColor}`;
  }, [config, color, hexToRgba]);

  // Generate CSS display
  const shadowCSSDisplay = useMemo(() => {
    const shadow = generateShadow();
    return `box-shadow: ${shadow};`;
  }, [generateShadow]);

  // Toast handlers
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  }, []);

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      if (onShowToast) {
        onShowToast('CSS copied to clipboard!');
      } else {
        showToast('CSS copied to clipboard!', 'success');
      }
    } catch (err) {
      if (onShowToast) {
        onShowToast('Failed to copy CSS');
      } else {
        showToast('Failed to copy CSS', 'error');
      }
    }
  }, [onShowToast, showToast]);

  // Update config helper
  const updateConfig = useCallback((key: keyof ShadowConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  // Reusable Range Input Component - Only Thumb Changed
  const RangeInput = useCallback(({ 
    id, label, value, min, max, step = 1, unit = '', onChange 
  }: { 
    id: string; 
    label: string; 
    value: number; 
    min: number; 
    max: number; 
    step?: number; 
    unit?: string; 
    onChange: (val: number) => void;
  }) => (
    <div className="mt-3 sm:mt-4">
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="block text-xs sm:text-sm font-bold">
          {label}
        </label>
        <span className="text-xs sm:text-sm font-mono bg-purple-100 dark:bg-purple-900/30 px-1.5 sm:px-2 py-0.5 rounded-md text-purple-700 dark:text-purple-300">
          {value}{unit}
        </span>
      </div>
      <div className="relative mt-1">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
          className="w-full h-1.5 sm:h-2 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700 
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 
            [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:bg-white 
            [&::-webkit-slider-thumb]:shadow-lg 
            [&::-webkit-slider-thumb]:border-2 
            [&::-webkit-slider-thumb]:border-purple-500 
            dark:[&::-webkit-slider-thumb]:border-purple-400 
            [&::-webkit-slider-thumb]:transition-all 
            [&::-webkit-slider-thumb]:hover:scale-110 
            [&::-webkit-slider-thumb]:cursor-pointer 
            [&::-moz-range-thumb]:w-8 [&::-moz-range-thumb]:h-8 
            [&::-moz-range-thumb]:rounded-full 
            [&::-moz-range-thumb]:bg-white 
            [&::-moz-range-thumb]:shadow-lg 
            [&::-moz-range-thumb]:border-2 
            [&::-moz-range-thumb]:border-purple-500 
            dark:[&::-moz-range-thumb]:border-purple-400 
            [&::-moz-range-thumb]:transition-all 
            [&::-moz-range-thumb]:hover:scale-110 
            [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>
    </div>
  ), []);

  // Toggle button component
  const ToggleButton = useCallback(({ 
    label, isActive, onClick 
  }: { 
    label: string; 
    isActive: boolean; 
    onClick: () => void;
  }) => (
    <button
      className={`py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold capitalize transition-all ${
        isActive
          ? 'bg-purple-500 text-white shadow-lg scale-95'
          : 'bg-purple-100 dark:bg-purple-900/30 text-[#686b74] dark:text-[#a8abb4] hover:bg-purple-200 dark:hover:bg-purple-800/40'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  ), []);

  return (
    <div className="relative w-full">
      {toast.show && !onShowToast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl shadow-lg transition-all duration-300 animate-in slide-in-from-top-2 ${
          toast.type === 'success' 
            ? 'bg-green-500/90 dark:bg-green-600/90 text-white' 
            : 'bg-red-500/90 dark:bg-red-600/90 text-white'
        }`}>
          {toast.type === 'success' ? (
            <Check className="h-4 w-4 sm:h-5 sm:w-5" />
          ) : (
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
          <span className="text-xs sm:text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <article className="glass overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-white/76 dark:bg-[#191a1e]/76 border border-[#101114]/9 dark:border-white/11 shadow-[0_24px_64px_rgba(19,20,24,0.09)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-[18px] w-full max-w-full sm:max-w-md mx-auto">
        {/* Preview Section - Responsive */}
        <div
          className="min-h-[180px] sm:min-h-[240px] grid place-items-center p-4"
          style={{
            background: `linear-gradient(135deg, ${color}22, ${color}66)`,
          }}
        >
          <div
            className="w-[120px] h-[120px] sm:w-[150px] sm:h-[130px] rounded-2xl transition-shadow duration-200"
            style={{
              background: boxColor,
              boxShadow: generateShadow(),
            }}
          />
        </div>

        {/* Controls Section - Responsive */}
        <div className="p-4 sm:p-6">
          <h3 className="font-bold text-base sm:text-lg">Box Shadow</h3>
          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[#686b74] dark:text-[#a8abb4]">
            Fine-tune shadow position, blur, opacity, and spread.
          </p>

          {/* Controls Grid */}
          <div className="mt-4 sm:mt-5">
            {/* X Control */}
            <RangeInput
              id="shadow-x"
              label="X Position"
              value={config.x}
              min={-50}
              max={50}
              unit="px"
              onChange={(val) => updateConfig('x', val)}
            />

            {/* Y Control */}
            <RangeInput
              id="shadow-y"
              label="Y Position"
              value={config.y}
              min={-50}
              max={50}
              unit="px"
              onChange={(val) => updateConfig('y', val)}
            />

            {/* Blur Control */}
            <RangeInput
              id="shadow-blur"
              label="Blur"
              value={config.blur}
              min={0}
              max={80}
              unit="px"
              onChange={(val) => updateConfig('blur', val)}
            />

            {/* Opacity Control */}
            <RangeInput
              id="shadow-opacity"
              label="Opacity"
              value={config.opacity}
              min={0}
              max={100}
              unit="%"
              onChange={(val) => updateConfig('opacity', val)}
            />

            {/* Spread Control */}
            <RangeInput
              id="shadow-spread"
              label="Spread"
              value={config.spread}
              min={-20}
              max={40}
              unit="px"
              onChange={(val) => updateConfig('spread', val)}
            />

            {/* Box Color */}
            <div className="mt-3 sm:mt-4">
              <label className="block text-xs sm:text-sm font-bold mb-1 sm:mb-1.5">
                Box Color
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-1.5 sm:p-2">
                <input
                  type="color"
                  value={boxColor}
                  onChange={(e) => setBoxColor(e.target.value)}
                  className="h-8 w-8 sm:h-10 sm:w-10 cursor-pointer rounded-lg border-0"
                />
                <span className="font-mono text-xs sm:text-sm">{boxColor}</span>
                <button
                  className="ml-auto px-2 sm:px-3 py-1 rounded-lg text-xs font-bold bg-purple-500 text-white hover:bg-purple-600 transition-colors"
                  onClick={() => setBoxColor(color)}
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Inset Toggle */}
            <div className="mt-3 sm:mt-4">
              <label className="block text-xs sm:text-sm font-bold mb-1 sm:mb-1.5">
                Shadow Style
              </label>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                <ToggleButton
                  label="Outer"
                  isActive={!config.inset}
                  onClick={() => updateConfig('inset', false)}
                />
                <ToggleButton
                  label="Inset"
                  isActive={config.inset}
                  onClick={() => updateConfig('inset', true)}
                />
              </div>
            </div>
          </div>

          {/* CSS Code Display - Responsive */}
          <div className="mt-4 sm:mt-5 rounded-xl sm:rounded-2xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-2 sm:p-3">
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 break-all text-[10px] sm:text-xs font-mono leading-relaxed">
                {shadowCSSDisplay}
              </code>
              <button
                className="rounded-lg p-1.5 sm:p-2 hover:bg-white/10 dark:hover:bg-white/5 transition-colors shrink-0"
                type="button"
                onClick={() => handleCopy(shadowCSSDisplay)}
                aria-label="Copy box shadow CSS"
              >
                <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BoxShadow;