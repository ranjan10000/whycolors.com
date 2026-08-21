import React, { useState, useCallback, useMemo } from 'react';
import { Copy, Download, Check, X } from 'lucide-react';

interface GradientBuilderProps {
  color?: string;
  onCopy: (text: string) => Promise<void> | void;
  onShowToast: (message: string) => void;
}

interface GradientConfig {
  startColor: string;
  endColor: string;
  direction: string;
  angle: number;
  gradientType: 'linear' | 'radial';
  stop1: number;
  stop2: number;
}

const GradientBuilder: React.FC<GradientBuilderProps> = ({ 
  color = '#FF5A36', 
  onCopy, 
  onShowToast 
}) => {
  // Generate a complementary end color based on the start color
  const getComplementaryColor = useCallback((hex: string) => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    
    // Simple complementary: flip to opposite side of color wheel
    const compR = 255 - r;
    const compG = 255 - g;
    const compB = 255 - b;
    
    return `#${compR.toString(16).padStart(2, '0')}${compG.toString(16).padStart(2, '0')}${compB.toString(16).padStart(2, '0')}`;
  }, []);

  const [config, setConfig] = useState<GradientConfig>({
    startColor: color,
    endColor: getComplementaryColor(color),
    direction: 'to right',
    angle: 135,
    gradientType: 'linear',
    stop1: 0,
    stop2: 100,
  });
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Update start color when prop changes
  React.useEffect(() => {
    if (color && color !== config.startColor) {
      setConfig(prev => ({
        ...prev,
        startColor: color,
        endColor: getComplementaryColor(color),
      }));
    }
  }, [color, config.startColor, getComplementaryColor]);

  // Generate gradient CSS
  const generateGradientCSS = useCallback(() => {
    const { startColor, endColor, direction, angle, gradientType, stop1, stop2 } = config;
    
    if (gradientType === 'radial') {
      return `radial-gradient(circle at center, ${startColor} ${stop1}%, ${endColor} ${stop2}%)`;
    }
    
    // Linear gradient
    let dir = direction;
    if (direction === 'custom') {
      dir = `${angle}deg`;
    }
    return `linear-gradient(${dir}, ${startColor} ${stop1}%, ${endColor} ${stop2}%)`;
  }, [config]);

  // Generate CSS for display
  const gradientCSS = useMemo(() => {
    return generateGradientCSS();
  }, [generateGradientCSS]);

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

  const handleDownload = useCallback(() => {
    const blob = new Blob(
      [`.gradient {\n  background: ${gradientCSS};\n}\n`],
      { type: "text/css" }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gradient.css";
    link.click();
    URL.revokeObjectURL(url);
    if (onShowToast) {
      onShowToast("CSS downloaded!");
    } else {
      showToast("CSS downloaded!", 'success');
    }
  }, [gradientCSS, onShowToast, showToast]);

  // Update config helper
  const updateConfig = useCallback((key: keyof GradientConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  // Color picker component
  const ColorPicker = useCallback(({ 
    id, label, value, onChange 
  }: { 
    id: string; 
    label: string; 
    value: string; 
    onChange: (val: string) => void;
  }) => (
    <div>
      <label htmlFor={id} className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold">
        {label}
      </label>
      <div className="flex items-center gap-2 sm:gap-3 rounded-xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-1.5 sm:p-2">
        <input
          id={id}
          className="h-8 w-8 sm:h-10 sm:w-10 cursor-pointer rounded-lg border-0"
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="font-mono text-xs sm:text-sm flex-1">{value}</span>
        <button
          className="px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold bg-purple-500 text-white hover:bg-purple-600 transition-colors"
          onClick={() => {
            const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
            onChange(randomColor);
            // If changing start color, also update end color
            if (id === 'gradient-start') {
              const newEndColor = getComplementaryColor(randomColor);
              // We need to update end color separately
              setTimeout(() => {
                setConfig(prev => ({
                  ...prev,
                  endColor: newEndColor
                }));
              }, 0);
            }
          }}
        >
          Random
        </button>
      </div>
    </div>
  ), [getComplementaryColor]);

  // Range input component - Only Thumb Changed
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

  // Direction selector
  const DirectionButton = useCallback(({ 
    label, value, isActive, onClick 
  }: { 
    label: string; 
    value: string; 
    isActive: boolean; 
    onClick: () => void;
  }) => (
    <button
      className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold capitalize transition-all ${
        isActive
          ? 'bg-purple-500 text-white shadow-lg scale-95'
          : 'bg-purple-100 dark:bg-purple-900/30 text-[#686b74] dark:text-[#a8abb4] hover:bg-purple-200 dark:hover:bg-purple-800/40'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  ), []);

  // Reset to main color
  const resetToMainColor = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      startColor: color,
      endColor: getComplementaryColor(color),
    }));
    if (onShowToast) {
      onShowToast('Reset to main color!');
    } else {
      showToast('Reset to main color!', 'success');
    }
  }, [color, getComplementaryColor, onShowToast, showToast]);

  return (
    <div className="relative w-full">
      {/* Toast Notification */}
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

      <section id="gradient" className="mx-auto mt-8 sm:mt-16 max-w-7xl  sm:px-0">
        <div className="glass rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 bg-white/76 dark:bg-[#191a1e]/76 border border-[#101114]/9 dark:border-white/11 shadow-[0_24px_64px_rgba(19,20,24,0.09)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-[18px]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.16em] text-[#686b74] dark:text-[#a8abb4]">
                Gradient
              </p>
              <h2 className="mt-1 sm:mt-2 font-['Fraunces',serif] text-xl sm:text-2xl font-bold tracking-[-0.045em]">
                Build gradients
              </h2>
            </div>
            <button
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-purple-500 text-white hover:bg-purple-600 transition-all hover:-translate-y-0.5 shadow-lg"
              onClick={resetToMainColor}
            >
              Reset to Main Color
            </button>
          </div>

          <div className="mt-4 sm:mt-7 grid gap-4 sm:gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Preview */}
            <div
              className="min-h-[180px] sm:min-h-[220px] lg:min-h-[260px] rounded-2xl sm:rounded-3xl shadow-inner transition-all duration-300"
              style={{ background: gradientCSS }}
            />

            {/* Controls */}
            <div className="flex flex-col justify-between gap-4 sm:gap-6">
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {/* Start Color */}
                <ColorPicker
                  id="gradient-start"
                  label="Start Color"
                  value={config.startColor}
                  onChange={(val) => updateConfig('startColor', val)}
                />

                {/* End Color */}
                <ColorPicker
                  id="gradient-end"
                  label="End Color"
                  value={config.endColor}
                  onChange={(val) => updateConfig('endColor', val)}
                />

                {/* Gradient Type */}
                <div>
                  <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold">
                    Gradient Type
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    <DirectionButton
                      label="Linear"
                      value="linear"
                      isActive={config.gradientType === 'linear'}
                      onClick={() => updateConfig('gradientType', 'linear')}
                    />
                    <DirectionButton
                      label="Radial"
                      value="radial"
                      isActive={config.gradientType === 'radial'}
                      onClick={() => updateConfig('gradientType', 'radial')}
                    />
                  </div>
                </div>

                {/* Direction - Only for linear gradient */}
                {config.gradientType === 'linear' && (
                  <div>
                    <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold">
                      Direction
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                      {['to right', 'to bottom right', 'to bottom', 'to left', 'to top left', 'to top'].map((dir) => (
                        <DirectionButton
                          key={dir}
                          label={dir.replace('to ', '')}
                          value={dir}
                          isActive={config.direction === dir}
                          onClick={() => {
                            updateConfig('direction', dir);
                            updateConfig('angle', 135);
                          }}
                        />
                      ))}
                      <DirectionButton
                        label="Custom"
                        value="custom"
                        isActive={config.direction === 'custom'}
                        onClick={() => updateConfig('direction', 'custom')}
                      />
                    </div>
                  </div>
                )}

                {/* Custom Angle - Only for custom direction */}
                {config.direction === 'custom' && config.gradientType === 'linear' && (
                  <RangeInput
                    id="gradient-angle"
                    label="Angle"
                    value={config.angle}
                    min={0}
                    max={360}
                    unit="°"
                    onChange={(val) => updateConfig('angle', val)}
                  />
                )}

                {/* Color Stops */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <RangeInput
                    id="gradient-stop1"
                    label="Stop 1"
                    value={config.stop1}
                    min={0}
                    max={100}
                    unit="%"
                    onChange={(val) => updateConfig('stop1', val)}
                  />
                  <RangeInput
                    id="gradient-stop2"
                    label="Stop 2"
                    value={config.stop2}
                    min={0}
                    max={100}
                    unit="%"
                    onChange={(val) => updateConfig('stop2', val)}
                  />
                </div>
              </div>

              {/* CSS Display */}
              <div className="rounded-xl sm:rounded-2xl border border-[#101114]/9 dark:border-white/11 bg-[rgba(127,127,127,0.08)] p-2 sm:p-3">
                <p className="mb-1 sm:mb-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.12em] text-[#686b74] dark:text-[#a8abb4]">
                  CSS
                </p>
                <div className="flex items-center gap-2">
                  <code className="min-w-0 flex-1 break-all text-[10px] sm:text-xs font-mono leading-relaxed">
                    {gradientCSS}
                  </code>
                  <button
                    className="rounded-lg p-1.5 sm:p-2 hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0"
                    type="button"
                    onClick={() => handleCopy(gradientCSS)}
                    aria-label="Copy gradient CSS"
                  >
                    <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </div>

              {/* Download Button */}
              <button
                className="inline-flex min-h-10 sm:min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-purple-500 px-4 sm:px-5 py-2 sm:py-3 text-sm sm:text-base font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg dark:bg-purple-600 active:scale-95"
                type="button"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
                Download CSS
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GradientBuilder;