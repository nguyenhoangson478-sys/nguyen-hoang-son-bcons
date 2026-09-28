// Hồi IV–V: Thoa ở Sài Gòn → rời phố về Làng Đại học.
function skyline(seed, y0, col, lit = '#FFD9A0', litA = .7, scale = 1) {
  const r = rng(seed); let s = '', x = -40;
  while (x < 1120) {
    const w = (60 + r() * 120) * scale, h = (200 + r() * 700) * scale;
    s += `<rect x="${x}" y="${y0 - h}" width="${w}" height="${h + 400}" fill="${col}"/>`;
    for (let yy = y0 - h + 30; yy < y0 - 20; yy += 34 * scale) for (let xx = x + 12; xx < x + w - 12; xx += 26 * scale)
      if (r() < .32) s += `<rect x="${xx.toFixed(0)}" y="${yy.toFixed(0)}" width="${10 * scale}" height="${14 * scale}" fill="${lit}" opacity="${(litA * (.4 + r() * .6)).toFixed(2)}"/>`;
    if (r() < .3) s += `<rect x="${x + w / 2 - 3}" y="${y0 - h - 60 * scale}" width="6" height="${60 * scale}" fill="${col}"/><circle cx="${x + w / 2}" cy="${y0 - h - 62 * scale}" r="5" fill="#FF4B4B"/>`;
    x += w + 6;
  }
  return s;
}
function neonSign(x, y, text, col, size, flick = 1, rot = 0) {
  return `<g transform="translate(${x},${y}) rotate(${rot})" opacity="${flick}">${glow(0, -size * .35, size * 3, col, .35)}
    <text x="0" y="0" text-anchor="middle" font-family="Be Vietnam Pro" font-size="${size}" font-weight="800" fill="none" stroke="${col}" stroke-width="${size * .09}">${text}</text>
    <text x="0" y="0" text-anchor="middle" font-family="Be Vietnam Pro" font-size="${size}" font-weight="800" fill="#fff" opacity=".85">${text}</text></g>`;
}
const flicker = (t, seed) => (Math.sin(t * 31 + seed * 7) > .92 || Math.sin(t * 7 + seed) > .97) ? .25 : 1;

// ================= HỒI IV: THOA =================
shot('24-muoi-nam', 3.1, (t, p) => {
  setCam(0, 0, 1.04);
  const sweep = (t * .55) % 1, spin = t * 900;
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#2B2230'], [1, '#141019']])}"/>`
    + L(.3, `<rect x="120" y="240" width="520" height="760" fill="#1B2A44"/>${glow(380, 620, 360, '#FF7AB8', .25)}${glow(300, 500, 300, '#6FC8FF', .25)}
      ${Array.from({ length: 12 }, (_, i) => `<rect x="120" y="${250 + i * 62}" width="520" height="30" fill="#0E0B12" opacity=".75"/>`).join('')}
      <circle cx="850" cy="420" r="110" fill="#F4ECE0"/><circle cx="850" cy="420" r="96" fill="#EDE2D2"/>
      <line x1="850" y1="420" x2="${850 + 70 * Math.sin(spin / 57.3)}" y2="${420 - 70 * Math.cos(spin / 57.3)}" stroke="#2B2420" stroke-width="8" stroke-linecap="round"/>
      <line x1="850" y1="420" x2="${850 + 50 * Math.sin(spin / 57.3 / 12)}" y2="${420 - 50 * Math.cos(spin / 57.3 / 12)}" stroke="#2B2420" stroke-width="12" stroke-linecap="round"/>`)
    + L(.5, `<rect x="-100" y="1180" width="1300" height="900" fill="#221A22"/>
      <path d="M80,1180 L1000,1180 L1060,1300 L20,1300 Z" fill="#EFE6DA"/><rect x="40" y="1300" width="1020" height="80" rx="20" fill="#CFC3B4"/>
      ${beam(1080, 0, 200 + sweep * 800, 1300, 20, 200, '#FFE2B0', .35)}
      ${[0, 1, 2, 3].map(i => bottle(700 + i * 70, 1178, .45, ['#E7C9BE', '#DDE6D6', '#F2E3D0', '#C9A45C'][i])).join('')}`)
    + L(.9, figure(260, 1900, 1.15, { back: true, hair: 'bun', col: '#2F4A3F', dark: '#0B0A0F', rim: '#FF9AC8' }), 2);
}, () => ({ tint: '#7A4A8A', tintA: .12, vig: .8, grain: .12 }));

