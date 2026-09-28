// Bộ máy B-roll điện ảnh 2D: máy quay nhiều lớp, lấy nét, ánh sáng, hạt phim + bộ vẽ nhân vật.
// Mỗi khung hình dựng lại toàn bộ SVG từ thời gian t, nên chuyển động nào cũng là hàm của t.
const W = 1080, H = 1920;
const P = {
  skin: '#EFC6AC', skinSh: '#C98E74', skinDeep: '#A96D58', hair: '#1D1512', hairHi: '#4A342A',
  lip: '#C9786C', iris: '#3B2418', nail: '#F2C9BE',
  cream: '#F7F0E6', sage: '#8DA68A', forest: '#2F4A3F', coral: '#D9735A', gold: '#C9A45C', blush: '#EDB9A6',
};

// ---------- tiện ích ----------
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = p => { p = clamp(p); return p * p * (3 - 2 * p); };
const eio = p => { p = clamp(p); return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
const eo = p => 1 - Math.pow(1 - clamp(p), 3);
const ei = p => Math.pow(clamp(p), 3);
const seq = (t, a, b) => clamp((t - a) / (b - a));
function rng(seed) { let s = seed * 9301 + 49297; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
const noise1 = (t, k = 1) => Math.sin(t * 1.3 * k) * .6 + Math.sin(t * 2.7 * k + 1.7) * .3 + Math.sin(t * 5.1 * k + .4) * .1;

// Thời gian (giây) trong cú máy hiện tại — bộ máy đặt trước mỗi khung, để nhân vật tự "sống"
let NOW = 0;
function blinkAmt(t, seed = 0) {
  const per = 3.1 + (seed % 5) * .23, ph = ((t + seed * .7) % per + per) % per;
  return ph < .17 ? Math.sin(Math.PI * ph / .17) : 0;
}

// ---------- defs dùng một lần mỗi khung ----------
let DEFS = [], REG = {}, UID = 0;
function resetDefs() { DEFS = []; REG = {}; UID = 0; }
function blur(sd) {
  sd = Math.round(sd * 2) / 2;
  if (sd <= .4) return '';
  const id = 'b' + String(sd).replace('.', '_');
  if (!REG[id]) { REG[id] = 1; DEFS.push(`<filter id="${id}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="${sd}"/></filter>`); }
  return ` filter="url(#${id})"`;
}
function lg(stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1, units = '') {
  const id = 'g' + (++UID);
  DEFS.push(`<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${units ? ` gradientUnits="${units}"` : ''}>${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient>`);
  return `url(#${id})`;
}
function rg(stops, cx = .5, cy = .5, r = .5, units = '') {
  const id = 'g' + (++UID);
  DEFS.push(`<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${units ? ` gradientUnits="${units}"` : ''}>${stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</radialGradient>`);
  return `url(#${id})`;
}
function clip(inner) { const id = 'c' + (++UID); DEFS.push(`<clipPath id="${id}">${inner}</clipPath>`); return ` clip-path="url(#${id})"`; }
// Quầng sáng tròn mềm (không cần filter)
const glow = (x, y, r, col, a = 1) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${rg([[0, col, a], [.35, col, a * .45], [1, col, 0]])}"/>`;

// ---------- máy quay nhiều lớp ----------
let CAM = { x: 0, y: 0, z: 1, r: 0 };
function setCam(x = 0, y = 0, z = 1, r = 0) { CAM = { x, y, z, r }; }
// Lớp ở độ sâu d (0 = đứng yên, 1 = trôi theo máy quay, >1 = tiền cảnh trôi nhanh hơn)
function L(d, content, bl = 0, extra = '') {
  const s = 1 + (CAM.z - 1) * d;
  return `<g transform="translate(${540 - CAM.x * d},${960 - CAM.y * d}) rotate(${CAM.r * d}) scale(${s}) translate(-540,-960)"${blur(bl)}${extra}>${content}</g>`;
}
const hand_held = (t, a = 1) => [noise1(t, .9) * 6 * a, noise1(t + 11, .8) * 5 * a, noise1(t + 5, .6) * .25 * a];

// ---------- hiệu ứng môi trường ----------
function dust(t, n, x0, y0, w, h, seed = 1, col = '#FFF4DC', a = .7) {
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const bx = r() * w, by = r() * h, sp = .3 + r(), sz = 1.5 + r() * 3.5, ph = r() * 6;
    const x = x0 + ((bx + Math.sin(t * .4 * sp + ph) * 30 + t * 8 * sp) % w + w) % w;
    const y = y0 + ((by - t * 14 * sp) % h + h) % h;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${sz.toFixed(1)}" fill="${col}" opacity="${(a * (.4 + .6 * Math.abs(Math.sin(t * sp + ph)))).toFixed(2)}"/>`;
  }
  return s;
}
function rain(t, n, x0, y0, w, h, seed = 3, speed = 1900, col = '#DCE8FF', a = .35, slant = .16) {
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const bx = r() * w, by = r() * h, l = 40 + r() * 80, v = speed * (.7 + r() * .6);
    const y = y0 + ((by + t * v) % (h + l)) - l, x = x0 + bx - (y - y0) * slant * .2;
    s += `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x - l * slant).toFixed(1)}" y2="${(y + l).toFixed(1)}" stroke="${col}" stroke-opacity="${a}" stroke-width="${(2 + r() * 2).toFixed(1)}" stroke-linecap="round"/>`;
  }
  return s;
}
// Giọt nước trên kính, có giọt chảy xuống
function drops(t, n, x0, y0, w, h, seed = 5, a = .45) {
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * w, by = y0 + r() * h, rad = 2 + r() * 7, run = r() < .25;
    const y = run ? y0 + ((by - y0 + t * (60 + r() * 120)) % h) : by;
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(1)}" fill="#DCE8FF" fill-opacity="${a * .5}"/><circle cx="${(x - rad * .3).toFixed(1)}" cy="${(y - rad * .3).toFixed(1)}" r="${(rad * .35).toFixed(1)}" fill="#fff" fill-opacity="${a}"/>`;
    if (run) s += `<line x1="${x}" y1="${by}" x2="${x}" y2="${y}" stroke="#DCE8FF" stroke-opacity="${a * .25}" stroke-width="${rad * .6}"/>`;
  }
  return s;
}
function bokeh(list, a = 1) {
  return list.map(([x, y, r, c, o = .8]) => glow(x, y, r, c, o * a)).join('');
}
// Chùm tia sáng chéo
function beam(x1, y1, x2, y2, w1, w2, col, a) {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
  const pts = [[x1 + nx * w1, y1 + ny * w1], [x1 - nx * w1, y1 - ny * w1], [x2 - nx * w2, y2 - ny * w2], [x2 + nx * w2, y2 + ny * w2]];
  return `<path d="M${pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' L')} Z" fill="${lg([[0, col, a], [1, col, 0]], x1, y1, x2, y2, 'userSpaceOnUse')}"/>`;
}

