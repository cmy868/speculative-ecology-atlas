/* Screenshot harness for design review — not part of the site build. */
import { chromium } from 'playwright-core';
import path from 'node:path';

const shots = JSON.parse(process.argv[2] ?? '[]');
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

for (const shot of shots) {
  const page = await browser.newPage({
    viewport: { width: shot.w ?? 1600, height: shot.h ?? 1000 },
    deviceScaleFactor: 1,
  });
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning')
      console.log(`[console:${m.type()}]`, m.text());
  });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto(shot.url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(shot.wait ?? 6000);
  if (shot.click) {
    await page.click(shot.click);
    await page.waitForTimeout(shot.afterClick ?? 2500);
  }
  if (shot.eval) {
    await page.evaluate(shot.eval);
    await page.waitForTimeout(shot.afterEval ?? 2500);
  }
  await page.screenshot({ path: path.join(outDir, shot.name) });
  console.log('saved', shot.name);
  await page.close();
}

await browser.close();
