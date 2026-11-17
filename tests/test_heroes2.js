// Bard, Dragonborn, Vampire and Barbarian passives.
const assert = require('assert');
const DC = require('../src/js/engine.js');
// Every real monster now has a trick (skeletons are brittle, bats frail...), so tests use a plain one.
DC.TYPES.dummy = { kind: 'monster', name: 'Dummy', lo: 1, hi: 1, bf: 0, tip: '' };
function game(hero, lv) {
  const S = DC.newGame({ id: 1, w: 4, h: 3, heroHP: 10, ramp: 12, cap: 4, weights: { coin: 1 } }, 7, { hero: hero, heroLevel: lv || 0, powers: [] });
  S.grid = S.grid.map(function () { return { uid: ++S.uid, type: 'coin', kind: 'gold', v: 1 }; });
  S.hero.pos = 5; S.grid[5] = null;
  return S;
}
const mon = (S, v) => ({ uid: ++S.uid, type: 'dummy', kind: 'monster', v: v });
const pot = (S, v) => ({ uid: ++S.uid, type: 'potion', kind: 'heal', v: v });

// Bard: heals 1 every 3 turns, and healing can go over max by 3 + upgrades.
let S = game('bard', 1);
assert.strictEqual(DC.overheal(1), 4);
S.hero.hp = S.hero.max - 2;
DC.move(S, 0); DC.move(S, 2); assert.strictEqual(S.hero.hp, S.hero.max - 2, 'nothing for 2 turns');
DC.move(S, 0); assert.strictEqual(S.hero.hp, S.hero.max - 1, 'heals 1 on the 3rd turn');
S.grid[S.hero.pos === 1 ? 5 : 1] = pot(S, 20); DC.move(S, S.hero.pos === 1 ? 2 : 0);
assert.strictEqual(S.hero.hp, S.hero.max + 4, 'potion overheals up to max + 4');
// Other heroes stop at max.
S = game('knight'); S.hero.hp = S.hero.max - 1; S.grid[1] = pot(S, 20); DC.move(S, 0);
assert.strictEqual(S.hero.hp, S.hero.max);

// Dragonborn: 1-health monsters are stomped for free, weapon untouched.
S = game('dragonkin'); S.hero.sword = { v: 5, type: 'sword', el: null };
let hp = S.hero.hp; S.grid[1] = mon(S, 1); DC.move(S, 0);
assert.strictEqual(S.hero.hp, hp); assert.strictEqual(S.hero.sword.v, 5); assert.strictEqual(S.hero.pos, 1);
S = game('dragonkin'); hp = S.hero.hp; S.grid[1] = mon(S, 1); DC.move(S, 0);
assert.strictEqual(S.hero.hp, hp, 'bare-handed too');
S = game('dragonkin'); hp = S.hero.hp; S.grid[1] = mon(S, 2); DC.move(S, 0);
assert.strictEqual(S.hero.hp, hp - 2, 'a 2-health monster still hurts');

// Vampire: 1 health per 3 weapon damage, remainder carries over.
S = game('count'); S.hero.hp = 2; S.hero.sword = { v: 20, type: 'sword', el: null };
const t = mon(S, 7); S.grid[1] = t; DC.move(S, 0);
assert.strictEqual(S.hero.hp, 4, '7 damage heals 2'); assert.strictEqual(S.hero.drain, 1, 'remainder kept');
S.grid[S.hero.pos === 1 ? 5 : 1] = mon(S, 2); DC.move(S, S.hero.pos === 1 ? 2 : 0);
assert.strictEqual(S.hero.hp, 5, '1 + 2 more heals 1');

// Barbarian: crits only at a quarter health or less; a crit doubles damage but costs the same.
let crits = 0, wear = 0;
for (let seed = 0; seed < 300; seed++) {
  S = DC.newGame({ id: 1, w: 4, h: 3, heroHP: 10, ramp: 12, cap: 4, weights: { coin: 1 } }, seed, { hero: 'barbarian', powers: [] });
  S.grid = S.grid.map(() => ({ uid: ++S.uid, type: 'coin', kind: 'gold', v: 1 })); S.hero.pos = 5; S.grid[5] = null;
  S.hero.hp = Math.floor(S.hero.max / 4); S.hero.sword = { v: 5, type: 'sword', el: null };
  const m = mon(S, 9); S.grid[1] = m; DC.move(S, 0);
  if (m.v === 0) crits++; else assert.strictEqual(m.v, 4);
  if (S.hero.sword) wear++; // a 5-blade breaks on 9 either way: same durability
}
assert(crits > 70 && crits < 130, 'about 1 in 3 crit: ' + crits);
assert.strictEqual(wear, 0);
S = game('barbarian'); S.hero.sword = { v: 5, type: 'sword', el: null };
for (let i = 0; i < 30; i++) { const m = mon(S, 9); S.grid[1] = m; S.hero.pos = 5; S.grid[5] = null; S.hero.sword = { v: 5, type: 'sword', el: null }; DC.move(S, 0); assert.strictEqual(m.v, 4, 'no crit at high health'); }
// A crit kill of a small monster wears the sword by what it would have dealt anyway.
S = game('barbarian'); S.hero.hp = 1; let seen = false;
for (let i = 0; i < 40 && !seen; i++) {
  S.hero.hp = 1; S.hero.pos = 5; S.grid[5] = null; S.hero.sword = { v: 5, type: 'sword', el: null };
  const m = mon(S, 8); S.grid[1] = m; const r = DC.move(S, 0);
  if (r.fx.some(f => f.text === 'Crit!')) { seen = true; assert.strictEqual(m.v, 0); assert.strictEqual(S.hero.sword, null, 'blade of 5 spends all 5'); }
}
assert(seen, 'saw a crit');
