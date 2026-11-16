const DC=require('../src/js/engine.js'); const assert=require('assert');
const L={w:3,h:3,heroHP:10,unlock:10,weights:{coin:1}};
const mk=(type,v,t)=>({uid:Math.random()*1e6|0,type,kind:DC.TYPES[type].kind,v,t});
function game(hero){ const S=DC.newGame(L,4,{hero:hero||'knight'}); S.grid=S.grid.map((c,i)=>i===S.hero.pos?null:mk('coin',1)); return S; }

// ---- poison: 1 damage per turn for v turns, never below 1
let S=game(); S.grid[1]=mk('poison',3); let hp=S.hero.hp;
DC.move(S,0); assert.strictEqual(S.hero.poison,2,'3 turns, first already ticked'); assert.strictEqual(S.hero.hp,hp-1);
DC.move(S,3); assert.strictEqual(S.hero.hp,hp-2); DC.move(S,1); assert.strictEqual(S.hero.hp,hp-3); assert.strictEqual(S.hero.poison,0);
DC.move(S,0===1?0:2); assert.strictEqual(S.hero.hp,hp-3,'poison over, no more damage'); console.log('poison lasts its number of turns');
S=game(); S.hero.hp=2; S.grid[1]=mk('poison',4); DC.move(S,0); DC.move(S,3); DC.move(S,2); DC.move(S,1);
assert.strictEqual(S.hero.hp,1); assert(!S.over,'poison never kills'); console.log('poison stops at 1 health');
// stacking
S=game(); S.grid[1]=mk('poison',2); S.grid[0]=mk('poison',2); DC.move(S,0); DC.move(S,3); assert(S.hero.poison>=2); console.log('poison stacks');

// ---- sword
S=game(); S.grid[1]=mk('sword',3,3); DC.move(S,0); assert.deepStrictEqual(S.hero.sword,{v:4,type:'sword',el:null}); console.log('sword picked up (knight +1)');
// attack a monster that survives: hero stays, monster loses health, no damage taken
S=game(); S.hero.sword={v:5}; const ogre=mk('ogre',7); S.grid[1]=ogre; hp=S.hero.hp; let r=DC.move(S,0);
assert.strictEqual(S.hero.pos,4,'hero stays put'); assert.strictEqual(ogre.v,2); assert.strictEqual(S.hero.hp,hp); assert.strictEqual(S.hero.sword,null,'5 power cut 5 of 7 so it is spent'); assert.strictEqual(r.moved,false); assert(S.grid[1]===ogre); console.log('sword hits, hero stays');
// kill it: hero takes its place, no damage; a 4 sword hitting a 2 monster keeps 2
S=game(); S.hero.sword={v:4}; const rat=mk('rat',2); S.grid[1]=rat; hp=S.hero.hp; r=DC.move(S,0); assert.strictEqual(S.hero.pos,1,'took its place'); assert.strictEqual(S.hero.sword.v,2,'4 power vs 2 monster leaves 2'); assert.strictEqual(S.hero.hp,hp); assert(!S.grid.includes(rat)); assert(r.moved); console.log('kill: hero takes monster place');
// durability: breaks after 3 attacks
S=game(); S.hero.sword={v:1}; const tough=mk('ogre',9); S.grid[1]=tough; DC.move(S,0); assert.strictEqual(S.hero.sword,null); assert.strictEqual(tough.v,8); console.log('sword breaks after its last attack');
// goldskull pays when slain
S=game(); S.hero.sword={v:5}; S.grid[1]=mk('goldskull',3); DC.move(S,0); assert.strictEqual(S.hero.gold,3); console.log('golden skeleton pays when slain');
// without a sword monsters still hurt
S=game(); S.grid[1]=mk('rat',2); hp=S.hero.hp; DC.move(S,0); assert.strictEqual(S.hero.hp,hp-2); console.log('unarmed unchanged');
// preview shows the attack
S=game(); S.hero.sword={v:3}; S.grid[1]=mk('ogre',7); const p=DC.preview(S,0); assert(p.attack&&p.attack.dmg===3&&!p.attack.killed); console.log('preview reports attack');

// ---- thorns hit monsters that slide in next to the hero
S=game('cactus'); S.hero.hp=3; S.hero.pos=4; // 3x3: moving up from 4 to 1... use a row: hero at 4 moves left to 3, card at 5 slides into 4 (adjacent to hero)
const slider=mk('ogre',5); S.grid[5]=slider; S.grid[3]=mk('coin',1); DC.move(S,3);
assert.strictEqual(S.hero.pos,3); assert(S.grid[4]===slider,'ogre slid next to hero'); assert.strictEqual(slider.v,4,'thorns hit the slid-in ogre'); console.log('thorns hit monsters that slide in');

// ---- fuzz with everything
const pids=Object.keys(DC.POWERS), hids=Object.keys(DC.HEROES);
for(const hid of hids) for(let g=0;g<150;g++){
  const lv=DC.nextLevel(null,1+(g%12)); const rng=DC.mulberry32(g*17+3);
  const S=DC.newGame(lv,g+1,{hero:hid,powers:[...pids].sort(()=>rng()-.5).slice(0,3)}); let t=0;
  while(!S.over&&t<600){
    if(rng()<.3){ const i=Math.floor(rng()*S.hero.powers.length), p=S.hero.powers[i]; if(p&&p.cd===0){ const need=DC.POWERS[p.id].target; if(!need) DC.usePower(S,i); else { const c=S.grid.map((_,k)=>k).filter(k=>DC.validTarget(S,i,k)); if(c.length) DC.usePower(S,i,c[Math.floor(rng()*c.length)]); } } }
    DC.move(S,Math.floor(rng()*4)); t++;
    for(let k=0;k<S.grid.length;k++) if(k!==S.hero.pos&&!S.grid[k]) throw new Error('hole');
    if(S.grid[S.hero.pos]) throw new Error('card under hero');
    if(S.hero.poison<0||S.hero.hp<0) throw new Error('bad status');
  }
}
console.log('fuzz ok; all v2 tests passed');
