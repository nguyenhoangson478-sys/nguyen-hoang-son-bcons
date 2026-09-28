// Hồi I–III: hy vọng → vòng xoáy → sụp đổ.  Mỗi cú: { id, d (giây), draw(t, p) → svg, grade(t, p) → hậu kỳ }
const SHOTS = [];
const shot = (id, d, draw, grade = () => ({})) => SHOTS.push({ id, d, draw, grade });

// ---------- bối cảnh dùng lại ----------
function wallTiles(col, a = .05, size = 135) {
  let s = ''; for (let x = 0; x <= W; x += size) s += `<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${col}" stroke-opacity="${a}" stroke-width="3"/>`;
  for (let y = 0; y <= H; y += size) s += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${col}" stroke-opacity="${a}" stroke-width="3"/>`;
  return s;
}
function gownHanger(x, y, s, col = '#1E2A3A') {
  return `<g transform="translate(${x},${y}) scale(${s})"><path d="M0,-40 C-10,-60 10,-70 12,-54" stroke="#9A8F84" stroke-width="6" fill="none"/>
    <path d="M-120,0 L0,-40 L120,0" stroke="#9A8F84" stroke-width="8" fill="none"/>
    <path d="M-110,0 C-160,200 -170,500 -190,760 L190,760 C170,500 160,200 110,0 C60,-20 -60,-20 -110,0 Z" fill="${col}"/>
    <path d="M-40,-14 L0,80 L40,-14" stroke="${P.gold}" stroke-width="10" fill="none"/>
    <path d="M-110,0 C-190,120 -230,300 -250,420 L-170,440 C-150,320 -130,200 -110,120 Z" fill="${col}"/><path d="M110,0 C190,120 230,300 250,420 L170,440 C150,320 130,200 110,120 Z" fill="${col}"/></g>`;
}
function spaCounter(t, o = {}) {
  const { spot = .5 } = o;
  let shelf = ''; const r = rng(21), cols = ['#E9C9A8', '#C9A45C', '#F4EDE4', '#D9735A', '#8DA68A', '#E7C9BE'];
  [376, 736].forEach(y => { for (let i = 0; i < 11; i++) { const h = 90 + r() * 120, w = 50 + r() * 40; shelf += `<rect x="${20 + i * 98}" y="${y - h}" width="${w}" height="${h}" rx="12" fill="${cols[i % 6]}"/>`; } });
  return {
    back: `<rect width="${W}" height="${H}" fill="${lg([[0, '#3B2A20'], [1, '#1E1510']])}"/>
      <g${blur(22)} opacity=".85"><rect x="0" y="360" width="1080" height="16" fill="#8A6A4A"/><rect x="0" y="720" width="1080" height="16" fill="#8A6A4A"/>${shelf}</g>
      ${glow(300, 220, 180, '#FFD9A0', .35)}${glow(820, 180, 200, '#FFD9A0', .3)}`,
    top: `<path d="M-200,1000 L1280,1000 L1280,2100 L-200,2100 Z" fill="${lg([[0, '#EDE4D7'], [1, '#BFB2A0']])}"/>
      <path d="M100,1120 C300,1180 420,1100 620,1200 M500,1500 C700,1440 820,1560 1080,1480 M0,1700 C200,1660 300,1760 520,1720" stroke="#A89A88" stroke-opacity=".5" stroke-width="4" fill="none"/>
      <rect x="-200" y="1000" width="1480" height="8" fill="#FFF3E0" opacity=".6"/>
      <ellipse cx="620" cy="1150" rx="560" ry="220" fill="${rg([[0, '#FFE3B5', spot], [1, '#FFE3B5', 0]])}"/>`,
  };
}
function bathroomNight(t, flick = 1) {
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#16242B'], [1, '#0A1115']])}"/>${wallTiles('#fff', .045)}
    <rect x="0" y="0" width="60" height="${H}" fill="#E7B77A" opacity=".14"${blur(24)}/>
    <rect x="600" y="336" width="340" height="30" rx="15" fill="#E9F7FB" opacity="${.3 + .7 * flick}"/>
    ${glow(770, 350, 260, '#BFE6F2', .55 * flick)}
    ${beam(770, 360, 770, 1180, 170, 380, '#CFE8F0', .28 * flick)}
    <rect x="548" y="408" width="444" height="664" rx="20" fill="#27353B"/>
    <rect x="560" y="420" width="420" height="640" rx="14" fill="${lg([[0, '#48626B'], [1, '#1D2D34']], 0, 0, 1, 1)}"/>`;
}
function towel(grip = 0) {
  return `<path d="M552,402 L996,402 L1000,470 C1004,640 992,760 1000,900 C960,930 930,880 890,915 C850,950 820,890 770,930 C735,958 720,880 690,905 C668,860 ${700 - grip * 20},720 680,600 C668,520 640,470 552,470 Z" fill="${lg([[0, '#8E8578'], [.35, '#B7AD9E'], [.6, '#8A8174'], [.85, '#A89E90'], [1, '#6F675D']], 0, 0, 1, 0)}"/>
    <path d="M700,470 C720,620 700,760 730,900 M820,470 C840,640 815,780 840,920 M920,470 C930,620 915,760 940,900" stroke="#5E574E" stroke-opacity=".5" stroke-width="10" fill="none"/>
    <path d="M552,402 L996,402 L996,440 L552,440 Z" fill="#CFC6B8" opacity=".6"/>`;
}
function nightBedroom(t) {
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#0D1224'], [1, '#05070E']])}"/>
    <rect x="150" y="260" width="780" height="900" fill="#05070E"/>
    <rect x="170" y="280" width="740" height="860" fill="${lg([[0, '#1B2C4F'], [1, '#2E3A5E']])}"/>
    <g${clip('<rect x="170" y="280" width="740" height="860"/>')}>
      <g${blur(24)} opacity=".9">${bokeh([[260, 900, 70, '#F2B866'], [360, 960, 50, '#E98C5E'], [520, 880, 60, '#9CC8FF'], [640, 1000, 80, '#F2B866'], [800, 920, 55, '#FF8FA3'], [720, 820, 40, '#9CC8FF'], [430, 780, 36, '#F2B866'], [870, 1040, 66, '#F2B866']])}<rect x="170" y="1040" width="740" height="100" fill="#3D3350"/></g>
      ${rain(t, 60, 170, 280, 740, 860, 7, 1500, '#DCE8FF', .28)}${drops(t, 80, 170, 280, 740, 860, 9)}
    </g>
    <rect x="530" y="260" width="20" height="900" fill="#05070E"/><rect x="150" y="700" width="780" height="18" fill="#05070E"/>
    <path d="M170,1140 L910,1140 L1080,1500 L0,1500 Z" fill="#6E86C4" opacity=".12"/>
    <path d="M-100,1330 C200,1290 880,1290 1180,1330 L1180,2100 L-100,2100 Z" fill="#141A33"/>
    <path d="M-100,1420 C260,1380 520,1450 760,1400 C900,1370 1000,1400 1180,1420" stroke="#232B4D" stroke-width="30" fill="none"/>
    <path d="M-100,1600 C300,1560 600,1650 1180,1580" stroke="#1B2242" stroke-width="40" fill="none"/>`;
}
function curledGirl(t, shake = 0) {
  const k = Math.sin(t * 9) * shake;
  return `<g transform="translate(0,${k})"><g fill="#04050A">
    <path d="M390,1345 C350,1230 370,1110 460,1045 C520,1000 600,1005 625,1055 C570,1120 530,1220 530,1345 Z"/>
    <path d="M420,1340 C480,1245 600,1125 705,1068 C745,1055 775,1090 762,1132 C720,1205 600,1300 525,1345 Z"/>
    <path d="M702,1066 C765,1076 796,1150 796,1332 L708,1336 C712,1250 698,1150 684,1100 Z"/>
    <ellipse cx="618" cy="1012" rx="92" ry="104" transform="rotate(32 618 1012)"/>
    <path d="M548,940 C470,975 440,1080 448,1200 C452,1262 468,1305 480,1330 L524,1330 C512,1232 522,1100 590,1016 Z"/>
    <path d="M520,1080 C600,1130 690,1165 770,1175" stroke="#04050A" stroke-width="52" stroke-linecap="round" fill="none"/></g>
    <g stroke="#8FB4FF" fill="none" stroke-linecap="round"><path d="M545,944 C590,905 660,915 700,960" stroke-opacity=".8" stroke-width="7"/>
    <path d="M540,948 C470,985 445,1080 452,1195" stroke-opacity=".55" stroke-width="5"/><path d="M707,1066 C745,1058 770,1088 762,1128" stroke-opacity=".6" stroke-width="5"/></g></g>`;
}
function groupPhoto(x, y, w, h, gap = true, withHer = false) {
  // Ảnh nhóm tốt nghiệp: trời xanh, hàng cây, 5 người mặc áo choàng
  const people = [[.14, '#1E2A3A'], [.3, '#1E2A3A'], [.5, '#1E2A3A'], [.7, '#1E2A3A'], [.86, '#1E2A3A']];
  const inner = `<rect width="${w}" height="${h}" fill="${lg([[0, '#9CC6E8'], [.55, '#D8E8F0'], [1, '#C9D6C2']])}"/>
    <g${blur(3)}>${[.05, .22, .4, .62, .8, .95].map(k => `<circle cx="${k * w}" cy="${h * .5}" r="${h * .18}" fill="#7C9A6E"/>`).join('')}</g>
    <rect y="${h * .62}" width="${w}" height="${h * .38}" fill="#B9C4A8"/>
    ${people.map(([k, c], i) => (i === 2 && gap && !withHer) ? '' : figure(k * w, h * 1.02, h / 1050, { gown: c, cap: true, armL: i === 1 ? -30 : 0, armR: i === 3 ? -30 : 0 })).join('')}`;
  return `<g transform="translate(${x},${y})"><rect x="-18" y="-18" width="${w + 36}" height="${h + 90}" fill="#FBF8F2"/>
    <g${clip(`<rect width="${w}" height="${h}"/>`)}>${inner}</g></g>`;
}

