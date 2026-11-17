// Bone wall: 3+ skeletons touching in a chain each gain a quarter of their health, once.
const DC = require('../src/js/engine.js'), assert = require('assert');
// 4x3 board of coins (even width: no middle refill), hero at 5. Moving right (5 -> 6) and back only slides row 1, so row 0 stays still.
function mk() {
  const S = DC.newGame({ id: 1, w: 4, h: 3, heroHP: 60, ramp: 12, cap: 4, weights: { coin: 1 } }, 3, { powers: [] });
  S.grid = S.grid.map(() => ({ uid: ++S.uid, type: 'coin', kind: 'gold', v: 1 }));
  S.hero.pos = 5; S.grid[5] = null; return S;
}
const sk = (S, v) => ({ uid: ++S.uid, type: 'skeleton', kind: 'monster', v: v });
assert.strictEqual(DC.PERIOD.raise, 6, 'lich raises every 6 turns');

// Two touching skeletons: nothing.
let S = mk(); let a = sk(S, 4), b = sk(S, 4); S.grid[0] = a; S.grid[1] = b;
DC.move(S, 1);
assert.strictEqual(a.v, 4); assert.strictEqual(b.v, 4);

// Three in an L-shaped chain (0, 1, 2 in a row works too): each gains ceil(v / 4), once.
S = mk(); a = sk(S, 4); b = sk(S, 5); const c = sk(S, 8); S.grid[0] = a; S.grid[1] = b; S.grid[2] = c;
DC.move(S, 1);
assert.deepStrictEqual([a.v, b.v, c.v], [5, 7, 10], '+1, +2, +2');
DC.move(S, 3); DC.move(S, 1);
assert.deepStrictEqual([a.v, b.v, c.v], [5, 7, 10], 'only once per skeleton');

// Skeletons only chain with skeletons: a rat in the middle breaks it.
S = mk(); a = sk(S, 4); b = sk(S, 4); S.grid[0] = a; S.grid[1] = { uid: ++S.uid, type: 'rat', kind: 'monster', v: 2, t: 0 }; S.grid[2] = b;
DC.move(S, 1);
assert.strictEqual(a.v, 4); assert.strictEqual(b.v, 4);
console.log('bone wall ok');
