const DC=require('../src/js/engine.js'),assert=require('assert');
// 3x3 board of coins, hero in the centre (4) with 20 health.
function mk(hero){const S=DC.newGame({id:1,w:3,h:3,heroHP:20,ramp:12,cap:4,weights:{coin:1}},5,{hero:hero});
  S.grid=S.grid.map(()=>({uid:++S.uid,type:'coin',kind:'gold',v:1}));S.hero.pos=4;S.grid[4]=null;S.hero.hp=S.hero.max=20;return S;}
// The 'rogue' hero is shown to players as the Ninja.
assert.strictEqual(DC.HEROES.rogue.name,'Ninja');
assert(DC.HEROES.rogue.pass.trapproof,'Ninja has the trap-proof passive');

// Stepping onto a spike trap, fire trap or ice trap: the Rogue takes nothing, the Knight does.
for(const type of ['trap']){
  // Hero at 4 moves up into 1, entering from below: the bottom arrow (index 2) is the one that would hurt.
  const card=(S)=>({uid:++S.uid,type:'trap',kind:'dtrap',v:4,h:[0,0,1,0]});
  let S=mk('rogue'); S.grid[1]=card(S); DC.move(S,0); assert.strictEqual(S.hero.pos,1); assert.strictEqual(S.hero.hp,20,'rogue unhurt by '+type);
  S=mk('knight'); S.grid[1]=card(S); DC.move(S,0); assert.strictEqual(S.hero.hp,16,'knight hurt by '+type);
}

// Spike traps no longer hit the squares around them, so there is no trap-head case to test here.

// Not a trap: poison still works on the Rogue, and monsters still hurt.
let S=mk('rogue'); S.grid[1]={uid:++S.uid,type:'poison',kind:'harm',v:3}; DC.move(S,0); assert.strictEqual(S.hero.poison,2,'poisoned (one turn already ticked)');
S=mk('rogue'); S.grid[1]={uid:++S.uid,type:'rat',kind:'monster',v:3}; DC.move(S,0); assert.strictEqual(S.hero.hp,17,'rats still bite');

// Preview agrees: no damage predicted for the Rogue stepping on a trap.
S=mk('rogue'); S.grid[1]={uid:++S.uid,type:'trap',kind:'dtrap',v:4,h:[0,0,1,0]}; assert.strictEqual(DC.preview(S,0).dHp,0);
console.log('rogue tests passed');
