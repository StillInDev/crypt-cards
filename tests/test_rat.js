const DC=require('../src/js/engine.js'),assert=require('assert');
// 3x3 of coins (new cards are coins too), hero in the centre (cell 4).
function mk(){const S=DC.newGame({id:1,w:3,h:3,heroHP:60,ramp:12,cap:4,weights:{coin:1}},7,{powers:[]});S.grid=S.grid.map(()=>({uid:++S.uid,type:'coin',kind:'gold',v:1}));S.hero.pos=4;S.grid[4]=null;return S;}
const rat=(S,v)=>({uid:++S.uid,type:'rat',kind:'monster',v:v,t:0});
const rats=S=>S.grid.filter(c=>c&&c.type==='rat');

// Column 1 bounces up and down (4 <-> 1); the rat in corner 0 never moves.
let S=mk(); let r=rat(S,2); S.grid[0]=r;
DC.move(S,0); // hero 4 -> 1: the rat's starting square is noted
DC.move(S,2); DC.move(S,0); // still for 2 turns: no rat yet
assert.strictEqual(rats(S).length,1,'no breeding before 3 still turns');
DC.move(S,2); // hero 1 -> 4: 3rd still turn, breeds into 1 or 3 (both neighbours, neither is the hero)
assert.strictEqual(rats(S).length,2,'breeds after 3 still turns');
const kid=rats(S).find(c=>c!==r); const kp=S.grid.indexOf(kid);
assert(kp===1||kp===3,'into a neighbouring square'); assert.strictEqual(kid.v,2,'same strength'); assert.strictEqual(r.t,0,'count resets');
console.log('ok rat breeds after 3 still turns');

// Never into the hero's square: hero sits at 1, so the only choice is 3.
for(let seed=0;seed<20;seed++){
  S=mk(); S.rng=(()=>{let s=seed+1;return()=>((s=(s*9301+49297)%233280)/233280);})();
  r=rat(S,3); S.grid[0]=r; DC.move(S,0); DC.move(S,2); DC.move(S,0); assert.strictEqual(S.hero.pos,1);
  S.hero.sword={v:2,type:'sword',el:null}; DC.sellItem(S,'sword'); // a turn spent standing still at 1
  assert.strictEqual(S.hero.pos,1);
  assert.strictEqual(S.grid[3].type,'rat'); assert.strictEqual(S.grid[1],null);
}
console.log('ok never breeds onto the hero');

// Not into the room's reward, and not over another rat: boxed in, it waits.
S=mk(); r=rat(S,2); S.grid[0]=r; S.grid[3]={uid:++S.uid,type:'coin',kind:'reward',v:0};
DC.move(S,0); DC.move(S,2); DC.move(S,0); DC.move(S,2); // hero ends at 4; neighbours of 0 are 1 (coin) and 3 (reward)
assert.strictEqual(S.grid[3].kind,'reward'); assert.strictEqual(S.grid[1].type,'rat');
console.log('ok skips the reward');

// A rat that slides resets its count.
S=mk(); r=rat(S,1); S.grid[7]=r; r.rp=7; r.t=2; // one turn from breeding, below the hero
DC.move(S,0); // hero 4 -> 1: the column slides up, the rat goes 7 -> 4
assert.strictEqual(S.grid[4],r); assert.strictEqual(r.t,0,'count restarts'); assert.strictEqual(rats(S).length,1,'no breeding on the move');
console.log('ok moving resets the count');

// Previews never breed.
S=mk(); r=rat(S,2); S.grid[0]=r; r.rp=0; r.t=2; DC.preview(S,0); assert.strictEqual(rats(S).length,1); assert.strictEqual(r.t,2);
console.log('rat tests passed');
