// Generates 7,800+ unique colors with proper validation

export { getColors as getAllColors } from './color-cache';

// Helper functions
function generateRandomValidColor(): string {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function generateHighContrastColor(): string {
  const r = Math.random() > 0.5 ? 255 : 0;
  const g = Math.random() > 0.5 ? 255 : 0;
  const b = Math.random() > 0.5 ? 255 : 0;
  return `${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function generateAccessibleColor(): string {
  for (let i = 0; i < 100; i++) {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const rgb = [r, g, b];
    if (hasGoodContrast(rgb)) {
      return `${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
  }
  return '808080'; // fallback to gray
}

function hasGoodContrast(rgb: number[]): boolean {
  const [r, g, b] = rgb;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.3 && luminance < 0.7;
}

function generateHarmonies(baseColor: string): string[] {
  const rgb = parseHex(baseColor);
  if (!rgb) return [];
  const [r, g, b] = rgb;
  const hsl = rgbToHslArray(r, g, b);
  if (!hsl) return [];
  const [h, s, l] = hsl;
  const harmonies: string[] = [];
  
  const hues = [
    (h + 180) % 360,
    (h + 120) % 360,
    (h + 240) % 360,
    (h + 90) % 360,
    (h + 270) % 360
  ];
  
  for (const hue of hues) {
    harmonies.push(hslToHex(hue, s, l));
  }
  
  return harmonies;
}

function getPopularBaseColors(): string[] {
  return ['FF0000', '00FF00', '0000FF', 'FFFF00', 'FF00FF', '00FFFF'];
}

function getNamedColors(): string[] {
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

function getMaterialColors(): string[] {
  return [
    'F44336', 'E91E63', '9C27B0', '673AB7', '3F51B5',
    '2196F3', '03A9F4', '00BCD4', '009688', '4CAF50',
    '8BC34A', 'CDDC39', 'FFEB3B', 'FFC107', 'FF9800',
    'FF5722', '795548', '9E9E9E', '607D8B'
  ];
}

function getBrandColors(): string[] {
  return [
    '4285F4', 'EA4335', '34A853', 'FBBC05',
    '1DA1F2', '4267B2', 'E4405F',
    '0A66C2', '0077B5', 'FF0000',
    '0066CC', '0099FF', 'CC0000',
    '00BFFF', '32CD32', 'FF4500',
    '8B008B', 'FF1493', '00CED1'
  ];
}

function getMaterialShade(r: number, g: number, b: number, shade: number): string {
  const factor = 1 - (shade / 10);
  const newR = Math.round(r * factor);
  const newG = Math.round(g * factor);
  const newB = Math.round(b * factor);
  return `${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

function parseHex(hex: string): [number, number, number] | null {
  if (!/^[a-fA-F0-9]{6}$/.test(hex)) return null;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return [r, g, b];
}

function adjustBrightness(r: number, g: number, b: number, amount: number): string {
  const newR = Math.max(0, Math.min(255, r + amount));
  const newG = Math.max(0, Math.min(255, g + amount));
  const newB = Math.max(0, Math.min(255, b + amount));
  return `${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

function adjustHue(r: number, g: number, b: number, degrees: number): string {
  const hsl = rgbToHslArray(r, g, b);
  if (!hsl) return adjustBrightness(r, g, b, 0);
  const [h, s, l] = hsl;
  const newH = (h + degrees) % 360;
  return hslToHex(newH, s, l);
}

function rgbToHslArray(r: number, g: number, b: number): [number, number, number] | null {
  const r1 = r / 255;
  const g1 = g / 255;
  const b1 = b / 255;
  const max = Math.max(r1, g1, b1);
  const min = Math.min(r1, g1, b1);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r1) h = ((g1 - b1) / d + (g1 < b1 ? 6 : 0)) / 6;
    else if (max === g1) h = ((b1 - r1) / d + 2) / 6;
    else h = ((r1 - g1) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l / 100 - 1)) * s / 100;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l / 100 - c / 2;
  
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  
  const rr = Math.round((r + m) * 255);
  const gg = Math.round((g + m) * 255);
  const bb = Math.round((b + m) * 255);
  return `${rr.toString(16).padStart(2, '0')}${gg.toString(16).padStart(2, '0')}${bb.toString(16).padStart(2, '0')}`;
}