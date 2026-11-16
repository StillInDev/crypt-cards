const DC=require('../src/js/engine.js'),assert=require('assert');
function mk(){const S=DC.newGame({id:1,w:3,h:3,heroHP:20,ramp:12,cap:4,weights:{coin:1}},3,{});S.grid=S.grid.map((_,i)=>({uid:++S.uid,type:'coin',kind:'gold',v:1,tag:i}));return S;}
// hero at corner 0 moves right: cards 3 and 6 shift up, new card at 6
let S=mk(); S.hero.pos=0; S.grid[0]=null; const c3=S.grid[3],c6=S.grid[6],c1=S.grid[1];
let r=DC.move(S,1); assert.strictEqual(S.hero.pos,1);
assert(S.grid[0]===c3&&S.grid[3]===c6,'two behind shifted'); assert(S.grid[6]&&S.grid[6]!==c6&&S.grid[6].tag===undefined,'new card in far corner');
assert(r.spawned.some(s=>s.cell===6)); console.log('right from top-left ok');
// hero at corner 8 moves up: cards 7 and 6 shift right, new card at 6
S=mk(); S.hero.pos=8; S.grid[8]=null; const c7=S.grid[7],c6b=S.grid[6]; DC.move(S,0);
assert.strictEqual(S.hero.pos,5); assert(S.grid[8]===c7&&S.grid[7]===c6b&&S.grid[6].tag===undefined); console.log('up from bottom-right ok');
// non-corner unchanged: middle moves left like before
S=mk(); S.hero.pos=4; S.grid[4]=null; const c5=S.grid[5]; DC.move(S,3); assert(S.grid[4]===c5,'old slide still works'); console.log('non-corner unchanged');
console.log('corner tests passed');
