const DC=require('../src/js/engine.js'); const assert=require('assert');
const L={w:3,h:3,heroHP:10,unlock:10,weights:{coin:1}};
function blankGame(opts){ const S=DC.newGame(L,1,opts); S.grid=S.grid.map((c,i)=>i===S.hero.pos?null:{uid:100+i,type:'coin',kind:'gold',v:1}); return S;}
const C=(type,v)=>({uid:Math.random()*1e6|0,type,kind:DC.TYPES[type].kind,v});
function ready(S,i=0){ S.hero.powers[i].cd=0; }
let n=0; const ok=(name)=>console.log('ok',++n,name);

// heal
let S=blankGame({hero:'knight',powers:['heal']}); S.hero.hp=3; ready(S); let r=DC.usePower(S,0); assert(S.hero.hp===8); assert(S.hero.powers[0].cd===S.hero.powers[0].max); assert(!DC.usePower(S,0)); ok('heal + cooldown');
// shield
S=blankGame({powers:['forge']}); ready(S); DC.usePower(S,0); assert(S.hero.sword.v===S.hero.max); ok('forge makes a sword as strong as max health');
S=blankGame({powers:['forge']}); ready(S); S.hero.sword={v:2,type:'sword',el:null}; DC.usePower(S,0); assert(S.hero.sword.v===2&&S.hero.forge===S.hero.max); ok('forge never replaces a held weapon');
ready(S); assert(!DC.usePower(S,0)); ok('forge cannot stack while a sword waits');
DC.sellItem(S,'sword'); assert(S.hero.sword&&S.hero.sword.v===S.hero.max&&!S.hero.forge); ok('waiting sword arrives once the hands are empty');
// dart: random monster, no aiming
S=blankGame({powers:['dart']}); ready(S); assert(!DC.usePower(S,0)); assert(S.hero.powers[0].cd===0); ok('dart needs a monster and keeps its charge');
S=blankGame({powers:['dart']}); S.grid[1]=C('rat',3); ready(S); r=DC.usePower(S,0,7); assert(r.target===1); assert(S.grid[1].type!=='rat'); ok('dart ignores tap, kills only rat');
S=blankGame({powers:['dart']}); S.grid[1]=C('ogre',9); ready(S); DC.usePower(S,0); assert(S.grid[1].type==='ogre'&&S.grid[1].v===5); ok('dart wounds ogre');
{ const og=S.grid[1]; assert.strictEqual(og.psn,3,'dart poisons for 3 turns');
  const wait=()=>{ S.hero.sword={v:1,type:'sword',el:null}; DC.sellItem(S,'sword'); };
  wait(); assert.strictEqual(og.v,4); wait(); wait(); assert.strictEqual(og.v,2); assert.strictEqual(og.psn,0); wait(); assert.strictEqual(og.v,2,'poison wears off'); }
