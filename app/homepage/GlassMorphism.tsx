import React, { useState, useCallback, useMemo } from 'react';
import { Copy, Check, X } from 'lucide-react';

interface GlassMorphismProps {
  color: string;
  onCopy: (text: string) => Promise<void> | void;
  onShowToast: (message: string) => void;
}

interface GlassConfig {
  blur: number;
  opacity: number;
  depth: number;
  borderRadius: number;
  borderOpacity: number;
}

const GlassMorphism: React.FC<GlassMorphismProps> = ({ color, onCopy: parentOnCopy, onShowToast }) => {
  const [config, setConfig] = useState<GlassConfig>({
    blur: 18,
    opacity: 57,
    depth: 7,
    borderRadius: 16,
    borderOpacity: 55,
  });
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

  // Generate glass CSS
  const generateGlassCSS = useCallback(() => {
    const { blur, opacity, depth, borderRadius, borderOpacity } = config;
    const bgColor = hexToRgba(color, opacity / 100);
    const shadowColor = hexToRgba(color, 0.3);
    const borderColor = hexToRgba('#ffffff', borderOpacity / 100);
    
    return `background: ${bgColor};
backdrop-filter: blur(${blur}px);
-webkit-backdrop-filter: blur(${blur}px);
border-radius: ${borderRadius}px;
border: 1px solid ${borderColor};
box-shadow: 0 ${depth}px ${depth * 2}px ${shadowColor};`;
  }, [config, color, hexToRgba]);

  // Generate CSS display
  const glassCSSDisplay = useMemo(() => {
    return generateGlassCSS();
  }, [generateGlassCSS]);

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
  const updateConfig = useCallback((key: keyof GlassConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  // Reusable Range Input Component
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
          className="w-full h-1.5 sm:h-2 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 sm:[&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-4 sm:[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-purple-500 dark:[&::-webkit-slider-thumb]:border-purple-400 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 sm:[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-4 sm:[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-purple-500 dark:[&::-moz-range-thumb]:border-purple-400 [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>
    </div>
  ), []);

  // Get preview styles
  const previewStyles = useMemo(() => {
    const { blur, opacity, depth, borderRadius, borderOpacity } = config;
    const bgColor = hexToRgba(color, opacity / 100);
    const shadowColor = hexToRgba(color, 0.3);
    const borderColor = hexToRgba('#ffffff', borderOpacity / 100);
    
    return {
      background: bgColor,
      backdropFilter: `blur(${blur}px)`,
      WebkitBackdropFilter: `blur(${blur}px)`,
      borderRadius: `${borderRadius}px`,
      border: `1px solid ${borderColor}`,
      boxShadow: `0 ${depth}px ${depth * 2}px ${shadowColor}`,
    };
  }, [config, color, hexToRgba]);

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
        {/* Glass Preview Section - Responsive */}
        <div
          className="min-h-[180px] sm:min-h-[240px] grid place-items-center overflow-hidden relative p-4"
          style={{
            background: `linear-gradient(135deg, ${color}33, ${color}88)`,
          }}
        >
          {/* Main Glass Card */}
          <div
            className="w-[82%] max-w-[280px] sm:max-w-[310px] p-4 sm:p-8 transition-all duration-200"
            style={previewStyles}
          >
            <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.12em]" style={{ opacity: 0.7 }}>
              Glass card
            </p>
            <p className="mt-1 sm:mt-2 text-lg sm:text-2xl font-bold tracking-tight text-[#101114]">
              Soft, layered depth.
            </p>
          </div>
        </div>

        {/* Controls Section - Responsive */}
        <div className="p-4 sm:p-6">
          <h3 className="font-bold text-base sm:text-lg">Glass Morphism</h3>
          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[#686b74] dark:text-[#a8abb4]">
            Create modern, frosted glass effects with blur, opacity, and depth.
          </p>

          <div className="mt-4 sm:mt-5">
            {/* Blur Control */}
            <RangeInput
              id="glass-blur"
              label="Blur"
              value={config.blur}
              min={0}
              max={30}
              unit="px"
              onChange={(val) => updateConfig('blur', val)}
            />

            {/* Refraction (Opacity) Control */}
            <RangeInput
              id="glass-opacity"
              label="Refraction"
              value={config.opacity}
              min={5}
              max={85}
              unit="%"
              onChange={(val) => updateConfig('opacity', val)}
            />

            {/* Depth Control */}
            <RangeInput
              id="glass-depth"
              label="Depth"
              value={config.depth}
              min={0}
              max={40}
              unit="px"
              onChange={(val) => updateConfig('depth', val)}
            />

            {/* Border Radius Control - New! */}
            <RangeInput
              id="glass-radius"
              label="Border Radius"
              value={config.borderRadius}
              min={0}
              max={40}
              unit="px"
              onChange={(val) => updateConfig('borderRadius', val)}
            />

            {/* Border Opacity Control - New! */}
            <RangeInput
              id="glass-border"
              label="Border Opacity"
              value={config.borderOpacity}
              min={0}
              max={100}
              unit="%"
              onChange={(val) => updateConfig('borderOpacity', val)}
            />
          </div>

       {/* CSS Code Display - Glassmorphism Responsive */}
<div className="mt-4 sm:mt-5 rounded-xl sm:rounded-2xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-2.5 sm:p-3.5">
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
    {/* Horizontal Scroll for Multi-line CSS */}
    <div className="min-w-0 flex-1 overflow-x-auto custom-scrollbar">
      <code className="block text-[11px] sm:text-xs font-mono leading-relaxed whitespace-pre text-gray-800 dark:text-gray-200">
        {glassCSSDisplay}
      </code>
    </div>

    {/* Responsive Copy Button */}
    <button
      className="self-end sm:self-center shrink-0 flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 sm:p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all"
      type="button"
      onClick={() => handleCopy(glassCSSDisplay)}
      aria-label="Copy glass CSS"
    >
      <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      <span className="text-[10px] font-medium sm:hidden">Copy</span>
    </button>
  </div>
</div>
        </div>
      </article>
    </div>
  );
};

export default GlassMorphism;