// ---------- đồ vật ----------
function phone(x, y, w, h, rot, screen, o = {}) {
  const { body = '#141518', glowCol = null, glowA = .5 } = o;
  const inner = `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${w * .13}" fill="${body}"/>
    <g${clip(`<rect x="${-w / 2 + w * .05}" y="${-h / 2 + w * .05}" width="${w * .9}" height="${h - w * .1}" rx="${w * .09}"/>`)}>
      <g transform="translate(${-w / 2 + w * .05},${-h / 2 + w * .05})">${screen(w * .9, h - w * .1)}</g></g>
    <path d="M${-w / 2 + w * .1},${-h / 2 + w * .1} L${w * .1},${-h / 2 + w * .1} L${-w * .3},${h * .2} L${-w / 2 + w * .1},${h * .05} Z" fill="#fff" opacity=".05"/>`;
  return (glowCol ? glow(x, y, Math.max(w, h) * .9, glowCol, glowA) : '') + `<g transform="translate(${x},${y}) rotate(${rot})">${inner}</g>`;
}
const txt = (x, y, s, size, col = '#2B2420', w = 600, o = '') =>
  `<text x="${x}" y="${y}" font-family="Be Vietnam Pro" font-size="${size}" font-weight="${w}" fill="${col}" ${o}>${s}</text>`;

function bottle(x, y, s, col, capCol = '#2B2420', label = '#fff', kind = 0) {
  const body = kind === 1 ? `<rect x="-55" y="-150" width="110" height="150" rx="14" fill="${col}"/><rect x="-55" y="-150" width="110" height="26" rx="12" fill="${capCol}"/>`
    : kind === 2 ? `<path d="M-45,0 L-45,-120 C-45,-150 -20,-160 -20,-175 L20,-175 C20,-160 45,-150 45,-120 L45,0 Z" fill="${col}"/><rect x="-16" y="-215" width="32" height="44" rx="6" fill="${capCol}"/>`
      : `<rect x="-38" y="-200" width="76" height="200" rx="28" fill="${col}"/><rect x="-20" y="-245" width="40" height="50" rx="8" fill="${capCol}"/>`;
  return `<g transform="translate(${x},${y}) scale(${s})">${body}
    <rect x="-28" y="-120" width="56" height="54" rx="6" fill="${label}" opacity=".7"/>
    <rect x="-34" y="-190" width="14" height="180" rx="7" fill="#fff" opacity=".22"/></g>`;
}