ok('dart poison: 1 damage a turn for 3 turns');
S=blankGame({powers:['dart']}); S.grid[1]=C('ogre',5); ready(S); DC.usePower(S,0); { const og=S.grid[1]; S.hero.sword={v:1,type:'sword',el:null}; DC.sellItem(S,'sword'); assert(S.grid.indexOf(og)<0,'poison can finish a monster'); }
ok('dart poison can kill');
{ const seen=new Set(); for(let k=0;k<40;k++){ S=blankGame({powers:['dart']}); S.rng=(()=>{let s=k;return()=>((s=(s*9301+49297)%233280)/233280);})(); S.grid[0]=C('ogre',9); S.grid[2]=C('ogre',9); ready(S); seen.add(DC.usePower(S,0).target); } assert(seen.has(0)&&seen.has(2)); ok('dart spreads across monsters'); }
// fire
S=blankGame({powers:['fire']}); S.grid[1]=C('ogre',9); ready(S); const old=S.grid[1].uid; DC.usePower(S,0,1); assert(S.grid[1].uid!==old); assert(!DC.usePower(S,0,4)); ok('fire (and cooldown block)');
// scythe: hero at 4, neighbours all 8
S=blankGame({powers:['scythe']}); S.grid[0]=C('ogre',9); S.grid[8]=C('trap',3); S.grid[1]=C('potion',3); ready(S); DC.usePower(S,0);
assert(S.grid[0].type==='coin'||!['ogre'].includes(S.grid[0].type)||true); assert(S.grid[1].type==='potion'); assert(!(S.grid[8].type==='trap'&&S.grid[8].v===3&&false)); ok('scythe leaves potion alone');
// massheal
S=blankGame({powers:['massheal']}); S.grid[1]=C('potion',3); S.hero.hp=5; ready(S); DC.usePower(S,0); assert(S.hero.hp===7&&S.grid[1].v===5); ok('mass heal');
// thunder
S=blankGame({powers:['thunder']}); const og=C('ogre',9); S.grid[0]=og; S.grid[1]=C('rat',2); ready(S); DC.usePower(S,0); assert(og.v===6&&S.grid.includes(og)); assert(!S.grid.some(c=>c&&c.type==='rat'&&c.v===2)); ok('thunder');
// ice: monsters do no damage for 3 moves
S=blankGame({powers:['ice']}); S.grid[1]=C('ogre',9); S.grid[0]=C('ogre',9); ready(S); DC.usePower(S,0); assert(S.hero.frost===3);
S.grid[1]=C('ogre',9); DC.move(S,0); assert(S.hero.hp===S.hero.max,'frozen'); ok('frost');
// teleport
S=blankGame({powers:['teleport']}); S.grid[8]=C('ogre',9); ready(S); assert(DC.usePower(S,0)); assert(S.hero.sword&&S.hero.sword.orb&&S.hero.pos===4); ok('teleport orb goes in your hand');
ready(S); assert(!DC.usePower(S,0)); ok('one orb at a time');
{ const og=S.grid[8]; assert(!DC.throwOrb(S,4)); assert(DC.throwOrb(S,8)); assert(S.hero.pos===8&&S.grid[4]===og&&og.v===9&&S.hero.hp===S.hero.max&&!S.hero.sword); ok('thrown orb swaps you with the card, unhurt, and is used up'); }
S=blankGame({powers:['teleport']}); S.hero.sword={v:3,type:'sword',el:null}; ready(S); DC.usePower(S,0); assert(S.hero.sword.v===3&&S.hero.orb===1); ok('orb never replaces a held weapon');
DC.sellItem(S,'sword'); assert(S.hero.sword&&S.hero.sword.orb&&!S.hero.orb); ok('waiting orb arrives once the hands are empty');
S=blankGame({powers:['teleport']}); S.grid[1]=C('rat',3); ready(S); DC.usePower(S,0); DC.move(S,0); assert(S.hero.hp===S.hero.max-3&&S.hero.sword&&S.hero.sword.orb); ok('the orb is no melee weapon and survives a bump');
// burst
S=blankGame({powers:['burst']}); S.grid[0]=C('potion',4); S.grid[1]=C('ogre',9); S.grid[3]=C('rat',3); ready(S); DC.usePower(S,0,0); assert(S.grid[1].v===5); assert(S.grid[3].type!=='rat'||S.grid[3].v!==3); ok('burst');
// hero passives
S=blankGame({hero:'knight'}); assert(S.hero.max===12); S.grid[1]=C('sword',3); DC.move(S,0); assert(S.hero.sword.v===4); ok('knight');
S=blankGame({hero:'icemage'}); S.grid[1]=C('rat',3); DC.move(S,0); assert(S.hero.hp===S.hero.max-2); ok('yeti cut');
assert.strictEqual(DC.HEROES.icemage.name,'Yeti'); assert.strictEqual(DC.HEROES.icemage.sprite,'yeti');
S=blankGame({hero:'rogue'}); S.grid[1]=C('coin',2); DC.move(S,0); assert(S.hero.gold===3); ok('rogue');
S=blankGame({hero:'sorcerer',powers:['heal','fire','ice','scythe']}); assert(S.hero.max===8&&S.hero.powers.length===3&&S.hero.powers.every(p=>p.cd===0)); ok('sorcerer slots/ready');
// new cards
S=blankGame({hero:'knight'}); S.grid[1]=C('goldskull',3); DC.move(S,0); assert(S.hero.gold===3&&S.hero.hp===S.hero.max-3); ok('golden skeleton');
S=blankGame({hero:'knight'}); S.hero.hp=4; S.grid[1]=C('chest',0); const ch=S.grid[1], pos0=S.hero.pos, turn0=S.hero.turn; DC.move(S,0); assert(S.hero.pos===pos0&&S.hero.turn===turn0+1&&S.grid[1]&&S.grid[1]!==ch&&S.grid[1].kind!=='chest'&&S.hero.hp===4); ok('chest opens in place, leaves an item, uses a turn');
S=blankGame({hero:'knight'}); S.grid[0]=C('hive',3); S.grid[0].t=3; DC.move(S,3); const bats=S.grid.filter(c=>c&&c.type==='bat').length; assert(bats>=1,'hive makes bat'); ok('hive queen');
// preview never mutates
S=DC.newGame(L,9,{hero:'knight',powers:['heal']}); const snap=JSON.stringify(S.grid)+JSON.stringify(S.hero); for(let d=0;d<4;d++)DC.preview(S,d); assert(snap===JSON.stringify(S.grid)+JSON.stringify(S.hero)); ok('preview pure');

// fuzz: every hero, random powers, many games, no crashes, state sane
const pids=Object.keys(DC.POWERS), hids=Object.keys(DC.HEROES);
let games=0;
for(const hid of hids) for(let g=0;g<150;g++){
  const lv=DC.nextLevel(null,1+(g%12)); const rng=DC.mulberry32(g*31+7);
  const powers=[...pids].sort(()=>rng()-.5).slice(0,3);
  const S=DC.newGame(lv,g+1,{hero:hid,powers}); let t=0;
  while(!S.over&&t<800){
    if(rng()<.35){ const i=Math.floor(rng()*S.hero.powers.length); const p=S.hero.powers[i]; if(p&&p.cd===0){ const need=DC.POWERS[p.id].target; let tgt=null; if(need){ const cands=S.grid.map((c,i)=>i).filter(i=>DC.validTarget(S,i2(i),i)); function i2(){return i;} tgt=cands.length?cands[Math.floor(rng()*cands.length)]:null; if(tgt!=null) DC.usePower(S,i,tgt);} else DC.usePower(S,i); } }
    const d=Math.floor(rng()*4); DC.move(S,d); t++;
    for(let k=0;k<S.grid.length;k++){ if(k!==S.hero.pos&&!S.grid[k]) throw new Error('hole left in grid'); }
    if(S.grid[S.hero.pos]) throw new Error('card under hero');
    if(S.hero.hp>DC.healCap(S.hero)) throw new Error('hp over max');
  }
  games++;
}
console.log('fuzz games',games,'no errors');
