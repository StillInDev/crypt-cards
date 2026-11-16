// Wind blade and Blade of pain: they grow while lying on the board, and stop once picked up.
const DC=require('../src/js/engine.js'),assert=require('assert');
// 3x3 of coins, hero in the middle (cell 4). Cactus: no sword bonus, so picked-up power is exact.
function mk(){const S=DC.newGame({id:1,w:3,h:3,heroHP:30,ramp:30,cap:4,weights:{coin:1}},5,{hero:'cactus'});S.grid=S.grid.map(()=>({uid:++S.uid,type:'coin',kind:'gold',v:1}));S.hero.pos=4;S.grid[4]=null;S.hero.hp=S.hero.max=30;return S;}
const B=(S,type,v)=>({uid:++S.uid,type,kind:'weapon',v});
const trap=(S,v)=>({uid:++S.uid,type:'trap',kind:'harm',v});
const at=(S,c)=>S.grid.indexOf(c);

// Wind blade below the hero: stepping up slides that column, so the blade moves and grows.
let S=mk(), w=B(S,'windblade',3); S.grid[7]=w; DC.move(S,0);
assert.notStrictEqual(at(S,w),7,'it slid'); assert.strictEqual(w.v,4,'wind +1 when it slides');
// A wind blade that does not move does not grow.
S=mk(); w=B(S,'windblade',3); S.grid[3]=w; DC.move(S,0);
assert.strictEqual(at(S,w),3,'stayed put'); assert.strictEqual(w.v,3,'no slide, no gain');
// It keeps growing turn after turn while it keeps sliding.
S=mk(); w=B(S,'windblade',3); S.grid[7]=w; let slides=0;
for(let n=0;n<6;n++){ const p=at(S,w); if(p<0)break; DC.move(S,n%2?2:0); if(at(S,w)>=0&&at(S,w)!==p) slides++; }
if(at(S,w)>=0) assert.strictEqual(w.v,3+slides,'one power per slide');
console.log('wind blade grows when it slides');

// Blade of pain: grows by 1 for each hit the hero takes.
S=mk(); let pn=B(S,'painblade',3); S.grid[3]=pn; S.grid[1]=trap(S,2); DC.move(S,0);
assert.strictEqual(S.hero.hp,28,'hero hurt'); assert.strictEqual(pn.v,4,'pain +1 when hero hurt');
// No damage, no growth.
S=mk(); pn=B(S,'painblade',3); S.grid[3]=pn; DC.move(S,0); assert.strictEqual(pn.v,3,'no damage, no gain');
// Poison ticks count as hits too.
S=mk(); pn=B(S,'painblade',3); S.grid[3]=pn; S.hero.poison=3; DC.move(S,0); assert.strictEqual(pn.v,4,'poison tick +1');
console.log('blade of pain grows when you are hurt');

// Picked up: a plain sword. No more growth from sliding, moving or damage.
S=mk(); S.grid[1]=B(S,'windblade',5); DC.move(S,0);
assert.deepStrictEqual(S.hero.sword,{v:5,type:'windblade',el:null}); for(let n=0;n<4;n++) DC.move(S,n%2?0:2);
assert.strictEqual(S.hero.sword.v,5,'held wind blade does not grow');
S=mk(); S.grid[1]=B(S,'painblade',5); DC.move(S,0); S.grid[S.hero.pos+3]=trap(S,2); DC.move(S,2);
assert(S.hero.hp<30,'hurt'); assert.strictEqual(S.hero.sword.v,5,'held blade of pain does not grow');
// Knight's sword bonus still applies when picked up.
S=DC.newGame({id:1,w:3,h:3,heroHP:30,ramp:30,cap:4,weights:{coin:1}},5,{hero:'knight'}); S.grid=S.grid.map(()=>({uid:++S.uid,type:'coin',kind:'gold',v:1})); S.hero.pos=4; S.grid[4]=null;
S.grid[1]=B(S,'painblade',5); DC.move(S,0); assert.strictEqual(S.hero.sword.v,6,'knight +1');
console.log('picked-up blades stop growing');

// Previews never change the real blades.
S=mk(); w=B(S,'windblade',3); pn=B(S,'painblade',3); S.grid[7]=w; S.grid[3]=pn; S.grid[1]=trap(S,2);
DC.preview(S,0); assert.strictEqual(w.v,3); assert.strictEqual(pn.v,3);
// A power's refill slides wind blades too (fire touch burns a card, the line refills).
S=DC.newGame({id:1,w:3,h:3,heroHP:30,ramp:30,cap:4,weights:{coin:1}},5,{hero:'cactus',powers:['fire']}); S.grid=S.grid.map(()=>({uid:++S.uid,type:'coin',kind:'gold',v:1})); S.hero.pos=4; S.grid[4]=null; S.hero.powers[0].cd=0;
w=B(S,'windblade',3); S.grid[2]=w; const p0=2; DC.usePower(S,0,1);
if(at(S,w)!==p0) assert.strictEqual(w.v,4,'refill slide counts'); else assert.strictEqual(w.v,3);
// Both kinds spawn from level odds.
const seen={}; for(let sd=1;sd<60;sd++){ const G=DC.newGame(DC.nextLevel(null,4),sd,{}); G.grid.forEach(c=>{ if(c&&DC.TYPES[c.type].grows) seen[c.type]=1; }); }
assert(seen.windblade&&seen.painblade,'both appear: '+Object.keys(seen));
console.log('blade tests passed');