// ================= HỒI I: HY VỌNG =================
shot('01-guong-sang', 3.4, (t, p) => {
  const [hx, hy] = hand_held(t, .6); setCam(hx, hy, 1 + .08 * eio(p));
  const touch = eo(seq(t, .3, 2.3));
  return L(.3, `<rect width="${W}" height="${H}" fill="${lg([[0, '#F4E3CC'], [1, '#D9BFA0']])}"/>${glow(160, 260, 520, '#FFE8B8', .9)}${gownHanger(880, 520, 1.2)}`, 16)
    + L(.6, faceFront(560, 920, 1.4, { spots: [[-128, 64], [118, 30], [-70, 150]], look: -8, blushA: .45 }))
    + L(.8, beam(40, 120, 900, 1600, 60, 260, '#FFF1D6', .22) + dust(t, 40, 0, 200, 1080, 1500, 3))
    + `<rect x="0" y="0" width="70" height="${H}" fill="#6A5646" opacity=".55"/>`
    + L(1.3, hand(560 + 170 - 120 * (1 - touch), 1240 + 200 * (1 - touch), -25, 1.15, 'touch', { sleeve: '#E8DCCD' }), 3)
    + (touch > .98 ? glow(378, 1010, 40, '#fff', .35) : '');
}, (t, p) => ({ tint: '#F2B866', tintA: .1, leak: '#FFD9A0', leakA: .45, vig: .5, grain: .08, lift: .05 }));

shot('02-mu-roi', 3.2, (t, p) => {
  setCam(0, -60 * eio(p), 1.02);
  const fall = eio(seq(t, 0, 2.7)), y = lerp(250, 1250, fall), land = seq(t, 2.7, 3.2);
  return `<rect width="${W}" height="${H}" fill="#07080B"/>`
    + L(.3, glow(540, 200, 700, '#8FA3B8', .28) + beam(540, -100, 540, 1400, 120, 420, '#AFC2D6', .12))
    + L(.6, `<ellipse cx="540" cy="1330" rx="${180 + 60 * fall}" ry="30" fill="#000" opacity="${.6 * fall}"/>` + dust(t, 25, 200, 300, 700, 1100, 8, '#C9D6E2', .5)
      + gradCap(540 + Math.sin(t * 1.3) * 40, y - Math.sin(land * Math.PI) * 30, 1.35, lerp(-35, 8, fall) + Math.sin(t * 2) * 6, .3 + .4 * Math.sin(t * 1.7) ** 2, Math.sin(t * 3.2) * 25 * (1 - land)))
    + `<rect x="0" y="1330" width="${W}" height="600" fill="#050608"/>`;
}, () => ({ tint: '#5E7A96', tintA: .35, vig: .85, grain: .12 }));

