'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

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

  // ============ CORE COLOR CONVERSIONS ============
  
  const hexToRgb = (hex: string) => {
    const clean = hex.replace('#', '');
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`.toUpperCase();
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

  const hslToRgb = (h: number, s: number, l: number) => {
    const sNorm = s / 100;
    const lNorm = l / 100;
    const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = lNorm - c / 2;
    let r = 0, g = 0, b = 0;
    
    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  };

  // ============ WCAG Relative Luminance ============
  const getRelativeLuminance = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    
    const toLinear = (c: number) => {
      const normalized = c / 255;
      return normalized <= 0.03928 
        ? normalized / 12.92 
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    };
    
    const rLin = toLinear(r);
    const gLin = toLinear(g);
    const bLin = toLinear(b);
    
    return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
  };

  const getContrastRatio = (hex1: string, hex2: string) => {
    const l1 = getRelativeLuminance(hex1);
    const l2 = getRelativeLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  // ============ RGB → CMYK ============
  const rgbToCmyk = (r: number, g: number, b: number) => {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    
    const k = 1 - Math.max(rNorm, gNorm, bNorm);
    
    if (k === 1) {
      return { c: 0, m: 0, y: 0, k: 100 };
    }
    
    const c = (1 - rNorm - k) / (1 - k);
    const m = (1 - gNorm - k) / (1 - k);
    const y = (1 - bNorm - k) / (1 - k);
    
    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    };
  };

  // ============ Analogous colors using HSL ============
  const getAnalogousColors = (hex: string) => {
    const hsl = hexToHsl(hex);
    const hue1 = (hsl.h + 30) % 360;
    const hue2 = (hsl.h - 30 + 360) % 360;
    
    const rgb1 = hslToRgb(hue1, hsl.s, hsl.l);
    const rgb2 = hslToRgb(hue2, hsl.s, hsl.l);
    
    return {
      first: rgbToHex(rgb1.r, rgb1.g, rgb1.b),
      second: rgbToHex(rgb2.r, rgb2.g, rgb2.b)
    };
  };

  // ============ Web-Safe Check ============
  const getWebSafeColor = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const webSafeValues = [0x00, 0x33, 0x66, 0x99, 0xCC, 0xFF];
    
    const nearest = (value: number) => {
      return webSafeValues.reduce((prev, curr) => 
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
    };
    
    const rSafe = nearest(r);
    const gSafe = nearest(g);
    const bSafe = nearest(b);
    
    return rgbToHex(rSafe, gSafe, bSafe);
  };

  const isWebSafe = (hex: string) => {
    const webSafe = getWebSafeColor(hex);
    return webSafe === `#${hex.toUpperCase()}`;
  };

  // ============ HSV Conversion ============
  const rgbToHsv = (r: number, g: number, b: number) => {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const d = max - min;
    
    let h = 0;
    if (d !== 0) {
      if (max === rNorm) h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
      else if (max === gNorm) h = ((bNorm - rNorm) / d + 2) / 6;
      else h = ((rNorm - gNorm) / d + 4) / 6;
    }
    
    const s = max === 0 ? 0 : d / max;
    const v = max;
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    };
  };

  // ============ Color Properties ============
  const getColorProperties = (hex: string) => {
    const rgb = hexToRgb(hex);
    const hsl = hexToHsl(hex);
    const luminance = getRelativeLuminance(hex);
    
    // Note: These are approximate categorizations, not official color standards
    const isLight = luminance > 0.5;
    const isDarkColor = luminance < 0.2;
    const isWarm = hsl.h >= 0 && hsl.h < 60 || hsl.h >= 300 && hsl.h <= 360;
    const isCool = hsl.h >= 180 && hsl.h < 300;
    const isVibrant = hsl.s > 70;
    const isMuted = hsl.s < 30;
    
    return { isLight, isDarkColor, isWarm, isCool, isVibrant, isMuted, luminance };
  };

  // ============ Psychology ============
  const getPsychology = (hue: number) => {
    if (hue >= 0 && hue < 30) return 'Red is commonly associated with energy, passion, power, excitement, urgency, and action.';
    if (hue >= 30 && hue < 60) return 'Orange is commonly associated with enthusiasm, warmth, adventure, success, and creativity.';
    if (hue >= 60 && hue < 90) return 'Yellow is commonly associated with optimism, happiness, energy, creativity, and attention-grabbing.';
    if (hue >= 90 && hue < 150) return 'Green is commonly associated with nature, growth, harmony, renewal, balance, and stability.';
    if (hue >= 150 && hue < 210) return 'Teal/Cyan is commonly associated with calm, clarity, sophistication, and emotional balance.';
    if (hue >= 210 && hue < 270) return 'Blue is commonly associated with trust, calmness, professionalism, serenity, and reliability.';
    if (hue >= 270 && hue < 330) return 'Purple is commonly associated with luxury, creativity, mystery, spirituality, and wisdom.';
    return 'Pink/Magenta is commonly associated with romance, compassion, creativity, and playfulness.';
  };

  // ============ Generate FAQs ============
  const fullHex = `#${hex.toUpperCase()}`;
  
  const generateFAQs = useMemo(() => {
    const rgb = hexToRgb(hex);
    const hsl = hexToHsl(hex);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const complement = rgbToHex(255 - rgb.r, 255 - rgb.g, 255 - rgb.b);
    const analogous = getAnalogousColors(hex);
    const webSafe = getWebSafeColor(hex);
    const isWebSafeColor = isWebSafe(hex);
    const properties = getColorProperties(hex);
    const psychology = getPsychology(hsl.h);
    
    const whiteContrast = getContrastRatio(hex, '#FFFFFF');
    const blackContrast = getContrastRatio(hex, '#000000');
    const bestTextColor = whiteContrast > blackContrast ? 'white' : 'black';
    const bestContrast = Math.max(whiteContrast, blackContrast);
    const otherContrast = Math.min(whiteContrast, blackContrast);
    
    const isAANormal = bestContrast >= 4.5;
    const isAALarge = bestContrast >= 3.0;
    const isAAANormal = bestContrast >= 7.0;
    const isAAALarge = bestContrast >= 4.5;

    let commonUses = '';
    if (properties.isWarm) {
      commonUses = `Warm colors like ${colorName} are often used to create energy, excitement, and urgency. They are great for call-to-action buttons, branding for energetic brands, food and restaurant designs, and creating a sense of warmth and comfort.`;
    } else if (properties.isCool) {
      commonUses = `Cool colors like ${colorName} are often used to create calm, trust, and professionalism. They are ideal for corporate branding, tech companies, healthcare, finance, and creating a sense of serenity and reliability.`;
    } else {
      commonUses = `This neutral color ${colorName} is versatile and works well as a background, typography, or for creating a sophisticated, modern look. It provides balance and allows other colors to shine.`;
    }

    const faqs = [
      {
        id: 'basic',
        question: `What is the color code for ${colorName}?`,
        answer: `${colorName} has the color code ${fullHex} with RGB values (${rgb.r}, ${rgb.g}, ${rgb.b}) and HSL values (${hsl.h}°, ${hsl.s}%, ${hsl.l}%). It is a ${properties.isWarm ? 'warm' : properties.isCool ? 'cool' : 'neutral'} color that appears ${properties.isLight ? 'light' : properties.isDarkColor ? 'dark' : 'medium'} in brightness and is ${properties.isVibrant ? 'highly vibrant' : properties.isMuted ? 'muted and subtle' : 'moderately saturated'}.`
      },
      {
        id: 'complementary',
        question: `What colors go well with ${colorName} (${fullHex})?`,
        answer: `The complementary color of ${colorName} is ${complement} - these colors create high contrast and work well together. Analogous colors include ${analogous.first} and ${analogous.second} for harmonious combinations. For a complete palette, use tints (lighter versions) and shades (darker versions) of ${colorName}.`
      },
      {
        id: 'psychology',
        question: `What is the psychology of ${colorName}?`,
        answer: `${psychology} ${colorName} is often used in ${properties.isWarm ? 'energetic and passionate' : properties.isCool ? 'calming and professional' : 'neutral and balanced'} contexts.`
      },
      {
        id: 'use',
        question: `How should I use ${colorName} in design?`,
        answer: commonUses
      },
      {
        id: 'accessibility',
        question: `Is ${colorName} (${fullHex}) accessible for text?`,
        answer: `For ${colorName}, ${bestTextColor} text provides better readability than ${bestTextColor === 'white' ? 'black' : 'white'} text (${bestContrast.toFixed(2)}:1 vs ${otherContrast.toFixed(2)}:1). Use ${bestTextColor === 'white' ? '#FFFFFF (white)' : '#000000 (black)'} text on this background for optimal contrast.

WCAG 2 contrast guidance:
• Normal text (AA): 4.5:1 required → ${isAANormal ? '✅ Passes' : '❌ Fails'} (${bestContrast.toFixed(2)}:1)
• Large text (AA): 3:1 required → ${isAALarge ? '✅ Passes' : '❌ Fails'} (${bestContrast.toFixed(2)}:1)
• Normal text (AAA): 7:1 required → ${isAAANormal ? '✅ Passes' : '❌ Fails'} (${bestContrast.toFixed(2)}:1)
• Large text (AAA): 4.5:1 required → ${isAAALarge ? '✅ Passes' : '❌ Fails'} (${bestContrast.toFixed(2)}:1)

${isAANormal ? `✅ ${colorName} meets WCAG AA standards for normal text, making it suitable for body text.` : isAALarge ? `⚠️ ${colorName} only meets WCAG AA standards for large text (18px+ or 14px bold+).` : `❌ ${colorName} does not meet WCAG standards for text. Consider using it only for non-text elements or with a darker/lighter variant.`}`
      },
      {
        id: 'tint-shade',
        question: `How to create shades and tints of ${colorName}?`,
        answer: `To create tints of ${colorName}, add white - this creates lighter versions. To create shades, add black - this creates darker versions. You can find all shades and tints of ${colorName} in the "Shades & Tints" section of this page. This helps create a cohesive color palette.`
      },
      {
        id: 'harmony',
        question: `What color harmonies work with ${colorName} (${fullHex})?`,
        answer: `${colorName} (${fullHex}) works well in:
• Monochromatic: Using different shades and tints of ${colorName}
• Complementary: Pairing with ${complement}
• Analogous: Combining with ${analogous.first} and ${analogous.second}
• Triadic: Using colors at 120° intervals on the color wheel
Check the "Color Harmonies" section for visual examples.`
      },
      {
        id: 'hex-format',
        question: `What is the HEX value of ${colorName}?`,
        answer: `The HEX value of ${colorName} is ${fullHex}. HEX (Hexadecimal) is a 6-digit combination of numbers and letters. It represents the red, green, and blue components of the color. This format is most commonly used in web design and CSS.`
      },
      {
        id: 'rgb-format',
        question: `What are the RGB values of ${colorName}?`,
        answer: `The RGB values of ${colorName} are rgb(${rgb.r}, ${rgb.g}, ${rgb.b}). RGB stands for Red, Green, and Blue. Each value ranges from 0 to 255, representing the intensity of each color component. This format is used for digital displays and screens.`
      },
      {
        id: 'hsl-format',
        question: `What are the HSL values of ${colorName}?`,
        answer: `The HSL values of ${colorName} are hsl(${hsl.h}°, ${hsl.s}%, ${hsl.l}%). HSL stands for Hue, Saturation, and Lightness. Hue represents the color (0-360°), Saturation represents color intensity (0-100%), and Lightness represents brightness (0-100%). This format is intuitive for color picking.`
      },
      {
        id: 'cmyk-format',
        question: `What are the CMYK values of ${colorName}?`,
        answer: `The CMYK values of ${colorName} are cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%). CMYK stands for Cyan, Magenta, Yellow, and Key (Black). These values range from 0-100% and are used for print design, as they represent the four ink colors used in printing.`
      },
      {
        id: 'hsv-format',
        question: `What are the HSV values of ${colorName}?`,
        answer: `The HSV (HSB) values of ${colorName} are hsv(${hsv.h}°, ${hsv.s}%, ${hsv.v}%). HSV stands for Hue, Saturation, and Value (or Brightness). This format is commonly used in image editing software like Photoshop. Hue is the color angle (0-360°), Saturation is color intensity (0-100%), and Value is brightness (0-100%).`
      },
      {
        id: 'websafe-format',
        question: `Is ${colorName} (${fullHex}) a web-safe color?`,
        answer: isWebSafeColor 
          ? `Yes! ${colorName} (${fullHex}) is a web-safe color. Web-safe colors are a palette of 216 colors that display consistently across different browsers and operating systems. They use RGB channel values from 00, 33, 66, 99, CC, FF.`
          : `No, ${colorName} (${fullHex}) is not a web-safe color. The nearest web-safe color is ${webSafe}. Web-safe colors use RGB channel values from 00, 33, 66, 99, CC, FF.`
      },
      {
        id: 'binary',
        question: `What is the binary representation of ${colorName} (${fullHex})?`,
        answer: `The binary representation of ${colorName} is ${rgb.r.toString(2).padStart(8, '0')} ${rgb.g.toString(2).padStart(8, '0')} ${rgb.b.toString(2).padStart(8, '0')}. Binary is the base-2 number system using only 0s and 1s. Computers use binary to represent all data, including colors, at the most fundamental level. Each 8-bit value corresponds to one color channel (R, G, or B).`
      }
    ];

    return faqs;
  }, [hex, colorName, fullHex]);

  return (
    <section 
      className={`border rounded-2xl p-4 shadow-sm ${
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
            Frequently Asked Questions about {colorName} ({fullHex})
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
              <span
                id={`faq-question-${index}`}
                className={`font-medium text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
              >
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
                openIndex === index ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className={`px-4 pb-4 text-sm leading-relaxed whitespace-pre-line ${
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