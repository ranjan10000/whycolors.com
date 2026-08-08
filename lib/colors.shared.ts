// lib/colors.shared.ts
// This file works in both server and client (no Node.js dependencies)

export function generateHexColor(r: number, g: number, b: number): string {
  return `${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return `#${generateHexColor(r, g, b)}`;
}

export function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace(/^#/, '');
  if (!/^[a-fA-F0-9]{6}$/.test(clean)) return null;
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16)
  ];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

export function adjustBrightness(r: number, g: number, b: number, amount: number): string {
  const newR = Math.max(0, Math.min(255, r + amount));
  const newG = Math.max(0, Math.min(255, g + amount));
  const newB = Math.max(0, Math.min(255, b + amount));
  return generateHexColor(newR, newG, newB);
}

export function generateRandomColor(): string {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return generateHexColor(r, g, b);
}

export function getNamedColors(): string[] {
  return [
    'FF0000', '00FF00', '0000FF', 'FFFF00', 'FF00FF', '00FFFF',
    '000000', 'FFFFFF', 'C0C0C0', '808080', '800000', '808000',
    '008000', '800080', '008080', '000080', 'FFA500', 'FFC0CB',
    'FFD700', 'A52A2A', '8B0000', '556B2F', 'FF8C00', '9932CC',
    '8FBC8F', '8B4513', '2E8B57', 'DAA520', 'D2691E', 'B22222',
    'CD853F', '6B8E23', '4682B4', 'D2B48C', 'D8BFD8', 'FF6347',
    '40E0D0', 'EE82EE', 'F5DEB3', 'F5F5DC', 'F5F5F5', 'FFDAB9',
    'FFE4B5', 'FFEBCD', 'FFF0F5', 'FFF5EE', 'FFF8DC', 'FFFACD',
    'FFFAF0', 'FFFDF5', 'FFFFF0', 'FDF5E6', 'FAF0E6', 'FAEBD7',
    'FFDEAD', 'F0E68C', 'BDB76B', 'B8860B', 'DEB887', 'FAFAD2',
    'FFEFD5', 'FFE4E1', 'E6E6FA', 'E0FFFF', 'F0FFFF', 'F5FFFA',
    'F0FFF0', 'F8F8FF', 'FFFAFA'
  ];
}

export function getBrandColors(): string[] {
  return [
    '4285F4', 'EA4335', '34A853', 'FBBC05',
    '1DA1F2', '4267B2', 'E4405F',
    '0A66C2', '0077B5', 'FF0000',
    '0066CC', '0099FF', 'CC0000',
    '00BFFF', '32CD32', 'FF4500',
    '8B008B', 'FF1493', '00CED1',
    'D70101', '2B7877', '003A85',
    'FF8F0D', '8F0DFF', 'E5F1FF',
    'FFF3E5', 'DAC6EC'
  ];
}

export function getColorFamilies(): string[] {
  return [
    'red', 'crimson', 'rose', 'pink', 'coral', 'orange', 'amber',
    'gold', 'yellow', 'lime', 'green', 'emerald', 'mint', 'teal',
    'cyan', 'sky', 'blue', 'indigo', 'navy', 'purple', 'violet',
    'lavender', 'fuchsia', 'magenta', 'plum', 'maroon', 'brown',
    'copper', 'bronze', 'olive', 'sage', 'forest', 'ocean', 'sunset',
    'twilight', 'charcoal', 'ivory', 'silver', 'slate', 'steel',
    'mustard', 'burgundy', 'peach', 'terracotta', 'mauve', 'periwinkle',
    'chocolate', 'cinnamon', 'sand', 'cream'
  ];
}

