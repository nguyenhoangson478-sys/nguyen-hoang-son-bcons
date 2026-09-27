// Xuất mốc thời gian cho âm thanh (chuyển cảnh, pop, rơi, màn trập) ra build/events.json.
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('file://' + path.join(dir, 'src/video.html'));
const ev = await page.evaluate(() => ({
  total: TOTAL,
  scenes: VIDEO.map(sc => sc.start),
  pops: VIDEO.flatMap(sc => sc.anims.filter(a => a.type === 'pop' && a.n.tagName === 'DIV').map(a => sc.start + a.t0)),
  drops: VIDEO.flatMap(sc => sc.anims.filter(a => a.type === 'drop').map(a => sc.start + a.t0 + .35)),
  flashes: VIDEO.flatMap(sc => sc.anims.filter(a => a.type === 'flash').map(a => sc.start + a.t0)),
}));
fs.mkdirSync(path.join(dir, 'build'), { recursive: true });
fs.writeFileSync(path.join(dir, 'build/events.json'), JSON.stringify(ev));
await browser.close();
console.log(ev.total.toFixed(1), ev.pops.length, 'pops');