shot('03-anh-khuyet', 3.2, (t, p) => {
  setCam(lerp(-70, 50, eio(p)), 0, 1.12 - .06 * eio(p));
  const focus = 14 * (1 - ease(seq(t, .2, 1.6)));
  return L(.5, `<rect width="${W}" height="${H}" fill="${lg([[0, '#2A211C'], [1, '#17120F']])}"/>${[300, 700, 1100, 1500].map(y => `<line x1="0" y1="${y}" x2="${W}" y2="${y + 40}" stroke="#3A2E27" stroke-width="6"/>`).join('')}`)
    + L(.8, `<g transform="rotate(-4 540 960)">${groupPhoto(120, 640, 840, 620, true)}
        <rect x="${120 + .5 * 840 - 70}" y="700" width="140" height="560" fill="#1B1512"/>
        <path d="M${120 + .5 * 840 - 70},700 l140,0 l0,560 l-140,0 Z" stroke="#F4EFE6" stroke-width="3" fill="none" stroke-dasharray="10 8" opacity=".5"/></g>`, focus)
    + L(1.2, `<g transform="translate(780,1560) rotate(28)"><circle cx="0" cy="0" r="46" fill="none" stroke="#8C8C92" stroke-width="16"/><circle cx="0" cy="130" r="46" fill="none" stroke="#8C8C92" stroke-width="16"/><path d="M20,30 L160,-330 M20,100 L170,-320" stroke="#B9BCC2" stroke-width="18"/></g>`, 18)
    + glow(540, 900, 600, '#F3D9B5', .15);
}, () => ({ tint: '#7A8896', tintA: .25, vig: .75, grain: .1 }));

function dormRoom(t, sun = 1) {
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#EADCC8'], [1, '#C8B299']])}"/>
    <rect x="60" y="260" width="420" height="640" fill="#FFF3DC"/><rect x="60" y="260" width="420" height="640" fill="none" stroke="#B59C82" stroke-width="22"/>
    <rect x="262" y="260" width="16" height="640" fill="#B59C82"/><rect x="60" y="570" width="420" height="16" fill="#B59C82"/>
    ${glow(270, 580, 480, '#FFE9C0', .8 * sun)}
    <path d="M480,280 C520,420 520,760 480,900 L500,900 C540,760 540,420 500,280 Z" fill="#E7C7A6"/>
    <rect x="760" y="360" width="220" height="280" rx="10" fill="#F7F0E6"/><rect x="760" y="360" width="220" height="50" rx="10" fill="#D9735A"/>
    ${Array.from({ length: 20 }, (_, i) => `<rect x="${778 + (i % 5) * 40}" y="${430 + Math.floor(i / 5) * 48}" width="26" height="26" rx="4" fill="${i === 13 ? '#D9735A' : '#E6DCCF'}"/>`).join('')}`;
}
shot('04a-phong-ktx', 2.2, (t, p) => {
  setCam(lerp(60, -40, eio(p)), 0, 1.04);
  return L(.3, dormRoom(t)) + L(.5, beam(270, 420, 900, 1700, 120, 320, '#FFF1D6', .25) + dust(t, 35, 100, 400, 900, 1200, 4))
    + L(.7, `<rect x="560" y="1180" width="560" height="40" fill="#8A6A4F"/><rect x="580" y="1220" width="30" height="700" fill="#6E5440"/><rect x="1060" y="1220" width="30" height="700" fill="#6E5440"/>
      <circle cx="930" cy="1080" r="80" fill="#E8DCCD" stroke="#B59C82" stroke-width="12"/><rect x="920" y="1150" width="20" height="40" fill="#B59C82"/>
      <rect x="650" y="1110" width="70" height="70" rx="10" fill="#C98E74"/><circle cx="685" cy="1080" r="50" fill="#8DA68A"/>`)
    + L(.85, figure(760, 1560, .78, { back: true, col: '#EADFD3' }))
    + L(1.4, `<rect x="-60" y="1300" width="300" height="700" rx="30" fill="#5A4636"/><path d="M-60,1300 L240,1300 L240,1340 L-60,1340 Z" fill="#7A6250"/>`, 20);
}, () => ({ tint: '#F2B866', tintA: .12, leak: '#FFE0B0', leakA: .35, vig: .5, grain: .08 }));

shot('04b-ban-hoc', 2.2, (t, p) => {
  setCam(0, 0, 1.02 + .06 * eio(p));
  return L(.3, dormRoom(t), 16)
    + L(.6, `<rect x="-100" y="1320" width="1300" height="700" fill="#8A6A4F"/><circle cx="700" cy="1000" r="230" fill="#E8DCCD" stroke="#B59C82" stroke-width="20"/>
      <g${clip('<circle cx="700" cy="1000" r="215"/>')}><rect x="480" y="780" width="440" height="440" fill="#EFD9C2"/>${faceFront(700, 1060, .75, { spots: [[-110, 50], [100, 20], [-60, 140]], look: -10 })}</g>
      <rect x="690" y="1230" width="20" height="90" fill="#B59C82"/>${bottle(960, 1320, .8, '#F2E3D0', '#C9A45C')}`)
    + L(1.3, `<ellipse cx="160" cy="1250" rx="330" ry="420" fill="${P.hair}"/><path d="M-200,2000 L-200,1500 C-60,1380 180,1380 360,1500 L460,2000 Z" fill="#EADFD3"/>`, 22)
    + L(.8, beam(80, 300, 700, 1400, 60, 220, '#FFF1D6', .2) + dust(t, 25, 300, 600, 700, 900, 6));
}, () => ({ tint: '#F2B866', tintA: .12, leak: '#FFE0B0', leakA: .3, vig: .55, grain: .08 }));

shot('05-lich-chup', 2.5, (t, p) => {
  setCam(0, 0, 1.03);
  const rack = ease(seq(t, .9, 1.9));
  return L(.3, `<rect width="${W}" height="${H}" fill="${lg([[0, '#E6D5C0'], [1, '#B9A188']])}"/>${gownHanger(600, 360, 1.5)}${glow(900, 300, 400, '#FFE9C0', .6)}`, lerp(26, 0, rack))
    + L(.9, phone(470, 1180, 430, 860, -6, (w, h) => `<rect width="${w}" height="${h}" fill="${lg([[0, '#3A4B5E'], [1, '#1B2533']])}"/>
        ${txt(w / 2, 170, '07:12', 110, '#fff', 300, 'text-anchor="middle"')}${txt(w / 2, 225, 'Thứ Hai, 3 tháng 6', 26, '#DDE6F0', 400, 'text-anchor="middle"')}
        <rect x="24" y="300" width="${w - 48}" height="130" rx="26" fill="#fff" opacity=".88"/>
        <rect x="46" y="324" width="44" height="44" rx="10" fill="#D9735A"/>${txt(58, 355, '15', 22, '#fff', 800)}
        ${txt(104, 344, 'LỊCH', 18, '#6B6B72', 700)}${txt(104, 378, 'Chụp ảnh tốt nghiệp', 25, '#1B1B1F', 700)}${txt(104, 410, 'Còn 14 ngày nữa ✨', 22, '#3B3B40', 400)}`,
      { glowCol: '#CFE0FF', glowA: .25 }) + hand(560, 1720, -12, 1.2, 'hold', { sleeve: '#EADFD3' }), lerp(0, 12, rack));
}, () => ({ tint: '#F2B866', tintA: .1, leak: '#FFE0B0', leakA: .3, vig: .55, grain: .08 }));

shot('06-guong-tay', 1.8, (t, p) => {
  setCam(0, 0, 1.06 + .04 * p, Math.sin(t * 1.5) * 2);
  const tilt = Math.sin(t * 1.8) * 6, glint = seq(t, .3, 1.4);
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#D8C3AA'], [1, '#9E8670']])}"/>`
    + L(.5, `<g transform="rotate(${tilt} 540 900)"><circle cx="540" cy="900" r="430" fill="#C9A45C"/><circle cx="540" cy="900" r="400" fill="#EFD9C2"/>
      <g${clip('<circle cx="540" cy="900" r="400"/>')}>${faceFront(560, 980, 1.9, { spots: [[-120, 40], [-80, 110], [-150, 90]], look: -14 })}
      ${beam(100 + glint * 900, 400, 300 + glint * 900, 1400, 30, 60, '#FFFFFF', .35)}</g></g>`)
    + L(1.3, hand(900, 1700, 20, 1.6, 'hold', { sleeve: '#EADFD3', flip: true }), 10);
}, () => ({ tint: '#F2B866', tintA: .1, vig: .6, grain: .08 }));

