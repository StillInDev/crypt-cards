const DC=require('../src/js/engine.js'),assert=require('assert');
function mk(extra){const S=DC.newGame(Object.assign({id:1,w:3,h:3,heroHP:30,ramp:12,cap:4,weights:{coin:1}},extra||{}),5,{});S.grid=S.grid.map(()=>({uid:++S.uid,type:'coin',kind:'gold',v:1}));S.hero.pos=4;S.grid[4]=null;return S;}
const M=(S,t,v)=>({uid:++S.uid,type:t,kind:DC.TYPES[t].kind,v});
// --- arrow in row 1 pointing right (h=1): cells 3,4,5. Hero at 3 is in the line and slides to 4
let S=mk(); S.hero.pos=3; S.grid[3]=null; const ar={uid:++S.uid,type:'firearrow',kind:'arrow',v:3,h:1}; S.grid[4]=ar; const o5=M(S,'ogre',9); S.grid[5]=o5;
let r=DC.fireArrow(S,4); assert(r,'fired'); assert.strictEqual(S.hero.pos,4,'hero in the line slid right');
assert(S.grid.every((c,p)=>p===S.hero.pos?c==null:c),'board full'); assert(!S.grid.includes(ar)); assert(!S.grid.includes(o5),'pushed off the edge');
// monsters in the line are hit and move along; hero outside the line stays
S=mk(); S.hero.pos=0; S.grid[0]=null; S.grid[3]={uid:++S.uid,type:'firearrow',kind:'arrow',v:3,h:1}; const o4=M(S,'ogre',9),o5b=M(S,'ogre',9); S.grid[4]=o4; S.grid[5]=o5b;
DC.fireArrow(S,3); assert.strictEqual(S.hero.pos,0,'hero outside the line stays'); assert.strictEqual(S.grid[5],o4,'slid along'); assert.strictEqual(o4.v,6,'hit for 3');
console.log('arrow row slide ok');
// hero not in the line does not move
S=mk(); S.hero.pos=0; S.grid[0]=null; const a2={uid:++S.uid,type:'icearrow',kind:'arrow',v:2,h:1}; S.grid[7]=a2; S.grid[6]=M(S,'ogre',9); S.grid[8]=M(S,'frostwolf',9);
DC.fireArrow(S,7); assert.strictEqual(S.hero.pos,0,'hero unmoved'); const f=S.grid.filter(c=>c&&c.type==='ogre'); assert(f.length===1&&f[0].v===7&&f[0].frozen,'ice hits and freezes'); const fw=S.grid.filter(c=>c&&c.type==='frostwolf'); assert(!fw.length||fw[0].v===9,'ice monster immune');
// vertical arrow pointing up (h=0) in column 1: line goes 7,4,1 order
S=mk(); S.hero.pos=0; S.grid[0]=null; S.grid[4]={uid:++S.uid,type:'firearrow',kind:'arrow',v:2,h:0}; S.grid[1]=M(S,'ogre',9); DC.fireArrow(S,4); assert.strictEqual(S.hero.pos,0);
// arrows rotate each turn
S=mk(); S.grid[1]={uid:++S.uid,type:'firearrow',kind:'arrow',v:2,h:0}; const hh=S.grid[1]; DC.move(S,3); const where=S.grid.findIndex(c=>c===hh); assert(where>=0&&hh.h===1,'rotated clockwise');
// walking into an arrow fires it in place
S=mk(); S.grid[5]={uid:++S.uid,type:'icearrow',kind:'arrow',v:2,h:1}; r=DC.move(S,1); assert(r&&!r.moved,'stays'); 
console.log('arrow tests ok');
// --- spider
S=mk(); S.grid[1]=M(S,'webspider',8); S.hero.sword={v:3,type:'sword',el:null}; let hp=S.hero.hp; DC.move(S,0); assert.strictEqual(S.hero.hp,hp,'no damage with weapon'); assert.strictEqual(S.hero.pos,1);
S=mk(); S.grid[1]=M(S,'webspider',8); hp=S.hero.hp; DC.move(S,0); assert.strictEqual(S.hero.hp,hp-8,'bare-handed it bites');
console.log('spider ok');
// --- ninja star
const star=(v,c)=>({v,type:'ninjastar',el:null,bow:true,star:true,c});
S=mk(); S.hero.pos=0; S.grid[0]=null; S.hero.sword=star(4,5); const t1=M(S,'ogre',9),t2=M(S,'ogre',9),off=M(S,'ogre',9); S.grid[2]=t1; S.grid[1]=t2; S.grid[4]=off;
assert.strictEqual(DC.shootBow(S,4),null,'off-line refused'); DC.shootBow(S,2); assert.strictEqual(t1.v,5); assert.strictEqual(t2.v,9,'no chain'); assert.strictEqual(S.hero.sword.c,4);
console.log('star ok');
// --- shields absorb the first hit, then normal
S=mk({shieldP:1}); S.hero.sword={v:3,type:'sword',el:null}; let sm=M(S,'ogre',5); sm.sh=1; S.grid[1]=sm; DC.move(S,0); assert.strictEqual(S.grid[1],sm); assert.strictEqual(sm.v,5); assert(!sm.sh); assert.strictEqual(S.hero.sword.v,3,'absorbed hit costs no power'); DC.move(S,0); assert(sm.v<5);
// shield applies to arrows too
S=mk(); S.hero.pos=0; S.grid[0]=null; let sm2=M(S,'ogre',5); sm2.sh=1; S.grid[1]=sm2; S.grid[4]={uid:++S.uid,type:'firearrow',kind:'arrow',v:3,h:1}; S.grid[3]=null; DC.fireArrow(S,4);
console.log('shield ok');
// shield chance only deep
assert.strictEqual(DC.nextLevel(null,3).shieldP,0); assert(DC.nextLevel(null,9).shieldP>0);
let cnt=0,tot=0; for(let sd=1;sd<40;sd++){const G=DC.newGame(Object.assign(DC.nextLevel(null,12),{}),sd,{}); G.grid.forEach(c=>{if(c&&c.kind==='monster'){tot++; if(c.sh)cnt++;}});} assert(cnt>0&&cnt<tot,'some shielded deep: '+cnt+'/'+tot);
// (growing blades are covered in test_blades.js)
// fuzz with all new types in the mix
const W={}; for(const k in DC.TYPES) W[k]=1;
let n=0; for(let sd=1;sd<400;sd++){const G=DC.newGame({id:1,w:4,h:4,heroHP:40,ramp:8,cap:8,shieldP:.4,weights:W},sd,{hero:'cactus'}); for(let i=0;i<120&&!G.over;i++){const R=Math.random(); const r0=Math.random();
 const bows=G.hero.sword&&G.hero.sword.bow; const arr=G.grid.findIndex(c=>c&&c.kind==='arrow'); const mon=G.grid.findIndex(c=>c&&c.kind==='monster'&&!c.frozen);
 if(arr>=0&&r0<.25) DC.fireArrow(G,arr); else if(bows&&mon>=0&&r0<.6) DC.shootBow(G,mon); else DC.move(G,Math.floor(Math.random()*4)); n++; DC.preview(G,Math.floor(Math.random()*4));
 assert(G.grid.length===16); assert(G.grid.every((c,p)=>p===G.hero.pos?c==null:c!=null||G.over),'hole');} }
console.log('fuzz ok',n); console.log('new tests passed');
