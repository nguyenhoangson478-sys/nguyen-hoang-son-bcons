// Phủ phụ đề lên video B-roll: xuất lớp chữ trong suốt rồi ghép bằng ffmpeg.
//   NODE_PATH=$(npm root -g) node broll/phu-de.mjs
// Kết quả: broll/spa-nha-thor-broll-phu-de.mp4 (có phụ đề + nhạc), cần sẵn build/audio-broll.wav
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { spawn, execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '..'), out = path.join(root, 'build/cap');
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
const FFMPEG = execFileSync('python3', ['-c', 'import imageio_ffmpeg as f;print(f.get_ffmpeg_exe())']).toString().trim();
const total = JSON.parse(fs.readFileSync(path.join(dir, 'shots.json'))).reduce((a, s) => a + s.d, 0);
const fps = 30, frames = Math.round(total * fps), W4 = 4, per = Math.ceil(frames / W4);
const browser = await chromium.launch();
await Promise.all(Array.from({ length: W4 }, async (_, w) => {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.join(dir, 'captions.html'));
  await page.evaluate(() => document.fonts.ready);
  for (let f = w * per; f < Math.min(frames, (w + 1) * per); f++) {
    await page.evaluate(t => render(t), f / fps);
    await page.screenshot({ path: path.join(out, `c${String(f).padStart(5, '0')}.png`), omitBackground: true });
  }
}));
await browser.close();
console.log('lớp phụ đề:', frames, 'khung');
execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', path.join(dir, 'spa-nha-thor-broll.mp4'), '-framerate', String(fps), '-i', path.join(out, 'c%05d.png'),
  '-i', path.join(root, 'build/audio-broll.wav'),
  '-filter_complex', '[0:v][1:v]overlay=format=auto,format=yuv420p[v];[2:a]loudnorm=I=-18:TP=-1.5:LRA=11,alimiter=limit=0.8:attack=2:release=80:level=false[a]',
  '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart',
  path.join(dir, 'spa-nha-thor-broll-phu-de.mp4')]);
console.log('xong: broll/spa-nha-thor-broll-phu-de.mp4');
