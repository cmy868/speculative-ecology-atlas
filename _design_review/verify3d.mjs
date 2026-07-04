/* Zoomed-out membrane + ring-flow + camera-drift verifier. */
import { chromium } from 'playwright-core';
import path from 'node:path';

const outDir = path.resolve('_design_review');
const browser = await chromium.launch({
  headless: true,
  executablePath:
    'C:\\Users\\Mingy\\AppData\\Local\\ms-playwright\\chromium-1208\\chrome-win64\\chrome.exe',
  args: [
    '--enable-unsafe-swiftshader',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-webgl',
    '--force-color-profile=srgb',
  ],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning')
    console.log(`[console:${m.type()}]`, m.text());
});
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto('http://localhost:4317/atlas.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(7000);
// zoom well out so the enclosing shell + rings are in frame
await page.mouse.move(800, 500);
for (let i = 0; i < 4; i += 1) {
  await page.mouse.wheel(0, 240);
  await page.waitForTimeout(120);
}
await page.waitForTimeout(4000); // let the float resume (3s) and settle
await page.screenshot({ path: path.join(outDir, 'r3a_zoomout_t0.png') });
console.log('saved r3a_zoomout_t0.png');
await page.waitForTimeout(5000);
await page.screenshot({ path: path.join(outDir, 'r3a_zoomout_t5.png') });
console.log('saved r3a_zoomout_t5.png');
await browser.close();
