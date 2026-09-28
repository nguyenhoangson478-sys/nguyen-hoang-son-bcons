// Hồi VI–VIII: sứ mệnh → quyền tự quyết → kết (trả lời 3 mô-típ: gương, ảnh, hoá đơn).
function leafLogo(x, y, s, lit = 1) {
  return `<g transform="translate(${x},${y}) scale(${s})">${glow(0, 0, 160, '#BFE3B4', .35 * lit)}<path d="M0,-90 C70,-60 70,40 0,90 C-70,40 -70,-60 0,-90 Z" fill="${P.sage}" opacity="${.5 + .5 * lit}"/><path d="M0,-70 L0,80" stroke="#F7F0E6" stroke-width="6"/></g>`;
}
// ================= HỒI VI: SỨ MỆNH =================
shot('39-den-vong', 3.7, (t, p) => {
  setCam(0, 0, 1.02 + .08 * eio(p));
  const on = t > .5 ? 1 : 0, sit = eio(seq(t, 1.2, 2.8));
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#E9E0D4'], [1, '#CBBCA9']])}"/>`
    + L(.3, leafLogo(760, 520, 1.1, on) + `<rect x="120" y="1200" width="900" height="30" fill="#B59C82"/>${tree(250, 1200, .9)}`, 8)
    + L(.55, `<g opacity="${on}">${glow(540, 820, 520, '#FFF6E6', .9)}</g><circle cx="540" cy="820" r="230" fill="none" stroke="${on ? '#FFFDF8' : '#9A9086'}" stroke-width="34"/>
      <rect x="532" y="1050" width="16" height="700" fill="#2B2420"/><path d="M540,1740 L380,1920 M540,1740 L700,1920" stroke="#2B2420" stroke-width="14"/>
      ${phone(540, 900, 170, 330, 0, (w, h) => `<rect width="${w}" height="${h}" fill="#E8DDD0"/>${figure(w / 2, h, .3, { hair: 'bun', col: '#2F4A3F' })}<circle cx="${w - 20}" cy="20" r="8" fill="#FF3B30"/>`)}`)
    + L(1.2, figure(760, lerp(2500, 2350, sit), 1.9, { back: true, hair: 'bun', col: '#2F4A3F' }), 14);
}, () => ({ tint: '#F2D8A8', tintA: .06, lift: .05, vig: .45, grain: .07 }));

shot('40-phong-spa-nho', 2.5, (t, p) => {
  setCam(lerp(30, -30, p), 0, 1.03);
  return L(.3, `<rect width="${W}" height="${H}" fill="${lg([[0, '#F4EDE2'], [1, '#DED0BE']])}"/>
      <rect x="120" y="280" width="420" height="620" fill="#FFF8EA"/><rect x="120" y="280" width="420" height="620" fill="none" stroke="#D9CBB8" stroke-width="18"/><rect x="322" y="280" width="16" height="620" fill="#D9CBB8"/>
      ${glow(330, 590, 420, '#FFF3D6', .9)}${leafLogo(820, 520, .8)}`)
    + L(.5, beam(330, 590, 700, 1700, 120, 320, '#FFF5E0', .3) + dust(t, 30, 200, 500, 800, 1100, 55))
    + L(.7, `<rect x="160" y="1220" width="760" height="120" rx="40" fill="#FFFFFF"/><rect x="200" y="1340" width="30" height="400" fill="#C9BBA8"/><rect x="850" y="1340" width="30" height="400" fill="#C9BBA8"/>
      <rect x="220" y="1170" width="220" height="70" rx="30" fill="#F2EEE8"/><rect x="600" y="1190" width="220" height="40" rx="12" fill="#DDE6D6"/><rect x="600" y="1170" width="220" height="30" rx="12" fill="#E9F0E5"/>
      ${tree(990, 1500, .9)}`);
}, () => ({ tint: '#F2D8A8', tintA: .05, lift: .06, vig: .38, grain: .06 }));