shot('25-nhung-cau-chuyen', 3.4, (t, p) => {
  setCam(0, 0, 1);
  const msgs = ['Da em càng làm càng đỏ…', 'Em lỡ mua cả combo rồi…', 'Em không biết da mình bị gì…', 'Có cần làm tiếp không chị?', 'Chị ơi em sợ soi gương lắm', 'Em đã chi gần hết tiền học…', 'Sao em càng chăm càng tệ?', 'Em có nên dừng không ạ?'];
  const r = rng(51); let s = `<rect width="${W}" height="${H}" fill="${rg([[0, '#1B1E2B'], [1, '#07080C']])}"/>`;
  const cards = [];
  for (let i = 0; i < 26; i++) { cards.push({ x: r() * 1400 - 160, y: r() * 2300 - 190, z0: r(), m: msgs[i % msgs.length], rot: r() * 16 - 8 }); }
  cards.map(c => ({ ...c, z: (c.z0 + t * .22) % 1 })).sort((a, b) => a.z - b.z).forEach(c => {
    const sc = .35 + c.z * 1.6, x = 540 + (c.x - 540) * sc, y = 960 + (c.y - 960) * sc, bl = Math.abs(c.z - .55) * 22, op = clamp(c.z * 3) * clamp((1 - c.z) * 4);
    s += `<g transform="translate(${x},${y}) scale(${sc}) rotate(${c.rot})" opacity="${op.toFixed(2)}"${blur(bl)}><rect x="-230" y="-60" width="460" height="120" rx="36" fill="#F4F1EC"/>${txt(-200, 12, c.m, 28, '#2B2420', 500)}</g>`;
  });
  return s + glow(540, 960, 500, '#9FB8FF', .12);
}, () => ({ tint: '#3A4A7A', tintA: .15, vig: .85, grain: .12 }));

