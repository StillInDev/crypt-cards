const DC=require('../src/js/engine.js'),assert=require('assert');
function mk(){const L={id:1,w:3,h:3,heroHP:20,ramp:12,cap:4,weights:{coin:1}};const S=DC.newGame(L,5,{});return S;}
// place a spike trap with head east at (0,0); after rotation head points south (0,1)... heads [N,E,S,W]
function setup(el,heads){
  const S=mk(); S.grid=S.grid.map(()=>({uid:++S.uid,type:'coin',kind:'gold',v:1}));
  S.hero.pos=8; S.grid[8]=null; S.hero.hp=S.hero.max=20;
  S.grid[0]={uid:++S.uid,type:el+'trap',kind:'dtrap',v:2,h:heads};
  return S;
}
// trap at 0, head N (index0) -> after rotation E -> hits cell 1
let S=setup('',[1,0,0,0]);
S.grid[1]={uid:++S.uid,type:'rat',kind:'monster',v:9};
S.hero.pos=8;
let r=DC.move(S,0); // hero up
assert(r); const trap=S.grid.find(c=>c&&c.kind==='dtrap');
assert.deepStrictEqual(trap.h,[0,1,0,0],'rotated clockwise');
console.log('rotate ok');
// a spike trap has no element: every monster takes its number, fire and ice ones too
let g3;
for(const t of ['rat','imp','icespider']){
  S=setup('',[0,1,0,0]); S.grid[3]={uid:++S.uid,type:t,kind:'monster',v:9}; g3=S.grid[3]; DC.move(S,0);
  assert.strictEqual(g3.v,7,t+' takes 2 from the spikes');
}
// kill -> blank
S=setup('',[0,1,0,0]); S.grid[3]={uid:++S.uid,type:'rat',kind:'monster',v:2}; DC.move(S,0);
assert(S.grid.some(c=>c&&c.kind==='empty'),'blank left');
// hero hurt: trap at 6? hero ends adjacent
S=setup('',[1,0,0,0]); S.grid[5]=S.grid[0]; S.grid[0]={uid:++S.uid,type:'coin',kind:'gold',v:1};
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
 S.grid[4]={uid:++S.uid,type:'trap',kind:'dtrap',v:3,h:[0,1,0,0]};
 DC.move(S,1); assert.strictEqual(S.hero.pos,7); assert.strictEqual(S.hero.hp,17,'hero hit for 3');
 const S2=mk(); S2.grid=S2.grid.map(()=>({uid:++S2.uid,type:'coin',kind:'gold',v:1}));
 S2.hero.pos=6; S2.grid[6]=null; S2.hero.hp=S2.hero.max=20;
 S2.grid[4]={uid:++S2.uid,type:'trap',kind:'dtrap',v:3,h:[0,1,0,0]};
 DC.move(S2,1); assert.strictEqual(S2.hero.hp,17);
 console.log('hero trap hits ok');
}

// Shield blocks fire and ice monsters only: spike trap arrows still stab.
{
 const S=mk(); S.grid=S.grid.map(()=>({uid:++S.uid,type:'coin',kind:'gold',v:1}));
 S.hero.pos=6; S.grid[6]=null; S.hero.hp=S.hero.max=20; S.hero.ward=3;
 S.grid[4]={uid:++S.uid,type:'trap',kind:'dtrap',v:3,h:[0,1,0,0]};
 DC.move(S,1); assert.strictEqual(S.hero.hp,17,'shield does not stop spikes');
 assert(!DC.TYPES.firetrap&&!DC.TYPES.icetrap,'elemental traps removed'); assert.strictEqual(DC.TYPES.trap.kind,'dtrap');
 console.log('spike trap is the only trap');
}