shot('41-den-soi-da', 3.8, (t, p) => {
  setCam(0, 0, 1.05 + .06 * eio(p));
  const mx = 470 + Math.sin(t * .8) * 40, my = 930 + Math.sin(t * 1.1) * 30;
  const face = o => faceFront(580, 900, 1.6, { spots: [[-110, 50], [-60, 120]], red: .2, look: 12, ...o });
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#F2E8DA'], [1, '#D8C8B4']])}"/>`
    + L(.5, face({})) + L(.5, `<g${clip(`<circle cx="${mx}" cy="${my}" r="170"/>`)}><g transform="translate(${mx},${my}) scale(1.6) translate(${-mx},${-my})">${face({})}</g></g>
      <circle cx="${mx}" cy="${my}" r="170" fill="#fff" opacity=".12"/><circle cx="${mx}" cy="${my}" r="185" fill="none" stroke="#F7F4EE" stroke-width="30"/><circle cx="${mx}" cy="${my}" r="185" fill="none" stroke="#FFF9E8" stroke-width="6" opacity=".9"/>
      <path d="M${mx + 130},${my + 130} L${mx + 330},${my + 560}" stroke="#E8E2D8" stroke-width="44" stroke-linecap="round"/>`)
    + L(1, hand(mx + 380, my + 740, -25, 1.15, 'hold', { sleeve: '#2F4A3F' }), 3);
}, () => ({ tint: '#F2D8A8', tintA: .06, lift: .05, vig: .45, grain: .07 }));

shot('42-phep-mau', 1.8, (t, p) => {
  setCam(0, 0, 1.12);
  const magic = 1 - ease(seq(t, .7, 1.5));
  const r = rng(99); let sp = '';
  for (let i = 0; i < 30; i++) { const a = r() * 6.28, d = 150 + r() * 300 + t * 60, x = 540 + Math.cos(a) * d, y = 1000 + Math.sin(a) * d * 1.2; sp += `<path d="M${x},${y - 16} L${x + 4},${y - 4} L${x + 16},${y} L${x + 4},${y + 4} L${x},${y + 16} L${x - 4},${y + 4} L${x - 16},${y} L${x - 4},${y - 4} Z" fill="#FFF3B0" opacity="${magic * (.5 + .5 * Math.sin(t * 9 + i))}"/>`; }
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#2A2238'], [1, '#141019']])}"/>` + `<rect width="${W}" height="${H}" fill="${lg([[0, '#EDE4D7'], [1, '#CDBFAC']])}" opacity="${1 - magic}"/>`
    + L(.5, glow(540, 980, 520, '#FFD86B', .75 * magic) + bottle(540, 1260, 2.1, magic > .5 ? '#E7B8F0' : '#E7DDD2', '#C9A45C', '#fff', 2)
      + txt(540, 1120, magic > .5 ? 'THẦN DƯỢC' : 'Kem dưỡng', 30, magic > .5 ? '#7A3A9A' : '#6B6259', 800, 'text-anchor="middle"') + sp);
}, (t) => ({ tint: '#B98A4A', tintA: .06, vig: .6, grain: .09 }));

shot('43a-so-tay', 2.5, (t, p) => {
  setCam(0, 0, 1.06);
  const wr = seq(t, .2, 2.2);
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#C9B8A0'], [1, '#A89478']])}"/>`
    + L(.6, `<g transform="rotate(-4 540 960)"><rect x="90" y="330" width="900" height="1260" rx="18" fill="#FBF8F1"/><rect x="530" y="330" width="20" height="1260" fill="#E6DFD2"/>
      ${Array.from({ length: 22 }, (_, i) => `<line x1="120" y1="${420 + i * 52}" x2="960" y2="${420 + i * 52}" stroke="#E4DCCD" stroke-width="3"/>`).join('')}
      <path d="M140,640 C220,610 320,660 470,630" stroke="#D9735A" stroke-width="6" fill="none"/><path d="M140,700 C220,670 320,720 470,690" stroke="#C9A45C" stroke-width="6" fill="none"/><path d="M140,760 C220,730 320,780 470,750" stroke="#8DA68A" stroke-width="6" fill="none"/>
      ${txt(150, 470, 'Làn da của mình', 38, '#2F4A3F', 700, 'font-style="italic"')}${txt(150, 560, 'Biểu bì · Trung bì', 26, '#6B6259', 500)}
      ${txt(580, 470, '• Hiểu loại da trước', 30, '#2B2420', 500)}${txt(580, 574, '• Ít mà đúng', 30, '#2B2420', 500)}${txt(580, 678, '• Chống nắng mỗi ngày', 30, '#2B2420', 500)}
      <g${clip(`<rect x="570" y="720" width="${400 * wr}" height="80"/>`)}>${txt(580, 782, '• Đừng vội làm thêm', 30, '#C0392B', 600)}</g></g>`)
    + L(1, hand(600 + 380 * wr + 40, 1100, 18, 1.1, 'pen', { sleeve: '#2F4A3F' }), 2);
}, () => ({ tint: '#F2D8A8', tintA: .06, vig: .5, grain: .08 }));

