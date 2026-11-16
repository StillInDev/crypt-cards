const DC=require('../src/js/engine.js'),assert=require('assert');
const kindCount=(S,k)=>S.grid.filter(c=>c&&c.kind===k).length;
// A room that only spawns weapons and rats: weapons never fill more than half the board.
for(const [w,h] of [[3,3],[4,4],[5,5]]){
  const max=Math.floor(w*h/2);
  for(let seed=1;seed<=40;seed++){
    const S=DC.newGame({id:1,w,h,heroHP:60,ramp:30,cap:4,weights:{sword:20,windblade:3,painblade:3,rat:1}},seed,{hero:'knight'});
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
console.log('cap tests passed');
