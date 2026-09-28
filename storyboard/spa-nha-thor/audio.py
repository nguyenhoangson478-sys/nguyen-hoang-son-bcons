"""Tạo nhạc nền piano nhẹ + hiệu ứng âm thanh cho video (bản tạm, có thể thay trong CapCut).

Chạy sau sfx-events.mjs:  python3 audio.py  ->  build/audio.wav
"""
import json
import wave
from pathlib import Path

import numpy as np

SR = 44100
DIR = Path(__file__).parent
ev = json.loads((DIR / 'build/events.json').read_text())
TOTAL = ev['total'] + 0.5
N = int(TOTAL * SR)
rng = np.random.default_rng(7)

BAR = 60 / 72 * 4          # 72 BPM, nhịp 4/4
midi = lambda m: 440 * 2 ** ((m - 69) / 12)

# Hợp âm: (nốt bass, các nốt hợp âm)
PROG_SAD = [(45, [57, 60, 64]), (41, [57, 60, 65]), (48, [55, 60, 64]), (43, [55, 59, 62])]   # Am F C G
PROG_HOPE = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [60, 64, 69]), (41, [60, 65, 69])]  # C G Am F

s = ev['scenes']
# (bắt đầu, tiến trình, kiểu đệm, âm lượng)
SECTIONS = [(0, PROG_HOPE, 'sparse', .8), (s[1], PROG_SAD, 'low', .7), (s[2], PROG_SAD, 'arp', .75),
            (s[4], PROG_SAD, 'low', .65), (s[8], PROG_HOPE, 'arp', .85), (s[14], PROG_HOPE, 'full', 1.0)]


def piano(freq, dur=2.6, vel=1.0):
    t = np.arange(int(dur * SR)) / SR
    tone = sum(a * np.sin(2 * np.pi * freq * h * t) * np.exp(-t * d)
               for h, a, d in [(1, 1, 2.2), (2, .45, 3.5), (3, .2, 5), (4, .1, 7)])
    return tone * (1 - np.exp(-t / .006)) * vel


def pad(freqs, dur):
    t = np.arange(int(dur * SR)) / SR
    env = np.minimum(1, t / 1.0) * np.minimum(1, (dur - t) / 1.0).clip(0)
    return sum(np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 1.003 * t) for f in freqs) * env / len(freqs)


def add(buf, sig, at):
    i = int(at * SR)
    if i >= len(buf):
        return
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[:j - i]


music = np.zeros(N)
for k, (st, prog, style, vol) in enumerate(SECTIONS):
    end = SECTIONS[k + 1][0] if k + 1 < len(SECTIONS) else TOTAL
    bar_i, t = 0, st
    while t < end - .3:
        bass, chord = prog[bar_i % 4]
        blen = min(BAR, end - t)
        add(music, pad([midi(n) for n in chord], blen + .8) * .10 * vol, t)
        add(music, piano(midi(bass), 3.0, .55 * vol), t)
        if style == 'sparse':
            for b, n in enumerate([chord[0], chord[2]]):
                add(music, piano(midi(n + 12), vel=.3 * vol), t + b * BAR / 2)
        elif style == 'low':
            add(music, piano(midi(chord[1]), vel=.28 * vol), t + BAR / 2)
        else:
            pattern = [0, 1, 2, 1, 0, 1, 2, 1] if style == 'arp' else [0, 1, 2, 0, 1, 2, 1, 2]
            for b, ci in enumerate(pattern):
                if b * BAR / 8 >= blen:
                    break
                n = chord[ci] + (12 if style == 'full' and b % 4 == 2 else 0)
                add(music, piano(midi(n), vel=(.32 if b % 2 == 0 else .22) * vol), t + b * BAR / 8)
        bar_i += 1
        t += BAR

# Hồi âm: tích chập với xung nhiễu tắt dần
def reverb(x, seed, length=2.2):
    ir_t = np.arange(int(length * SR)) / SR
    ir = np.random.default_rng(seed).standard_normal(len(ir_t)) * np.exp(-ir_t * 3.2)
    ir[0] = 0
    n = len(x) + len(ir)
    y = np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(ir, n), n)[:len(x)]
    return y / np.abs(y).max() * np.abs(x).max()

dry = music / np.abs(music).max()
left, right = dry * .75 + reverb(dry, 1) * .35, dry * .75 + reverb(dry, 2) * .35

# Hiệu ứng âm thanh
sfx = np.zeros(N)
def pop():
    t = np.arange(int(.12 * SR)) / SR
    f = 520 + 900 * t / .12
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 38)
def whoosh():
    t = np.arange(int(.6 * SR)) / SR
    noise = rng.standard_normal(len(t))
    smooth = np.convolve(noise, np.ones(18) / 18, 'same')
    return smooth * np.sin(np.pi * t / .6) ** 2 * 1.6
def shutter():
    out = np.zeros(int(.2 * SR))
    for at in (0, .07):
        i = int(at * SR)
        n = int(.03 * SR)
        out[i:i + n] += rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 150)
    return out
def thud():
    t = np.arange(int(.25 * SR)) / SR
    return np.sin(2 * np.pi * (120 - 60 * t / .25) * t) * np.exp(-t * 16)

# Tiếng ngoài: thả file vào thư mục sfx/ (whoosh.wav/.mp3…) để thay tiếng tự tạo
FFMPEG = None
def load_sfx(name):
    global FFMPEG
    files = sorted((DIR / 'sfx').glob(name + '.*'))
    if not files:
        return None
    if FFMPEG is None:
        import imageio_ffmpeg
        FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
    import subprocess
    raw = subprocess.run([FFMPEG, '-loglevel', 'error', '-i', str(files[0]), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype='<f4').astype(float)
    return x / (np.abs(x).max() or 1), files[0].name

ext = load_sfx('whoosh')
if ext:
    wsig, wname = ext
    env = np.convolve(np.abs(wsig), np.ones(2205) / 2205, 'same')
    peak = env.argmax() / SR          # đỉnh tiếng whoosh rơi đúng lúc chuyển cảnh
    print('whoosh:', wname, f'đỉnh ở {peak:.2f}s')
    for at in ev['scenes'][1:]:
        add(sfx, wsig * .45, max(0, at + .25 - peak))
else:
    for at in ev['scenes'][1:]:
        add(sfx, whoosh() * .22, at - .25)
for at in ev['pops']:
    add(sfx, pop() * .28, at)
for at in ev['drops']:
    add(sfx, thud() * .5, at)
for at in ev['flashes']:
    add(sfx, shutter() * .5, at)

L = left * .32 + sfx
R = right * .32 + sfx
fade = np.ones(N)
fn = int(2.5 * SR)
fade[-fn:] = np.linspace(1, 0, fn)
fade[:int(.05 * SR)] = np.linspace(0, 1, int(.05 * SR))
stereo = np.stack([L * fade, R * fade], 1)
stereo = stereo / max(1, np.abs(stereo).max() / .9)

out = DIR / 'build/audio.wav'
with wave.open(str(out), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype('<i2').tobytes())
print('xong', out, f'{TOTAL:.1f}s')
