// Lightning Wizard: 8 kills charge a smite, every 4th attack chains lightning to the target's neighbours.
const assert = require('assert');
const DC = require('../src/js/engine.js');
// 4x3 board of coins (even width: no middle-square refill). Hero at 5; 1 is above it, 0 and 2 beside 1.
function game(lv, hero) {
  const S = DC.newGame({ id: 1, w: 4, h: 3, heroHP: 60, ramp: 12, cap: 4, weights: { coin: 1 } }, 7, { hero: hero || 'stormmage', heroLevel: lv || 0, powers: [] });
  S.grid = S.grid.map(function () { return { uid: ++S.uid, type: 'coin', kind: 'gold', v: 1 }; });
  S.hero.pos = 5; S.grid[5] = null;
  return S;
}
function mon(S, v) { return { uid: ++S.uid, type: 'skeleton', kind: 'monster', v: v }; }
function reset(S) { S.grid[S.hero.pos] = { uid: ++S.uid, type: 'coin', kind: 'gold', v: 1 }; S.hero.pos = 5; S.grid[5] = null; }

let S = game();
S.hero.sword = { v: 50, type: 'sword', el: null };
for (let i = 0; i < 8; i++) { S.grid[1] = mon(S, 1); DC.move(S, 0); reset(S); }
assert.strictEqual(S.hero.kills, 8, 'eight kills charge the smite');
// Smite: a huge monster dies outright, the sword is not worn down.
const big = mon(S, 40); S.grid[1] = big; const sw = S.hero.sword.v;
let r = DC.move(S, 0);
assert.strictEqual(S.hero.pos, 1, 'smite kills, hero steps in');
assert.strictEqual(S.hero.sword.v, sw, 'smite does not wear the sword');
assert.strictEqual(S.hero.kills, 0, 'smite uses the charge');
assert(r.fx.some(function (f) { return f.text === 'Smite'; }), 'smite fx');

// Chain lightning on the 4th attack hits the monsters next to the target for 1 + the level shown.
S = game(2);
S.hero.sword = { v: 1, type: 'sword', el: null };
S.hero.hits = 3;
const tgt = mon(S, 5), left = mon(S, 9), right = mon(S, 3);
S.grid[1] = tgt; S.grid[0] = left; S.grid[2] = right;
DC.move(S, 0);
assert.strictEqual(DC.chainDamage(2), 4, 'Lvl. 3: 1 + 3'); assert.strictEqual(DC.chainDamage(0), 2, 'Lvl. 1: 1 + 1');
assert.strictEqual(tgt.v, 4, 'target takes the sword hit only');
assert.strictEqual(left.v, 5, 'neighbour zapped for 4');
assert(S.grid.indexOf(right) < 0, 'weaker neighbour killed by the chain');
assert.strictEqual(S.hero.hits, 0, 'chain count resets');

// Attacks 1-3 do not chain.
S = game(); S.hero.sword = { v: 1, type: 'sword', el: null };
const a = mon(S, 5), b = mon(S, 9); S.grid[1] = a; S.grid[0] = b;
DC.move(S, 0);
assert.strictEqual(b.v, 9); assert.strictEqual(S.hero.hits, 1); assert.strictEqual(S.hero.kills, 0);

// Bare-handed kills count too.
S = game(); S.grid[1] = mon(S, 2); DC.move(S, 0);
assert.strictEqual(S.hero.kills, 1); assert.strictEqual(S.hero.hits, 1);
// Other heroes never charge.
S = game(0, 'knight'); S.grid[1] = mon(S, 2); DC.move(S, 0);
assert.strictEqual(S.hero.kills, 0);
