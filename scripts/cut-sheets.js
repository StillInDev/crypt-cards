// Cuts the art sheets in art/sheets/ into one sprite per id: src/img/sprites/<id>.png (96x96),
// and writes src/js/sprites.js (the id -> file map the game loads).
// Usage: node scripts/cut-sheets.js [--sheet out.png]   (--sheet also writes a contact sheet to review)
//
// Each sheet is a grid of icons on a transparent background. SHEETS lists the ids in reading order
// (left to right, top to bottom). To replace a sprite, redraw it on its sheet (same grid cell) and rerun.
const fs = require('fs'), path = require('path'), zlib = require('zlib');

const SIZE = 96;     // output sprite size in pixels
const PAD = 0.04;    // empty margin around the icon, as a share of the size
const FAINT = 24;    // alpha below this is stray glow/halo from the background removal: dropped
const SOLID = 240;   // alpha at or above this is the icon body: made fully opaque

const SHEETS = {
  '01_Heroes_and_Treasure.png': { cols: 5, ids: ['knight', 'sorcerer', 'rogue', 'cactus', 'yeti', 'slime', 'chest', 'coin', 'gem', 'key'] },
  '02_Undead.png': { cols: 5, ids: ['banshee', 'ghost', 'frostwisp', 'wraith', 'skeleton', 'zombie', 'mummy', 'lich', 'vampire', 'cultist'] },
  '03_Beasts.png': { cols: 5, ids: ['bat', 'beetle', 'frostwolf', 'goblin', 'golem', 'harpy', 'hive', 'icespider', 'imp', 'magmaslime'] },
  '04_Monsters.png': { cols: 5, ids: ['minotaur', 'ogre', 'phoenix', 'rat', 'salamander', 'scorpion', 'shroom', 'snake', 'spider', 'troll'] },
  '05_Dungeon_Hazards.png': { cols: 3, ids: ['gargoyle', 'goldskull', 'wolf', 'webspider', 'bomb', 'bars', 'tomb', 'trap', 'web'] },
  '06_Elemental_Weapons.png': { cols: 5, ids: ['elecbow', 'firearrow', 'firesword', 'firetrap', 'firewand', 'icearrow', 'icesword', 'icetrap', 'icewand', 'painblade'] },
  '07_Tools_and_Items.png': { cols: 3, ids: ['ninjastar', 'poison', 'potion', 'scythe', 'sword', 'windblade', 'p_dart', 'p_forge', 'p_shield'] },
  '08_Power_Effects.png': { cols: 3, ids: ['p_burst', 'p_fire', 'p_heal', 'p_ice', 'p_massheal', 'p_quake', 'p_scythe', 'p_teleport', 'p_thunder'] },
  '09_New_Heroes.png': { cols: 5, ids: ['stormmage', 'bard', 'dragonkin', 'count', 'barbarian'] }
};
// The game rotates arrow sprites itself and expects them pointing straight up. The sheet draws them
// pointing up-right, so they are turned 45 degrees anticlockwise.
const ROTATE = { firearrow: -45, icearrow: -45 };

const root = path.join(__dirname, '..');
const sheetDir = path.join(root, 'art/sheets'), outDir = path.join(root, 'src/img/sprites');

