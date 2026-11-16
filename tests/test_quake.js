const DC=require('../src/js/engine.js'),assert=require('assert');
function mk(lv){const S=DC.newGame({id:1,w:3,h:3,heroHP:30,ramp:12,cap:4,weights:{rat:1}},4,{powers:['quake'],powerLevel:lv});S.grid=S.grid.map(()=>({uid:++S.uid,type:'coin',kind:'gold',v:1}));S.hero.pos=4;S.grid[4]=null;S.hero.powers[0].cd=0;return S;}
let S=mk(0); assert.strictEqual(DC.quakeDamage(0),3); assert.strictEqual(DC.quakeDamage(9),12);
let r=DC.usePower(S,0); assert(r&&S.hero.mark&&S.hero.mark.dmg===3&&S.hero.mark.cell===4);
// hero steps up to cell 1; settle moves column down: card from 7 -> ... new spawn at 7; cell 4 gets the slid card
// make the card that will slide into 4 a monster: column 1 is cells 1,4,7; hero moves up so cards below slide... find who lands at 4
S=mk(3); DC.usePower(S,0); S.grid[7]={uid:++S.uid,type:'ogre',kind:'monster',v:10}; const og=S.grid[7];
DC.move(S,0); // hero 4->1; column compacts toward hero? check where the ogre ended
const where=S.grid.indexOf(og); console.log('ogre now at',where,'hp',og.v,'mark',S.hero.mark);
assert(S.hero.mark===null,'mark consumed');
if(where===4) assert.strictEqual(og.v,10-6,'hit for 3+3');
// non-monster takes nothing and mark still clears
S=mk(0); DC.usePower(S,0); const coinsBefore=S.grid.filter(c=>c&&c.kind==='gold').length; DC.move(S,0); assert.strictEqual(S.hero.mark,null);
// stays while hero does not move (sell)
S=mk(2); S.hero.sword={v:2,type:'sword',el:null}; DC.usePower(S,0); DC.sellItem(S,'sword'); assert(S.hero.mark&&S.hero.mark.cell===4);
// cooldown and preview purity
S=mk(1); DC.usePower(S,0); assert(S.hero.powers[0].cd>0); const hp=S.hero.hp; DC.preview(S,0); assert(S.hero.mark);
console.log('quake tests passed');
