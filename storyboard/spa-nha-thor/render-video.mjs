// Render video MP4 1080x1920, 30fps từ src/video.html.
// Chạy: NODE_PATH=$(npm root -g) node render-video.mjs            (cả video)
//       NODE_PATH=$(npm root -g) node render-video.mjs --still 3.2 12  (ảnh xem thử tại các giây)
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { spawn, execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));
const FFMPEG = process.env.FFMPEG || execFileSync('python3', ['-c', 'import imageio_ffmpeg as f;print(f.get_ffmpeg_exe())']).toString().trim();
const WORKERS = 4;

const browser = await chromium.launch();
async function openPage() {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.join(dir, 'src/video.html'));
  await page.evaluate(() => document.fonts.ready);
  return page;
}

const args = process.argv.slice(2);
if (args[0] === '--still') {
  const page = await openPage();
  const out = process.env.OUT || path.join(dir, 'build');
  fs.mkdirSync(out, { recursive: true });
  for (const s of args.slice(1)) {
    await page.evaluate(t => render(t), +s);
    await page.screenshot({ path: path.join(out, `still-${s}.png`) });
  }
  await browser.close(); process.exit(0);
}

const probe = await openPage();
const { total, fps, timeline } = await probe.evaluate(() => ({ total: TOTAL, fps: FPS, timeline: TIMELINE }));
await probe.close();
const build = path.join(dir, 'build'); fs.mkdirSync(build, { recursive: true });
fs.writeFileSync(path.join(dir, 'timeline.json'), JSON.stringify(timeline, null, 1));
const frames = Math.ceil(total * fps);
console.log(`thời lượng ${total.toFixed(1)}s, ${frames} khung`);

const per = Math.ceil(frames / WORKERS);
const t0 = Date.now();
await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
  const from = w * per, to = Math.min(frames, from + per);
  const page = await openPage();
  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', path.join(build, `part${w}.mp4`)], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = from; f < to; f++) {
    await page.evaluate(t => render(t), f / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (w === 0 && f % 150 === 0) console.log(`  ${Math.round((f - from) / (to - from) * 100)}% (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
}));
await browser.close();

fs.writeFileSync(path.join(build, 'list.txt'), Array.from({ length: WORKERS }, (_, w) => `file 'part${w}.mp4'`).join('\n'));
execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(build, 'list.txt'),
  '-c', 'copy', '-movflags', '+faststart', path.join(dir, 'spa-nha-thor.mp4')]);
console.log('xong:', path.join(dir, 'spa-nha-thor.mp4'), `(${((Date.now() - t0) / 1000).toFixed(0)}s)`);
