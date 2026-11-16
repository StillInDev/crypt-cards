// Assembles the web app into www/ (what Capacitor packs into the Android app).
const fs = require('fs'), path = require('path');
const src = path.join(__dirname, 'src'), out = path.join(__dirname, 'www');
fs.rmSync(out, { recursive: true, force: true });
(function copy(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const f of fs.readdirSync(from)) {
    const a = path.join(from, f), b = path.join(to, f);
    fs.statSync(a).isDirectory() ? copy(a, b) : fs.copyFileSync(a, b);
  }
})(src, out);
console.log('www/ built:', fs.readdirSync(out).join(', '));
