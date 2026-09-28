"""Tạo nhạc nền piano nhẹ + hiệu ứng âm thanh cho video (bản tạm, có thể thay trong CapCut).

Chạy sau sfx-events.mjs:  python3 audio.py  ->  build/audio.wav
"""
import json
import wave
from pathlib import Path

import numpy as np
import os

# BROLL=1: bản cho video B-roll điện ảnh (cắt cảnh khác bản hoạt hình) — chỉ giữ nhạc, boom, máy ảnh
BROLL = os.environ.get('BROLL') == '1'

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

# ---------- Bản B-roll: nhạc từ lúc cô bé tìm đến Thoa tới hết, dâng dần lên cao trào ----------
if BROLL:
    SH = {x['id']: x['start'] for x in json.loads((DIR / 'broll/shots.json').read_text())}
    T_THOA, T_ROI, T_SUMENH, T_TUQUYET = SH['24-den-tim-thoa'], SH['32-roi-sai-gon'], SH['39-den-vong'], SH['46-buoc-vao-spa']
    T_KHONG = SH['49a-day-lai'] + 2.1          # "Không, cái này tôi chưa cần."
    tt = np.arange(N) / SR
    music *= np.clip((T_THOA - tt) / 2.0, 0, 1)   # nhạc cũ tắt dần trước đoạn mới

    def strings(freqs, dur, vel=1.0, att=1.2):
        t = np.arange(int(dur * SR)) / SR
        env = np.minimum(1, t / att) * np.clip((dur - t) / .9, 0, 1)
        vib = 1 + .004 * np.sin(2 * np.pi * 5.2 * t)
        out = np.zeros(len(t))
        for f in freqs:
            for det in (.997, 1.0, 1.004):
                out += sum(np.sin(2 * np.pi * f * det * h * vib * t) / h ** 1.3 for h in range(1, 7))
        return out * env * vel / (len(freqs) * 3)

    def bassnote(f, dur, vel=1.0):
        t = np.arange(int(dur * SR)) / SR
        return (np.sin(2 * np.pi * f * t) + .35 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 1.6) * (1 - np.exp(-t / .01)) * vel

    def kick(vel=1.0):
        t = np.arange(int(.45 * SR)) / SR
        f = 45 + 80 * np.exp(-t * 18)
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) * vel

    def riser(dur):
        t = np.arange(int(dur * SR)) / SR
        n = rng.standard_normal(len(t))
        k = t / dur
        out = np.zeros(len(t)); y = 0.0; a = 0.02
        for i in range(len(t)):
            a = .02 + .5 * k[i] ** 2
            y += a * (n[i] - y); out[i] = y
        return out * k ** 2 * 3 + np.sin(2 * np.pi * (200 + 900 * k ** 2) * t) * k ** 3 * .25

    def swell(dur):
        t = np.arange(int(dur * SR)) / SR
        return rng.standard_normal(len(t)) * (t / dur) ** 3 * .5

    D_ = lambda root, q: [root + i for i in q]
    MAJ, MIN = (0, 4, 7), (0, 3, 7)
    # (bắt đầu, kết thúc, tiến trình [(bass, hợp âm)], kiểu, âm lượng)
    AM, F, C, G, EM = 45, 41, 48, 43, 40
    PLAN = [
        (T_THOA - .5, T_ROI, [(AM, D_(57, MIN)), (F, D_(53, MAJ)), (C, D_(55, (5, 9, 12))), (G, D_(55, MAJ))], 'lang', .75),
        (T_ROI, T_SUMENH, [(F, D_(53, MAJ)), (G, D_(55, MAJ)), (EM, D_(52, MIN)), (AM, D_(57, MIN))], 'di', .9),
        (T_SUMENH, T_TUQUYET, [(C, D_(60, MAJ)), (G, D_(55, MAJ)), (AM, D_(57, MIN)), (F, D_(53, MAJ))], 'day', 1.0),
        (T_TUQUYET, T_KHONG, [(38, D_(62, MAJ)), (45, D_(57, MAJ)), (47, D_(59, MIN)), (43, D_(55, MAJ))], 'don', 1.1),
        (T_KHONG, TOTAL, [(43, D_(55, MAJ)), (38, D_(62, MAJ)), (45, D_(57, MAJ)), (38, D_(62, MAJ))], 'cao', 1.25),
    ]
    arr = np.zeros(N)
    for st, en, prog, style, vol in PLAN:
        bi, t = 0, st
        while t < en - .2:
            bass, ch = prog[bi % 4]
            blen = min(BAR, en - t) if style != 'cao' else BAR
            last = style == 'cao' and t + BAR >= TOTAL - 4
            if last:
                bass, ch, blen = 38, D_(62, MAJ), TOTAL - t
            sv = {'lang': .10, 'di': .16, 'day': .22, 'don': .26, 'cao': .34}[style]
            if style == 'don':
                sv *= 1 + (t - st) / (en - st)          # đàn dây to dần
            add(arr, strings([midi(n) for n in ch] + ([midi(ch[0] + 12)] if style in ('day', 'don', 'cao') else []), blen + 1.0, sv * vol), t)
            add(arr, piano(midi(bass), 3.2, .5 * vol), t)
            if style in ('di', 'day', 'don', 'cao'):
                for b in range(8):
                    add(arr, bassnote(midi(bass), .4, .22 * vol), t + b * BAR / 8)
            pat = {'lang': [0, 2], 'di': [0, 1, 2, 1, 0, 1, 2, 1], 'day': [0, 1, 2, 3, 2, 1, 2, 3], 'don': [0, 1, 2, 3, 0, 1, 2, 3], 'cao': [0, 2, 3, 2, 1, 2, 3, 2]}[style]
            notes = ch + [ch[0] + 12]
            for b, ci in enumerate(pat):
                pos = b * BAR / len(pat)
                if pos >= blen - .1 or (last and b > 0):
                    break
                add(arr, piano(midi(notes[ci] + (12 if style in ('day', 'cao') else 0)), vel=(.34 if b % 2 == 0 else .24) * vol), t + pos)
            if style in ('day', 'don') or (style == 'cao' and not last):
                beats = [0, 2] if style == 'day' else [0, 1, 2, 3]
                for b in beats:
                    add(arr, kick((.5 if style == 'day' else .45 + .35 * (t - st) / max(1, en - st)) * vol), t + b * BAR / 4)
            bi += 1
            t += BAR
    # tiếng vút lên và nốt cao trào ngay câu "Không, cái này tôi chưa cần"
    add(arr, riser(3.6) * .6, T_KHONG - 3.6)
    add(arr, swell(1.2) * .5, T_KHONG - 1.2)
    add(arr, kick(1.4), T_KHONG)
    add(arr, strings([midi(n) for n in (50, 62, 66, 69, 74)], 4.5, .7, att=.05), T_KHONG)
    add(arr, piano(midi(74), 4, .6) + piano(midi(78), 4, .5) + piano(midi(81), 4, .45), T_KHONG)
    # cân âm lượng từng đoạn theo mức nhạc mở đầu (0–30s): dâng dần tới cao trào
    rms = lambda x: np.sqrt(np.mean(x ** 2)) or 1e-9
    ref = rms(music[:int(30 * SR)])
    target = {'lang': 1, 'di': 3.5, 'day': 6, 'don': 9, 'cao': 13}
    gain = np.zeros(N)
    for st, en, prog, style, vol in PLAN:
        i0, i1 = int(max(st, 0) * SR), int(min(en, TOTAL) * SR)
        g = ref * 10 ** (target[style] / 20) / rms(arr[i0:i1])
        gain[i0:i1] = g
    k = int(.8 * SR)
    gain = np.convolve(gain, np.ones(k) / k, 'same')            # chuyển mức mượt giữa các đoạn
    arr *= gain
    arr *= np.clip((TOTAL - tt) / 3.5, 0, 1)          # khép lại, nhỏ dần
    arr *= np.clip((tt - (T_THOA - .5)) / 2.5, 0, 1)
    music = music + arr
    for st, en, prog, style, vol in PLAN:
        seg = music[int(st * SR):int(min(en, TOTAL) * SR)]
        print(f'  đoạn {style}: {20 * np.log10(rms(seg) / ref):+.1f} dB so với mở đầu')
    print(f'nhạc B-roll: Thoa {T_THOA:.1f}s → rời phố {T_ROI:.1f}s → sứ mệnh {T_SUMENH:.1f}s → tự quyết {T_TUQUYET:.1f}s → cao trào {T_KHONG:.1f}s')

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
def load_sfx(name, ch=1):
    global FFMPEG
    files = sorted((DIR / 'sfx').glob(name + '.*'))
    if not files:
        return None
    if FFMPEG is None:
        import imageio_ffmpeg
        FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
    import subprocess
    raw = subprocess.run([FFMPEG, '-loglevel', 'error', '-i', str(files[0]), '-ac', str(ch), '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype='<f4').astype(float)
    if ch > 1:
        x = x.reshape(-1, ch)
    return x / (np.abs(x).max() or 1), files[0].name

# Tiếng chuyển cảnh theo cảnh được chuyển tới (số cảnh 2–15 -> file trong sfx/)
WHOOSH = {2: 'whoosh-3',                                 # hook: ngắn, dứt khoát
          3: 'whoosh-14', 4: 'whoosh-14',                # kể chuyện: vừa phải
          5: 'whoosh-5', 6: 'whoosh-5', 7: 'whoosh-5', 8: 'whoosh-5',   # đoạn tuyệt vọng: trầm, u ám
          9: 'whoosh-18',                                # Thoa xuất hiện: nhẹ, sáng
          10: 'whoosh-30', 11: 'whoosh-14', 12: 'whoosh-30', 13: 'whoosh-14', 14: 'whoosh-30', 15: 'whoosh-18'}
LOUDER = {'whoosh-5': 1.4}                               # tiếng u ám cho nổi hơn chút
BOOM_AT = [5]            # cảnh có tiếng boom khi chuyển tới: tuyệt vọng bất ngờ đổ ập (sfx/boom.*)

cache = {}
if BROLL:
    # Whoosh tại các cú chuyển chính của B-roll (id cú máy → file)
    BW = {'02-mu-roi': 'whoosh-3', '04a-phong-ktx': 'whoosh-14', '07a-mo-tot-nghiep': 'whoosh-18',
          '08-soi-da': 'whoosh-14', '09-the-lieu-trinh': 'whoosh-30', '10-them-serum': 'whoosh-30', '11-the-hen': 'whoosh-30', '12-ky-hoa-don': 'whoosh-14',
          '14-quay-di': 'whoosh-5', '15-go-tin-nhan': 'whoosh-5', '17-mun-day': 'whoosh-5', '19-so-du': 'whoosh-5', '21-tot-nghiep-lui-ra': 'whoosh-5', '23a-om-mat': 'whoosh-5',
          '24-den-tim-thoa': 'whoosh-18', '26a-thoa-cua-kinh': 'whoosh-14', '28-gach-danh-sach': 'whoosh-30', '31a-nang-som': 'whoosh-18',
          '32-roi-sai-gon': 'whoosh-14', '33-cua-so-xe': 'whoosh-18', '34-lang-dai-hoc': 'whoosh-18', '37-quang-cao': 'whoosh-30', '38a-mat-phan-chieu': 'whoosh-3',
          '39-den-vong': 'whoosh-18', '41-den-soi-da': 'whoosh-14', '43a-so-tay': 'whoosh-30', '45-keo-khan': 'whoosh-18',
          '46-buoc-vao-spa': 'whoosh-18', '48-anh-mat': 'whoosh-14', '49a-day-lai': 'whoosh-14', '50-vao-khung': 'whoosh-18', '52a-hoang-hon': 'whoosh-18'}
    shots_b = {x['id']: x['start'] for x in json.loads((DIR / 'broll/shots.json').read_text())}
    for sid, name in BW.items():
        if name not in cache:
            got = load_sfx(name)
            w = got[0]; env = np.convolve(np.abs(w), np.ones(2205) / 2205, 'same')
            act = w[env > env.max() * .1]
            cache[name] = (w / (np.sqrt(np.mean(act ** 2)) or 1) * .1, env.argmax() / SR)
        w, peak = cache[name]
        add(sfx, w * LOUDER.get(name, 1), max(0, shots_b[sid] - .02 - peak))
    print('whoosh B-roll:', len(BW), 'cú chuyển')
for k, at in enumerate([] if BROLL else ev['scenes'][1:], start=2):
    name = WHOOSH.get(k, 'whoosh')
    if name not in cache:
        got = load_sfx(name)
        if got:
            w = got[0]
            env = np.convolve(np.abs(w), np.ones(2205) / 2205, 'same')
            act = w[env > env.max() * .1]
            w = w / (np.sqrt(np.mean(act ** 2)) or 1) * .1   # cân độ to giữa các file
            cache[name] = (w, env.argmax() / SR)
        else:
            cache[name] = None
    if cache[name]:
        w, peak = cache[name]
        lead = -.05 if k in BOOM_AT else .25     # có boom: whoosh dâng lên ngay trước tiếng nổ
        add(sfx, w * LOUDER.get(name, 1), max(0, at + lead - peak))   # đỉnh tiếng rơi vào lúc chuyển cảnh
    else:
        add(sfx, whoosh() * .22, at - .25)
if not BROLL: print('whoosh:', ', '.join(f'{k}:{WHOOSH.get(k)}' for k in range(2, 16) if cache.get(WHOOSH.get(k))))
boom = load_sfx('boom')
if boom:
    b = boom[0]
    env = np.convolve(np.abs(b), np.ones(441) / 441, 'same')
    hit = np.argmax(env > env.max() * .3) / SR        # bỏ khoảng lặng đầu file
    for k in BOOM_AT:
        at = ev['scenes'][k - 1]
        add(sfx, b * .55, max(0, at + .05 - hit))
        print(f'boom: cảnh {k}, nổ ở {at + .05:.2f}s')
for at in ([] if BROLL else ev['pops']):
    add(sfx, pop() * .28, at)
for at in ([] if BROLL else ev['drops']):
    add(sfx, thud() * .5, at)
cam = load_sfx('camera')                     # tiếng máy ảnh riêng: sfx/camera.*
if BROLL:
    shots = {x['id']: x for x in json.loads((DIR / 'broll/shots.json').read_text())}
    ev['flashes'] = [shots['22-khung-ngam']['start'] + 1.6, shots['50-vao-khung']['start'] + 3.3]
for at in ev['flashes']:
    if cam:
        c = cam[0]
        env = np.convolve(np.abs(c), np.ones(220) / 220, 'same')
        add(sfx, c * .6, max(0, at - env.argmax() / SR))   # tiếng click to nhất trùng lúc chớp sáng
    else:
        add(sfx, shutter() * .5, at)

def ramp(t0, t1):
    """0 trước t0, lên 1 ở t1 (dạng cos, mượt)."""
    t = np.arange(N) / SR
    return .5 - .5 * np.cos(np.pi * np.clip((t - t0) / (t1 - t0), 0, 1))

L, R = left * .32, right * .32
# Nhạc kinh dị cho đoạn cô bé tuyệt vọng (cảnh 5–8): sfx/nhac-kinh-di.*
bed = load_sfx('nhac-kinh-di', ch=2)
if bed:
    hx, hname = bed
    tl = json.loads((DIR / 'timeline.json').read_text())
    sign = tl[3]['lines'][-1]['start']          # "Mỗi thứ nghe qua đều có lý." — dấu hiệu đầu tiên
    recall = ev['scenes'][5] + 2.1              # lúc tin nhắn bị thu hồi (cảnh 6)
    s9 = ev['scenes'][8]
    HIT = 9.8                                   # giây nhạc bùng lên trong file gốc
    start = recall - HIT                        # cao trào rơi đúng lúc thu hồi tin nhắn
    skip = max(0, sign - start)                 # phần dồn dài hơn khoảng có sẵn thì cắt bớt đầu
    start += skip
    seg = hx[int(skip * SR):]
    hl, hr = np.zeros(N), np.zeros(N)
    add(hl, seg[:, 0], start); add(hr, seg[:, 1], start)
    fade_in = ramp(sign - .2, sign + 1.5)
    fade_out = 1 - ramp(s9 - 1.6, s9 + .5)      # tắt sau câu "Rốt cuộc da mình đang bị gì?"
    s7 = recall
    env = fade_in * fade_out
    # Cân mức: đoạn cao trào to hơn piano khoảng 3 dB
    piano_rms = np.sqrt(np.mean((L[:int(30 * SR)] if BROLL else L[int(s9 * SR):int((s9 + 20) * SR)]) ** 2))
    loud = hl[int(s7 * SR):int((s7 + 10) * SR)]
    gain = piano_rms * 1.41 / (np.sqrt(np.mean(loud ** 2)) or 1)
    duck = 1 - ramp(sign - .2, sign + 2.5) * fade_out   # piano rút dần khi nhạc kinh dị len vào
    L, R = L * duck + hl * env * gain, R * duck + hr * env * gain
    print(f'nhạc nền đoạn tuyệt vọng: {hname}, {sign - .2:.1f}s → {s9 + .5:.1f}s, cao trào ở {recall:.1f}s')

L = L + sfx
R = R + sfx
fade = np.ones(N)
fn = int(2.5 * SR)
fade[-fn:] = np.linspace(1, 0, fn)
fade[:int(.05 * SR)] = np.linspace(0, 1, int(.05 * SR))
stereo = np.stack([L * fade, R * fade], 1)
stereo = stereo / max(1, np.abs(stereo).max() / .9)

out = DIR / ('build/audio-broll.wav' if BROLL else 'build/audio.wav')
with wave.open(str(out), 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((stereo * 32767).astype('<i2').tobytes())
print('xong', out, f'{TOTAL:.1f}s')
