const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const filePath = 'file://' + path.resolve(__dirname, 'index.html').replace(/\\/g, '/');

  // Desktop (1440px)
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(filePath, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000)); // let animations settle
  await page.screenshot({ path: 'screenshot-desktop.png', fullPage: true });
  console.log('Saved: screenshot-desktop.png');

  // Mobile (390px — iPhone 14 size)
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3 });
  await page.goto(filePath, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'screenshot-mobile.png', fullPage: true });
  console.log('Saved: screenshot-mobile.png');

  await browser.close();
})();
