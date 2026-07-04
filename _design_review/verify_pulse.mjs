/* Ring-flow pulse verifier: keep the camera float paused via mouse
   jiggle, then diff two frames — anything moving is shader animation. */
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
await page.goto('http://localhost:4317/atlas.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(7000);
await page.mouse.move(800, 500);
for (let i = 0; i < 4; i += 1) {
  await page.mouse.wheel(0, 240);
  await page.waitForTimeout(120);
}
/* jiggle to keep lastInteraction fresh → float stays paused */
const hold = async (ms) => {
  const steps = Math.ceil(ms / 900);
  for (let i = 0; i < steps; i += 1) {
    await page.mouse.move(1400 + (i % 2), 900);
    await page.waitForTimeout(900);
  }
};
await hold(2000);
await page.screenshot({ path: path.join(outDir, 'pulse_t0.png') });
await hold(6000);
await page.screenshot({ path: path.join(outDir, 'pulse_t6.png') });
console.log('saved pulse frames');
await browser.close();
