// Xuất các khung mẫu B-roll điện ảnh (src/broll.html) ra broll/mau-*.png
// Chạy: NODE_PATH=$(npm root -g) node broll/render-mau.mjs
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
page.on('pageerror', e => console.log('LỖI', e.message));
await page.goto('file://' + path.join(dir, 'src/broll.html'));
await page.waitForTimeout(300);
const ids = await page.$$eval('.frame', els => els.map(e => e.id));
for (const id of ids) await (await page.$('#' + id)).screenshot({ path: path.join(dir, `broll/mau-${id}.png`) });
await browser.close();
console.log('xong', ids.join(', '));
