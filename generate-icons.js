import sharp from 'sharp';
import fs from 'fs';

const svgBuffer = fs.readFileSync('./public/icon.svg');

const sizes = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 512, name: 'icon-maskable-512.png' }, // Maskable version with safe zone
];

async function generateIcons() {
  for (const { size, name } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(`./public/icons/${name}`);
    console.log(`Generated ${name}`);
  }
  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
