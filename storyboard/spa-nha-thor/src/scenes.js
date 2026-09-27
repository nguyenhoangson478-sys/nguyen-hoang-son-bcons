// Storyboard "Spa Nhà Thor" — 15 khung dọc 9:16 (1080x1920), vẽ bằng SVG + HTML.
const C = {
  cream: '#F7F0E6', paper: '#FFFAF3', ink: '#2B2420', muted: '#7A6E66',
  sage: '#8DA68A', sageLight: '#DDE6D6', forest: '#2F4A3F', blush: '#EDB9A6',
  coral: '#D9735A', gold: '#C9A45C', night: '#24222B', night2: '#3A3644',
  skin: '#F4CDB0', skinShade: '#E2AE8E', hair: '#3A2A24', acne: '#D35E4A',
};

const ACNE = [[-60, 22], [58, 30], [-38, 58], [72, -2], [-78, -8], [34, 62], [-22, -58], [22, -52],
  [-88, 36], [84, 44], [2, 78], [-52, -34], [50, -38], [62, 72], [-66, 74], [12, 30]];

function eyes(expr) {
  const s = `stroke="${C.ink}" stroke-width="7" fill="none" stroke-linecap="round"`;
  if (expr === 'smile') return `<path d="M-64,4 q17,-18 34,0" ${s}/><path d="M30,4 q17,-18 34,0" ${s}/>`;
  const dots = `<ellipse cx="-46" cy="4" rx="10" ry="13" fill="${C.ink}"/><ellipse cx="46" cy="4" rx="10" ry="13" fill="${C.ink}"/>`;
  if (expr === 'sad' || expr === 'worried')
    return dots + `<path d="M-70,-26 L-28,-40" ${s}/><path d="M28,-40 L70,-26" ${s}/>`;
  if (expr === 'confident')
    return dots + `<path d="M-68,-34 L-26,-36" ${s}/><path d="M26,-36 L68,-34" ${s}/>`;
  return dots;
}

function mouth(expr) {
  const s = `stroke="${C.ink}" stroke-width="7" fill="none" stroke-linecap="round"`;
  if (expr === 'smile') return `<path d="M-28,52 q28,26 56,0" ${s}/>`;
  if (expr === 'confident') return `<path d="M-22,56 q22,16 44,0" ${s}/>`;
  if (expr === 'sad') return `<path d="M-22,70 q22,-18 44,0" ${s}/>`;
  if (expr === 'worried') return `<path d="M-20,64 q10,-8 20,0 q10,8 20,0" ${s}/>`;
  if (expr === 'talk') return `<path d="M-20,52 q20,30 40,0 z" fill="${C.ink}"/>`;
  return `<path d="M-18,62 L18,62" ${s}/>`;
}

// Hand with open palm facing viewer, bottom-center at (0,0)
function palm(fill) {
  return `<g>
    <rect x="-40" y="-90" width="80" height="90" rx="30" fill="${fill}"/>
    ${[-30, -10, 10, 30].map((fx, i) => `<rect x="${fx - 9}" y="${-150 + Math.abs(i - 1.5) * 8}" width="18" height="75" rx="9" fill="${fill}"/>`).join('')}
    <rect x="-78" y="-82" width="18" height="60" rx="9" fill="${fill}" transform="rotate(-35 -60 -40)"/>
  </g>`;
}

