const DC=require('../src/js/engine.js'),assert=require('assert');
function mk(){const L={id:1,w:3,h:3,heroHP:20,ramp:12,cap:4,weights:{coin:1}};const S=DC.newGame(L,5,{});return S;}
// place a fire trap with head east at (0,0); after rotation head points south (0,1)... heads [N,E,S,W]
function setup(el,heads){
  const S=mk(); S.grid=S.grid.map(()=>({uid:++S.uid,type:'coin',kind:'gold',v:1}));
  S.hero.pos=8; S.grid[8]=null; S.hero.hp=S.hero.max=20;
  S.grid[0]={uid:++S.uid,type:el+'trap',kind:'dtrap',v:2,h:heads};
  return S;
}
// trap at 0, head N (index0) -> after rotation E -> hits cell 1
let S=setup('fire',[1,0,0,0]);
S.grid[1]={uid:++S.uid,type:'imp',kind:'monster',v:9};
S.grid[3]={uid:++S.uid,type:'icespider',kind:'monster',v:9};
S.hero.pos=8;
let r=DC.move(S,0); // hero up
assert(r); const trap=S.grid.find(c=>c&&c.kind==='dtrap');
assert.deepStrictEqual(trap.h,[0,1,0,0],'rotated clockwise');
console.log('rotate ok');
// find trap pos & check element damage: two heads E and S hit imp(fire,immune) and icespider(ice,double)
S=setup('fire',[0,0,1,0]); // S -> rotates to W; use [0,1,0,0]-> S
S=setup('fire',[0,1,0,0]); // after rotation S: hits cell 3
S.grid[3]={uid:++S.uid,type:'icespider',kind:'monster',v:9};
let g3=S.grid[3]; DC.move(S,0);
assert.strictEqual(g3.v,5,'ice spider takes double from fire (2*2)'); 
S=setup('fire',[0,1,0,0]); S.grid[3]={uid:++S.uid,type:'imp',kind:'monster',v:9}; g3=S.grid[3]; DC.move(S,0);
assert.strictEqual(g3.v,9,'fire imp immune');
S=setup('ice',[0,1,0,0]); S.grid[3]={uid:++S.uid,type:'imp',kind:'monster',v:9}; g3=S.grid[3]; DC.move(S,0);
assert.strictEqual(g3.v,5,'imp double from ice');
S=setup('ice',[0,1,0,0]); S.grid[3]={uid:++S.uid,type:'rat',kind:'monster',v:9}; g3=S.grid[3]; DC.move(S,0);
assert.strictEqual(g3.v,7,'neutral normal');
// kill -> blank
S=setup('ice',[0,1,0,0]); S.grid[3]={uid:++S.uid,type:'imp',kind:'monster',v:4}; DC.move(S,0);
assert(S.grid.some(c=>c&&c.kind==='empty'),'blank left');
// hero hurt: trap at 6? hero ends adjacent
S=setup('fire',[1,0,0,0]); S.grid[5]=S.grid[0]; S.grid[0]={uid:++S.uid,type:'coin',kind:'gold',v:1};
S.grid[5].h=[1,0,0,0]; // rotates to E -> out of grid; use W-> head [0,0,1,0]->W hits cell 4
S.grid[5].h=[0,0,1,0]; S.hero.pos=4; S.grid[4]=null; S.grid[8]={uid:++S.uid,type:'coin',kind:'gold',v:1};
const hp0=S.hero.hp; DC.move(S,2); // hero moves down to 7; hmm
console.log('hero hp',hp0,'->',S.hero.hp);
// fuzz
for(let seed=1;seed<400;seed++){
  const L=DC.nextLevel(null,6);const S=DC.newGame(L,seed,{});
  for(let i=0;i<80&&!S.over;i++){ const ds=[0,1,2,3].filter(d=>DC.preview(S,d)); if(!ds.length)break; DC.move(S,ds[(seed+i)%ds.length]);
    S.grid.forEach(c=>{ if(c&&c.kind==='dtrap'){assert(c.h.length===4&&c.h.some(x=>x),'heads')} }); assert(S.hero.hp<=S.hero.max); }
}
console.log('dtrap tests passed');
{
 const S=mk(); S.grid=S.grid.map(()=>({uid:++S.uid,type:'coin',kind:'gold',v:1}));
 S.hero.pos=6; S.grid[6]=null; S.hero.hp=S.hero.max=20;
 S.grid[4]={uid:++S.uid,type:'icetrap',kind:'dtrap',v:3,h:[0,1,0,0]};
 DC.move(S,1); assert.strictEqual(S.hero.pos,7); assert.strictEqual(S.hero.hp,17,'hero hit for 3');
 const S2=mk(); S2.grid=S2.grid.map(()=>({uid:++S2.uid,type:'coin',kind:'gold',v:1}));
 S2.hero.pos=6; S2.grid[6]=null; S2.hero.hp=S2.hero.max=20;
 S2.grid[4]={uid:++S2.uid,type:'firetrap',kind:'dtrap',v:3,h:[0,1,0,0]};
 DC.move(S2,1); assert.strictEqual(S2.hero.hp,17);
 console.log('hero trap hits ok');
}
