// Weapons start a run weaker (top of the range 3 lower, bottom 1 lower) and ease back as turns pass.
const DC = require('../src/js/engine.js'), assert = require('assert');
const L = { w: 5, h: 5, heroHP: 10, ramp: 30, cap: 6, weights: { sword: 1 } };
function swords(turn) {
  const S = DC.newGame(L, 7), vals = [];
  S.hero.turn = turn;
  for (let k = 0; k < 400; k++) vals.push(DC.makeCard(S, 'sword').v);
  return vals;
}
const early = swords(0);
assert(Math.min.apply(null, early) >= 3 && Math.max.apply(null, early) <= 5, 'early swords are 3 to 5: ' + Math.min.apply(null, early) + '-' + Math.max.apply(null, early));
const mid = swords(45);
assert(Math.min.apply(null, mid) === 3 && Math.max.apply(null, mid) === 7, 'turn 45: 3 to 7 (penalty 2, bump 1)');
const late = swords(120);
assert(Math.min.apply(null, late) === 4 && Math.max.apply(null, late) === 12, 'turn 120: the early penalty is gone');
console.log('ok early weapons');
