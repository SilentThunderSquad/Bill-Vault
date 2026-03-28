import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, '../public');

// Images to optimize
const images = [
  'og-image.png',
  'icons/icon-512x512.png',
  'icons/icon-192x192.png',
  'icons/apple-touch-icon.png',
];

async function optimizeImage(imagePath) {
  const fullPath = path.join(publicDir, imagePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Skipping ${imagePath} - file not found`);
    return;
  }

  try {
    const originalSize = fs.statSync(fullPath).size;
    
    // Create WebP version (smaller, better quality)
    const webpPath = fullPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    await sharp(fullPath)
      .webp({ quality: 80, effort: 6 })
      .toFile(webpPath);
    
    const webpSize = fs.statSync(webpPath).size;
    
    // Optimize PNG (lossless)
    const tempPath = fullPath + '.tmp';
    await sharp(fullPath)
      .png({ 
        compressionLevel: 9,
        quality: 85,
        effort: 10
      })
      .toFile(tempPath);
    
    // Replace original with optimized version
    fs.renameSync(tempPath, fullPath);
    const optimizedSize = fs.statSync(fullPath).size;
    
    const pngSaved = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    const webpSaved = ((originalSize - webpSize) / originalSize * 100).toFixed(1);
    
    console.log(`✅ ${imagePath}`);
    console.log(`   PNG: ${(originalSize / 1024).toFixed(1)} KB → ${(optimizedSize / 1024).toFixed(1)} KB (-${pngSaved}%)`);
    console.log(`   WebP: ${(webpSize / 1024).toFixed(1)} KB (-${webpSaved}%)`);
    
  } catch (error) {
    console.error(`❌ Error optimizing ${imagePath}:`, error.message);
  }
}

async function optimizeAllImages() {
  console.log('🖼️  Starting image optimization...\n');
  
  for (const image of images) {
    await optimizeImage(image);
    console.log('');
  }
  
  console.log('✨ Image optimization complete!');
}

optimizeAllImages().catch(console.error);
