// Power upgrades: levels change amounts, recharge times, tips and Tremor damage.
const DC=require('../src/js/engine.js'),assert=require('assert');
const L={id:1,w:3,h:3,heroHP:30,ramp:12,cap:4,weights:{coin:1}};
function mk(powers,ups){const S=DC.newGame(L,5,{hero:'knight',powers,upgrades:ups});S.grid=S.grid.map(()=>({uid:++S.uid,type:'coin',kind:'gold',v:1}));S.hero.pos=4;S.grid[4]=null;S.hero.hp=S.hero.max=30;S.hero.powers.forEach(p=>p.cd=0);return S;}
const M=(S,type,v)=>({uid:++S.uid,type,kind:'monster',v});

// costs and caps
assert.strictEqual(DC.upgradeCost(0),150); assert.strictEqual(DC.upgradeCost(2),1200); assert.strictEqual(DC.upgradeCost(DC.POWER_MAX_LV),null);
// no upgrades = old behaviour
let S=mk(['heal']); S.hero.hp=10; DC.usePower(S,0); assert.strictEqual(S.hero.hp,15);
// heal level 2 restores 9
S=mk(['heal'],{heal:2}); S.hero.hp=10; DC.usePower(S,0); assert.strictEqual(S.hero.hp,19); console.log('heal scales');
// forge level 3 makes a 19 sword
S=mk(['forge'],{forge:3}); DC.usePower(S,0); assert.strictEqual(S.hero.sword.v,19); console.log('forge scales');
// thunder level 1 deals 4
S=mk(['thunder'],{thunder:1}); const og=M(S,'ogre',9); S.grid[0]=og; DC.usePower(S,0); assert.strictEqual(og.v,5); console.log('thunder scales');
// ward/ice duration
S=mk(['ward','ice'],{ward:2,ice:1}); DC.usePower(S,0); DC.usePower(S,1); assert.strictEqual(S.hero.ward,6); assert.strictEqual(S.hero.frost,4); console.log('durations scale');
// recharge-cut powers
S=DC.newGame(L,5,{hero:'knight',powers:['fire'],upgrades:{fire:3}}); assert.strictEqual(S.hero.powers[0].max,4); console.log('fire recharges faster');
// out-of-range levels are clamped
S=DC.newGame(L,5,{hero:'knight',powers:['heal'],upgrades:{heal:99}}); assert.strictEqual(S.hero.powers[0].lv,DC.POWER_MAX_LV);
// tremor bonus goes past the cap
assert.strictEqual(DC.quakeDamage(9,2),14); assert.strictEqual(DC.quakeDamage(0),3);
// tips use the upgraded numbers
assert(/Restore 9 health/.test(DC.powerTip('heal',2,0))); assert(/Right now: 5 damage/.test(DC.powerTip('quake',1,1)));
// hero upgrades: 7 levels, +2 max health each
assert.deepStrictEqual([0,1,2,3,4,5,6,7].map(DC.heroUpgradeCost),[100,250,500,1000,2000,4000,8000,null]);
const base=DC.newGame(L,5,{hero:'knight'}).hero.max;
S=DC.newGame(L,5,{hero:'knight',heroLevel:3}); assert.strictEqual(S.hero.max,base+6); assert.strictEqual(S.hero.hp,S.hero.max);
S=DC.newGame(L,5,{hero:'knight',heroLevel:99}); assert.strictEqual(S.hero.max,base+14); console.log('hero health scales');
console.log('upgrade tests passed');