shot('43b-doc-thanh-phan', 2.5, (t, p) => {
  setCam(0, 0, 1.08);
  const mx = 540 + Math.sin(t * 1.2) * 60, my = 980 + t * 40;
  const label = sc => `<g transform="translate(540,1000) scale(${sc})"><rect x="-300" y="-460" width="600" height="920" rx="60" fill="#F2E3D0"/><rect x="-240" y="-340" width="480" height="640" rx="12" fill="#FFFCF6"/>
    ${txt(-210, -270, 'THÀNH PHẦN', 34, '#2B2420', 800)}${['Aqua, Glycerin, Niacinamide,', 'Butylene Glycol, Panthenol,', 'Centella Asiatica Extract,', 'Allantoin, Ceramide NP,', 'Sodium Hyaluronate,', 'Fragrance*, Alcohol Denat.*'].map((l, i) => txt(-210, -200 + i * 60, l, 26, i === 5 ? '#C0392B' : '#3A322C', 500)).join('')}
    ${txt(-210, 220, '* Da nhạy cảm nên thử trước', 22, '#8A7A6A', 500, 'font-style="italic"')}</g>`;
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#E9DDCC'], [1, '#C9B8A0']])}"/>`
    + L(.5, label(1), 3) + L(.7, `<g${clip(`<circle cx="${mx}" cy="${my}" r="200"/>`)}><rect width="${W}" height="${H}" fill="#E9DDCC"/><g transform="translate(${mx},${my}) scale(1.7) translate(${-mx},${-my})">${label(1)}</g></g>
      <circle cx="${mx}" cy="${my}" r="205" fill="none" stroke="#2B2420" stroke-width="22"/><path d="M${mx + 150},${my + 150} L${mx + 330},${my + 460}" stroke="#2B2420" stroke-width="46" stroke-linecap="round"/>`);
}, () => ({ tint: '#F2D8A8', tintA: .06, vig: .5, grain: .08 }));

shot('44-thu-co-tay', 2.9, (t, p) => {
  setCam(0, 0, 1.1);
  const dab = eo(seq(t, .4, 1.4)), spread = seq(t, 1.4, 2.6);
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#F0E6D8'], [1, '#D6C6B2']])}"/>`
    + L(.6, `<g transform="rotate(-18 540 1100)"><path d="M-100,1000 C200,960 700,960 1180,1010 L1180,1240 C700,1270 200,1270 -100,1230 Z" fill="${lg([[0, '#F6D3BD'], [1, P.skinSh]])}"/>
      <path d="M300,1100 C400,1080 500,1085 600,1100" stroke="#B9A3C8" stroke-width="4" fill="none" opacity=".4"/>
      <ellipse cx="560" cy="1110" rx="${20 + 50 * spread}" ry="${14 + 26 * spread}" fill="#FFFFFF" opacity="${t > 1.3 ? .8 - .4 * spread : 0}"/></g>`)
    + L(.9, hand(640, lerp(700, 1000, dab) - 60 * spread, 160, 1.1, 'touch', { sleeve: '#EADFD3' }))
    + L(.4, `<g transform="translate(870,560)">${bottle(0, 0, .9, '#F2E3D0', '#C9A45C', '#fff', 1)}</g>`, 10);
}, () => ({ tint: '#F2D8A8', tintA: .05, lift: .05, vig: .45, grain: .07 }));

