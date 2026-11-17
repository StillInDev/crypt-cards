const DC=require('../src/js/engine.js'),assert=require('assert');
// 4x3 of coins (new cards are coins too), hero at cell 5. An even width means no middle square,
// so the clockwise middle refill never moves the test's rats.
function mk(){const S=DC.newGame({id:1,w:4,h:3,heroHP:60,ramp:12,cap:4,weights:{coin:1}},7,{powers:[]});S.grid=S.grid.map(()=>({uid:++S.uid,type:'coin',kind:'gold',v:1}));S.hero.pos=5;S.grid[5]=null;return S;}
const rat=(S,v)=>({uid:++S.uid,type:'rat',kind:'monster',v:v,t:0});
const rats=S=>S.grid.filter(c=>c&&c.type==='rat');

// Column 1 bounces up and down (5 <-> 1); the rat in corner 0 never moves.
let S=mk(); let r=rat(S,2); S.grid[0]=r;
DC.move(S,0); // hero 5 -> 1: the rat's starting square is noted
DC.move(S,2); DC.move(S,0); // still for 2 turns: no rat yet
assert.strictEqual(rats(S).length,1,'no breeding before 3 still turns');
DC.move(S,2); // hero 1 -> 5: 3rd still turn, bites 1 or 4 (coins of 1, so they die and become rats)
assert.strictEqual(rats(S).length,2,'breeds after 3 still turns');
const kid=rats(S).find(c=>c!==r); const kp=S.grid.indexOf(kid);
assert(kp===1||kp===4,'into a neighbouring square'); assert.strictEqual(kid.v,2,'same strength'); assert.strictEqual(r.t,0,'count resets');
console.log('ok rat breeds after 3 still turns');

// Never into the hero's square: hero sits at 1, so the only choice is 4.
for(let seed=0;seed<20;seed++){
  S=mk(); S.rng=(()=>{let s=seed+1;return()=>((s=(s*9301+49297)%233280)/233280);})();
  r=rat(S,3); S.grid[0]=r; DC.move(S,0); DC.move(S,2); DC.move(S,0); assert.strictEqual(S.hero.pos,1);
  S.hero.sword={v:2,type:'sword',el:null}; DC.sellItem(S,'sword'); // a turn spent standing still at 1
  assert.strictEqual(S.hero.pos,1);
  assert.strictEqual(S.grid[4].type,'rat'); assert.strictEqual(S.grid[1],null);
}
console.log('ok never breeds onto the hero');

// Not into the room's reward, and not over another rat: boxed in, it waits.
S=mk(); r=rat(S,2); S.grid[0]=r; S.grid[4]={uid:++S.uid,type:'coin',kind:'reward',v:0};
DC.move(S,0); DC.move(S,2); DC.move(S,0); DC.move(S,2); // hero ends at 5; neighbours of 0 are 1 (coin) and 4 (reward)
assert.strictEqual(S.grid[4].kind,'reward'); assert.strictEqual(r.t,0,'struck square 1 (the only target)');
console.log('ok skips the reward');

// A rat that slides resets its count.
S=mk(); r=rat(S,1); S.grid[9]=r; r.rp=9; r.t=2; // one turn from breeding, below the hero
DC.move(S,0); // hero 5 -> 1: the column slides up, the rat goes 9 -> 5
assert.strictEqual(S.grid[5],r); assert.strictEqual(r.t,0,'count restarts'); assert.strictEqual(rats(S).length,1,'no breeding on the move');
console.log('ok moving resets the count');

// Previews never breed.
S=mk(); r=rat(S,2); S.grid[0]=r; r.rp=0; r.t=2; DC.preview(S,0); assert.strictEqual(rats(S).length,1); assert.strictEqual(r.t,2);

// A target that survives the bite just loses health; nothing new appears.
// Rat at 0 ready to strike; its only free neighbour (1) is a big coin, 4 is the reward.
function ready(v,c){const S=mk(); const r=rat(S,v); S.grid[0]=r; r.rp=0; r.t=2; S.grid[4]={uid:++S.uid,type:'coin',kind:'reward',v:0}; S.grid[1]=c(S); S.hero.pos=5; S.hero.sword={v:2,type:'sword',el:null}; DC.sellItem(S,'sword'); return S;}
S=ready(2,S=>({uid:++S.uid,type:'coin',kind:'gold',v:5}));
assert.strictEqual(S.grid[1].type,'coin'); assert.strictEqual(S.grid[1].v,3,'gold loses the rat\'s number'); assert.strictEqual(rats(S).length,1);
console.log('ok bites gold');
S=ready(3,S=>({uid:++S.uid,type:'trap',kind:'harm',v:2}));
assert.strictEqual(S.grid[1].type,'rat'); assert.strictEqual(S.grid[1].v,3,'destroyed trap becomes a rat as strong');
console.log('ok destroys a trap and takes its square');
S=ready(2,S=>({uid:++S.uid,type:'skeleton',kind:'monster',v:6}));
assert.strictEqual(S.grid[1].type,'skeleton'); assert.strictEqual(S.grid[1].v,4,'monster takes the rat\'s number');
console.log('ok bites a monster');
S=ready(4,S=>({uid:++S.uid,type:'bat',kind:'monster',v:4}));
assert.strictEqual(S.grid[1].type,'rat'); assert.strictEqual(S.grid[1].v,4);
console.log('ok kills a monster and replaces it');
S=ready(2,S=>({uid:++S.uid,type:'blank',kind:'empty',v:0}));
assert.strictEqual(S.grid[1].type,'rat'); assert.strictEqual(S.grid[1].v,2);
console.log('ok takes over an empty square');
S=ready(2,S=>({uid:++S.uid,type:'potion',kind:'heal',v:3}));
assert.strictEqual(S.grid[1].type,'potion'); assert.strictEqual(S.grid[1].v,1,'bites potions too');
S=ready(2,S=>({uid:++S.uid,type:'sword',kind:'weapon',v:2}));
assert.strictEqual(S.grid[1].type,'rat'); assert.strictEqual(S.grid[1].v,2,'destroys weapons too');
console.log('ok bites every kind of card');

// Rats bite other rats. Rat at 0 (ready), another rat at 1 that has only just arrived.
S=ready(3,S=>({uid:++S.uid,type:'rat',kind:'monster',v:5,t:0}));
assert.strictEqual(S.grid[1].type,'rat'); assert.strictEqual(S.grid[1].v,2,'rat loses 3');
S=ready(3,S=>({uid:++S.uid,type:'rat',kind:'monster',v:2,t:0}));
assert.strictEqual(S.grid[1].type,'rat'); assert.strictEqual(S.grid[1].v,3,'killed rat becomes a rat as strong as the biter');
console.log('ok bites other rats');

// Two rats pick the same square: only the bigger bite lands.
// Rats at 0 and 2, both ready; 3, 4 and 6 are rewards, so both must bite 1.
S=mk(); S.hero.pos=5;
const ra=rat(S,2), rb=rat(S,3); ra.rp=0; ra.t=2; rb.rp=2; rb.t=2; S.grid[0]=ra; S.grid[2]=rb;
for(const q of [3,4,6]) S.grid[q]={uid:++S.uid,type:'coin',kind:'reward',v:0};
S.grid[1]={uid:++S.uid,type:'skeleton',kind:'monster',v:10};
S.hero.sword={v:2,type:'sword',el:null}; DC.sellItem(S,'sword');
assert.strictEqual(S.grid[1].v,7,'only the bite of 3 lands, not 2+3');
console.log('ok only the biggest bite lands');
console.log('rat tests passed');
