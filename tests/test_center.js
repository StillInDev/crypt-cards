// Stepping into the middle square refills the square you left clockwise.
const DC=require('../src/js/engine.js'),assert=require('assert');
// Board numbered 1..w*h (uid = square number), hero standing on `from` (0-based).
function setup(w,h,from){const S=DC.newGame({w:w,h:h,heroHP:20,unlock:10,weights:{coin:1}},3);
  S.grid=S.grid.map((c,i)=>i===from?null:{uid:i+1,type:'coin',kind:'gold',v:1});S.hero.pos=from;S.uid=Math.max(S.uid,w*h);S.uid0=S.uid;return S;}
const UP=0,RIGHT=1,DOWN=2,LEFT=3;
const isNew=(S,p)=>S.grid[p]&&S.grid[p].uid>S.uid0; // fresh cards get ids past the counter before the move

// 3x3, numbered 1 2 3 / 4 5 6 / 7 8 9 (0-based 0..8, middle is 4).
// [hero square, move, card that slides into the old square, where the new card appears]
const cases=[
  [1,DOWN, 1,0], // 2 -> 5: 1 slides right into 2, new card at 1
  [5,LEFT, 3,2], // 6 -> 5: 3 slides down into 6, new card at 3
  [7,UP,   9,8], // 8 -> 5: 9 slides left into 8, new card at 9
  [3,RIGHT,7,6]  // 4 -> 5: 7 slides up into 4, new card at 7
];
for(const [from,dir,slid,fresh] of cases){
  const S=setup(3,3,from); const r=DC.move(S,dir);
  assert.strictEqual(S.hero.pos,4);
  assert.strictEqual(S.grid[from].uid,slid,'card '+slid+' fills square '+(from+1));
  assert(isNew(S,fresh),'new card at square '+(fresh+1));
  // nothing else moved
  for(let p=0;p<9;p++) if(p!==4&&p!==from&&p!==fresh) assert.strictEqual(S.grid[p].uid,p+1,'square '+(p+1)+' untouched');
  assert.deepStrictEqual(r.spawned.map(s=>s.cell),[fresh]);
}

// Leaving the middle still slides as before: 5 -> 4, 6 slides into 5, new card at 6.
let S=setup(3,3,4); DC.move(S,LEFT); assert.strictEqual(S.grid[4].uid,6); assert(isNew(S,5));

// Moves that don't enter the middle are unchanged: 2 -> 1, 3 slides into 2.
S=setup(3,3,1); DC.move(S,LEFT); assert.strictEqual(S.grid[1].uid,3); assert(isNew(S,2));

// 5x5 (middle is 12): entering from above (7) slides 6 right into 7; column 1 then slides down
// into 6 and the new card enters at the top edge (1).
S=setup(5,5,7); DC.move(S,DOWN); assert.strictEqual(S.hero.pos,12);
assert.strictEqual(S.grid[7].uid,7,'square 6 (0-based) card moved into 7'); assert.strictEqual(S.grid[6].uid,2,'card above slid down'); assert(isNew(S,1),'new card on the edge');

// Boards without a single middle square (3x4, 4x4) are unchanged.
S=setup(4,4,1); const before=S.grid.map(c=>c&&c.uid); DC.move(S,DOWN);
assert(isNew(S,1),'4x4: new card where you left, as before');
assert.strictEqual(S.grid[0].uid,before[0],'4x4: no clockwise shift');

// Attacking a monster in the middle without killing it: nobody moves, nothing shifts.
S=setup(3,3,1); S.grid[4]={uid:500,type:'ogre',kind:'monster',v:9}; S.hero.sword={v:2,type:'sword',el:null};
DC.move(S,DOWN); assert.strictEqual(S.hero.pos,1); assert.strictEqual(S.grid[0].uid,1);
// Killing a monster with a plain sword and stepping into the middle still shifts clockwise.
S=setup(3,3,1); S.grid[4]={uid:500,type:'rat',kind:'monster',v:1}; S.hero.sword={v:5,type:'sword',el:null};
DC.move(S,DOWN); assert.strictEqual(S.hero.pos,4,'rat killed, hero takes its place'); assert.strictEqual(S.grid[1].uid,1,'1 slid into 2');
console.log('center tests passed');