// Bust character. Head center at (x,y), scale s.
function person(o = {}) {
  const { x = 0, y = 0, s = 1, expr = 'smile', acne = 0, red = false, cap = false, hair = 'long',
    shirt = '#F2E3D0', collar = null, back = false, handCheek = false, raise = 0, tear = false,
    tag = null, hairColor = C.hair, blush = true, suitcase = false } = o;
  const H = hairColor;
  let backHair = '';
  if (hair === 'long') backHair = `<path d="M-150,-20 C-172,-175 172,-175 150,-20 L168,250 C80,285 -80,285 -168,250 Z" fill="${H}"/>`;
  if (hair === 'bun') backHair = `<circle cx="0" cy="-150" r="62" fill="${H}"/><path d="M-138,-10 C-150,-170 150,-170 138,-10 L140,90 L-140,90 Z" fill="${H}"/>`;
  if (hair === 'short') backHair = `<path d="M-142,-10 C-160,-180 160,-180 142,-10 L140,80 L-140,80 Z" fill="${H}"/>`;

  const body = `<path d="M-235,800 L-228,370 Q-218,232 -70,204 L70,204 Q218,232 228,370 L235,800 Z" fill="${shirt}"/>
    ${collar ? `<path d="M-60,205 L0,250 L60,205" stroke="${collar}" stroke-width="16" fill="none" stroke-linejoin="round"/>` :
      `<path d="M-48,206 L0,262 L48,206" stroke="${C.skinShade}" stroke-width="0" fill="${C.skinShade}"/>`}
    ${tag ? `<rect x="70" y="260" width="100" height="40" rx="8" fill="${C.paper}"/><text x="120" y="288" font-size="24" font-family="Be Vietnam Pro" font-weight="700" text-anchor="middle" fill="${C.forest}">${tag}</text>` : ''}`;
  const neck = `<rect x="-38" y="100" width="76" height="110" rx="20" fill="${C.skinShade}"/>`;

  let face;
  if (back) {
    face = `<ellipse cx="0" cy="0" rx="124" ry="138" fill="${H}"/>`;
  } else {
    let spots = '';
    for (let i = 0; i < acne; i++) {
      const [ax, ay] = ACNE[i];
      spots += `<circle cx="${ax}" cy="${ay}" r="8" fill="${C.acne}" opacity=".9"/><circle cx="${ax - 2}" cy="${ay - 3}" r="2.4" fill="#fff" opacity=".6"/>`;
    }
    face = `<ellipse cx="-122" cy="10" rx="18" ry="26" fill="${C.skin}"/><ellipse cx="122" cy="10" rx="18" ry="26" fill="${C.skin}"/>
      <ellipse cx="0" cy="0" rx="122" ry="136" fill="${C.skin}"/>
      ${red ? `<ellipse cx="-62" cy="40" rx="52" ry="40" fill="#E5604E" opacity=".35"/><ellipse cx="62" cy="40" rx="52" ry="40" fill="#E5604E" opacity=".35"/><ellipse cx="0" cy="-40" rx="60" ry="26" fill="#E5604E" opacity=".2"/>` : ''}
      ${blush && !red ? `<ellipse cx="-70" cy="40" rx="24" ry="14" fill="${C.blush}" opacity=".8"/><ellipse cx="70" cy="40" rx="24" ry="14" fill="${C.blush}" opacity=".8"/>` : ''}
      ${spots}${eyes(expr)}${mouth(expr)}
      ${tear ? `<path d="M52,24 q-10,22 0,30 q10,-8 0,-30z" fill="#9CC3DA"/>` : ''}
      ${hair === 'short' ? `<path d="M-128,-20 C-140,-160 140,-160 128,-20 C100,-80 40,-100 0,-90 C-50,-100 -100,-80 -128,-20 Z" fill="${H}"/>`
        : `<path d="M-126,-26 C-132,-158 132,-158 126,-26 C92,-92 24,-100 -8,-72 C-40,-102 -100,-84 -126,-26 Z" fill="${H}"/>`}`;
  }

  const capSvg = cap ? `<rect x="-96" y="-162" width="192" height="52" rx="12" fill="#23392F"/>
    <polygon points="-190,-170 0,-228 190,-170 0,-112" fill="${C.forest}"/>
    <circle cx="0" cy="-170" r="9" fill="${C.gold}"/>
    <path d="M0,-170 L150,-158 L150,-78" stroke="${C.gold}" stroke-width="6" fill="none"/>
    <rect x="140" y="-84" width="20" height="36" rx="6" fill="${C.gold}"/>` : '';

  const cheekHand = handCheek ? `<g transform="translate(-118,150) rotate(12)"><path d="M0,0 L-30,160" stroke="${shirt}" stroke-width="70" stroke-linecap="round"/>${palm(C.skin)}</g>` : '';
  const raised = raise ? `<g transform="translate(${raise * 250},120)"><path d="M0,40 L${raise * -40},260" stroke="${shirt}" stroke-width="80" stroke-linecap="round"/>${palm(C.skin)}</g>` : '';
  const bag = suitcase ? `<g transform="translate(230,430)"><rect x="-70" y="-120" width="140" height="170" rx="18" fill="${C.coral}"/><rect x="-30" y="-150" width="60" height="36" rx="10" fill="none" stroke="${C.ink}" stroke-width="10"/><line x1="-70" y1="-50" x2="70" y2="-50" stroke="#fff" stroke-opacity=".4" stroke-width="8"/></g>` : '';

  return `<g transform="translate(${x},${y}) scale(${s})">${backHair}${neck}${body}${bag}${face}${capSvg}${cheekHand}${raised}</g>`;
}

