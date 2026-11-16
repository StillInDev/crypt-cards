const DC=require('../src/js/engine.js'),assert=require('assert');
// 3x3 of coins, hero in the centre (cell 4), a viper of 3 above (cell 1).
function mk(hero){const S=DC.newGame({id:1,w:3,h:3,heroHP:30,ramp:12,cap:4,weights:{coin:1}},5,{hero:hero||'knight',powers:['ice']});S.grid=S.grid.map(()=>({uid:++S.uid,type:'coin',kind:'gold',v:1}));S.hero.pos=4;S.grid[4]=null;S.grid[1]={uid:++S.uid,type:'snake',kind:'monster',v:3};return S;}

// Bare-handed: lose 3, then poisoned for 3 turns. Like a Poison card, the first tick lands the same turn.
let S=mk(); const hp0=S.hero.hp; DC.move(S,0);
assert.strictEqual(S.hero.hp,hp0-3-1,'bite + first poison tick'); assert.strictEqual(S.hero.poison,2,'venom');
DC.move(S,2); DC.move(S,0); assert.strictEqual(S.hero.hp,hp0-3-3,'3 poison ticks in all'); assert.strictEqual(S.hero.poison,0);
console.log('ok viper bite poisons');

// With a sword you hit it instead: no bite, no poison.
S=mk(); S.hero.sword={v:9,type:'sword',el:null}; DC.move(S,0); assert.strictEqual(S.hero.poison,0);
console.log('ok sword avoids venom');

// Frost (monsters deal no damage) also stops the venom.
S=mk(); S.hero.powers[0].cd=0; DC.usePower(S,0); DC.move(S,0); assert.strictEqual(S.hero.poison,0);
console.log('ok frost stops venom');

// Other monsters do not poison.
S=mk(); S.grid[1]={uid:++S.uid,type:'bat',kind:'monster',v:3}; DC.move(S,0); assert.strictEqual(S.hero.poison,0);
console.log('snake tests passed');
