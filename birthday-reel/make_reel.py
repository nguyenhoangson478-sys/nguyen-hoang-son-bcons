#!/usr/bin/env python3
"""Dựng video dọc 9:16 dài 10 giây kiểu "champagne nổ → đen trắng quay chậm → Happy Birthday"
từ MỘT ảnh tĩnh.

Dòng thời gian mặc định:
  0.00 – 0.45s  Đèn flash máy ảnh loé lên, lộ ảnh
  0.45 – 3.85s  Đẩy máy chậm, nền và người tách lớp (parallax), lá thu rơi, rung tay nhẹ
  3.85 – 4.40s  Zoom dồn dập + âm thanh rít lên
  4.40s         BÙNG: loé sáng, rung máy, nút chai bay, champagne phun thành cột
  5.10s         Cắt sang ĐEN TRẮNG, tốc độ hãm về gần như đứng hình
  5.25 – 5.95s  Chữ thư pháp hiện dần (mờ → nét)
  9.60 – 10.0s  Mờ dần về đen

Ví dụ:
  python make_reel.py --photo anh.jpg --text "Happy Birthday 30" --out reel.mp4
"""
import argparse
import math
import os
import subprocess
import sys
import tempfile
import wave

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS = 1080, 1920, 30
MARGIN = 1.2  # ảnh nền được dựng lớn hơn khung 20% để có chỗ zoom và rung máy
HERE = os.path.dirname(os.path.abspath(__file__))

DURATION = 10.0
T_FLASH = 0.0
T_PUNCH = 3.85
T_BURST = 4.40
T_BW = 5.10
T_TEXT = 5.25
T_FADE = 9.60
SLOWMO = 0.07  # tốc độ còn lại sau khi hãm (7%)


# ----------------------------------------------------------------------------- tiện ích

def ease_in_out(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)


