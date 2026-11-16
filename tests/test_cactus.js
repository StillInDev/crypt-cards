const DC=require('../src/js/engine.js'); const assert=require('assert');
const L={w:3,h:3,heroHP:10,unlock:10,weights:{coin:1}};
const mk=(type,v)=>({uid:Math.random()*1e6|0,type,kind:DC.TYPES[type].kind,v});
function game(){ const S=DC.newGame(L,4,{hero:'cactus'}); S.grid=S.grid.map((c,i)=>i===S.hero.pos?null:mk('coin',1)); return S; }
let S=game(); assert.strictEqual(S.hero.max,11);
// above half health: no thorns. Hero at 4 steps up to 1; rat beside the new spot (cell 0).
const rat=mk('ogre',5); S.grid[0]=rat; DC.move(S,0); assert.strictEqual(rat.v,5,'no thorns above half health'); console.log('no thorns above half');
// at exactly half (max 11 -> hp<=5.5 means hp 5): monsters orthogonally adjacent take 1 each turn
S=game(); S.hero.hp=5; const o=mk('ogre',5); S.grid[0]=o; const far=mk('ogre',5); S.grid[8]=far; DC.move(S,0);
assert.strictEqual(S.hero.pos,1); assert.strictEqual(o.v,4,'adjacent ogre took 1'); assert.strictEqual(far.v,5,'far ogre untouched'); console.log('thorns hit adjacent');
// 6 hp > 5.5 so no thorns
S=game(); S.hero.hp=6; const o2=mk('ogre',5); S.grid[0]=o2; DC.move(S,0); assert.strictEqual(o2.v,5); console.log('6 of 11 is above half: no thorns');
// kills leave a blank space
S=game(); S.hero.hp=4; const r=mk('rat',1); S.grid[0]=r; DC.move(S,0); assert(!S.grid.includes(r)); assert.strictEqual(S.grid[0].kind,'empty'); console.log('thorn kill leaves blank');
// other heroes unaffected
S=DC.newGame(L,4,{hero:'knight'}); S.grid=S.grid.map((c,i)=>i===S.hero.pos?null:mk('coin',1)); S.hero.hp=3; const o3=mk('ogre',5); S.grid[0]=o3; DC.move(S,0); assert.strictEqual(o3.v,5); console.log('knight has no thorns');
console.log('cactus tests passed');
