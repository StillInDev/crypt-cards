// Exports every sprite in src/js/sprites.js to art/<id>.png (18x18) and art/<id>@8x.png (enlarged for review).
// Usage: node scripts/export-sprites.js [--sheet out.png]
const fs = require('fs'), path = require('path'), zlib = require('zlib');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'art');

function loadSprites() {
  const src = fs.readFileSync(path.join(root, 'src/js/sprites.js'), 'utf8');
  const json = src.slice(src.indexOf('{'), src.lastIndexOf('}') + 1);
  return JSON.parse(json);
}

// ---- Minimal PNG decode (8-bit RGBA or RGB, non-interlaced) and encode (RGBA) ----
function decodePNG(buf) {
  let pos = 8, w, h, ct, idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), type = buf.toString('ascii', pos + 4, pos + 8), data = buf.slice(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4); ct = data[9];
      if (data[8] !== 8 || data[12] !== 0 || (ct !== 6 && ct !== 2)) throw new Error('unsupported PNG');
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
  for (let y = 0; y < h; y++) px.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
function scale(img, k) {
  const w = img.w * k, h = img.h * k, px = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) img.px.copy(px, (y * w + x) * 4, ((((y / k) | 0) * img.w) + ((x / k) | 0)) * 4, ((((y / k) | 0) * img.w) + ((x / k) | 0)) * 4 + 4);
  return { w, h, px };
}

// ---- Main ----
const sprites = loadSprites();
fs.mkdirSync(outDir, { recursive: true });
const imgs = {};
for (const id of Object.keys(sprites)) {
  const buf = Buffer.from(sprites[id].split(',')[1], 'base64');
  imgs[id] = decodePNG(buf);
  fs.writeFileSync(path.join(outDir, id + '.png'), buf);
  fs.writeFileSync(path.join(outDir, id + '@8x.png'), encodePNG(scale(imgs[id], 8)));
}
console.log('Exported', Object.keys(imgs).length, 'sprites to art/');

// Optional contact sheet (in sprite order, 10 per row, grey cells) for a quick look at everything.
const si = process.argv.indexOf('--sheet');
if (si > 0) {
  const ids = Object.keys(imgs), cols = 10, cell = 20, k = 6, rows = Math.ceil(ids.length / cols);
  const sheet = { w: cols * cell, h: rows * cell, px: Buffer.alloc(cols * cell * rows * cell * 4) };
  for (let i = 0; i < sheet.w * sheet.h; i++) { sheet.px[i * 4] = 69; sheet.px[i * 4 + 1] = 67; sheet.px[i * 4 + 2] = 63; sheet.px[i * 4 + 3] = 255; }
  ids.forEach((id, n) => {
    const ox = (n % cols) * cell + 1, oy = ((n / cols) | 0) * cell + 1, im = imgs[id];
    for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) {
      const s = (y * im.w + x) * 4; if (!im.px[s + 3]) continue;
      im.px.copy(sheet.px, ((oy + y) * sheet.w + ox + x) * 4, s, s + 4);
    }
  });
  fs.writeFileSync(process.argv[si + 1], encodePNG(scale(sheet, k)));
  console.log('Sheet order:', ids.join(', '));
}