shot('07a-mo-tot-nghiep', 2.5, (t, p) => {
  setCam(0, 30 * p, 1.02 + .05 * eio(p));
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#F6C98A'], [.55, '#F3A77A'], [1, '#8E5E54']])}"/>`
    + L(.2, glow(700, 700, 700, '#FFF1C9', 1) + bokeh([[200, 500, 60, '#FFE2A8'], [880, 420, 80, '#FFD1A0'], [300, 1100, 50, '#FFE8C0'], [950, 1000, 70, '#FFC994']], .6), 10)
    + L(.5, faceFront(540, 900, 1.05, { expr: 'smile', gown: '#1E2A3A', capOn: true, look: 4, blushA: .55, lightX: 1 }))
    + L(.5, `<path d="M${540 - 250},${900 - 330} C${540 - 100},${900 - 420} ${540 + 180},${900 - 400} ${540 + 260},${900 - 250}" stroke="#FFE7B8" stroke-width="10" fill="none" opacity=".7"/>`)
    + L(1.1, dust(t, 40, 0, 0, 1080, 1920, 12, '#FFF6DA', .8), 2);
}, () => ({ tint: '#F7B267', tintA: .12, leak: '#FFF0C8', leakA: .7, lift: .12, vig: .35, grain: .06 }));

shot('07b-tung-mu', 2.3, (t, p) => {
  setCam(0, -40 * p, 1.02);
  const caps = [[200, 1.1, -20, 0], [430, .9, 15, .3], [650, 1.2, -8, .15], [860, .95, 25, .45], [330, .7, 40, .6], [760, .75, -30, .7]];
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#F3B47C'], [.6, '#F6D29A'], [1, '#F2E0B8']])}"/>` + L(.3, glow(540, 1350, 600, '#FFF4D0', .9))
    + L(.6, caps.map(([x, s, r, d]) => { const k = seq(t, d, d + 2.2); const y = 1500 - 1250 * eo(k) + 200 * ei(k); return gradCap(x, y, s, r + t * 40 * (d - .3), .5 + .4 * Math.sin(t * 3 + d * 5), Math.sin(t * 4 + d) * 30); }).join(''), 1)
    + L(1.1, `<g fill="#241510">${[150, 360, 560, 780, 960].map((x, i) => `<g transform="rotate(${(i - 2) * 7} ${x} 1900)"><path d="M${x - 30},1920 L${x - 20},${1600 - i % 2 * 60} L${x + 20},${1600 - i % 2 * 60} L${x + 30},1920 Z"/><ellipse cx="${x}" cy="${1570 - i % 2 * 60}" rx="30" ry="42"/>${[-36, -12, 12, 36].map(a => `<rect x="${x - 6}" y="${1490 - i % 2 * 60}" width="12" height="54" rx="6" transform="rotate(${a} ${x} ${1570 - i % 2 * 60})"/>`).join('')}</g>`).join('')}
      <path d="M-50,1920 C100,1700 300,1680 540,1720 C780,1680 980,1700 1130,1920 Z"/></g>`, 4);
}, () => ({ tint: '#F7B267', tintA: .12, leak: '#FFF0C8', leakA: .6, lift: .1, vig: .4, grain: .06 }));

