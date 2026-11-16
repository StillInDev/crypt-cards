const DC = require('../src/js/engine.js');
const assert = require('assert');
function lvl(req, reward) { const L = DC.nextLevel(null, 1); L.req = req; L.reward = reward; return L; }
let appeared = 0, claimedRuns = 0;
for (let seed = 1; seed <= 60; seed++) {
  const S = DC.newGame(lvl(6, { kind: 'hero', id: 'sorcerer' }), seed, {});
  assert(!S.grid.some(c => c && c.kind === 'reward'), 'no reward before the target');
  let seen = 0, claimed = null;
  for (let n = 0; n < 600 && !S.over; n++) {
    const before = S.hero.gold;
    const r = DC.move(S, (n * 7 + seed) % 4);
    if (!r) continue;
    const count = S.grid.filter(c => c && c.kind === 'reward').length;
    assert(count <= 1, 'at most one reward tile');
    if (count) seen++;
    if (S.hero.gold < 6) assert(count === 0, 'tile only after the target is reached');
    if (S.claimed) { claimed = S.claimed; break; }
  }
  if (seen) appeared++;
  if (claimed) { claimedRuns++; assert.deepStrictEqual(claimed, { kind: 'hero', id: 'sorcerer' });
    // keep playing: it must never come back
    for (let n = 0; n < 80 && !S.over; n++) { DC.move(S, n % 4); assert(!S.grid.some(c => c && c.kind === 'reward'), 'no second tile'); } }
}
assert(appeared > 40 && claimedRuns > 20, 'appeared ' + appeared + ' claimed ' + claimedRuns);
// already claimed: never spawns
const S2 = DC.newGame(lvl(2, { kind: 'door' }), 3, { claimed: true });
for (let n = 0; n < 100 && !S2.over; n++) { DC.move(S2, n % 4); assert(!S2.grid.some(c => c && c.kind === 'reward')); }
// powers can't target it
const S3 = DC.newGame(lvl(1, { kind: 'power', id: 'ice' }), 5, { powers: ['teleport'] });
S3.hero.gold = 5; let k = -1; S3.grid[0] = { uid: 999, type: 'reward', kind: 'reward', v: 0, rw: { kind: 'door' } }; if (S3.hero.pos === 0) S3.hero.pos = 1;
assert(!DC.validTarget(S3, 0, 0), 'teleport cannot target the reward');
console.log('reward tests passed (' + appeared + ' tiles, ' + claimedRuns + ' claims)');
