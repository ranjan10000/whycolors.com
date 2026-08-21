'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Info } from 'lucide-react';

interface ColorDynamicFAQProps {
  hex: string;
  colorName: string;
  isDark?: boolean;
}

export default function ColorDynamicFAQ({ hex, colorName, isDark = false }: ColorDynamicFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Helper functions
  const hexToRgb = (hex: string) => {
    const clean = hex.replace('#', '');
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
  };

  const hexToHsl = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === rNorm) h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
      else if (max === gNorm) h = ((bNorm - rNorm) / d + 2) / 6;
      else if (max === bNorm) h = ((rNorm - gNorm) / d + 4) / 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const getContrastColor = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  };

  const getComplementaryColor = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const compR = (255 - r).toString(16).padStart(2, '0');
    const compG = (255 - g).toString(16).padStart(2, '0');
    const compB = (255 - b).toString(16).padStart(2, '0');
    return `#${compR}${compG}${compB}`.toUpperCase();
  };

  const getAnalogousColors = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const hsl = hexToHsl(hex);
    const hueShift = 30;
    const shiftR = Math.min(255, Math.max(0, r + hueShift));
    const shiftG = Math.min(255, Math.max(0, g + hueShift));
    const shiftB = Math.min(255, Math.max(0, b + hueShift));
    const shiftR2 = Math.min(255, Math.max(0, r - hueShift));
    const shiftG2 = Math.min(255, Math.max(0, g - hueShift));
    const shiftB2 = Math.min(255, Math.max(0, b - hueShift));
    return {
      first: `#${shiftR.toString(16).padStart(2, '0')}${shiftG.toString(16).padStart(2, '0')}${shiftB.toString(16).padStart(2, '0')}`.toUpperCase(),
      second: `#${shiftR2.toString(16).padStart(2, '0')}${shiftG2.toString(16).padStart(2, '0')}${shiftB2.toString(16).padStart(2, '0')}`.toUpperCase(),
    };
  };

  // ✅ Generate dynamic FAQ based on color
  const generateFAQs = useMemo(() => {
    const fullHex = `#${hex.toUpperCase()}`;
    const rgb = hexToRgb(hex);
    const hsl = hexToHsl(hex);
    const contrastColor = getContrastColor(hex);
    const complement = getComplementaryColor(hex);
    const analogous = getAnalogousColors(hex);
    
    // Determine color properties
    const brightness = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    const isLight = brightness > 0.6;
    const isDarkColor = brightness < 0.3;
    const isWarm = hsl.h >= 0 && hsl.h < 60 || hsl.h >= 300 && hsl.h <= 360;
    const isCool = hsl.h >= 180 && hsl.h < 300;
    const isVibrant = hsl.s > 70;
    const isMuted = hsl.s < 30;
    
    // Color psychology based on hue
    let psychology = '';
    const h = hsl.h;
    if (h >= 0 && h < 30) psychology = 'Red - Energy, passion, power, excitement, urgency, and action.';
    else if (h >= 30 && h < 60) psychology = 'Orange - Enthusiasm, warmth, adventure, success, and creativity.';
    else if (h >= 60 && h < 90) psychology = 'Yellow - Optimism, happiness, energy, creativity, and attention-grabbing.';
    else if (h >= 90 && h < 150) psychology = 'Green - Nature, growth, harmony, renewal, balance, and stability.';
    else if (h >= 150 && h < 210) psychology = 'Teal/Cyan - Calm, clarity, sophistication, and emotional balance.';
    else if (h >= 210 && h < 270) psychology = 'Blue - Trust, calmness, professionalism, serenity, and reliability.';
    else if (h >= 270 && h < 330) psychology = 'Purple - Luxury, creativity, mystery, spirituality, and wisdom.';
    else psychology = 'Pink/Magenta - Romance, compassion, creativity, and playfulness.';

    // Common uses based on color properties
    let commonUses = '';
    if (isWarm) {
      commonUses = 'Warm colors like this are often used to create energy, excitement, and urgency. They are great for call-to-action buttons, branding for energetic brands, food and restaurant designs, and creating a sense of warmth and comfort.';
    } else if (isCool) {
      commonUses = 'Cool colors like this are often used to create calm, trust, and professionalism. They are ideal for corporate branding, tech companies, healthcare, finance, and creating a sense of serenity and reliability.';
    } else {
      commonUses = 'This neutral color is versatile and works well as a background, typography, or for creating a sophisticated, modern look. It provides balance and allows other colors to shine.';
    }

    // Accessibility information
    const contrastWhite = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    const whiteContrast = Math.round((contrastWhite + 0.05) / 0.05);
    const blackContrast = Math.round((1 - contrastWhite + 0.05) / 0.05);
    const bestTextColor = contrastWhite > 0.5 ? 'dark' : 'light';

    return [
      {
        id: 'basic',
        question: `What is ${fullHex} color code?`,
        answer: `${fullHex} is ${colorName} color with RGB values (${rgb.r}, ${rgb.g}, ${rgb.b}) and HSL values (${hsl.h}°, ${hsl.s}%, ${hsl.l}%). It is a ${isWarm ? 'warm' : isCool ? 'cool' : 'neutral'} color that appears ${isLight ? 'light' : isDarkColor ? 'dark' : 'medium'} in brightness and is ${isVibrant ? 'highly vibrant' : isMuted ? 'muted and subtle' : 'moderately saturated'}.`
      },
      {
        id: 'complementary',
        question: `What colors go well with ${fullHex}?`,
        answer: `The complementary color of ${fullHex} is ${complement} - these colors create high contrast and work well together. Analogous colors include ${analogous.first} and ${analogous.second} for harmonious combinations. For a complete palette, use tints (lighter versions) and shades (darker versions) of ${fullHex}.`
      },
      {
        id: 'psychology',
        question: `What is the psychology of ${colorName} (${fullHex})?`,
        answer: `${colorName} (${fullHex}) represents: ${psychology} This color is often used in ${isWarm ? 'energetic and passionate' : isCool ? 'calming and professional' : 'neutral and balanced'} contexts.`
      },
      {
        id: 'use',
        question: `How should I use ${fullHex} in design?`,
        answer: commonUses
      },
      {
        id: 'accessibility',
        question: `Is ${fullHex} accessible for text?`,
        answer: `For ${fullHex}, ${bestTextColor} text provides the best readability. Use ${bestTextColor === 'light' ? '#FFFFFF (white)' : '#000000 (black)'} text on this background for optimal contrast. The contrast ratio is approximately ${bestTextColor === 'light' ? whiteContrast : blackContrast}:1, which ${(bestTextColor === 'light' ? whiteContrast : blackContrast) > 4.5 ? 'meets WCAG AA standards for accessibility' : 'may need adjustment for better accessibility'}.`
      },
      {
        id: 'tint-shade',
        question: `How to create shades and tints of ${fullHex}?`,
        answer: `To create tints of ${fullHex}, add white - this creates lighter versions. To create shades, add black - this creates darker versions. You can find all shades and tints of ${fullHex} in the "Shades & Tints" section of this page. This helps create a cohesive color palette.`
      },
      {
        id: 'harmony',
        question: `What color harmonies work with ${fullHex}?`,
        answer: `${colorName} (${fullHex}) works well in:
          • Monochromatic: Using different shades and tints of ${fullHex}
          • Complementary: Pairing with ${complement}
          • Analogous: Combining with ${analogous.first} and ${analogous.second}
          • Triadic: Using colors at 120° intervals on the color wheel
          Check the "Color Harmonies" section for visual examples.`
      },
      {
        id: 'format',
        question: `What are the different color formats for ${fullHex}?`,
        answer: `${colorName} (${fullHex}) can be represented as:
          • HEX: ${fullHex}
          • RGB: rgb(${rgb.r}, ${rgb.g}, ${rgb.b})
          • HSL: hsl(${hsl.h}°, ${hsl.s}%, ${hsl.l}%)
          • CMYK: Converted values for print
          Each format is useful for different applications - HEX for web, RGB for digital displays, HSL for intuitive color picking, and CMYK for print design.`
      }
    ];
  }, [hex, colorName]);

  return (
    <section 
      className={`border rounded-2xl p-6 shadow-sm ${
        isDark ? 'bg-[#131322]/80 border-white/10' : 'bg-white/90 border-gray-200'
      }`}
      aria-labelledby="faq-title"
    >
      <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-gray-200 dark:border-white/10">
        <div className={`p-2 border rounded-lg ${
          isDark ? 'bg-[#8b5cf6]/20 border-[#8b5cf6]/30 text-[#a78bfa]' : 'bg-[#7c3aed]/10 border-[#7c3aed]/20 text-[#7c3aed]'
        }`} aria-hidden="true">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 id="faq-title" className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Color FAQ
          </h2>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Frequently Asked Questions about {colorName} ({`#${hex.toUpperCase()}`})
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {generateFAQs.map((item, index) => (
          <div
            key={item.id}
            className={`border rounded-xl transition-all duration-200 ${
              isDark ? 'border-white/10 hover:border-white/20' : 'border-gray-200 hover:border-gray-300'
            } ${openIndex === index ? 'shadow-md' : ''}`}
          >
            <button
              onClick={() => toggleFAQ(index)}
              className={`w-full flex items-center justify-between p-4 text-left transition-colors rounded-xl ${
                openIndex === index 
                  ? isDark ? 'bg-white/5' : 'bg-gray-50'
                  : 'hover:bg-white/5'
              }`}
              aria-expanded={openIndex === index}
              aria-controls={`faq-answer-${index}`}
            >
              <span className={`font-medium text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {item.question}
              </span>
              {openIndex === index ? (
                <ChevronUp className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} aria-hidden="true" />
              ) : (
                <ChevronDown className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} aria-hidden="true" />
              )}
            </button>
            
            <div
              id={`faq-answer-${index}`}
              role="region"
              aria-labelledby={`faq-question-${index}`}
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className={`px-4 pb-4 text-sm leading-relaxed ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {item.answer}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}