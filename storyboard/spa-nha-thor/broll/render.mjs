// B-roll điện ảnh: xuất video hoặc ảnh xem thử.
//   NODE_PATH=$(npm root -g) node broll/render.mjs                 -> broll/spa-nha-thor-broll.mp4 (không tiếng)
//   NODE_PATH=$(npm root -g) node broll/render.mjs --sheet 1 23    -> build/broll-sheet.png (khung giữa mỗi cú)
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { spawn, execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '..');
const build = path.join(root, 'build/broll'); fs.mkdirSync(build, { recursive: true });
const FFMPEG = execFileSync('python3', ['-c', 'import imageio_ffmpeg as f;print(f.get_ffmpeg_exe())']).toString().trim();
const browser = await chromium.launch();
async function open() {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => console.log('LỖI', e.message));
  await page.goto('file://' + path.join(dir, 'video.html'));
  await page.evaluate(() => document.fonts.ready);
  return page;
}
const args = process.argv.slice(2);
if (args[0] === '--sheet') {
  const page = await open();
  const list = await page.evaluate(() => LIST);
  const a = +(args[1] || 1), b = +(args[2] || list.length), frac = +(args[3] || .6);
  const files = [];
  for (let i = a; i <= b; i++) {
    await page.evaluate(([i, f]) => renderShot(i - 1, f), [i, frac]);
    const f = path.join(build, `s${String(i).padStart(2, '0')}.png`); await page.screenshot({ path: f, type: 'png' }); files.push(f);
  }
  execFileSync('python3', ['-c', `
import sys
from PIL import Image, ImageDraw
fs=sys.argv[1:]; n=len(fs); cols=6; w,h=270,480; rows=(n+cols-1)//cols
o=Image.new('RGB',(cols*w,rows*(h+30)),'#111'); d=ImageDraw.Draw(o)
for i,f in enumerate(fs):
  im=Image.open(f).convert('RGB').resize((w,h)); x,y=(i%cols)*w,(i//cols)*(h+30); o.paste(im,(x,y)); d.text((x+8,y+h+6),f.split('/')[-1],fill='#ddd')
o.save('${path.join(root, 'build/broll-sheet.png')}')`, ...files]);
  console.log('xong', files.length, 'ảnh'); await browser.close(); process.exit(0);
}
const probe = await open();
const { total, fps, list } = await probe.evaluate(() => ({ total: TOTAL, fps: FPS, list: LIST })); await probe.close();
fs.writeFileSync(path.join(dir, 'shots.json'), JSON.stringify(list, null, 1));
const frames = Math.round(total * fps), W4 = 4, per = Math.ceil(frames / W4), t0 = Date.now();
console.log(`${list.length} cú máy, ${total.toFixed(1)}s, ${frames} khung`);
await Promise.all(Array.from({ length: W4 }, async (_, w) => {
  const from = w * per, to = Math.min(frames, from + per), page = await open();
  const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', path.join(build, `part${w}.mp4`)], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = from; f < to; f++) {
    await page.evaluate(t => render(t), f / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (w === 0 && (f - from) % 300 === 0) console.log(`  ${Math.round((f - from) / (to - from) * 100)}% (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}));
await browser.close();
fs.writeFileSync(path.join(build, 'list.txt'), Array.from({ length: W4 }, (_, w) => `file 'part${w}.mp4'`).join('\n'));
execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', path.join(build, 'list.txt'), '-c', 'copy', '-movflags', '+faststart', path.join(dir, 'spa-nha-thor-broll.mp4')]);
console.log('xong', ((Date.now() - t0) / 1000).toFixed(0) + 's');
