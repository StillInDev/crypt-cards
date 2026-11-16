const DC=require('../src/js/engine.js'),assert=require('assert');
// 3x3 board of coins, hero in the centre (4), Tremor charged.
function mk(lv){const S=DC.newGame({id:1,w:3,h:3,heroHP:30,ramp:12,cap:4,weights:{coin:1}},4,{powers:['quake'],powerLevel:lv});S.grid=S.grid.map(()=>({uid:++S.uid,type:'coin',kind:'gold',v:1}));S.hero.pos=4;S.grid[4]=null;S.hero.powers[0].cd=0;return S;}
assert.strictEqual(DC.quakeDamage(0),3); assert.strictEqual(DC.quakeDamage(9),12);
assert(DC.POWERS.quake.passive,'Tremor is passive');

// Passive: tapping it does nothing.
let S=mk(0); assert.strictEqual(DC.usePower(S,0),null); assert.strictEqual(S.hero.mark,null); assert.strictEqual(S.hero.powers[0].cd,0);

// Charged: stepping off a square hits the monster that slides into it, and starts the recharge.
// Hero steps up (4 -> 1); column 1,4,7 slides toward the hero, so the ogre at 7 lands on 4.
S=mk(3); const og={uid:++S.uid,type:'ogre',kind:'monster',v:10}; S.grid[7]=og;
let r=DC.move(S,0);
assert.strictEqual(S.hero.pos,1); assert.strictEqual(r.tremor,4,'tremor left on the square stepped off');
assert.strictEqual(S.grid[4],og,'ogre slid into the marked square'); assert.strictEqual(og.v,10-6,'hit for 3+3');
assert.strictEqual(S.hero.mark,null,'mark consumed the same turn');
const max=S.hero.powers[0].max; assert.strictEqual(S.hero.powers[0].cd,max-1,'recharging, counting this turn');

// A coin sliding in takes nothing, but the charge is still spent.
S=mk(0); r=DC.move(S,0); assert.strictEqual(r.tremor,4); assert.strictEqual(S.grid[4].kind,'gold'); assert.strictEqual(S.hero.powers[0].cd,max-1);

// Recharging: no tremor, and the slid-in monster is untouched.
S=mk(3); S.hero.powers[0].cd=4; const og2={uid:++S.uid,type:'ogre',kind:'monster',v:10}; S.grid[7]=og2;
r=DC.move(S,0); assert.strictEqual(r.tremor,null); assert.strictEqual(og2.v,10); assert.strictEqual(S.hero.powers[0].cd,3);

// Not moving (selling the sword) does not set it off.
S=mk(2); S.hero.sword={v:2,type:'sword',el:null}; r=DC.sellItem(S,'sword'); assert.strictEqual(r.tremor,null); assert.strictEqual(S.hero.powers[0].cd,0);

// Preview has no side effects.
S=mk(1); DC.preview(S,0); assert.strictEqual(S.hero.powers[0].cd,0); assert.strictEqual(S.hero.mark,null);

// It fires again once recharged: after max-1 more steps it is charged, and the next step triggers it.
S=mk(0); DC.move(S,0); let fired=0;
for(let n=0;n<max+2&&!S.over;n++){const res=DC.move(S,n%2?0:2); if(res&&res.tremor!=null) fired++;}
assert.strictEqual(fired,1,'fires once more after a full recharge');
console.log('quake tests passed');
