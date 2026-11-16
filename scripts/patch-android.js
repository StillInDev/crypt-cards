// Run after `cap add android` / `cap sync`. Applies the settings Capacitor does not manage:
// portrait orientation, version numbers, and a check that the target API level is still high enough for Google Play.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', 'android');
const pkg = require('../package.json');
const MIN_TARGET = 36; // Google Play requires API 36+ for new apps and updates since 31 Aug 2026

function edit(file, fn) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) { console.log('skip (missing):', file); return; }
  const before = fs.readFileSync(p, 'utf8'), after = fn(before);
  if (after !== before) { fs.writeFileSync(p, after); console.log('patched:', file); }
}

edit('app/src/main/AndroidManifest.xml', function (s) {
  return /screenOrientation/.test(s) ? s : s.replace('android:name=".MainActivity"', 'android:name=".MainActivity"\n            android:screenOrientation="portrait"');
});

const versionCode = parseInt(process.env.VERSION_CODE || '1', 10);
const versionName = process.env.VERSION_NAME || pkg.version;
edit('app/build.gradle', function (s) {
  return s.replace(/versionCode\s+\d+/, 'versionCode ' + versionCode).replace(/versionName\s+"[^"]*"/, 'versionName "' + versionName + '"');
});

edit('variables.gradle', function (s) {
  const m = s.match(/targetSdkVersion\s*=\s*(\d+)/);
  if (m && Number(m[1]) < MIN_TARGET) {
    console.log('targetSdkVersion ' + m[1] + ' is below ' + MIN_TARGET + ', raising it.');
    s = s.replace(/targetSdkVersion\s*=\s*\d+/, 'targetSdkVersion = ' + MIN_TARGET).replace(/compileSdkVersion\s*=\s*\d+/, 'compileSdkVersion = ' + MIN_TARGET);
  }
  return s;
});
console.log('versionCode', versionCode, 'versionName', versionName);
