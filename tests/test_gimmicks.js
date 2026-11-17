// Every monster has its own trick (or, for the weak ones, a weakness).
const DC = require('../src/js/engine.js'), assert = require('assert');
// 3x3 board of 1-gold coins, hero in the middle (cell 4).
function mk(powers) {
  const S = DC.newGame({ id: 1, w: 3, h: 3, heroHP: 30, ramp: 12, cap: 4, weights: { coin: 1 } }, 9, { hero: 'knight', powers: powers || [] });
  S.grid = S.grid.map(() => ({ uid: ++S.uid, type: 'coin', kind: 'gold', v: 1 }));
  S.hero.pos = 4; S.grid[4] = null; S.hero.hp = S.hero.max = 30;
  return S;
}
const M = (S, type, v) => ({ uid: ++S.uid, type, kind: 'monster', v, mx: v, t: 0 });
const C = (S, type, kind, v) => ({ uid: ++S.uid, type, kind, v });
const SW = (v, type) => ({ v, type: type || 'sword', el: (type && DC.TYPES[type].el) || null });
const UP = 0, RIGHT = 1, DOWN = 2, LEFT = 3;
const said = (r, text) => r.fx.some(f => f.text === text);

// Every monster's tip is about itself only: no generic "deals damage equal to its number".
for (const k in DC.TYPES) {
  const T = DC.TYPES[k];
  if (T.kind !== 'monster') continue;
  assert(T.tip && !/Deals damage equal to its number/.test(T.tip) && !/^An? (fire|ice) monster/.test(T.tip), 'generic tip on ' + k);
}
console.log('tips are monster-specific');

