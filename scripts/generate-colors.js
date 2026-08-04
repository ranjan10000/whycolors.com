// scripts/generate-colors.js
const fs = require('fs');
const path = require('path');

console.log('🎨 Pre-generating colors for build...');

// This will trigger the color generation during build
// The actual generation happens in lib/color-cache.ts

// Just ensure public directory exists
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('✅ Build script ready');