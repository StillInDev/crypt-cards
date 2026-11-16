const DC=require('../src/js/engine.js'),assert=require('assert');
const kindCount=(S,k)=>S.grid.filter(c=>c&&c.kind===k).length;
// A room that only spawns weapons and rats: weapons never fill more than half the board.
for(const [w,h] of [[3,3],[4,4],[5,5]]){
  const max=Math.floor(w*h/2);
  for(let seed=1;seed<=40;seed++){
    const S=DC.newGame({id:1,w,h,heroHP:60,ramp:30,cap:4,weights:{sword:20,gemblade:5,rat:1}},seed,{hero:'knight'});
    assert(kindCount(S,'weapon')<=max,'start '+w+'x'+h+' seed '+seed+': '+kindCount(S,'weapon'));
    for(let n=0;n<60&&!S.over;n++){ DC.move(S,n%4); assert(kindCount(S,'weapon')<=max,'turn '+n+' '+w+'x'+h+': '+kindCount(S,'weapon')); }
  }
}
console.log('weapons capped at half the board');
// Same for potions and coins.
for(const t of ['potion','coin']){
  for(let seed=1;seed<=30;seed++){
    const S=DC.newGame({id:1,w:3,h:3,heroHP:60,ramp:30,cap:4,weights:{[t]:30,rat:1}},seed,{hero:'knight'});
    for(let n=0;n<40&&!S.over;n++){ DC.move(S,n%4); assert(kindCount(S,DC.TYPES[t].kind)<=4,t+' over cap'); }
  }
}
console.log('potions and coins capped');
// Monsters are not capped: an all-monster room still fills with monsters.
{ const S=DC.newGame({id:1,w:3,h:3,heroHP:60,ramp:30,cap:4,weights:{rat:1}},4,{}); assert.strictEqual(kindCount(S,'monster'),8); console.log('monsters not capped'); }
// If every possible card is capped, the board still fills (cap is ignored rather than leaving holes).
{ const S=DC.newGame({id:1,w:3,h:3,heroHP:60,ramp:30,cap:4,weights:{coin:1}},4,{}); assert.strictEqual(S.grid.filter(Boolean).length,8); console.log('falls back when everything is capped'); }
// Jewel blades: 1-3 jewels, all one colour.
let seenG=0,seenB=0;
for(let seed=1;seed<=200;seed++){
  const S=DC.newGame({id:1,w:3,h:3,heroHP:60,ramp:30,cap:4,weights:{gemblade:1,rat:3}},seed,{});
  for(const c of S.grid){ if(!c||c.type!=='gemblade')continue;
    const j=c.g.filter(Boolean); assert(j.length>=1&&j.length<=3,'jewel count'); assert(j.every(x=>x===j[0]),'mixed jewels '+c.g);
    if(j[0]==='g')seenG++; else seenB++; }
}
assert(seenG>20&&seenB>20,'both colours appear '+seenG+'/'+seenB);
console.log('jewel blades are single-colour ('+seenG+' green, '+seenB+' blue)');
// A blue blade grows only when you move; a green one only when hurt.
function mk(g){const S=DC.newGame({id:1,w:3,h:3,heroHP:30,ramp:30,cap:4,weights:{coin:1}},5,{hero:'cactus'});S.grid=S.grid.map(()=>({uid:++S.uid,type:'coin',kind:'gold',v:1}));S.hero.pos=4;S.grid[4]=null;S.hero.sword={v:5,type:'gemblade',el:null,g:g};return S;}
let S=mk(['b','b',null]); DC.move(S,0); assert.strictEqual(S.hero.sword.v,7,'blue +2 on move');
S=mk(['g','g',null]); DC.move(S,0); assert.strictEqual(S.hero.sword.v,5,'green: no gain on a plain move');
S=mk(['g','g',null]); S.grid[1]={uid:500,type:'trap',kind:'harm',v:2}; DC.move(S,0); assert.strictEqual(S.hero.sword.v,7,'green +2 when hurt');
console.log('cap and jewel tests passed');
