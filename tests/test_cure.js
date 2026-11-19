// Any healing cures poison: potions, the healing powers, the Bard's song and the Vampire's lifesteal.
const assert = require('assert');
const DC = require('../src/js/engine.js');
DC.TYPES.dummy = DC.TYPES.dummy || { kind: 'monster', name: 'Dummy', lo: 1, hi: 1, bf: 0, tip: '' };
function game(hero, powers) {
  const S = DC.newGame({ id: 1, w: 4, h: 3, heroHP: 10, ramp: 12, cap: 4, weights: { coin: 1 } }, 7, { hero: hero, powers: powers || [] });
  S.grid = S.grid.map(function () { return { uid: ++S.uid, type: 'coin', kind: 'gold', v: 1 }; });
  S.hero.pos = 5; S.grid[5] = null;
  S.hero.powers.forEach(function (p) { p.cd = 0; });
  return S;
}
const pot = (S, v) => ({ uid: ++S.uid, type: 'potion', kind: 'heal', v: v });
const mon = (S, v) => ({ uid: ++S.uid, type: 'dummy', kind: 'monster', v: v });
const cured = r => r.fx.some(f => f.text === 'Cured');

// A potion cures, even at full health.
let S = game('knight'); S.hero.poison = 4; S.hero.hp = 5; S.grid[1] = pot(S, 2);
let r = DC.move(S, 0);
assert.strictEqual(S.hero.poison, 0, 'potion cures'); assert.strictEqual(S.hero.hp, 7, 'no poison tick after the cure'); assert(cured(r));
S = game('knight'); S.hero.poison = 3; S.grid[1] = pot(S, 2); DC.move(S, 0);
assert.strictEqual(S.hero.poison, 0, 'potion cures at full health too');

// Healing and Mass healing.
['heal', 'massheal'].forEach(function (id) {
  S = game('knight', [id]); S.hero.poison = 3; S.hero.hp = 4;
  r = DC.usePower(S, 0);
  assert.strictEqual(S.hero.poison, 0, id + ' cures'); assert(cured(r), id + ' shows Cured');
});

// Bard: the song heals at the end of every unhurt turn (poison ticks don't count as hurt), so it cures.
S = game('bard'); S.hero.hp = 5; S.hero.poison = 9;
DC.move(S, 0); assert.strictEqual(S.hero.poison, 0, 'song cures');
// At his cap the poison still ticks first, then the end-of-turn song heals it back and cures.
S = game('bard'); S.hero.hp = DC.healCap(S.hero); S.hero.poison = 9;
DC.move(S, 0); assert.strictEqual(S.hero.poison, 0, 'tick, then the song cures'); assert.strictEqual(S.hero.hp, DC.healCap(S.hero));

// Vampire: lifesteal cures when it heals.
S = game('count'); S.hero.hp = 3; S.hero.poison = 5; S.hero.sword = { v: 20, type: 'sword', el: null };
S.grid[1] = mon(S, 6); DC.move(S, 0);
assert.strictEqual(S.hero.poison, 0, 'lifesteal cures');

// Not healing does not cure.
S = game('knight'); S.hero.poison = 3; DC.move(S, 0);
assert.strictEqual(S.hero.poison, 2, 'a plain step only ticks the poison');
