const DC=require('../src/js/engine.js'); const assert=require('assert');
const L={w:3,h:3,heroHP:10,unlock:10,weights:{coin:1}};
const C=(n)=>({uid:n,type:'coin',kind:'gold',v:n});
function setup(heroPos){ const S=DC.newGame(L,3); S.grid=S.grid.map((c,i)=>i===heroPos?null:C(i+1)); S.hero.pos=heroPos; return S; }
// your example: row 1 2 3, hero at 2 goes to 1 -> 3 slides to 2, new card at 3
let S=setup(1); DC.move(S,3);
assert.strictEqual(S.hero.pos,0); assert.strictEqual(S.grid[1].uid,3,'card 3 slid to 2'); assert(S.grid[2]&&S.grid[2].uid>100||S.grid[2].uid!==3,'new card at 3'); console.log('row example ok');
// middle row 4 5 6, hero at 5 -> 4 : 6 slides to 5, new at 6
S=setup(4); DC.move(S,3); assert.strictEqual(S.grid[4].uid,6); assert(S.grid[5].uid!==6); console.log('middle row ok');
// moving right from 2 to 3: nothing behind but cell 1 stays, new card appears at 1
S=setup(1); DC.move(S,1); assert.strictEqual(S.grid[0]&&S.grid[0].uid!==1,true,'new at far edge'); console.log('right ok');
// vertical: column 2,5,8 hero at 5 moves up to 2: 8 slides to 5, new at 8
S=setup(4); DC.move(S,0); assert.strictEqual(S.grid[4].uid,8); assert(S.grid[7].uid!==8); console.log('column ok');
// new cards only ever appear on the edge
// (No rats here: breeding rats can pack a whole line, and a wand or arrow that clears all of it
// legitimately refills squares inside the board. No golems either: new cards appear in front of them.
// Rat breeding and golems have their own tests.)
const L2={w:5,h:5,heroHP:20,unlock:10,weights:Object.assign({},DC.BASE_WEIGHTS,{rat:0,golem:0})};
let bad=0,tot=0;
for(let g=0;g<200;g++){ const S=DC.newGame(L2,g+1,{hero:'knight'}); const rng=DC.mulberry32(g); let t=0; while(!S.over&&t<200){ const r=DC.move(S,Math.floor(rng()*4)); if(r&&!r.fx.some(f=>f.text==='BOOM')&&!(r.attack&&(r.attack.beam||r.attack.sweep))){ /* multi-kill turns can leave two gaps in a line */ for(const sp of r.spawned){ const x=sp.cell%5,y=(sp.cell/5)|0; tot++; if(!(x===0||x===4||y===0||y===4)) bad++; } } t++; } }
console.log('spawned',tot,'not on edge',bad); assert.strictEqual(bad,0);