function saigonNight(t, o = {}) {
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#0B0E24'], [.6, '#2A1E48'], [1, '#43285A']])}"/>
    <g${blur(o.b1 ?? 6)}>${skyline(7, 1500, '#141A34', '#FFC98A', .6, 1.2)}</g>
    <g${blur(o.b2 ?? 3)}>${skyline(13, 1700, '#0C1026', '#9FD4FF', .75, 1.5)}</g>`;
}
shot('26a-thoa-cua-kinh', 2.2, (t, p) => {
  setCam(0, 0, 1 + .06 * eio(p));
  return L(.2, saigonNight(t))
    + L(.3, neonSign(300, 900, 'SALE 50%', '#FF4FA0', 90, flicker(t, 1)) + neonSign(760, 1180, 'TRỊ MỤN CẤP TỐC', '#4FE0FF', 58, flicker(t, 2)), 5)
    + L(.5, rain(t, 50, 0, 0, 1080, 1920, 3, 1100, '#C9D8FF', .18) + `<rect x="0" y="0" width="30" height="${H}" fill="#07080C"/><rect x="530" y="0" width="22" height="${H}" fill="#07080C"/>`)
    + L(.8, figure(540, 2050, 1.35, { back: true, hair: 'bun', dark: '#06070B', rim: '#FF8FC8' }))
    + L(.8, `<g opacity=".18">${faceProfile(620, 820, .8, { dark: false })}</g>`, 6);
}, () => ({ tint: '#6A3A9A', tintA: .12, vig: .8, grain: .12 }));

shot('26b-phan-chieu-neon', 2.2, (t, p) => {
  setCam(lerp(-40, 40, eio(p)), 0, 1.1);
  return `<rect width="${W}" height="${H}" fill="#07070C"/>`
    + L(.5, `<g opacity=".95">${faceProfile(640, 900, 1.5, { rim: '#FF8FC8', dark: true })}</g>`)
    + L(.9, `<g style="mix-blend-mode:screen" opacity=".8">${neonSign(360, 700, 'SALE', '#FF4FA0', 150, flicker(t, 3))}${neonSign(620, 1250, 'COMBO SÁNG DA', '#4FE0FF', 70, flicker(t, 4), -4)}${neonSign(250, 1600, 'HOT TREND', '#FFB84F', 80, flicker(t, 5), 3)}</g>`, 4)
    + L(1.1, drops(t, 60, 0, 0, 1080, 1920, 17, .35));
}, () => ({ tint: '#6A3A9A', tintA: .1, vig: .85, grain: .13 }));

shot('27-gap-catalogue', 3.8, (t, p) => {
  setCam(0, 0, 1.05 + .06 * eio(p));
  const close = eio(seq(t, .6, 2.6)), ang = lerp(-170, 0, close);
  const page = (side, content) => `<g transform="translate(540,1080) scale(${side},1)">${content}</g>`;
  const products = (sd) => `<rect x="20" y="-360" width="420" height="720" fill="#FBF7F1"/>${[0, 1, 2, 3].map(i => `<g transform="translate(${120 + (i % 2) * 200},${-220 + Math.floor(i / 2) * 330})">${bottle(0, 80, .7, ['#E7C9BE', '#DDE6D6', '#F2E3D0', '#EDB9A6'][i])}<rect x="-60" y="110" width="120" height="14" rx="7" fill="#C9B8A6"/><rect x="-40" y="136" width="80" height="18" rx="6" fill="#D9735A"/></g>`).join('')}`;
  const flapX = Math.cos(ang / 57.3);
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#2A1F1A'], [1, '#150F0C']])}"/>` + L(.3, glow(700, 600, 700, '#FFD9A0', .35))
    + L(.6, `<rect x="60" y="690" width="960" height="780" rx="10" fill="#0F0B09" opacity=".5"/>` + page(1, products(1))
      + `<g transform="translate(540,1080) scale(${-flapX},1)">${flapX < 0 ? `<rect x="20" y="-360" width="420" height="720" fill="#2F4A3F"/>${txt(230, 0, 'CATALOGUE', 40, '#F7F0E6', 800, 'text-anchor="middle"')}` : products(-1)}</g>`)
    + L(1, hand(540 - 380 * flapX, 1420, lerp(40, -10, close), 1.25, 'open', { sleeve: '#2F4A3F' }), 3);
}, () => ({ tint: '#B98A4A', tintA: .1, vig: .75, grain: .1 }));

shot('28-gach-danh-sach', 2.4, (t, p) => {
  setCam(0, 0, 1.08);
  const items = ['Liệu trình peel da', 'Combo serum 3 bước', 'Laser trị thâm', 'Mặt nạ tái tạo', 'Kem đặc trị cấp tốc'];
  const k = t / .42;
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#D8CCBC'], [1, '#B3A493']])}"/>`
    + L(.6, `<g transform="rotate(-3 540 960)"><rect x="160" y="360" width="760" height="1200" fill="#FBF8F2"/>${txt(220, 470, 'Tư vấn cho em', 44, '#2B2420', 700, 'font-style="italic"')}
      ${items.map((s, i) => { const st = clamp(k - i); return `${txt(230, 600 + i * 170, '□  ' + s, 42, '#3A322C', 500)}${st > 0 ? `<line x1="220" y1="${588 + i * 170}" x2="${220 + 640 * eo(st)}" y2="${582 + i * 170}" stroke="#C0392B" stroke-width="8" stroke-linecap="round"/>` : ''}${st > .8 ? txt(700, 640 + i * 170, 'chưa cần', 34, '#C0392B', 600, 'font-style="italic"') : ''}`; }).join('')}</g>`)
    + L(1, hand(220 + 640 * eo(clamp(k % 1)) + 60, 600 + Math.min(4, Math.floor(k)) * 170 + 300, 20, 1.15, 'pen', { sleeve: '#2F4A3F' }), 2);
}, () => ({ tint: '#B98A4A', tintA: .08, vig: .6, grain: .09 }));

