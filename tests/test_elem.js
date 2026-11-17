const DC=require('../src/js/engine.js'),assert=require('assert');
function mk(){const S=DC.newGame({id:1,w:3,h:3,heroHP:30,ramp:12,cap:4,weights:{coin:1}},9,{hero:'rogue'});S.grid=S.grid.map(()=>({uid:++S.uid,type:'coin',kind:'gold',v:1}));S.hero.pos=4;S.grid[4]=null;S.hero.hp=S.hero.max=30;return S;}
const M=(S,type,v)=>({uid:++S.uid,type,kind:'monster',v});
const SW=(type,v)=>({v,type,el:DC.TYPES[type].el||null});
// phoenix: normal sword wears it to 1 but not dead; hero stays
let S=mk(),p=M(S,'phoenix',6); S.grid[1]=p; S.hero.sword=SW('sword',9); DC.move(S,0);
assert.strictEqual(p.v,1); assert(S.grid[1]===p); assert.strictEqual(S.hero.pos,4); console.log('phoenix survives sword at 1hp');
DC.move(S,0); assert.strictEqual(p.v,1); assert(S.grid[1]===p,'still alive'); console.log('phoenix still alive on repeat');
// fire sword cannot hurt a phoenix (fire)
S=mk(); p=M(S,'phoenix',6); S.grid[1]=p; S.hero.sword=SW('firesword',9); DC.move(S,0); assert.strictEqual(p.v,6); assert.strictEqual(S.hero.sword.v,9); console.log('fire sword immune');
// ice sword kills phoenix, hero moves in
S=mk(); p=M(S,'phoenix',8); S.grid[1]=p; S.hero.sword=SW('icesword',2); DC.move(S,0); assert.strictEqual(S.hero.pos,1); assert(!S.grid.includes(p)); console.log('ice sword kills phoenix');
// unarmed step kills phoenix, costs hp
S=mk(); p=M(S,'phoenix',5); S.grid[1]=p; let hp=S.hero.hp; DC.move(S,0); assert.strictEqual(S.hero.pos,1); assert.strictEqual(S.hero.hp,hp-5); console.log('stepping on phoenix kills it');
// bomb/trap/thorns cannot kill phoenix
S=mk(); p=M(S,'phoenix',3); S.grid[1]=p; S.grid[0]={uid:++S.uid,type:'bomb',kind:'bomb',v:9,t:1}; S.hero.pos=4; DC.move(S,2); // hero moves down? bomb blast adjacent to 1 (cell 0 neighbours 1,3)
assert(S.grid.includes(p)&&p.v>=1); console.log('bomb cannot kill phoenix');
// ice sword: hit, not killed -> frozen
S=mk(); let g=M(S,'goblin',9); S.grid[1]=g; S.hero.sword=SW('icesword',3); DC.move(S,0);
assert.strictEqual(g.v,6); assert(g.frozen); assert.strictEqual(S.hero.pos,4); console.log('ice sword freezes survivor');
// frozen: step swaps, no hit, even with weapon
S.hero.sword=SW('sword',9); const hp1=S.hero.hp; DC.move(S,0); assert.strictEqual(g.v,6); assert.strictEqual(S.hero.pos,1); assert.strictEqual(S.hero.hp,hp1); assert(S.grid[4]===g); console.log('frozen swaps, not hit');
// ice sword vs ice monster: immune, no freeze; vs fire monster: double and freeze
S=mk(); let w=M(S,'frostwolf',6); S.grid[1]=w; S.hero.sword=SW('icesword',3); DC.move(S,0); assert.strictEqual(w.v,6); assert(!w.frozen); console.log('ice vs ice immune');
S=mk(); let sal=M(S,'magmaslime',9); S.grid[1]=sal; S.hero.sword=SW('icesword',3); DC.move(S,0); assert.strictEqual(sal.v,3); assert(sal.frozen); assert.strictEqual(S.hero.sword,null,'3 power spent for 6 damage'); console.log('ice vs fire double + freeze');
// fire sword double on ice
S=mk(); w=M(S,'frostwolf',8); S.grid[1]=w; S.hero.sword=SW('firesword',3); DC.move(S,0); assert.strictEqual(w.v,2); assert(!w.frozen); console.log('fire vs ice double');
// weapon cost: power 4 vs 2hp neutral keeps 2 (regression)
S=mk(); let r=M(S,'rat',2); S.grid[1]=r; S.hero.sword=SW('sword',4); DC.move(S,0); assert.strictEqual(S.hero.sword.v,2); console.log('regression sword cost');
// 25 new monsters exist
assert.strictEqual(['slime','goblin','zombie','ghost','spider','scorpion','wolf','cultist','wraith','shroom','gargoyle','lich','harpy','troll','minotaur','snake','beetle','mummy','vampire','banshee','salamander','magmaslime','frostwolf','frostwisp','icespider'].filter(k=>DC.TYPES[k]).length,25);
// pickup sets el
S=mk(); S.grid[1]={uid:++S.uid,type:'icesword',kind:'weapon',v:3}; DC.move(S,0); assert.strictEqual(S.hero.sword.el,'ice'); assert.strictEqual(S.hero.sword.type,'icesword');
// fuzz with all weights
for(let seed=1;seed<300;seed++){const L=DC.nextLevel(null,14);const G=DC.newGame(L,seed,{});for(let i=0;i<100&&!G.over;i++){const ds=[0,1,2,3].filter(d=>DC.preview(G,d));if(!ds.length)break;DC.move(G,ds[(seed*7+i)%ds.length]);assert(G.grid.every((c,pp)=>pp===G.hero.pos?c==null:c));}}
console.log('element tests passed');
// ---- wands
{
 const mkw=()=>{const S=mk(); S.hero.pos=0; S.grid[0]=null; return S;};
 const WD=(type,v)=>({v,type,el:DC.TYPES[type].el,wand:true});
 // 3x3: hero at 0 hits right along row 0: cells 1,2. One hit, and what is left pierces on.
 let S=mkw(), a=M(S,'goblin',5), b=M(S,'goblin',6); S.grid[1]=a; S.grid[2]=b; S.hero.sword=WD('firewand',4);
 let r=DC.move(S,1); assert.strictEqual(S.hero.pos,0,'hero stays'); assert.strictEqual(a.v,1); assert.strictEqual(S.grid[1],a); assert.strictEqual(b.v,6,'not reached: power ran out on the first'); assert.strictEqual(S.hero.sword,null);
 S=mkw(); a=M(S,'goblin',3); b=M(S,'goblin',6); S.grid[1]=a; S.grid[2]=b; S.hero.sword=WD('firewand',7);
 r=DC.move(S,1); assert.strictEqual(S.hero.pos,1,'first one died: hero steps in'); assert.strictEqual(b.v,2,'4 power pierced through'); assert.strictEqual(S.hero.sword,null,'all 7 spent'); assert(r.attack.beam&&r.attack.beam.cells.length===2);
 S=mkw(); a=M(S,'goblin',2); b=M(S,'goblin',2); S.grid[1]=a; S.grid[2]=b; S.hero.sword=WD('firewand',9);
 DC.move(S,1); assert.strictEqual(S.hero.sword.v,5,'wears down by health cut through, like a sword'); console.log('wand pierces');
 // fire wand: fire monster immune (no wear, passes on), ice monster double
 S=mkw(); let f=M(S,'salamander',5), i2=M(S,'frostwolf',9); S.grid[1]=f; S.grid[2]=i2; S.hero.sword=WD('firewand',4); DC.move(S,1); assert.strictEqual(f.v,5); assert.strictEqual(i2.v,1); assert.strictEqual(S.hero.sword,null); console.log('wand elements');
 // ice wand freezes survivors and kills a phoenix
 S=mkw(); let g1=M(S,'goblin',9); S.grid[1]=g1; S.hero.sword=WD('icewand',2); DC.move(S,1); assert(g1.frozen&&g1.v===7); assert.strictEqual(S.hero.sword,null);
 S=mkw(); let g2=M(S,'goblin',3), ph=M(S,'phoenix',4); S.grid[1]=g2; S.grid[2]=ph; S.hero.sword=WD('icewand',6); DC.move(S,1);
 assert(!S.grid.includes(ph),'phoenix killed by ice wand'); console.log('ice wand freezes, kills phoenix');
 // far kills leave a gap that is filled
 S=mkw(); let k1=M(S,'rat',1), k2=M(S,'rat',1); S.grid[1]=k1; S.grid[2]=k2; S.hero.sword=WD('firewand',3); DC.move(S,1);
 assert.strictEqual(S.hero.pos,1,'took adjacent place'); assert(!S.grid.includes(k1)&&!S.grid.includes(k2)); assert(S.grid.every((c,p)=>p===S.hero.pos?c==null:c)); console.log('wand kills fill gaps');
 // pickup: one power number, no charges
 S=mkw(); S.grid[1]={uid:++S.uid,type:'icewand',kind:'weapon',v:6}; DC.move(S,1); assert(S.hero.sword.wand&&S.hero.sword.c==null&&S.hero.sword.v===6); console.log('wand pickup');
}
console.log('wand tests passed');
// ---- scythe: grid 1..9, hero 2 hitting 5 hits 4 5 6; hero 4 hitting 5 hits 2 5 8; hero 1 hitting 2 hits 2 and 5 only
{
 const sc=(v)=>({v,type:'scythe',el:null,sweep:true});
 const mkc=(heroCell)=>{const S=mk(); S.grid=S.grid.map(()=>({uid:++S.uid,type:'coin',kind:'gold',v:1})); S.hero.pos=heroCell; S.grid[heroCell]=null; for(let p=0;p<9;p++) if(p!==heroCell) S.grid[p]=M(S,'goblin',9); S.hero.sword=sc(3); return S;};
 const hit=(S)=>S.grid.map((c,p)=>c&&c.v===6?p+1:null).filter(Boolean).join(',');
 let S=mkc(1); DC.move(S,2); assert.strictEqual(hit(S),'4,5,6','2 hitting 5');
 S=mkc(3); DC.move(S,1); assert.strictEqual(hit(S),'2,5,8','4 hitting 5');
 S=mkc(0); DC.move(S,1); assert.strictEqual(hit(S),'2,5','1 hitting 2');
 // cost = max single damage; kills of side targets leave gaps that fill
 S=mkc(1); S.grid[3]=M(S,'rat',1); S.hero.sword=sc(3); DC.move(S,2); assert(S.grid.every((c,p)=>p===S.hero.pos?c==null:c)); assert.strictEqual(S.hero.sword,null,'3 power spent by the biggest hit');
 console.log('scythe tests passed');
}
// ---- electric bow: any monster on the board, chains to touching monsters at -1 per jump
{
 const BW=(v,c)=>({v,type:'elecbow',el:null,bow:true,c});
 const mkb=()=>{const S=mk(); S.grid=S.grid.map(()=>({uid:++S.uid,type:'coin',kind:'gold',v:1})); S.hero.pos=0; S.grid[0]=null; S.hero.sword=BW(4,5); return S;};
 // 3x3 cells 0..8, hero at 0. Monster at 8 (far), neighbours 5 and 7, then 4 next to 5 and 7
 let S=mkb(); const m8=M(S,'ogre',9),m5=M(S,'ogre',9),m7=M(S,'ogre',9),m4=M(S,'ogre',9),m2=M(S,'ogre',9);
 S.grid[8]=m8;S.grid[5]=m5;S.grid[7]=m7;S.grid[4]=m4;S.grid[2]=m2;
 let r=DC.shootBow(S,8);
 assert(r,'shot fired'); assert.strictEqual(S.hero.pos,0,'hero stays');
 assert.strictEqual(m8.v,5,'target takes 4'); assert.strictEqual(m5.v,6,'jump1 takes 3'); assert.strictEqual(m7.v,6);
 assert.strictEqual(m4.v,7,'jump2 takes 2'); assert.strictEqual(m2.v,7,'second jump takes 2');
 assert.strictEqual(S.hero.sword.c,4,'arrow used');
 // frozen target refused, frozen monsters do not conduct
 S=mkb(); const f=M(S,'ogre',9), t=M(S,'ogre',9); f.frozen=true; S.grid[4]=f; S.grid[5]=t;
 assert.strictEqual(DC.shootBow(S,4),null,'cannot target frozen');
 const t2=M(S,'ogre',9); S.grid[8]=t2; DC.shootBow(S,5); assert.strictEqual(f.v,9,'frozen untouched'); assert.strictEqual(t.v,5);
 // non-monster and no bow refused
 S=mkb(); assert.strictEqual(DC.shootBow(S,4),null);
 S=mkb(); S.grid[4]=M(S,'rat',2); S.hero.sword=null; assert.strictEqual(DC.shootBow(S,4),null);
 // kills pay and the board refills; arrows run out
 S=mkb(); S.grid[4]=M(S,'rat',1); S.grid[5]=M(S,'rat',1); S.hero.sword=BW(4,1); DC.shootBow(S,4);
 assert.strictEqual(S.hero.sword,null,'bow spent'); assert(S.grid.every((c,p)=>p===S.hero.pos?c==null:c),'gaps filled');
 // melee into an adjacent monster with a bow is an unarmed step
 S=mkb(); S.grid[1]=M(S,'rat',2); const hp=S.hero.hp; DC.move(S,1); assert(S.hero.hp<hp||S.hero.pos===1,'unarmed bump'); assert(S.hero.sword&&S.hero.sword.bow);
 // pickup
 S=mkb(); S.hero.sword=null; S.grid[1]={uid:++S.uid,type:'elecbow',kind:'weapon',v:3,t:5}; DC.move(S,1); assert(S.hero.sword.bow&&S.hero.sword.c===5&&S.hero.sword.v===3);
 console.log('bow tests passed');
}