const coin = (x, y, r, rot = 0, op = 1) => `<g transform="translate(${x},${y}) rotate(${rot})" opacity="${op}">
  <ellipse cx="0" cy="0" rx="${r}" ry="${r * .82}" fill="${C.gold}"/><ellipse cx="0" cy="0" rx="${r * .74}" ry="${r * .6}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="4"/>
  <text x="0" y="${r * .3}" font-size="${r * .9}" font-family="Be Vietnam Pro" font-weight="800" text-anchor="middle" fill="#8A6A2C">đ</text></g>`;

const bottle = (x, y, s, col) => `<g transform="translate(${x},${y}) scale(${s})">
  <rect x="-40" y="-150" width="80" height="150" rx="22" fill="${col}"/><rect x="-18" y="-190" width="36" height="46" rx="8" fill="${C.ink}"/>
  <rect x="-28" y="-110" width="56" height="50" rx="8" fill="#fff" opacity=".75"/></g>`;

const tree = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-10" y="-60" width="20" height="60" fill="#6B5040"/><circle cx="0" cy="-95" r="55" fill="${C.sage}"/><circle cx="-30" cy="-70" r="35" fill="#7C9879"/></g>`;

function cap(text, sub, opt = {}) {
  const { pos = 'bottom', dark = false, big = false } = opt;
  return `<div class="cap ${pos} ${dark ? 'dark' : ''} ${big ? 'big' : ''}"><div class="t">${text}</div>${sub ? `<div class="s">${sub}</div>` : ''}</div>`;
}

