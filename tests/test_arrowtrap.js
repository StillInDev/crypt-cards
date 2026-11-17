// The plain arrow trap (formerly the spike trap): directional, no element.
const assert = require('assert');
const DC = require('../src/js/engine.js');
DC.TYPES.dummy = DC.TYPES.dummy || { kind: 'monster', name: 'Dummy', lo: 1, hi: 1, bf: 0, tip: '' };
const T = DC.TYPES.trap;
assert.strictEqual(T.kind, 'dtrap'); assert.strictEqual(T.name, 'Arrow trap'); assert(!T.el, 'no element');

// It spawns with one to four heads, like the fire and ice traps.
const S0 = DC.newGame({ id: 1, w: 4, h: 3, heroHP: 10, ramp: 12, cap: 4, weights: { trap: 1 } }, 3, { hero: 'knight', powers: [] });
const traps = S0.grid.filter(c => c && c.type === 'trap');
assert(traps.length > 0, 'spawned');
traps.forEach(c => { const n = c.h.reduce((a, b) => a + b, 0); assert(n >= 1 && n <= 4); });

function game(hero) {
  const S = DC.newGame({ id: 1, w: 4, h: 3, heroHP: 10, ramp: 12, cap: 4, weights: { coin: 1 } }, 7, { hero: hero || 'knight', powers: [] });
  S.grid = S.grid.map(() => ({ uid: ++S.uid, type: 'coin', kind: 'gold', v: 1 }));
  S.hero.pos = 5; S.grid[5] = null;
  return S;
}
// A trap two squares right of the hero's landing spot, aiming left after it turns (heads turn clockwise first):
// hero steps up from 5 to 1; trap at 2 with its "down" head turns to point left, at square 1.
let S = game(); S.grid[2] = { uid: ++S.uid, type: 'trap', kind: 'dtrap', v: 2, h: [0, 0, 1, 0] };
let hp = S.hero.hp; DC.move(S, 0);
assert.strictEqual(S.hero.pos, 1); assert.strictEqual(S.hero.hp, hp - 2, 'the head hits the hero');
// The Shield blocks fire and ice, not plain arrows.
S = game(); S.hero.ward = 3; S.grid[2] = { uid: ++S.uid, type: 'trap', kind: 'dtrap', v: 2, h: [0, 0, 1, 0] };
hp = S.hero.hp; DC.move(S, 0); assert.strictEqual(S.hero.hp, hp - 2, 'shield does not stop arrows');
S = game(); S.hero.ward = 3; S.grid[2] = { uid: ++S.uid, type: 'firetrap', kind: 'dtrap', v: 2, h: [0, 0, 1, 0] };
hp = S.hero.hp; DC.move(S, 0); assert.strictEqual(S.hero.hp, hp, 'shield still stops fire');
// The Ninja dodges them.
S = game('rogue'); S.grid[2] = { uid: ++S.uid, type: 'trap', kind: 'dtrap', v: 2, h: [0, 0, 1, 0] };
hp = S.hero.hp; DC.move(S, 0); assert.strictEqual(S.hero.hp, hp);
// It hits monsters for its number, with no element bonus.
S = game(); const m = { uid: ++S.uid, type: 'dummy', kind: 'monster', v: 5 };
S.grid[2] = { uid: ++S.uid, type: 'trap', kind: 'dtrap', v: 2, h: [1, 0, 0, 0] }; S.grid[3] = m; // up turns to right: square 3
DC.move(S, 2);
assert.strictEqual(m.v, 3, 'monster takes 2');
