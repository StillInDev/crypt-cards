const DC=require('../src/js/engine.js'),assert=require('assert');
// 3x3 of coins, hero in the centre (cell 4), Tremor equipped.
function mk(lv,powers){const S=DC.newGame({id:1,w:3,h:3,heroHP:30,ramp:12,cap:4,weights:{rat:1}},4,{powers:powers||['quake'],powerLevel:lv});S.grid=S.grid.map(()=>({uid:++S.uid,type:'coin',kind:'gold',v:1}));S.hero.pos=4;S.grid[4]=null;return S;}
const ogre=S=>({uid:++S.uid,type:'ogre',kind:'monster',v:20});
assert.strictEqual(DC.quakeDamage(0),3); assert.strictEqual(DC.quakeDamage(9),12);
assert(DC.POWERS.quake.passive,'Tremor is passive');

// Passive: no cooldown, cannot be tapped.
let S=mk(0); assert.strictEqual(S.hero.powers[0].cd,0); assert.strictEqual(DC.usePower(S,0),null);

// Every step: the monster that slides into the square you left is hit (3 + power level).
S=mk(3); let og=ogre(S); S.grid[7]=og;
let r=DC.move(S,0); // hero 4 -> 1; the column slides up, so the ogre at 7 lands in 4
assert.strictEqual(S.hero.pos,1); assert.strictEqual(S.grid[4],og); assert.strictEqual(og.v,20-6,'hit for 3+3');
assert.strictEqual(r.tremor,4,'reports the square it hit');
const sp=r.fx.find(f=>f.anim==='spike'); assert(sp&&sp.cell===4&&sp.dir===0,'spike effect on the hit square, with the move direction');
// ...and again on the next step, with no tapping in between.
let og2=ogre(S); S.grid[2]=og2; S.grid[0]={uid:++S.uid,type:'coin',kind:'gold',v:1};
DC.move(S,3); // hero 1 -> 0; the row slides left, so the ogre at 2 lands in 1
assert.strictEqual(S.hero.pos,0); assert.strictEqual(S.grid[1],og2); assert.strictEqual(og2.v,20-6,'hits every turn');

// A coin sliding in takes nothing.
S=mk(0); r=DC.move(S,0); assert(S.grid[4].kind==='gold'); assert.strictEqual(r.tremor,null);

// Not moving (selling the sword) does not set it off.
S=mk(2); S.hero.sword={v:2,type:'sword',el:null}; r=DC.sellItem(S,'sword'); assert.strictEqual(r.tremor,null);

// Without Tremor equipped, nothing is hit.
S=mk(3,['heal']); og=ogre(S); S.grid[7]=og; DC.move(S,0); assert.strictEqual(og.v,20);

// Previews never hit.
S=mk(3); og=ogre(S); S.grid[7]=og; DC.preview(S,0); assert.strictEqual(og.v,20);
console.log('quake tests passed');
