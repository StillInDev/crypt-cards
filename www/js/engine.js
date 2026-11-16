(function (root) {
  'use strict';

  // ---- Card catalogue -------------------------------------------------------
  // lo/hi: value range when a card is created. bf: how strongly the level's
  // difficulty ramp raises the card's value.
  const TYPES = {
    coin:      { kind: 'gold',    name: 'Coin',            lo: 1, hi: 3, bf: 0.5, tip: 'Step on it to add its value to your gold.' },
    gem:       { kind: 'gold',    name: 'Gem',             lo: 4, hi: 6, bf: 0.5, tip: 'Worth a lot of gold.' },
    potion:    { kind: 'heal',    name: 'Potion',          lo: 2, hi: 5, bf: 0.7, tip: 'Restores health, up to your maximum.' },
    chest:     { kind: 'chest',   name: 'Chest',           lo: 0, hi: 0, bf: 0,   tip: 'Step toward it to open it. You stay where you are and the turn is spent, and an item appears in its place for you to pick up.' },
    poison:    { kind: 'harm',    name: 'Poison',          lo: 1, hi: 4, bf: 1,   tip: 'Poisons you. You lose 1 health every turn for as many turns as its number, but it can never take you below 1.' },
    trap:      { kind: 'harm',    name: 'Spike trap',      lo: 2, hi: 5, bf: 1,   tip: 'Hurts you when you step on it.' },
    rat:       { kind: 'monster', name: 'Rat',             lo: 1, hi: 3, bf: 1,   tip: 'Costs you health equal to its number when you step on it.' },
    bat:       { kind: 'monster', name: 'Bat',             lo: 2, hi: 4, bf: 1,   tip: 'Costs you health equal to its number when you step on it.' },
    skeleton:  { kind: 'monster', name: 'Skeleton',        lo: 3, hi: 6, bf: 1,   tip: 'Costs you health equal to its number when you step on it.' },
    ogre:      { kind: 'monster', name: 'Ogre',            lo: 5, hi: 9, bf: 1,   tip: 'Costs you health equal to its number when you step on it.' },
    goldskull: { kind: 'monster', name: 'Golden skeleton', lo: 2, hi: 5, bf: 0.7, pays: true, tip: 'Hurts like a monster, but pays out its number in gold.' },
    hive:      { kind: 'monster', name: 'Hive queen',      lo: 3, hi: 6, bf: 1,   ability: 'queen', tip: 'Every 4 turns it turns a neighbouring card into a bat. Hurts when stepped on.' },
    imp:       { kind: 'monster', name: 'Fire imp',       lo: 2, hi: 5, bf: 1,   el: 'fire', tip: 'A fire monster. Fire traps cannot hurt it, and ice traps hurt it double.' },
    golem:     { kind: 'monster', name: 'Ice golem',       lo: 3, hi: 6, bf: 1,   el: 'ice',  tip: 'An ice monster. Ice traps cannot hurt it, and fire traps hurt it double.' },
    firetrap:  { kind: 'dtrap',   name: 'Fire trap',       lo: 1, hi: 3, bf: 0.5, el: 'fire', tip: 'Burns every card its heads point at, then turns clockwise each turn. Fire monsters are immune, ice monsters take double.' },
    icetrap:   { kind: 'dtrap',   name: 'Ice trap',        lo: 1, hi: 3, bf: 0.5, el: 'ice',  tip: 'Freezes every card its heads point at, then turns clockwise each turn. Ice monsters are immune, fire monsters take double.' },
    firesword: { kind: 'weapon',  name: 'Fire sword',      lo: 4, hi: 8, bf: 1, el: 'fire', tip: 'A fire weapon. It cannot hurt fire monsters and hits ice monsters for double.' },
    icesword:  { kind: 'weapon',  name: 'Ice sword',       lo: 4, hi: 8, bf: 1, el: 'ice',  tip: 'An ice weapon. It cannot hurt ice monsters and hits fire monsters for double. A monster it hits but does not kill freezes solid, and a frozen monster cannot be hit: you swap places with it. It can kill a Phoenix.' },
    scythe:    { kind: 'weapon',  name: 'Scythe',         lo: 3, hi: 6, bf: 1,   sweep: true, tip: 'Step toward a monster to sweep: the target and the two squares beside it (across your swing) all take the scythe\'s power. The scythe wears down by the most damage it deals to one target.' },
    webspider: { kind: 'monster', name: 'Web spider',     lo: 3, hi: 9, bf: 1,   tip: 'It hides in its web while you hold any weapon: its health drops to 0 and you can walk straight through it. Bare-handed, it is a real monster.' },
    firearrow: { kind: 'arrow',   name: 'Fire arrow',      lo: 2, hi: 4, bf: 0.5, el: 'fire', tip: 'The arrow turns every turn. Tap it to fire: the whole row or column it points along slides one square that way and every monster in it takes its number as fire damage. You only slide if you are in that line.' },
    icearrow:  { kind: 'arrow',   name: 'Ice arrow',       lo: 2, hi: 4, bf: 0.5, el: 'ice',  tip: 'The arrow turns every turn. Tap it to fire: the whole row or column it points along slides one square that way and every monster in it takes its number as ice damage and freezes if it survives. You only slide if you are in that line.' },
    ninjastar: { kind: 'weapon',  name: 'Ninja star',      lo: 3, hi: 6, bf: 1,   bow: true, star: true, tip: 'Five throws. Tap a monster in your row or column to hit it for the star\'s power. No chain, and nothing outside your row or column can be hit.' },
    gemblade:  { kind: 'weapon',  name: 'Jewel blade',     lo: 2, hi: 4, bf: 0.5, gems: true, tip: 'A sword with 3 jewel slots. Each green jewel adds 1 power every time you take damage. Each blue jewel adds 1 power every time you move.' },
    elecbow:   { kind: 'weapon',  name: 'Electric bow',   lo: 3, hi: 5, bf: 0.5, bow: true, tip: 'A bow with 5 arrows. Tap any monster on the board to shoot it for the bow\'s power. The shock then jumps to every monster touching the one it hit, 1 weaker with each jump. Frozen monsters are not hit. Stepping into a monster with a bow is just like having no weapon.' },
    firewand:  { kind: 'weapon',  name: 'Fire wand',       lo: 1, hi: 3, bf: 0.5, el: 'fire', wand: true, tip: 'A wand with 6 charges. Step toward an adjacent monster to fire a beam from you to the far edge of that row or column. It burns every monster on the way for its power: fire monsters are immune, ice monsters take double.' },
    icewand:   { kind: 'weapon',  name: 'Ice wand',        lo: 1, hi: 3, bf: 0.5, el: 'ice',  wand: true, tip: 'A wand with 6 charges. Step toward an adjacent monster to fire a beam from you to the far edge of that row or column. Every monster it hits but does not kill freezes. Ice monsters are immune, fire monsters take double. It can kill a Phoenix.' },
    phoenix:   { kind: 'monster', name: 'Phoenix',         lo: 4, hi: 8, bf: 1,   el: 'fire', immortal: true, tip: 'It cannot be killed by damage, only worn down to 1. Step on it with no weapon, or hit it with an ice weapon, to finish it.' },
    sword:     { kind: 'weapon',  name: 'Sword',           lo: 4, hi: 8, bf: 1, tip: 'Pick it up to arm yourself. Step toward a monster to hit it for the sword\'s damage. If it dies, you take its place. Each hit wears it down by the health it cuts through.' },
    bomb:      { kind: 'bomb',    name: 'Bomb',            lo: 2, hi: 5, bf: 0.5, tip: 'The big number is its damage, the small one is the fuse. Step on it to swap places with it. At zero it explodes: monsters next to it take its damage, and so do you. Monsters it kills leave an empty space.' },
    // Twenty-five more monsters. [id, name, lo, hi, element]
    // (added below by a loop)
    reward:    { kind: 'reward',  name: 'Locked reward',  lo: 0, hi: 0, bf: 0, hidden: true, tip: 'Step on it to unlock the reward behind the bars.' },
    blank:     { kind: 'empty',   name: 'Empty space',     lo: 0, hi: 0, bf: 0, hidden: true, tip: 'Nothing here. Step in for a free move.' }
  };

  const MORE = [
    ['slime', 'Slime', 1, 3], ['goblin', 'Goblin', 2, 4], ['zombie', 'Zombie', 3, 5], ['ghost', 'Ghost', 2, 5],
    ['spider', 'Cave spider', 2, 4], ['scorpion', 'Scorpion', 3, 5], ['wolf', 'Wolf', 3, 6], ['cultist', 'Cultist', 3, 5],
    ['wraith', 'Wraith', 4, 7], ['shroom', 'Spore shroom', 2, 4], ['gargoyle', 'Gargoyle', 5, 8], ['lich', 'Lich', 5, 9],
    ['harpy', 'Harpy', 3, 6], ['troll', 'Troll', 5, 9], ['minotaur', 'Minotaur', 6, 10], ['snake', 'Viper', 2, 4],
    ['beetle', 'Beetle', 2, 5], ['mummy', 'Mummy', 4, 7], ['vampire', 'Vampire', 4, 7], ['banshee', 'Banshee', 3, 6],
    ['salamander', 'Salamander', 3, 6, 'fire'], ['magmaslime', 'Magma slime', 2, 5, 'fire'],
    ['frostwolf', 'Frost wolf', 3, 6, 'ice'], ['frostwisp', 'Frost wisp', 2, 5, 'ice'], ['icespider', 'Ice spider', 3, 5, 'ice']
  ];
  MORE.forEach(function (m) {
    TYPES[m[0]] = { kind: 'monster', name: m[1], lo: m[2], hi: m[3], bf: 1, el: m[4],
      tip: m[4] ? (m[4] === 'fire' ? 'A fire monster. Fire cannot hurt it and ice hurts it double.' : 'An ice monster. Ice cannot hurt it and fire hurts it double.') : 'Costs you health equal to its number when you step on it.' };
  });

  // ---- Heroes ---------------------------------------------------------------
  // hp: change to the level's hero health. rech: power recharge multiplier.
  const HEROES = {
    knight:   { name: 'Knight',   sprite: 'knight',   hp: 2,  slots: 2, unlock: 0,  pass: { swordBonus: 1 }, desc: 'Sturdy. Swords you pick up are 1 stronger.' },
    sorcerer: { name: 'Sorcerer', sprite: 'sorcerer', hp: -2, slots: 3, unlock: 30, pass: { rech: 0.7 }, startReady: true, desc: 'Frail, but powers start ready and recharge 30% faster. Carries three powers.' },
    icemage:  { name: 'Ice Mage', sprite: 'icemage',  hp: 0,  slots: 2, unlock: 60, pass: { cut: 1 }, desc: 'Frost armour: monsters hit you for 1 less.' },
    rogue:    { name: 'Rogue',    sprite: 'rogue',    hp: -1, slots: 2, unlock: 90, pass: { gold: 1 }, desc: 'Light fingers: +1 gold from every coin and gem.' },
    cactus:   { name: 'Cactus',   sprite: 'cactus',   hp: 1,  slots: 2, unlock: 0,  pass: { thorns: 1 }, desc: 'Prickly: at half health or less, every monster next to you takes 1 damage each turn.' },
  };

  // ---- Powers ---------------------------------------------------------------
  // cd: turns to recharge. target: what a tap must hit (null = acts at once).
  const POWERS = {
    heal:     { name: 'Healing',      sprite: 'p_heal',     cd: 14, target: null,      unlock: 0,  tip: 'Restore 5 health.' },
    forge:    { name: 'Forge',        sprite: 'p_forge',    cd: 12, target: null,      unlock: 10, tip: 'Conjure a sword of power 10. It replaces the one you hold.' },
    dart:     { name: 'Poison dart',  sprite: 'p_dart',     cd: 8,  target: null,      unlock: 20, tip: 'Flies at a random monster. It takes 4 damage and dies if that is enough.' },
    fire:     { name: 'Fire touch',   sprite: 'p_fire',     cd: 10, target: 'card',    unlock: 30, tip: 'Tap any card to burn it away. A new card takes its place.' },
    scythe:   { name: 'Scythe',       sprite: 'p_scythe',   cd: 15, target: null,      unlock: 40, tip: 'Cut down every monster, trap and poison in the 8 cards around you.' },
    massheal: { name: 'Mass healing', sprite: 'p_massheal', cd: 14, target: null,      unlock: 50, tip: 'Heal 2, and make every potion on the board 2 stronger.' },
    thunder:  { name: 'Thunder',      sprite: 'p_thunder',  cd: 16, target: null,      unlock: 60, tip: 'Every monster on the board takes 3 damage.' },
    ice:      { name: 'Frost',        sprite: 'p_ice',      cd: 18, target: null,      unlock: 70, tip: 'Monsters deal no damage for your next 3 moves.' },
    teleport: { name: 'Teleport orb', sprite: 'p_teleport', cd: 12, target: 'card',    unlock: 80, tip: 'Tap any card. You jump there without using it, and it vanishes.' },
    quake:    { name: 'Tremor',       sprite: 'p_quake',    cd: 9,  target: null,      unlock: 45, tip: 'Marks your square. After you step away, the card that takes its place is hit if it is a monster. Damage is 3, plus 1 for every 25 points of your best score (up to 12).' },
    burst:    { name: 'Potion burst', sprite: 'p_burst',    cd: 10, target: 'potion',  unlock: 90, tip: 'Tap a potion. It explodes and hits neighbouring monsters for its number.' },
    ward:     { name: 'Shield',       sprite: 'p_shield',   cd: 12, target: null,      unlock: 50, tip: 'For your next 4 turns, fire and ice can\'t hurt you: elemental traps, trap heads and fire or ice monsters deal no damage.' }
  };

  const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // up, right, down, left
  const ALL8 = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];

  // ---- Random helpers -------------------------------------------------------
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---- Card creation --------------------------------------------------------
  function makeCard(S, type) {
    const T = TYPES[type];
    const L = S.level;
    const cap = L.cap == null ? 6 : L.cap;
    const ramp = L.ramp == null ? 12 : Math.max(1, L.ramp);
    const bump = Math.floor(Math.min(cap, S.hero.turn / ramp) * T.bf);
    const v = T.lo + Math.floor(S.rng() * (T.hi + bump - T.lo + 1));
    const c = { uid: ++S.uid, type: type, kind: T.kind, v: v };
    if (T.ability) c.t = 0;
    if (type === 'bomb') c.t = 3 + Math.floor(S.rng() * 3); // turns until it explodes
    if (T.wand) c.t = 6; // charges
    if (T.bow) c.t = 5; // arrows
    if (T.gems) { // three jewel slots: green grows with damage taken, blue with movement
      c.g = [0, 1, 2].map(function () { const r = S.rng(); return r < 0.4 ? 'g' : r < 0.8 ? 'b' : null; });
      if (!c.g.some(Boolean)) c.g[Math.floor(S.rng() * 3)] = S.rng() < 0.5 ? 'g' : 'b';
    }
    if (T.kind === 'arrow') c.h = Math.floor(S.rng() * 4); // which way it points now
    if (T.kind === 'monster' && L.shieldP && S.rng() < L.shieldP) c.sh = 1; // the first hit is absorbed
    if (T.kind === 'dtrap') {
      // Heads: up, right, down, left. One to four of them, fewer being more common.
      const r = S.rng(), n = r < 0.35 ? 1 : r < 0.7 ? 2 : r < 0.9 ? 3 : 4;
      const hd = [0, 0, 0, 0]; let placed = 0;
      while (placed < n) { const d = Math.floor(S.rng() * 4); if (!hd[d]) { hd[d] = 1; placed++; } }
      c.h = hd;
    }
    return c;
  }

  function blankCard(S) { return { uid: ++S.uid, type: 'blank', kind: 'empty', v: 0 }; }

  function pickType(S) {
    const L = S.level;
    const w = {};
    let total = 0;
    for (const k in TYPES) {
      let x = Number((L.weights || {})[k]) || 0;
      if (x > 0 && L.adapt !== false && TYPES[k].kind === 'heal' && S.hero.hp / S.hero.max < 0.4) x *= 2;
      w[k] = x; total += x;
    }
    if (total <= 0) return 'coin';
    let r = S.rng() * total;
    for (const k in w) { r -= w[k]; if (r < 0) return k; }
    return 'coin';
  }

  function spawn(S, pos) {
    const L = S.level;
    // Once the room's target score is reached, the next card to appear is the locked reward.
    if (L.reward && L.req > 0 && !S.rewardGiven && S.hero && S.hero.gold >= L.req) {
      S.rewardGiven = true;
      const rc = { uid: ++S.uid, type: 'reward', kind: 'reward', v: 0, rw: { kind: L.reward.kind, id: L.reward.id } };
      S.grid[pos] = rc;
      return rc;
    }
    const c = makeCard(S, pickType(S));
    S.grid[pos] = c;
    return c;
  }

  // ---- Game state -----------------------------------------------------------
  // opts: { hero: 'knight', powers: ['heal', ...] }
  function newGame(level, seed, opts) {
    opts = opts || {};
    const hid = HEROES[opts.hero] ? opts.hero : 'knight';
    const HD = HEROES[hid];
    const pass = Object.assign({}, HD.pass);
    const ids = (opts.powers || []).filter(function (p, i, a) { return POWERS[p] && a.indexOf(p) === i; }).slice(0, HD.slots);
    const maxHp = Math.max(3, level.heroHP + HD.hp);
    const S = {
      level: level,
      rng: mulberry32(seed == null ? (Math.random() * 4294967296) >>> 0 : seed),
      uid: 0,
      powerLevel: Math.max(0, Math.min(9, opts.powerLevel | 0)),
      grid: new Array(level.w * level.h).fill(null),
      hero: {
        id: hid,
        pos: Math.floor(level.h / 2) * level.w + Math.floor(level.w / 2),
        hp: maxHp, max: maxHp, gold: 0, turn: 0,
        sword: null, poison: 0, frost: 0, ward: 0, mark: null, pass: pass,
        powers: ids.map(function (id) {
          const rc = Math.max(1, Math.ceil(POWERS[id].cd * (pass.rech || 1)));
          return { id: id, max: rc, cd: HD.startReady ? 0 : Math.ceil(rc / 2) };
        })
      },
      over: false,
      rewardGiven: !!opts.claimed // a room's reward can only be claimed once
    };
    for (let i = 0; i < S.grid.length; i++) if (i !== S.hero.pos) spawn(S, i);
    return S;
  }

  function strip(S) {
    // Copy without the rng so a preview never advances the real game.
    return {
      level: S.level, rng: null, uid: S.uid, over: S.over, powerLevel: S.powerLevel,
      grid: S.grid.map(function (c) { return c && { uid: c.uid, type: c.type, kind: c.kind, v: c.v, t: c.t, h: Array.isArray(c.h) ? c.h.slice() : c.h, frozen: c.frozen, sh: c.sh, rw: c.rw, g: c.g && c.g.slice() }; }),
      hero: {
        id: S.hero.id, pos: S.hero.pos, hp: S.hero.hp, max: S.hero.max, gold: S.hero.gold, turn: S.hero.turn,
        frost: S.hero.frost, ward: S.hero.ward, poison: S.hero.poison, pass: S.hero.pass, mark: S.hero.mark && { cell: S.hero.mark.cell, dmg: S.hero.mark.dmg },
        sword: S.hero.sword && { v: S.hero.sword.v, type: S.hero.sword.type, el: S.hero.sword.el, wand: S.hero.sword.wand, bow: S.hero.sword.bow, c: S.hero.sword.c, sweep: S.hero.sword.sweep, star: S.hero.sword.star, g: S.hero.sword.g },
        powers: S.hero.powers.map(function (p) { return { id: p.id, max: p.max, cd: p.cd }; })
      }
    };
  }

  function hurtHero(S, amount) {
    const H = S.hero;
    const d = amount;
    H.hp -= d;
    if (d > 0) S.hurts = (S.hurts | 0) + 1;
    return d;
  }

  // How a damage source of element srcEl treats a monster: 0 immune, 2 weak, 1 normal.
  function relation(srcEl, m) {
    const me = TYPES[m.type].el;
    if (!srcEl || !me) return 1;
    return me === srcEl ? 0 : 2;
  }
  // Applies damage to a monster. Immortal monsters (the Phoenix) stop at 1 health unless lethal.
  function hurtMonster(m, base, srcEl, lethal) {
    const mult = relation(srcEl, m);
    if (m.sh && mult !== 0 && base > 0) { m.sh = 0; return { dealt: 0, killed: false, mult: 0, immune: false, absorbed: true }; }
    if (mult === 0 || base <= 0) return { dealt: 0, killed: false, mult: mult, immune: mult === 0 };
    let nv = m.v - base * mult;
    if (TYPES[m.type].immortal) nv = lethal ? 0 : Math.max(1, nv); // only a lethal blow can finish it
    const killed = nv <= 0;
    const dealt = m.v - Math.max(nv, 0);
    m.v = Math.max(nv, 0);
    return { dealt: dealt, killed: killed, mult: mult, immune: false };
  }

  function neighbours4(S, pos) {
    const w = S.level.w, h = S.level.h, x = pos % w, y = (pos / w) | 0, out = [];
    for (let d = 0; d < 4; d++) {
      const ax = x + DIRS[d][0], ay = y + DIRS[d][1];
      if (ax >= 0 && ay >= 0 && ax < w && ay < h) out.push(ay * w + ax);
    }
    return out;
  }

  // Closes every gap on the board by sliding cards, then drops new cards in at
  // the board's edge. Gaps left by the hero or by explosions are filled the same way.
  // fd is the direction of the last move: rows or columns along it are tidied.
  function settle(S, fd) {
    const w = S.level.w, h = S.level.h, horiz = fd[0] !== 0;
    const nLines = horiz ? h : w, len = horiz ? w : h;
    const fwd = horiz ? fd[0] : fd[1];
    const out = [];
    function at(l, i) { return horiz ? l * w + i : i * w + l; }
    // cells: positions in increasing order along the line. lb/rb: what bounds each end.
    function fix(cells, lb, rb) {
      if (!cells.length || cells.every(function (p) { return S.grid[p]; })) return;
      // Cards slide toward the hero; with no hero on the line they slide the way you moved.
      let toRight;
      if (lb === 'hero' && rb === 'edge') toRight = false;
      else if (rb === 'hero' && lb === 'edge') toRight = true;
      else toRight = fwd > 0;
      const cards = cells.map(function (p) { return S.grid[p]; }).filter(Boolean);
      const gaps = cells.length - cards.length;
      const fresh = [];
      if (toRight) {
        for (let k = 0; k < gaps; k++) { S.grid[cells[k]] = null; fresh.push(cells[k]); }
        cards.forEach(function (c, k) { S.grid[cells[gaps + k]] = c; });
      } else {
        cards.forEach(function (c, k) { S.grid[cells[k]] = c; });
        for (let k = cards.length; k < cells.length; k++) { S.grid[cells[k]] = null; fresh.push(cells[k]); }
      }
      fresh.forEach(function (p) { out.push({ card: spawn(S, p), cell: p }); });
    }
    for (let l = 0; l < nLines; l++) {
      let seg = [], lb = 'edge';
      for (let i = 0; i < len; i++) {
        const p = at(l, i);
        if (p === S.hero.pos) { fix(seg, lb, 'hero'); seg = []; lb = 'hero'; }
        else seg.push(p);
      }
      fix(seg, lb, 'edge');
    }
    return out;
  }

  // ---- One move -------------------------------------------------------------
  // Mutates S. Returns null when the move is off the grid.
  // Chests hold one of these. Weights, not levels: a chest is a gamble on what you need.
  const LOOT = { sword: 4, scythe: 2, firesword: 1, icesword: 1, firewand: 1, icewand: 1, elecbow: 1, ninjastar: 1, gemblade: 1, potion: 3, gem: 2 };
  function lootCard(S) {
    let total = 0; for (const k in LOOT) total += LOOT[k];
    let r = S.rng() * total, pick = 'potion';
    for (const k in LOOT) { r -= LOOT[k]; if (r < 0) { pick = k; break; } }
    return makeCard(S, pick);
  }

  // An arrow tile: the line it points along slides one square that way and every monster in it is hurt.
  // The hero only slides if the hero is standing in that line.
  function applyArrow(S, pos, fx, extraSpawn) {
    const w = S.level.w, h = S.level.h, H = S.hero, a = S.grid[pos], T = TYPES[a.type], el = T.el;
    const d = a.h, x0 = pos % w, y0 = (pos / w) | 0, line = [];
    if (d % 2 === 1) for (let k = 0; k < w; k++) line.push(y0 * w + (d === 1 ? k : w - 1 - k));
    else for (let k = 0; k < h; k++) line.push((d === 2 ? k : h - 1 - k) * w + x0);
    S.grid[pos] = null;
    fx.push({ cell: pos, text: '', cls: 'info', anim: el });
    line.forEach(function (p) {
      const m = S.grid[p];
      if (!m || m.kind !== 'monster' || m.frozen || m.type === 'webspider') return;
      const v0 = m.v, res = hurtMonster(m, a.v, el, el === 'ice');
      fx.push({ cell: p, text: '', cls: 'info', anim: el });
      if (res.immune) fx.push({ cell: p, text: 'Immune', cls: 'info', anim: 'immune' });
      else if (res.killed) {
        fx.push({ cell: p, text: 'Slain', cls: 'info', anim: 'puff' });
        if (TYPES[m.type].pays) { H.gold += v0; fx.push({ cell: p, text: '+' + v0 + 'G', cls: 'gold', anim: 'gold' }); }
        S.grid[p] = null;
      } else if (!res.absorbed) {
        fx.push({ cell: p, text: '−' + res.dealt, cls: 'info', hit: m.uid });
        if (TYPES[m.type].immortal) fx.push({ cell: p, text: 'Reborn', cls: 'info', anim: 'flare' });
        if (el === 'ice') { m.frozen = true; fx.push({ cell: p, text: 'Frozen', cls: 'info', anim: 'frost' }); }
      }
    });
    // Slide everything one square along the arrow. The hero is a token in the line.
    const n = line.length - 1, HERO = {};
    const items = line.map(function (p) { return p === H.pos ? HERO : S.grid[p]; });
    const next = items[n] === HERO ? [null].concat(items.slice(0, n - 1), [HERO]) : [null].concat(items.slice(0, n));
    line.forEach(function (p, k) {
      if (next[k] === HERO) { H.pos = p; S.grid[p] = null; } else S.grid[p] = next[k];
    });
    if (S.rng) { const c = spawn(S, line[0]); extraSpawn.push({ card: c, cell: line[0] }); } // previews have no dice
    fx.push({ cell: line[0], text: '', cls: 'info', anim: 'puff' });
  }

  // sell: 'sword' turns the held weapon into gold and spends the turn in place.
  function step(S, dir, doSpawn, sell, aim) {
    const L = S.level, w = L.w, h = L.h, H = S.hero;
    const hx = H.pos % w, hy = (H.pos / w) | 0;
    const hurt0 = S.hurts | 0, extraSpawn = [];
    let tpos, card = null, T = null;
    if (sell) {
      if (sell === 'bow') {
        const am = S.grid[aim];
        if (!H.sword || !H.sword.bow || aim === H.pos || !am || am.kind !== 'monster' || am.frozen || am.type === 'webspider') return null;
        if (H.sword.star && (aim % w !== hx && ((aim / w) | 0) !== hy)) return null; // a star only flies along your row or column
      } else if (sell === 'arrow') {
        if (!S.grid[aim] || S.grid[aim].kind !== 'arrow') return null;
      } else if (!H[sell]) return null;
      tpos = H.pos; dir = S.lastDir == null ? 0 : S.lastDir;
    } else {
      const nx = hx + DIRS[dir][0], ny = hy + DIRS[dir][1];
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) return null;
      tpos = ny * w + nx;
      card = S.grid[tpos];
      T = TYPES[card.type];
    }
    const from = H.pos;
    const fx = [];
    let swap = false, attacked = false, attack = null;

    if (sell === 'bow') {
      // Shoot: the target takes full power, and the shock jumps to touching monsters, 1 weaker each jump.
      attacked = true;
      const seen = { [aim]: H.sword.v }, order = [aim], hits = [];
      for (let qi = 0; qi < order.length && !H.sword.star; qi++) {
        const p = order[qi], d = seen[p];
        if (d <= 1) continue;
        for (const ap of neighbours4(S, p)) {
          const m = S.grid[ap];
          if (seen[ap] != null || !m || m.kind !== 'monster' || m.frozen || m.type === 'webspider') continue;
          seen[ap] = d - 1; order.push(ap);
        }
      }
      order.forEach(function (p) {
        const m = S.grid[p], v0 = m.v, res = hurtMonster(m, seen[p], null, false);
        hits.push({ cell: p, dmg: seen[p] });
        fx.push({ cell: p, text: '', cls: 'info', anim: 'bolt' });
        if (res.killed) {
          fx.push({ cell: p, text: 'Slain', cls: 'info', anim: 'puff' });
          if (TYPES[m.type].pays) { H.gold += v0; fx.push({ cell: p, text: '+' + v0 + 'G', cls: 'gold', anim: 'gold' }); }
          S.grid[p] = null;
        } else {
          fx.push({ cell: p, text: '−' + res.dealt, cls: 'info', hit: m.uid });
          if (TYPES[m.type].immortal) fx.push({ cell: p, text: 'Reborn', cls: 'info', anim: 'flare' });
        }
      });
      attack = { dmg: H.sword.v, killed: false, el: null, type: H.sword.type, immune: false, bow: { from: from, target: aim, hits: hits } };
      H.sword.c--;
      if (H.sword.c <= 0) { H.sword = null; fx.push({ cell: from, text: 'Out of ammo', cls: 'info', anim: 'break' }); }
    } else if (sell === 'arrow') {
      attacked = true; applyArrow(S, aim, fx, extraSpawn);
    } else if (sell) {
      const g = H[sell].v;
      H.gold += g; H[sell] = null; attacked = true;
      fx.push({ cell: from, text: 'Sold +' + g + 'G', cls: 'gold', anim: 'gold' });
    } else if (card.kind === 'chest') {
      attacked = true;
      if (S.rng) { S.grid[tpos] = lootCard(S); fx.push({ cell: tpos, text: 'Opened', cls: 'info', anim: 'open' }); }
      else fx.push({ cell: tpos, text: 'Opens', cls: 'info' });
    } else if (card.kind === 'arrow') {
      attacked = true; applyArrow(S, tpos, fx, extraSpawn);
    } else if (card.type === 'webspider' && H.sword) {
      fx.push({ cell: tpos, text: 'Webs', cls: 'info', anim: 'puff' }); // hidden: nothing to fight
    } else if (card.kind === 'monster' && card.frozen) {
      // A frozen monster cannot be hit, even with a weapon. You just swap places with it.
      swap = true; fx.push({ cell: tpos, text: 'Swap', cls: 'info', anim: 'frost' });
    } else if (card.kind === 'monster' && H.sword && H.sword.wand) {
      // A wand fires a beam from the hero to the far edge of the row or column.
      const wel = H.sword.el, beam = [];
      let cx = hx + DIRS[dir][0], cy = hy + DIRS[dir][1], first = true;
      attack = { dmg: 0, killed: false, el: wel, type: H.sword.type, immune: false, beam: { dir: dir, from: from }, hits: 0 };
      while (cx >= 0 && cy >= 0 && cx < w && cy < h) {
        const p = cy * w + cx, m = S.grid[p];
        beam.push(p);
        if (m && m.kind === 'monster' && !m.frozen && m.type !== 'webspider') {
          const v0 = m.v, res = hurtMonster(m, H.sword.v, wel, wel === 'ice');
          attack.hits++;
          if (res.immune) fx.push({ cell: p, text: 'Immune', cls: 'info', anim: 'immune' });
          else if (res.killed) {
            fx.push({ cell: p, text: 'Slain', cls: 'info', anim: 'puff' });
            if (TYPES[m.type].pays) { H.gold += v0; fx.push({ cell: p, text: '+' + v0 + 'G', cls: 'gold', anim: 'gold' }); }
            if (first) attack.killed = true; else S.grid[p] = null;
          } else {
            fx.push({ cell: p, text: '−' + res.dealt, cls: 'info', anim: wel, hit: m.uid });
            if (TYPES[m.type].immortal) fx.push({ cell: p, text: 'Reborn', cls: 'info', anim: 'flare' });
            if (wel === 'ice' && !res.absorbed) { m.frozen = true; fx.push({ cell: p, text: 'Frozen', cls: 'info', anim: 'frost' }); }
          }
          if (first) attack.immune = res.immune;
        }
        first = false;
        cx += DIRS[dir][0]; cy += DIRS[dir][1];
      }
      attack.beam.cells = beam;
      H.sword.c--;
      if (H.sword.c <= 0) { H.sword = null; fx.push({ cell: from, text: 'Wand spent', cls: 'info', anim: 'break' }); }
      attacked = !attack.killed;
    } else if (card.kind === 'monster' && H.sword && H.sword.sweep) {
      // A scythe sweeps: the target plus the two squares beside it, across the direction of the swing.
      const perp = DIRS[(dir + 1) % 4], cells = [tpos];
      const tx = tpos % w, ty = (tpos / w) | 0;
      for (const sgn of [1, -1]) {
        const ax = tx + perp[0] * sgn, ay = ty + perp[1] * sgn;
        if (ax >= 0 && ay >= 0 && ax < w && ay < h) cells.push(ay * w + ax);
      }
      attack = { dmg: 0, killed: false, el: null, type: 'scythe', immune: false, sweep: { dir: dir, cells: cells } };
      let cost = 0;
      cells.forEach(function (p, idx) {
        const m = S.grid[p];
        if (!m || m.kind !== 'monster' || m.frozen || m.type === 'webspider') return;
        const v0 = m.v, res = hurtMonster(m, H.sword.v, null, false);
        cost = Math.max(cost, res.dealt);
        if (idx === 0) { attack.dmg = res.dealt; attack.killed = res.killed; }
        if (res.killed) {
          fx.push({ cell: p, text: 'Slain', cls: 'info', anim: 'puff' });
          if (TYPES[m.type].pays) { H.gold += v0; fx.push({ cell: p, text: '+' + v0 + 'G', cls: 'gold', anim: 'gold' }); }
          if (idx !== 0) S.grid[p] = null;
        } else {
          fx.push({ cell: p, text: '−' + res.dealt, cls: 'info', hit: m.uid });
          if (TYPES[m.type].immortal) fx.push({ cell: p, text: 'Reborn', cls: 'info', anim: 'flare' });
        }
      });
      H.sword.v -= cost;
      if (H.sword.v <= 0) { H.sword = null; fx.push({ cell: from, text: 'Scythe broke', cls: 'info', anim: 'break' }); }
      attacked = !attack.killed;
    } else if (card.kind === 'monster' && H.sword && !H.sword.bow) {
      // Armed: hit the monster instead of walking into it. If it dies, take its place.
      const wel = H.sword.el || null, v0 = card.v;
      const res = hurtMonster(card, H.sword.v, wel, wel === 'ice');
      const cost = res.mult ? Math.ceil(res.dealt / res.mult) : 0; // the blade wears down by the power it spends
      H.sword.v -= cost;
      attack = { dmg: res.dealt, killed: res.killed, el: wel, type: H.sword.type || 'sword', immune: res.immune };
      if (T.immortal && !res.killed && !res.immune) fx.push({ cell: tpos, text: 'Reborn', cls: 'info', anim: 'flare' });
      if (res.immune) fx.push({ cell: tpos, text: 'Immune', cls: 'info', anim: 'immune' });
      else fx.push({ cell: tpos, text: res.killed ? 'Slain' : '−' + res.dealt, cls: 'info', anim: res.killed ? 'puff' : null });
      if (res.killed && T.pays) { H.gold += v0; fx.push({ cell: tpos, text: '+' + v0 + 'G', cls: 'gold', anim: 'gold' }); }
      if (!res.killed && !res.immune && !res.absorbed && wel === 'ice') { card.frozen = true; attack.froze = true; fx.push({ cell: tpos, text: 'Frozen', cls: 'info', anim: 'frost' }); }
      if (H.sword.v <= 0) { H.sword = null; fx.push({ cell: from, text: 'Sword broke', cls: 'info', anim: 'break' }); }
      attacked = !res.killed;
    } else if (card.kind === 'gold') {
      const g = card.v + (H.pass.gold || 0);
      H.gold += g; fx.push({ cell: tpos, text: '+' + g, cls: 'gold', anim: 'gold' });
    } else if (card.kind === 'heal') {
      const g = Math.min(card.v, H.max - H.hp);
      H.hp += g; fx.push({ cell: tpos, text: '+' + g, cls: 'heal', anim: 'heal' });
      if (T.bonusGold) { H.gold += T.bonusGold; fx.push({ cell: tpos, text: '+' + T.bonusGold + 'G', cls: 'gold' }); }
    } else if (card.kind === 'harm' || card.kind === 'dtrap') {
      if (card.type === 'poison') {
        H.poison += card.v; fx.push({ cell: tpos, text: 'Poison ' + card.v, cls: 'hurt', anim: 'poison' });
      } else if (T.el && H.ward > 0) {
        fx.push({ cell: tpos, text: 'Shielded', cls: 'info', anim: 'immune' });
      } else {
        const lost = hurtHero(S, card.v, true);
        fx.push({ cell: tpos, text: lost > 0 ? '−' + lost : 'Blocked', cls: lost > 0 ? 'hurt' : 'info' });
      }
    } else if (card.kind === 'monster') {
      let lost = 0;
      if (H.frost > 0) fx.push({ cell: tpos, text: 'Frozen', cls: 'info' });
      else if (T.el && H.ward > 0) fx.push({ cell: tpos, text: 'Shielded', cls: 'info', anim: 'immune' });
      else {
        lost = hurtHero(S, Math.max(0, card.v - (H.pass.cut || 0)), true);
        fx.push({ cell: tpos, text: lost > 0 ? '−' + lost : 'Blocked', cls: lost > 0 ? 'hurt' : 'info' });
      }
      if (T.pays) { H.gold += card.v; fx.push({ cell: tpos, text: '+' + card.v + 'G', cls: 'gold' }); }
    } else if (card.kind === 'reward') {
      S.claimed = card.rw;
      fx.push({ cell: tpos, text: 'Unlocked!', cls: 'gold', anim: 'gold' });
    } else if (card.kind === 'weapon') {
      H.sword = T.bow ? { v: card.v, type: card.type, el: null, bow: true, star: !!T.star, c: card.t } : T.gems ? { v: card.v + (H.pass.swordBonus || 0), type: card.type, el: null, g: card.g.slice() } : T.sweep ? { v: card.v + (H.pass.swordBonus || 0), type: card.type, el: null, sweep: true } : T.wand ? { v: card.v, type: card.type, el: T.el, wand: true, c: card.t } : { v: card.v + (H.pass.swordBonus || 0), type: card.type, el: T.el || null }; fx.push({ cell: tpos, text: 'Sword ' + H.sword.v, cls: 'info' });
    } else if (card.kind === 'bomb') {
      swap = true; fx.push({ cell: tpos, text: 'Swap', cls: 'info' });
    }

    // The hero steps into the card's cell, and a new card appears where it stood.
    if (!attacked) {
      S.grid[tpos] = null;
      if (swap) S.grid[from] = card; // a bomb you step on swaps places with you
      H.pos = tpos;
    }
    H.turn++;

    // Poison: 1 damage a turn while it lasts, but it never takes the hero below 1 health.
    if (H.poison > 0) {
      H.poison--;
      if (H.hp > 1) { H.hp--; S.hurts = (S.hurts | 0) + 1; fx.push({ cell: H.pos, text: '−1', cls: 'hurt', anim: 'poison' }); }
    }

    // Every bomb burns one turn of fuse. At zero it explodes: the hero and the monsters
    // next to it take the bomb's damage. A monster that dies leaves an empty space.
    for (let p = 0; p < S.grid.length; p++) {
      const bomb = S.grid[p];
      if (!bomb || bomb.kind !== 'bomb') continue;
      bomb.t--;
      if (bomb.t > 0) continue;
      S.grid[p] = null;
      fx.push({ cell: p, text: 'BOOM', cls: 'hurt', anim: 'boom' });
      for (const ap of neighbours4(S, p)) {
        fx.push({ cell: ap, text: '', cls: 'info', anim: 'blast' });
        if (ap === H.pos) {
          const lost = hurtHero(S, bomb.v, true);
          fx.push({ cell: ap, text: lost > 0 ? '−' + lost : 'Blocked', cls: lost > 0 ? 'hurt' : 'info' });
        } else if (S.grid[ap] && S.grid[ap].kind === 'monster') {
          const m = S.grid[ap], res = hurtMonster(m, bomb.v, null, false);
          if (res.killed) { S.grid[ap] = blankCard(S); fx.push({ cell: ap, text: 'Slain', cls: 'info', anim: 'puff' }); }
          else fx.push({ cell: ap, text: '−' + res.dealt, cls: 'info', hit: m.uid });
        }
      }
    }

    // Hive queens turn a neighbouring card into a bat every few turns.
    if (S.rng) {
      for (let p = 0; p < S.grid.length; p++) {
        const q = S.grid[p];
        if (!q || TYPES[q.type].ability !== 'queen') continue;
        q.t = (q.t || 0) + 1;
        if (q.t < 4) continue;
        q.t = 0;
        const options = neighbours4(S, p).filter(function (ap) { const c = S.grid[ap]; return c && ap !== H.pos && c.type !== 'hive' && c.kind !== 'empty' && c.kind !== 'reward'; });
        if (!options.length) continue;
        const ap = options[Math.floor(S.rng() * options.length)];
        S.grid[ap] = makeCard(S, 'bat');
        fx.push({ cell: ap, text: 'Swarm', cls: 'hurt', anim: 'puff' });
      }
    }

    // Arrows turn a quarter every turn.
    for (let p = 0; p < S.grid.length; p++) { const a = S.grid[p]; if (a && a.kind === 'arrow') a.h = (a.h + 1) % 4; }

    // Jewels: green ones add power for every hit you took this turn, blue ones for every step.
    if (H.sword && H.sword.g) {
      const gr = H.sword.g.filter(function (x) { return x === 'g'; }).length, bl = H.sword.g.filter(function (x) { return x === 'b'; }).length;
      const gain = gr * ((S.hurts | 0) - hurt0) + (attacked || sell ? 0 : bl);
      if (gain > 0) { H.sword.v = Math.min(99, H.sword.v + gain); fx.push({ cell: H.pos, text: '+' + gain, cls: 'info', anim: 'gem' }); }
    }

    // Powers recharge and frost wears off.
    for (const pw of H.powers) if (pw.cd > 0) pw.cd--;
    if (H.frost > 0) H.frost--;

    let spawned = extraSpawn;
    if (H.hp <= 0) { S.over = true; H.hp = 0; }
    S.lastDir = dir;
    if (doSpawn) {
      // Leaving a corner: the cards along the edge behind it shift up into the corner,
      // and the new card appears at the far end of that edge.
      const fx0 = from % w, fy0 = (from / w) | 0;
      if (!sell && !attacked && !swap && (fx0 === 0 || fx0 === w - 1) && (fy0 === 0 || fy0 === h - 1) && !S.over) {
        const line = [];
        if (DIRS[dir][0] !== 0) { const sy = fy0 === 0 ? 1 : -1; for (let k = 0; k < h; k++) line.push((fy0 + sy * k) * w + fx0); }
        else { const sx = fx0 === 0 ? 1 : -1; for (let k = 0; k < w; k++) line.push(fy0 * w + fx0 + sx * k); }
        for (let k = 0; k < line.length - 1; k++) S.grid[line[k]] = S.grid[line[k + 1]];
        const far = line[line.length - 1];
        S.grid[far] = null;
        spawned.push({ card: spawn(S, far), cell: far });
      }
      spawned = spawned.concat(settle(S, DIRS[dir]));
    }

    // Thorns: while at half health or less, monsters next to the hero take damage every turn.
    // Checked after the cards have slid, so a monster that slides in next to you is hit too.
    const thornHits = [];
    if (H.pass.thorns && H.hp > 0 && H.hp * 2 <= H.max) {
      for (const ap of neighbours4(S, H.pos)) {
        const m = S.grid[ap];
        if (!m || m.kind !== 'monster') continue;
        const res = hurtMonster(m, H.pass.thorns, null, false);
        thornHits.push({ cell: ap, uid: m.uid, killed: res.killed });
        if (res.killed) { S.grid[ap] = blankCard(S); fx.push({ cell: ap, text: 'Slain', cls: 'info', anim: 'puff' }); }
        else fx.push({ cell: ap, text: '−' + res.dealt, cls: 'info' });
      }
    }

    // Tremor: once the hero has left the marked square, a monster that took its place is hit.
    if (S.rng && H.mark && H.pos !== H.mark.cell && H.hp > 0) {
      const mp = H.mark.cell, m = S.grid[mp];
      if (m && m.kind === 'monster') {
        const res = hurtMonster(m, H.mark.dmg, null, false);
        if (res.killed) { S.grid[mp] = blankCard(S); fx.push({ cell: mp, text: 'Slain', cls: 'info', anim: 'puff' }); }
        else fx.push({ cell: mp, text: '−' + res.dealt, cls: 'info', hit: m.uid });
        fx.push({ cell: mp, text: '', cls: 'info', anim: 'quake' });
      }
      H.mark = null;
    }

    // Directional traps turn clockwise, then hit whatever their heads point at.
    if (S.rng && H.hp > 0) {
      for (let p = 0; p < S.grid.length; p++) {
        const tr = S.grid[p];
        if (!tr || tr.kind !== 'dtrap') continue;
        tr.h = [tr.h[3], tr.h[0], tr.h[1], tr.h[2]];
        const px = p % w, py = (p / w) | 0;
        for (let d = 0; d < 4; d++) {
          if (!tr.h[d]) continue;
          const ax = px + DIRS[d][0], ay = py + DIRS[d][1];
          if (ax < 0 || ay < 0 || ax >= w || ay >= h) continue;
          const ap = ay * w + ax;
          fx.push({ cell: ap, text: '', cls: 'info', anim: TYPES[tr.type].el });
          if (ap === H.pos) {
            if (H.ward > 0) { fx.push({ cell: ap, text: 'Shielded', cls: 'info', anim: 'immune' }); continue; }
            const lost = hurtHero(S, tr.v, true);
            fx.push({ cell: ap, text: lost > 0 ? '−' + lost : 'Blocked', cls: lost > 0 ? 'hurt' : 'info' });
            continue;
          }
          const m = S.grid[ap];
          if (!m || m.kind !== 'monster') continue;
          const res = hurtMonster(m, tr.v, TYPES[tr.type].el, false);
          if (res.immune) { fx.push({ cell: ap, text: 'Immune', cls: 'info', anim: 'immune' }); continue; }
          if (res.killed) { S.grid[ap] = blankCard(S); fx.push({ cell: ap, text: 'Slain', cls: 'info', anim: 'puff' }); }
          else fx.push({ cell: ap, text: '−' + res.dealt, cls: 'info', hit: m.uid });
        }
      }
      if (H.hp <= 0) { S.over = true; H.hp = 0; }
    }

    // The elemental shield wears off after the end-of-turn traps have fired.
    if (H.ward > 0) H.ward--;

    return { from: from, to: tpos, eaten: card, fx: fx, spawned: spawned, attack: attack, moved: !attacked, sold: sell || null, thorns: thornHits };
  }

  // What stepping in a direction would do, without changing the game.
  function preview(S, dir) {
    const c = strip(S);
    const hp0 = c.hero.hp, g0 = c.hero.gold;
    const r = step(c, dir, false);
    if (!r) return null;
    return { dHp: c.hero.hp - hp0, dGold: c.hero.gold - g0, lethal: c.over, card: r.eaten, attack: r.attack, poison: c.hero.poison };
  }

  // Shoot the electric bow at a monster anywhere on the board. Takes a turn, the hero stays put.
  // Fire an arrow tile from anywhere on the board. It takes a turn and you stay put unless the line moves you.
  function fireArrow(S, pos) {
    if (S.over) return null;
    return step(S, 0, true, 'arrow', pos);
  }

  function shootBow(S, pos) {
    if (S.over) return null;
    return step(S, 0, true, 'bow', pos);
  }

  function move(S, dir) {
    if (S.over) return null;
    return step(S, dir, true);
  }

  // Sell the held sword for gold equal to its power. It costs a turn, like opening a chest.
  function sellItem(S, what) {
    if (S.over || what !== 'sword') return null;
    return step(S, 0, true, what);
  }

  // ---- Powers ---------------------------------------------------------------
  // Can this tap target be used with the power in slot idx?
  function validTarget(S, idx, pos) {
    const pw = S.hero.powers[idx];
    if (!pw) return false;
    const need = POWERS[pw.id].target;
    const c = S.grid[pos];
    if (!c || pos === S.hero.pos) return false;
    if (need === 'card') return c.kind !== 'empty' && c.kind !== 'reward' && c.type !== 'phoenix';
    if (need === 'monster') return c.kind === 'monster';
    if (need === 'potion') return c.kind === 'heal';
    return false;
  }

  function hitMonster(S, pos, dmg, holes, fx) {
    const m = S.grid[pos];
    if (!m || m.kind !== 'monster') return;
    const res = hurtMonster(m, dmg, null, false);
    if (res.killed) { S.grid[pos] = null; holes.push(pos); fx.push({ cell: pos, text: 'Slain', cls: 'info', anim: 'puff' }); }
    else fx.push({ cell: pos, text: '−' + res.dealt, cls: 'info', hit: m.uid });
  }

  // Activates the power in slot idx. Free action: it does not take a turn.
  // Returns null when it cannot be used, else { fx, spawned }.
  function usePower(S, idx, target) {
    if (S.over) return null;
    const H = S.hero, pw = H.powers[idx];
    if (!pw || pw.cd > 0) return null;
    const def = POWERS[pw.id];
    if (def.target && !validTarget(S, idx, target)) return null;
    if (pw.id === 'dart') {
      // The dart picks its own victim: any monster on the board, at random.
      const foes = [];
      S.grid.forEach(function (c, p) { if (c && c.kind === 'monster') foes.push(p); });
      if (!foes.length) return null;
      target = foes[Math.floor((S.rng ? S.rng() : Math.random()) * foes.length)];
    }
    const w = S.level.w, h = S.level.h;
    const fx = [], holes = [];
    let extra = null;

    switch (pw.id) {
      case 'heal': {
        const g = Math.min(5, H.max - H.hp); H.hp += g;
        fx.push({ cell: H.pos, text: '+' + g, cls: 'heal', anim: 'heal' }); break;
      }
      case 'forge':
        H.sword = { v: 10, type: 'sword', el: null };
        fx.push({ cell: H.pos, text: 'Sword 10', cls: 'info', anim: 'gold' }); break;
      case 'dart': hitMonster(S, target, 4, holes, fx); extra = { dart: target }; break;
      case 'fire': S.grid[target] = null; holes.push(target); fx.push({ cell: target, text: 'Burn', cls: 'hurt', anim: 'fire' }); break;
      case 'scythe': {
        const x = H.pos % w, y = (H.pos / w) | 0;
        for (const d of ALL8) {
          const ax = x + d[0], ay = y + d[1];
          if (ax < 0 || ay < 0 || ax >= w || ay >= h) continue;
          const ap = ay * w + ax, c = S.grid[ap];
          if (c && c.kind === 'monster' && TYPES[c.type].immortal) { hitMonster(S, ap, 99, holes, fx); fx.push({ cell: ap, text: '', cls: 'info', anim: 'slash' }); }
          else if (c && (c.kind === 'monster' || c.kind === 'harm' || c.kind === 'dtrap')) { S.grid[ap] = null; holes.push(ap); fx.push({ cell: ap, text: 'Slash', cls: 'info', anim: 'slash' }); }
        }
        break;
      }
      case 'massheal': {
        const g = Math.min(2, H.max - H.hp); H.hp += g;
        fx.push({ cell: H.pos, text: '+' + g, cls: 'heal', anim: 'heal' });
        S.grid.forEach(function (c, p) { if (c && c.kind === 'heal') { c.v += 2; fx.push({ cell: p, text: '+2', cls: 'heal', anim: 'heal' }); } });
        break;
      }
      case 'thunder': S.grid.forEach(function (c, p) { if (c && c.kind === 'monster') { fx.push({ cell: p, text: '', cls: 'info', anim: 'bolt' }); hitMonster(S, p, 3, holes, fx); } }); break;
      case 'quake': {
        const dmg = Math.min(12, 3 + (S.powerLevel || 0));
        H.mark = { cell: H.pos, dmg: dmg };
        fx.push({ cell: H.pos, text: 'Tremor ' + dmg, cls: 'info', anim: 'quake' }); break;
      }
      case 'ice': H.frost = 3; fx.push({ cell: H.pos, text: 'Frost', cls: 'info', anim: 'frost' }); break;
      case 'ward': H.ward = 4; fx.push({ cell: H.pos, text: 'Shield', cls: 'info', anim: 'immune' }); break;
      case 'teleport': {
        extra = H.pos; S.grid[target] = null; H.pos = target;
        fx.push({ cell: target, text: 'Warp', cls: 'info', anim: 'swirl' }); fx.push({ cell: extra, text: '', cls: 'info', anim: 'swirl' }); break;
      }
      case 'burst': {
        const v = S.grid[target].v;
        S.grid[target] = null; holes.push(target);
        fx.push({ cell: target, text: 'BOOM', cls: 'hurt', anim: 'boom' });
        for (const ap of neighbours4(S, target)) { fx.push({ cell: ap, text: '', cls: 'info', anim: 'blast' }); hitMonster(S, ap, v, holes, fx); }
        break;
      }
    }
    pw.cd = pw.max;
    const spawned = settle(S, DIRS[S.lastDir == null ? 1 : S.lastDir]);
    return { fx: fx, spawned: spawned, id: pw.id, target: target, from: extra };
  }

  // ---- Level helpers --------------------------------------------------------
  const WEAPON_RATE = 0.5;
  // Turns per +1 to new card values. Room targets run up to 100 gold, so runs are long and the climb is gentle.
  const RAMP = 30;
  // Starting health before the hero's own bonus. Raised with the longer runs.
  const HERO_BASE_HP = 15;
  const SIZES = [[3, 3], [3, 4], [4, 4], [4, 5], [5, 5], [5, 6], [6, 6], [6, 7], [7, 7]];

  const BASE_WEIGHTS = { coin: 28, gem: 5, potion: 12, chest: 3, poison: 6, trap: 6, rat: 14, bat: 10, skeleton: 8, ogre: 2, goldskull: 3, hive: 0, sword: 10, scythe: 0, firesword: 0, icesword: 0, firewand: 0, icewand: 0, elecbow: 0, ninjastar: 0, gemblade: 0, firearrow: 0, icearrow: 0, webspider: 0, phoenix: 0, bomb: 5, imp: 0, golem: 0, firetrap: 0, icetrap: 0 };
  MORE.forEach(function (m) { BASE_WEIGHTS[m[0]] = 0; });

  // Builds the next level from the one before it, a little harder each time.
  function nextLevel(prev, id) {
    const i = Math.min(id - 1, 60);
    const size = SIZES[Math.min(SIZES.length - 1, Math.floor(i / 1.5))] || [7, 7];
    const wts = {};
    for (const k in BASE_WEIGHTS) wts[k] = BASE_WEIGHTS[k];
    const t = Math.min(1, i / 30);
    wts.potion = Math.max(5, Math.round(12 - 6 * t));
    wts.poison = Math.round(6 + 4 * t);
    wts.trap = Math.round(6 + 4 * t);
    wts.skeleton = Math.round(8 + 6 * t);
    wts.ogre = Math.round(2 + 8 * t);
    wts.rat = Math.max(6, Math.round(14 - 6 * t));
    wts.gem = Math.round(5 + 2 * t);
    wts.goldskull = i >= 1 ? 3 : 0;
    wts.imp = i >= 1 ? Math.round(4 + 3 * t) : 0;
    wts.golem = i >= 1 ? Math.round(4 + 3 * t) : 0;
    wts.firetrap = i >= 2 ? Math.round(3 + 3 * t) : 0;
    wts.icetrap = i >= 2 ? Math.round(3 + 3 * t) : 0;
    // Weapons are twice as common in the early levels, easing back to the normal rate by level 10.
    // WEAPON_RATE scales every weapon's odds: they are both your attack and (sold) your main gold.
    const wm = (2 - Math.min(1, i / 10)) * WEAPON_RATE;
    wts.sword = Math.round(10 * wm);
    wts.scythe = i >= 1 ? Math.round(3 * wm) : 0;
    wts.firesword = i >= 1 ? Math.round(2 * wm) : 0;
    wts.icesword = i >= 1 ? Math.round(2 * wm) : 0;
    wts.webspider = i >= 1 ? 3 : 0;
    wts.firearrow = i >= 2 ? 3 : 0;
    wts.icearrow = i >= 2 ? 3 : 0;
    wts.gemblade = i >= 1 ? Math.round(3 * wm) : 0;
    wts.ninjastar = i >= 2 ? Math.round(2 * wm) : 0;
    wts.elecbow = i >= 2 ? Math.round(2 * wm) : 0;
    wts.firewand = i >= 2 ? Math.round(2 * wm) : 0;
    wts.icewand = i >= 2 ? Math.round(2 * wm) : 0;
    wts.phoenix = i >= 4 ? 2 : 0;
    // The new monsters join in order of strength, a few at a time.
    MORE.forEach(function (m) {
      const tier = Math.max(0, Math.floor((m[2] + m[3]) / 2) - 3) + (m[4] ? 1 : 0);
      wts[m[0]] = i >= tier ? 2 : 0;
    });
    wts.hive = i >= 3 ? Math.round(2 + 3 * t) : 0;
    // More monster kinds should not mean more monsters: keep the monster share close to what it was.
    const oldM = ['rat', 'bat', 'skeleton', 'ogre', 'goldskull', 'imp', 'golem', 'hive'];
    const newM = ['phoenix'].concat(MORE.map(function (m) { return m[0]; }));
    let oT = 0, nT = 0;
    oldM.forEach(function (k) { oT += wts[k]; }); newM.forEach(function (k) { nT += wts[k]; });
    if (nT > 0) {
      const f = (oT + 0.3 * nT) / (oT + nT);
      oldM.concat(newM).forEach(function (k) { wts[k] = Math.round(wts[k] * f * 10) / 10; });
    }
    return {
      id: id,
      name: 'Depth ' + id,
      w: prev ? Math.max(prev.w, size[0]) : size[0],
      h: prev ? Math.max(prev.h, size[1]) : size[1],
      heroHP: HERO_BASE_HP + Math.min(10, Math.floor(i / 3)),
      from: id - 1, req: id > 1 ? 14 + (id - 1) : 0,
      ramp: RAMP, cap: Math.min(10, 4 + Math.floor(i / 2)),
      shieldP: i >= 6 ? Math.min(0.45, (i - 5) * 0.07) : 0, // shielded monsters only show up deep down
      weights: wts
    };
  }

  const api = {
    TYPES: TYPES, HEROES: HEROES, POWERS: POWERS, DIRS: DIRS,
    newGame: newGame, move: move, sellItem: sellItem, shootBow: shootBow, fireArrow: fireArrow, quakeDamage: function (lv) { return Math.min(12, 3 + (lv | 0)); }, preview: preview, usePower: usePower, validTarget: validTarget,
    nextLevel: nextLevel, BASE_WEIGHTS: BASE_WEIGHTS, WEAPON_RATE: WEAPON_RATE, HERO_BASE_HP: HERO_BASE_HP, mulberry32: mulberry32
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DC = api;
})(typeof window !== 'undefined' ? window : globalThis);