// ================= HỒI II: VÒNG XOÁY =================
shot('08-soi-da', 4.0, (t, p) => {
  const [hx, hy] = hand_held(t, .5); setCam(hx, hy, 1 + .1 * eio(p));
  const c = spaCounter(t), scan = (t * .6) % 1;
  return L(.2, c.back) + L(.5, c.top)
    + L(.7, `<g transform="translate(610,860) rotate(-8)"><rect x="-230" y="-300" width="460" height="600" rx="30" fill="#1A1C20"/>
      <rect x="-210" y="-280" width="420" height="560" rx="18" fill="#0E1417"/>
      <g${clip('<rect x="-210" y="-280" width="420" height="560" rx="18"/>')}>
        <g opacity=".85">${faceFront(0, 10, .72, { spots: [[-120, 40], [100, 30], [-60, 130], [90, 120], [0, -150]] })}</g>
        ${[[-80, 20, 90], [80, 30, 80], [0, -120, 70], [0, 120, 60]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FF3B30" opacity="${.25 + .15 * Math.sin(t * 4 + x)}"/><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#FF6B5E" stroke-width="4"/>`).join('')}
        <rect x="-210" y="${-280 + scan * 560}" width="420" height="6" fill="#7FF0FF" opacity=".8"/>
        ${txt(-190, -240, 'PHÂN TÍCH DA', 22, '#7FF0FF', 700)}${txt(90, 250, 'NGUY CƠ CAO', 20, '#FF6B5E', 800)}
      </g></g>` + hand(860, 1180, -30, 1.1, 'hold', { sleeve: '#2A2E33' }))
    + L(1.4, `<path d="M-100,1920 L-100,1300 C-20,1180 160,1150 300,1220 C380,1260 420,1380 420,1500 L460,1920 Z" fill="#C7B6A6"/>
      <path d="M-100,1400 C-60,1000 40,760 200,700 C300,670 360,760 340,900 C320,1100 260,1250 180,1400 Z" fill="#1E1512"/>`, 24);
}, (t, p) => ({ tint: lerp(0, 1, p) > .5 ? '#6F7A3A' : '#B98A4A', tintA: .14, vig: .7, grain: .1 }));

shot('09-the-lieu-trinh', 1.5, (t, p) => {
  const hit = eo(seq(t, 0, .35)), [hx, hy] = hand_held(t * 3, hit < 1 ? 1.5 : .3); setCam(hx, hy, 1.15);
  const c = spaCounter(t, { spot: .6 });
  return L(.2, c.back, 6) + L(.5, c.top)
    + L(.8, `<g transform="translate(540,${lerp(820, 1180, hit)}) rotate(${lerp(-18, -4, hit)})">
      <rect x="-300" y="-180" width="600" height="360" rx="24" fill="#FBF6EE"/><rect x="-300" y="-180" width="600" height="90" rx="24" fill="#2F4A3F"/><rect x="-300" y="-110" width="600" height="20" fill="#2F4A3F"/>
      ${txt(0, -118, 'LIỆU TRÌNH 10 BUỔI', 38, '#F7F0E6', 800, 'text-anchor="middle" letter-spacing="3"')}
      ${Array.from({ length: 10 }, (_, i) => `<circle cx="${-220 + (i % 5) * 110}" cy="${-10 + Math.floor(i / 5) * 100}" r="36" fill="none" stroke="#C9A45C" stroke-width="5" stroke-dasharray="8 6"/>`).join('')}</g>`)
    + L(1.2, hand(820, lerp(900, 1300, hit), -40, 1.3, 'open', { sleeve: '#2A2E33' }), 6);
}, () => ({ tint: '#8A8A3A', tintA: .12, vig: .7, grain: .1 }));

shot('10-them-serum', 1.7, (t, p) => {
  setCam(0, 0, 1.12 + .04 * p);
  const c = spaCounter(t, { spot: .6 }), put = eo(seq(t, 0, .45)), pr = seq(t, .5, 1.7);
  return L(.2, c.back, 6) + L(.5, c.top)
    + L(.7, `<g opacity=".95"><rect x="170" y="1080" width="480" height="270" rx="18" fill="#FBF6EE" transform="rotate(-4 400 1200)"/><rect x="170" y="1080" width="480" height="70" rx="18" fill="#2F4A3F" transform="rotate(-4 400 1200)"/></g>
      ${bottle(760, lerp(800, 1220, put), 1.6, '#E7C9BE', '#2B2420', '#fff', 0)}
      <rect x="-40" y="880" width="260" height="190" rx="22" fill="#2B2724"/><rect x="0" y="880" width="180" height="16" fill="#111"/>
      <path d="M20,${885} L160,885 L160,${885 - 360 * pr} L20,${885 - 360 * pr} Z" fill="#FBF8F2"/>
      ${Array.from({ length: 8 }, (_, i) => 885 - 40 - i * 44 > 885 - 360 * pr ? `<rect x="40" y="${885 - 40 - i * 44}" width="${60 + (i * 37) % 50}" height="8" rx="4" fill="#9C948A"/>` : '').join('')}`)
    + L(1.2, hand(900, lerp(900, 1330, put), -35, 1.3, 'hold', { sleeve: '#2A2E33' }), 5);
}, () => ({ tint: '#7E8A3A', tintA: .14, vig: .7, grain: .1 }));

shot('11-the-hen', 2.4, (t, p) => {
  setCam(0, 0, 1.1 - .05 * p);
  const c = spaCounter(t, { spot: .55 }), fan = eo(seq(t, 0, 1.4));
  const cards = Array.from({ length: 7 }, (_, i) => { const a = (i - 3) * 13 * fan; return `<g transform="translate(540,1380) rotate(${a}) translate(0,-330)"><rect x="-140" y="-190" width="280" height="380" rx="18" fill="#FBF6EE" stroke="#E0D6C8" stroke-width="3"/><rect x="-140" y="-190" width="280" height="70" rx="18" fill="#D9735A"/>${txt(0, -140, 'LỊCH HẸN', 26, '#fff', 800, 'text-anchor="middle"')}${txt(0, -40, `${12 + i * 3}/5`, 64, '#2B2420', 800, 'text-anchor="middle"')}${txt(0, 20, 'Chăm sóc chuyên sâu', 22, '#6B6259', 500, 'text-anchor="middle"')}</g>`; }).join('');
  return L(.2, c.back, 8) + L(.5, c.top) + L(.8, cards) + L(1.3, hand(780, 1760, -20, 1.3, 'open', { sleeve: '#2A2E33' }), 8);
}, () => ({ tint: '#6F7A3A', tintA: .16, vig: .72, grain: .1 }));

shot('12-ky-hoa-don', 2.9, (t, p) => {
  setCam(0, 0, 1.06 + .12 * eio(p));
  const hes = seq(t, .4, 1.6), sign = seq(t, 1.7, 2.7);
  const penX = 600 + (hes < 1 ? Math.sin(t * 30) * 3 : 0) + sign * 200, penY = 1320 + Math.sin(sign * 20) * 18 * (sign > 0 && sign < 1);
  let sig = ''; if (sign > 0) { const pts = []; for (let k = 0; k <= sign * 60; k++) { const u = k / 60; pts.push(`${600 + u * 200},${1320 + Math.sin(u * 20) * 18}`); } sig = `<polyline points="${pts.join(' ')}" stroke="#1B2A6B" stroke-width="5" fill="none" stroke-linecap="round"/>`; }
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#CDBFAC'], [1, '#9E8F7C']])}"/>`
    + L(.5, `<g transform="rotate(-6 540 960)"><rect x="300" y="-100" width="480" height="1700" fill="#FBF8F2"/>
      ${Array.from({ length: 26 }, (_, i) => `<rect x="340" y="${-60 + i * 48}" width="${120 + (i * 53) % 180}" height="10" rx="5" fill="#A8A095"/><rect x="${680 - (i % 3) * 10}" y="${-60 + i * 48}" width="${60 + (i % 3) * 10}" height="10" rx="5" fill="#8C8378"/>`).join('')}
      <rect x="340" y="1200" width="400" height="4" fill="#2B2420"/>${txt(340, 1180, 'TỔNG CỘNG', 30, '#2B2420', 800)}
      <rect x="560" y="1156" width="180" height="30" rx="6" fill="#B8412C"/>
      <line x1="560" y1="1360" x2="780" y2="1360" stroke="#8C8378" stroke-width="3" stroke-dasharray="8 6"/>${sig}</g>`)
    + L(.9, hand(penX + 60, penY + 310, 20, 1.2, 'pen', { sleeve: '#EADFD3' }), 2)
    + L(.3, glow(540, 800, 700, '#E8F0C0', .12));
}, () => ({ tint: '#6F7A3A', tintA: .18, vig: .78, grain: .11 }));

