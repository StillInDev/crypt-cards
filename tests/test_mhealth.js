const DC=require('../src/js/engine.js'),assert=require('assert');
// Monster health: n = middle of its range + the room's growth, times the area's scale.
// A monster arrives with health within n - n/4 .. n + n/4, always rounded down.
const room=(type,area,extra)=>Object.assign({id:1,w:3,h:3,heroHP:999,ramp:10,cap:6,area:area,weights:{[type]:1}},extra);
function board(type,area){
  const v=[];
  for(let seed=1;seed<=80;seed++) DC.newGame(room(type,area),seed,{hero:'knight'}).grid.forEach(c=>{if(c&&c.type===type)v.push(c.v);});
  return v;
}
const mean=(v)=>v.reduce((a,b)=>a+b,0)/v.length;
function inRange(v,n,what){
  const lo=Math.min(...v),hi=Math.max(...v);
  assert(lo>=Math.floor(n-n/4)&&hi<=Math.floor(n+n/4),what+' range '+lo+'..'+hi+' for n='+n);
  const m=mean(v); assert(m>n-1&&m<=n,what+' mean '+m+' for n='+n); // rounding down pulls it about half a point under n
}
// Ogre 5..9: n = 7 in area 1.
inRange(board('ogre',1),7,'ogre area 1');
// Each area after the first scales n up.
inRange(board('ogre',5),7*(1+4*DC.AREA_SCALE),'ogre area 5');
assert.strictEqual(DC.areaScale({}),1,'no area counts as area 1');
assert.strictEqual(DC.areaScale({area:3}),1+2*DC.AREA_SCALE);
// Rounded down: n = 4.5 (skeleton) never reaches 6, the old top of its range.
{ const v=board('skeleton',1); assert(Math.max(...v)<=5&&Math.min(...v)>=3,'skeleton '+Math.min(...v)+'..'+Math.max(...v)); }
// The boss keeps its fixed 15..25 range in every area.
{ const v=board('minotaur',5); assert(Math.min(...v)>=15&&Math.max(...v)<=25,'minotaur '+Math.min(...v)+'..'+Math.max(...v)); }
// Growth: at turn 30 with ramp 10, n rises by the full +3 (ogre: 7 -> 10).
{ const v=[];
  for(let seed=1;seed<=200;seed++){
    const S=DC.newGame(room('ogre',1),seed,{hero:'knight'}); S.hero.turn=30;
    const r=DC.move(S,0); if(r) r.spawned.forEach(s=>{if(s.card&&s.card.type==='ogre') v.push(s.card.v);});
  }
  assert(v.length>50,'refills seen: '+v.length);
  inRange(v,10,'grown ogre');
}
console.log('monster health tests passed');
