// Spike trap: arrows turn clockwise each turn; it only hurts you if you step onto it from a side with an arrow.
// It never hits the cards around it. Heads are [top, right, bottom, left].
const DC = require('../src/js/engine.js'), assert = require('assert');
function mk() {
  const S = DC.newGame({ id: 1, w: 3, h: 3, heroHP: 20, ramp: 12, cap: 4, weights: { coin: 1 } }, 5, {});
  S.grid = S.grid.map(() => ({ uid: ++S.uid, type: 'coin', kind: 'gold', v: 1 }));
  S.hero.hp = S.hero.max = 20; return S;
}
const trap = (S, h, v) => ({ uid: ++S.uid, type: 'trap', kind: 'dtrap', v: v || 3, h: h });

// Arrows turn a quarter clockwise every turn.
let S = mk(); S.hero.pos = 8; S.grid[8] = null; const t0 = trap(S, [1, 0, 0, 0]); S.grid[0] = t0;
DC.move(S, 0);
assert.deepStrictEqual(t0.h, [0, 1, 0, 0], 'rotated clockwise');

// It never hits the cards around it: a rat its arrow points at is untouched, and so is the hero beside it.
S = mk(); S.hero.pos = 6; S.grid[6] = null;
const t1 = trap(S, [0, 1, 0, 0]); S.grid[4] = t1; const rat = { uid: ++S.uid, type: 'rat', kind: 'monster', v: 9, t: 0 }; S.grid[5] = rat;
DC.move(S, 1); // hero 6 -> 7, right below the trap; it turns to point down at the hero
assert.strictEqual(rat.v, 9, 'monsters are never stabbed'); assert.strictEqual(S.hero.hp, 20, 'standing next to it is safe');

// Stepping onto it: hurts only from a side with an arrow. Hero at 7 (below the trap at 4) moves up (dir 0),
// entering from the bottom side (index 2).
for (const [h, hurt] of [[[0, 0, 1, 0], true], [[1, 0, 0, 0], false], [[0, 1, 0, 1], false], [[1, 1, 1, 1], true]]) {
  S = mk(); S.hero.pos = 7; S.grid[7] = null; S.grid[4] = trap(S, h.slice(), 3);
  assert.strictEqual(DC.preview(S, 0).dHp, hurt ? -3 : 0, 'preview agrees for ' + h);
  DC.move(S, 0);
  assert.strictEqual(S.hero.pos, 4, 'you step onto it');
  assert.strictEqual(S.hero.hp, hurt ? 17 : 20, (hurt ? 'hurt' : 'safe') + ' entering from below with arrows ' + h);
}
// The side counts from where you come: from the left (moving right, dir 1) only a left arrow (index 3) hurts.
S = mk(); S.hero.pos = 3; S.grid[3] = null; S.grid[4] = trap(S, [0, 0, 0, 1], 2); DC.move(S, 1); assert.strictEqual(S.hero.hp, 18);
S = mk(); S.hero.pos = 3; S.grid[3] = null; S.grid[4] = trap(S, [0, 1, 0, 0], 2); DC.move(S, 1); assert.strictEqual(S.hero.hp, 20);

// Only the spike trap is left, and Shield does not stop it.
S = mk(); S.hero.pos = 7; S.grid[7] = null; S.hero.ward = 3; S.grid[4] = trap(S, [0, 0, 1, 0], 3); DC.move(S, 0);
assert.strictEqual(S.hero.hp, 17, 'shield does not stop spikes');
assert(!DC.TYPES.firetrap && !DC.TYPES.icetrap, 'elemental traps removed'); assert.strictEqual(DC.TYPES.trap.kind, 'dtrap');

// Fuzz: traps always keep 1 to 4 arrows.
for (let seed = 1; seed < 200; seed++) {
  const L = DC.nextLevel(null, 6); const G = DC.newGame(L, seed, {});
  for (let i = 0; i < 60 && !G.over; i++) {
    const ds = [0, 1, 2, 3].filter(d => DC.preview(G, d)); if (!ds.length) break; DC.move(G, ds[(seed + i) % ds.length]);
    G.grid.forEach(c => { if (c && c.kind === 'dtrap') assert(c.h.length === 4 && c.h.some(x => x), 'heads'); });
  }
}
console.log('spike trap tests passed');
