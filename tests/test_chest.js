const DC=require('../src/js/engine.js'),assert=require('assert');
function mk(){const S=DC.newGame({id:1,w:3,h:3,heroHP:20,ramp:12,cap:4,weights:{coin:1}},7,{});S.grid=S.grid.map(()=>({uid:++S.uid,type:'coin',kind:'gold',v:1}));S.hero.pos=4;S.grid[4]=null;return S;}
// loot variety and sell
const seen={};
for(let s=1;s<200;s++){const S=mk();S.rng=DC.mulberry32(s);S.grid[1]={uid:++S.uid,type:'chest',kind:'chest',v:0};const r=DC.move(S,0);assert(!r.moved);assert.strictEqual(S.hero.pos,4);seen[S.grid[1].type]=1;}
console.log('loot types',Object.keys(seen).sort().join(','));
assert(['sword','potion','gem'].every(k=>seen[k]));
// preview doesn't mutate
let S=mk();S.grid[1]={uid:++S.uid,type:'chest',kind:'chest',v:0};const before=S.grid[1];DC.preview(S,0);assert(S.grid[1]===before);
// sell sword
S=mk();S.hero.sword={v:3};let g=S.hero.gold,t=S.hero.turn;let r=DC.sellItem(S,'sword');
assert(r&&S.hero.sword===null&&S.hero.gold===g+3&&S.hero.turn===t+1&&S.hero.pos===4);
assert.strictEqual(DC.sellItem(S,'sword'),null,'nothing to sell');
S.hero.sword={v:4};S.grid[1]={uid:++S.uid,type:'sword',kind:'weapon',v:2};DC.move(S,0);assert.strictEqual(S.hero.sword.v,3,'new weapon replaces the old one (knight +1)');
// selling still ticks: poison and bombs
S=mk();S.hero.sword={v:2};S.hero.poison=2;S.hero.hp=10;S.grid[1]={uid:++S.uid,type:'bomb',kind:'bomb',v:3,t:1};DC.sellItem(S,'sword');
assert(S.hero.hp<10,'poison/bomb tick on a sell turn');
console.log('chest and sell tests passed');
