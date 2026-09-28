// Xuất lớp chữ trong suốt của một cảnh (PNG có kênh alpha) để phủ lên hình 3D.
// Chạy: NODE_PATH=$(npm root -g) node 3d/overlay.mjs 7
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scene = +process.argv[2];
const out = path.join(dir, 'build/overlay'); fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto('file://' + path.join(dir, 'src/video.html?overlay'));
await page.evaluate(() => document.fonts.ready);
const { start, dur, fps } = await page.evaluate(i => ({ start: VIDEO[i].start, dur: VIDEO[i].dur, fps: FPS }), scene - 1);
const n = Math.round(dur * fps);
for (let f = 0; f < n; f++) {
  // bỏ hiệu ứng mờ dần khi vào cảnh: cảnh 3D tự đứng một mình
  await page.evaluate(([t, i]) => { render(t); VIDEO.forEach((sc, k) => { sc.el.style.opacity = k === i ? 1 : 0; sc.el.style.transform = 'none'; }); }, [start + f / fps, scene - 1]);
  await page.screenshot({ path: path.join(out, `o${String(f).padStart(4, '0')}.png`), omitBackground: true });
}
await browser.close();
console.log(`cảnh ${scene}: ${n} khung, bắt đầu ${start.toFixed(2)}s`);