let S, m, hp, r;
// bat: any hit kills it
S = mk(); m = M(S, 'bat', 4); S.grid[1] = m; S.hero.sword = SW(1); DC.move(S, UP);
assert.strictEqual(S.hero.pos, 1, 'a 1-power hit kills a bat');
// slime: hit but alive, it slips away into a neighbouring square
S = mk(); m = M(S, 'slime', 5); S.grid[1] = m; S.hero.sword = SW(2); DC.move(S, UP);
assert.strictEqual(m.v, 3); assert.notStrictEqual(S.grid[1], m, 'slid away'); assert([0, 2].includes(S.grid.indexOf(m)));
// skeleton: weapons hit double, and only spend half
S = mk(); m = M(S, 'skeleton', 6); S.grid[1] = m; S.hero.sword = SW(3); DC.move(S, UP);
assert.strictEqual(S.hero.pos, 1, '3 power kills a 6 skeleton'); assert.strictEqual(S.hero.sword, null);
S = mk(); m = M(S, 'skeleton', 3); S.grid[1] = m; S.hero.sword = SW(4); DC.move(S, UP);
assert.strictEqual(S.hero.sword.v, 2, 'spent 2 power for 3 health');
// ogre: 1 extra wear
S = mk(); m = M(S, 'ogre', 9); S.grid[1] = m; S.hero.sword = SW(5); DC.move(S, UP);
assert.strictEqual(m.v, 4); assert.strictEqual(S.hero.sword, null, '5 spent + 1 extra');
// cave spider and ice spider: squishy underfoot
for (const t of ['spider', 'icespider']) {
  S = mk(); m = M(S, t, 4); S.grid[1] = m; hp = S.hero.hp; DC.move(S, UP);
  assert.strictEqual(S.hero.hp, hp - 1, t + ' squished');
}
// goblin: loots a third of its health (rounded up) from a coin or gem next to it...
S = mk(); m = M(S, 'goblin', 6); S.grid[0] = m; S.grid[1] = C(S, 'gem', 'gold', 5); S.grid[3] = C(S, 'potion', 'heal', 2);
r = DC.move(S, RIGHT); assert(said(r, '−2G'), 'looted 2'); assert(r.fx.some(f => f.anim === 'loot'), 'loot animation');
// ...unless you hit it in the last 2 turns
S = mk(); m = M(S, 'goblin', 6); m.hitT = 0; S.grid[0] = m; S.grid[1] = C(S, 'gem', 'gold', 5); S.grid[3] = C(S, 'potion', 'heal', 2);
r = DC.move(S, RIGHT); assert(!said(r, '−2G'), 'lying low after being hit');
// gargoyle: stone skin ignores small hits
S = mk(); m = M(S, 'gargoyle', 6); S.grid[1] = m; S.hero.sword = SW(2); DC.move(S, UP);
assert.strictEqual(m.v, 6, 'a 2 hit does nothing');
S.hero.sword = SW(3); DC.move(S, UP); assert.strictEqual(m.v, 3, 'a 3 hit lands');
// ghost: solid, it can be hit (and poisons you); next turn it fades and you pass through
S = mk(); m = M(S, 'ghost', 4); S.grid[1] = m; S.hero.sword = SW(2); DC.move(S, UP);
assert.strictEqual(m.v, 2); assert(S.hero.poison >= 1, 'poisoned by hitting it'); assert.strictEqual(m.ph, 1, 'now faded');
DC.move(S, UP); assert.strictEqual(S.hero.pos, 1, 'passed through'); assert.strictEqual(S.grid[4], m); assert.strictEqual(m.v, 2);
// scorpion: stings when hit up close
S = mk(); m = M(S, 'scorpion', 3); S.grid[1] = m; S.hero.sword = SW(9); hp = S.hero.hp; DC.move(S, UP);
assert.strictEqual(S.hero.hp, hp - 1, 'stung even as it died');
// minotaur: boss. A hit that does not kill breaks the weapon; one on the board at most; stampedes
S = mk(); m = M(S, 'minotaur', 20); S.grid[1] = m; S.hero.sword = SW(4); DC.move(S, UP);
assert.strictEqual(m.v, 16); assert.strictEqual(S.hero.sword, null, 'gored');
assert(DC.TYPES.minotaur.lo >= 15 && DC.TYPES.minotaur.boss);
for (let sd = 1; sd < 40; sd++) {
  const G = DC.newGame({ id: 1, w: 4, h: 4, heroHP: 60, weights: { minotaur: 5, coin: 1 } }, sd, {});
  for (let i = 0; i < 30 && !G.over; i++) {
    assert(G.grid.filter(c => c && c.type === 'minotaur').length <= 1, 'one minotaur at a time');
    DC.move(G, i % 4);
  }
}
S = mk(); m = M(S, 'minotaur', 20); S.grid[0] = m; m.t = DC.PERIOD.stampede - 1; r = DC.move(S, DOWN);
assert(said(r, 'Stampede'));
// mummy: leaves a chest when cut down
S = mk(); m = M(S, 'mummy', 4); S.grid[1] = m; S.hero.sword = SW(9); DC.move(S, UP);
assert.strictEqual(S.hero.pos, 4, 'hero stays'); assert.strictEqual(S.grid[1].kind, 'chest');
// magma slime: splits into one half as strong as it started
S = mk(); m = M(S, 'magmaslime', 6); S.grid[1] = m; S.hero.sword = SW(9); DC.move(S, UP);
assert.strictEqual(S.grid[1], m); assert.strictEqual(m.v, 3); DC.move(S, UP); assert.strictEqual(m.v, 1, 'splits again');
// salamander: hurt but alive, it escapes and leaves a 1-health tail
S = mk(); m = M(S, 'salamander', 6); S.grid[1] = m; S.hero.sword = SW(2); DC.move(S, UP);
assert.strictEqual(S.grid[1].type, 'tail'); assert.strictEqual(S.grid[1].v, 1); assert.strictEqual(S.hero.pos, 4);
assert(!S.grid.some(c => c && c.type === 'salamander'), 'gone from the board');
// beetle: the first hit only cracks the shell
{ const G = DC.newGame({ id: 1, w: 3, h: 3, heroHP: 30, weights: { beetle: 1 } }, 3, {}); assert(G.grid.every(c => !c || c.sh), 'every beetle shelled'); }
// wolf pack, frost wolves included
S = mk(); const w1 = M(S, 'wolf', 2), w2 = M(S, 'frostwolf', 5); S.grid[1] = w1; S.grid[8] = w2; S.hero.sword = SW(9); DC.move(S, UP);
assert.strictEqual(w2.v, 7);
assert.strictEqual(DC.TYPES.frostwolf.el, 'ice', 'frost wolf: ice resistant, weak to fire');
// cultist pact: neighbours grow when it dies
S = mk(); const cu = M(S, 'cultist', 2), nb = M(S, 'bat', 3); S.grid[1] = cu; S.grid[0] = nb; S.hero.sword = SW(9); DC.move(S, UP);
assert.strictEqual(nb.v, 5);
// troll grows whenever another monster dies
S = mk(); m = M(S, 'troll', 5); S.grid[0] = m; S.grid[1] = M(S, 'bat', 2); S.hero.sword = SW(9); DC.move(S, UP);
assert.strictEqual(m.v, 6);
// frost wisp melts
S = mk(); m = M(S, 'frostwisp', 2); S.grid[0] = m; DC.move(S, RIGHT); assert.strictEqual(m.v, 1);
// wraith: when it dies, no monster can be hurt until the end of your next turn
S = mk(); const wr = M(S, 'wraith', 1), bt = M(S, 'bat', 3); S.grid[1] = wr; S.grid[0] = bt; S.hero.sword = SW(9); DC.move(S, UP);
assert.strictEqual(S.hero.pos, 1);
r = DC.move(S, LEFT); assert(S.grid.includes(bt), 'bat untouched while the last breath lasts'); assert(said(r, 'Resisted'));
DC.move(S, LEFT); assert(!S.grid.includes(bt), 'then it can be hit again');
// vampire grows 2 every time you are hurt
S = mk(); const vp = M(S, 'vampire', 4); S.grid[0] = vp; S.grid[1] = M(S, 'bat', 2); DC.move(S, UP);
assert.strictEqual(vp.v, 6);
// banshee halves the recharge
S = mk(['heal']); S.grid[0] = M(S, 'banshee', 9); S.hero.powers[0].cd = 4;
DC.move(S, DOWN); DC.move(S, UP); assert.strictEqual(S.hero.powers[0].cd, 3, 'two turns, one tick');
// spore shroom: loses 2 every time it slides to a new square
S = mk(); m = M(S, 'shroom', 5); m.sp = 1; S.grid[1] = m; DC.move(S, DOWN);
assert.strictEqual(S.grid.indexOf(m), 4); assert.strictEqual(m.v, 3);
// lich: turns a random non-skeleton card next to it into a skeleton
function ready(S, p) { S.grid[p].t = DC.PERIOD[DC.TYPES[S.grid[p].type].ability] - 1; }
S = mk(); S.grid[0] = M(S, 'lich', 5); S.grid[1] = M(S, 'skeleton', 3); ready(S, 0); DC.move(S, RIGHT);
assert.strictEqual(S.grid.filter(c => c && c.type === 'skeleton').length, 2, 'the coin became a skeleton, not the skeleton');
// harpy: swoops onto a coin anywhere, leaving its old square empty; does not grow; stays put with no coins
S = mk(); const hy = M(S, 'harpy', 3); S.grid[0] = hy; ready(S, 0); r = DC.move(S, DOWN);
assert(said(r, 'Swoop')); assert.strictEqual(hy.v, 3, 'no growth'); assert(r.fx.some(f => f.anim === 'loot'));
S = mk(); S.grid = S.grid.map((c, p) => p === 4 ? null : C(S, 'potion', 'heal', 1)); const hy2 = M(S, 'harpy', 3); S.grid[0] = hy2; ready(S, 0);
r = DC.move(S, RIGHT); assert(!said(r, 'Swoop')); assert.strictEqual(S.grid[0], hy2, 'no coins: stays');
// fire imp: its square glows. You on it: +3 health (and cap) until you leave; a card on it: +3 while there
S = mk(); m = M(S, 'imp', 2); S.grid[1] = m; S.hero.sword = SW(9); hp = S.hero.hp; DC.move(S, UP);
assert.strictEqual(S.hero.pos, 1); assert.strictEqual(S.glow.cell, 1); assert.strictEqual(S.hero.hp, hp + 3); assert.strictEqual(S.hero.max, 33);
DC.move(S, DOWN); assert.strictEqual(S.hero.hp, hp, 'left the glow, lost the boost'); assert.strictEqual(S.hero.max, 30);
assert.strictEqual(S.grid[1].v, 4, 'the coin that slid onto the glow is worth 3 more');
const coin = S.grid[1]; DC.move(S, UP); assert(S.hero.gold >= 4, 'picked up on the glow: keeps the bonus');
console.log('gimmicks ok');

// Fuzz: every monster in the mix, all weapons, never a hole in the board.
const W = {}; for (const k in DC.TYPES) if (!DC.TYPES[k].hidden) W[k] = 1;
for (let sd = 1; sd < 300; sd++) {
  const G = DC.newGame({ id: 1, w: 4, h: 4, heroHP: 40, ramp: 8, cap: 8, shieldP: .3, weights: W }, sd, { hero: 'cactus', powers: ['dart', 'fire'] });
  const rng = DC.mulberry32(sd);
  for (let i = 0; i < 150 && !G.over; i++) {
    const r0 = rng();
    if (r0 < 0.1) DC.usePower(G, 0); else if (r0 < 0.15) DC.usePower(G, 1, Math.floor(rng() * 16));
    else DC.move(G, Math.floor(rng() * 4));
    DC.preview(G, Math.floor(rng() * 4));
    assert(G.grid.every((c, p) => p === G.hero.pos ? c == null : c != null), 'hole (seed ' + sd + ')');
    assert(G.grid.every(c => !c || c.kind !== 'monster' || c.v >= 0), 'negative monster');
    assert(G.hero.hp <= G.hero.max, 'health over the cap');
  }
}
console.log('gimmick tests passed');
