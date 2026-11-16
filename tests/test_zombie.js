const DC=require('../src/js/engine.js'),assert=require('assert');
// 3x3 of coins, hero in the centre (cell 4), a zombie above (cell 1).
function mk(powers){const S=DC.newGame({id:1,w:3,h:3,heroHP:30,ramp:12,cap:4,weights:{coin:1}},6,{hero:'knight',powers:powers||[]});S.grid=S.grid.map(()=>({uid:++S.uid,type:'coin',kind:'gold',v:1}));S.hero.pos=4;S.grid[4]=null;S.grid[1]={uid:++S.uid,type:'zombie',kind:'monster',v:4};return S;}

// Killed with a sword: it becomes a tomb in place and the hero does not move in.
let S=mk(); const z=S.grid[1]; S.hero.sword={v:9,type:'sword',el:null};
let r=DC.move(S,0);
assert.strictEqual(S.grid[1],z,'same card stays'); assert.strictEqual(z.type,'tomb'); assert.strictEqual(S.hero.pos,4,'hero stays put'); assert(!r.moved);
console.log('ok zombie leaves a tomb');

// Bare-handed: bump, turn spent, nothing breaks, no damage.
S.hero.sword=null; const hp=S.hero.hp, t0=S.hero.turn;
r=DC.move(S,0); assert.strictEqual(S.grid[1].type,'tomb'); assert.strictEqual(S.hero.pos,4); assert.strictEqual(S.hero.hp,hp,'no damage'); assert.strictEqual(S.hero.turn,t0+1,'turn spent');
console.log('ok bare-handed bumps');

// Any damage shatters it: a sword of 1 breaks it and the hero steps in.
S.hero.sword={v:1,type:'sword',el:null}; DC.move(S,0); assert.strictEqual(S.hero.pos,1); assert.notStrictEqual(z,S.grid[1]);
console.log('ok sword shatters tomb');

// A weak hit that does not kill a zombie leaves a zombie, not a tomb.
S=mk(); S.hero.sword={v:2,type:'sword',el:null}; DC.move(S,0); assert.strictEqual(S.grid[1].type,'zombie'); assert.strictEqual(S.grid[1].v,2);
console.log('ok wounded zombie stays a zombie');

// Only weapons make tombs: Thunder (3 to every monster) kills a zombie of 3 outright.
S=mk(['thunder']); S.grid[1].v=3; S.hero.powers[0].cd=0; DC.usePower(S,0); assert(!S.grid[1]||S.grid[1].type!=='tomb','power kill leaves no tomb');
console.log('ok power kill leaves no tomb');
// ...but a power still shatters a tomb a weapon made.
S=mk(['thunder']); S.hero.sword={v:9,type:'sword',el:null}; DC.move(S,0); assert.strictEqual(S.grid[1].type,'tomb');
S.hero.powers[0].cd=0; DC.usePower(S,0); assert(!S.grid[1]||S.grid[1].type!=='tomb','thunder shatters tomb');
console.log('ok power shatters tomb');

// Stepped on bare-handed: the zombie is gone and the hero takes its place. No tomb.
S=mk(); r=DC.move(S,0); assert.strictEqual(S.hero.pos,1); assert(!S.grid.some(c=>c&&c.type==='tomb'));
console.log('ok stepping on a zombie leaves no tomb');

// Other weapons make tombs too: a scythe sweep.
S=mk(); S.hero.sword={v:9,type:'scythe',el:null,sweep:true}; DC.move(S,0); assert.strictEqual(S.grid[1].type,'tomb');
console.log('ok scythe makes a tomb');

// An ice sword makes a tomb but never freezes it.
S=mk(); S.hero.sword={v:9,type:'icesword',el:'ice'}; DC.move(S,0); assert.strictEqual(S.grid[1].type,'tomb'); assert(!S.grid[1].frozen);
console.log('zombie tests passed');
