/**
 * Three-way CSS split for each service page:
 *   criticalA + [deferred] + criticalB
 *
 *   criticalA = base styles, nav, hero (above fold)
 *   deferred  = below-fold sections (trust-bar, reviews, process, FAQ, footer…)
 *   criticalB = @media queries, modal, theme color overrides (critical for mobile layout)
 *
 * The deferred CSS is loaded via JS after window.load. Because it's an external
 * file, Vercel caches it with immutable headers after the first request.
 */

const fs   = require('fs');
const path = require('path');

const BASE       = path.resolve(__dirname, '..');
const STYLES_DIR = path.join(BASE, 'styles');
if (!fs.existsSync(STYLES_DIR)) fs.mkdirSync(STYLES_DIR);

/**
 * For each page:
 *   deferStart – CSS substring that marks the START of the below-fold section
 *   deferEnd   – CSS substring that marks the END of below-fold (start of media queries /
 *                modal / theme overrides which are critical)
 */
const pages = [
  {
    file: 'gutter-cleaning.html',
    out:  'gutter-deferred.css',
    // trust-bar is the first below-fold section in the base styles
    deferStart: '.trust-bar{background:#060E1A',
    // Stop deferring when we hit the @media queries (mobile nav etc. = critical)
    deferEnd:   '@media(max-width:1024px){',
  },
  {
    file: 'solar-panel-cleaning.html',
    out:  'solar-deferred.css',
    deferStart: '.trust-bar{',
    deferEnd:   '@media(',
  },
  {
    file: 'window-cleaning.html',
    out:  'window-deferred.css',
    deferStart: '.trust-bar{',
    deferEnd:   '@media(',
  },
  {
    file: 'pressure-washing.html',
    out:  'pressure-deferred.css',
    deferStart: '.trust-bar{',
    deferEnd:   '@media(',
  },
  {
    file: 'facade-cleaning.html',
    out:  'facade-deferred.css',
    deferStart: '.trust-bar{',
    deferEnd:   '@media(',
  },
  {
    file: 'interior-cleaning.html',
    out:  'interior-deferred.css',
    deferStart: '.trust-bar{',
    deferEnd:   '@media(',
  },
];

// Load deferred CSS after page is interactive (post-load)
const DEFER_SCRIPT = (href) =>
  `\n<script>window.addEventListener('load',function(){var l=document.createElement('link');l.rel='stylesheet';l.href='${href}';document.head.appendChild(l);});</script>`;

function processPage({ file, out, deferStart, deferEnd }) {
  const filePath = path.join(BASE, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // Find the FIRST <style>…</style> block
  const styleOpen  = html.indexOf('<style>');
  const styleClose = html.indexOf('</style>');
  if (styleOpen === -1 || styleClose === -1) { console.warn(`No <style> in ${file}`); return; }

  const htmlBefore = html.substring(0, styleOpen);
  const htmlAfter  = html.substring(styleClose + '</style>'.length);
  const css        = html.substring(styleOpen + '<style>'.length, styleClose);

  // Find the three split points
  const startIdx = css.indexOf(deferStart);
  if (startIdx === -1) { console.warn(`deferStart not found in ${file}: "${deferStart}"`); return; }

  // Find deferEnd AFTER startIdx (search forward from there)
  const endIdx = css.indexOf(deferEnd, startIdx);
  if (endIdx === -1) {
    console.warn(`deferEnd not found after deferStart in ${file}: "${deferEnd}"`);
    // Fall back: defer everything from deferStart onwards
    const criticalA = css.substring(0, startIdx);
    const deferred  = css.substring(startIdx);
    writeOutput(filePath, htmlBefore, htmlAfter, criticalA, '', deferred, out, css);
    return;
  }

  // Three sections
  const criticalA = css.substring(0, startIdx);   // above-fold
  const deferred  = css.substring(startIdx, endIdx); // below-fold
  const criticalB = css.substring(endIdx);          // media queries + modal + theme

  writeOutput(filePath, htmlBefore, htmlAfter, criticalA, criticalB, deferred, out, css);
}

function writeOutput(filePath, htmlBefore, htmlAfter, critA, critB, deferred, out, origCSS) {
  const outPath  = path.join(STYLES_DIR, out);
  fs.writeFileSync(outPath, deferred);

  const href = `/styles/${out}?v=2`;
  const newHTML = htmlBefore
    + '<style>' + critA + critB + '</style>'
    + DEFER_SCRIPT(href)
    + htmlAfter;

  fs.writeFileSync(filePath, newHTML);

  const file = path.basename(filePath);
  console.log(
    `${file.padEnd(30)} ${(origCSS.length/1024).toFixed(1)}KB → ` +
    `${((critA.length+critB.length)/1024).toFixed(1)}KB inline + ` +
    `${(deferred.length/1024).toFixed(1)}KB deferred`
  );
}

for (const page of pages) {
  try { processPage(page); }
  catch (e) { console.error(`Error in ${page.file}:`, e.message); }
}
console.log('\nDone. Deferred CSS loads after window.load.');
