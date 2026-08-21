import React, { useState, useCallback, useMemo } from 'react';
import { Copy, Check, X, Contrast, Palette, Sparkles } from 'lucide-react';

interface NeumorphismProps {
  color: string;
  onCopy: (text: string) => Promise<void> | void;
  onShowToast: (message: string) => void;
}

interface ShadowConfig {
  depth: number;
  blur: number;
  opacity: number;
  radius: number;
  shape: 'flat' | 'concave' | 'convex' | 'pressed';
  lightDirection: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const Neumorphism: React.FC<NeumorphismProps> = ({ color, onCopy: parentOnCopy, onShowToast }) => {
  const [config, setConfig] = useState<ShadowConfig>({
    depth: 16,
    blur: 20,
    opacity: 30,
    radius: 28,
    shape: 'flat',
    lightDirection: 'top-left',
  });
  const [neoDark, setNeoDark] = useState<boolean>(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Helper: Adjust color brightness
  const adjustColor = useCallback((hex: string, amount: number) => {
    const clean = hex.replace('#', '');
    let r = parseInt(clean.slice(0, 2), 16);
    let g = parseInt(clean.slice(2, 4), 16);
    let b = parseInt(clean.slice(4, 6), 16);
    
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }, []);

  // Helper: Hex to RGBA
  const hexToRgba = useCallback((hex: string, alpha: number) => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }, []);

  // Get shadow with opacity
  const getShadowWithOpacity = useCallback((shadowColor: string, opacity: number) => {
    const clean = shadowColor.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  }, []);

  // Get color variants
  const colorVariants = useMemo(() => {
    const lightColor = adjustColor(color, 40);
    const darkColor = adjustColor(color, -40);
    return { lightColor, darkColor };
  }, [color, adjustColor]);

  // Get luminance for text color
  const getLuminance = useCallback((hex: string) => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }, []);

  const isColorLight = getLuminance(color) > 0.5;
  const textColor = isColorLight ? '#101114' : '#ffffff';

  // Generate shadow based on shape and direction
  const generateShadow = useCallback(() => {
    const { depth, blur, opacity, shape, lightDirection } = config;
    const opacityValue = opacity / 100;
    
    if (neoDark) {
      const darkShade = 'rgba(23,25,29,${opacityValue})';
      const lightShade = 'rgba(49,52,58,${opacityValue})';
      
      if (shape === 'pressed') {
        return `inset ${depth}px ${depth}px ${blur}px ${darkShade}, inset -${depth}px -${depth}px ${blur}px ${lightShade}`;
      }
      
      const [x1, y1, x2, y2] = lightDirection === 'top-left' 
        ? [depth, depth, -depth, -depth]
        : lightDirection === 'top-right'
        ? [-depth, depth, depth, -depth]
        : lightDirection === 'bottom-left'
        ? [depth, -depth, -depth, depth]
        : [-depth, -depth, depth, depth];
      
      return `${x1}px ${y1}px ${blur}px ${darkShade}, ${x2}px ${y2}px ${blur}px ${lightShade}`;
    }
    
    const darkColor = getShadowWithOpacity(colorVariants.darkColor, opacity);
    const lightColor = getShadowWithOpacity(colorVariants.lightColor, opacity);
    
    if (shape === 'pressed') {
      return `inset ${depth}px ${depth}px ${blur}px ${darkColor}, inset -${depth}px -${depth}px ${blur}px ${lightColor}`;
    }
    
    const [x1, y1, x2, y2] = lightDirection === 'top-left' 
      ? [depth, depth, -depth, -depth]
      : lightDirection === 'top-right'
      ? [-depth, depth, depth, -depth]
      : lightDirection === 'bottom-left'
      ? [depth, -depth, -depth, depth]
      : [-depth, -depth, depth, depth];
    
    return `${x1}px ${y1}px ${blur}px ${darkColor}, ${x2}px ${y2}px ${blur}px ${lightColor}`;
  }, [config, neoDark, colorVariants, getShadowWithOpacity]);

  // Generate CSS display
  const neoCSSDisplay = useMemo(() => {
    const background = neoDark ? '#24262b' : color;
    const shadow = generateShadow();
    return `background: ${background};\nborder-radius: ${config.radius}px;\nbox-shadow: ${shadow};`;
  }, [neoDark, color, config.radius, generateShadow]);

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