shot('29-cat-chai', 1.9, (t, p) => {
  setCam(0, 0, 1.08);
  const back = eio(seq(t, .2, 1.4));
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#E8DCCD'], [1, '#C4B29E']])}"/>`
    + L(.4, `<rect x="0" y="700" width="1080" height="24" fill="#B59C82"/>${[0, 1, 2].map(i => bottle(250 + i * 140, 700, .8, ['#DDE6D6', '#F2E3D0', '#EDB9A6'][i])).join('')}`, 8)
    + L(.7, `<rect x="120" y="1180" width="840" height="520" rx="16" fill="#D6C2A8"/><rect x="120" y="1180" width="840" height="60" fill="#C2AB8F"/>
      ${bottle(540, lerp(1150, 1450, back), 1.4, '#E7C9BE', '#2B2420', '#fff', 0)}<rect x="100" y="1400" width="880" height="320" rx="16" fill="#CDB89C"/>`)
    + L(1, hand(640, lerp(1400, 1700, back), -8, 1.3, 'hold', { sleeve: '#2F4A3F' }));
}, () => ({ tint: '#C9A45C', tintA: .06, vig: .55, grain: .08 }));

shot('30-ly-nuoc', 2.1, (t, p) => {
  setCam(20 * p, 0, 1.03);
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#F4EDE2'], [1, '#D9CDBD']])}"/>`
    + L(.3, `<rect x="0" y="1180" width="1080" height="800" fill="#EDE4D7"/>${glow(900, 300, 500, '#FFF4DC', .9)}`)
    + L(.5, beam(1050, 150, 300, 1500, 60, 240, '#FFF5E0', .3) + dust(t, 30, 200, 300, 800, 1200, 21))
    + L(.7, `<rect x="560" y="1110" width="380" height="120" rx="18" fill="#FFFFFF"/><rect x="560" y="1110" width="380" height="30" rx="14" fill="#F2EEE8"/>
      <path d="M300,760 L420,760 L400,1180 L320,1180 Z" fill="#E8F2F6" opacity=".55"/><path d="M308,860 L412,860 L400,1180 L320,1180 Z" fill="#CFE3EC" opacity=".55"/>
      <path d="M300,760 L420,760" stroke="#fff" stroke-width="6"/><rect x="316" y="780" width="12" height="380" fill="#fff" opacity=".5"/>
      <ellipse cx="360" cy="1188" rx="90" ry="14" fill="#000" opacity=".08"/>`);
}, () => ({ tint: '#F2D8A8', tintA: .06, lift: .06, vig: .4, grain: .06 }));

shot('31a-nang-som', 2.2, (t, p) => {
  setCam(0, 0, 1.02);
  const sx = lerp(-200, 500, t / 2.2);
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#EFE5D8'], [1, '#D8C9B6']])}"/>`
    + L(.4, `<path d="M${sx},200 L${sx + 420},260 L${sx + 460},1100 L${sx + 40},1060 Z" fill="#FFE8C4" opacity=".7"/>
      ${[0, 1, 2].map(i => `<path d="M${sx + 140 * i + 130},230 L${sx + 140 * i + 150},240 L${sx + 140 * i + 190},1080 L${sx + 140 * i + 170},1075 Z" fill="#D8C9B6" opacity=".8"/>`).join('')}
      <rect x="180" y="1000" width="720" height="26" fill="#B59C82"/>${bottle(540, 1000, .75, '#F2E3D0', '#C9A45C')}`)
    + L(.8, `<rect x="-60" y="1500" width="1200" height="500" fill="#EADFD3"/><path d="M-60,1500 C300,1460 700,1540 1140,1480 L1140,1540 L-60,1560 Z" fill="#F7F0E6"/>`, 10);
}, () => ({ tint: '#F2C98A', tintA: .08, lift: .06, vig: .4, grain: .06 }));