// ---- PNG decode (8-bit RGB/RGBA, non-interlaced) and encode (RGBA) ----
function decodePNG(buf) {
  let pos = 8, w, h, ct, idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), type = buf.toString('ascii', pos + 4, pos + 8), data = buf.slice(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4); ct = data[9];
      if (data[8] !== 8 || data[12] !== 0 || (ct !== 6 && ct !== 2)) throw new Error('unsupported PNG (need 8-bit RGB/RGBA, not interlaced)');
    } else if (type === 'IDAT') idat.push(data);
    pos += 12 + len;
  }
  const bpp = ct === 6 ? 4 : 3, stride = w * bpp, raw = zlib.inflateSync(Buffer.concat(idat));
  const px = Buffer.alloc(w * h * 4), prev = Buffer.alloc(stride), line = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)];
    for (let x = 0; x < stride; x++) {
      const v = raw[y * (stride + 1) + 1 + x], a = x >= bpp ? line[x - bpp] : 0, b = prev[x], c = x >= bpp ? prev[x - bpp] : 0;
      let p = 0;
      if (f === 1) p = a; else if (f === 2) p = b; else if (f === 3) p = (a + b) >> 1;
      else if (f === 4) { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); p = pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      line[x] = (v + p) & 255;
    }
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      px[o] = line[x * bpp]; px[o + 1] = line[x * bpp + 1]; px[o + 2] = line[x * bpp + 2]; px[o + 3] = bpp === 4 ? line[x * bpp + 3] : 255;
    }
    line.copy(prev);
  }
  return { w, h, px };
}
const CRC = (function () { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(b) { let c = 0xffffffff; for (const x of b) c = CRC[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]), crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function encodePNG({ w, h, px }) {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc(h * (w * 4 + 1));
  for (let y = 0; y < h; y++) {
    const o = y * (w * 4 + 1); raw[o] = 1; // Sub filter: smaller files
    for (let x = 0; x < w * 4; x++) raw[o + 1 + x] = (px[y * w * 4 + x] - (x >= 4 ? px[y * w * 4 + x - 4] : 0)) & 255;
  }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// ---- Image helpers (float premultiplied RGBA) ----
function toFloat(img, x0, y0, w, h) {
  const f = new Float32Array(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const s = ((y0 + y) * img.w + x0 + x) * 4;
    let a = img.px[s + 3];
    if (a < FAINT) a = 0; else if (a >= SOLID) a = 255;
    const k = a / 255, o = (y * w + x) * 4;
    f[o] = img.px[s] * k; f[o + 1] = img.px[s + 1] * k; f[o + 2] = img.px[s + 2] * k; f[o + 3] = a;
  }
  return { w, h, f };
}
function bbox(im) {
  let x0 = im.w, y0 = im.h, x1 = -1, y1 = -1;
  for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) if (im.f[(y * im.w + x) * 4 + 3] > 0) {
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  return x1 < 0 ? null : { x0, y0, x1, y1 };
}
function rotate(im, deg) { // bilinear, about the centre, into a canvas big enough to hold the result
  const r = deg * Math.PI / 180, c = Math.cos(r), s = Math.sin(r);
  const W = Math.ceil(Math.abs(im.w * c) + Math.abs(im.h * s)), H = Math.ceil(Math.abs(im.w * s) + Math.abs(im.h * c));
  const out = new Float32Array(W * H * 4), cx = im.w / 2, cy = im.h / 2;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = x + 0.5 - W / 2, dy = y + 0.5 - H / 2;
    const sx = c * dx + s * dy + cx - 0.5, sy = -s * dx + c * dy + cy - 0.5; // inverse rotation
    const ix = Math.floor(sx), iy = Math.floor(sy), fx = sx - ix, fy = sy - iy;
    for (let ch = 0; ch < 4; ch++) {
      let v = 0;
      for (const [ox, oy, wt] of [[0, 0, (1 - fx) * (1 - fy)], [1, 0, fx * (1 - fy)], [0, 1, (1 - fx) * fy], [1, 1, fx * fy]]) {
        const px = ix + ox, py = iy + oy;
        if (px >= 0 && py >= 0 && px < im.w && py < im.h) v += im.f[(py * im.w + px) * 4 + ch] * wt;
      }
      out[(y * W + x) * 4 + ch] = v;
    }
  }
  return { w: W, h: H, f: out };
}
// Area-average resample of the square (sx, sy, side) of im into SIZE x SIZE, with the icon inset by PAD.
function fit(im, b) {
  const bw = b.x1 - b.x0 + 1, bh = b.y1 - b.y0 + 1, side = Math.max(bw, bh) / (1 - 2 * PAD);
  const sx = b.x0 + bw / 2 - side / 2, sy = b.y0 + bh / 2 - side / 2, scale = side / SIZE;
  const px = Buffer.alloc(SIZE * SIZE * 4);
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
    const ax = sx + x * scale, ay = sy + y * scale, bx = ax + scale, by = ay + scale;
    const acc = [0, 0, 0, 0]; let area = 0;
    for (let yy = Math.floor(ay); yy < Math.ceil(by); yy++) for (let xx = Math.floor(ax); xx < Math.ceil(bx); xx++) {
      const wx = Math.min(bx, xx + 1) - Math.max(ax, xx), wy = Math.min(by, yy + 1) - Math.max(ay, yy), wt = wx * wy;
      if (wt <= 0) continue;
      area += wt;
      if (xx < 0 || yy < 0 || xx >= im.w || yy >= im.h) continue; // outside: transparent
      const o = (yy * im.w + xx) * 4;
      for (let ch = 0; ch < 4; ch++) acc[ch] += im.f[o + ch] * wt;
    }
    const a = acc[3] / area, o = (y * SIZE + x) * 4;
    if (a < 1) continue;
    px[o] = Math.min(255, Math.round(acc[0] / area * 255 / a));
    px[o + 1] = Math.min(255, Math.round(acc[1] / area * 255 / a));
    px[o + 2] = Math.min(255, Math.round(acc[2] / area * 255 / a));
    px[o + 3] = Math.min(255, Math.round(a));
  }
  return { w: SIZE, h: SIZE, px };
}

// Row bands: runs of rows holding solid pixels, split at the middle of each gap.
function rowBands(img, n) {
  const occ = new Array(img.h).fill(0);
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) if (img.px[(y * img.w + x) * 4 + 3] > 128) { occ[y] = 1; break; }
  const runs = []; let s = -1, last = -1;
  occ.forEach((v, i) => { if (!v) return; if (s < 0) s = i; else if (i - last > 25) { runs.push([s, last]); s = i; } last = i; });
  if (s >= 0) runs.push([s, last]);
  if (runs.length !== n) throw new Error('expected ' + n + ' rows of icons, found ' + runs.length);
  return runs.map((r, i) => [i ? Math.floor((runs[i - 1][1] + r[0]) / 2) : 0, i < n - 1 ? Math.floor((r[1] + runs[i + 1][0]) / 2) : img.h]);
}