  // Range input component (reusable)
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
    <div className="mt-4">
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="block text-sm font-bold">
          {label}
        </label>
        <span className="text-sm font-mono bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-md text-purple-700 dark:text-purple-300">
          {value}{unit}
        </span>
      </div>
      <div className="relative mt-1.5">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-purple-500 dark:[&::-webkit-slider-thumb]:border-purple-400 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-purple-500 dark:[&::-moz-range-thumb]:border-purple-400 [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>
    </div>
  ), []);

  return (
    <div className="relative">
      {toast.show && !onShowToast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 animate-in slide-in-from-top-2 ${
          toast.type === 'success' 
            ? 'bg-green-500/90 dark:bg-green-600/90 text-white' 
            : 'bg-red-500/90 dark:bg-red-600/90 text-white'
        }`}>
          {toast.type === 'success' ? (
            <Check className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <article className="glass overflow-hidden rounded-[2rem] bg-white/76 dark:bg-[#191a1e]/76 border border-[#101114]/9 dark:border-white/11 shadow-[0_24px_64px_rgba(19,20,24,0.09)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-[18px] max-w-md mx-auto">
        {/* Preview Section */}
        <div
          className="min-h-[240px] grid place-items-center transition-all duration-200"
          style={{ background: neoDark ? '#24262b' : color }}
        >
          <div
            className="w-[150px] h-[150px] grid place-items-center transition-all duration-200"
            style={{
              background: neoDark ? '#24262b' : color,
              borderRadius: `${config.radius}px`,
              boxShadow: generateShadow(),
              color: neoDark ? '#ffffff' : textColor,
            }}
          >
            <Contrast className="h-8 w-8" />
          </div>
        </div>

        {/* Controls Section */}
        <div className="p-6">
          <h3 className="font-bold text-lg">Neumorphism</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#686b74] dark:text-[#a8abb4]">
            Soft, extruded UI elements with subtle depth.
          </p>

          {/* Depth Control */}
          <RangeInput
            id="neo-depth"
            label="Depth"
            value={config.depth}
            min={4}
            max={28}
            unit="px"
            onChange={(val) => updateConfig('depth', val)}
          />

          {/* Blur Control */}
          <RangeInput
            id="neo-blur"
            label="Blur"
            value={config.blur}
            min={0}
            max={40}
            unit="px"
            onChange={(val) => updateConfig('blur', val)}
          />

          {/* Shadow Opacity Control */}
          <RangeInput
            id="neo-opacity"
            label="Shadow Opacity"
            value={config.opacity}
            min={5}
            max={70}
            unit="%"
            onChange={(val) => updateConfig('opacity', val)}
          />

          {/* Border Radius Control */}
          <RangeInput
            id="neo-radius"
            label="Border Radius"
            value={config.radius}
            min={0}
            max={50}
            unit="px"
            onChange={(val) => updateConfig('radius', val)}
          />

          {/* Shape Selection */}
          <div className="mt-4">
            <label className="block text-sm font-bold mb-1.5">
              Shape Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['flat', 'concave', 'convex', 'pressed'] as const).map((shape) => (
                <button
                  key={shape}
                  className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all ${
                    config.shape === shape
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'bg-purple-100 dark:bg-purple-900/30 text-[#686b74] dark:text-[#a8abb4] hover:bg-purple-200 dark:hover:bg-purple-800/40'
                  }`}
                  onClick={() => updateConfig('shape', shape)}
                >
                  {shape}
                </button>
              ))}
            </div>
          </div>

          {/* Light Direction */}
          <div className="mt-4">
            <label className="block text-sm font-bold mb-1.5">
              Light Direction
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((dir) => (
                <button
                  key={dir}
                  className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all ${
                    config.lightDirection === dir
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'bg-purple-100 dark:bg-purple-900/30 text-[#686b74] dark:text-[#a8abb4] hover:bg-purple-200 dark:hover:bg-purple-800/40'
                  }`}
                  onClick={() => updateConfig('lightDirection', dir)}
                >
                  {dir.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Mode Button */}
          <button
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-purple-500 px-4 py-2 font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg dark:bg-purple-600"
            type="button"
            onClick={() => setNeoDark(!neoDark)}
          >
            <Contrast className="h-4 w-4" />
            {neoDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>
{/* CSS Code Display */}
<div className="mt-5 rounded-2xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-3">
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div className="min-w-0 flex-1 overflow-x-auto custom-scrollbar">
      <code className="block text-xs font-mono whitespace-pre text-gray-800 dark:text-gray-200">
        {neoCSSDisplay}
      </code>
    </div>
    <button
      className="self-end sm:self-center shrink-0 flex items-center justify-center rounded-lg p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
      type="button"
      onClick={() => handleCopy(neoCSSDisplay)}
      aria-label="Copy neumorphism CSS"
    >
      <Copy className="h-4 w-4" />
    </button>
  </div>
</div>
        </div>
      </article>
    </div>
  );
};

export default Neumorphism;