const SCENES = [
  {
    time: '0:00 – 0:04', title: 'Hook 1',
    vo: 'Bạn ấy chỉ muốn hết mụn trước ngày tốt nghiệp.',
    visual: 'Cô bé đội mũ tốt nghiệp, nhìn thẳng ống kính. Khung ngắm máy ảnh bao quanh mặt, 3 nốt mụn nhỏ.',
    motion: 'Zoom chậm vào mặt; chữ gõ từng từ. Tiếng màn trập máy ảnh.',
    bg: `linear-gradient(180deg, ${C.cream}, #F1E3D3)`,
    svg: () => `<circle cx="540" cy="1000" r="430" fill="${C.sageLight}"/>
      ${person({ x: 540, y: 1020, s: 1.55, cap: true, acne: 3, expr: 'smile' })}
      <g stroke="${C.ink}" stroke-width="10" fill="none" stroke-linecap="round">
        <path d="M230,720 v-70 h70"/><path d="M850,720 v-70 h-70"/><path d="M230,1330 v70 h70"/><path d="M850,1330 v70 h-70"/></g>
      <circle cx="262" cy="610" r="12" fill="${C.coral}"/><text x="286" y="620" font-size="30" font-family="Be Vietnam Pro" font-weight="700" fill="${C.ink}">REC</text>`,
    html: () => cap('Bạn ấy chỉ muốn <b>hết mụn</b> trước ngày tốt nghiệp.', null, { pos: 'top', big: true }),
  },
  {
    time: '0:04 – 0:08', title: 'Hook 2',
    vo: 'Không ngờ thứ mất đi sau đó… lại không chỉ là tiền.',
    visual: 'Nền tối. Gương vỡ, trong gương là cô bé buồn. Đồng xu rơi lả tả.',
    motion: 'Gương nứt dần theo nhịp câu; đồng xu rơi chậm. Nhạc tụt xuống trầm.',
    bg: `radial-gradient(circle at 50% 45%, ${C.night2}, ${C.night})`,
    svg: () => `<defs><clipPath id="m2"><ellipse cx="540" cy="930" rx="270" ry="370"/></clipPath></defs>
      <ellipse cx="540" cy="930" rx="300" ry="400" fill="${C.gold}"/>
      <ellipse cx="540" cy="930" rx="270" ry="370" fill="#4A4655"/>
      <g clip-path="url(#m2)" opacity=".85">${person({ x: 540, y: 900, s: 1.15, expr: 'sad', acne: 8, red: true, tear: true })}</g>
      <g stroke="#fff" stroke-opacity=".8" stroke-width="4" fill="none">
        <path d="M600,580 L560,760 L640,870 L580,1040 L660,1200"/><path d="M560,760 L420,820 L360,760"/><path d="M640,870 L760,900"/><path d="M580,1040 L450,1120"/></g>
      ${coin(170, 520, 44, -20, .9)}${coin(900, 700, 36, 25, .8)}${coin(140, 1250, 30, 10, .6)}${coin(930, 1150, 48, -15, .9)}${coin(820, 420, 26, 5, .5)}${coin(260, 1500, 40, 30, .7)}`,
    html: () => cap('Không ngờ thứ mất đi sau đó…', '<span class="hl">lại không chỉ là tiền.</span>', { pos: 'bottom', dark: true, big: true }),
  },
  {
    time: '0:08 – 0:17', title: 'Chuyện nhỏ',
    vo: 'Có một cô bé từng tìm đến Thoa chỉ vì một chuyện rất nhỏ: cô bé sắp chụp ảnh tốt nghiệp. Da có mấy nốt mụn. Cô bé muốn đẹp hơn một chút trong ngày quan trọng nhất của tuổi sinh viên.',
    visual: 'Cô bé chạm má, nhìn mấy nốt mụn. Lịch treo tường khoanh tròn ngày chụp ảnh tốt nghiệp.',
    motion: 'Vòng tròn nét đứt nháy quanh 2 nốt mụn; lịch lật trang đến ngày chụp.',
    bg: `linear-gradient(180deg, ${C.cream}, #F3E6D8)`,
    svg: () => `${person({ x: 470, y: 980, s: 1.45, expr: 'neutral', acne: 4, handCheek: true, shirt: '#E9D6C4' })}
      <g stroke="${C.coral}" stroke-width="5" fill="none" stroke-dasharray="10 9">
        <circle cx="${470 - 60 * 1.45}" cy="${980 + 22 * 1.45}" r="34"/><circle cx="${470 + 58 * 1.45}" cy="${980 + 30 * 1.45}" r="34"/></g>`,
    html: () => `<div class="cal"><div class="m">THÁNG 6</div><div class="d"><span>15</span></div><div class="l">Chụp ảnh tốt nghiệp</div></div>`
      + cap('Cô bé sắp chụp ảnh tốt nghiệp.<br>Da có <b>mấy nốt mụn</b>.', 'Chỉ muốn đẹp hơn một chút.'),
  },
  {
    time: '0:17 – 0:26', title: 'Bị tư vấn thêm',
    vo: 'Rồi cô bé bắt đầu nghe người ta tư vấn. Một liệu trình. Rồi thêm một sản phẩm. Rồi thêm một lần chăm sóc nữa. Mỗi thứ nghe qua đều có lý.',
    visual: 'Cô bé nhỏ ở dưới; từ ngoài khung, các bong bóng tư vấn chồng lên nhau, kèm chai lọ và thẻ giá.',
    motion: 'Mỗi bong bóng bật ra đúng lúc giọng đọc nói; tiếng "ting" thu ngân tăng dần.',
    bg: `linear-gradient(180deg, #F4ECE2, ${C.sageLight})`,
    svg: () => `${bottle(860, 1090, 1, C.blush)}${bottle(960, 1120, .8, C.sage)}${bottle(170, 1130, .9, C.gold)}
      ${person({ x: 540, y: 1130, s: 1.05, expr: 'worried', acne: 4 })}`,
    html: () => `<div class="bub r" style="top:190px;left:250px">+ Một liệu trình</div>
      <div class="bub r" style="top:360px;left:120px">+ Thêm một sản phẩm</div>
      <div class="bub r" style="top:530px;left:210px">+ Thêm một lần chăm sóc nữa</div>
      <div class="price" style="top:250px;right:70px">₫₫</div><div class="price" style="top:640px;left:70px">₫₫₫</div>`
      + cap('Mỗi thứ nghe qua <b>đều có lý</b>.'),
  },
  {
    time: '0:26 – 0:31', title: 'Không dám soi gương',
    vo: 'Cho đến một ngày… cô bé không còn dám soi gương.',
    visual: 'Phòng tối dần. Cô bé quay lưng lại với tấm gương trên tường.',
    motion: 'Ánh sáng tắt dần từ ấm sang lạnh; im tiếng nhạc 1 nhịp.',
    bg: `linear-gradient(180deg, #4A4553, ${C.night})`,
    svg: () => `<ellipse cx="270" cy="760" rx="170" ry="240" fill="${C.gold}" opacity=".9"/>
      <ellipse cx="270" cy="760" rx="146" ry="214" fill="#5D5868"/>
      <path d="M170,640 L240,560 M200,760 L330,610 M230,880 L360,730" stroke="#fff" stroke-opacity=".25" stroke-width="10" stroke-linecap="round"/>
      ${person({ x: 690, y: 1040, s: 1.35, back: true, shirt: '#8E8499' })}`,
    html: () => cap('Cho đến một ngày…', 'cô bé <b>không còn dám soi gương</b>.', { dark: true }),
  },
  {
    time: '0:31 – 0:34', title: 'Tin nhắn thu hồi',
    vo: '[Tin nhắn đã thu hồi] — khoảng lặng, không lời đọc.',
    visual: 'Màn hình điện thoại: cô bé gõ rồi thu hồi tin nhắn, ô nhập còn dở dang.',
    motion: 'Bong bóng tin nhắn hiện rồi đổi thành "Tin nhắn đã thu hồi"; con trỏ nhấp nháy.',
    bg: `linear-gradient(180deg, ${C.night}, #312E39)`,
    svg: () => `<rect x="210" y="330" width="660" height="1180" rx="80" fill="#151419"/>
      <rect x="236" y="356" width="608" height="1128" rx="60" fill="${C.paper}"/>
      <rect x="236" y="356" width="608" height="150" rx="60" fill="#EFE6DA"/><rect x="236" y="440" width="608" height="66" fill="#EFE6DA"/>
      <circle cx="320" cy="440" r="36" fill="${C.sage}"/><text x="376" y="452" font-size="34" font-family="Be Vietnam Pro" font-weight="700" fill="${C.ink}">Chị tư vấn</text>
      <rect x="270" y="1380" width="540" height="72" rx="36" fill="#EFE6DA"/>
      <text x="306" y="1428" font-size="30" font-family="Be Vietnam Pro" fill="${C.muted}">Chị ơi em…</text><rect x="468" y="1398" width="4" height="38" fill="${C.coral}"/>`,
    html: () => `<div class="msg out" style="top:600px">Chị ơi, da em dạo này…</div>
      <div class="msg rec" style="top:720px">⊘ Tin nhắn đã thu hồi</div>
      <div class="msg rec" style="top:830px">⊘ Tin nhắn đã thu hồi</div>`,
  },
  {
    time: '0:34 – 0:44', title: 'Mất nhiều hơn',
    vo: 'Mụn nhiều hơn. Da đỏ hơn. Và số tiền bỏ ra thì đã nhiều hơn rất nhiều so với số tiền ban đầu cô bé định dành cho việc chăm da.',
    visual: 'Cận mặt: da đỏ, mụn nhiều, mắt buồn. Bên dưới: hai thanh so sánh "định chi" và "đã chi".',
    motion: 'Mụn và vùng đỏ hiện dần; thanh "đã chi" kéo dài vượt khỏi khung.',
    bg: `linear-gradient(180deg, #F6E4DC, #F1D6CC)`,
    svg: () => `${person({ x: 540, y: 800, s: 1.75, expr: 'sad', acne: 16, red: true, shirt: '#E4CFC1' })}`,
    html: () => `<div class="cmp"><div class="row"><span>Định chi</span><i style="width:22%"></i></div>
      <div class="row"><span>Đã chi</span><i class="over" style="width:100%"></i></div>
      <div class="t">Mụn nhiều hơn. Da đỏ hơn.<br>Tiền bỏ ra <b>nhiều hơn rất nhiều</b>.</div></div>`,
  },
  {
    time: '0:44 – 0:52', title: 'Câu hỏi đau nhất',
    vo: 'Điều đau nhất không phải là mất tiền. Mà là lúc ấy cô bé vẫn không biết: "Rốt cuộc da mình đang bị gì?"',
    visual: 'Nền tối, cô bé nhỏ bé giữa khung, xung quanh là dấu hỏi lớn nhỏ.',
    motion: 'Dấu hỏi hiện lần lượt quanh cô bé; chữ trích dẫn hiện chậm, nghiêng.',
    bg: `radial-gradient(circle at 50% 60%, ${C.night2}, ${C.night})`,
    svg: () => `${[[170, 560, 180, -15, C.coral], [860, 640, 220, 12, C.blush], [230, 1220, 130, 10, C.gold], [880, 1180, 150, -8, C.coral], [540, 480, 110, 0, '#8E8499'], [120, 900, 90, -20, '#8E8499'], [960, 930, 100, 18, C.gold]]
      .map(([x, y, sz, r, col]) => `<text x="${x}" y="${y}" font-size="${sz}" font-family="Lora" font-weight="700" text-anchor="middle" fill="${col}" transform="rotate(${r} ${x} ${y})" opacity=".85">?</text>`).join('')}
      ${person({ x: 540, y: 1000, s: 1.05, expr: 'worried', acne: 10, red: true, shirt: '#8E8499' })}`,
    html: () => cap('Điều đau nhất không phải là mất tiền.', null, { pos: 'top', dark: true })
      + `<div class="quote">“Rốt cuộc da mình<br>đang bị gì?”</div>`,
  },
  {
    time: '0:52 – 0:59', title: 'Thoa xuất hiện',
    vo: 'Mười năm làm nghề, Thoa đã nghe và chứng kiến quá nhiều câu chuyện như vậy.',
    visual: 'Thoa trong đồng phục spa, mỉm cười. Xung quanh là các mẩu tin nhắn tâm sự của khách.',
    motion: 'Chuyển sáng ấm trở lại. Các mẩu tin nhắn trôi nhẹ quanh Thoa; huy hiệu "10 năm" bật lên.',
    bg: `linear-gradient(180deg, ${C.cream}, ${C.sageLight})`,
    svg: () => `<circle cx="540" cy="1000" r="400" fill="#fff" opacity=".55"/>
      ${person({ x: 540, y: 980, s: 1.4, hair: 'bun', shirt: C.forest, collar: C.sage, tag: 'Thoa', expr: 'smile' })}`,
    html: () => `<div class="note" style="top:230px;left:60px;transform:rotate(-4deg)">“Da em càng làm càng đỏ…”</div>
      <div class="note" style="top:380px;right:60px;transform:rotate(3deg)">“Em lỡ mua cả combo rồi…”</div>
      <div class="note" style="top:540px;left:110px;transform:rotate(2deg)">“Em không biết da mình bị gì…”</div>
      <div class="badge" style="top:760px;right:90px"><b>10</b>năm<br>làm nghề</div>`
      + cap('Mười năm làm nghề,', 'Thoa đã nghe và chứng kiến <b>quá nhiều câu chuyện</b> như vậy.'),
  },
  {
    time: '0:59 – 1:14', title: 'Nói thật từ đầu',
    vo: 'Và Thoa bắt đầu nghĩ: có phải người ta thiếu tiền đâu. Người ta thiếu một người nói thật với họ ngay từ đầu. Nói rằng cái này chưa cần làm. Cái kia chưa cần mua. Và có những lúc… điều tốt nhất cho làn da là đừng làm thêm gì nữa.',
    visual: 'Thoa giơ tay ra hiệu "khoan đã". Ba bong bóng lời khuyên thật lòng.',
    motion: 'Bong bóng hiện theo từng vế câu; bong bóng cuối to và nằm lâu nhất.',
    bg: `linear-gradient(180deg, ${C.sageLight}, ${C.cream})`,
    svg: () => `${person({ x: 470, y: 1060, s: 1.35, hair: 'bun', shirt: C.forest, collar: C.sage, tag: 'Thoa', expr: 'talk', raise: 1 })}`,
    html: () => `<div class="bub l" style="top:190px;left:90px">Cái này <b>chưa cần làm</b>.</div>
      <div class="bub l" style="top:350px;left:170px">Cái kia <b>chưa cần mua</b>.</div>
      <div class="bub l big" style="top:520px;left:90px">Có lúc, tốt nhất cho da là<br><b>đừng làm thêm gì nữa</b>.</div>`
      + cap('Người ta không thiếu tiền.', 'Người ta thiếu <b>một người nói thật</b> ngay từ đầu.'),
  },
  {
    time: '1:14 – 1:19', title: 'Về Làng Đại học',
    vo: 'Đó là lý do Thoa rời Sài Gòn, về Làng Đại học.',
    visual: 'Bản đồ minh hoạ: đường chấm từ thành phố Sài Gòn đến khu Làng Đại học nhiều cây xanh. Thoa kéo vali.',
    motion: 'Đường chấm tự vẽ từ trên xuống; Thoa trượt theo đường; ghim bản đồ rơi xuống Làng Đại học.',
    bg: `linear-gradient(180deg, #EFE7DC, ${C.sageLight})`,
    svg: () => `<g fill="#B9AEA3">
        <rect x="80" y="330" width="90" height="330"/><rect x="180" y="250" width="70" height="410"/><rect x="262" y="140" width="64" height="520"/><polygon points="262,140 294,70 326,140"/>
        <rect x="338" y="300" width="100" height="360"/><rect x="450" y="380" width="80" height="280"/></g>
      <g fill="#fff" opacity=".6">${Array.from({ length: 18 }, (_, i) => `<rect x="${95 + (i % 6) * 72}" y="${400 + Math.floor(i / 6) * 70}" width="18" height="28"/>`).join('')}</g>
      <rect x="60" y="660" width="500" height="10" rx="5" fill="#A89C90"/>
      <text x="80" y="730" font-size="40" font-family="Be Vietnam Pro" font-weight="800" fill="${C.muted}">Sài Gòn</text>
      <path d="M320,760 C340,980 780,920 740,1140 C710,1300 560,1320 600,1440" stroke="${C.coral}" stroke-width="10" stroke-dasharray="4 24" stroke-linecap="round" fill="none"/>
      <g transform="translate(0,120)">
        <rect x="560" y="1320" width="420" height="200" rx="12" fill="${C.paper}"/><polygon points="540,1330 770,1220 1000,1330" fill="${C.forest}"/>
        ${[0, 1, 2, 3, 4].map(i => `<rect x="${600 + i * 76}" y="1370" width="36" height="110" rx="6" fill="${C.sage}"/>`).join('')}
        ${tree(530, 1540, 1)}${tree(1010, 1540, .9)}${tree(470, 1560, .7)}</g>
      <g transform="translate(870,1250)"><path d="M0,0 C-60,-70 -60,-130 0,-130 C60,-130 60,-70 0,0z" fill="${C.coral}"/><circle cx="0" cy="-88" r="20" fill="#fff"/></g>
      <text x="1000" y="1720" font-size="44" font-family="Be Vietnam Pro" font-weight="800" text-anchor="end" fill="${C.forest}">Làng Đại học</text>
      ${person({ x: 560, y: 960, s: .55, hair: 'bun', shirt: C.forest, collar: C.sage, expr: 'smile', suitcase: true })}`,
    html: () => cap('Thoa rời Sài Gòn,', 'về <b>Làng Đại học</b>.', { pos: 'mid' }),
  },
  {
    time: '1:19 – 1:30', title: 'Tuổi dài, tiền ngắn',
    vo: 'Ở đây có rất nhiều bạn trẻ. Tuổi còn rất dài. Nhưng tiền thì thường rất ngắn. Trong khi quảng cáo ngoài kia… lại luôn có cách khiến người ta cảm thấy mình đang thiếu một thứ gì đó.',
    visual: 'Ba bạn sinh viên đứng giữa, xung quanh là các quảng cáo pop-up giật tít che kín nửa trên khung.',
    motion: 'Pop-up quảng cáo bật ra dồn dập, rung nhẹ; các bạn trẻ nhìn quanh bối rối.',
    bg: `linear-gradient(180deg, #F4ECE2, #EADFD2)`,
    svg: () => `${person({ x: 250, y: 1180, s: .85, hair: 'short', shirt: '#9DB5C9', expr: 'worried' })}
      ${person({ x: 830, y: 1180, s: .85, hair: 'long', shirt: C.blush, expr: 'neutral', hairColor: '#5A3A2A' })}
      ${person({ x: 540, y: 1100, s: 1, hair: 'long', shirt: '#E9D6C4', expr: 'worried', acne: 3 })}`,
    html: () => `<div class="ad" style="top:170px;left:60px;transform:rotate(-5deg)">SALE 50%<small>Chỉ hôm nay!</small></div>
      <div class="ad y" style="top:200px;right:60px;transform:rotate(4deg)">Combo trị mụn<small>cấp tốc 7 ngày</small></div>
      <div class="ad g" style="top:470px;left:120px;transform:rotate(3deg)">Da bạn đang thiếu<small>thứ này?</small></div>
      <div class="ad" style="top:520px;right:80px;transform:rotate(-3deg)">HOT TREND<small>ai cũng dùng</small></div>`
      + cap('Tuổi còn rất dài.', 'Nhưng <b>tiền thì thường rất ngắn</b>.'),
  },
  {
    time: '1:30 – 1:48', title: 'Hiểu da trước',
    vo: 'Vì vậy Thoa bắt đầu hành trình xây kênh Spa Nhà Thor với một mong muốn rất đơn giản: trước khi bạn bỏ tiền cho làn da, hãy hiểu nó trước. Thoa không bán phép màu. Thoa muốn chia sẻ những điều đáng lẽ bạn nên biết trước khi bỏ tiền, trước khi thử một thứ gì đó lên da, và trước khi quá muộn để quay lại.',
    visual: 'Kính lúp soi vào làn da cô bé (đã dịu lại). Biểu tượng đũa phép bị gạch chéo.',
    motion: 'Kính lúp lướt chậm qua má; chữ trích dẫn hiện từng dòng; đũa phép bị gạch.',
    bg: `linear-gradient(180deg, ${C.paper}, ${C.cream})`,
    svg: () => `${person({ x: 540, y: 1040, s: 1.35, expr: 'neutral', acne: 2, shirt: '#E9D6C4' })}
      <g transform="translate(640,1060)"><circle r="130" fill="#fff" opacity=".35" stroke="${C.forest}" stroke-width="22"/>
        <path d="M92,92 L230,230" stroke="${C.forest}" stroke-width="40" stroke-linecap="round"/></g>
      <g transform="translate(190,1300) rotate(-30)"><rect x="-12" y="-110" width="24" height="220" rx="12" fill="${C.ink}"/><polygon points="0,-170 16,-130 58,-130 24,-106 38,-66 0,-90 -38,-66 -24,-106 -58,-130 -16,-130" fill="${C.gold}"/></g>
      <line x1="90" y1="1150" x2="300" y2="1440" stroke="${C.coral}" stroke-width="16" stroke-linecap="round"/>
      <text x="200" y="1520" font-size="30" font-family="Be Vietnam Pro" font-weight="700" text-anchor="middle" fill="${C.coral}">Không bán phép màu</text>`,
    html: () => `<div class="quote light">“Trước khi bạn bỏ tiền<br>cho làn da,<br><b>hãy hiểu nó trước</b>.”</div>`
      + cap('Chia sẻ những điều bạn nên biết', 'trước khi quá muộn để quay lại.'),
  },
  {
    time: '1:48 – 2:00', title: 'Quyền nói "không"',
    vo: 'Để một ngày nào đó… khi bước vào một spa, bạn không còn ngồi đó chờ người khác quyết định thay mình. Bạn biết làn da của mình cần gì. Và bạn có quyền nói: "Không, cái này tôi chưa cần."',
    visual: 'Trong phòng spa, cô bé (da đã sạch, tự tin) giơ tay từ chối lọ sản phẩm được đưa tới từ ngoài khung.',
    motion: 'Tay đưa sản phẩm trượt vào; cô bé giơ tay, bong bóng thoại bật to. Nhạc sáng lên.',
    bg: `linear-gradient(180deg, ${C.sageLight}, #CFDCC9)`,
    svg: () => `<rect x="0" y="1480" width="1080" height="440" fill="#BFD0B8"/>
      <rect x="380" y="820" width="560" height="800" rx="120" fill="#F2E7DA"/>
      ${person({ x: 660, y: 1000, s: 1.2, expr: 'confident', acne: 0, shirt: C.paper, raise: -1 })}
      <g transform="translate(0,1180)"><path d="M-40,0 L200,-20" stroke="${C.forest}" stroke-width="80" stroke-linecap="round"/>
        <circle cx="230" cy="-22" r="46" fill="${C.skin}"/>${bottle(250, -40, .9, C.blush)}</g>
      ${tree(990, 760, .8)}`,
    html: () => `<div class="bub r big" style="top:250px;left:260px">Không, cái này<br><b>tôi chưa cần</b>.</div>`
      + cap('Bạn biết làn da mình cần gì.', 'Và bạn có quyền <b>nói “không”</b>.'),
  },
  {
    time: '2:00 – 2:10', title: 'Kêu gọi theo dõi',
    vo: 'Nếu bạn đang loay hoay với làn da của mình… thì ở lại đây với kênh Spa Nhà Thor. Thoa sẽ cùng bạn bắt đầu từ những điều căn bản nhất.',
    visual: 'Nền xanh rêu. Logo Spa Nhà Thor, Thoa vẫy tay chào, nút "Theo dõi".',
    motion: 'Logo nở ra từ chiếc lá; Thoa vẫy tay; nút Theo dõi nảy nhẹ 2 lần.',
    bg: `radial-gradient(circle at 50% 35%, #3E5E50, ${C.forest})`,
    svg: () => `${person({ x: 540, y: 1100, s: 1.25, hair: 'bun', shirt: '#F2E7DA', collar: C.sage, tag: 'Thoa', expr: 'smile', raise: 1 })}`,
    html: () => `<div class="logo"><svg viewBox="0 0 100 100" width="120" height="120"><path d="M50,8 C85,25 85,70 50,92 C15,70 15,25 50,8z" fill="${C.sage}"/><path d="M50,20 L50,86" stroke="${C.paper}" stroke-width="4"/></svg>
      <div><div class="n">Spa Nhà Thor</div><div class="k">Hiểu da trước khi bỏ tiền</div></div></div>`
      + `<div class="follow">+ Theo dõi</div>`
      + cap('Nếu bạn đang loay hoay với làn da…', 'Thoa sẽ cùng bạn bắt đầu từ <b>những điều căn bản nhất</b>.', { dark: true }),
  },
];