// ================= HỒI III: SỤP ĐỔ =================
shot('13-den-chap', 2.5, (t, p) => {
  setCam(0, 0, 1.04);
  const f = t < .35 ? 0 : [1, 0, .2, 1, 0, 1, .4, 1][Math.floor((t - .35) * 9) % 8];
  return bathroomNight(t, f) + `<g opacity="${.2 + .8 * f}">${towel(0)}</g>` + `<rect width="${W}" height="${H}" fill="#000" opacity="${t < .35 ? 1 : .55 * (1 - f)}"/>`;
}, () => ({ tint: '#1C4250', tintA: .2, vig: .85, grain: .14 }));

shot('14-khan-phu-guong', 2.7, (t, p) => {
  const [hx, hy] = hand_held(t, .5); setCam(hx, hy, 1 + .08 * eio(p));
  const f = .85 + .15 * Math.sin(t * 17) * Math.sin(t * 5), grip = ease(seq(t, .6, 2));
  return L(.3, bathroomNight(t, f))
    + L(.4, `<g${clip('<rect x="560" y="420" width="420" height="640" rx="14"/>')}><g transform="translate(640,1010) rotate(-8)"><ellipse cx="0" cy="0" rx="150" ry="170" fill="#C99A86"/>${glow(-30, 30, 90, '#C2574A', .6)}
      <circle cx="-50" cy="10" r="9" fill="#9E2F25"/><circle cx="-10" cy="50" r="8" fill="#9E2F25"/><circle cx="-80" cy="60" r="7" fill="#9E2F25"/><circle cx="20" cy="0" r="7" fill="#9E2F25"/>
      <path d="M-70,-60 q25,-12 50,2" stroke="#1A1210" stroke-width="10" fill="none" stroke-linecap="round"/>
      <path d="M-150,-120 C-160,-240 120,-260 150,-110 L160,40 C120,-80 20,-130 -40,-110 C-90,-100 -130,-60 -150,20 Z" fill="#120D0C"/></g>
      <rect x="560" y="420" width="420" height="640" fill="#0B1418" opacity=".35"/></g>${towel(grip)}
      <rect x="0" y="1170" width="1080" height="800" fill="#0E171B"/><rect x="0" y="1170" width="1080" height="14" fill="#9CC3CF" opacity=".25"/>`)
    + L(1.3, `<path d="M430,1560 C470,1360 540,1130 610,900" stroke="#1B252A" stroke-width="110" stroke-linecap="round" fill="none"/>
      ${hand(612, 960, 10, .75, 'hold', { skin: '#8F7666', sh: '#6D5649' })}
      <path d="M-120,2000 L-120,1560 C-60,1380 120,1330 300,1360 C420,1380 520,1470 560,1600 L620,2000 Z" fill="#161F24"/>
      <ellipse cx="250" cy="1330" rx="300" ry="330" fill="#07090B"/><path d="M60,1040 C160,960 360,960 470,1060" stroke="#7FC4D6" stroke-opacity=".55" stroke-width="12" fill="none"/>`, 12);
}, () => ({ tint: '#1C4250', tintA: .14, vig: .8, grain: .12 }));