// ---------- tay ----------
// Cổ tay ở (0,0), ngón tay hướng lên (-y). pose: open | point | hold | pen | touch
function hand(x, y, rot, s, pose = 'open', o = {}) {
  const { sleeve = null, skin = P.skin, sh = P.skinSh, flip = false, tremble = 0, t = 0 } = o;
  if (!o.still) { const sd = Math.abs(Math.round(x + y)) % 11; x += Math.sin(NOW * 1.3 + sd) * 4; y += Math.sin(NOW * 1.1 + sd) * 3; rot += Math.sin(NOW * .9 + sd) * .8; }
  const g = lg([[0, skin], [.55, skin], [1, sh]], 0, 0, 1, 0);
  let fingers = '';
  const cap = (fx, fy, len, w, ang = 0, nail = true) => `<g transform="translate(${fx},${fy}) rotate(${ang})"><path d="M${-w / 2},${w / 2} L${-w * .4},${-len + w * .4} C${-w * .4},${-len - w * .05} ${w * .4},${-len - w * .05} ${w * .4},${-len + w * .4} L${w / 2},${w / 2} Z" fill="${g}"/><path d="M${-w * .3},${-len * .45} q${w * .3},${w * .12} ${w * .6},0" stroke="${sh}" stroke-width="2.5" fill="none" opacity=".45"/>${nail ? `<rect x="${-w * .32}" y="${-len + w * .12}" width="${w * .64}" height="${w * .75}" rx="${w * .3}" fill="${P.nail}" opacity=".9"/>` : ''}</g>`;
  const knuckle = (fx, fy, w) => `<rect x="${fx - w / 2}" y="${fy - w * .9}" width="${w}" height="${w * 1.5}" rx="${w / 2}" fill="${g}"/><path d="M${fx - w * .35},${fy - w * .1} q${w * .35},${w * .25} ${w * .7},0" stroke="${sh}" stroke-width="3" fill="none" opacity=".6"/>`;
  const tr = tremble ? Math.sin(t * 38) * tremble : 0;
  if (pose === 'open') fingers = [[-42, 108, -6], [-14, 128, -2], [14, 122, 2], [40, 96, 7]].map(([fx, l, a]) => cap(fx, -140, l, 27, a + tr)).join('') + cap(-58, -55, 92, 30, -48);
  if (pose === 'point' || pose === 'touch') fingers = cap(-12, -146, 112, 27, 2 + tr) + cap(-40, -140, 126, 27, -5 + tr) + cap(16, -142, 70, 26, 10) + cap(40, -134, 54, 24, 16) + cap(-58, -66, 84, 30, -34);
  if (pose === 'hold') fingers = knuckle(-40, -146, 28) + knuckle(-13, -152, 28) + knuckle(14, -148, 27) + knuckle(39, -138, 25) + cap(-58, -70, 88, 30, -20);
  if (pose === 'pen') fingers = `<rect x="-60" y="-330" width="14" height="300" rx="7" fill="#2B2420" transform="rotate(18 -50 -150)"/>` + cap(-36, -140, 95, 27, -22) + knuckle(-8, -150, 28) + knuckle(18, -145, 27) + knuckle(42, -136, 25) + cap(-58, -70, 80, 30, -12);
  const palm = `<path d="M-62,0 C-72,-60 -70,-118 -58,-152 C-20,-165 25,-165 58,-150 C68,-118 70,-60 58,0 Z" fill="${g}"/>
    <path d="M-30,-40 C-10,-60 20,-58 36,-30" stroke="${sh}" stroke-width="3" fill="none" opacity=".35"/>`;
  const sl = sleeve ? `<path d="M-80,-10 L80,-10 L95,520 L-95,520 Z" fill="${sleeve}"/><path d="M-80,-10 L80,-10 L82,12 L-82,12 Z" fill="#000" opacity=".15"/>` : '';
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${flip ? -s : s},${s})">${sl}${palm}${fingers}</g>`;
}

