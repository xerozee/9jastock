const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];

const generateSVG = (size) => {
  const padding = size * 0.15;
  const innerSize = size - (padding * 2);
  const fontSize = size * 0.35;
  const strokeWidth = Math.max(2, size * 0.03);
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0a"/>
      <stop offset="100%" style="stop-color:#1a1a2e"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981"/>
      <stop offset="100%" style="stop-color:#059669"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#bg)"/>
  <text x="${size/2}" y="${size/2 + fontSize * 0.35}" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold" fill="url(#accent)" text-anchor="middle">9ja</text>
  <line x1="${padding}" y1="${size * 0.7}" x2="${size - padding}" y2="${size * 0.7}" stroke="#10b981" stroke-width="${strokeWidth}" stroke-linecap="round"/>
  <polyline points="${padding + innerSize * 0.1},${size * 0.65} ${padding + innerSize * 0.3},${size * 0.55} ${padding + innerSize * 0.5},${size * 0.62} ${padding + innerSize * 0.7},${size * 0.48} ${padding + innerSize * 0.9},${size * 0.58}" fill="none" stroke="#10b981" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
};

async function generateIcons() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  for (const size of sizes) {
    const svg = generateSVG(size);
    const svgBuffer = Buffer.from(svg);
    
    const pngFilename = `icon-${size}x${size}.png`;
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, pngFilename));
    
    console.log(`Generated ${pngFilename}`);
  }

  console.log('\\nAll PNG icons generated successfully!');
}

generateIcons().catch(console.error);
