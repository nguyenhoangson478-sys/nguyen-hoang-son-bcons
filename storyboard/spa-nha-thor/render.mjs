// Render từng khung PNG 1080x1920 và tấm storyboard tổng hợp.
// Chạy: NODE_PATH=$(npm root -g) node render.mjs
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto('file://' + path.join(dir, 'src/frames.html'));
await page.evaluate(() => document.fonts.ready);
const ids = await page.$$eval('.frame', els => els.map(e => e.id));
for (const id of ids) {
  await (await page.$('#' + id)).screenshot({ path: path.join(dir, 'frames', id.slice(1) + '.png') });
}
const sheet = await browser.newPage({ viewport: { width: 2400, height: 1000 } });
await sheet.goto('file://' + path.join(dir, 'src/sheet.html'));
await sheet.evaluate(() => document.fonts.ready);
await sheet.waitForLoadState('networkidle');
await sheet.screenshot({ path: path.join(dir, 'storyboard.png'), fullPage: true });
await browser.close();
console.log('rendered', ids.length, 'frames');