function chatScreen(w, h, t, typed, recalled) {
  return `<rect width="${w}" height="${h}" fill="#F4F1EC"/><rect width="${w}" height="120" fill="#EAE3DA"/>
    <circle cx="60" cy="68" r="32" fill="#8DA68A"/>${txt(110, 62, 'Chị tư vấn', 34, '#2B2420', 700)}${txt(110, 98, 'Đang hoạt động', 22, '#6B8E6B', 500)}
    <rect x="30" y="170" width="${w * .8}" height="96" rx="30" fill="#fff"/>${txt(54, 230, 'Em nhớ dùng đều serum nha 💕', 30, '#2B2420', 500)}
    ${recalled ? `<rect x="${w - 30 - w * .72}" y="300" width="${w * .72}" height="90" rx="30" fill="none" stroke="#B7ABA0" stroke-width="4" stroke-dasharray="10 7"/>${txt(w - 30 - w * .72 + 24, 356, '⊘ Tin nhắn đã thu hồi', 29, '#8F837A', 500, 'font-style="italic"')}` : ''}
    <rect x="20" y="${h - 110}" width="${w - 40}" height="76" rx="38" fill="#fff"/>
    ${txt(48, h - 58, typed, 32, '#2B2420', 500)}<rect x="${52 + typed.length * 16.3}" y="${h - 90}" width="3" height="36" fill="#D9735A" opacity="${Math.floor(t * 2.4) % 2}"/>`;
}
shot('15-go-tin-nhan', 2.2, (t, p) => {
  setCam(0, 0, 1.08 + .05 * p);
  const msg = 'Chị ơi, da em dạo này…', n = Math.floor(clamp(t / 1.5) * msg.length);
  return `<rect width="${W}" height="${H}" fill="#07080C"/>`
    + L(.6, phone(540, 900, 640, 1280, 0, (w, h) => chatScreen(w, h, t, msg.slice(0, n), false), { glowCol: '#DDE8F5', glowA: .3 }))
    + L(1.1, hand(700 + Math.sin(t * 6) * 6, 1880, -18, 1.35, 'touch', { sleeve: '#1E2328', skin: '#D9B5A0' }), 6);
}, () => ({ tint: '#2A4A6A', tintA: .18, vig: .85, grain: .12 }));

shot('16-thu-hoi', 2.2, (t, p) => {
  setCam(0, 0, 1.13 + .04 * p);
  const fall = seq(t, .5, 1.05), splash = seq(t, 1.05, 2.2), dy = lerp(-100, 820, ei(fall));
  return `<rect width="${W}" height="${H}" fill="#07080C"/>`
    + L(.6, phone(540, 900, 640, 1280, 0, (w, h) => chatScreen(w, h, t, '', true), { glowCol: '#DDE8F5', glowA: .3 })
      + (splash > 0 ? `<ellipse cx="600" cy="820" rx="${40 + 50 * eo(splash)}" ry="${30 + 36 * eo(splash)}" fill="#DCEBF7" opacity="${.35 * (1 - splash * .6)}"/><ellipse cx="590" cy="812" rx="${20 + 20 * eo(splash)}" ry="${12 + 10 * eo(splash)}" fill="#fff" opacity=".5"/>` : ''))
    + (fall < 1 ? L(1.2, `<path d="M600,${dy - 40} C620,${dy} 630,${dy + 30} 600,${dy + 40} C570,${dy + 30} 580,${dy} 600,${dy - 40} Z" fill="#CFE6F5" opacity=".9"/><circle cx="592" cy="${dy + 16}" r="6" fill="#fff"/>`) : '');
}, () => ({ tint: '#2A4A6A', tintA: .2, vig: .88, grain: .13 }));

shot('17-mun-day', 1.6, (t, p) => {
  setCam(0, 0, 1.05 + .1 * eio(p));
  return `<rect width="${W}" height="${H}" fill="#0B0C10"/>` + L(.3, glow(300, 400, 600, '#E8EEF2', .25))
    + L(.6, faceProfile(560, 980, 1.9, { acne: 14, red: .55 }))
    + L(.6, beam(0, 0, 500, 1100, 80, 200, '#FFFFFF', .18))
    + `<rect width="${W}" height="${H}" fill="${lg([[0, '#000', 0], [.55, '#000', 0], [1, '#000', .7]], 0, 0, 1, 0)}"/>`;
}, () => ({ tint: '#3A5566', tintA: .2, vig: .85, grain: .13, lift: .04 }));

shot('18-cham-ma', 1.4, (t, p) => {
  setCam(-40, 60, 1.35 + .05 * p);
  return `<rect width="${W}" height="${H}" fill="#120E0E"/>`
    + L(.6, faceFront(620, 820, 1.7, { acne: 16, red: .95, expr: 'sad', look: -12 }))
    + L(1, hand(350, 1290, 12, 1.25, 'open', { sleeve: '#3A3F48', tremble: 3, t }), 1);
}, () => ({ tint: '#5A2A2A', tintA: .14, vig: .85, grain: .13 }));

shot('19-so-du', 3.4, (t, p) => {
  setCam(0, 0, 1.06 + .04 * p);
  const v = Math.round(lerp(12450000, 1230000, eo(seq(t, .2, 2.8))) / 1000) * 1000;
  const fmt = n => n.toLocaleString('vi-VN') + ' đ', sc = seq(t, 0, 3.4) * 360;
  const items = ['Thanh toán liệu trình', 'Mua serum đặc trị', 'Chăm sóc chuyên sâu', 'Mua kem phục hồi', 'Liệu trình bổ sung', 'Mặt nạ tái tạo', 'Thanh toán liệu trình', 'Tinh chất phục hồi'];
  return `<rect width="${W}" height="${H}" fill="#07080C"/>`
    + L(.6, phone(540, 960, 700, 1400, 0, (w, h) => `<rect width="${w}" height="${h}" fill="#F5F6F8"/>
      <rect width="${w}" height="330" fill="${lg([[0, '#1E3A5F'], [1, '#274B78']])}"/>${txt(40, 80, 'Số dư khả dụng', 26, '#C9D8EC', 500)}
      ${txt(40, 170, fmt(v), 64, '#fff', 800)}<rect x="40" y="230" width="${(w - 80) * v / 12450000}" height="12" rx="6" fill="${v < 4000000 ? '#FF6B5E' : '#7FD1A0'}"/>
      <g transform="translate(0,${-sc})">${items.map((s, i) => `<g transform="translate(0,${380 + i * 120})"><circle cx="70" cy="40" r="30" fill="#FBE3DE"/>${txt(58, 50, '↗', 28, '#C0392B', 800)}
        ${txt(120, 36, s, 26, '#1B1B1F', 600)}${txt(120, 70, `Spa · ${28 - i}/5`, 20, '#8A8A92', 400)}${txt(w - 40, 50, '−' + ((i * 7 % 5) + 2) * 450 + '.000đ', 26, '#C0392B', 800, 'text-anchor="end"')}</g>`).join('')}</g>`, { glowCol: '#DDE8F5', glowA: .25 }));
}, () => ({ tint: '#2A3A5A', tintA: .16, vig: .85, grain: .12 }));

