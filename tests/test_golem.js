// Golems never move: slides stop at them and a new card fills the space they leave open.
const DC = require('../src/js/engine.js'), assert = require('assert');
const L = { w: 3, h: 3, heroHP: 20, unlock: 10, weights: { coin: 1 } };
const C = (n) => ({ uid: n, type: 'coin', kind: 'gold', v: 1 });
const G = (n) => ({ uid: n, type: 'golem', kind: 'monster', v: 5 });
// Board 3x3 numbered 0..8; cards get uid = cell + 1 so we can track them.
function setup(heroPos, golems) {
  const S = DC.newGame(L, 3);
  S.grid = S.grid.map((c, i) => i === heroPos ? null : golems.includes(i) ? G(i + 1) : C(i + 1));
  S.hero.pos = heroPos; S.hero.hp = S.hero.max = 20;
  S.uid = 1000; // new cards get uids above 100, so the tests can tell them apart
  return S;
}

// No element: fire and ice both hit it normally.
assert.strictEqual(DC.TYPES.golem.el, undefined, 'golem has no element');
assert.strictEqual(DC.TYPES.golem.name, 'Golem');

// Row 0 1 2: hero at 1 steps left to 0. Normally 2 slides into 1. With a golem at 2 it stays,
// and a new card appears at 1.
let S = setup(1, [2]); DC.move(S, 3);
assert.strictEqual(S.hero.pos, 0);
assert.strictEqual(S.grid[2].uid, 3, 'golem did not move');
assert(S.grid[1] && S.grid[1].uid > 100, 'new card in the space the golem would have filled');
console.log('row: golem stays, new card in front ok');

// Column 1 4 7: hero at 4 steps up to 1. Golem at 7 stays, new card at 4.
S = setup(4, [7]); DC.move(S, 0);
assert.strictEqual(S.grid[7].uid, 8, 'golem did not move');
assert(S.grid[4].uid > 100, 'new card at 4');
console.log('column ok');

// Column 2 5 8 with golem in the middle (5): hero at 2 steps left to 1. The gap at 2 is
// bounded by the board edge and the golem; the golem stays and a new card fills 2.
S = setup(2, [5]); DC.move(S, 3);
assert.strictEqual(S.grid[5].uid, 6, 'golem did not move');
assert.strictEqual(S.grid[8].uid, 9, 'card behind the golem did not move');
assert(S.grid[2].uid > 100, 'new card at 2');
console.log('golem shields the cards behind it ok');

// Leaving a corner: hero at 0 steps right to 1. The left column shifts up into the corner,
// but a golem at 3 stops it: the new card appears at 0, right in front of it.
S = setup(0, [3]); DC.move(S, 1);
assert.strictEqual(S.grid[3].uid, 4, 'golem did not move');
assert.strictEqual(S.grid[6].uid, 7, 'card behind the golem did not move');
assert(S.grid[0].uid > 100, 'new card in the corner');
console.log('corner shift stops at a golem ok');

// Middle square: hero at 1 steps down into 4. Normally the card at 0 slides into 1 (clockwise).
// A golem at 0 stays; the normal slide refills 1 instead.
S = setup(1, [0]); DC.move(S, 2);
assert.strictEqual(S.hero.pos, 4);
assert.strictEqual(S.grid[0].uid, 1, 'golem did not move');
assert(S.grid[1] && S.grid[1].kind, 'gap refilled');
console.log('middle fill skips a golem ok');

// A frozen golem cannot be swapped: the hero bumps and stays.
S = setup(1, [0]); S.grid[0].frozen = true; DC.move(S, 3);
assert.strictEqual(S.hero.pos, 1, 'hero did not move');
assert.strictEqual(S.grid[0].type, 'golem', 'golem still there');
console.log('frozen golem bump ok');

// Killing a golem with a sword: the hero takes its place like any monster.
S = setup(1, [0]); S.hero.sword = { v: 9, type: 'sword', el: null }; DC.move(S, 3);
assert.strictEqual(S.hero.pos, 0, 'hero took its place');
console.log('golem can be killed ok');

// Arrow: row 3 4 5 with a fire arrow at 3 pointing right (h = 1), golem at 4, coin at 5.
// The golem cuts the line: it stays put, and the stretch after it (cell 5) slides on its own.
S = setup(8, [4]);
S.grid[3] = { uid: 50, type: 'firearrow', kind: 'arrow', v: 1, h: 1 };
S.grid[4].v = 9;
const coin5 = S.grid[5];
assert(DC.fireArrow(S, 3), 'fired');
assert.strictEqual(S.grid[4].type, 'golem', 'golem did not slide');
assert.strictEqual(S.grid[4].v, 8, 'golem was hit by the arrow');
assert.notStrictEqual(S.grid[5], coin5, 'the card after the golem was pushed off and replaced');
assert(S.grid[3] && S.grid[5], 'both stretches refilled');
console.log('arrow stops at a golem ok');

// Fuzz: golems never change square while alive.
for (let seed = 1; seed < 200; seed++) {
  const L2 = { w: 5, h: 5, heroHP: 30, unlock: 10, weights: Object.assign({}, DC.BASE_WEIGHTS, { golem: 20 }) };
  const S2 = DC.newGame(L2, seed, { hero: 'knight' }), rng = DC.mulberry32(seed);
  for (let t = 0; t < 120 && !S2.over; t++) {
    const before = {};
    S2.grid.forEach((c, p) => { if (c && c.type === 'golem') before[c.uid] = p; });
    DC.move(S2, Math.floor(rng() * 4));
    S2.grid.forEach((c, p) => { if (c && c.type === 'golem' && before[c.uid] != null) assert.strictEqual(p, before[c.uid], 'golem moved (seed ' + seed + ')'); });
  }
}
console.log('golem tests passed');
