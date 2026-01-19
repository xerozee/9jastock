const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const maskableSizes = [192, 512];

const sourceIcon = path.join(__dirname, '../attached_assets/generated_images/9jastock_app_icon_design.png');

async function generateIcons() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');

  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  for (const size of sizes) {
    const pngFilename = `icon-${size}x${size}.png`;
    await sharp(sourceIcon)
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, pngFilename));
    
    console.log(`Generated ${pngFilename}`);
  }

  for (const size of maskableSizes) {
    const pngFilename = `icon-maskable-${size}x${size}.png`;
    const padding = Math.round(size * 0.1);
    const innerSize = size - (padding * 2);
    
    const resizedIcon = await sharp(sourceIcon)
      .resize(innerSize, innerSize)
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 0, g: 135, b: 81, alpha: 1 }
      }
    })
      .composite([{
        input: resizedIcon,
        top: padding,
        left: padding
      }])
      .png()
      .toFile(path.join(iconsDir, pngFilename));
    
    console.log(`Generated ${pngFilename}`);
  }

  const appleIconPath = path.join(__dirname, '..', 'public', 'apple-touch-icon.png');
  await sharp(sourceIcon)
    .resize(180, 180)
    .png()
    .toFile(appleIconPath);
  console.log('Generated apple-touch-icon.png');

  console.log('\nAll PNG icons generated successfully!');
}

generateIcons().catch(console.error);