shot('31b-ngu-yen', 2.2, (t, p) => {
  setCam(0, 0, 1.08 + .04 * p);
  const br = Math.sin(t * 1.4) * 4;
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#F4EADC'], [1, '#E3D3BF']])}"/>`
    + L(.5, `<ellipse cx="560" cy="980" rx="560" ry="300" fill="#FBF7F1"/><g transform="translate(560,${980 + br}) rotate(-82)">${faceFront(0, 0, 1.15, { closed: 1, spots: [[-110, 40]], red: .12, expr: 'calm', blushA: .45 })}</g>
      <path d="M-80,1250 C300,1180 700,1260 1160,1200 L1160,2000 L-80,2000 Z" fill="#EFE3D4"/><path d="M-80,1250 C300,1180 700,1260 1160,1200" stroke="#DCCDBB" stroke-width="30" fill="none"/>`)
    + L(.8, beam(1080, 0, 600, 1300, 40, 200, '#FFF1D6', .28) + dust(t, 20, 300, 300, 700, 1000, 31));
}, () => ({ tint: '#F2C98A', tintA: .08, leak: '#FFE8C0', leakA: .3, lift: .06, vig: .4, grain: .06 }));

// ================= HỒI V: RỜI PHỐ =================
shot('32-roi-sai-gon', 2.7, (t, p) => {
  setCam(lerp(-60, 60, p), 0, 1.03);
  const walk = t * 1.1;
  const streaks = Array.from({ length: 14 }, (_, i) => { const r = rng(60 + i), y = 1250 + r() * 220, x = ((r() * 1400 + t * (600 + r() * 900)) % 1600) - 300; return `<rect x="${x}" y="${y}" width="${200 + r() * 300}" height="${4 + r() * 5}" rx="3" fill="${r() < .5 ? '#FF5A5A' : '#FFE9B0'}" opacity=".8"/>`; }).join('');
  return L(.2, saigonNight(t, { b1: 10, b2: 7 }))
    + L(.35, neonSign(260, 820, 'SALE 70%', '#FF4FA0', 96, flicker(t, 6)) + neonSign(800, 700, 'TRỊ MỤN CẤP TỐC', '#4FE0FF', 54, flicker(t, 7)) + neonSign(640, 1060, 'COMBO SÁNG DA', '#FFB84F', 60, flicker(t, 8), -3), 6)
    + L(.5, `<g${blur(6)}>${streaks}</g><rect x="-100" y="1480" width="1300" height="600" fill="#0C0C14"/>
      <rect x="-100" y="1480" width="1300" height="600" fill="${lg([[0, '#FF4FA0', .18], [.5, '#4FE0FF', .08], [1, '#000', 0]])}"/>${rain(t, 40, 0, 0, 1080, 1920, 23, 1300, '#C9D8FF', .15)}`)
    + L(.9, figure(560, 1860, 1.1, { back: true, hair: 'bun', col: '#2F4A3F', dark: '#08080D', rim: '#FF8FC8', suitcase: true, walk }));
}, () => ({ tint: '#6A3A9A', tintA: .1, vig: .8, grain: .12 }));

shot('33-cua-so-xe', 2.7, (t, p) => {
  setCam(0, 0, 1.02);
  const dawn = ease(seq(t, .6, 2.7));
  const lights = Array.from({ length: 22 }, (_, i) => { const r = rng(80 + i), y = 500 + r() * 900, x = ((r() * 1500 - t * (900 + r() * 1400)) % 1500 + 1500) % 1500 - 200; return `<rect x="${x}" y="${y}" width="${120 + r() * 260}" height="${10 + r() * 14}" rx="8" fill="${['#FFD9A0', '#FF8FC8', '#9FD4FF'][i % 3]}" opacity="${.7 * (1 - dawn * .7)}"/>`; }).join('');
  return `<rect width="${W}" height="${H}" fill="${lg([[0, dawn > .5 ? '#F6B98A' : '#1B1E3A'], [1, dawn > .5 ? '#6C5B7A' : '#07080F']])}"/>`
    + `<rect width="${W}" height="${H}" fill="${lg([[0, '#FFD9A8'], [.5, '#E79C8A'], [1, '#5A4A6A']])}" opacity="${dawn}"/>`
    + L(.3, `<g${blur(14)}>${lights}</g>` + `<path d="M-100,1300 C300,1260 700,1320 1180,1280 L1180,1500 L-100,1500 Z" fill="#2A2436" opacity="${.9 - dawn * .4}"/>`)
    + L(.6, drops(t * .3, 90, 60, 300, 960, 1250, 41, .4))
    + L(1, `<rect x="0" y="0" width="${W}" height="280" fill="#101016"/><rect x="0" y="1560" width="${W}" height="360" fill="#101016"/><rect x="0" y="260" width="60" height="1320" fill="#101016"/><rect x="1020" y="260" width="60" height="1320" fill="#101016"/>
      <rect x="40" y="260" width="1000" height="1320" rx="60" fill="none" stroke="#1A1A22" stroke-width="40"/>`)
    + `<g opacity="${.12 * (1 - dawn)}">${faceProfile(700, 900, 1.1, { rim: '#FF8FC8' })}</g>`;
}, (t) => ({ tint: '#7A5A9A', tintA: .08, vig: .75, grain: .11, leak: '#FFD9A0', leakA: .4 * ease(seq(t, 1, 2.7)) }));

