import puppeteer from 'puppeteer';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const outDir = join(__dirname, 'temporary screenshots');

if (!existsSync(outDir)) mkdirSync(outDir);

// Auto-increment: find next N
const existing = readdirSync(outDir)
  .map(f => parseInt(f.match(/^screenshot-(\d+)/)?.[1]))
  .filter(Boolean);
const nextN = existing.length ? Math.max(...existing) + 1 : 1;

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3];
const filename = label ? `screenshot-${nextN}-${label}.png` : `screenshot-${nextN}.png`;
const outPath = join(outDir, filename);

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: outPath, fullPage: true });

  console.log(`Saved: temporary screenshots/${filename}`);
  await browser.close();
})();
