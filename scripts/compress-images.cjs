const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const BASE = path.resolve(__dirname, '..');

// All images referenced in HTML, with their max display width
const images = [
  // gutter-cleaning.html backgrounds (800px — displayed in ~50% column)
  { src: 'photos 2/Empty Gutter.jpeg',                  maxW: 900 },
  { src: 'components/Photos/IMG_8855.jpeg',              maxW: 900 },
  // pressure-washing.html backgrounds
  { src: 'components/Photos/IMG_1933.jpeg',              maxW: 900 },
  { src: 'components/Photos/IMG_8207.jpeg',              maxW: 900 },
  // window-cleaning.html hero (fetchpriority=high)
  { src: 'photos 2/Rye Windows.jpeg',                   maxW: 1200 },
  // solar-panel-cleaning.html hero (fetchpriority=high)
  { src: 'photos 2/IMG_1818.jpeg',                      maxW: 1200 },
  // window-cleaning.html gallery
  { src: 'photos 2/IMG_8494 (3).jpeg',                  maxW: 800 },
  // facade-cleaning backgrounds + index gallery
  { src: 'photos 2/Facade Clean.jpeg',                  maxW: 900 },
  { src: 'photos 2/Facade Dirty.jpeg',                  maxW: 900 },
  { src: 'photos 2/Facade Wash and Pressure Wash.jpeg', maxW: 900 },
  // index gallery
  { src: 'photos 2/Decking Contrast.jpeg',              maxW: 800 },
  { src: 'photos 2/Laser Lite, Clean.jpeg',             maxW: 800 },
];

async function compress({ src, maxW }) {
  const input = path.join(BASE, src);
  if (!fs.existsSync(input)) { console.warn('MISSING:', src); return; }

  const dir  = path.dirname(input);
  const base = path.basename(src, path.extname(src));
  const out  = path.join(dir, base + '.webp');

  const meta = await sharp(input).metadata();
  const w    = Math.min(maxW, meta.width || maxW);

  await sharp(input)
    .resize(w, null, { withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toFile(out);

  const before = fs.statSync(input).size;
  const after  = fs.statSync(out).size;
  console.log(
    `${src.padEnd(48)} ${(before/1024).toFixed(0).padStart(6)} KB -> ${(after/1024).toFixed(0).padStart(5)} KB  (${Math.round((1-after/before)*100)}% smaller)`
  );
}

(async () => {
  for (const img of images) await compress(img);
  console.log('\nDone. Update HTML src/background-image references to use .webp files.');
})();