// ---------- khuôn mặt chính diện ----------
// Tâm mặt (0,0), cao ~560. o: acne(0..16) red(0..1) expr: calm|sad|smile|cry  look: dx lệch mắt; closed
function faceFront(x, y, s, o = {}) {
  const { acne = 0, red = 0, expr = 'calm', look: look0 = 0, closed: closed0 = 0, tear = 0, lightX = -1, hair = P.hair, gown = null, top = '#D8CBBE', blushA = .5, spots: fixed = null, capOn = false } = o;
  const al = o.still ? 0 : 1, sd = Math.abs(Math.round(x * 7 + y * 3)) % 10;
  const closed = Math.max(closed0, al * blinkAmt(NOW, sd)), look = look0 + al * Math.sin(NOW * .7 + sd) * 4;
  const sway = al * Math.sin(NOW * 1.05 + sd) * 1.4, breath = al * Math.sin(NOW * 1.7 + sd) * 4, hs = al * Math.sin(NOW * 1.3 + sd) * 1.3;
  const skinG = lg([[0, lightX < 0 ? '#F6D3BD' : P.skinSh], [.5, P.skin], [1, lightX < 0 ? P.skinSh : '#F6D3BD']], 0, 0, 1, 0);
  const eye = (ex, side) => {
    if (closed > .85) return `<path d="M${ex - 52},${-6} C${ex - 25},${10} ${ex + 25},${10} ${ex + 52},${-6}" stroke="#1A1210" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    const lid = closed * 22;
    return `<g>
      <path d="M${ex - 55},0 C${ex - 30},-28 ${ex + 30},-28 ${ex + 55},0 C${ex + 30},20 ${ex - 30},20 ${ex - 55},0 Z" fill="#F8F2EE"/>
      <g${clip(`<path d="M${ex - 55},0 C${ex - 30},${-28 + lid} ${ex + 30},${-28 + lid} ${ex + 55},0 C${ex + 30},20 ${ex - 30},20 ${ex - 55},0 Z"/>`)}>
        <circle cx="${ex + look}" cy="-3" r="23" fill="${rg([[0, '#6B4430'], [.7, P.iris], [1, '#150C08']])}"/>
        <circle cx="${ex + look}" cy="-3" r="10" fill="#0B0605"/>
        <circle cx="${ex + look - 8}" cy="-11" r="6" fill="#fff" opacity=".95"/><circle cx="${ex + look + 8}" cy="6" r="3" fill="#fff" opacity=".6"/>
        <path d="M${ex - 55},${-30} L${ex + 55},${-30} L${ex + 55},${-8 + lid} C${ex + 30},${-26 + lid} ${ex - 30},${-26 + lid} ${ex - 55},${-4 + lid} Z" fill="#E9B79E" opacity="${closed ? 1 : 0}"/>
      </g>
      <path d="M${ex - 58},2 C${ex - 30},${-30 + lid} ${ex + 30},${-30 + lid} ${ex + 58},${-2}" stroke="#1A1210" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M${ex + side * 52},${-4} l${side * 14},-10" stroke="#1A1210" stroke-width="5" stroke-linecap="round"/>
      <path d="M${ex - 40},16 C${ex - 15},24 ${ex + 15},24 ${ex + 40},14" stroke="#B98672" stroke-width="3" fill="none" opacity=".6"/>
    </g>`;
  };
  const browY = expr === 'sad' || expr === 'cry' ? [[-140, -64], [-40, -84]] : [[-140, -76], [-40, -84]];
  const brows = [-1, 1].map(sd => `<path d="M${sd * -browY[0][0]},${browY[0][1]} Q${sd * 90},${(browY[0][1] + browY[1][1]) / 2 - 12} ${sd * -browY[1][0]},${browY[1][1]}" stroke="#2A1C16" stroke-width="12" fill="none" stroke-linecap="round" opacity=".85"/>`).join('');
  const mouth = expr === 'smile' ? `<path d="M-46,120 C-20,142 20,142 46,120 C22,150 -22,150 -46,120 Z" fill="${P.lip}"/><path d="M-46,120 C-20,136 20,136 46,120" stroke="#8E4A42" stroke-width="4" fill="none"/>`
    : expr === 'sad' || expr === 'cry' ? `<path d="M-38,134 C-20,120 20,120 38,134 C20,146 -20,146 -38,134 Z" fill="${P.lip}"/><path d="M-38,134 C-20,124 20,124 38,134" stroke="#8E4A42" stroke-width="4" fill="none"/>`
      : `<path d="M-40,124 C-20,114 -5,120 0,121 C5,120 20,114 40,124 C20,142 -20,142 -40,124 Z" fill="${P.lip}"/><path d="M-40,124 C-15,128 15,128 40,124" stroke="#8E4A42" stroke-width="4" fill="none"/>`;
  const r = rng(7); let spots = '';
  for (let i = 0; i < (fixed ? fixed.length : acne); i++) {
    const side = i % 2 ? 1 : -1; let ax = side * (60 + r() * 95), ay = -40 + r() * 190;
    if (fixed) [ax, ay] = fixed[i];
    spots += glow(ax, ay, 16, '#D0453A', .45) + `<circle cx="${ax}" cy="${ay}" r="${4 + r() * 3}" fill="#B83A30"/><circle cx="${ax - 1.5}" cy="${ay - 2}" r="1.6" fill="#fff" opacity=".6"/>`;
  }
  const face = `M0,-285 C150,-285 218,-170 212,-40 C206,90 140,205 0,255 C-140,205 -206,90 -212,-40 C-218,-170 -150,-285 0,-285 Z`;
  return `<g transform="translate(${x},${y + breath * s}) scale(${s}) rotate(${sway})">
    <path d="M-235,-110 C-250,-340 250,-340 235,-110 L270,430 C150,480 -150,480 -270,430 Z" fill="${hair}" transform="rotate(${hs} 0 -260)"/>
    <path d="M-62,180 L62,180 L70,430 L-70,430 Z" fill="${lg([[0, P.skinSh], [1, P.skinDeep]])}"/>
    ${gown ? `<path d="M-70,388 C-150,398 -250,430 -300,515 C-330,568 -340,650 -342,900 L342,900 C340,650 330,568 300,515 C250,430 150,398 70,388 Z" fill="${gown}"/>` : `<path d="M-70,388 C-150,398 -240,430 -292,515 C-322,568 -332,650 -334,900 L334,900 C332,650 322,568 292,515 C240,430 150,398 70,388 Z" fill="${top}"/><path d="M-70,388 C-40,420 40,420 70,388" stroke="#000" stroke-opacity=".12" stroke-width="10" fill="none"/>`}
    <path d="${face}" fill="${skinG}"/>
    <ellipse cx="-110" cy="75" rx="62" ry="40" fill="${P.blush}" opacity="${blushA * (1 - red * .5)}"/><ellipse cx="110" cy="75" rx="62" ry="40" fill="${P.blush}" opacity="${blushA * (1 - red * .5)}"/>
    ${red ? `<g opacity="${red}">${glow(-105, 60, 120, '#D9483C', .55)}${glow(105, 60, 120, '#D9483C', .55)}${glow(0, -150, 90, '#D9483C', .3)}${glow(0, 190, 60, '#D9483C', .35)}</g>` : ''}
    ${spots}
    <path d="M-8,-20 C-12,20 -16,50 -26,68 C-12,80 12,80 26,68" stroke="${P.skinDeep}" stroke-width="4" fill="none" opacity=".45" stroke-linecap="round"/>
    ${eye(-88, -1)}${eye(88, 1)}${brows}${mouth}
    ${tear ? `<path d="M${95},${22 + tear * 120} q-10,22 0,30 q10,-8 0,-30z" fill="#CFE6F5" opacity=".9"/><path d="M95,20 L95,${22 + tear * 120}" stroke="#E8F4FB" stroke-width="5" opacity=".45"/>` : ''}
    <g transform="rotate(${hs} 0 -280)"><path d="M-6,-296 C-150,-296 -238,-196 -232,-30 C-228,120 -252,270 -268,440 L-305,440 C-296,230 -300,-40 -262,-170 C-220,-290 -90,-322 -6,-296 Z" fill="${hair}"/>
    <path d="M6,-296 C150,-296 238,-196 232,-30 C228,120 252,270 268,440 L305,440 C296,230 300,-40 262,-170 C220,-290 90,-322 6,-296 Z" fill="${hair}"/>
    </g><path d="M-4,-292 C-90,-280 -170,-220 -196,-120 C-150,-200 -80,-240 -4,-250 Z" fill="${hair}"/><path d="M4,-292 C90,-280 170,-220 196,-120 C150,-200 80,-240 4,-250 Z" fill="${hair}"/>
    <path d="M-218,-140 C-170,-315 170,-315 218,-140 C140,-236 40,-252 0,-248 C-40,-252 -140,-236 -218,-140 Z" fill="${hair}"/>
    <path d="M0,-270 L0,-236" stroke="${P.skinSh}" stroke-width="5" opacity=".6"/>
    <path d="M-150,-250 C-200,-180 -215,-80 -210,20" stroke="${P.hairHi}" stroke-width="10" fill="none" opacity=".5" stroke-linecap="round"/>
    ${capOn ? gradCap(0, -300, 1.25, 0, 0, 0) : ''}
  </g>`;
}

// ---------- khuôn mặt nghiêng (nhìn sang trái) ----------
function faceProfile(x, y, s, o = {}) {
  const { acne = 0, red = 0, closed: closed0 = 0, tear = 0, rim = null, dark = false, down: down0 = 0 } = o;
  const al = o.still ? 0 : 1, closed = Math.max(closed0, al * blinkAmt(NOW, 3)), down = down0 + al * Math.sin(NOW * 1.2) * 1.2;
  y += al * Math.sin(NOW * 1.7) * 4 * s;
  const skinF = dark ? '#0A0B10' : lg([[0, '#F6D3BD'], [.6, P.skin], [1, P.skinSh]], 0, 0, 1, 0);
  const r = rng(11); let spots = '';
  for (let i = 0; i < acne; i++) { const ax = 10 + r() * 150, ay = -40 + r() * 190; spots += glow(ax, ay, 15, '#D0453A', .45) + `<circle cx="${ax}" cy="${ay}" r="${4 + r() * 3}" fill="#B83A30"/>`; }
  return `<g transform="translate(${x},${y}) scale(${s}) rotate(${down})">
    <path d="M40,-330 C210,-390 340,-250 336,-60 C332,150 300,350 336,540 L190,540 C206,390 226,210 196,40 C186,-30 168,-40 150,-60 C140,-150 100,-230 40,-240 C0,-250 -24,-282 40,-330 Z" fill="${dark ? '#05060A' : P.hair}"/>
    <path d="M30,205 C44,300 44,380 34,480 L204,480 C194,380 192,300 182,196 Z" fill="${dark ? '#07080C' : lg([[0, P.skinSh], [1, P.skinDeep]], 0, 0, 1, 0)}"/>
    <path d="M60,-322 C-20,-300 -30,-200 -20,-130 C-15,-110 -22,-98 -38,-60 C-52,-26 -78,0 -62,20 C-50,32 -26,32 -20,42 C-30,55 -36,68 -26,76 C-16,84 -20,92 -32,104 C-30,118 -12,122 -10,135 C-16,170 -20,196 12,216 C60,242 130,236 172,200 L232,-60 C222,-252 152,-332 60,-322 Z" fill="${skinF}"/>
    ${dark ? '' : `
    ${red ? `<g opacity="${red}">${glow(70, 60, 110, '#D9483C', .6)}</g>` : `<ellipse cx="60" cy="60" rx="55" ry="35" fill="${P.blush}" opacity=".45"/>`}
    ${spots}
    ${closed > .8 ? `<path d="M-14,-62 C0,-52 16,-52 28,-60" stroke="#1A1210" stroke-width="6" fill="none" stroke-linecap="round"/>`
      : `<path d="M-16,-66 C-4,-80 20,-78 30,-64 C18,-56 0,-56 -16,-66 Z" fill="#F4ECE8"/><ellipse cx="-4" cy="-66" rx="8" ry="${11 * (1 - closed)}" fill="${P.iris}"/><path d="M-20,-70 C-4,-84 22,-82 32,-66" stroke="#1A1210" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M-20,-70 l-12,-8" stroke="#1A1210" stroke-width="4" stroke-linecap="round"/>`}
    <path d="M-26,-112 C0,-124 40,-122 66,-110" stroke="#2A1C16" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M-34,78 C-24,84 -16,84 -8,80" stroke="#8E4A42" stroke-width="4" fill="none"/>
    ${tear ? `<path d="M10,${-40 + tear * 140} q-9,20 0,27 q9,-7 0,-27z" fill="#CFE6F5"/>` : ''}`}
    ${rim ? `<path d="M60,-322 C-20,-300 -30,-200 -20,-130 C-15,-110 -22,-98 -38,-60 C-52,-26 -78,0 -62,20 C-50,32 -26,32 -20,42 C-30,55 -36,68 -26,76 C-16,84 -20,92 -32,104 C-30,118 -12,122 -10,135 C-16,170 -20,196 12,216" stroke="${rim}" stroke-width="7" fill="none" opacity=".85"/>` : ''}
    <path d="M40,-330 C-10,-320 -30,-290 -24,-250 C20,-280 90,-280 150,-240 C120,-300 80,-335 40,-330 Z" fill="${dark ? '#05060A' : P.hair}"/>
  </g>`;
}

// ---------- dáng người (trung, toàn cảnh) ----------
// Đứng tại chân (x,y), cao ~ 900*s. o: back, gown, cap, mask, hair: long|bun|short, col, rim, dark
function figure(x, y, s, o = {}) {
  const { back = false, gown = null, cap = false, mask = false, hair = 'long', col = '#D8CBBE', skin = P.skin, rim = null, dark = null,
    armL: aL0 = 0, armR: aR0 = 0, lean: lean0 = 0, suitcase = false, walk = 0, hairCol = P.hair, pants = '#3A3A44', laugh = 0 } = o;
  const al = o.still ? 0 : 1, sd = Math.abs(Math.round(x)) % 13;
  const sw = walk ? Math.sin(walk * Math.PI * 2) * 16 : 0;
  const armL = aL0 + sw + al * Math.sin(NOW * 1.3 + sd) * 2, armR = aR0 - sw + al * Math.sin(NOW * 1.1 + sd + 1) * 2;
  const lean = lean0 + al * Math.sin(NOW * .9 + sd) * .8 + laugh * Math.sin(NOW * 9 + sd) * 2.5;
  y += al * (Math.sin(NOW * 1.6 + sd) * 4 + (walk ? -Math.abs(Math.sin(walk * Math.PI * 2)) * 10 : 0) - laugh * Math.abs(Math.sin(NOW * 9 + sd)) * 10) * s;
  const C = c => dark || c;
  const leg = (sx, ph) => { const k = Math.sin(walk * Math.PI * 2 + ph) * (walk ? 18 : 0); return `<path d="M${sx - 26},-300 L${sx + 26},-300 L${sx + 20 + k},-10 L${sx - 18 + k},-10 Z" fill="${C(gown ? gown : pants)}"/><ellipse cx="${sx + k}" cy="-8" rx="34" ry="14" fill="${C('#231C18')}"/>`; };
  const body = gown ? `<path d="M-120,-640 C-150,-560 -170,-300 -190,-40 L190,-40 C170,-300 150,-560 120,-640 Z" fill="${C(gown)}"/>`
    : `<path d="M-40,-655 C-90,-650 -125,-635 -128,-590 C-132,-500 -110,-420 -104,-380 C-110,-350 -122,-320 -124,-290 L124,-290 C122,-320 110,-350 104,-380 C110,-420 132,-500 128,-590 C125,-635 90,-650 40,-655 Z" fill="${C(col)}"/>`;
  const arm = (sd, a) => `<g transform="translate(${sd * 112},-625) rotate(${sd * (6 + a)})"><path d="M-34,0 C-36,120 -30,230 -22,320 L22,320 C30,230 36,120 34,0 Z" fill="${C(gown || col)}"/><ellipse cx="0" cy="345" rx="22" ry="34" fill="${C(skin)}"/></g>`;
  const head = back ? `<ellipse cx="0" cy="-790" rx="102" ry="118" fill="${C(hairCol)}"/>`
    : `<ellipse cx="0" cy="-790" rx="96" ry="112" fill="${C(skin)}"/>${dark ? '' : `<circle cx="-34" cy="-800" r="8" fill="#2A1C16"/><circle cx="34" cy="-800" r="8" fill="#2A1C16"/>${mask ? '' : '<path d="M-24,-748 Q0,-730 24,-748" stroke="#9A5A50" stroke-width="6" fill="none" stroke-linecap="round"/>'}<ellipse cx="-55" cy="-765" rx="18" ry="10" fill="${P.blush}" opacity=".6"/><ellipse cx="55" cy="-765" rx="18" ry="10" fill="${P.blush}" opacity=".6"/>`}${mask ? `<path d="M-80,-780 C-60,-730 60,-730 80,-780 L84,-720 C40,-690 -40,-690 -84,-720 Z" fill="${C('#EEF3F6')}"/>` : ''}`;
  const hairS = hair === 'long' ? `<path d="M-108,-800 C-120,-930 120,-930 108,-800 L130,-560 C60,-540 -60,-540 -130,-560 Z" fill="${C(hairCol)}"/>`
    : hair === 'bun' ? `<circle cx="0" cy="${back ? -905 : -915}" r="52" fill="${C(hairCol)}"/><path d="M-102,-790 C-110,-915 110,-915 102,-790 L100,-740 L-100,-740 Z" fill="${C(hairCol)}"/>`
      : back ? `<path d="M-104,-790 C-112,-925 112,-925 104,-790 L100,-740 L-100,-740 Z" fill="${C(hairCol)}"/>`
        : `<path d="M-106,-780 C-116,-930 116,-930 106,-780 C96,-830 60,-858 0,-856 C-60,-858 -96,-830 -106,-780 Z" fill="${C(hairCol)}"/>`;
  const fringe = !back && hair === 'long' ? `<path d="M-106,-790 C-114,-928 114,-928 106,-790 C80,-838 30,-846 0,-834 C-30,-846 -80,-838 -106,-790 Z" fill="${C(hairCol)}"/>` : '';
  const capS = cap ? `<rect x="-80" y="-915" width="160" height="40" rx="8" fill="${C('#15191E')}"/><polygon points="-150,-918 0,-962 150,-918 0,-874" fill="${C('#20262D')}"/><path d="M0,-918 L110,-908 L110,-860" stroke="${C(P.gold)}" stroke-width="6" fill="none"/>` : '';
  const bag = suitcase ? `<g transform="translate(200,0)"><rect x="-70" y="-300" width="140" height="290" rx="20" fill="${C('#5A4A42')}"/><path d="M-30,-300 L-30,-420 L30,-420 L30,-300" stroke="${C('#2B2420')}" stroke-width="12" fill="none"/><circle cx="-40" cy="-6" r="12" fill="${C('#111')}"/><circle cx="40" cy="-6" r="12" fill="${C('#111')}"/></g>` : '';
  const rimS = rim ? `<path d="M-100,-850 C-60,-910 60,-910 100,-850 M120,-640 C140,-560 145,-440 125,-300" stroke="${rim}" stroke-width="6" fill="none" opacity=".75"/>` : '';
  return `<g transform="translate(${x},${y}) scale(${s}) rotate(${lean})">
    ${gown ? '' : leg(-50, 0) + leg(50, Math.PI)}${bag}${hair === 'long' && !back ? hairS : ''}${body}${arm(-1, armL)}${arm(1, armR)}
    <rect x="-34" y="-690" width="68" height="70" fill="${C(P.skinSh)}"/>${head}${hair === 'long' && back ? hairS : hair !== 'long' ? hairS : ''}${fringe}${capS}${rimS}</g>`;
}

// ---------- hậu kỳ ----------
function post(frame, g = {}) {
  const { tint = null, tintA = .15, vig = .7, grain = .1, lift = 0, dark = 0, leak = null, leakA = 0, flash = 0 } = g;
  let s = '';
  if (tint) s += `<rect width="${W}" height="${H}" fill="${tint}" opacity="${tintA}" style="mix-blend-mode:color"/>`;
  if (lift) s += `<rect width="${W}" height="${H}" fill="#fff" opacity="${lift}" style="mix-blend-mode:soft-light"/>`;
  if (leak && leakA) s += `<rect width="${W}" height="${H}" fill="${rg([[0, leak, leakA], [1, leak, 0]], .9, .1, .9)}" style="mix-blend-mode:screen"/>`;
  if (dark) s += `<rect width="${W}" height="${H}" fill="#000" opacity="${dark}"/>`;
  s += `<rect width="${W}" height="${H}" fill="${rg([[.5, '#000', 0], [1, '#000', vig]], .5, .48, .78)}"/>`;
  if (flash) s += `<rect width="${W}" height="${H}" fill="#fff" opacity="${flash}"/>`;
  if (grain) {
    DEFS.push(`<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="${frame % 97}"/><feColorMatrix type="saturate" values="0"/></filter>`);
    s += `<rect width="${W}" height="${H}" filter="url(#grain)" opacity="${grain}" style="mix-blend-mode:overlay"/>`;
  }
  return s;
}

// Mũ tốt nghiệp: tâm mặt bảng (x,y), tilt = độ nghiêng nhìn (0 phẳng → 1 dựng đứng), swing = góc dây tua
function gradCap(x, y, s, rot = 0, tilt = 0, swing = 0) {
  const ry = 55 * (1 - tilt * .6);
  return `<g transform="translate(${x},${y}) rotate(${rot}) scale(${s})">
    <path d="M-95,${ry * .2} L-95,${ry * .2 + 60} C-60,${ry * .2 + 85} 60,${ry * .2 + 85} 95,${ry * .2 + 60} L95,${ry * .2} Z" fill="#12161B"/>
    <path d="M-190,0 L0,${-ry} L190,0 L0,${ry} Z" fill="${lg([[0, '#2A323B'], [1, '#161B21']], 0, 0, 1, 1)}"/>
    <path d="M-190,0 L0,${ry} L190,0 L190,10 L0,${ry + 10} L-190,10 Z" fill="#0B0E12"/>
    <circle cx="0" cy="0" r="10" fill="${P.gold}"/>
    <g transform="rotate(${swing})"><path d="M0,0 C60,4 120,14 150,20 L150,110" stroke="${P.gold}" stroke-width="6" fill="none"/>
    <path d="M140,105 L160,105 L166,160 L134,160 Z" fill="${P.gold}"/></g></g>`;
}

// Cây trong chậu / cây nhỏ: gốc ở (x,y)
function tree(x, y, s) {
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="M-60,0 L-50,-120 L50,-120 L60,0 Z" fill="#C98E74"/><rect x="-6" y="-260" width="12" height="150" fill="#6B5040"/>
    <circle cx="0" cy="-300" r="90" fill="#8DA68A"/><circle cx="-60" cy="-240" r="60" fill="#7C9879"/><circle cx="60" cy="-250" r="64" fill="#9BB596"/></g>`;
}
