const DC=require('../src/js/engine.js'),assert=require('assert');
function mk(){const S=DC.newGame({id:1,w:3,h:3,heroHP:30,ramp:12,cap:4,weights:{coin:1}},5,{hero:'knight',powers:['ward']});S.grid=S.grid.map(()=>({uid:++S.uid,type:'coin',kind:'gold',v:1}));S.hero.pos=4;S.grid[4]=null;S.hero.hp=S.hero.max=30;S.hero.powers[0].cd=0;return S;}
const M=(S,type,v)=>({uid:++S.uid,type,kind:'monster',v});
// fire monster: no damage while shielded
let S=mk(); assert(DC.usePower(S,0)); assert.strictEqual(S.hero.ward,4);
S.grid[1]=M(S,'magmaslime',5); DC.move(S,0); assert.strictEqual(S.hero.hp,30,'fire monster blocked'); console.log('fire monster blocked');
// plain monster still hurts
S=mk(); DC.usePower(S,0); S.grid[1]=M(S,'rat',3); DC.move(S,0); assert.strictEqual(S.hero.hp,27,'plain monster hurts'); console.log('plain monster still hurts');
// ice monster blocked
S=mk(); DC.usePower(S,0); S.grid[1]=M(S,'frostwolf',4); DC.move(S,0); assert.strictEqual(S.hero.hp,30); console.log('ice monster blocked');
// wears off after 4 turns
S=mk(); DC.usePower(S,0); for(let i=0;i<4;i++){ S.grid[1]={uid:++S.uid,type:'coin',kind:'gold',v:1}; DC.move(S,0); DC.move(S,2); if(i===1) break; }
assert.strictEqual(S.hero.ward,0,'ward used up'); S.grid[S.hero.pos-3]=M(S,'magmaslime',5); const hp=S.hero.hp; DC.move(S,0); assert.strictEqual(S.hero.hp,hp-5,'unshielded again'); console.log('wears off');
// preview respects the shield and does not change it
S=mk(); DC.usePower(S,0); S.grid[1]=M(S,'imp',5); const pv=DC.preview(S,0); assert.strictEqual(pv.dHp,0); assert.strictEqual(S.hero.ward,4); console.log('preview ok');
console.log('ward tests passed');