function campus(t, o = {}) {
  const { sun = 1 } = o;
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#F8D9B0'], [.45, '#FBE8CC'], [1, '#DDE6D6']])}"/>${glow(760, 700, 520, '#FFF3D6', sun)}
    <g${blur(5)} fill="#C9C6BE">${[[40, 620, 280, 520], [340, 700, 200, 440], [760, 640, 300, 500]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>${Array.from({ length: 24 }, (_, i) => `<rect x="${x + 20 + (i % 6) * (w - 40) / 6}" y="${y + 30 + Math.floor(i / 6) * 90}" width="${(w - 80) / 8}" height="40" fill="#E8E3DA"/>`).join('')}`).join('')}</g>
    <g${blur(3)}>${[60, 250, 470, 700, 900, 1060].map((x, i) => `<rect x="${x - 10}" y="1000" width="20" height="260" fill="#6B5040"/><circle cx="${x}" cy="${980 - (i % 2) * 40}" r="${140 + (i % 3) * 30}" fill="${['#8DA68A', '#7C9879', '#9BB596'][i % 3]}"/>`).join('')}</g>
    <path d="M-100,1250 L1180,1250 L1180,2000 L-100,2000 Z" fill="#CFC7B6"/><path d="M380,1250 L700,1250 L1180,2000 L-100,2000 Z" fill="#B9B1A0"/>`;
}
function cyclist(x, y, s, t, col = '#2A2A33') {
  const a = t * 6;
  return `<g transform="translate(${x},${y}) scale(${s})" fill="${col}" stroke="${col}">
    <circle cx="-70" cy="0" r="55" fill="none" stroke-width="8"/><circle cx="70" cy="0" r="55" fill="none" stroke-width="8"/>
    <path d="M-70,0 L-10,-70 L50,-70 L70,0 M-10,-70 L-30,-110 M50,-70 L60,-110" fill="none" stroke-width="8"/>
    <circle cx="${-10 + Math.cos(a) * 22}" cy="${-20 + Math.sin(a) * 22}" r="6"/>
    <path d="M-30,-110 L0,-230 L30,-230 L20,-120 Z" stroke-width="0"/><circle cx="10" cy="-260" r="30" stroke-width="0"/>
    <path d="M10,-200 L60,-120" stroke-width="16" stroke-linecap="round"/><path d="M0,-130 L${-10 + Math.cos(a) * 22},${-20 + Math.sin(a) * 22}" stroke-width="16" stroke-linecap="round"/></g>`;
}
shot('34-lang-dai-hoc', 2.3, (t, p) => {
  setCam(lerp(-30, 30, p), 0, 1.03);
  return L(.3, campus(t)) + L(.5, beam(760, 700, 200, 1900, 60, 300, '#FFF3D6', .22) + dust(t, 25, 0, 800, 1080, 1000, 44))
    + L(.7, cyclist(((t * 260) % 1400) - 200, 1520, .9, t) + cyclist(((t * 200 + 700) % 1400) - 200, 1650, 1.05, t + 1, '#34303A') + cyclist(1180 - ((t * 230 + 300) % 1400), 1420, .7, t + 2, '#4A4450'));
}, () => ({ tint: '#F2C98A', tintA: .08, leak: '#FFE8C0', leakA: .4, lift: .06, vig: .4, grain: .07 }));

shot('35-bai-co', 1.5, (t, p) => {
  setCam(lerp(-40, 40, p), 0, 1.05);
  const r = rng(90); let dapple = ''; for (let i = 0; i < 30; i++) dapple += glow(r() * 1080, 900 + r() * 1000, 40 + r() * 80, '#FFF4D0', .35 + .2 * Math.sin(t * 2 + i));
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#A9C79A'], [1, '#7FA070']])}"/>`
    + L(.3, `<g${blur(18)}>${[100, 400, 700, 1000].map(x => `<circle cx="${x}" cy="400" r="260" fill="#6E8F62"/>`).join('')}</g>`)
    + L(.6, [[250, '#E6D5C0', 'long'], [540, '#9DB5C9', 'short'], [820, '#EDB9A6', 'long']].map(([x, c, h], i) => figure(x, 1700 + (i % 2) * 40, .8, { col: c, hair: h, armR: i === 1 ? -70 : 0, lean: (i - 1) * 4 })).join('') + dapple);
}, () => ({ tint: '#F2C98A', tintA: .07, leak: '#FFF0C8', leakA: .35, vig: .4, grain: .07 }));

shot('36-vi-mong', 2.2, (t, p) => {
  setCam(0, 0, 1.1 - .05 * p);
  const open = eo(seq(t, 0, .8));
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#8A6A4F'], [1, '#6E5440']])}"/>`
    + L(.6, `<g transform="translate(540,1000)"><rect x="-360" y="-230" width="720" height="460" rx="40" fill="#3A2E28"/><rect x="-330" y="-200" width="660" height="400" rx="30" fill="#4A3C34"/>
      <g transform="translate(0,${-40 * open})"><rect x="-250" y="-190" width="420" height="200" rx="8" fill="#B8D4C2" transform="rotate(-6)"/>${txt(-200, -90, '10.000', 44, '#3A5A48', 800, 'transform="rotate(-6)"')}
      <rect x="-180" y="-150" width="380" height="180" rx="8" fill="#D9C6E4" transform="rotate(4)"/>${txt(-130, -60, '5.000', 44, '#5A3A6A', 800, 'transform="rotate(4)"')}</g>
      ${[[-220, 150], [-160, 170], [180, 160]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="34" fill="#C9A45C"/><circle cx="${x}" cy="${y}" r="24" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="4"/>`).join('')}</g>
      <g transform="translate(830,1500)"><path d="M-130,-200 L130,-200 L110,120 L-110,120 Z" fill="#F4EEE4"/><rect x="-140" y="-230" width="280" height="40" rx="10" fill="#D9735A"/>${txt(0, -40, 'MÌ', 60, '#D9735A', 800, 'text-anchor="middle"')}</g>`);
}, () => ({ tint: '#B98A4A', tintA: .08, vig: .6, grain: .09 }));

shot('37-quang-cao', 2.5, (t, p) => {
  setCam(0, 0, 1.06);
  const ads = [['GIẢM 50% HÔM NAY', '#FF4F7A', '#FFE3EA'], ['Da bạn đang thiếu thứ này?', '#2B2420', '#FFE9A8'], ['TRỊ MỤN CẤP TỐC 7 NGÀY', '#fff', '#D9735A'], ['COMBO SÁNG DA ✨', '#fff', '#7A5AE0'], ['Ai cũng đang dùng!', '#2B2420', '#9FE0C8'], ['MUA 1 TẶNG 1', '#fff', '#FF3B30']];
  const sc = t * 900, glitch = Math.sin(t * 40) > .7 ? 12 : 0;
  const screen = (w, h) => `<rect width="${w}" height="${h}" fill="#fff"/><g transform="translate(0,${-sc % (ads.length * 360)})">${[...ads, ...ads, ...ads].map(([s, fc, bc], i) => `<g transform="translate(20,${40 + i * 360})"><rect width="${w - 40}" height="320" rx="24" fill="${bc}"/>${bottle(w - 140, 280, .9, '#fff', fc)}${txt(30, 90, s, 34, fc, 800)}<rect x="30" y="230" width="200" height="54" rx="27" fill="${fc}"/>${txt(130, 267, 'MUA NGAY', 22, bc, 800, 'text-anchor="middle"')}</g>`).join('')}</g>`;
  return `<rect width="${W}" height="${H}" fill="#0A0A10"/>`
    + L(.6, `<g opacity=".5" transform="translate(${glitch},0)">${phone(540, 960, 720, 1440, 0, screen)}</g>` + `<g style="mix-blend-mode:screen">${phone(540 - glitch, 960, 720, 1440, 0, screen, { glowCol: '#FFD0E0', glowA: .35 })}</g>`);
}, () => ({ tint: '#9A3A6A', tintA: .08, vig: .8, grain: .12 }));

shot('38a-mat-phan-chieu', 2.8, (t, p) => {
  setCam(0, 0, 1 + 1.3 * ei(p));
  const ex = 540, ey = 960;
  return `<rect width="${W}" height="${H}" fill="#1A1210"/>`
    + L(1, `<g transform="translate(${ex},${ey}) scale(5.2)"><path d="M-80,0 C-40,-46 40,-46 80,0 C40,34 -40,34 -80,0 Z" fill="#F4ECE8"/>
      <g${clip('<path d="M-80,0 C-40,-46 40,-46 80,0 C40,34 -40,34 -80,0 Z"/>')}><circle cx="0" cy="-2" r="34" fill="${rg([[0, '#7A5238'], [.7, P.iris], [1, '#150C08']])}"/><circle cx="0" cy="-2" r="15" fill="#070404"/>
        <g opacity=".85"><rect x="-10" y="-16" width="20" height="30" rx="4" fill="#FF4F7A"/><rect x="-7" y="-10" width="14" height="4" fill="#fff"/><rect x="-7" y="-3" width="10" height="3" fill="#fff"/></g>
        <circle cx="-12" cy="-14" r="6" fill="#fff" opacity=".9"/></g>
      <path d="M-84,2 C-40,-50 40,-50 84,-2" stroke="#1A1210" stroke-width="7" fill="none" stroke-linecap="round"/>
      ${[-60, -40, -20, 0, 20, 40, 60].map(x => `<path d="M${x},${-36 + Math.abs(x) * .12} l${x * .12},-14" stroke="#1A1210" stroke-width="3" stroke-linecap="round"/>`).join('')}</g>`)
    + glow(540, 960, 700, '#FF4F7A', .08 + .1 * Math.sin(t * 6) ** 2);
}, () => ({ tint: '#7A3A5A', tintA: .1, vig: .85, grain: .12 }));

shot('38b-so-guong', 2.9, (t, p) => {
  setCam(0, 0, 1.03 + .05 * eio(p));
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#3A3440'], [1, '#1A1620']])}"/>`
    + L(.4, `<rect x="420" y="260" width="560" height="1100" rx="280" fill="#6A6272"/><rect x="440" y="280" width="520" height="1060" rx="260" fill="${lg([[0, '#8C90A0'], [1, '#4A4A58']])}"/>
      <g${clip('<rect x="440" y="280" width="520" height="1060" rx="260"/>')}><g opacity=".85">${faceFront(700, 760, .95, { spots: [[-110, 40], [90, 60]], expr: 'sad', look: 10 })}</g></g>`)
    + L(.9, phone(260, 1250, 360, 720, -8, (w, h) => `<rect width="${w}" height="${h}" fill="#FFE3EA"/>${faceFront(w / 2, h * .45, .42, { expr: 'smile', blushA: .7, look: 0 })}${txt(20, h - 80, 'Làn da không tì vết', 26, '#FF4F7A', 800)}`, { glowCol: '#FFD0E0', glowA: .35 })
      + hand(300, 1640, -10, 1.1, 'hold', { sleeve: '#9DB5C9' }));
}, () => ({ tint: '#6A5A8A', tintA: .1, vig: .8, grain: .11 }));
