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


def load_sfx_early(name):
    files = sorted((DIR / 'sfx').glob(name + '.*'))
    if not files:
        return None
    import subprocess, imageio_ffmpeg
    raw = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), '-loglevel', 'error', '-i', str(files[0]), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype='<f4').astype(float)
    print('nhạc cuối:', files[0].name, f'{len(x) / SR:.1f}s')
    return x / (np.abs(x).max() or 1)


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
    if i < 0:                      # bắt đầu trước giây 0: cắt bớt phần đầu
        sig, i = sig[-i:], 0
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
CUOI = load_sfx_early('nhac-cuoi') if BROLL else None
PIANO = load_sfx_early('nhac-piano') if BROLL else None     # Sad Emotional Piano: đoạn Thoa → sứ mệnh
EPIC = load_sfx_early('nhac-epic') if BROLL else None       # Epic Cinematic: tự quyết → cao trào → kết
if PIANO is not None and EPIC is not None:
    CUOI = 'hai-bai'
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
    for st, en, prog, style, vol in ([] if CUOI is not None else PLAN):  # noqa: nhạc tự tạo khi chưa có bài
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
    if isinstance(CUOI, str):
        rms = lambda x: np.sqrt(np.mean(x ** 2)) or 1e-9
        ref = rms(music[:int(30 * SR)])
        db = lambda d: 10 ** (d / 20)
        # Piano: phần bùng lên của bài (giây 42) rơi đúng lúc Thoa bắt đầu xây kênh
        P_OFF = T_SUMENH - 42.0
        pl = np.zeros(N); add(pl, PIANO, P_OFF)
        q_rms = rms(PIANO[:int(40 * SR)]); b_rms = rms(PIANO[int(44 * SR):int(84 * SR)])
        gp = np.where(tt < T_SUMENH - 1, ref * db(0) / q_rms, ref * db(6.5) / b_rms)
        k = int(1.2 * SR); cs = np.cumsum(np.concatenate([np.full(k // 2, gp[0]), gp, np.full(k - k // 2, gp[-1])])); gp = (cs[k:] - cs[:-k])[:len(gp)] / k   # trung bình trượt nhanh
        X0, X1 = T_TUQUYET - 2.0, T_TUQUYET + 1.5            # piano nhường chỗ cho Epic
        pl *= gp * (1 - np.clip((tt - X0) / (X1 - X0), 0, 1)) * np.clip((tt - P_OFF) / 1.5, 0, 1)
        # Epic: điểm nhấn mạnh nhất (giây 147.5) trùng câu "Không, cái này tôi chưa cần"; bài tự kết cùng video
        E_OFF = T_KHONG - 147.5
        ep = np.zeros(N); add(ep, EPIC, E_OFF)
        ge = ref * db(10) / rms(EPIC[int(100 * SR):int(155 * SR)])
        ep *= ge * np.clip((tt - X0) / (X1 - X0), 0, 1) ** 1.5
        # Tiếng mưa nền lúc cô bé đứng trước cửa spa (lấp khoảng lặng sau nhạc kinh dị)
        noise = rng.standard_normal(N)
        rain_s = np.convolve(noise, np.ones(6) / 6, 'same') - np.convolve(noise, np.ones(60) / 60, 'same')
        for _ in range(140):
            at = T_THOA - 1.5 + rng.random() * 5.5
            i = int(at * SR); n = int(.03 * SR)
            if i + n < N: rain_s[i:i + n] += rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 120) * 2.5
        rain_env = np.clip((tt - (T_THOA - 2.2)) / 1.2, 0, 1) * np.clip((P_OFF + 2.5 - tt) / 2.0, 0, 1)
        arr = pl + ep + rain_s * rain_env * ref * db(-4) / rms(rain_s[int(T_THOA * SR):int((T_THOA + 2) * SR)])
        print(f'nhạc B-roll: piano từ {P_OFF:.1f}s (bùng lên {T_SUMENH:.1f}s) → Epic vào {X0:.1f}–{X1:.1f}s → cao trào {T_KHONG:.1f}s → bài kết {E_OFF + 162:.1f}s')
        PLAN = []
    elif CUOI is not None:
        # Bài nhạc anh chọn: đặt đoạn cao trào của bài trùng câu "Không, cái này tôi chưa cần"
        cx = CUOI.mean(1) if CUOI.ndim > 1 else CUOI
        hop = SR // 10
        e = np.sqrt(np.convolve(cx ** 2, np.ones(hop * 40) / (hop * 40), 'same'))[::hop]   # độ to trượt 4 giây
        lead = np.convolve(e, np.ones(40) / 40, 'same')
        rise = np.zeros(len(e)); rise[80:] = e[80:] - lead[:-80] if len(e) > 80 else 0   # chỗ nhạc bùng lên mạnh nhất
        climax = int(np.argmax(rise[int(20 / .1):]) + 20 / .1) * .1 if len(e) > 300 else len(e) * .1 * .6
        start = T_KHONG - climax
        skip = max(0, (T_THOA - .5) - start)
        seg = cx[int(skip * SR):]
        add(arr, seg, start + skip)
        print(f'nhạc cuối: cao trào của bài ở {climax:.1f}s → đặt trùng {T_KHONG:.1f}s (bắt đầu bài từ {skip:.1f}s)')
        PLAN = [(T_THOA - .5, TOTAL, None, 'bai', 1)]
    # tiếng vút lên và nốt cao trào ngay câu "Không, cái này tôi chưa cần"
    if CUOI is None: add(arr, riser(3.6) * .6, T_KHONG - 3.6)
    if CUOI is None:
        add(arr, swell(1.2) * .5, T_KHONG - 1.2)
        add(arr, kick(1.4), T_KHONG)
        add(arr, strings([midi(n) for n in (50, 62, 66, 69, 74)], 4.5, .7, att=.05), T_KHONG)
        add(arr, piano(midi(74), 4, .6) + piano(midi(78), 4, .5) + piano(midi(81), 4, .45), T_KHONG)
    # cân âm lượng từng đoạn theo mức nhạc mở đầu (0–30s): dâng dần tới cao trào
    rms = lambda x: np.sqrt(np.mean(x ** 2)) or 1e-9
    ref = rms(music[:int(30 * SR)])
    target = {'lang': 1, 'di': 3.5, 'day': 6, 'don': 9, 'cao': 13, 'bai': 6}
    gain = np.ones(N) if isinstance(CUOI, str) else np.zeros(N)
    for st, en, prog, style, vol in PLAN:
        i0, i1 = int(max(st, 0) * SR), int(min(en, TOTAL) * SR)
        g = ref * 10 ** (target[style] / 20) / rms(arr[i0:i1])
        gain[i0:i1] = g
    k = int(.8 * SR)
    if not isinstance(CUOI, str):
        gain = np.convolve(gain, np.ones(k) / k, 'same')        # chuyển mức mượt giữa các đoạn
    arr *= gain
    if not isinstance(CUOI, str):
        arr *= np.clip((TOTAL - tt) / 3.5, 0, 1)      # khép lại, nhỏ dần
        arr *= np.clip((tt - (T_THOA - .5)) / 2.5, 0, 1)
    else:
        arr *= np.clip((TOTAL + .8 - tt) / 1.5, 0, 1)  # bài tự kết; chỉ vuốt nhẹ khung cuối
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
    # Chỉ giữ whoosh ở các cú chuyển thật sự cần: chuyển hồi, cú sốc, bước ngoặt
    BW = {'02-mu-roi': 'whoosh-3', '08-soi-da': 'whoosh-14',
          '14-quay-di': 'whoosh-5', '21-tot-nghiep-lui-ra': 'whoosh-5', '23a-om-mat': 'whoosh-5',
          '24-den-tim-thoa': 'whoosh-18', '32-roi-sai-gon': 'whoosh-14', '34-lang-dai-hoc': 'whoosh-18',
          '39-den-vong': 'whoosh-18', '46-buoc-vao-spa': 'whoosh-18', '50-vao-khung': 'whoosh-18'}
    shots_b = {x['id']: x['start'] for x in json.loads((DIR / 'broll/shots.json').read_text())}
    for sid, name in BW.items():
        if name not in cache:
            got = load_sfx(name)
            w = got[0]; env = np.convolve(np.abs(w), np.ones(2205) / 2205, 'same')
            act = w[env > env.max() * .1]
            cache[name] = (w / (np.sqrt(np.mean(act ** 2)) or 1) * .1, env.argmax() / SR)
        w, peak = cache[name]
        add(sfx, w * LOUDER.get(name, 1) * .7, max(0, shots_b[sid] - .02 - peak))   # nhỏ hơn bản hoạt hình cho đỡ thô
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
if boom and BROLL:
    bb = boom[0]; envb = np.convolve(np.abs(bb), np.ones(441) / 441, 'same')
    add(sfx, bb * .28, max(0, 3.4 + .02 - np.argmax(envb > envb.max() * .3) / SR))   # boom nhẹ ở hook
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
# Tiếng khóc nấc của cô bé (sfx/khoc.*): cắt từng đoạn trong file, đặt vào các cảnh khóc
khoc = load_sfx('khoc') if BROLL else None
if khoc is not None:
    kx = khoc[0]
    SHK = {x['id']: (x['start'], x['d']) for x in json.loads((DIR / 'broll/shots.json').read_text())}
    # (cú máy, vào sau bao lâu, đoạn trong file từ–đến (giây), độ to): chọn đúng nhịp cho từng cảnh
    CUES = [('14-quay-di', 1.0, .3, 1.1, .5),          # sụt sịt khi quay mặt khỏi gương
            ('18-bat-khoc', .05, 2.3, 3.3, .85),        # nấc bật lên
            ('23a-om-mat', 0, 3.85, 5.45, 1.0),         # tràng nấc to nhất lúc ôm mặt
            ('23b-dem-mua', .1, 6.85, 8.1, .6),         # hít vào nghẹn, nấc nhỏ
            ('25a-ke-chuyen', .2, 1.3, 3.3, .5)]        # nấc nhỏ khi kể chuyện với Thoa
    env = np.convolve(np.abs(kx), np.ones(2205) / 2205, 'same')
    act = kx[env > env.max() * .1]
    kx = kx / (np.sqrt(np.mean(act ** 2)) or 1) * .1
    for sid, dt, a0, a1, g in CUES:
        seg = kx[int(a0 * SR):int(a1 * SR)].copy(); f = int(.08 * SR)
        seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
        add(sfx, seg * g * 1.6, SHK[sid][0] + dt)
    print('tiếng khóc:', khoc[1], len(CUES), 'chỗ')
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
    if BROLL:
        # HOOK 0:00–0:10: nền rợn (phần mở đầu của nhạc kinh dị) + piano chạy ngược hút vào "Không ngờ…" + boom trầm nhẹ
        HOOK_END, HIT = 9.8, 3.4
        th = np.arange(N) / SR
        duckh = 1 - .7 * np.clip((HOOK_END + 1.6 - th) / 1.6, 0, 1)          # piano ấm nhỏ lại trong hook
        L, R = L * duckh, R * duckh
        seg = hx[:int((HOOK_END + 1.5) * SR)].copy()
        fo = np.clip((HOOK_END + 1.2 - th[:len(seg)]) / 1.6, 0, 1)[:, None]
        fi = np.clip(th[:len(seg)] / .4, 0, 1)[:, None]
        seg = seg * fo * fi * (1 + 1.6 * np.clip((3.0 - th[:len(seg)]) / 3.0, 0, 1))[:, None]   # giây đầu đủ to để bắt tai
        gh = piano_rms * 10 ** (-1 / 20) / (np.sqrt(np.mean(seg[int(1 * SR):int(9 * SR)] ** 2)) or 1)
        add(L, seg[:, 0] * gh, 0); add(R, seg[:, 1] * gh, 0)
        if PIANO is not None:
            rv = PIANO[int(42.0 * SR):int(44.4 * SR)][::-1].copy()              # hợp âm piano đảo chiều: vuốt lên
            rv *= np.linspace(0, 1, len(rv)) ** 2
            rv = rv / (np.sqrt(np.mean(rv ** 2)) or 1) * piano_rms * 10 ** (1 / 20)
            add(L, rv, HIT - len(rv) / SR); add(R, rv, HIT - len(rv) / SR)
        print(f'hook: nền rợn 0–{HOOK_END}s, piano ngược hút vào {HIT}s')
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