shot('45-keo-khan', 3.3, (t, p) => {
  setCam(0, 0, 1.02 + .08 * eio(p));
  const pull = eio(seq(t, .5, 1.8)), light = ease(seq(t, 1, 2.6));
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#EDE3D6'], [1, '#CDBBA6']])}"/>` + `<rect width="${W}" height="${H}" fill="#0E1820" opacity="${.6 * (1 - light)}"/>`
    + L(.3, `<rect x="548" y="408" width="444" height="664" rx="20" fill="#B59C82"/><rect x="560" y="420" width="420" height="640" rx="14" fill="#E9E0D4"/>
      <g${clip('<rect x="560" y="420" width="420" height="640" rx="14"/>')}>${faceFront(770, 820, .95, { spots: [[-100, 60]], red: .1, look: -8, expr: 'calm', blushA: .5 })}</g>
      <g transform="translate(${900 * pull},${-200 * pull}) rotate(${25 * pull} 770 400)">${towel(0)}</g>`)
    + L(.6, beam(0, 0, 780, 1400, 60, 320, '#FFF1D6', .45 * light) + dust(t, 30, 300, 300, 700, 1200, 66))
    + L(1.2, hand(820 + 420 * pull, 620 - 160 * pull, 150, 1.2, 'hold', { sleeve: '#EADFD3' }), 10);
}, (t) => ({ tint: '#F2C98A', tintA: .1 * ease(seq(t, 1, 2.6)), leak: '#FFE8C0', leakA: .45 * ease(seq(t, 1, 2.6)), vig: .5, grain: .08 }));

// ================= HỒI VII: TỰ QUYẾT =================
shot('46-buoc-vao-spa', 2.6, (t, p) => {
  setCam(0, 0, 1.04);
  const step = eio(seq(t, .1, 1.8));
  const shoe = (x, y, rot) => `<g transform="translate(${x},${y}) rotate(${rot})"><path d="M-90,0 C-90,-70 -40,-90 20,-90 C80,-90 140,-60 150,0 Z" fill="#FAFAF8"/><rect x="-95" y="-6" width="250" height="26" rx="12" fill="#D9D4CC"/><path d="M-30,-80 L-10,-40 M0,-84 L20,-44" stroke="#C9C2B8" stroke-width="5"/><rect x="-80" y="-300" width="90" height="220" fill="#8A9AB0"/></g>`;
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#FFE9C8'], [1, '#E6CBA6']])}"/>`
    + L(.3, `${glow(540, 700, 700, '#FFF3D6', .9)}<rect x="160" y="200" width="760" height="1100" fill="#FFF6E6" opacity=".6"/>${leafLogo(540, 520, .9)}`, 16)
    + L(.6, `<rect x="-100" y="1400" width="1300" height="600" fill="#D8C4A8"/><rect x="-100" y="1380" width="1300" height="40" fill="#B59C82"/>`)
    + L(.9, shoe(lerp(-100, 380, step), 1560, lerp(-10, 0, step)) + shoe(lerp(-300, 180, eio(seq(t, .6, 2.4))), 1700, 0));
}, () => ({ tint: '#F2C98A', tintA: .08, leak: '#FFE8C0', leakA: .45, vig: .45, grain: .07 }));

