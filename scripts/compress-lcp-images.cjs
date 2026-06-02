const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const BASE = path.resolve(__dirname, '..');

// LCP hero images — compress aggressively from JPEG source
const images = [
  // gutter-cleaning BA slider (mobile: ~320px display, 2x = 640px)
  { src: 'photos 2/Empty Gutter.jpeg',             maxW: 640, quality: 65 },
  { src: 'components/Photos/IMG_8855.jpeg',         maxW: 640, quality: 65 },
  // pressure-washing BA slider
  { src: 'components/Photos/IMG_1933.jpeg',         maxW: 640, quality: 65 },
  { src: 'components/Photos/IMG_8207.jpeg',         maxW: 640, quality: 65 },
  // window-cleaning hero img (mobile: full-width, 720px at 2x)
  { src: 'photos 2/Rye Windows.jpeg',              maxW: 800, quality: 70 },
  // solar-panel-cleaning hero img
  { src: 'photos 2/IMG_1818.jpeg',                 maxW: 800, quality: 70 },
  // index photo strip (lazy-loaded, lower priority)
  { src: 'photos 2/Facade Clean.jpeg',             maxW: 600, quality: 70 },
  { src: 'photos 2/Facade Dirty.jpeg',             maxW: 600, quality: 70 },
  { src: 'photos 2/Facade Wash and Pressure Wash.jpeg', maxW: 600, quality: 68 },
  { src: 'photos 2/Decking Contrast.jpeg',         maxW: 600, quality: 70 },
  { src: 'photos 2/Laser Lite, Clean.jpeg',        maxW: 600, quality: 70 },
  { src: 'photos 2/IMG_8494 (3).jpeg',             maxW: 600, quality: 70 },
  // facade-cleaning BA
  { src: 'photos 2/Facade Clean.jpeg',             maxW: 600, quality: 68 },
  { src: 'photos 2/Facade Dirty.jpeg',             maxW: 600, quality: 68 },
];

async function compress({ src, maxW, quality }) {
  const input = path.join(BASE, src);
  if (!fs.existsSync(input)) { console.warn('MISSING:', src); return; }

  const dir  = path.dirname(input);
  const base = path.basename(src, path.extname(src));
  const out  = path.join(dir, base + '.webp');

  const meta = await sharp(input).metadata();
  // .rotate() applies EXIF orientation and strips the tag — must come first
  const correctedMeta = await sharp(input).rotate().metadata();
  const w = Math.min(maxW, correctedMeta.width || maxW);

  await sharp(input)
    .rotate()
    .resize(w, null, { withoutEnlargement: true })
    .webp({ quality, effort: 6, smartSubsample: true })
    .toFile(out);

  const before = fs.statSync(input).size;
  const after  = fs.statSync(out).size;
  console.log(
    `${base.padEnd(44)} ${(before/1024).toFixed(0).padStart(6)} KB -> ${(after/1024).toFixed(0).padStart(5)} KB  (${Math.round((1-after/before)*100)}% smaller)`
  );
}

(async () => {
  // deduplicate by output path
  const seen = new Set();
  const unique = images.filter(img => {
    const key = path.join(BASE, path.dirname(img.src), path.basename(img.src, path.extname(img.src)) + '.webp');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  for (const img of unique) await compress(img);
  console.log('\nDone. WebP files updated in place.');
})();
