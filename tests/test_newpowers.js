// Magnet, Hourglass, Whetstone and Last Stand.
const assert = require('assert');
const DC = require('../src/js/engine.js');
DC.TYPES.dummy = DC.TYPES.dummy || { kind: 'monster', name: 'Dummy', lo: 1, hi: 1, bf: 0, tip: '' };
const L = { id: 1, w: 4, h: 3, heroHP: 10, ramp: 12, cap: 4, weights: { coin: 1 } };
function game(powers, ups, hero) {
  const S = DC.newGame(L, 7, { hero: hero || 'knight', powers: powers, upgrades: ups || {} });
  S.grid = S.grid.map(() => ({ uid: ++S.uid, type: 'potion', kind: 'heal', v: 1 }));
  S.hero.pos = 5; S.grid[5] = null;
  S.hero.powers.forEach(p => { p.cd = 0; });
  return S;
}
const coin = (S, v) => ({ uid: ++S.uid, type: 'coin', kind: 'gold', v: v });
const mon = (S, v) => ({ uid: ++S.uid, type: 'dummy', kind: 'monster', v: v });

// Magnet: every coin and gem on the board pays out; nothing to pull means it can't be used.
let S = game(['magnet']);
assert.strictEqual(DC.usePower(S, 0), null, 'no gold on the board');
S.grid[0] = coin(S, 3); S.grid[11] = { uid: ++S.uid, type: 'gem', kind: 'gold', v: 5 };
let r = DC.usePower(S, 0);
assert.strictEqual(S.hero.gold, 8); assert(r.fx.filter(f => f.cls === 'gold').length === 2);
assert(!S.grid.some(c => c && c.kind === 'gold' && c.v >= 3), 'they leave the board');
assert.strictEqual(S.hero.powers[0].cd, S.hero.powers[0].max, 'recharges');
S = game(['magnet'], { magnet: 2 }); S.grid[0] = coin(S, 3); DC.usePower(S, 0);
assert.strictEqual(S.hero.gold, 5, 'upgrade adds 1 per level to each coin');
S = game(['magnet'], {}, 'rogue'); S.grid[0] = coin(S, 3); DC.usePower(S, 0);
assert.strictEqual(S.hero.gold, 3, 'the Ninja no longer gets bonus gold');

// Hourglass: halves the turns left on the other powers (rounding down), not its own.
S = game(['hourglass', 'heal', 'thunder']);
assert.strictEqual(DC.usePower(S, 0), null, 'nothing recharging');
S.hero.powers[1].cd = 9; S.hero.powers[2].cd = 1;
DC.usePower(S, 0);
assert.strictEqual(S.hero.powers[1].cd, 4); assert.strictEqual(S.hero.powers[2].cd, 0);
assert.strictEqual(S.hero.powers[0].cd, S.hero.powers[0].max);
assert.strictEqual(DC.powerCd('hourglass', 2), 16, 'upgrades cut 2 turns each');

// Whetstone: +2 to the held weapon, +1 per upgrade; needs a weapon.
S = game(['whetstone']);
assert.strictEqual(DC.usePower(S, 0), null, 'nothing to sharpen');
S.hero.sword = { v: 4, type: 'sword', el: null }; DC.usePower(S, 0);
assert.strictEqual(S.hero.sword.v, 6);
S = game(['whetstone'], { whetstone: 3 }); S.hero.sword = { v: 4, type: 'sword', el: null }; DC.usePower(S, 0);
assert.strictEqual(S.hero.sword.v, 9);

// Last Stand: once per room, a killing hit leaves you at 1 (more with upgrades).
S = game(['laststand']); S.hero.hp = 3; S.grid[1] = mon(S, 9);
r = DC.move(S, 0);
assert.strictEqual(S.over, false); assert.strictEqual(S.hero.hp, 1); assert(r.stand); assert(S.hero.stood);
S.hero.pos = 5; S.grid[5] = null; S.grid[1] = mon(S, 9); DC.move(S, 0);
assert.strictEqual(S.over, true, 'only once per room');
S = game(['laststand'], { laststand: 2 }); S.hero.hp = 2; S.grid[1] = mon(S, 9); DC.move(S, 0);
assert.strictEqual(S.hero.hp, 3, 'upgraded: left at 3');
S = game(['laststand']); S.hero.hp = 9; S.grid[1] = mon(S, 3); r = DC.move(S, 0);
assert.strictEqual(S.hero.hp, 6); assert(!r.stand); assert(!S.hero.stood, 'a hit that does not kill leaves it unused');
// The preview of a killing step knows Last Stand will save you.
S = game(['laststand']); S.hero.hp = 3; S.grid[1] = mon(S, 9);
assert.strictEqual(DC.preview(S, 0).lethal, false);
// Without it, the same hit kills.
S = game([]); S.hero.hp = 3; S.grid[1] = mon(S, 9); DC.move(S, 0); assert.strictEqual(S.over, true);