shot('47a-ngoi-thang', 2.7, (t, p) => {
  setCam(0, 0, 1.03);
  const c = spaCounter(t, { spot: .7 });
  return L(.2, `<rect width="${W}" height="${H}" fill="${lg([[0, '#F2E8DA'], [1, '#D8C8B4']])}"/>${leafLogo(300, 500, .9)}${glow(760, 400, 500, '#FFF3D6', .8)}`, 18)
    + L(.5, c.top.replace(/#FFE3B5/g, '#FFF3D6'))
    + L(.6, figure(360, 1500, .75, { col: '#2F4A3F', hair: 'bun', armR: -40 }) + `<rect x="220" y="1050" width="300" height="200" rx="16" fill="#1A1C20" transform="rotate(-10 370 1150)"/>`, 6)
    + L(1.3, `<path d="M1180,1920 L1180,1250 C1100,1150 920,1130 780,1200 C700,1240 660,1360 660,1480 L620,1920 Z" fill="#EADFD3"/>
      <path d="M1180,1400 C1140,1000 1040,760 880,700 C780,670 720,760 740,900 C760,1100 820,1250 900,1400 Z" fill="${P.hair}"/>
      <g transform="translate(700,1480) rotate(-8)"><rect x="-150" y="-110" width="300" height="220" rx="12" fill="#8DA68A"/><rect x="-140" y="-100" width="280" height="200" rx="8" fill="#FBF8F1"/>${txt(-110, -40, 'Da mình', 34, '#2F4A3F', 700, 'font-style="italic"')}</g>`, 10);
}, () => ({ tint: '#F2C98A', tintA: .06, lift: .05, vig: .45, grain: .07 }));

shot('47b-lat-so', 2.6, (t, p) => {
  setCam(0, 0, 1.08);
  const flip = eio(seq(t, .3, 1.2)), slide = eo(seq(t, 1.2, 2));
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#EDE4D7'], [1, '#CDBFAC']])}"/>`
    + L(.6, `<g transform="rotate(-3 540 1000)"><rect x="110" y="620" width="860" height="760" rx="16" fill="#FBF8F1"/><rect x="530" y="620" width="18" height="760" fill="#E6DFD2"/>
      ${txt(150, 720, 'Da mình:', 40, '#2F4A3F', 700, 'font-style="italic"')}${txt(150, 800, 'hỗn hợp, dễ kích ứng', 32, '#2B2420', 500)}${txt(150, 880, 'Cần: dịu da, chống nắng', 32, '#2B2420', 500)}
      ${txt(580, 720, 'Chưa cần:', 40, '#C0392B', 700, 'font-style="italic"')}${txt(580, 800, '× peel, laser', 32, '#2B2420', 500)}${txt(580, 880, '× combo 5 bước', 32, '#2B2420', 500)}
      <path d="M548,620 L${548 + 420 * (1 - flip)},${620 - 40 * Math.sin(flip * 3.14)} L${548 + 420 * (1 - flip)},${1380 - 40 * Math.sin(flip * 3.14)} L548,1380 Z" fill="#F4EFE6" opacity="${1 - flip}"/></g>
      <g transform="translate(${lerp(1300, 860, slide)},560) rotate(8)"><rect x="-160" y="-120" width="320" height="240" rx="14" fill="#2F4A3F"/>${txt(0, -40, 'GÓI ƯU ĐÃI', 30, '#F7F0E6', 800, 'text-anchor="middle"')}${txt(0, 20, 'Combo 5 bước', 26, '#DDE6D6', 500, 'text-anchor="middle"')}</g>`)
    + L(1, hand(420, 1500, 10, 1.1, 'touch', { sleeve: '#EADFD3' }), 1);
}, () => ({ tint: '#F2C98A', tintA: .06, vig: .45, grain: .07 }));

shot('48-anh-mat', 2.9, (t, p) => {
  setCam(0, 0, 1.02 + .06 * eio(p));
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#F2E3CE'], [1, '#CDB79C']])}"/>`
    + L(.2, glow(850, 400, 600, '#FFF3D6', .9) + leafLogo(200, 480, .7), 20)
    + L(.5, faceFront(540, 900, 1.25, { expr: 'smile', spots: [[-110, 60]], blushA: .5, look: 0, lightX: 1 }))
    + L(.7, beam(1080, 0, 400, 1400, 40, 260, '#FFF1D6', .22) + dust(t, 20, 300, 200, 700, 1300, 71));
}, () => ({ tint: '#F2C98A', tintA: .08, leak: '#FFE8C0', leakA: .4, lift: .05, vig: .4, grain: .07 }));

shot('49a-day-lai', 2.6, (t, p) => {
  setCam(0, 0, 1.1 - .04 * p);
  const push = eio(seq(t, .3, 2.2));
  const c = spaCounter(t, { spot: .7 });
  return L(.2, `<rect width="${W}" height="${H}" fill="${lg([[0, '#EFE3D2'], [1, '#D2BFA6']])}"/>${glow(540, 400, 600, '#FFF3D6', .8)}${leafLogo(820, 460, .8)}`, 18)
    + L(.5, c.top.replace(/#FFE3B5/g, '#FFF3D6'))
    + L(.7, bottle(lerp(420, 700, push), lerp(1320, 1150, push), lerp(1.5, 1.25, push), '#E7C9BE', '#2B2420', '#fff', 0))
    + L(1, hand(lerp(300, 560, push), lerp(1600, 1440, push), 60, 1.35, 'open', { sleeve: '#EADFD3' }))
    + L(.4, hand(1000, 820, -150, 1, 'open', { sleeve: '#2F4A3F' }), 8);
}, () => ({ tint: '#F2C98A', tintA: .07, lift: .05, vig: .45, grain: .07 }));

shot('49b-buoc-ra-nang', 2.5, (t, p) => {
  setCam(0, 0, 1.02 + .04 * p);
  const walk = eio(seq(t, 0, 2.5));
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#FFF1D6'], [1, '#F2D2A6']])}"/>`
    + L(.3, glow(540, 800, 800, '#FFFFFF', .95) + `<g${blur(10)}>${[80, 900].map(x => `<circle cx="${x}" cy="700" r="260" fill="#9BB596"/>`).join('')}</g>`)
    + L(.6, `<rect x="0" y="0" width="200" height="${H}" fill="#6E5440"/><rect x="880" y="0" width="200" height="${H}" fill="#6E5440"/><rect x="0" y="0" width="${W}" height="160" fill="#6E5440"/>`, 4)
    + L(.8, figure(540, lerp(1900, 1700, walk), lerp(1.3, .9, walk), { back: true, col: '#EADFD3', walk: t * 1.2, rim: '#FFF3D6' }));
}, () => ({ tint: '#F2C98A', tintA: .08, leak: '#FFFFFF', leakA: .6, lift: .1, vig: .35, grain: .06 }));

// ================= HỒI VIII: KẾT =================
shot('50-vao-khung', 4.0, (t, p) => {
  setCam(lerp(60, 0, eio(p)), 0, 1.04);
  const inn = eio(seq(t, .3, 2.6)), flash = t > 3.3 ? clamp(1 - (t - 3.3) / .5) : 0;
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#A9D0EC'], [.5, '#EAF2F4'], [1, '#CFD6B8']])}"/>`
    + L(.2, `<g${blur(12)}><rect x="0" y="300" width="1080" height="700" fill="#EDE5D6"/>${[0, 280, 560, 860].map(x => `<circle cx="${x}" cy="340" r="200" fill="#8FB884"/>`).join('')}</g><rect x="0" y="1000" width="1080" height="920" fill="#C9D0B0"/>${glow(900, 300, 500, '#FFF6DC', .8)}`)
    + L(.5, [[170, -6, 0, -20], [360, 0, -60 * (1 - inn) - 20, 0], [740, 0, 0, -60 * (1 - inn) - 20], [920, 6, -10, 0]].map(([x, lean, aL, aR]) => figure(x, 1560, .95, { gown: '#1E2A3A', cap: true, lean, armL: aL, armR: aR })).join('')
      + figure(lerp(-200, 550, inn), 1580, 1, { gown: '#1E2A3A', cap: true }))
    + `<rect width="${W}" height="${H}" fill="#fff" opacity="${flash * .9}"/>`;
}, () => ({ tint: '#F2C98A', tintA: .06, leak: '#FFF4D6', leakA: .45, lift: .06, vig: .35, grain: .06 }));

shot('51-anh-tron-ven', 3.1, (t, p) => {
  setCam(0, 0, 1.02 + .1 * eio(p));
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#B8946A'], [1, '#8E6E4E']])}"/>`
    + L(.4, Array.from({ length: 60 }, (_, i) => { const r = rng(200 + i); return `<circle cx="${r() * 1080}" cy="${r() * 1920}" r="${2 + r() * 3}" fill="#6E5236" opacity=".5"/>`; }).join(''))
    + L(.6, `<g transform="rotate(3 540 900)">${groupPhoto(150, 560, 780, 580, false, true)}${figure(150 + .5 * 780, 560 + 580 * 1.02, 580 / 1050, { gown: '#1E2A3A', cap: true })}</g>
      <circle cx="540" cy="540" r="18" fill="#D9735A"/><circle cx="534" cy="534" r="6" fill="#fff" opacity=".6"/>
      <g transform="translate(700,1380) rotate(-6)"><rect x="-200" y="-150" width="400" height="300" fill="#FBE9A8"/>${txt(-170, -50, 'Hiểu da', 48, '#2B2420', 700, 'font-style="italic"')}${txt(-170, 20, 'trước khi', 48, '#2B2420', 700, 'font-style="italic"')}${txt(-170, 90, 'bỏ tiền ♡', 48, '#C0392B', 700, 'font-style="italic"')}</g>`)
    + L(.7, beam(1080, 0, 300, 1500, 40, 260, '#FFF1D6', .25));
}, () => ({ tint: '#F2C98A', tintA: .08, leak: '#FFE8C0', leakA: .35, vig: .45, grain: .07 }));

shot('52a-hoang-hon', 3.0, (t, p) => {
  setCam(lerp(-30, 30, p), 0, 1.03);
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#F4A77A'], [.4, '#F8C98E'], [.7, '#E8B58C'], [1, '#6C5A6E']])}"/>`
    + L(.2, glow(540, 900, 520, '#FFE9B8', 1))
    + L(.4, `<g fill="#4A3A48">${[[40, 700, 280, 520], [340, 780, 200, 440], [760, 720, 300, 500]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`).join('')}</g>`)
    + L(.6, `<g fill="#2E2430">${[60, 250, 470, 700, 900, 1060].map((x, i) => `<rect x="${x - 10}" y="1000" width="20" height="300" /><circle cx="${x}" cy="${980 - (i % 2) * 40}" r="${140 + (i % 3) * 30}"/>`).join('')}</g>
      <path d="M-100,1260 L1180,1260 L1180,2000 L-100,2000 Z" fill="#3A2E38"/><path d="M380,1260 L700,1260 L1180,2000 L-100,2000 Z" fill="#4A3C46"/>
      ${[[330, .34, 0], [470, .3, 1.5], [760, .38, .7]].map(([x, s, o]) => figure(x + ((t * 30 + o * 100) % 160) - 80, 1420 + s * 300, s, { dark: '#1E1820', walk: t + o, hair: o > 1 ? 'short' : 'long' })).join('')}`);
}, () => ({ tint: '#F29A6A', tintA: .08, leak: '#FFD9A0', leakA: .5, vig: .5, grain: .07 }));

shot('52b-bien-la', 3.2, (t, p) => {
  setCam(0, 0, 1.02 + .05 * eio(p));
  const lit = ease(seq(t, .4, 1.4));
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#3A3050'], [1, '#1A1624']])}"/>`
    + L(.3, `<g${blur(14)}>${bokeh([[200, 400, 60, '#FFD9A0'], [880, 520, 70, '#FFC98A'], [700, 300, 40, '#FFE9B8']])}</g>`)
    + L(.6, `<rect x="140" y="760" width="800" height="380" rx="40" fill="#2A2436"/><rect x="160" y="780" width="760" height="340" rx="30" fill="${lit ? '#2F4A3F' : '#221E2C'}" opacity="${.4 + .6 * lit}"/>
      ${leafLogo(300, 950, .9, lit)}${txt(420, 930, 'Spa Nhà Thor', 70, lit ? '#F7F0E6' : '#6A6478', 800)}${txt(420, 1010, 'Hiểu da trước khi bỏ tiền', 34, lit ? '#DDE6D6' : '#5A546A', 500, 'font-style="italic"')}
      ${glow(540, 950, 520, '#BFE3B4', .25 * lit)}`)
    + L(.8, `<rect x="0" y="1300" width="${W}" height="700" fill="#15121C"/>${glow(540, 1320, 400, '#BFE3B4', .15 * lit)}`);
}, () => ({ tint: '#6A5A8A', tintA: .08, vig: .6, grain: .08 }));
