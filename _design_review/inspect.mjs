/* One-off inspector for the dissertation margin bug. */
import { chromium } from 'playwright-core';

const url = process.argv[2];
const width = Number(process.argv[3] ?? 1600);

const browser = await chromium.launch({
  headless: true,
  executablePath:
    'C:\\Users\\Mingy\\AppData\\Local\\ms-playwright\\chromium-1208\\chrome-win64\\chrome.exe',
});
const page = await browser.newPage({ viewport: { width, height: 1000 } });
await page.goto(url, { waitUntil: 'networkidle' });
const report = await page.evaluate(() => {
  const out = [];
  for (const sel of ['.dissertation', '.section-note', '.citation-block', '.dissertation-section > p']) {
    document.querySelectorAll(sel).forEach((el, i) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      out.push({
        sel: `${sel}[${i}]`,
        text: (el.textContent || '').slice(0, 40),
        rect: { x: Math.round(r.x), w: Math.round(r.width), right: Math.round(r.right) },
        margin: `${cs.marginTop} ${cs.marginRight} ${cs.marginBottom} ${cs.marginLeft}`,
        padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
      });
    });
  }
  out.push({ viewport: innerWidth, docScrollW: document.documentElement.scrollWidth });
  return out;
});
console.log(JSON.stringify(report, null, 1));
await browser.close();
