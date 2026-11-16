const DC=require('../src/js/engine.js'),assert=require('assert');
// 3x3 board of coins, hero in the centre (4) with 20 health.
function mk(hero){const S=DC.newGame({id:1,w:3,h:3,heroHP:20,ramp:12,cap:4,weights:{coin:1}},5,{hero:hero});
  S.grid=S.grid.map(()=>({uid:++S.uid,type:'coin',kind:'gold',v:1}));S.hero.pos=4;S.grid[4]=null;S.hero.hp=S.hero.max=20;return S;}
// The 'rogue' hero is shown to players as the Ninja.
assert.strictEqual(DC.HEROES.rogue.name,'Ninja');
assert(DC.HEROES.rogue.pass.trapproof,'Ninja has the trap-proof passive');

// Stepping onto a spike trap, fire trap or ice trap: the Rogue takes nothing, the Knight does.
for(const type of ['trap','firetrap','icetrap']){
  const card=(S)=>type==='trap'?{uid:++S.uid,type:'trap',kind:'harm',v:4}:{uid:++S.uid,type:type,kind:'dtrap',v:4,h:[0,0,0,0]};
  let S=mk('rogue'); S.grid[1]=card(S); DC.move(S,0); assert.strictEqual(S.hero.pos,1); assert.strictEqual(S.hero.hp,20,'rogue unhurt by '+type);
  S=mk('knight'); S.grid[1]=card(S); DC.move(S,0); assert.strictEqual(S.hero.hp,16,'knight hurt by '+type);
}

// A trap head turning onto the hero's square: trap at 0 points north, turns east, hits cell 1 where the hero lands.
for(const el of ['fire','ice']){
  let S=mk('rogue'); S.grid[0]={uid:++S.uid,type:el+'trap',kind:'dtrap',v:3,h:[1,0,0,0]};
  DC.move(S,0); assert.strictEqual(S.hero.pos,1); assert.strictEqual(S.hero.hp,20,'rogue unhurt by '+el+' trap head');
  S=mk('knight'); S.grid[0]={uid:++S.uid,type:el+'trap',kind:'dtrap',v:3,h:[1,0,0,0]};
  DC.move(S,0); assert.strictEqual(S.hero.hp,17,'knight hurt by '+el+' trap head');
}

// Not a trap: poison still works on the Rogue, and monsters still hurt.
let S=mk('rogue'); S.grid[1]={uid:++S.uid,type:'poison',kind:'harm',v:3}; DC.move(S,0); assert.strictEqual(S.hero.poison,2,'poisoned (one turn already ticked)');
S=mk('rogue'); S.grid[1]={uid:++S.uid,type:'rat',kind:'monster',v:3}; DC.move(S,0); assert.strictEqual(S.hero.hp,17,'rats still bite');

// Preview agrees: no damage predicted for the Rogue stepping on a trap.
S=mk('rogue'); S.grid[1]={uid:++S.uid,type:'trap',kind:'harm',v:4}; assert.strictEqual(DC.preview(S,0).dHp,0);
console.log('rogue tests passed');
