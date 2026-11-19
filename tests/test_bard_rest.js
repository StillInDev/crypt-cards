// Bard: a turn he is hurt, no song. The next unhurt turn is a rest (still no song). After that he heals every turn.
const assert = require('assert');
const DC = require('../src/js/engine.js');
DC.TYPES.dummy = DC.TYPES.dummy || { kind: 'monster', name: 'Dummy', lo: 1, hi: 1, bf: 0, tip: '' };
const S = DC.newGame({ id: 1, w: 3, h: 3, heroHP: 20, ramp: 12, cap: 4, weights: { coin: 1 } }, 7, { hero: 'bard', powers: [] });
const coin = () => ({ uid: ++S.uid, type: 'coin', kind: 'gold', v: 1 });
S.grid = S.grid.map(coin); S.hero.pos = 4; S.grid[4] = null;
const heal = DC.songHeal(S.hero.lv);
function step(d) { const h = S.hero.hp; DC.move(S, d); return S.hero.hp - h; }
S.hero.hp = 5;
assert.strictEqual(step(0), heal, 'unhurt from the start: heals');
// Fill every square around him with a 3-health monster, then fight one: he is hurt, so no song.
S.grid = S.grid.map(function (c, i) { return i === S.hero.pos ? null : { uid: ++S.uid, type: 'dummy', kind: 'monster', v: 3, mx: 3 }; });
const pos = S.hero.pos, dir = pos >= 3 ? 0 : 2;
const hp0 = S.hero.hp; DC.move(S, dir);
assert.strictEqual(S.hero.hp, hp0 - 3, 'hurt for 3 and no song on top');
S.grid = S.grid.map(function (c, i) { return i === S.hero.pos ? null : coin(); });
assert.strictEqual(step(S.hero.pos >= 3 ? 0 : 2), 0, 'first unhurt turn after a hit: resting, no heal');
assert.strictEqual(step(S.hero.pos >= 3 ? 0 : 2), heal, 'second unhurt turn: heals');
assert.strictEqual(step(S.hero.pos >= 3 ? 0 : 2), heal, 'and every turn after');
console.log('ok bard rest');
