// Runs every engine test. Exits non-zero if any fail.
const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
let failed = 0;
for (const f of fs.readdirSync(__dirname).filter(function (n) { return /^test_.*\.js$/.test(n); }).sort()) {
  try { execFileSync(process.execPath, [path.join(__dirname, f)], { stdio: 'pipe' }); console.log('ok   ' + f); }
  catch (e) { failed++; console.log('FAIL ' + f + '\n' + String(e.stdout || '') + String(e.stderr || '')); }
}
process.exit(failed ? 1 : 0);