def ease_in(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * x


def world_time(t):
    """Thời gian của "thế giới" (hạt, lá): chạy thật đến T_BW rồi hãm về SLOWMO trong 0.3s."""
    if t <= T_BW:
        return t
    ramp = 0.3
    dt = t - T_BW
    if dt <= ramp:
        # tốc độ giảm tuyến tính 1 → SLOWMO, lấy tích phân
        return T_BW + dt - (1 - SLOWMO) * dt * dt / (2 * ramp)
    return T_BW + ramp - (1 - SLOWMO) * ramp / 2 + SLOWMO * (dt - ramp)


def world_rate(t):
    if t <= T_BW:
        return 1.0
    dt = t - T_BW
    return 1 - (1 - SLOWMO) * min(dt / 0.3, 1.0)


# ----------------------------------------------------------------------------- chuẩn bị ảnh

def trim_black_bars(img):
    """Bỏ viền đen trên/dưới/trái/phải (ảnh chụp màn hình điện thoại hay có)."""
    a = np.asarray(img.convert("L"), dtype=np.float32)
    rows = np.where(a.mean(axis=1) > 14)[0]
    cols = np.where(a.mean(axis=0) > 14)[0]
    if len(rows) == 0 or len(cols) == 0:
        return img
    return img.crop((int(cols[0]), int(rows[0]), int(cols[-1]) + 1, int(rows[-1]) + 1))


def cover_resize(img, w, h):
    sw, sh = img.size
    s = max(w / sw, h / sh)
    img = img.resize((max(w, round(sw * s)), max(h, round(sh * s))), Image.LANCZOS)
    x = (img.width - w) // 2
    y = (img.height - h) // 2
    return img.crop((x, y, x + w, y + h))


def person_mask(img):
    try:
        from rembg import new_session, remove
    except ImportError:
        print("  (không có rembg → bỏ hiệu ứng tách lớp)")
        return None
    session = new_session("u2net_human_seg")
    m = remove(img, session=session, only_mask=True, post_process_mask=True)
    m = np.asarray(m.convert("L"), dtype=np.float32) / 255.0
    if m.mean() < 0.01:
        print("  (không nhận ra người trong ảnh → bỏ hiệu ứng tách lớp)")
        return None
    return cv2.GaussianBlur(m, (0, 0), 1.5)


def grade(rgb, kind):
    """Chỉnh màu kiểu 'đèn flash điện thoại ban đêm': nền tối ấm, người sáng."""
    x = rgb.astype(np.float32) / 255.0
    if kind == "bg":
        lum = x @ np.array([0.299, 0.587, 0.114], np.float32)
        x = x * 0.72 + lum[..., None] * 0.28           # giảm bão hoà
        x = x * np.array([1.06, 0.93, 0.74], np.float32)  # ấm
        x = np.power(np.clip(x, 0, 1), 1.35) * 0.55     # tối + sâu
    else:
        x = x * np.array([1.05, 1.0, 0.92], np.float32)
        x = np.clip((x - 0.5) * 1.12 + 0.52, 0, 1)      # tương phản nhẹ
    return np.clip(x, 0, 1)


def prepare(photo_path, use_cutout):
    img = trim_black_bars(Image.open(photo_path).convert("RGB"))
    BW, BH = int(W * MARGIN), int(H * MARGIN)
    base = cover_resize(img, BW, BH)
    rgb = np.asarray(base)

    mask = person_mask(base) if use_cutout else None
    if mask is None:
        # không tách được: một lớp duy nhất, coi trung tâm ảnh là "người"
        yy, xx = np.mgrid[0:BH, 0:BW].astype(np.float32)
        soft = np.exp(-(((xx - BW / 2) / (BW * 0.35)) ** 2 + ((yy - BH * 0.45) / (BH * 0.35)) ** 2))
        g = grade(rgb, "bg") * (1 - soft[..., None]) + grade(rgb, "fg") * soft[..., None]
        return dict(bg=g, fg=None, alpha=None, bbox=(BW * 0.3, BH * 0.25, BW * 0.7, BH * 0.95))

    hard = (mask > 0.3).astype(np.uint8)
    ys, xs = np.where(hard > 0)
    bbox = (xs.min(), ys.min(), xs.max(), ys.max())

    # vá chỗ người đứng trên lớp nền (làm ở 1/4 kích thước cho nhanh)
    dil = cv2.dilate(hard, np.ones((31, 31), np.uint8))
    small = cv2.resize(rgb, (BW // 4, BH // 4), interpolation=cv2.INTER_AREA)
    msmall = cv2.resize(dil * 255, (BW // 4, BH // 4), interpolation=cv2.INTER_NEAREST)
    filled = cv2.inpaint(small, msmall, 12, cv2.INPAINT_TELEA)
    filled = cv2.resize(filled, (BW, BH), interpolation=cv2.INTER_CUBIC)
    bg_rgb = np.where(dil[..., None] > 0, filled, rgb)
    bg_rgb = cv2.GaussianBlur(bg_rgb, (0, 0), 2.2)  # nền hơi nhoè như ống kính

    return dict(bg=grade(bg_rgb, "bg"), fg=grade(rgb, "fg"), alpha=mask, bbox=bbox)


# ----------------------------------------------------------------------------- máy quay

def camera_zoom(t):
    if t < T_PUNCH:
        z = 1.0 + 0.05 * ease_in_out(t / T_PUNCH)
    elif t < T_BURST:
        z = 1.05 + 0.09 * ease_in((t - T_PUNCH) / (T_BURST - T_PUNCH))
    else:
        z = 1.14 + 0.035 * math.exp(-(t - T_BURST) / 0.09)  # giật nhẹ lúc nổ
        if t > T_BW:
            z += 0.06 * (t - T_BW) / (DURATION - T_BW)
    return z


def camera_shake(t, rng_phase):
    p1, p2, p3, p4 = rng_phase
    rate = world_rate(t)
    dx = 3.2 * math.sin(2 * math.pi * 0.37 * t + p1) + 2.1 * math.sin(2 * math.pi * 0.83 * t + p2)
    dy = 2.6 * math.sin(2 * math.pi * 0.29 * t + p3) + 1.8 * math.sin(2 * math.pi * 0.71 * t + p4)
    dx, dy = dx * rate, dy * rate
    if t >= T_BURST:
        k = math.exp(-(t - T_BURST) / 0.16) * (1.0 if t < T_BW else 0.15)
        dx += 34 * k * math.sin(2 * math.pi * 21 * (t - T_BURST) + p1)
        dy += 26 * k * math.sin(2 * math.pi * 17 * (t - T_BURST) + p3)
    return dx, dy


def warp_layer(img, z, focus, shake, BW, BH, interp=cv2.INTER_LINEAR):
    s = z
    fx, fy = focus
    hw, hh = W / 2 / s, H / 2 / s
    cx = min(max(fx, hw + 2), BW - hw - 2)
    cy = min(max(fy, hh + 2), BH - hh - 2)
    M = np.array([[s, 0, W / 2 - s * cx + shake[0]],
                  [0, s, H / 2 - s * cy + shake[1]]], np.float32)
    return cv2.warpAffine(img, M, (W, H), flags=interp, borderMode=cv2.BORDER_REFLECT)


# ----------------------------------------------------------------------------- champagne

class Burst:
    def __init__(self, origin, tilt_deg, seed):
        rng = np.random.default_rng(seed)
        self.origin = np.array(origin, np.float32)
        base = math.radians(-90 + tilt_deg)
        self.g = np.array([0, 2300], np.float32)

        def make(n, speed_mu, speed_sig, spread, spawn, k_lo, k_hi, jitter):
            ang = base + rng.normal(0, spread, n)
            spd = np.clip(rng.lognormal(math.log(speed_mu), speed_sig, n), 250, 4200)
            v = np.stack([np.cos(ang) * spd, np.sin(ang) * spd], 1).astype(np.float32)
            o = self.origin + rng.normal(0, jitter, (n, 2)).astype(np.float32)
            t0 = (spawn * rng.beta(1.0, 3.0, n)).astype(np.float32)
            k = rng.uniform(k_lo, k_hi, n).astype(np.float32)
            return dict(v=v, o=o, t0=t0, k=k)

        self.drops = make(2600, 2100, 0.38, 0.17, 0.45, 0.5, 1.5, 18)
        self.drops["r"] = (1.0 + 5.5 * rng.random(2600) ** 3.2).astype(np.float32)
        self.drops["b"] = rng.uniform(0.55, 1.0, 2600).astype(np.float32)
        self.mist = make(1400, 1300, 0.6, 0.45, 0.6, 1.0, 2.5, 30)
        self.foam = make(340, 1250, 0.55, 0.28, 0.30, 1.6, 3.0, 26)
        self.foam["r"] = rng.uniform(5, 20, 340).astype(np.float32)
        self.cork_v = np.array([math.cos(base + 0.12) * 3900, math.sin(base + 0.12) * 3900], np.float32)

    def pos(self, P, tau):
        """Vị trí có lực cản tuyến tính + trọng lực."""
        t = np.maximum(tau - P["t0"], 0)[:, None]
        k = P["k"][:, None]
        term = self.g / k
        e = np.exp(-k * t)
        return P["o"] + term * t + (P["v"] - term) * (1 - e) / k, (tau >= P["t0"])

    def draw(self, tau, shutter, offset, bw):
        """Trả về (lớp giọt, lớp bọt) dạng float32 0..1, kích thước H×W."""
        drops = np.zeros((H, W), np.float32)
        foam = np.zeros((H, W), np.float32)
        if tau < 0:
            return drops, foam
        off = np.array(offset, np.float32)
        p1, alive = self.pos(self.drops, tau)
        p0, _ = self.pos(self.drops, max(tau - shutter, 0))
        p1 += off
        p0 += off
        for i in np.where(alive)[0]:
            x1, y1 = p1[i]
            if not (-60 < x1 < W + 60 and -60 < y1 < H + 60):
                continue
            x0, y0 = p0[i]
            r = float(self.drops["r"][i])
            cv2.line(drops, (int(x0 * 4), int(y0 * 4)), (int(x1 * 4), int(y1 * 4)),
                     float(self.drops["b"][i]), max(1, int(r * 0.9)), cv2.LINE_AA, 2)
            if r > 3.2:
                cv2.circle(drops, (int(x1 * 4), int(y1 * 4)), int(r * 4), 1.0, -1, cv2.LINE_AA, 2)

        pm, alive_m = self.pos(self.mist, tau)
        pm += off
        for (x, y), a in zip(pm[alive_m], np.ones(alive_m.sum())):
            if 0 <= x < W and 0 <= y < H:
                cv2.circle(drops, (int(x), int(y)), 1, 0.45, -1, cv2.LINE_AA)

        pf, alive_f = self.pos(self.foam, tau)
        pf += off
        fade = 0.75 * math.exp(-max(tau - 0.35, 0) / 0.45)
        for i in np.where(alive_f)[0]:
            x, y = pf[i]
            if -80 < x < W + 80 and -80 < y < H + 80:
                cv2.circle(foam, (int(x), int(y)), int(self.foam["r"][i]), 0.9 * fade, -1, cv2.LINE_AA)
        foam = cv2.GaussianBlur(foam, (0, 0), 11)
        return np.clip(drops, 0, 1), np.clip(foam, 0, 1)

    def cork(self, tau, offset):
        if tau < 0 or tau > 0.6:
            return None
        g = self.g
        p = self.origin + self.cork_v * tau + 0.5 * g * tau * tau + np.array(offset, np.float32)
        return p, tau * 38.0


# ----------------------------------------------------------------------------- lá thu

class Leaves:
    def __init__(self, n, seed):
        rng = np.random.default_rng(seed)
        self.x0 = rng.uniform(-0.05, 1.05, n) * W
        self.y0 = rng.uniform(-1.2, 0.9, n) * H
        self.vy = rng.uniform(70, 190, n)
        self.sway = rng.uniform(25, 70, n)
        self.freq = rng.uniform(0.35, 0.9, n)
        self.phase = rng.uniform(0, 6.28, n)
        self.size = rng.uniform(11, 30, n)
        self.spin = rng.uniform(-2.2, 2.2, n)
        self.depth = rng.random(n)  # >0.8 = lá sát ống kính, to và nhoè
        pal = np.array([[214, 120, 38], [190, 92, 30], [228, 154, 52], [150, 72, 30], [205, 140, 60]])
        self.col = pal[rng.integers(0, len(pal), n)] / 255.0

    def draw(self, wt):
        layer = np.zeros((H, W, 3), np.float32)
        alpha = np.zeros((H, W), np.float32)
        near_l = np.zeros((H, W, 3), np.float32)
        near_a = np.zeros((H, W), np.float32)
        for i in range(len(self.x0)):
            y = (self.y0[i] + self.vy[i] * wt) % (H * 1.25) - H * 0.12
            x = self.x0[i] + self.sway[i] * math.sin(2 * math.pi * self.freq[i] * wt + self.phase[i])
            near = self.depth[i] > 0.82
            s = self.size[i] * (2.3 if near else 1.0)
            ang = self.spin[i] * wt + self.phase[i]
            # hình lá: hình thoi bo tròn, lật theo trục để giả xoay 3D
            flip = 0.35 + 0.65 * abs(math.cos(1.3 * wt + self.phase[i]))
            pts = []
            for a in np.linspace(0, 2 * math.pi, 14, endpoint=False):
                rr = s * (0.55 + 0.45 * abs(math.cos(a)) ** 0.5)
                lx, ly = rr * math.cos(a), rr * math.sin(a) * 0.48 * flip
                pts.append((x + lx * math.cos(ang) - ly * math.sin(ang), y + lx * math.sin(ang) + ly * math.cos(ang)))
            pts = np.array(pts, np.int32)
            L, A = (near_l, near_a) if near else (layer, alpha)
            c = self.col[i] * (0.55 if not near else 0.8)
            cv2.fillPoly(L, [pts], tuple(float(v) for v in c), cv2.LINE_AA)
            cv2.fillPoly(A, [pts], 0.92, cv2.LINE_AA)
        near_l = cv2.GaussianBlur(near_l, (0, 0), 6)
        near_a = cv2.GaussianBlur(near_a, (0, 0), 6)
        return (layer, alpha), (near_l, near_a)


def over(dst, src, a):
    return dst * (1 - a[..., None]) + src * a[..., None]


# ----------------------------------------------------------------------------- chữ

def render_text(text, font_path, max_w):
    size = 200
    font = ImageFont.truetype(font_path, size)
    box = font.getbbox(text)
    tw = box[2] - box[0]
    size = int(size * max_w / tw)
    font = ImageFont.truetype(font_path, size)
    box = font.getbbox(text)
    pad = int(size * 0.5)
    tw, th = box[2] - box[0], box[3] - box[1]
    canvas = (tw + pad * 2, th + pad * 2)
    txt = Image.new("L", canvas, 0)
    ImageDraw.Draw(txt).text((pad - box[0], pad - box[1]), text, font=font, fill=255)
    shadow = txt.filter(ImageFilter.GaussianBlur(size * 0.07))
    glow = txt.filter(ImageFilter.GaussianBlur(size * 0.16))
    a_txt = np.asarray(txt, np.float32) / 255
    a_sh = np.asarray(shadow, np.float32) / 255 * 0.65
    a_gl = np.asarray(glow, np.float32) / 255 * 0.35
    return a_txt, a_sh, a_gl


def place_text(frame, layers, t, cy):
    if t < T_TEXT:
        return frame
    p = ease_in_out((t - T_TEXT) / 0.7)
    a_txt, a_sh, a_gl = layers
    scale = 1.07 - 0.07 * p
    blur = 14 * (1 - p)
    hh, ww = a_txt.shape
    nw, nh = int(ww * scale), int(hh * scale)
    out = []
    for a in (a_txt, a_sh, a_gl):
        a = cv2.resize(a, (nw, nh), interpolation=cv2.INTER_AREA)
        if blur > 0.3:
            a = cv2.GaussianBlur(a, (0, 0), blur)
        out.append(a * p)
    a_txt, a_sh, a_gl = out
    x0, y0 = W // 2 - nw // 2, int(cy - nh / 2)
    # cắt theo khung hình
    sx0, sy0 = max(0, -x0), max(0, -y0)
    dx0, dy0 = max(0, x0), max(0, y0)
    w_ = min(nw - sx0, W - dx0)
    h_ = min(nh - sy0, H - dy0)
    if w_ <= 0 or h_ <= 0:
        return frame
    reg = frame[dy0:dy0 + h_, dx0:dx0 + w_]
    sl = (slice(sy0, sy0 + h_), slice(sx0, sx0 + w_))
    sh_off = 6
    sh = np.zeros_like(a_sh[sl])
    sh[sh_off:, :] = a_sh[sl][:-sh_off, :]
    reg = reg * (1 - sh[..., None])                         # bóng đổ
    reg = 1 - (1 - reg) * (1 - a_gl[sl][..., None] * 0.9)   # quầng sáng (screen)
    reg = over(reg, np.ones_like(reg), a_txt[sl])            # chữ trắng
    frame[dy0:dy0 + h_, dx0:dx0 + w_] = reg
    return frame


# ----------------------------------------------------------------------------- âm thanh

SR = 44100


def _env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(t / max(a, 1e-4), 1.0) * np.exp(-t / d)


def _reverb(x, seconds=2.2, mix=0.35, seed=1):
    rng = np.random.default_rng(seed)
    n = int(SR * seconds)
    ir = rng.normal(0, 1, n) * np.exp(-np.arange(n) / (SR * seconds / 6.5))
    ir[0] = 0
    wet = np.real(np.fft.irfft(np.fft.rfft(x, len(x) + n) * np.fft.rfft(ir, len(x) + n)))[:len(x)]
    wet /= np.max(np.abs(wet)) + 1e-9
    return x * (1 - mix) + wet * mix * (np.max(np.abs(x)) + 1e-9)


def _lowpass(x, cutoff):
    a = math.exp(-2 * math.pi * cutoff / SR)
    y = np.zeros_like(x)
    acc = 0.0
    # lọc một cực, viết bằng lfilter đơn giản qua cumsum không ổn định → dùng scipy nếu có
    try:
        from scipy.signal import lfilter
        return lfilter([1 - a], [1, -a], x)
    except ImportError:
        for i, v in enumerate(x):
            acc = (1 - a) * v + a * acc
            y[i] = acc
        return y


def _note(freq, dur, kind="pad"):
    n = int(SR * dur)
    t = np.arange(n) / SR
    if kind == "pad":
        x = sum(np.sin(2 * math.pi * freq * m * t * (1 + 0.003 * j)) / (m * m)
                for j, m in enumerate((1, 2, 3)))
        x += 0.6 * np.sin(2 * math.pi * freq * 1.004 * t)
        return x * np.minimum(t / 0.8, 1) * np.minimum((dur - t) / 0.8, 1).clip(0, 1)
    if kind == "pluck":
        x = np.sin(2 * math.pi * freq * t) + 0.35 * np.sin(2 * math.pi * freq * 2 * t)
        return x * _env(n, 0.004, 0.45)
    if kind == "bell":  # hộp nhạc
        x = (np.sin(2 * math.pi * freq * t) + 0.45 * np.sin(2 * math.pi * freq * 3.01 * t) * np.exp(-t / 0.25)
             + 0.25 * np.sin(2 * math.pi * freq * 4.2 * t) * np.exp(-t / 0.12))
        return x * _env(n, 0.002, 0.9)
    raise ValueError(kind)


def _add(buf, x, at, gain=1.0):
    i = int(at * SR)
    j = min(len(buf), i + len(x))
    if j > i:
        buf[i:j] += x[:j - i] * gain


def make_audio(path, music=True, seed=3):
    rng = np.random.default_rng(seed)
    n = int(SR * DURATION)
    mus = np.zeros(n)
    sfx = np.zeros(n)
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)

    if music:
        # nền trước khi nổ: hợp âm mơ màng + arpeggio, tắt dần trước cú nổ
        chords = [(57, 60, 64, 67), (53, 57, 60, 64)]  # Am7, Fmaj7
        for ci, ch in enumerate(chords):
            for m in ch:
                _add(mus, _note(hz(m), 2.2, "pad"), ci * 1.9, 0.10)
        arp = [69, 72, 76, 72, 65, 69, 72, 69]
        for i, m in enumerate(arp):
            _add(mus, _note(hz(m), 0.9, "pluck"), 0.45 + i * 0.42, 0.16)
        cut = int(T_PUNCH * SR)
        mus[cut:] *= np.exp(-np.arange(n - cut) / (SR * 0.15))

        # sau khi nổ: hợp âm C lớn ngân dài + giai điệu Happy Birthday bằng hộp nhạc
        for m in (48, 55, 60, 64, 67):
            _add(mus, _note(hz(m), DURATION - T_BW, "pad"), T_BW, 0.09)
        q = 0.52
        melody = [(67, 0.75), (67, 0.25), (69, 1), (67, 1), (72, 1), (71, 2)]
        tt = T_TEXT + 0.2
        for m, beats in melody:
            _add(mus, _note(hz(m + 12), 2.0, "bell"), tt, 0.20)
            tt += beats * q
        mus = _reverb(mus, 2.5, 0.35)

    # SFX: tiếng màn trập lúc mở đầu
    click = rng.normal(0, 1, int(SR * 0.05)) * _env(int(SR * 0.05), 0.0005, 0.008)
    _add(sfx, click, 0.0, 0.5)
    _add(sfx, rng.normal(0, 1, int(SR * 0.04)) * _env(int(SR * 0.04), 0.0005, 0.006), 0.09, 0.35)
    # tiếng rít lên trước khi nổ
    rn = int(SR * (T_BURST - T_PUNCH + 0.15))
    t = np.arange(rn) / SR
    riser = rng.normal(0, 1, rn)
    riser = riser - _lowpass(riser, 300 + 5000 * (t / t[-1]).mean())
    riser *= (t / t[-1]) ** 2.5
    riser += 0.4 * np.sin(2 * math.pi * (200 * t + 900 * t * t)) * (t / t[-1]) ** 2
    _add(sfx, riser, T_PUNCH - 0.15, 0.22)
    # cú nổ: thump trầm + tiếng bốp + xì bọt
    bn = int(SR * 0.6)
    t = np.arange(bn) / SR
    thump = np.sin(2 * math.pi * (95 * t - 60 * t * t)) * np.exp(-t / 0.16)
    crack = rng.normal(0, 1, bn) * np.exp(-t / 0.012)
    _add(sfx, thump, T_BURST, 0.9)
    _add(sfx, crack, T_BURST, 0.55)
    fn = int(SR * 2.4)
    t = np.arange(fn) / SR
    fizz = rng.normal(0, 1, fn)
    fizz = fizz - _lowpass(fizz, 2500)
    fizz *= np.exp(-t / 0.55) * (1 + 0.5 * (rng.random(fn) > 0.997))
    _add(sfx, fizz, T_BURST + 0.01, 0.35)
    # chuyển đen trắng: tiếng "vút" trầm có vang
    wn = int(SR * 1.6)
    t = np.arange(wn) / SR
    whoosh = rng.normal(0, 1, wn)
    whoosh = _lowpass(whoosh, 900) * np.sin(np.pi * np.minimum(t / 1.6, 1)) ** 2
    boom = np.sin(2 * math.pi * (55 * t - 8 * t * t)) * np.exp(-t / 0.7)
    sfx_bw = np.zeros(n)
    _add(sfx_bw, whoosh * 2.5 + boom * 0.6, T_BW - 0.05, 0.5)
    sfx += _reverb(sfx_bw, 2.0, 0.5, seed=7)

    mix = mus + sfx
    fade = int(SR * (DURATION - T_FADE))
    mix[-fade:] *= np.linspace(1, 0, fade)
    mix /= np.max(np.abs(mix)) + 1e-9
    mix *= 0.89
    stereo = np.stack([mix, _reverb(mix, 0.05, 0.2, seed=11)], 1)  # mở rộng stereo nhẹ
    stereo /= np.max(np.abs(stereo)) + 1e-9
    pcm = (stereo * 0.89 * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


# ----------------------------------------------------------------------------- dựng hình

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--photo", required=True, help="ảnh của anh (jpg/png)")
    ap.add_argument("--text", default="Happy Birthday 22", help="chữ hiện ở cuối")
    ap.add_argument("--out", default="birthday_reel.mp4")
    ap.add_argument("--text-y", type=float, default=None, help="vị trí chữ theo chiều dọc, 0..1 (mặc định tự chọn)")
    ap.add_argument("--side", choices=["auto", "left", "right"], default="auto", help="phía champagne phun lên")
    ap.add_argument("--no-cutout", action="store_true", help="không tách người khỏi nền")
    ap.add_argument("--no-music", action="store_true", help="chỉ giữ hiệu ứng âm thanh (để tự ghép nhạc trên TikTok)")
    ap.add_argument("--font", default=os.path.join(HERE, "fonts", "GreatVibes-Regular.ttf"))
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--preview", action="store_true", help="dựng nhanh (mỗi 3 khung lấy 1) để xem thử")
    args = ap.parse_args()

    print("1/4 Chuẩn bị ảnh, tách người khỏi nền…")
    P = prepare(args.photo, not args.no_cutout)
    BW, BH = int(W * MARGIN), int(H * MARGIN)
    x0, y0, x1, y1 = P["bbox"]
    subj_cx = (x0 + x1) / 2
    head = (subj_cx, y0 + (y1 - y0) * 0.12)
    focus_end = (BW / 2 + 0.45 * (head[0] - BW / 2), BH / 2 + 0.30 * (head[1] - BH / 2))

    side = args.side
    if side == "auto":
        side = "left" if subj_cx > BW / 2 else "right"
    ox = W * (0.15 if side == "left" else 0.85)
    burst = Burst((ox, H * 1.02), 6 if side == "left" else -6, args.seed)
    leaves = Leaves(16, args.seed + 1)

    if args.text_y is not None:
        text_cy = args.text_y * H
    else:
        top_screen = (y0 - BH / 2) / MARGIN + H / 2
        text_cy = top_screen - 0.09 * H if top_screen > 0.33 * H else 0.80 * H
        text_cy = max(text_cy, 0.17 * H)
    text_layers = render_text(args.text, args.font, W * 0.80)

    grain_rng = np.random.default_rng(5)
    grains = [grain_rng.normal(0, 1, (H, W)).astype(np.float32) for _ in range(6)]
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    rr = np.sqrt(((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H * 0.48) / (H * 0.62)) ** 2)
    vignette = np.clip(1 - 0.62 * rr ** 2.4, 0.18, 1)
    phase = tuple(np.random.default_rng(args.seed).uniform(0, 6.28, 4))

    tmp = tempfile.mkdtemp()
    wav = os.path.join(tmp, "audio.wav")
    print("2/4 Tạo âm thanh…")
    make_audio(wav, music=not args.no_music)

    print("3/4 Dựng hình…")
    step = 3 if args.preview else 1
    fps = FPS / step
    nframes = int(DURATION * FPS)
    ff = subprocess.Popen([
        "ffmpeg", "-v", "error", "-y",
        "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-",
        "-i", wav,
        "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
        "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-shortest", "-movflags", "+faststart", args.out,
    ], stdin=subprocess.PIPE)

    for fi in range(0, nframes, step):
        t = fi / FPS
        wt = world_time(t)
        z = camera_zoom(t)
        prog = ease_in_out(t / T_BURST)
        focus = (BW / 2 + (focus_end[0] - BW / 2) * prog, BH / 2 + (focus_end[1] - BH / 2) * prog)
        shake = camera_shake(t, phase)

        frame = warp_layer(P["bg"], 1 + (z - 1) * 0.55, focus, (shake[0] * 0.7, shake[1] * 0.7), BW, BH)
        (lf, la), (ln, lna) = leaves.draw(wt)
        frame = over(frame, lf, la)                         # lá ở xa: sau lưng người
        if P["fg"] is not None:
            fg = warp_layer(P["fg"], z, focus, shake, BW, BH)
            a = warp_layer(P["alpha"], z, focus, shake, BW, BH)
            frame = over(frame, fg, a)
        frame *= vignette[..., None]

        # champagne
        tau = wt - T_BURST
        if tau >= 0:
            shutter = 0.55 / FPS * world_rate(t) * step
            drops, foam = burst.draw(tau, shutter, shake, t >= T_BW)
            tint = np.array([1.0, 0.97, 0.86], np.float32)
            glow = cv2.GaussianBlur(drops, (0, 0), 5)
            frame = 1 - (1 - frame) * (1 - glow[..., None] * 0.45 * tint)
            frame = over(frame, np.broadcast_to(tint, frame.shape), drops * 0.95)
            frame = over(frame, np.broadcast_to(np.array([0.98, 0.96, 0.9], np.float32), frame.shape), foam)
            c = burst.cork(tau, shake)
            if c is not None:
                (cx, cy), rot = c
                if -80 < cx < W + 80 and -80 < cy < H + 80:
                    box = cv2.boxPoints(((float(cx), float(cy)), (30, 44), math.degrees(rot)))
                    cl = np.zeros((H, W), np.float32)
                    cv2.fillPoly(cl, [box.astype(np.int32)], 1.0, cv2.LINE_AA)
                    cl = cv2.GaussianBlur(cl, (0, 0), 3)
                    frame = over(frame, np.broadcast_to(np.array([0.55, 0.38, 0.2], np.float32), frame.shape), cl)

        frame = over(frame, ln, lna)                        # lá sát ống kính: trước người

        # loé sáng lúc nổ + tách màu
        if 0 <= t - T_BURST < 0.6:
            d = t - T_BURST
            k = 7 * math.exp(-d / 0.07)
            if k > 0.5:
                s = int(k)
                frame[..., 0] = np.roll(frame[..., 0], s, axis=1)
                frame[..., 2] = np.roll(frame[..., 2], -s, axis=1)
            frame = frame + 0.9 * math.exp(-d / 0.05) * (1 - frame)
            warm = np.exp(-(((xx - ox) / 560) ** 2 + ((yy - H) / 700) ** 2))
            frame = frame + (warm * 0.8 * math.exp(-d / 0.13))[..., None] * np.array([1, 0.85, 0.6], np.float32)

        # đen trắng sau T_BW
        if t >= T_BW:
            lum = frame @ np.array([0.299, 0.587, 0.114], np.float32)
            lum = np.clip((lum - 0.5) * 1.2 + 0.5, 0, 1)
            lum = lum + grains[fi % len(grains)] * 0.035
            frame = np.repeat(lum[..., None], 3, axis=2)

        frame = place_text(frame, text_layers, t, text_cy)

        # mở đầu: flash máy ảnh
        if t < 0.45:
            if t < 0.06:
                frame = frame * (t / 0.06)
            else:
                frame = frame + (1 - frame) * 0.85 * math.exp(-(t - 0.06) / 0.09)
        if t > T_FADE:
            frame = frame * (1 - (t - T_FADE) / (DURATION - T_FADE))

        ff.stdin.write((np.clip(frame, 0, 1) * 255).astype(np.uint8).tobytes())
        if fi % 30 == 0:
            print(f"   {t:4.1f}s / {DURATION:.0f}s", flush=True)

    ff.stdin.close()
    ff.wait()
    print(f"4/4 Xong → {args.out}")


if __name__ == "__main__":
    main()
