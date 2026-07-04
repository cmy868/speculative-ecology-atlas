/* Round-5 screenshots — serves nothing itself; expects http://localhost:4321 */
import { chromium } from 'playwright-core';
import path from 'node:path';

const outDir = path.resolve('_design_review');
const shots = [
  { name: 'r5_opening.png', url: 'http://localhost:4321/atlas.html', wait: 9000 },
  {
    name: 'r5_selection_domy.png',
    url: 'http://localhost:4321/atlas.html?node=domy-reverie',
    wait: 11000,
  },
];

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

for (const shot of shots) {
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
  });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto(shot.url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(shot.wait);
  await page.screenshot({ path: path.join(outDir, shot.name) });
  console.log('saved', shot.name);
  await page.close();
}
await browser.close();