export function generateAllColors(count: number = 15000): string[] {
  const colors: Set<string> = new Set();
  const safeAdd = (color: string) => {
    if (/^[a-fA-F0-9]{6}$/.test(color)) {
      colors.add(color.toLowerCase());
    }
  };

  console.log(`🔄 Generating ${count} colors...`);

  // 1. All 3-digit hex combinations (4,096 colors)
  const chars = '0123456789abcdef';
  for (let r of chars) {
    for (let g of chars) {
      for (let b of chars) {
        safeAdd(`${r}${r}${g}${g}${b}${b}`);
      }
    }
  }

  // 2. Named CSS colors with variations
  const namedColors = getNamedColors();
  for (const color of namedColors) {
    safeAdd(color);
    const rgb = hexToRgb(color);
    if (rgb) {
      const [r, g, b] = rgb;
      for (let i = 1; i <= 6; i++) {
        safeAdd(adjustBrightness(r, g, b, i * 12));
        safeAdd(adjustBrightness(r, g, b, -i * 12));
      }
    }
  }

  // 3. Extended color wheel (every 5 degrees)
  for (let i = 0; i < 360; i += 5) {
    const rgb1 = hslToRgb(i, 90, 50);
    safeAdd(generateHexColor(rgb1[0], rgb1[1], rgb1[2]));
    const rgb2 = hslToRgb(i, 70, 60);
    safeAdd(generateHexColor(rgb2[0], rgb2[1], rgb2[2]));
    const rgb3 = hslToRgb(i, 50, 70);
    safeAdd(generateHexColor(rgb3[0], rgb3[1], rgb3[2]));
    const rgb4 = hslToRgb(i, 30, 40);
    safeAdd(generateHexColor(rgb4[0], rgb4[1], rgb4[2]));
    const rgb5 = hslToRgb(i, 80, 30);
    safeAdd(generateHexColor(rgb5[0], rgb5[1], rgb5[2]));
  }

  // 4. Brand colors with variations
  const brandColors = getBrandColors();
  for (const color of brandColors) {
    safeAdd(color);
    const rgb = hexToRgb(color);
    if (rgb) {
      const [r, g, b] = rgb;
      for (let i = 1; i <= 4; i++) {
        safeAdd(adjustBrightness(r, g, b, i * 15));
        safeAdd(adjustBrightness(r, g, b, -i * 15));
      }
    }
  }

  // 5. Color families with multiple variations
  const families = getColorFamilies();
  for (let i = 0; i < families.length; i++) {
    const hue = (i * 360 / families.length) % 360;
    for (let sat = 30; sat <= 100; sat += 10) {
      for (let light = 20; light <= 80; light += 10) {
        const rgb = hslToRgb(hue, sat, light);
        safeAdd(generateHexColor(rgb[0], rgb[1], rgb[2]));
      }
    }
  }

  // 6. High-contrast colors
  for (let i = 0; i < 500; i++) {
    const r = Math.random() > 0.5 ? 255 : 0;
    const g = Math.random() > 0.5 ? 255 : 0;
    const b = Math.random() > 0.5 ? 255 : 0;
    safeAdd(generateHexColor(r, g, b));
  }

  // 7. Random colors to reach target
  let attempts = 0;
  while (colors.size < count && attempts < count * 3) {
    safeAdd(generateRandomColor());
    attempts++;
  }

  const result = Array.from(colors).slice(0, count);
  console.log(`✅ Generated ${result.length} unique colors`);
  return result;
}

// ============ CACHED COLOR GENERATION ============

let cachedColors: string[] | null = null;

export function getCachedColors(count: number = 15000): string[] {
  if (!cachedColors) {
    cachedColors = generateAllColors(count);
  }
  return cachedColors;
}

// ============ GET COLOR NAMES ============

export function generateColorName(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex.toUpperCase();
  
  const [r, g, b] = rgb;
  
  // Helper to detect color family
  let baseName = '';
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  if (diff < 30) {
    if (max < 50) return 'black';
    if (max > 200) return 'white';
    return 'gray';
  }
  
  // Determine dominant color
  if (r > g && r > b) baseName = 'red';
  else if (g > r && g > b) baseName = 'green';
  else if (b > r && b > g) baseName = 'blue';
  else if (r > b && g > b) baseName = 'yellow';
  else if (r > g && b > g) baseName = 'purple';
  else if (g > r && b > r) baseName = 'cyan';
  else baseName = 'mixed';
  
  // Add modifier
  const avg = (r + g + b) / 3;
  const saturation = diff / 255;
  
  let modifier = '';
  if (avg < 85) modifier = 'dark-';
  else if (avg > 170) modifier = 'light-';
  else if (saturation > 0.7) modifier = 'vibrant-';
  else if (saturation < 0.3 && avg > 150) modifier = 'pastel-';
  else if (saturation < 0.3 && avg < 150) modifier = 'muted-';
  
  return `${modifier}${baseName}`;
}