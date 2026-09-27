// Kịch bản chuyển động cho video — dùng lại bộ vẽ trong scenes.js.
// lines: từng câu lời đọc; *chữ* là từ nhấn. Thời lượng cảnh tự tính theo số âm tiết.
// Mốc thời gian: số giây, 'L2' (lúc bắt đầu câu 2), 'L2+0.4', 'E-0.6' (0.6s trước khi hết cảnh).

// Phần tử HTML có chuyển động.
function H(cls, type, t0, style, inner, o = {}) {
  return `<div${A(type, t0, o).replace(' class="a"', ` class="a ${cls}"`)} style="${style}">${inner}</div>`;
}

// Đường vẽ dần (kể cả nét đứt) bằng mặt nạ.
let maskId = 0;
function drawPath(d, attrs, t0, dur) {
  const id = 'mk' + (++maskId);
  return `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920">
    <path d="${d}" stroke="#fff" stroke-width="70" fill="none" stroke-linecap="round"${A('draw', t0, { d: dur })}/></mask>
    <path d="${d}" ${attrs} mask="url(#${id})"/>`;
}

const VIDEO = [
  { // 01
    bg: SCENES[0].bg, sub: 'top big', lines: ['Bạn ấy chỉ muốn *hết mụn* trước ngày tốt nghiệp.'],
    cam: [1, 1.12, 540, 1000], tail: .9,
    svg: () => `<circle cx="540" cy="1000" r="430" fill="${C.sageLight}"${A('pop', 0, { d: .9 })}/>
      <g${A('up', .1, { d: .7 })}>${person({ x: 540, y: 1020, s: 1.55, cap: true, acne: 3, acneT0: 'L1+1.2', expr: 'smile' })}</g>
      <g${A('pop', .5)}><g stroke="${C.ink}" stroke-width="10" fill="none" stroke-linecap="round">
        <path d="M230,720 v-70 h70"/><path d="M850,720 v-70 h-70"/><path d="M230,1330 v70 h70"/><path d="M850,1330 v70 h-70"/></g></g>
      <g${A('fade', .5, { loop: 'blink' })}><circle cx="262" cy="610" r="12" fill="${C.coral}"/></g>
      <text x="286" y="620" font-size="30" font-family="Be Vietnam Pro" font-weight="700" fill="${C.ink}"${A('fade', .5)}>REC</text>
      <rect width="1080" height="1920" fill="#fff"${A('flash', 'E-0.7')}/>`,
    html: () => '',
  },
  { // 02
    bg: SCENES[1].bg, sub: 'bottom big dark', lines: ['Không ngờ thứ mất đi sau đó…', 'lại *không chỉ là tiền*.'],
    cam: [1.06, 1, 540, 930],
    svg: () => `${[[170, 44, -20, .9, 0], [900, 36, 25, .8, 700], [140, 30, 10, .6, 1300], [930, 48, -15, .9, 1600], [820, 26, 5, .5, 400], [260, 40, 30, .7, 1000], [620, 34, 12, .6, 1900]]
        .map(([x, r, rot, op, ph], i) => `<g${A('fall', 0, { v: 240 + i * 25, ph })}>${coin(x, -150, r, rot, op)}</g>`).join('')}
      <defs><clipPath id="m2"><ellipse cx="540" cy="930" rx="270" ry="370"/></clipPath></defs>
      <g${A('fade', 0, { d: .8 })}><ellipse cx="540" cy="930" rx="300" ry="400" fill="${C.gold}"/>
      <ellipse cx="540" cy="930" rx="270" ry="370" fill="#4A4655"/>
      <g clip-path="url(#m2)" opacity=".85">${person({ x: 540, y: 900, s: 1.15, expr: 'sad', acne: 8, red: true, tear: true })}</g></g>
      ${[['M600,580 L560,760 L640,870 L580,1040 L660,1200', 0], ['M560,760 L420,820 L360,760', .3], ['M640,870 L760,900', .45], ['M580,1040 L450,1120', .6]]
        .map(([d, dt]) => drawPath(d, 'stroke="#fff" stroke-opacity=".85" stroke-width="5" fill="none"', `L2+${dt}`, .35)).join('')}`,
    html: () => '',
  },
  { // 03
    bg: SCENES[2].bg,
    lines: ['Có một cô bé từng tìm đến Thoa chỉ vì *một chuyện rất nhỏ*:', 'cô bé sắp *chụp ảnh tốt nghiệp*.', 'Da có *mấy nốt mụn*.',
      'Cô bé muốn đẹp hơn một chút trong ngày quan trọng nhất của tuổi sinh viên.'],
    cam: [1, 1.07, 470, 1000],
    svg: () => `<g${A('up', 0, { d: .8 })}>${person({ x: 470, y: 980, s: 1.45, expr: 'neutral', acne: 4, acneT0: 'L3', handCheek: true, shirt: '#E9D6C4' })}</g>
      <g${A('pop', 'L3+0.5', { loop: 'pulse' })}><g stroke="${C.coral}" stroke-width="5" fill="none" stroke-dasharray="10 9">
        <circle cx="${470 - 60 * 1.45}" cy="${980 + 22 * 1.45}" r="34"/><circle cx="${470 + 58 * 1.45}" cy="${980 + 30 * 1.45}" r="34"/></g></g>`,
    html: () => H('cal', 'drop', 'L2', 'transform:none', `<div class="m">THÁNG 6</div><div class="d"><span>15</span></div><div class="l">Chụp ảnh tốt nghiệp</div>`, { rot: 3 }),
  },
  { // 04
    bg: SCENES[3].bg,
    lines: ['Rồi cô bé bắt đầu nghe người ta tư vấn.', '*Một liệu trình.*', 'Rồi thêm *một sản phẩm*.', 'Rồi thêm *một lần chăm sóc* nữa.', 'Mỗi thứ nghe qua *đều có lý*.'],
    cam: [1, 1.05, 540, 1100],
    svg: () => `<g${A('pop', 'L3')}>${bottle(860, 1090, 1, C.blush)}</g><g${A('pop', 'L3+0.15')}>${bottle(960, 1120, .8, C.sage)}</g><g${A('pop', 'L3+0.3')}>${bottle(170, 1130, .9, C.gold)}</g>
      <g${A('up', 0, { d: .8 })}>${person({ x: 540, y: 1130, s: 1.05, expr: 'worried', acne: 4 })}</g>`,
    html: () => H('bub r', 'pop', 'L2', 'top:190px;left:250px', '+ Một liệu trình')
      + H('bub r', 'pop', 'L3', 'top:360px;left:120px', '+ Thêm một sản phẩm')
      + H('bub r', 'pop', 'L4', 'top:530px;left:210px', '+ Thêm một lần chăm sóc nữa')
      + H('price', 'pop', 'L3+0.4', 'top:250px;right:70px;transform:none', '₫₫', { rot: -12, loop: 'float' })
      + H('price', 'pop', 'L4+0.4', 'top:680px;left:70px;transform:none', '₫₫₫', { rot: 10, loop: 'float' }),
  },
  { // 05
    bg: SCENES[4].bg, sub: 'bottom dark', lines: ['Cho đến một ngày…', 'cô bé *không còn dám soi gương*.'],
    cam: [1, 1.06, 540, 900],
    svg: () => `<g${A('fade', 0, { d: .8 })}><ellipse cx="270" cy="760" rx="170" ry="240" fill="${C.gold}" opacity=".9"/>
      <ellipse cx="270" cy="760" rx="146" ry="214" fill="#5D5868"/>
      <path d="M170,640 L240,560 M200,760 L330,610 M230,880 L360,730" stroke="#fff" stroke-opacity=".25" stroke-width="10" stroke-linecap="round"/></g>
      <g${A('slide', .2, { d: 1.4, dx: 260 })}>${person({ x: 690, y: 1040, s: 1.35, back: true, shirt: '#8E8499' })}</g>
      <rect width="1080" height="1920" fill="#000"${A('dim', 'L2', { d: 1.6, max: .35 })}/>`,
    html: () => '',
  },
  { // 06 — không lời đọc
    bg: SCENES[5].bg, lines: [], dur: 4.4,
    cam: [1, 1.06, 540, 800],
    svg: () => `<g${A('up', 0, { d: .7 })}><rect x="210" y="330" width="660" height="1180" rx="80" fill="#151419"/>
      <rect x="236" y="356" width="608" height="1128" rx="60" fill="${C.paper}"/>
      <rect x="236" y="356" width="608" height="150" rx="60" fill="#EFE6DA"/><rect x="236" y="440" width="608" height="66" fill="#EFE6DA"/>
      <circle cx="320" cy="440" r="36" fill="${C.sage}"/><text x="376" y="452" font-size="34" font-family="Be Vietnam Pro" font-weight="700" fill="${C.ink}">Chị tư vấn</text>
      <rect x="270" y="1380" width="540" height="72" rx="36" fill="#EFE6DA"/></g>
      <text x="306" y="1428" font-size="30" font-family="Be Vietnam Pro" fill="${C.muted}"${A('fade', 2.6, { d: .3 })}>Chị ơi em…</text>
      <rect x="468" y="1398" width="4" height="38" fill="${C.coral}"${A('fade', 2.6, { loop: 'blink' })}/>`,
    html: () => H('msg out', 'pop', .7, 'top:600px', 'Chị ơi, da em dạo này…', { t1: 1.9 })
      + H('msg rec', 'pop', 2.1, 'top:600px', '⊘ Tin nhắn đã thu hồi'),
  },
  { // 07
    bg: SCENES[6].bg,
    lines: ['*Mụn nhiều hơn.*', '*Da đỏ hơn.*', 'Và số tiền bỏ ra thì đã *nhiều hơn rất nhiều*', 'so với số tiền ban đầu cô bé định dành cho việc chăm da.'],
    cam: [1, 1.08, 540, 820],
    svg: () => `${person({ x: 540, y: 820, s: 1.75, expr: 'sad', acne: 16, acneT0: 'L1', red: true, redT0: 'L2', shirt: '#E4CFC1' })}`,
    html: () => H('cmp', 'up', 'L3', 'top:150px;bottom:auto', `<div class="row"><span>Định chi</span><i class="a" data-type="grow" data-t0="L3+0.3" data-d=".6" style="width:22%"></i></div>
      <div class="row" style="margin:0"><span>Đã chi</span><i class="a over" data-type="grow" data-t0="L3+0.6" data-d="2.4" style="width:100%"></i></div>`),
  },
  { // 08
    bg: SCENES[7].bg, sub: 'bottom dark',
    lines: ['Điều đau nhất *không phải là mất tiền*.', 'Mà là lúc ấy cô bé vẫn không biết:', { t: '“Rốt cuộc da mình đang bị gì?”', big: 1 }],
    cam: [1, 1.1, 540, 1000], tail: 1.2,
    svg: () => `${[[170, 560, 180, -15, C.coral], [860, 640, 220, 12, C.blush], [230, 1220, 130, 10, C.gold], [880, 1180, 150, -8, C.coral], [540, 480, 110, 0, '#8E8499'], [120, 900, 90, -20, '#8E8499'], [960, 930, 100, 18, C.gold]]
        .map(([x, y, sz, r, col], i) => `<g${A('pop', `L2+${(i * .28).toFixed(2)}`, { loop: 'float' })}><text x="${x}" y="${y}" font-size="${sz}" font-family="Lora" font-weight="700" text-anchor="middle" fill="${col}" transform="rotate(${r} ${x} ${y})" opacity=".85">?</text></g>`).join('')}
      <g${A('up', 0, { d: .8 })}>${person({ x: 540, y: 1000, s: 1.05, expr: 'worried', acne: 10, red: true, shirt: '#8E8499' })}</g>`,
    html: () => '',
  },
  { // 09
    bg: SCENES[8].bg, talk: true,
    lines: ['Mười năm làm nghề,', 'Thoa đã nghe và chứng kiến *quá nhiều câu chuyện* như vậy.'],
    cam: [1.05, 1, 540, 1000], tail: 1,
    svg: () => `<circle cx="540" cy="1000" r="400" fill="#fff" opacity=".55"${A('pop', 0, { d: .8 })}/>
      <g${A('up', .1, { d: .8 })}>${person({ x: 540, y: 980, s: 1.4, hair: 'bun', shirt: C.forest, collar: C.sage, tag: 'Thoa', expr: 'smile', talk: true })}</g>`,
    html: () => H('note', 'pop', 'L2+0.2', 'top:230px;left:60px;transform:none', '“Da em càng làm càng đỏ…”', { rot: -4, loop: 'float' })
      + H('note', 'pop', 'L2+0.8', 'top:380px;right:60px;transform:none', '“Em lỡ mua cả combo rồi…”', { rot: 3, loop: 'float' })
      + H('note', 'pop', 'L2+1.4', 'top:540px;left:110px;transform:none', '“Em không biết da mình bị gì…”', { rot: 2, loop: 'float' })
      + H('badge', 'pop', 'L1+0.3', 'top:760px;right:90px', '<b>10</b>năm<br>làm nghề', { loop: 'float' }),
  },
  { // 10
    bg: SCENES[9].bg, talk: true,
    lines: ['Và Thoa bắt đầu nghĩ:', 'có phải người ta *thiếu tiền* đâu.', 'Người ta thiếu *một người nói thật* với họ ngay từ đầu.',
      'Nói rằng cái này *chưa cần làm*.', 'Cái kia *chưa cần mua*.', 'Và có những lúc…', 'điều tốt nhất cho làn da là *đừng làm thêm gì nữa*.'],
    cam: [1, 1.06, 470, 1050],
    svg: () => `<g${A('up', 0, { d: .8 })}>${person({ x: 470, y: 1060, s: 1.35, hair: 'bun', shirt: C.forest, collar: C.sage, tag: 'Thoa', expr: 'smile', talk: true, raise: 1, raiseT0: 'L4' })}</g>`,
    html: () => H('bub l', 'pop', 'L4', 'top:190px;left:90px', 'Cái này <b>chưa cần làm</b>.')
      + H('bub l', 'pop', 'L5', 'top:350px;left:170px', 'Cái kia <b>chưa cần mua</b>.')
      + H('bub l big', 'pop', 'L7', 'top:520px;left:90px', 'Có lúc, tốt nhất cho da là<br><b>đừng làm thêm gì nữa</b>.'),
  },
  { // 11
    bg: SCENES[10].bg, sub: 'mid', lines: ['Đó là lý do Thoa rời Sài Gòn,', 'về *Làng Đại học*.'],
    cam: [1, 1.04, 540, 1200], tail: 1,
    svg: () => `<g${A('up', 0, { d: .8 })}><g fill="#B9AEA3">
        <rect x="80" y="330" width="90" height="330"/><rect x="180" y="250" width="70" height="410"/><rect x="262" y="140" width="64" height="520"/><polygon points="262,140 294,70 326,140"/>
        <rect x="338" y="300" width="100" height="360"/><rect x="450" y="380" width="80" height="280"/></g>
      <g fill="#fff" opacity=".6">${Array.from({ length: 18 }, (_, i) => `<rect x="${95 + (i % 6) * 72}" y="${400 + Math.floor(i / 6) * 70}" width="18" height="28"/>`).join('')}</g>
      <rect x="60" y="660" width="500" height="10" rx="5" fill="#A89C90"/>
      <text x="80" y="730" font-size="40" font-family="Be Vietnam Pro" font-weight="800" fill="${C.muted}">Sài Gòn</text></g>
      ${drawPath('M320,760 C340,980 780,920 740,1140 C710,1300 560,1320 600,1440', `stroke="${C.coral}" stroke-width="10" stroke-dasharray="4 24" stroke-linecap="round" fill="none"`, .4, 2.8)}
      <g transform="translate(0,120)"><g${A('up', 'L2', { d: .7 })}>
        <rect x="560" y="1320" width="420" height="200" rx="12" fill="${C.paper}"/><polygon points="540,1330 770,1220 1000,1330" fill="${C.forest}"/>
        ${[0, 1, 2, 3, 4].map(i => `<rect x="${600 + i * 76}" y="1370" width="36" height="110" rx="6" fill="${C.sage}"/>`).join('')}</g>
        <g${A('pop', 'L2+0.3')}>${tree(530, 1540, 1)}</g><g${A('pop', 'L2+0.45')}>${tree(1010, 1540, .9)}</g><g${A('pop', 'L2+0.6')}>${tree(470, 1560, .7)}</g></g>
      <g${A('drop', 'L2+0.5')}><g transform="translate(870,1250)"><path d="M0,0 C-60,-70 -60,-130 0,-130 C60,-130 60,-70 0,0z" fill="${C.coral}"/><circle cx="0" cy="-88" r="20" fill="#fff"/></g></g>
      <text x="1000" y="1720" font-size="44" font-family="Be Vietnam Pro" font-weight="800" text-anchor="end" fill="${C.forest}"${A('fade', 'L2+0.6')}>Làng Đại học</text>
      <g${A('move', .4, { d: 2.8, dx: -240, dy: -220 })}>${person({ x: 560, y: 960, s: .55, hair: 'bun', shirt: C.forest, collar: C.sage, expr: 'smile', suitcase: true })}</g>`,
    html: () => '',
  },
  { // 12
    bg: SCENES[11].bg,
    lines: ['Ở đây có *rất nhiều bạn trẻ*.', 'Tuổi còn rất dài.', 'Nhưng *tiền thì thường rất ngắn*.', 'Trong khi quảng cáo ngoài kia…',
      'lại luôn có cách khiến người ta cảm thấy *mình đang thiếu một thứ gì đó*.'],
    cam: [1, 1.05, 540, 1150],
    svg: () => `<g${A('up', .2, { d: .7 })}>${person({ x: 250, y: 1180, s: .85, hair: 'short', shirt: '#9DB5C9', expr: 'worried' })}</g>
      <g${A('up', .45, { d: .7 })}>${person({ x: 830, y: 1180, s: .85, hair: 'long', shirt: C.blush, expr: 'neutral', hairColor: '#5A3A2A' })}</g>
      <g${A('up', 0, { d: .7 })}>${person({ x: 540, y: 1100, s: 1, hair: 'long', shirt: '#E9D6C4', expr: 'worried', acne: 3 })}</g>`,
    html: () => H('ad', 'pop', 'L4', 'top:170px;left:60px', 'SALE 50%<small>Chỉ hôm nay!</small>', { rot: -5, loop: 'shake' })
      + H('ad y', 'pop', 'L4+0.5', 'top:200px;right:60px', 'Combo trị mụn<small>cấp tốc 7 ngày</small>', { rot: 4, loop: 'shake' })
      + H('ad g', 'pop', 'L5', 'top:470px;left:120px', 'Da bạn đang thiếu<small>thứ này?</small>', { rot: 3, loop: 'shake' })
      + H('ad', 'pop', 'L5+0.6', 'top:520px;right:80px', 'HOT TREND<small>ai cũng dùng</small>', { rot: -3, loop: 'shake' }),
  },
  { // 13
    bg: SCENES[12].bg,
    lines: ['Vì vậy Thoa bắt đầu hành trình xây kênh *Spa Nhà Thor*', 'với một mong muốn rất đơn giản:', 'Trước khi bạn bỏ tiền cho làn da, *hãy hiểu nó trước*.',
      'Thoa *không bán phép màu*.', 'Thoa muốn chia sẻ những điều mà đáng lẽ bạn nên biết trước khi bỏ tiền,', 'trước khi thử một thứ gì đó lên da,', 'và trước khi *quá muộn để quay lại*.'],
    cam: [1, 1.06, 540, 1040],
    svg: () => `<g${A('up', 0, { d: .8 })}>${person({ x: 540, y: 1040, s: 1.35, expr: 'neutral', acne: 2, shirt: '#E9D6C4' })}</g>
      <g${A('pop', 'L3', { loop: 'sway', amp: 70 })}><g transform="translate(640,1060)"><circle r="130" fill="#fff" opacity=".35" stroke="${C.forest}" stroke-width="22"/>
        <path d="M92,92 L230,230" stroke="${C.forest}" stroke-width="40" stroke-linecap="round"/></g></g>
      <g${A('pop', 'L4')}><g transform="translate(190,1300) rotate(-30)"><rect x="-12" y="-110" width="24" height="220" rx="12" fill="${C.ink}"/><polygon points="0,-170 16,-130 58,-130 24,-106 38,-66 0,-90 -38,-66 -24,-106 -58,-130 -16,-130" fill="${C.gold}"/></g></g>
      ${drawPath('M90,1150 L300,1440', `stroke="${C.coral}" stroke-width="16" stroke-linecap="round"`, 'L4+0.5', .35)}`,
    html: () => H('quote light', 'up', 'L3', '', '“Trước khi bạn bỏ tiền<br>cho làn da,<br><b>hãy hiểu nó trước</b>.”'),
  },
  { // 14
    bg: SCENES[13].bg,
    lines: ['Để một ngày nào đó…', 'khi bước vào một spa,', 'bạn không còn ngồi đó chờ người khác *quyết định thay mình*.', 'Bạn biết làn da của mình *cần gì*.',
      'Và bạn có quyền nói:', { t: 'Không, cái này tôi chưa cần.', nosub: 1 }],
    cam: [1, 1.05, 620, 1000], tail: 1.2,
    svg: () => `<rect x="0" y="1480" width="1080" height="440" fill="#BFD0B8"/>
      <rect x="380" y="820" width="560" height="800" rx="120" fill="#F2E7DA"${A('fade', 0, { d: .6 })}/>
      <g${A('up', .2, { d: .8 })}>${person({ x: 660, y: 1000, s: 1.2, expr: 'confident', acne: 0, shirt: C.paper, raise: -1, raiseT0: 'L6' })}</g>
      <g${A('slide', 'L2', { d: 1, dx: -520 })}><g transform="translate(0,1180)"><path d="M-40,0 L200,-20" stroke="${C.forest}" stroke-width="80" stroke-linecap="round"/>
        <circle cx="230" cy="-22" r="46" fill="${C.skin}"/>${bottle(250, -40, .9, C.blush)}</g></g>
      ${tree(990, 760, .8)}`,
    html: () => H('bub r big', 'pop', 'L6', 'top:250px;left:260px', 'Không, cái này<br><b>tôi chưa cần</b>.'),
  },
  { // 15
    bg: SCENES[14].bg, sub: 'bottom dark', talk: true, tail: 3,
    lines: ['Nếu bạn đang loay hoay với làn da của mình…', 'thì ở lại đây với kênh *Spa Nhà Thor*.', 'Thoa sẽ cùng bạn bắt đầu từ *những điều căn bản nhất*.'],
    cam: [1.04, 1, 540, 1100],
    svg: () => `<g${A('up', 0, { d: .8 })}>${person({ x: 540, y: 1100, s: 1.25, hair: 'bun', shirt: '#F2E7DA', collar: C.sage, tag: 'Thoa', expr: 'smile', talk: true, raise: 1, raiseT0: .6, wave: true })}</g>`,
    html: () => H('logo', 'pop', 'L2', '', `<svg viewBox="0 0 100 100" width="120" height="120"><path d="M50,8 C85,25 85,70 50,92 C15,70 15,25 50,8z" fill="${C.sage}"/><path d="M50,20 L50,86" stroke="${C.paper}" stroke-width="4"/></svg>
      <div><div class="n">Spa Nhà Thor</div><div class="k">Hiểu da trước khi bỏ tiền</div></div>`)
      + H('follow', 'pop', 'L2+0.6', 'left:0;right:0;margin:auto;width:max-content;transform:none', '+ Theo dõi', { loop: 'pulse' }),
  },
];