// ---- Main ----
fs.mkdirSync(outDir, { recursive: true });
const done = {};
for (const [file, spec] of Object.entries(SHEETS)) {
  const img = decodePNG(fs.readFileSync(path.join(sheetDir, file)));
  const rows = rowBands(img, Math.ceil(spec.ids.length / spec.cols)), cw = img.w / spec.cols;
  spec.ids.forEach((id, i) => {
    const [y0, y1] = rows[Math.floor(i / spec.cols)], x0 = Math.round((i % spec.cols) * cw), x1 = Math.round((i % spec.cols + 1) * cw);
    let im = toFloat(img, x0, y0, x1 - x0, y1 - y0);
    if (ROTATE[id]) im = rotate(im, ROTATE[id]);
    const b = bbox(im);
    if (!b) throw new Error(file + ': cell ' + i + ' (' + id + ') is empty');
    done[id] = fit(im, b);
    fs.writeFileSync(path.join(outDir, id + '.png'), encodePNG(done[id]));
  });
}
const ids = Object.keys(done).sort();
fs.writeFileSync(path.join(root, 'src/js/sprites.js'),
  '// Generated by scripts/cut-sheets.js from art/sheets/. Do not edit by hand.\nwindow.SPR = {\n' +
  ids.map(id => '  ' + JSON.stringify(id) + ': "img/sprites/' + id + '.png"').join(',\n') + '\n};\n');
console.log('Cut', ids.length, 'sprites into src/img/sprites/ and wrote src/js/sprites.js');

// Optional contact sheet on a card-coloured background, in the order above, to review the cut.
const si = process.argv.indexOf('--sheet');
if (si > 0) {
  const order = [].concat(...Object.values(SHEETS).map(s => s.ids)), cols = 10, cell = SIZE + 8, rows = Math.ceil(order.length / cols);
  const sheet = { w: cols * cell, h: rows * cell, px: Buffer.alloc(cols * cell * rows * cell * 4) };
  for (let i = 0; i < sheet.w * sheet.h; i++) sheet.px.set([69, 67, 63, 255], i * 4);
  order.forEach((id, n) => {
    const ox = (n % cols) * cell + 4, oy = Math.floor(n / cols) * cell + 4, im = done[id];
    for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) {
      const s = (y * SIZE + x) * 4, a = im.px[s + 3] / 255, d = ((oy + y) * sheet.w + ox + x) * 4;
      for (let ch = 0; ch < 3; ch++) sheet.px[d + ch] = Math.round(im.px[s + ch] * a + sheet.px[d + ch] * (1 - a));
    }
  });
  fs.writeFileSync(process.argv[si + 1], encodePNG(sheet));
  console.log('Contact sheet order:', order.join(', '));
}
