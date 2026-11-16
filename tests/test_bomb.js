const DC=require('../src/js/engine.js'); const assert=require('assert');
const L={w:3,h:3,heroHP:20,unlock:10,weights:{coin:1}};
const coin=(i)=>({uid:100+i,type:'coin',kind:'gold',v:1});
const mk=(type,v,t)=>({uid:Math.random()*1e6|0,type,kind:DC.TYPES[type].kind,v,t});
function game(){ const S=DC.newGame(L,4,{hero:'knight'}); S.grid=S.grid.map((c,i)=>i===4?null:coin(i)); return S; }
// 1. stepping on a bomb swaps places; bomb keeps its numbers; no new card spawned
let S=game(); const bomb=mk('bomb',3,4); S.grid[1]=bomb; const uidBefore=S.uid;
DC.move(S,0);
assert.strictEqual(S.hero.pos,1); assert.strictEqual(S.grid[4],bomb,'bomb moved to the hero old cell'); assert.strictEqual(bomb.v,3); assert.strictEqual(bomb.t,3,'fuse ticked once'); assert.strictEqual(S.uid,uidBefore,'nothing spawned'); console.log('swap ok');
// 2. countdown ticks each move and explodes at zero: neighbours take bomb damage; kill leaves a blank
S=game(); S.grid[0]=mk('rat',2); S.grid[2]=mk('ogre',9); S.grid[4]=mk('bomb',3,2); S.hero.pos=7; S.grid[7]=null;
// bomb at 4 (center), neighbours 1,3,5,7(hero). hero stands at 7, adjacent to bomb. put rat at 1 and ogre at 3
S.grid[1]=mk('rat',2); const ogre=mk('ogre',9); S.grid[3]=ogre;
let hp=S.hero.hp; let r=DC.move(S,3); // hero 7 -> 6 : not adjacent to center? 6 is corner, neighbours of 4 are 1,3,5,7 => hero at 6 is NOT adjacent
assert.strictEqual(S.grid[4].t,1); console.log('tick ok, fuse',S.grid[4].t);
r=DC.move(S,1); // hero 6 -> 7 (adjacent to bomb again) bomb t hits 0 -> explodes
assert(r.fx.some(f=>f.text==='BOOM')); assert.strictEqual(S.hero.hp,hp-3,'hero took bomb damage');
assert.strictEqual(S.grid[1].kind,'empty','rat killed -> blank'); assert(S.grid.includes(ogre)); assert.strictEqual(ogre.v,6,'ogre took 3'); console.log('explosion ok: blank left at 1, ogre 9->6, hero -3');
// 3. blank spaces: walking in is a free move and the usual slide still happens
S=game(); S.grid[1]={uid:555,type:'blank',kind:'empty',v:0}; hp=S.hero.hp; r=DC.move(S,0); assert.strictEqual(S.hero.hp,hp); assert.strictEqual(S.hero.pos,1); assert(S.grid[4]); console.log('blank ok');
// blanks never spawn on their own
let blanks=0; for(let g=0;g<100;g++){const G=DC.newGame({w:5,h:5,heroHP:20,unlock:1,weights:DC.BASE_WEIGHTS},g+1); G.grid.forEach(c=>{if(c&&c.kind==='empty')blanks++;});} assert.strictEqual(blanks,0);
console.log('all bomb tests passed');