shot('20-phong-bi', 4.2, (t, p) => {
  setCam(0, 0, 1.35 - .35 * eio(p), -3 * p);
  const r = rng(33); let mess = '';
  for (let i = 0; i < 26; i++) { const x = r() * 1080, y = 200 + r() * 1600, a = r() * 60 - 30, w = 120 + r() * 120; mess += `<g transform="translate(${x},${y}) rotate(${a})"><rect x="${-w / 2}" y="-160" width="${w}" height="320" fill="#F4F0E8"/>${Array.from({ length: 6 }, (_, k) => `<rect x="${-w / 2 + 14}" y="${-130 + k * 42}" width="${w * .6}" height="7" fill="#B2AA9F"/>`).join('')}</g>`; }
  for (let i = 0; i < 9; i++) { const x = r() * 1000 + 40, y = 250 + r() * 1500; mess += `<g transform="translate(${x},${y}) rotate(${r() * 360})">${bottle(0, 0, .8, ['#E7C9BE', '#DDE6D6', '#F2E3D0', '#C9A45C'][i % 4], '#2B2420', '#fff', i % 3)}</g>`; }
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#3A2E26'], [1, '#231B16']])}"/>` + L(.5, glow(540, 900, 800, '#F4E0C2', .35) + mess)
    + L(.6, `<g transform="translate(540,960) rotate(-6)"><rect x="-230" y="-140" width="460" height="280" rx="10" fill="#EFE2C8"/><path d="M-230,-140 L0,20 L230,-140" stroke="#C9B894" stroke-width="5" fill="none"/>
      ${txt(0, 90, 'Tiền chăm da', 40, '#6A4A2A', 700, 'text-anchor="middle" font-style="italic"')}</g>`);
}, () => ({ tint: '#3A4A5A', tintA: .15, vig: .8, grain: .12 }));

shot('21-tot-nghiep-lui-ra', 3.5, (t, p) => {
  setCam(lerp(0, -120, eio(p)), 0, 1.04);
  const back = eio(seq(t, .3, 3.2));
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#BFD6E6'], [.5, '#E8EEF0'], [1, '#C8CDB8']])}"/>`
    + L(.2, `<g${blur(14)}><rect x="0" y="300" width="1080" height="700" fill="#E9E1D2"/>${[120, 360, 600, 840].map(x => `<rect x="${x}" y="300" width="70" height="700" fill="#D6CCBA"/>`).join('')}${[0, 280, 560, 860].map(x => `<circle cx="${x}" cy="360" r="200" fill="#8FA884"/>`).join('')}</g><rect x="0" y="1000" width="1080" height="920" fill="#C3C8AE"/>`)
    + L(.5, [[520, '#1E2A3A', -8], [700, '#1E2A3A', 0], [880, '#1E2A3A', 6], [1040, '#1E2A3A', -4]].map(([x, c, lean], i) => figure(x, 1560, .95, { gown: c, cap: true, lean, armL: i === 1 ? -120 : 0, armR: i === 2 ? -120 : 0 })).join(''), 3)
    + L(1.3, figure(lerp(330, 60, back), 1950, 1.45, { gown: '#1E2A3A', cap: false, mask: true }), 18);
}, () => ({ tint: '#7A8896', tintA: .35, vig: .6, grain: .1, lift: .03 }));

shot('22-khung-ngam', 2.9, (t, p) => {
  setCam(0, 0, 1.02);
  const shut = seq(t, 1.6, 1.75), flash = t > 1.6 ? clamp(1 - (t - 1.6) / .5) : 0, frozen = t > 1.6;
  const hud = `<g stroke="#fff" stroke-width="5" fill="none" opacity=".85"><path d="M90,260 v-70 h70"/><path d="M990,260 v-70 h-70"/><path d="M90,1660 v70 h70"/><path d="M990,1660 v70 h-70"/>
    <rect x="${frozen ? 470 : 460 + Math.sin(t * 5) * 20}" y="820" width="140" height="140"/></g>
    ${txt(100, 1800, '1/125   F2.8   ISO 200', 32, '#fff', 600, 'opacity=".85"')}<circle cx="930" cy="1790" r="14" fill="#FF3B30" opacity="${Math.floor(t * 2) % 2}"/>`;
  return `<rect width="${W}" height="${H}" fill="${lg([[0, '#BFD6E6'], [.5, '#E8EEF0'], [1, '#C8CDB8']])}"/>`
    + L(.4, `<g${blur(12)}><rect x="0" y="260" width="1080" height="700" fill="#E9E1D2"/>${[0, 280, 560, 860].map(x => `<circle cx="${x}" cy="330" r="200" fill="#8FA884"/>`).join('')}</g><rect x="0" y="1000" width="1080" height="920" fill="#C3C8AE"/>`)
    + L(.6, [[170, 0], [360, 0], [720, 0], [910, 0]].map(([x], i) => figure(x, 1560, .92, { gown: '#1E2A3A', cap: true, armL: i === 1 ? -30 : 0, armR: i === 2 ? -30 : 0 })).join('')
      + `<rect x="470" y="820" width="140" height="700" fill="none" stroke="#fff" stroke-opacity="${frozen ? .0 : .15}" stroke-width="3" stroke-dasharray="10 10"/>`)
    + hud + `<rect width="${W}" height="${H}" fill="#000" opacity="${shut > 0 && shut < 1 ? .9 : 0}"/><rect width="${W}" height="${H}" fill="#fff" opacity="${flash * .85}"/>`;
}, () => ({ tint: '#7A8896', tintA: .3, vig: .55, grain: .1 }));

shot('23-dem-mua', 3.5, (t, p) => {
  setCam(0, 20 * p, 1.02 + .08 * eio(p));
  const ph = t > 1.2 && t < 2.4 ? 1 : .35;
  return L(.3, nightBedroom(t)) + L(.6, curledGirl(t, 2.2))
    + L(.7, glow(790, 1480, 300, '#DDEBFF', .5 * ph) + `<g transform="translate(790,1480) rotate(-12)"><rect x="-70" y="-26" width="140" height="52" rx="10" fill="#EAF2FF" opacity="${.4 + .6 * ph}"/><rect x="-58" y="-14" width="80" height="6" rx="3" fill="#9FB3D6"/><rect x="-58" y="0" width="110" height="6" rx="3" fill="#9FB3D6"/></g>`);
}, () => ({ tint: '#2A3A78', tintA: .15, vig: .8, grain: .12 }));
