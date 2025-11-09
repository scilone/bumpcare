import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const sizes = [192, 512];
const publicDir = './public';

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#FF6B9D');
  gradient.addColorStop(1, '#FFB6C1');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Draw emoji (simplified - just a circle for now)
  ctx.fillStyle = 'white';
  ctx.font = `${size * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🤰', size / 2, size / 2);
  
  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(publicDir, `pwa-${size}x${size}.png`), buffer);
  console.log(`Generated pwa-${size}x${size}.png`);
});

// Also create apple-touch-icon
const appleSize = 180;
const canvas = createCanvas(appleSize, appleSize);
const ctx = canvas.getContext('2d');

const gradient = ctx.createLinearGradient(0, 0, appleSize, appleSize);
gradient.addColorStop(0, '#FF6B9D');
gradient.addColorStop(1, '#FFB6C1');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, appleSize, appleSize);

ctx.fillStyle = 'white';
ctx.font = `${appleSize * 0.6}px Arial`;
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('🤰', appleSize / 2, appleSize / 2);

const buffer = canvas.toBuffer('image/png');
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), buffer);
console.log('Generated apple-touch-icon.png');

console.log('All icons generated successfully!');
