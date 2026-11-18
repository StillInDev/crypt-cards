(function () {
  'use strict';
  var DC = window.DC, TYPES = DC.TYPES, SPR = window.SPR || {};
  // A salamander's dropped tail has no art of its own yet: it borrows the salamander's (drawn small, see .tail).
  if (!SPR.tail) SPR.tail = SPR.salamander;
  if (!SPR.orb) SPR.orb = SPR.p_teleport;
  function img(type, cls) {
    var i = document.createElement('img');
    i.src = SPR[type] || ''; i.alt = ''; i.draggable = false;
    if (cls) i.className = cls;
    return i;
  }
  var $ = function (s) { return document.querySelector(s); };

  // The starter dungeon is a football: 1, 2, 3, 3, 2, 1 rooms from the entrance (top) to the throne room (bottom).
  // from = the room numbers (1-based, 0 = the entrance) that lead here. A room opens once ANY of them is cleared.
  // A room is cleared by reaching its target score and then stepping on the locked reward that appears.
  var THEMES = {
    cellar:   { bg: '#201a16', card: '#3f3530', acc: '#d1a45f', icon: 'rat',       sub: 'Rats and rot',
                w: { rat: 16, bat: 5, slime: 5, skeleton: 3, poison: 6, trap: 4, bomb: 2 } },
    sewers:   { bg: '#13241f', card: '#2b4a42', acc: '#63c74d', icon: 'slime',     sub: 'Slime and poison',
                w: { slime: 8, rat: 6, snake: 6, zombie: 2, poison: 12, potion: 14, trap: 3 } },
    barracks: { bg: '#1b1f31', card: '#3a4262', acc: '#f0883a', icon: 'goblin',    sub: 'Goblins and steel',
                w: { goblin: 8, skeleton: 5, cultist: 2, goldskull: 3, sword: 16, scythe: 6, windblade: 2, painblade: 2, ninjastar: 3, trap: 5 } },
    fungus:   { bg: '#231a30', card: '#4a3560', acc: '#e07bd8', icon: 'shroom',    sub: 'Spores everywhere',
                w: { shroom: 8, spider: 6, hive: 3, slime: 3, beetle: 3, poison: 10, potion: 18, webspider: 3 } },
    catacombs:{ bg: '#1a1a1b', card: '#45433f', acc: '#e0dac0', icon: 'skeleton',  sub: 'The restless dead',
                w: { skeleton: 8, zombie: 6, ghost: 5, mummy: 3, wraith: 2, goldskull: 4, trap: 7 } },
    mine:     { bg: '#261e14', card: '#4e4230', acc: '#fee761', icon: 'gem',       sub: 'Gems and gunpowder',
                w: { scorpion: 6, beetle: 6, goldskull: 5, golem: 3, imp: 3, gem: 14, bomb: 7, trap: 9 } },
    frozen:   { bg: '#0f2230', card: '#2e5469', acc: '#2ce8f5', icon: 'icespider', sub: 'Everything is frozen',
                w: { frostwolf: 6, frostwisp: 6, icespider: 5, golem: 6, trap: 6, icewand: 6, icesword: 4, firesword: 3 } },
    library:  { bg: '#1d1730', card: '#403669', acc: '#a58bff', icon: 'lich',      sub: 'Forbidden knowledge',
                w: { cultist: 6, lich: 3, banshee: 5, wraith: 4, ghost: 3, sword: 10, scythe: 3, elecbow: 4, firewand: 6, icewand: 6 } },
    ember:    { bg: '#2a1410', card: '#5d2e25', acc: '#ff6a1f', icon: 'imp',       sub: 'Fire and brimstone',
                w: { imp: 6, salamander: 6, magmaslime: 6, phoenix: 2, trap: 6, firewand: 4, firesword: 4, icesword: 3, bomb: 4 } },
    armory:   { bg: '#1a2029', card: '#4a5569', acc: '#c0cbdc', icon: 'gargoyle',  sub: 'Every weapon you can think of',
                w: { gargoyle: 6, goblin: 4, skeleton: 5, sword: 14, firesword: 4, icesword: 4, scythe: 5, windblade: 3, painblade: 3, ninjastar: 4, elecbow: 3 } },
    vampire:  { bg: '#270f1d', card: '#5b2641', acc: '#ff5560', icon: 'vampire',   sub: 'They hunt in the dark',
                w: { vampire: 6, bat: 8, wolf: 4, mummy: 4, banshee: 3, potion: 8, poison: 6, trap: 4 } },
    throne:   { bg: '#1e1236', card: '#56366f', acc: '#fee761', icon: 'minotaur',  sub: 'The last stand',
                w: { troll: 6, minotaur: 4, lich: 3, gargoyle: 4, vampire: 3, hive: 2, goldskull: 3, trap: 12 } }
  };
  // Every area has the same 12 rooms and two routes down to the boss:
  //   easy (left):  Sewers 150 -> Fungus Caves 160 -> Frozen Cavern 180 -> Armory 200. Plain doors, no unlocks.
  //   hard (right): Barracks 200 -> Mine 230 -> Ember Halls 260 -> Vampire Crypt 280. Tougher cards, and these
  //                 rooms hold the unlocks, so heroes and powers cost more to earn.
  //   between them: Catacombs 200 (a door) and Bone Library 220 (an unlock), joining the two routes.
  // req is the gold that reveals a room's reward. Each hero and power is the reward of one room in one area
  // (reward/more, area is 1-based): five in the first area, four in each of the others, spread over the rows.
  var ROOMS = [
    { name: 'Cellar',         theme: 'cellar',    row: 0, from: [0],       req: 100 },
    { name: 'Sewers',         theme: 'sewers',    row: 1, from: [1],       req: 150 },
    { name: 'Barracks',       theme: 'barracks',  row: 1, from: [1],       req: 200, hard: true, reward: { kind: 'power', id: 'scythe', area: 1 },
      more: [{ kind: 'hero', id: 'barbarian', area: 2 }, { kind: 'hero', id: 'rogue', area: 3 }, { kind: 'power', id: 'quake', area: 4 }, { kind: 'power', id: 'laststand', area: 5 }] },
    { name: 'Fungus Caves',   theme: 'fungus',    row: 2, from: [2],       req: 160 },
    { name: 'Catacombs',      theme: 'catacombs', row: 2, from: [2, 3],    req: 200 },
    { name: 'Mine',           theme: 'mine',      row: 2, from: [3],       req: 230, hard: true, reward: { kind: 'power', id: 'whetstone', area: 1 },
      more: [{ kind: 'power', id: 'magnet', area: 2 }, { kind: 'power', id: 'ward', area: 3 }, { kind: 'power', id: 'hourglass', area: 4 }, { kind: 'hero', id: 'icemage', area: 5 }] },
    { name: 'Frozen Cavern',  theme: 'frozen',    row: 3, from: [4],       req: 180 },
    { name: 'Bone Library',   theme: 'library',   row: 3, from: [4, 5, 6], req: 220, reward: { kind: 'hero', id: 'sorcerer', area: 1 },
      more: [{ kind: 'hero', id: 'stormmage', area: 2 }, { kind: 'power', id: 'teleport', area: 3 }, { kind: 'hero', id: 'bard', area: 4 }, { kind: 'power', id: 'thunder', area: 5 }] },
    { name: 'Ember Halls',    theme: 'ember',     row: 3, from: [6],       req: 260, hard: true, reward: { kind: 'power', id: 'fire', area: 1 },
      more: [{ kind: 'hero', id: 'dragonkin', area: 2 }, { kind: 'power', id: 'burst', area: 3 }] },
    { name: 'Armory',         theme: 'armory',    row: 4, from: [7, 8],    req: 200 },
    { name: 'Vampire Crypt',  theme: 'vampire',   row: 4, from: [8, 9],    req: 280, hard: true, reward: { kind: 'hero', id: 'count', area: 1 },
      more: [{ kind: 'power', id: 'massheal', area: 4 }, { kind: 'power', id: 'ice', area: 5 }] },
    { name: 'Throne Room',    theme: 'throne',    row: 5, from: [10, 11],  req: 300 }
  ];
  // Where each unlock was before the routes above (room index across all areas), so a save that had cleared
  // those rooms keeps what it unlocked. See keepOldUnlocks.
  var OLD_UNLOCKS = { 1: 'power:massheal', 2: 'power:scythe', 4: 'hero:sorcerer', 5: 'power:whetstone', 12: 'power:quake',
    17: 'power:ward', 18: 'hero:icemage', 19: 'hero:stormmage', 24: 'hero:bard', 26: 'hero:barbarian', 27: 'power:burst',
    32: 'power:fire', 34: 'hero:count', 42: 'power:hourglass', 43: 'power:teleport', 44: 'hero:dragonkin', 45: 'hero:rogue',
    52: 'power:laststand', 53: 'power:magnet', 58: 'power:thunder', 59: 'power:ice' };
  var THEME_ORDER = ROOMS.map(function (r) { return r.theme; });
  // The dungeon is split into areas, picked with the tabs above the map. An area opens once the last room
  // (the boss room) of the area before it is cleared: the boss drops the special key to the next area.
  // Areas 2 to 5 are placeholders for now: copies of area 1's rooms.
  var AREAS = [
    { name: 'The Crypt' },
    { name: 'The Depths' },
    { name: 'Sunken Halls' },
    { name: 'Ashen Keep' },
    { name: 'The Abyss' }
  ];
  // Pixel check mark: the equip toggle in the details panel and cleared rooms on the map.
  var CHECK_SVG = '<svg viewBox="0 0 9 7" shape-rendering="crispEdges" aria-hidden="true"><path d="M7 0h2v2H8v1H7v1H6v1H5v1H4v1H3V6H2V5H1V4H0V2h2v1h1v1h1V3h1V2h1V1h1z"/></svg>';
  var START_HEROES = ['knight', 'cactus'];
  var START_POWERS = ['heal', 'forge', 'dart'];
  var TYPE_ORDER = Object.keys(TYPES).filter(function (k) { return !TYPES[k].hidden; });

  // ---- Storage (kept light: it may be missing) ------------------------------
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };

  // ---- Level data -----------------------------------------------------------
  function clampInt(x, lo, hi, d) {
    x = parseInt(x, 10);
    if (isNaN(x)) x = d;
    return Math.max(lo, Math.min(hi, x));
  }
  function cleanFrom(f, i) {
    if (i === 0) return [0];
    var list = Array.isArray(f) ? f : (f == null ? [i] : [f]), out = [];
    list.forEach(function (x) { x = clampInt(x, 0, i, i); if (out.indexOf(x) < 0) out.push(x); });
    return out.length ? out : [i];
  }
  function cleanReward(r) {
    if (r && r.kind === 'hero' && DC.HEROES[r.id]) return { kind: 'hero', id: r.id };
    if (r && r.kind === 'power' && DC.POWERS[r.id] && !DC.POWERS[r.id].disabled) return { kind: 'power', id: r.id }; // a disabled power's room just opens the way on
    return { kind: 'door' };
  }
  function sanitize(L, i) {
    L = L || {};
    var w = {}, total = 0;
    for (var k in TYPES) {
      var n = Number((L.weights || {})[k]);
      w[k] = isFinite(n) && n > 0 ? Math.min(999, n) : 0;
      total += w[k];
    }
    if (total <= 0) w.coin = 1;
    var sp = L.shieldP != null && isFinite(Number(L.shieldP)) ? Math.max(0, Math.min(1, Number(L.shieldP))) : (i >= 6 ? Math.min(0.45, (i - 5) * 0.07) : 0);
    return {
      id: i + 1,
      name: String(L.name || ('Level ' + (i + 1))).slice(0, 24),
      w: clampInt(L.w, 2, 7, 3), h: clampInt(L.h, 2, 7, 3),
      heroHP: clampInt(L.heroHP, 3, 60, DC.HERO_BASE_HP),
      from: cleanFrom(L.from, i),
      area: clampInt(L.area, 1, AREAS.length, 1),
      req: clampInt(L.req, 1, 9999, 30 + 5 * i),
      theme: THEMES[L.theme] ? L.theme : (THEME_ORDER[i] || 'cellar'),
      reward: cleanReward(L.reward),
      ramp: clampInt(L.ramp, 1, 99, 12), cap: clampInt(L.cap, 0, 30, 6),
      adapt: L.adapt !== false,
      shieldP: sp,
      weights: w
    };
  }
  // Every room gets its own monsters and items: start from the depth's generic odds, drop all monsters, then apply the theme.
  // depth: 0 for the first room of the dungeon, 1 for the last. The theme only picks WHICH monsters and traps show up;
  // how many is set here, a share of the deck that rises the deeper you go.
  var MONSTER_SHARE = [0.40, 0.55], TRAP_SHARE = [0.10, 0.16];
  function themedWeights(themeKey, diffId, depth) {
    var base = DC.nextLevel(null, diffId).weights, w = {};
    var CLEAR = ['bomb', 'firesword', 'icesword', 'firewand', 'icewand', 'elecbow', 'ninjastar', 'windblade', 'painblade', 'scythe', 'trap', 'poison', 'goldskull'];
    for (var k in TYPES) {
      var T = TYPES[k];
      w[k] = (T.kind === 'monster' || CLEAR.indexOf(k) >= 0) ? 0 : (base[k] || 0);
    }
    var tw = THEMES[themeKey].w;
    for (var t in tw) if (TYPES[t]) w[t] = TYPES[t].kind === 'weapon' ? tw[t] * DC.WEAPON_RATE : tw[t];
    var d = Math.max(0, Math.min(1, depth || 0));
    var mS = MONSTER_SHARE[0] + (MONSTER_SHARE[1] - MONSTER_SHARE[0]) * d;
    var tS = TRAP_SHARE[0] + (TRAP_SHARE[1] - TRAP_SHARE[0]) * d;
    var isTrap = function (k) { return TYPES[k].kind === 'harm' || TYPES[k].kind === 'dtrap'; };
    var M = 0, Tr = 0, P = 0;
    for (k in w) { if (!w[k]) continue; if (TYPES[k].kind === 'monster') M += w[k]; else if (isTrap(k)) Tr += w[k]; else P += w[k]; }
    if (!Tr) { w.trap = 1; Tr = 1; } // every room has at least arrow traps
    var unit = P / (1 - mS - tS);
    for (k in w) {
      if (!w[k]) continue;
      if (M && TYPES[k].kind === 'monster') w[k] = Math.round(w[k] * unit * mS / M * 10) / 10;
      else if (isTrap(k)) w[k] = Math.round(w[k] * unit * tS / Tr * 10) / 10;
    }
    return w;
  }
  function defaultLevels() {
    var out = [];
    AREAS.forEach(function (A, a) {
      var base = a * ROOMS.length;
      ROOMS.forEach(function (R) {
        var diff = 1 + R.row * 2 + (R.hard ? 1 : 0); // the hard route's cards are a step tougher
        var L = DC.nextLevel(null, diff);
        L.name = R.name; L.theme = R.theme; L.req = R.req; L.area = a + 1;
        L.from = R.from.map(function (p) { return p === 0 ? 0 : p + base; });
        var rw = (R.reward ? [R.reward] : []).concat(R.more || []).filter(function (x) { return x.area === a + 1; })[0];
        L.reward = rw ? { kind: rw.kind, id: rw.id } : { kind: 'door' };
        var last = AREAS.length * 6 - 1; // 6 rows per area
        L.weights = themedWeights(R.theme, diff, (a * 6 + R.row) / last);
        L.shieldP = R.theme === 'throne' ? 0.45 : R.row >= 4 ? 0.2 : R.row >= 3 ? 0.1 : 0;
        out.push(sanitize(L, out.length));
      });
    });
    return out;
  }
  // Levels saved before areas existed are all area 1: append the other areas after them.
  function addAreas(list) {
    var defs = defaultLevels(), shift = list.length - ROOMS.length;
    defs.forEach(function (d) {
      if (d.area === 1) return;
      d.from = d.from.map(function (p) { return p === 0 ? 0 : p + shift; });
      list.push(sanitize(d, list.length));
    });
    return list;
  }
  function parseLevels(text) {
    var d = JSON.parse(text);
    if (!Array.isArray(d) || !d.length) throw new Error('Expected a list with at least one level.');
    if (d.length > 200) throw new Error('That is more than 200 levels.');
    return d.map(sanitize);
  }

  var levels, best = {}, cleared = {}, unlockAll = false, heroSel = 'knight', powSel = ['heal'];
  // purse: gold banked from finished runs, spent on upgrades. ups: { powerId: level }, hups: { heroId: level }.
  // owned: heroes and powers bought with gold, { 'hero:id': 1, 'power:id': 1 }.
  var purse = 0, ups = {}, hups = {}, owned = {};
  function loadAll(snapshot) {
    levels = null;
    var hasAreas = false;
    try { var t = store.get('cc_levels2'); if (t) { levels = parseLevels(t); hasAreas = t.indexOf('"area"') >= 0; } } catch (e) { levels = null; }
    // A snapshot from the old score-gated map has no rewards or themes, so it is ignored.
    if (snapshot && snapshot.levels && snapshot.levels[0] && snapshot.levels[0].reward) {
      try { levels = snapshot.levels.map(sanitize); hasAreas = snapshot.levels.some(function (L) { return L.area != null; }); } catch (e) { /* keep */ }
    }
    var builtIn = !levels;
    if (!levels) levels = defaultLevels();
    else if (!hasAreas) levels = addAreas(levels);
    // Saved levels from before the newer cards existed get the new cards added, so they still show up.
    var OLD = ['coin', 'gem', 'potion', 'chest', 'poison', 'trap', 'rat', 'bat', 'skeleton', 'ogre', 'goldskull', 'hive', 'sword', 'bomb', 'blank'];
    var newKeys = Object.keys(TYPES).filter(function (k) { return OLD.indexOf(k) < 0; });
    levels.forEach(function (L, i) {
      var def = DC.nextLevel(null, i + 1).weights;
      newKeys.forEach(function (k) { if (L.weights[k] == null) L.weights[k] = def[k] || 0; });
    });
    try { best = JSON.parse(store.get('cc_best') || '{}') || {}; } catch (e) { best = {}; }
    if (snapshot && snapshot.best) best = snapshot.best;
    try { cleared = JSON.parse(store.get('cc_clear') || '{}') || {}; } catch (e) { cleared = {}; }
    if (snapshot && snapshot.cleared) cleared = snapshot.cleared;
    unlockAll = snapshot && snapshot.unlockAll != null ? !!snapshot.unlockAll : store.get('cc_all') === '1';
    heroSel = (snapshot && snapshot.hero) || store.get('cc_hero') || 'knight';
    try { powSel = (snapshot && snapshot.pows) || JSON.parse(store.get('cc_pows') || '["heal"]'); } catch (e) { powSel = ['heal']; }
    purse = snapshot && snapshot.purse != null ? snapshot.purse : clampInt(store.get('cc_purse'), 0, 1e9, 0);
    try { ups = (snapshot && snapshot.ups) || JSON.parse(store.get('cc_ups') || '{}') || {}; } catch (e) { ups = {}; }
    try { hups = (snapshot && snapshot.hups) || JSON.parse(store.get('cc_hups') || '{}') || {}; } catch (e) { hups = {}; }
    try { owned = (snapshot && snapshot.owned) || JSON.parse(store.get('cc_owned') || '{}') || {}; } catch (e) { owned = {}; }
    if (builtIn) keepOldUnlocks(); // custom (edited or imported) rooms keep their own rewards
    else doubleOldTargets();
    fixSelection();
  }
  // Once per save: the rewards moved to new rooms (the easy and hard routes), so anything a cleared room had
  // already unlocked under the old layout is kept, as if it had been bought.
  function keepOldUnlocks() {
    if (store.get('cc_rw') === '2') return;
    var changed = false;
    for (var i in OLD_UNLOCKS) if (cleared[i] && !owned[OLD_UNLOCKS[i]]) { owned[OLD_UNLOCKS[i]] = 1; changed = true; }
    if (changed) savePurse();
    store.set('cc_rw', '2');
  }
  // Once per save: room targets were doubled. Saved rooms still on the old default target get the new one;
  // a target the player changed in the editor is left alone.
  function doubleOldTargets() {
    if (store.get('cc_req') === '2') return;
    var changed = false;
    levels.forEach(function (L, i) {
      var R = ROOMS[i % ROOMS.length];
      if (R && L.theme === R.theme && L.req * 2 === R.req) { L.req = R.req; changed = true; }
    });
    if (changed) saveLevels();
    store.set('cc_req', '2');
  }
  function upLv(id) { return Math.max(0, Math.min(DC.POWER_MAX_LV, ups[id] | 0)); }
  function heroUpLv(id) { return Math.max(0, Math.min(DC.HERO_MAX_LV, hups[id] | 0)); }
  function heroHp(id) { return DC.HERO_BASE_HP + DC.HEROES[id].hp + DC.heroHpBonus(heroUpLv(id)); }
  function savePurse() { store.set('cc_purse', String(purse)); store.set('cc_ups', JSON.stringify(ups)); store.set('cc_hups', JSON.stringify(hups)); store.set('cc_owned', JSON.stringify(owned)); }
  // A run's gold goes into the purse once, when the run ends (the hero falls).
  function bankRun() {
    if (!S || S.banked) return 0;
    S.banked = true;
    var g = S.hero.gold | 0;
    if (g > 0) { purse += g; savePurse(); }
    return g;
  }
  // Walking away from a run that is still going forfeits it: its gold is not banked and its score is not
  // kept. Rewards already claimed in the run stay unlocked.
  function forfeitRun() { if (S) S.banked = true; }
  // A run still in progress with something to lose.
  function runAtStake() { return !!(S && !S.over && !S.banked && current === 'play' && (S.hero.gold | 0) > 0); }
  // Asks before leaving a run in progress; then runs go() if the player still wants to leave.
  var leaveGo = null;
  function guardLeave(go) {
    if (!runAtStake()) { go(); return; }
    leaveGo = go;
    $('#l-note').textContent = 'You will lose the ' + S.hero.gold + ' gold from this run, and it will not count toward your best. ' +
      'A run only keeps its gold when it ends.';
    $('#leave').classList.add('on');
    $('#l-stay').focus();
  }
  function closeLeave() { $('#leave').classList.remove('on'); leaveGo = null; }
  function buyUpgrade(id) {
    var lv = upLv(id), cost = DC.upgradeCost(lv);
    if (cost == null || purse < cost || !powerOpen(id)) return false;
    purse -= cost; ups[id] = lv + 1; savePurse();
    return true;
  }
  function buyUnlock(kind, id) {
    var cost = kind === 'hero' ? DC.HERO_BUY_COST : DC.POWER_BUY_COST;
    if (purse < cost || (kind === 'hero' ? heroOpen(id) : powerOpen(id))) return false;
    purse -= cost; owned[kind + ':' + id] = 1; savePurse();
    return true;
  }
  function buyHeroUpgrade(id) {
    var lv = heroUpLv(id), cost = DC.heroUpgradeCost(lv);
    if (cost == null || purse < cost || !heroOpen(id)) return false;
    purse -= cost; hups[id] = lv + 1; savePurse();
    return true;
  }
  function maxScore() {
    var m = 0;
    for (var k in best) m = Math.max(m, best[k] || 0);
    return m;
  }
  function powerLevel() { return unlockAll ? 9 : Math.min(9, Math.floor(maxScore() / 25)); }
  function powerTip(id, lv) { return DC.powerTip(id, lv == null ? upLv(id) : lv, powerLevel()); }
  // Where a hero or power is found: the room whose reward it is (null for the ones you start with).
  function rewardRoom(kind, id) {
    for (var i = 0; i < levels.length; i++) { var r = levels[i].reward; if (r && r.kind === kind && r.id === id) return i; }
    return -1;
  }
  function heroOpen(id) {
    if (unlockAll || START_HEROES.indexOf(id) >= 0 || owned['hero:' + id]) return true;
    var r = rewardRoom('hero', id);
    return r < 0 ? false : !!cleared[r];
  }
  function powerOpen(id) {
    if (unlockAll || START_POWERS.indexOf(id) >= 0 || owned['power:' + id]) return true;
    var r = rewardRoom('power', id);
    return r < 0 ? false : !!cleared[r];
  }
  function fixSelection() {
    if (!DC.HEROES[heroSel] || !heroOpen(heroSel)) heroSel = 'knight';
    var slots = DC.HEROES[heroSel].slots;
    powSel = (Array.isArray(powSel) ? powSel : []).filter(function (p, i, a) { return DC.POWERS[p] && !DC.POWERS[p].disabled && powerOpen(p) && a.indexOf(p) === i; }).slice(0, slots);
    if (!powSel.length && powerOpen('heal')) powSel = ['heal'];
  }
  function saveSelection() { store.set('cc_hero', heroSel); store.set('cc_pows', JSON.stringify(powSel)); }
  function saveLevels() { store.set('cc_levels2', JSON.stringify(levels)); }
  function saveCleared() { store.set('cc_clear', JSON.stringify(cleared)); }
  function saveBest() { store.set('cc_best', JSON.stringify(best)); }
  // Areas are 0-based here (level data stores them 1-based, like room numbers).
  function areaOf(i) { return levels[i].area - 1; }
  function areaRooms(a) {
    var out = [];
    levels.forEach(function (L, i) { if (L.area - 1 === a) out.push(i); });
    return out;
  }
  function bossOf(a) { var r = areaRooms(a); return r.length ? r[r.length - 1] : -1; }
  function isBoss(i) { return bossOf(areaOf(i)) === i; }
  // Beating an area's boss gives the special key that opens the next area.
  function areaOpen(a) {
    if (unlockAll || a <= 0) return true;
    var b = bossOf(a - 1);
    return b < 0 ? areaOpen(a - 1) : !!cleared[b];
  }
  // A room opens once its area is open and any room leading to it is cleared.
  function isUnlocked(i) {
    return areaOpen(areaOf(i)) && (unlockAll || levels[i].from.some(function (p) { return p === 0 || !!cleared[p - 1]; }));
  }
  function childrenOf(i) {
    var out = [];
    levels.forEach(function (L, j) { if (L.from.indexOf(i + 1) >= 0 && j !== i) out.push(j); });
    return out;
  }

  function rewardSprite(rw) {
    if (rw && rw.kind === 'hero' && DC.HEROES[rw.id]) return DC.HEROES[rw.id].sprite;
    if (rw && rw.kind === 'power' && DC.POWERS[rw.id]) return DC.POWERS[rw.id].sprite;
    return 'chest';
  }
  function rewardName(rw) {
    if (rw && rw.kind === 'hero' && DC.HEROES[rw.id]) return 'the ' + DC.HEROES[rw.id].name + ' hero';
    if (rw && rw.kind === 'power' && DC.POWERS[rw.id]) return 'the ' + DC.POWERS[rw.id].name + ' power';
    return 'the way to the next rooms';
  }

  // ---- Views ----------------------------------------------------------------
  // Screens: home (your loadout + Play) -> menu (the dungeon map) -> play. Hero & powers opens from home.
  var views = { home: $('#v-home'), menu: $('#v-menu'), play: $('#v-play'), edit: $('#v-edit'), hero: $('#v-hero') };
  var current = 'home';
  function show(name, page) {
    if (current === 'play' && name !== 'play') forfeitRun(); // a finished run is already banked
    current = name;
    loHide();
    for (var k in views) views[k].classList.toggle('on', k === name);
    if (name !== 'play') { document.body.style.removeProperty('--bodybg'); document.body.style.removeProperty('--tc'); }
    if (name === 'home') renderHome();
    if (name === 'menu') renderMenu();
    if (name === 'edit') renderEditor();
    if (name === 'hero') { if (page === 0 || page === 1) hpPage = page; renderHero(); }
    if (name === 'play') layoutBoard();
  }

  // Android Back button: close the result card, otherwise step back one screen. False means "nothing to go back to".
  window.__cryptBack = function () {
    var ov = $('#over');
    if (ov && ov.classList.contains('on')) { ov.classList.remove('on'); return true; }
    if ($('#leave').classList.contains('on')) { closeLeave(); return true; } // back again: stay in the run
    if (current === 'home') return false;
    if (current === 'play') { guardLeave(function () { show('menu'); }); return true; }
    show(current === 'edit' ? 'menu' : 'home');
    return true;
  };

  // ---- Menu -----------------------------------------------------------------
  var menuArea = clampInt(store.get('cc_area'), 0, AREAS.length - 1, 0);
  function pickArea(a) { menuArea = a; store.set('cc_area', String(a)); renderMenu(); }
  function renderAreaTabs() {
    var tabs = $('#areatabs');
    tabs.innerHTML = '';
    AREAS.forEach(function (A, a) {
      var open = areaOpen(a), b = document.createElement('button');
      b.type = 'button';
      b.className = 'atab' + (a === menuArea ? ' on' : '') + (open ? '' : ' locked');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', a === menuArea ? 'true' : 'false');
      b.tabIndex = a === menuArea ? 0 : -1;
      b.innerHTML = '<span class="an"></span><span class="at"></span>';
      b.querySelector('.an').textContent = a + 1;
      b.querySelector('.at').textContent = A.name;
      if (!open) b.appendChild(img('key', 'alock'));
      b.setAttribute('aria-label', 'Area ' + (a + 1) + ', ' + A.name + (open ? '' : ', sealed'));
      b.addEventListener('click', function () { pickArea(a); });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        pickArea((a + d + AREAS.length) % AREAS.length);
        var nb = tabs.children[menuArea]; if (nb) nb.focus();
      });
      tabs.appendChild(b);
    });
  }
  function renderMenu() {
    renderAreaTabs();
    var map = $('#map');
    map.innerHTML = '';
    var area = menuArea, rooms = areaRooms(area), inArea = {};
    rooms.forEach(function (i) { inArea[i + 1] = true; });
    var aOpen = areaOpen(area), boss = bossOf(area), next = area + 1 < AREAS.length ? area + 1 : null;
    var COLW = 106, ROWH = 142, NS = 70, TOP = 190;
    // Rooms reached from another area hang off this area's entrance.
    function src(p) { return inArea[p] ? p : 0; }
    var depth = [0], rows = [[]];
    rooms.forEach(function (i) {
      var L = levels[i], d = 1;
      L.from.forEach(function (p) { d = Math.max(d, (depth[src(p)] || 0) + 1); });
      depth[i + 1] = d;
      (rows[d] = rows[d] || []).push(i + 1);
    });
    var maxD = rows.length - 1, maxN = 1, off = [0];
    rows.forEach(function (r) { if (!r) return; maxN = Math.max(maxN, r.length); r.forEach(function (k, ix) { off[k] = ix - (r.length - 1) / 2; }); });
    var W = maxN * COLW + 40, H = TOP + (maxD + 1) * ROWH;
    map.style.width = W + 'px'; map.style.height = H + 'px';
    function cx(k) { return Math.round(W / 2 + off[k] * COLW); }
    function cy(k) { return TOP + depth[k] * ROWH - 30; }
    // Header
    var hd = document.createElement('div');
    hd.className = 'maphead';
    hd.innerHTML = '<div class="ch"></div><div class="chs"></div><div class="keys"></div>';
    hd.querySelector('.ch').textContent = AREAS[area].name;
    var cl = 0; rooms.forEach(function (i) { if (cleared[i]) cl++; });
    if (aOpen) hd.querySelector('.chs').textContent = cl + ' of ' + rooms.length + ' rooms cleared';
    else {
      var pb = bossOf(area - 1);
      hd.querySelector('.chs').textContent = 'Sealed. Beat ' + (pb >= 0 ? levels[pb].name : 'the last boss') + ' in ' + AREAS[area - 1].name + ' for its key.';
    }
    var kr = hd.querySelector('.keys');
    if (next != null && boss >= 0) {
      var got = !!cleared[boss] || unlockAll;
      kr.appendChild(img('key', got ? 'kh' : 'km'));
      var kt = document.createElement('span');
      kt.textContent = got ? 'You hold the key to ' + AREAS[next].name : 'Beat ' + levels[boss].name + ' for the key to ' + AREAS[next].name;
      kr.appendChild(kt);
    }
    map.appendChild(hd);
    var svg = '<svg class="paths" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">';
    rooms.forEach(function (i) {
      var L = levels[i], k = i + 1;
      L.from.forEach(function (p0) {
        var p = src(p0);
        var lit = aOpen && (p0 === 0 || cleared[p0 - 1] || unlockAll);
        var x1 = cx(p), y1 = p === 0 ? TOP - 66 : cy(p), x2 = cx(k), y2 = cy(k);
        svg += '<line class="' + (lit ? 'lit' : 'dark') + '" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"/>';
      });
    });
    svg += '</svg>';
    map.insertAdjacentHTML('beforeend', svg);
    var ent = document.createElement('div');
    ent.className = 'entrance';
    ent.style.left = cx(0) + 'px'; ent.style.top = (TOP - 66) + 'px';
    ent.textContent = 'Entrance';
    map.appendChild(ent);
    rooms.forEach(function (i, n) {
      var L = levels[i], k = i + 1, ok = isUnlocked(i), bs = best[i] || 0, th = THEMES[L.theme], done = !!cleared[i];
      var bossRoom = i === boss, givesKey = bossRoom && next != null;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'room node' + (ok ? '' : ' locked') + (done ? ' done' : '') + (bossRoom ? ' boss' : '');
      b.style.left = cx(k) + 'px'; b.style.top = cy(k) + 'px';
      b.style.setProperty('--ra', th.acc); b.style.setProperty('--rb', th.card);
      b.innerHTML = '<span class="box"></span><span class="sz"></span><span class="sc"></span>';
      b.querySelector('.box').appendChild(img(ok ? (bossRoom ? 'goldskull' : th.icon) : 'bars'));
      b.querySelector('.sz').textContent = L.w + '×' + L.h;
      b.querySelector('.sc').textContent = done ? (bs || L.req) : L.req;
      // A cleared room keeps its colours and gets a green check mark instead.
      if (done) { var ck = document.createElement('span'); ck.className = 'ck'; ck.innerHTML = CHECK_SVG; b.appendChild(ck); }
      // Only rooms that hold a hero or power get a reward badge; the rest just open the way on.
      if (L.reward.kind !== 'door') { var rw = img(rewardSprite(L.reward), 'rw'); rw.title = 'Reward: ' + rewardName(L.reward); b.appendChild(rw); }
      // The boss always drops the special key to the next area.
      if (givesKey) { var kb = img('key', 'kb'); kb.title = done ? 'Key to ' + AREAS[next].name + ' found' : 'Holds the key to ' + AREAS[next].name; b.appendChild(kb); }
      var what = done ? ', cleared' : ', reach ' + L.req + ' to unlock ' + rewardName(L.reward) + (givesKey ? ' and the key to ' + AREAS[next].name : '');
      b.setAttribute('aria-label', 'Room ' + (n + 1) + ', ' + (ok ? L.name + what : 'sealed'));
      b.title = ok ? L.name + ' · ' + th.sub : 'Sealed';
      b.disabled = !ok;
      b.addEventListener('click', function () { startLevel(i); });
      map.appendChild(b);
    });
    var lg = $('#legend');
    if (!lg.children.length) {
      TYPE_ORDER.forEach(function (k) {
        var d = document.createElement('div');
        d.className = 'it';
        d.innerHTML = '<div><b></b> <span class="m"></span></div>';
        d.insertBefore(img(typeIcon(k)), d.firstChild);
        d.querySelector('b').textContent = TYPES[k].name + '.';
        d.querySelector('.m').textContent = TYPES[k].tip;
        lg.appendChild(d);
      });
    }
  }

  // ---- Play -----------------------------------------------------------------
  var S = null, cur = 0, els = new Map(), heroEl = null, busy = false, toastShown = false, lastHp = 0, targeting = null;
  var board = $('#board');
  var rewardShown = false;

  function slotFor(inner) {
    var s = document.createElement('div');
    s.className = 'slot';
    s.appendChild(inner);
    return s;
  }
  // The sprite in the middle of a card. Fire and ice arrow traps share one block; their arrowheads
  // (one per side they fire at) are drawn around it, see .heads.
  function cardArt(c) { return c.kind === 'reward' ? rewardSprite(c.rw) : c.kind === 'dtrap' ? 'trapblock' : c.type; }
  // A card type's icon in lists (the card guide, the room editor). The plain arrow trap has no sprite of its own.
  function typeIcon(k) { return k === 'trap' ? 'trapblock' : k; }
  function cardEl(c) {
    var card = document.createElement('div');
    card.className = 'card k-' + c.kind;
    if (c.type === 'blank') {
      card.className = 'card k-empty';
      card.innerHTML = '<span class="chip"></span>';
    } else {
      card.innerHTML = '<span class="hp"><svg class="ic" viewBox="0 0 7 6" shape-rendering="crispEdges"><path fill="#e43b44" d="M1 0h2v1h1V0h2v1h1v2H6v1H5v1H4v1H3V5H2V4H1V3H0V1h1z"/><path fill="#ff8a8f" d="M1 1h1v1H1z"/></svg><b></b></span><span class="dm"><b></b></span><span class="val"></span><span class="shd"><svg class="ic" viewBox="0 0 7 8" shape-rendering="crispEdges"><path fill="#41a6f6" d="M0 0h7v4H6v2H5v1H4v1H3V7H2V6H1V4H0z"/><path fill="#b3d4ff" d="M1 1h2v3H1z"/><path fill="#1d5fa8" d="M4 1h2v3H4z"/></svg></span><span class="chip"></span>';
      card.insertBefore(img(cardArt(c), 'art'), card.firstChild);
      if (c.kind === 'reward') card.appendChild(img('bars', 'bars'));
      if (c.kind === 'dtrap') {
        var hs = document.createElement('span'); hs.className = 'heads ' + (TYPES[c.type].el || 'plain');
        ['n', 'e', 's', 'w'].forEach(function (d) { var i = document.createElement('i'); i.className = 'hd ' + d; i.appendChild(img('traphead')); hs.appendChild(i); });
        card.appendChild(hs);
      }
      if (c.kind === 'bomb') { var fz = document.createElement('span'); fz.className = 'fz'; card.appendChild(fz); }
    }
    card.setAttribute('aria-label', TYPES[c.type].name);
    var s = slotFor(card);
    s.classList.add('pop');
    setTimeout(function () { s.classList.remove('pop'); }, 300); // otherwise the pop replays whenever another animation ends
    return s;
  }
  function place(el, pos) {
    var L = S.level, x = pos % L.w, y = (pos / L.w) | 0;
    el.style.width = (100 / L.w) + '%';
    el.style.height = (100 / L.h) + '%';
    el.style.transform = 'translate(' + (x * 100) + '%,' + (y * 100) + '%)';
  }

  function startLevel(i) {
    forfeitRun(); // the previous run, if it never ended
    cur = i;
    menuArea = areaOf(i); store.set('cc_area', String(menuArea));
    fixSelection();
    S = DC.newGame(levels[i], null, { hero: heroSel, powers: powSel, powerLevel: powerLevel(), upgrades: ups, heroLevel: heroUpLv(heroSel), claimed: !!cleared[i] });
    rewardShown = S.rewardGiven;
    var th = THEMES[levels[i].theme] || THEMES.cellar;
    document.body.style.setProperty('--bodybg', th.bg);
    document.body.style.setProperty('--tc', th.card);
    $('#p-title').style.color = th.acc;
    targeting = null;
    els = new Map();
    board.innerHTML = '';
    toastShown = false; busy = false;
    lastHp = S.hero.hp;
    var hc = document.createElement('div');
    hc.className = 'card';
    hc.innerHTML = '<span class="hp"><svg class="ic" viewBox="0 0 7 6" shape-rendering="crispEdges"><path fill="#e43b44" d="M1 0h2v1h1V0h2v1h1v2H6v1H5v1H4v1H3V5H2V4H1V3H0V1h1z"/><path fill="#ff8a8f" d="M1 1h1v1H1z"/></svg><b></b></span>';
    hc.insertBefore(img(DC.HEROES[heroSel].sprite, 'art'), hc.firstChild);
    // Power cast layers: one paints behind the hero sprite, one in front (see .cast-* in the CSS).
    var auB = document.createElement('span'); auB.className = 'au bk'; hc.insertBefore(auB, hc.firstChild);
    var auF = document.createElement('span'); auF.className = 'au fr'; hc.appendChild(auF);
    // Poison bubbles: shown only while the hero is poisoned (see .slot.hero.poisoned in the CSS).
    var bub = document.createElement('span'); bub.className = 'bub'; bub.setAttribute('aria-hidden', 'true'); hc.appendChild(bub);
    hc.appendChild(img('sword', 'held'));
    var wv = document.createElement('span'); wv.className = 'wv'; hc.appendChild(wv);
    // Lightning Wizard: the smite charge bar along the bottom of the card, one notch per kill.
    if (DC.HEROES[heroSel].pass.storm) {
      var chg = document.createElement('span'); chg.className = 'chg'; chg.setAttribute('aria-hidden', 'true');
      for (var ci = 0; ci < DC.STORM_KILLS; ci++) chg.appendChild(document.createElement('i'));
      hc.appendChild(chg);
    }
    heroEl = slotFor(hc);
    heroEl.classList.add('hero');
    board.appendChild(heroEl);
    $('#p-title').textContent = (i + 1) + ' · ' + levels[i].name;
    $('#over').classList.remove('on');
    show('play');
    render();
  }

  function layoutBoard() {
    if (!S) return;
    var stage = $('#stage');
    var L = S.level;
    var aw = stage.clientWidth, ah = stage.clientHeight;
    var cs = Math.floor(Math.min(aw / L.w, ah / L.h, 118));
    if (cs < 40) cs = 40;
    board.style.width = (cs * L.w) + 'px';
    board.style.height = (cs * L.h) + 'px';
    board.style.setProperty('--cs', cs + 'px');
  }

  function chipFor(p) {
    var kind = p.card.kind;
    if (p.attack) return p.attack.killed ? { t: 'Slay', c: 'gold' } : { t: 'Hit −' + p.attack.dmg, c: '' };
    if (p.card.type === 'poison') return { t: 'Poison ' + p.card.v, c: 'hurt' };
    if (kind === 'weapon') return { t: 'equip', c: '' };
    if (kind === 'bomb') return { t: 'swap', c: '' };
    if (kind === 'chest') return { t: 'open', c: '' };
    if (kind === 'reward') return { t: 'unlock', c: 'gold' };
    var parts = [], cls = '';
    if (p.dHp < 0) { parts.push('−' + (-p.dHp)); cls = 'hurt'; }
    if (p.dHp > 0) { parts.push('+' + p.dHp + 'HP'); cls = 'heal'; }
    if (p.dGold > 0) { parts.push('+' + p.dGold + 'G'); cls = cls || 'gold'; }
    if (!parts.length) return null;
    return { t: parts.join(' '), c: cls };
  }

  // Where each number lives: health (and anything that changes your health) top right,
  // a monster's damage bottom left, an item's own value bottom right.
  var HP_KINDS = { monster: 1, heal: 1, harm: 1, dtrap: 1, bomb: 1 };
  function fillCard(el, c, pos) {
    var T = TYPES[c.type], H = S.hero;
    var hidden = c.type === 'webspider' && !!H.sword;
    var hp = el.querySelector('.hp'), dm = el.querySelector('.dm'), val = el.querySelector('.val');
    var isHp = !!HP_KINDS[c.kind];
    hp.style.display = isHp ? '' : 'none';
    dm.style.display = 'none';
    val.style.display = (isHp || c.kind === 'reward') ? 'none' : '';
    if (isHp) {
      hp.querySelector('b').textContent = (c.kind === 'heal' ? '+' : '') + (hidden ? 0 : c.v);
      if (c.kind === 'monster') dm.querySelector('b').textContent = c.v;
    } else {
      var t = c.kind === 'chest' ? '?' : String(c.v);
      if (c.t > 1 && T.bow) t += '×' + c.t;
      val.textContent = t;
    }
    el.classList.toggle('webbed', hidden);
    var art = el.querySelector('.art'), want = SPR[hidden ? 'web' : cardArt(c)];
    if (want && art.getAttribute('src') !== want) art.src = want;
    var shd = el.querySelector('.shd');
    var had = el._sh; el._sh = !!c.sh;
    shd.style.display = c.sh ? '' : 'none';
    if (had && !c.sh) { flash(el, 'strike', 380); burst('fx-break', pos); }
  }

  function render() {
    var H = S.hero, seen = new Set();
    S.grid.forEach(function (c, pos) {
      if (!c) return;
      seen.add(c.uid);
      var el = els.get(c.uid);
      if (!el) { el = cardEl(c); els.set(c.uid, el); board.appendChild(el); }
      place(el, pos);
      if (c.kind !== 'empty') fillCard(el, c, pos);
      if (c.kind === 'dtrap') {
        var hk = c.h.join('');
        el.querySelectorAll('.hd').forEach(function (n, d) { n.classList.toggle('on', !!c.h[d]); });
        if (el._h && el._h !== hk) flash(el.querySelector('.heads'), 'turn', 300);
        el._h = hk;
      }
      el.classList.toggle('frozen', !!c.frozen);
      el.classList.toggle('poisoned', c.kind === 'monster' && c.psn > 0);
      el.classList.toggle('faded', !!(c.ph && TYPES[c.type].phase)); // a ghost on its untouchable turn
      el.classList.toggle('tail', c.type === 'tail');
      el.classList.toggle('glow', !!(S.glow && S.glow.cell === pos)); // a dead fire imp's square
      if (c.kind === 'bomb') { el.querySelector('.fz').textContent = c.t; el.classList.toggle('fuse', c.t <= 1); }
      var chip = el.querySelector('.chip');
      chip.className = 'chip';
      chip.textContent = '';
    });
    els.forEach(function (el, uid) {
      if (!seen.has(uid)) {
        els.delete(uid);
        el.classList.remove('tgt'); el.classList.add('out');
        setTimeout(function () { el.remove(); }, 260);
      }
    });
    place(heroEl, H.pos);
    heroEl.classList.toggle('poisoned', H.poison > 0);
    heroEl.querySelector('.hp b').textContent = H.hp;
    var heldEl = heroEl.querySelector('.held');
    heldEl.style.display = H.sword ? '' : 'none';
    if (H.sword) heldEl.src = SPR[H.sword.type || 'sword'] || '';
    var wvEl = heroEl.querySelector('.wv');
    wvEl.style.display = H.sword && !H.sword.orb ? '' : 'none';
    if (H.sword) wvEl.textContent = H.sword.c > 1 ? H.sword.v + '×' + H.sword.c : H.sword.v;
    var chgEl = heroEl.querySelector('.chg');
    if (chgEl) {
      var kills = Math.min(DC.STORM_KILLS, H.kills | 0);
      Array.prototype.forEach.call(chgEl.children, function (n, k) { n.classList.toggle('on', k < kills); });
      chgEl.classList.toggle('full', kills >= DC.STORM_KILLS);
    }
    heroEl.classList.toggle('thorns', !!H.pass.thorns && H.hp * 2 <= H.max);
    heroEl.classList.toggle('glow', !!(S.glow && S.glow.cell === H.pos));
    if (H.hp < lastHp) {
      heroEl.classList.remove('hit'); void heroEl.offsetWidth; heroEl.classList.add('hit');
      burst('fx-hurt', H.pos);
      flash(board, 'ouch', 420);
    }
    heroEl.classList.toggle('dead', H.hp <= 0);
    lastHp = H.hp;

    // Show what each neighbouring card would do.
    if (!S.over) {
      for (var d = 0; d < 4; d++) {
        var p = DC.preview(S, d);
        if (!p) continue;
        var x = H.pos % S.level.w + DC.DIRS[d][0], y = ((H.pos / S.level.w) | 0) + DC.DIRS[d][1];
        var tc = S.grid[y * S.level.w + x];
        var tel = tc && els.get(tc.uid);
        var ch = chipFor(p);
        if (tel && ch) {
          var chip2 = tel.querySelector('.chip');
          chip2.textContent = ch.t;
          chip2.className = 'chip show ' + ch.c;
        }
      }
    }

    // Highlight valid targets while a power is waiting for a tap.
    els.forEach(function (el) { el.classList.remove('tgt'); });
    if (targeting != null && !S.over) {
      S.grid.forEach(function (c, pos) {
        if (c && DC.validTarget(S, targeting, pos)) { var e = els.get(c.uid); if (e) e.classList.add('tgt'); }
      });
    }
    renderPowers();
    $('#p-hint').textContent = targeting != null && H.powers[targeting] ? powerTip(H.powers[targeting].id, H.powers[targeting].lv) + ' Tap the power again to cancel.' : HINT;

    // HUD
    $('#h-hp').textContent = H.hp + ' / ' + H.max;
    var bar = $('#h-bar');
    bar.style.width = Math.min(100, 100 * H.hp / H.max) + '%';
    bar.classList.toggle('low', H.hp / H.max <= 0.35);
    var gEl = $('#h-gold');
    gEl.innerHTML = '';
    gEl.appendChild(document.createTextNode(H.gold));
    if (!cleared[cur] && !S.claimed) {
      var sm = document.createElement('small'); sm.textContent = ' / ' + S.level.req; gEl.appendChild(sm);
      var ti = img(rewardSprite(S.level.reward), 'tgt'); ti.title = 'Reach ' + S.level.req + ' for ' + rewardName(S.level.reward);
      if (S.rewardGiven) ti.classList.add('ready');
      gEl.appendChild(ti);
    }
    // The held weapon sits bottom right. Tap it to sell it for its power in gold (uses a turn).
    var gearEl = $('#h-gear');
    gearEl.innerHTML = '';
    ['sword'].forEach(function (w) {
      if (!H[w]) return;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'sell';
      b.title = 'Sell for ' + H[w].v + ' gold (uses a turn)';
      b.setAttribute('aria-label', 'Sell ' + w + ' for ' + H[w].v + ' gold');
      b.appendChild(img(H[w].type || w));
      if (H[w].c > 1) { var q = document.createElement('small'); q.textContent = '×' + H[w].c; b.appendChild(q); }
      var ar = document.createElement('span'); ar.className = 'ar'; ar.textContent = '→'; b.appendChild(ar);
      b.appendChild(img('coin'));
      var g = document.createElement('b'); g.textContent = H[w].v; b.appendChild(g);
      b.addEventListener('click', function () { doMove(null, w); });
      gearEl.appendChild(b);
    });
    var stEl = $('#h-status');
    stEl.innerHTML = '';
    if (H.poison > 0) { stEl.appendChild(img('poison')); stEl.appendChild(document.createTextNode(H.poison)); }
    if (H.frost > 0) { stEl.appendChild(img('p_ice')); stEl.appendChild(document.createTextNode(H.frost)); }
    if (H.ward > 0) { stEl.appendChild(img('p_shield')); stEl.appendChild(document.createTextNode(H.ward)); }
    $('#h-best').textContent = Math.max(best[cur] || 0, H.gold);
  }

  var HINT = 'Swipe or tap a card next to your hero. Press and hold any card for details. Tap the weapon box at the bottom right to sell it.';

  function renderPowers() {
    var bar = $('#powerbar');
    bar.innerHTML = '';
    bar.style.display = S.hero.powers.length ? '' : 'none';
    S.hero.powers.forEach(function (pw, i) {
      var def = DC.POWERS[pw.id];
      var b = document.createElement('button');
      b.type = 'button';
      var ready = pw.cd === 0;
      b.className = 'pw' + (ready ? ' ready' : '') + (def.passive ? ' passive' : '') + (targeting === i ? ' aim' : '');
      b.disabled = S.over;
      b.setAttribute('aria-label', def.name + (def.passive ? ', always on' : ready ? ', ready' : ', recharging, ' + pw.cd + ' turns'));
      b.appendChild(img(def.sprite));
      var nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = def.name;
      var st = document.createElement('span'); st.className = 'st'; st.textContent = pw.id === 'laststand' && S.hero.stood ? 'USED' : def.passive ? 'ALWAYS ON' : pw.id === 'forge' && S.hero.forge ? 'WAITING' : ready ? 'READY' : pw.cd + ' turns';
      var bar2 = document.createElement('i'); bar2.style.width = def.passive ? '100%' : (100 * (1 - pw.cd / pw.max)) + '%';
      b.appendChild(nm); b.appendChild(st); b.appendChild(bar2);
      var held = false, timer = null;
      b.addEventListener('pointerdown', function () {
        held = false; clearTimeout(timer);
        timer = setTimeout(function () {
          held = true;
          showInfo({ sprite: def.sprite, title: def.name, text: def.passive ? powerTip(pw.id, pw.lv) : powerTip(pw.id, pw.lv) + ' Recharges in ' + pw.max + ' turns. ' + (pw.cd > 0 ? 'Ready in ' + pw.cd + '.' : 'Ready now.') });
        }, 450);
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
        b.addEventListener(ev, function () { clearTimeout(timer); if (held) hideInfoSoon(); });
      });
      b.addEventListener('click', function () { if (held) { held = false; return; } slotClick(i); });
      bar.appendChild(b);
    });
  }

  function slotClick(i) {
    if (!S || S.over || current !== 'play') return;
    var pw = S.hero.powers[i];
    if (!pw) return;
    if (DC.POWERS[pw.id].passive) { toast(DC.POWERS[pw.id].name + ' is always on'); return; }
    if (pw.cd > 0) { toast(DC.POWERS[pw.id].name + ' needs ' + pw.cd + ' more turns'); return; }
    if (pw.id === 'forge' && S.hero.forge) { toast('Your forged sword arrives when your hands are empty'); return; }
    if (DC.POWERS[pw.id].target) { targeting = targeting === i ? null : i; render(); return; }
    firePower(i);
  }
  function firePower(i, target) {
    var r = DC.usePower(S, i, target);
    if (!r) {
      // Why a ready power did nothing.
      var why = { dart: 'No monsters to hit', magnet: 'No coins or gems on the board', hourglass: 'Your other powers are all ready', teleport: 'You already have an orb' };
      var pid = S.hero.powers[i] && S.hero.powers[i].id;
      if (why[pid]) toast(why[pid]);
      return;
    }
    targeting = null;
    floaters(r.fx);
    render();
    playFx(r.fx);
    castLook(r.id);
    if (r.id === 'dart' && r.target != null) shoot('dart', S.hero.pos, r.target);
    if (r.id === 'scythe') flash(heroEl, 'spin', 420);
    if (r.id === 'ice') flash(board, 'frostfx', 700);
    if (r.id === 'forge') flash(heroEl.querySelector('.held'), 'swing', 320);
  }
  // Every power dresses the hero in its own look for a moment: glow colour, body motion, particles.
  var castTimer = null;
  function castLook(id) {
    heroEl.className = heroEl.className.replace(/\bcast-\S+/g, '').trim();
    void heroEl.offsetWidth;
    heroEl.classList.add('cast-' + id);
    clearTimeout(castTimer);
    castTimer = setTimeout(function () { heroEl.classList.remove('cast-' + id); }, 800);
  }
  // A small projectile from one square to another (dart).
  function shoot(kind, fromCell, toCell, color) {
    var a = cellCentre(fromCell), b = cellCentre(toCell);
    var ang = Math.atan2((b.y - a.y) / 100 * board.clientHeight, (b.x - a.x) / 100 * board.clientWidth) * 180 / Math.PI;
    var el = burst('fx-' + kind, fromCell, function (n) {
      n.style.setProperty('--ang', ang + 'deg');
      n.innerHTML = '<svg viewBox="0 0 16 8" shape-rendering="crispEdges"><polygon points="0,3 12,3 16,4 12,5 0,5" fill="' + (color || '#63c74d') + '" stroke="#181425" stroke-width="1"/></svg>';
    });
    requestAnimationFrame(function () { el.style.left = b.x + '%'; el.style.top = b.y + '%'; });
  }

  function floaters(fx) {
    return; // the pop-up numbers (+3G, damage taken) are switched off
    var L = S.level;
    fx.forEach(function (f) {
      var x = f.cell % L.w, y = (f.cell / L.w) | 0;
      var el = document.createElement('div');
      el.className = 'float ' + f.cls;
      el.textContent = f.text;
      el.style.left = ((x + 0.5) / L.w * 100) + '%';
      el.style.top = ((y + 0.5) / L.h * 100) + '%';
      board.appendChild(el);
      setTimeout(function () { el.remove(); }, 850);
    });
  }

  // ---- Combat animation ------------------------------------------------------
  // Each weapon gets its own effect class (fx-<name>); add a weapon, add a class.
  var WEAPON_FX = { scythe: 'slash', sword: 'slash', firesword: 'fslash', icesword: 'islash' };
  // One effect per engine event. Cells are board positions, the effect is drawn over that square.
  function playFx(list) {
    var done = {};
    (list || []).forEach(function (f) {
      if (f.hit) flash(els.get(f.hit), 'strike', 380);
      if (!f.anim) return;
      var key = f.anim + ':' + f.cell;
      if (done[key]) return; done[key] = 1;
      if (f.anim === 'spike') { playSpike(f.cell, f.dir); return; }
      burst('fx-' + f.anim, f.cell);
      if (f.anim === 'boom') flash(board, 'shake', 300);
      if (f.anim === 'blast') { var c = S.grid[f.cell]; if (c) flash(els.get(c.uid), 'strike', 380); }
      if (f.anim === 'bolt') { var m = S.grid[f.cell]; if (m) flash(els.get(m.uid), 'strike', 380); }
    });
  }
  function cellCentre(cell) {
    var L = S.level;
    return { x: ((cell % L.w) + 0.5) / L.w * 100, y: (((cell / L.w) | 0) + 0.5) / L.h * 100 };
  }
  // Tremor: a stone spike bursts up from the bottom of the square the hero left. Moving left or right it is the
  // side spike (moving left it points right, as drawn; moving right it is mirrored); moving up or down it is
  // the upright spike. Frames are in src/img/fx/tremor_side.png and tremor_up.png.
  function playSpike(cell, dir) {
    var side = dir === 1 || dir === 3;
    burst('fx-spike ' + (side ? 'side' : 'up') + (dir === 1 ? ' flip' : ''), cell, function (el) { el.appendChild(document.createElement('i')); });
  }
  ['side', 'up'].forEach(function (n) { new Image().src = 'img/fx/tremor_' + n + '.png'; }); // no blank first frame
  function burst(cls, cell, extra) {
    var c = cellCentre(cell), el = document.createElement('div');
    el.className = 'fx ' + cls;
    el.style.left = c.x + '%'; el.style.top = c.y + '%';
    el.style.width = (100 / S.level.w) + '%'; el.style.height = (100 / S.level.h) + '%';
    if (extra) extra(el);
    board.appendChild(el);
    setTimeout(function () { el.remove(); }, 520);
    return el;
  }
  function flash(el, cls, ms) {
    if (!el) return;
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
    setTimeout(function () { el.classList.remove(cls); }, ms || 400);
  }
  var LUNGE = [['0%', '-26%'], ['26%', '0%'], ['0%', '26%'], ['-26%', '0%']];
  function playAttack(dir, targetEl, targetCell, weapon, immune) {
    var card = heroEl.querySelector('.card');
    card.style.setProperty('--lx', LUNGE[dir][0]); card.style.setProperty('--ly', LUNGE[dir][1]);
    flash(heroEl, 'lunge', 320);
    flash(heroEl.querySelector('.held'), 'swing', 320);
    setTimeout(function () {
      burst('fx-' + (WEAPON_FX[weapon] || 'slash'), targetCell);
      if (!immune) flash(targetEl, 'strike', 380);
    }, 110);
  }
  // A wand beam: from the hero's square straight to the far edge of the board.
  function playBeam(fromCell, dir, el) {
    var L = S.level, c = cellCentre(fromCell), cw = 100 / L.w, ch = 100 / L.h;
    var b = document.createElement('div');
    b.className = 'fx-beam ' + (el === 'ice' ? 'ice' : 'fire') + (dir % 2 ? ' h' : ' v');
    var x0 = c.x, y0 = c.y;
    if (dir === 1) { b.style.left = x0 + '%'; b.style.width = (100 - x0) + '%'; b.style.top = (y0 - ch * 0.16) + '%'; b.style.height = (ch * 0.32) + '%'; b.style.transformOrigin = '0 50%'; }
    if (dir === 3) { b.style.left = '0'; b.style.width = x0 + '%'; b.style.top = (y0 - ch * 0.16) + '%'; b.style.height = (ch * 0.32) + '%'; b.style.transformOrigin = '100% 50%'; }
    if (dir === 2) { b.style.top = y0 + '%'; b.style.height = (100 - y0) + '%'; b.style.left = (x0 - cw * 0.16) + '%'; b.style.width = (cw * 0.32) + '%'; b.style.transformOrigin = '50% 0'; }
    if (dir === 0) { b.style.top = '0'; b.style.height = y0 + '%'; b.style.left = (x0 - cw * 0.16) + '%'; b.style.width = (cw * 0.32) + '%'; b.style.transformOrigin = '50% 100%'; }
    board.appendChild(b);
    flash(heroEl.querySelector('.held'), 'swing', 320);
    setTimeout(function () { b.remove(); }, 560);
  }
  // A scythe sweep: a wide arc across the target and the squares beside it.
  function playSweep(dir, cells, hero) {
    var L = S.level, cs = board.clientWidth / L.w, ch = board.clientHeight / L.h;
    var cs0 = cells.map(cellCentre);
    var xs = cs0.map(function (p) { return p.x; }), ys = cs0.map(function (p) { return p.y; });
    var cx = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, cy = (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2;
    var n = cells.length, vertical = dir % 2 === 0;
    var el = document.createElement('div');
    el.className = 'fx-sweep ' + (vertical ? 'h' : 'v');
    el.style.left = cx + '%'; el.style.top = cy + '%';
    el.style.width = (vertical ? cs * n : cs * 0.3) + 'px';
    el.style.height = (vertical ? ch * 0.3 : ch * n) + 'px';
    board.appendChild(el);
    flash(heroEl, 'lunge', 320); flash(heroEl.querySelector('.held'), 'swing', 320);
    var card = heroEl.querySelector('.card');
    card.style.setProperty('--lx', LUNGE[dir][0]); card.style.setProperty('--ly', LUNGE[dir][1]);
    setTimeout(function () { el.remove(); }, 520);
  }
  function playThorns(hits) {
    var from = cellCentre(S.hero.pos);
    flash(heroEl, 'prickle', 320);
    hits.forEach(function (h) {
      var to = cellCentre(h.cell), L = S.level;
      var dx = (to.x - from.x) / 100 * board.clientWidth, dy = (to.y - from.y) / 100 * board.clientHeight;
      var ang = Math.atan2(dy, dx) * 180 / Math.PI;
      var sp = burst('fx-spike', S.hero.pos, function (el) {
        el.style.setProperty('--ang', ang + 'deg');
        el.innerHTML = '<svg viewBox="0 0 16 8" shape-rendering="crispEdges"><polygon points="0,1 16,4 0,7" fill="#63c74d" stroke="#181425" stroke-width="1"/><polygon points="0,3 11,4 0,5" fill="#bff29a"/></svg>';
      });
      requestAnimationFrame(function () {
        sp.style.left = to.x + '%'; sp.style.top = to.y + '%';
      });
      setTimeout(function () { flash(els.get(h.uid), 'strike', 380); burst('fx-spark', h.cell); }, 200);
    });
  }

  function doMove(dir, sell, aim) {
    if (!S || S.over || busy || current !== 'play') return;
    targeting = null;
    var tEl = null, tCell = null, weapon = S.hero.sword ? 'sword' : null, fromCell = S.hero.pos;
    if (!sell && weapon) {
      var L0 = S.level, hx = S.hero.pos % L0.w, hy = (S.hero.pos / L0.w) | 0;
      var tx = hx + DC.DIRS[dir][0], ty = hy + DC.DIRS[dir][1];
      if (tx >= 0 && ty >= 0 && tx < L0.w && ty < L0.h) {
        tCell = ty * L0.w + tx;
        var tc = S.grid[tCell];
        if (tc && tc.kind === 'monster') tEl = els.get(tc.uid);
      }
    }
    var r = sell === 'bow' ? DC.shootBow(S, aim) : sell === 'orb' ? DC.throwOrb(S, aim) : sell ? DC.sellItem(S, sell) : DC.move(S, dir);
    if (!r) {
      board.classList.remove('shake'); void board.offsetWidth; board.classList.add('shake');
      return;
    }
    busy = true; setTimeout(function () { busy = false; }, 110);
    floaters(r.fx);
    if (r.attack && r.attack.orb) { shoot('dart', fromCell, aim, '#d874c0'); castLook('teleport'); }
    else if (r.attack && r.attack.bow) { shoot('dart', fromCell, aim, r.attack.type === 'ninjastar' ? '#c0cbdc' : '#ffd76a'); flash(heroEl.querySelector('.held'), 'swing', 320); }
    else if (r.attack && r.attack.beam) playBeam(fromCell, dir, r.attack.el);
    else if (r.attack && r.attack.sweep) playSweep(dir, r.attack.sweep.cells, heroEl);
    else if (r.attack && tEl) playAttack(dir, tEl, tCell, r.attack.type || weapon, r.attack.immune);
    playFx(r.fx);
    if (r.thorns && r.thorns.length) setTimeout(function () { if (S) playThorns(r.thorns); }, 60);
    if (r.tremor != null) castLook('quake'); // passive Tremor went off as the hero stepped away
    if (r.stand) { castLook('laststand'); toast('Last Stand saved you!'); }
    if (r.eaten && r.eaten.kind === 'reward') claimReward(cur, r.eaten.rw);
    else if (S.rewardGiven && !rewardShown) { rewardShown = true; toast('A locked reward appeared! Step on it.', 3200); }
    render();
    if (S.over) setTimeout(showOver, 650);
  }

  var toastTimer = null;
  function toast(text, ms) {
    var t = $('#toast');
    t.textContent = text; t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('on'); }, ms || 2200);
  }
  // Stepping on the locked reward clears the room: its hero or power unlocks and the rooms below it open.
  function claimReward(i, rw) {
    var wasOpen = levels.map(function (L, j) { return isUnlocked(j); });
    var a = areaOf(i), areaWas = AREAS.map(function (A, x) { return areaOpen(x); });
    cleared[i] = 1; saveCleared();
    var msgs = [];
    if (isBoss(i)) msgs.push(a + 1 < AREAS.length ? AREAS[a].name + ' conquered!' : 'Dungeon conquered!');
    if (rw && rw.kind === 'hero' && DC.HEROES[rw.id]) msgs.push('Hero unlocked: ' + DC.HEROES[rw.id].name);
    if (rw && rw.kind === 'power' && DC.POWERS[rw.id]) msgs.push('Power unlocked: ' + DC.POWERS[rw.id].name);
    AREAS.forEach(function (A, x) { if (!areaWas[x] && areaOpen(x)) msgs.push('You found the key to ' + A.name); });
    var rooms = [];
    levels.forEach(function (L, j) { if (!wasOpen[j] && isUnlocked(j) && areaOf(j) === a) rooms.push(L.name); });
    if (rooms.length) msgs.push('New room' + (rooms.length > 1 ? 's' : '') + ': ' + rooms.join(', '));
    if (!msgs.length) msgs.push('Room cleared');
    toast(msgs.join('. '), 4200);
    flash(heroEl, 'strike', 400);
  }

  var nextPick = null;
  function showOver() {
    var L = levels[cur], g = S.hero.gold;
    var prevBest = (best[cur] || 0);
    if (g > prevBest) { best[cur] = g; saveBest(); } // only a finished run sets a best
    $('#o-score').textContent = g;
    var kidsOf = childrenOf(cur), open = [], note = '';
    $('#o-sub').textContent = 'gold on ' + L.name;
    if (cleared[cur]) {
      kidsOf.forEach(function (j) {
        if (isUnlocked(j)) open.push(j);
        note += (note ? ' ' : '') + levels[j].name + (isUnlocked(j) ? ' is open.' : ' is still sealed.');
      });
      var na = areaOf(cur) + 1;
      if (isBoss(cur) && na < AREAS.length && areaRooms(na).length) {
        var first = areaRooms(na).filter(isUnlocked)[0];
        if (first != null && open.indexOf(first) < 0) open.push(first);
        note += (note ? ' ' : '') + 'You found the key to ' + AREAS[na].name + '.';
      } else if (!kidsOf.length) note = 'The end of the dungeon.';
    } else if (S.rewardGiven) {
      note = 'The locked reward appeared, but you fell before reaching it.';
    } else {
      note = 'Reach ' + L.req + ' gold (' + Math.max(0, L.req - g) + ' short) to reveal the reward, then step on it to clear this room.';
    }
    if (g > 0 && g >= prevBest) note = 'Personal best. ' + note;
    if (bankRun() > 0) note += ' ' + g + ' gold added to your purse (' + purse + ' total) for power upgrades.';
    $('#o-note').textContent = note;
    nextPick = open.length ? open[open.length - 1] : null;
    $('#o-next').style.display = nextPick != null ? '' : 'none';
    $('#over').classList.add('on');
    $('#o-again').focus();
  }

  // Input: swipe, tap on a neighbour, keyboard.
  var down = null, holdTimer = null, infoTimer = null;

  function showInfo(o) {
    var el = $('#info');
    el.innerHTML = '';
    el.appendChild(img(o.sprite));
    var d = document.createElement('div');
    var b = document.createElement('b'); b.textContent = o.title;
    var p = document.createElement('p'); p.textContent = o.text;
    d.appendChild(b); d.appendChild(p);
    el.appendChild(d);
    el.classList.add('on');
    clearTimeout(infoTimer);
  }
  function hideInfo() { clearTimeout(infoTimer); $('#info').classList.remove('on'); }
  function hideInfoSoon() { clearTimeout(infoTimer); infoTimer = setTimeout(hideInfo, 1600); }

  function describeCard(c) {
    var T = TYPES[c.type], n = c.v, t;
    switch (c.kind) {
      case 'gold': t = 'Worth ' + n + ' gold when you step on it.'; break;
      case 'heal': t = 'Restores ' + n + ' health, up to your maximum, and cures poison.' + (T.bonusGold ? ' Also pays ' + T.bonusGold + ' gold.' : ''); break;
      case 'harm':
        t = c.type === 'poison'
          ? 'Poisons you for ' + n + ' turns. You lose 1 health each turn, but never drop below 1. Any healing cures it. '
          : 'Deals ' + n + ' damage when you step on it. ';
        if (c.type !== 'poison' && S.hero.pass.trapproof) t = 'A trap, but harmless to you: the Ninja steps right over it. ';
        break;
      case 'monster': {
        // Only what is special about this monster: its own trick, with live counts where it has one.
        t = T.tip;
        var per = DC.PERIOD[T.ability];
        if (per) t += ' Ready in ' + Math.max(0, per - (c.t || 0)) + (per - (c.t || 0) === 1 ? ' turn.' : ' turns.');
        if (T.ability === 'breed') t += ' ' + Math.max(0, 3 - (c.t || 0)) + ' more turns to go.';
        if (T.phase) t += c.ph ? ' Faded right now: you would pass through.' : ' Solid right now.';
        if (T.loot && c.hitT != null && S.hero.turn - c.hitT <= 2) t += ' Lying low: you hit it recently.';
        if (S.resist > 0) t += ' Protected by a wraith\'s last breath this turn.';
        if (c.type === 'webspider' && S.hero.sword) t = 'Hiding in its web while you hold a weapon: harmless. Walk through it.';
        if (c.psn > 0) t += ' Poisoned: loses 1 health a turn for ' + c.psn + ' more turn' + (c.psn === 1 ? '' : 's') + '.';
        if (c.frozen) t += ' Frozen.';
        if (c.sh) t += ' Shielded.';
        break;
      }
      case 'dtrap': {
        var n4 = (c.h[0] + c.h[1] + c.h[2] + c.h[3]);
        var sides = ['top', 'right', 'bottom', 'left'].filter(function (x, d) { return c.h[d]; });
        t = 'Arrow trap with ' + n4 + (n4 === 1 ? ' arrowhead' : ' arrowheads') + ' (' + sides.join(', ') + '). Step onto it from a side with an arrowhead and it hurts you for ' + n + '; from any other side it is safe. The arrowheads turn clockwise every turn. It never hurts the cards around it.';
        if (S.hero.pass.trapproof) t += ' As the Ninja, it cannot hurt you.';
        break;
      }
      case 'chest': t = 'Step toward it to open it. You stay put and the turn is spent, then an item (a sword, potion or gem) appears in its place to pick up.'; break;
      case 'weapon': if (T.grows) {
          t = 'Power ' + n + '. While it lies here it gains 1 power ' + (T.grows === 'wind' ? 'every time it slides to a new square.' : 'every time you take damage.') +
            ' Pick it up and it stops growing: it fights like a normal sword, wearing down by the damage it deals.';
          break;
        }
        if (T.bow && T.star) { t = 'Ninja star, power ' + n + ', one throw. Tap a monster in your row or column to hit it. No chain.'; break; }
        if (T.bow) { t = 'Electric bow, power ' + n + ', one arrow. Tap any monster to shoot it. The shock jumps to every monster touching it, 1 weaker each jump. Frozen monsters are not hit.'; break; }
        if (T.sweep) { t = 'Power ' + n + '. Step toward a monster to sweep: the target and the two squares beside it (across your swing) all take that much. The scythe loses power equal to the most damage it deals to one monster, and breaks at 0. If the target dies you take its place.'; break; }
        if (T.wand) { t = (T.el === 'ice' ? 'Ice' : 'Fire') + ' wand, power ' + n + '. Step toward a monster to hit it like a sword, but it pierces: power left over carries on down that row or column into the monsters behind it. It wears down by the health it cuts through. ' + (T.el === 'ice' ? 'Survivors freeze. Ice monsters are immune, fire monsters take double. Can kill a Phoenix.' : 'Fire monsters are immune, ice monsters take double.'); break; }
        t = (T.el ? (T.el === 'ice' ? 'An ice weapon: no effect on ice monsters, double against fire ones, and a monster it hits but does not kill freezes solid. It can kill a Phoenix. ' : 'A fire weapon: no effect on fire monsters, double against ice ones. ') : '') + 'Power ' + n + '. Step toward a monster to hit it; the sword loses power equal to the damage it deals, and breaks at 0. If the monster dies you take its place.'; break;
      case 'bomb': t = 'Explodes in ' + c.t + ' turns for ' + n + ' damage to you and the monsters next to it. Step on it to swap places. Monsters it kills leave empty spaces.'; break;
      case 'reward': t = 'A locked reward. Step on it to unlock ' + rewardName(c.rw) + ' and clear this room.'; break;
      default: t = T.tip;
    }
    return { sprite: c.type === 'blank' ? 'coin' : cardArt(c), title: T.name + (c.kind === 'empty' || c.kind === 'reward' || T.tomb ? '' : ' ' + n), text: t };
  }
  function describeHero() {
    var H = S.hero, D = DC.HEROES[H.id], t = D.desc + ' Health ' + H.hp + ' of ' + H.max + '.';
    if (H.poison > 0) t += ' Poisoned for ' + H.poison + ' more turns. Any healing cures it.';
    if (H.frost > 0) t += ' Frost for ' + H.frost + ' more moves.';
    if (H.ward > 0) t += ' Shielded from fire and ice for ' + H.ward + ' more turns.';
    if (H.pass.storm) {
      t += (H.kills | 0) >= DC.STORM_KILLS ? ' Smite is charged: your next attack kills outright.' : ' Smite charge: ' + (H.kills | 0) + ' of ' + DC.STORM_KILLS + ' kills.';
      t += ' Chain lightning: ' + DC.chainDamage(H.lv) + ' damage.';
    }
    if (H.sword && H.sword.orb) t += ' Holding a Teleport orb: tap any card to swap places with it.';
    else if (H.sword) t += ' ' + TYPES[H.sword.type || 'sword'].name + ', power ' + H.sword.v + (H.sword.bow ? (H.sword.star ? ', one throw' : ', one arrow') : '') + '.';
    return { sprite: D.sprite, title: D.name + ' (you)', text: t };
  }
  function inspect(x, y) {
    var rect = board.getBoundingClientRect(), L = S.level;
    var cx = Math.floor((x - rect.left) / rect.width * L.w), cy = Math.floor((y - rect.top) / rect.height * L.h);
    if (cx < 0 || cy < 0 || cx >= L.w || cy >= L.h) return;
    var pos = cy * L.w + cx;
    if (pos === S.hero.pos) showInfo(describeHero());
    else if (S.grid[pos]) showInfo(describeCard(S.grid[pos]));
  }

  board.addEventListener('pointerdown', function (e) {
    down = { x: e.clientX, y: e.clientY, t: e.target, held: false };
    clearTimeout(holdTimer);
    holdTimer = setTimeout(function () { if (down && S) { down.held = true; inspect(down.x, down.y); } }, 450);
  });
  board.addEventListener('pointermove', function (e) {
    if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 12) clearTimeout(holdTimer);
  });
  board.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  $('#info').addEventListener('click', hideInfo);
  board.addEventListener('pointerup', function (e) {
    clearTimeout(holdTimer);
    if (down && down.held) { down = null; hideInfoSoon(); return; }
    if (!down || !S) return;
    var dx = e.clientX - down.x, dy = e.clientY - down.y;
    down = null;
    var ax = Math.abs(dx), ay = Math.abs(dy);
    if (Math.max(ax, ay) > 22) {
      if (ax > ay) doMove(dx > 0 ? 1 : 3); else doMove(dy > 0 ? 2 : 0);
      return;
    }
    var rect = board.getBoundingClientRect(), L = S.level;
    var cx = Math.floor((e.clientX - rect.left) / rect.width * L.w);
    var cy = Math.floor((e.clientY - rect.top) / rect.height * L.h);
    if (targeting != null) {
      var tp = cy * L.w + cx;
      if (cx >= 0 && cy >= 0 && cx < L.w && cy < L.h && DC.validTarget(S, targeting, tp)) firePower(targeting, tp);
      else { targeting = null; render(); }
      return;
    }
    if (cx >= 0 && cy >= 0 && cx < L.w && cy < L.h) {
      var bp = cy * L.w + cx, bc = S.grid[bp];
      var sw = S.hero.sword;
      // Holding a Teleport orb: any tap on a card throws it (swipe or use the keys to step).
      if (sw && sw.orb) { if (DC.orbTarget(S, bp)) doMove(null, 'orb', bp); return; }
      if (sw && sw.bow && bc && bc.kind === 'monster' && !bc.frozen && bc.type !== 'webspider') {
        var inLine = cx === S.hero.pos % L.w || cy === ((S.hero.pos / L.w) | 0);
        if (!sw.star || inLine) { doMove(null, 'bow', bp); return; }
      }
    }
    var hx = S.hero.pos % L.w, hy = (S.hero.pos / L.w) | 0;
    var ddx = cx - hx, ddy = cy - hy;
    if (Math.abs(ddx) + Math.abs(ddy) !== 1) return;
    doMove(ddx === 1 ? 1 : ddx === -1 ? 3 : ddy === 1 ? 2 : 0);
  });
  board.addEventListener('pointercancel', function () { clearTimeout(holdTimer); down = null; hideInfoSoon(); });
  document.addEventListener('keydown', function (e) {
    if (current !== 'play') return;
    if ($('#leave').classList.contains('on')) { if (e.key === 'Escape') closeLeave(); return; } // the leave prompt is open
    if (e.key >= '1' && e.key <= '3') { slotClick(Number(e.key) - 1); return; }
    var m = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3, w: 0, d: 1, s: 2, a: 3 };
    if (e.key in m && !e.metaKey && !e.ctrlKey) { e.preventDefault(); doMove(m[e.key]); }
  });
  window.addEventListener('resize', layoutBoard);

  $('#b-back').addEventListener('click', function () { guardLeave(function () { show('menu'); }); });
  $('#b-restart').addEventListener('click', function () { guardLeave(function () { startLevel(cur); }); });
  $('#l-stay').addEventListener('click', closeLeave);
  $('#l-go').addEventListener('click', function () { var go = leaveGo; closeLeave(); if (go) go(); });
  $('#o-again').addEventListener('click', function () { startLevel(cur); });
  $('#o-next').addEventListener('click', function () { if (nextPick != null) startLevel(nextPick); });
  $('#o-menu').addEventListener('click', function () { $('#over').classList.remove('on'); show('menu'); });
  $('#b-edit').addEventListener('click', function () { show('edit'); });
  $('#b-home').addEventListener('click', function () { show('home'); });
  $('#b-play').addEventListener('click', function () { show('menu'); });
  $('#hp-done').addEventListener('click', function () { show('home'); });

  function lockText(kind, id) {
    var r = rewardRoom(kind, id);
    // Room names repeat from area to area, so name the area too.
    return r < 0 ? 'Buy with gold' : 'Clear the ' + levels[r].name + ' in ' + AREAS[areaOf(r)].name;
  }
  // ---- Hero and power select ------------------------------------------------
  // Top: the chosen hero with its equipped powers floating above its head.
  // Bottom: two swipeable pages (heroes, powers) that loop. Tap picks, press and hold explains.
  var hpPage = 0, hpAnim = false, hpPop = null;
  // Panel order: how to unlock (if locked), name, the ability, then the extra details.
  function heroInfo(id) {
    var H = DC.HEROES[id], open = heroOpen(id), lv = heroUpLv(id), cost = DC.heroUpgradeCost(lv);
    var o = { sprite: H.sprite, lock: open ? '' : lockText('hero', id), title: H.name, tag: '',
      level: lv, max: DC.HERO_MAX_LV, ability: H.desc, stats: [['Health', String(heroHp(id))], ['Powers', String(H.slots)]].concat(H.pass.storm ? [['Chain', DC.chainDamage(lv) + ' damage']] : H.pass.song ? [['Heals', DC.songHeal(lv) + ' a turn'], ['Overheal', '+' + DC.overheal(lv)]] : []) };
    if (open) {
      var on = id === heroSel;
      // Same check-mark toggle as powers. You always have a hero, so the chosen one cannot be un-ticked.
      o.equip = { label: on ? 'Chosen' : 'Choose', on: on, aria: on ? 'Chosen hero' : 'Not chosen. Tap to choose this hero',
        fn: function () { if (!on) pickHero(id); loInfo(heroInfo(id)); } };
      if (cost == null) o.up = { text: 'Fully upgraded.' };
      else o.up = { text: 'Next level: +' + DC.HERO_UP_HP + ' max health' + (H.pass.storm ? ', +1 chain damage.' : H.pass.song ? ', +1 healing a turn, +1 overheal.' : '.'), label: 'Upgrade', cost: cost, ok: purse >= cost,
        short: purse >= cost ? '' : 'You have ' + purse + ' gold. Finished runs add their gold to your purse.',
        buy: function () { if (buyHeroUpgrade(id)) { refreshLoadoutScreen(); loInfo(heroInfo(id)); toast(H.name + ' upgraded to Lvl. ' + (heroUpLv(id) + 1)); } } };
    } else o.up = unlockOffer('hero', id, H.name, heroInfo);
    return o;
  }
  // The numbers shown at the top of a power's details: its recharge and, where it has one, its power.
  // Each stat is [label, value, how it is worked out]; the last part shows on hover or tap.
  // A passive power shows a single "Always on" line where the recharge would be.
  function powerStats(id, lv) {
    var P = DC.POWERS[id], U = DC.UPGRADES[id] || {}, s = [];
    var ups = lv + (lv === 1 ? ' upgrade' : ' upgrades');
    if (P.passive) s.push(['Always on']);
    else {
      var cd = DC.powerCd(id, lv);
      s.push(['Recharge', cd + ' turns', U.cdCut ? P.cd + ' base − ' + U.cdCut + ' × ' + ups + ' = ' + cd + ' turns' : cd + ' turns at every level']);
    }
    if (id === 'forge') {
      var b = DC.powerAmount(id, lv), mh = heroHp(heroSel);
      s.push(['Power', 'Max health' + (b ? ' +' + b : ''), DC.HEROES[heroSel].name + '\'s max health ' + mh + ' + upgrade bonus ' + b + ' = ' + (mh + b)]);
    } else if (id === 'quake') {
      var plv = powerLevel(), base = Math.min(12, 3 + plv), qa = DC.powerAmount(id, lv), q = DC.quakeDamage(plv, lv);
      s.push(['Power', String(q), '3 + ' + plv + ' (1 per 25 of your best score' + (base === 12 ? ', capped at 12' : '') + ') + ' + qa + ' from ' + ups + ' = ' + q]);
    } else if (id === 'magnet') {
      var mg = DC.powerAmount(id, lv);
      if (lv) s.push(['Bonus', '+' + mg + ' gold each', '0 base + ' + U.amt[1] + ' × ' + ups + ' = +' + mg + ' gold from each coin and gem']);
    } else if (id === 'laststand') {
      var ls = DC.powerAmount(id, lv);
      s.push(['Left at', ls + ' health', U.amt[0] + ' base + ' + U.amt[1] + ' × ' + ups + ' = ' + ls + ' health']);
    } else if (U.amt) {
      var n = DC.powerAmount(id, lv);
      s.push(['Power', String(n), U.amt[0] + ' base + ' + U.amt[1] + ' × ' + ups + ' = ' + n]);
    }
    return s;
  }
  function powerInfo(id) {
    var P = DC.POWERS[id], open = powerOpen(id), lv = upLv(id), cost = DC.upgradeCost(lv), U = DC.UPGRADES[id];
    var o = { sprite: P.sprite, lock: open ? '' : lockText('power', id), title: P.name, tag: '',
      level: lv, ability: P.desc || powerTip(id).replace(/ Right now:.*$/, ''), stats: powerStats(id, lv) }; // the stats already show the number
    if (open) {
      var on = powSel.indexOf(id) >= 0, slots = DC.HEROES[heroSel].slots;
      o.equip = { label: on ? 'Unequip' : 'Equip', on: on,
        note: !on && powSel.length >= slots ? 'Replaces ' + DC.POWERS[powSel[0]].name + '.' : '',
        fn: function () { togglePower(id); loInfo(powerInfo(id)); } };
      if (cost == null) o.up = { text: 'Fully upgraded.' };
      else o.up = { text: 'Next level: ' + DC.upgradeWhat(id, lv) + '.', label: 'Upgrade', cost: cost, ok: purse >= cost,
        short: purse >= cost ? '' : 'You have ' + purse + ' gold. Finished runs add their gold to your purse.',
        buy: function () { if (buyUpgrade(id)) { refreshLoadoutScreen(); loInfo(powerInfo(id)); toast(P.name + ' upgraded to Lvl. ' + (upLv(id) + 1)); } } };
    } else o.up = unlockOffer('power', id, P.name, powerInfo);
    return o;
  }
  // A locked hero or power can be bought with gold instead of clearing its room.
  function unlockOffer(kind, id, name, info) {
    var cost = kind === 'hero' ? DC.HERO_BUY_COST : DC.POWER_BUY_COST;
    return { text: '', label: 'Unlock', cost: cost, ok: purse >= cost,
      short: purse >= cost ? '' : 'You have ' + purse + ' gold. Finished runs add their gold to your purse.',
      buy: function () { if (buyUnlock(kind, id)) { refreshLoadoutScreen(); loInfo(info(id)); toast(name + ' unlocked!'); } } };
  }
  function refreshLoadoutScreen() { if (current === 'hero') renderHero(); else if (current === 'home') renderHome(); }
  function byOpen(isOpen) { return function (p, q) { return (isOpen(q) ? 1 : 0) - (isOpen(p) ? 1 : 0); }; }

  // Details on the home and hero screens appear in a panel over the character and stay put
  // until the next tap anywhere on the screen (or the next item you hold replaces them).
  var loGen = 0, loGenAtDown = -1;
  function loPanel() { return $(current === 'home' ? '#home-info' : '#hp-info'); }
  function loInfo(o) {
    var el = loPanel();
    el.innerHTML = '';
    el.appendChild(img(o.sprite));
    var d = document.createElement('div');
    function line(tag, cls, text) { if (!text) return; var e = document.createElement(tag); e.className = cls; e.textContent = text; d.appendChild(e); }
    line('span', 'li-lock', o.lock);
    line('b', 'li-name', o.title);
    line('span', 'li-lv', o.level != null ? 'Lvl. ' + (o.level + 1) : '');
    line('span', 'li-tag', o.tag);
    if (o.stats && o.stats.length) {
      var st = document.createElement('dl'); st.className = 'li-stats';
      o.stats.forEach(function (kv) {
        var dt = document.createElement('dt'); dt.textContent = kv[0];
        if (kv.length === 1) { dt.className = 'solo'; st.appendChild(dt); return; } // e.g. "Always on"
        var dd = document.createElement('dd');
        if (kv[2]) {
          // Hover (or tap, on touch) the value to see how it is worked out.
          var cb = document.createElement('button');
          cb.type = 'button'; cb.className = 'li-calc'; cb.textContent = kv[1];
          cb.setAttribute('aria-label', kv[0] + ' ' + kv[1] + '. ' + kv[2]);
          var eq = document.createElement('span'); eq.className = 'li-eq'; eq.textContent = kv[2];
          cb.addEventListener('click', function () { dd.classList.toggle('open'); });
          dd.appendChild(cb); dd.appendChild(eq);
        } else dd.textContent = kv[1];
        st.appendChild(dt); st.appendChild(dd);
      });
      d.appendChild(st);
    }
    line('p', 'li-ability', o.ability);
    line('p', 'li-desc', o.desc);
    var row = document.createElement('div'); row.className = 'li-btns';
    if (o.equip) {
      // Equip toggle in the top-right corner: a check mark, green when equipped, grey when not.
      var eb = document.createElement('button');
      eb.type = 'button'; eb.className = 'li-check' + (o.equip.on ? ' on' : '');
      eb.setAttribute('aria-pressed', o.equip.on);
      eb.setAttribute('aria-label', o.equip.aria || (o.equip.on ? 'Equipped. Tap to unequip' : 'Not equipped. Tap to equip'));
      eb.title = o.equip.label;
      eb.innerHTML = CHECK_SVG;
      eb.addEventListener('click', o.equip.fn);
      el.appendChild(eb);
    }
    if (o.up) {
      line('p', 'li-up', o.up.text);
      if (o.up.buy) {
        var bb = document.createElement('button');
        bb.type = 'button'; bb.className = 'btn li-buy'; bb.disabled = !o.up.ok;
        bb.appendChild(document.createTextNode(o.up.label + ' '));
        bb.appendChild(img('coin'));
        bb.appendChild(document.createTextNode(o.up.cost));
        bb.setAttribute('aria-label', o.up.label + ' for ' + o.up.cost + ' gold');
        bb.addEventListener('click', o.up.buy);
        row.appendChild(bb);
      }
    }
    if (row.children.length) d.appendChild(row);
    if (o.equip) line('p', 'li-short', o.equip.note);
    if (o.up) line('p', 'li-short', o.up.short);
    el.appendChild(d);
    el.classList.add('on');
    loGen++;
  }
  function loHide() { $('#hp-info').classList.remove('on'); $('#home-info').classList.remove('on'); }
  ['#v-hero', '#v-home'].forEach(function (sel) {
    var v = $(sel);
    v.addEventListener('pointerdown', function () { loGenAtDown = loGen; }, true);
    // A tap closes what was already showing. Info that appeared during this very press stays.
    // The close waits until the tap is handled: if the tap shows new info (another tile, or a double
    // tap that equips and redraws the screen), the open panel just swaps its text instead of closing
    // and replaying its pop-in.
    v.addEventListener('click', function (e) {
      if (e.target.closest('.lo-info button')) return;
      if (e.target.closest('#hp-pager .tile')) return; // a tile tap opens, swaps or (double tap) closes the details itself
      var gen = loGen;
      setTimeout(function () { if (loGen === gen && gen === loGenAtDown) loHide(); }, 0);
    }, true);
  });

  // Press-and-hold for a single element outside the pager (the avatar and the slots above its head).
  function holdable(el, info, tap) {
    var held = false, timer = null;
    el.addEventListener('pointerdown', function () {
      held = false; clearTimeout(timer);
      timer = setTimeout(function () { held = true; el.classList.add('holding'); loInfo(info()); }, 450);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (ev) {
      el.addEventListener(ev, function () { clearTimeout(timer); el.classList.remove('holding'); });
    });
    el.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    el.addEventListener('click', function () { if (held) { held = false; return; } if (tap) tap(); });
  }

  // Health badge for heroes: the same pixel heart and number the hero card uses in a game.
  var HEART = '<svg class="hrt" viewBox="0 0 7 6" shape-rendering="crispEdges"><path fill="#e43b44" d="M1 0h2v1h1V0h2v1h1v2H6v1H5v1H4v1H3V5H2V4H1V3H0V1h1z"/><path fill="#ff8a8f" d="M1 1h1v1H1z"/></svg>';
  function hpBadge(n) {
    var s = document.createElement('span');
    s.className = 'hpb';
    s.setAttribute('aria-label', 'Health ' + n);
    s.innerHTML = HEART + '<b></b>';
    s.querySelector('b').textContent = n;
    return s;
  }

  // Upgrade level as a row of pips (filled = bought).
  function pips(lv, cls, max) {
    max = max || DC.POWER_MAX_LV;
    var s = document.createElement('span');
    s.className = 'pips ' + (cls || '');
    s.setAttribute('aria-label', 'Level ' + lv + ' of ' + max);
    for (var i = 0; i < max; i++) { var p = document.createElement('i'); if (i < lv) p.className = 'on'; s.appendChild(p); }
    return s;
  }

  // Level pips on a tile, plus a ▲ badge when the next level is affordable.
  function upgradeMarks(t, lv, cost, max) {
    var lt = document.createElement('span'); lt.className = 'tlv'; lt.textContent = 'Lvl. ' + (lv + 1); t.appendChild(lt);
    t.setAttribute('aria-label', t.getAttribute('aria-label') + ', level ' + lv);
    if (cost != null && purse >= cost) {
      var up = document.createElement('span'); up.className = 'upb'; up.textContent = '▲'; up.title = 'Upgrade ready: press and hold';
      t.appendChild(up); t.classList.add('canup');
    }
  }

  function tile(kind, id, sprite, name, open, on) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'tile' + (on ? ' sel' : '') + (open ? '' : ' locked');
    b.dataset.kind = kind; b.dataset.id = id;
    b.setAttribute('aria-label', name + (open ? (on ? ', chosen' : '') : ', locked'));
    if (kind === 'power') b.setAttribute('aria-pressed', on);
    var f = document.createElement('span'); f.className = 'ic';
    f.appendChild(img(sprite));
    if (!open) f.appendChild(img('bars', 'lockbars'));
    b.appendChild(f);
    var n = document.createElement('span'); n.className = 'tn'; n.textContent = name;
    b.appendChild(n);
    return b;
  }

  // Draws the hero with its equipped powers above its head into the elements #<pre>-equip/-avatar/-name/-stat.
  // onPower(id) runs when an equipped power is tapped, onEmpty when an empty slot is tapped.
  function fillLoadout(pre, onPower, onEmpty, powerLabel) {
    var D = DC.HEROES[heroSel], slots = D.slots, eq = $('#' + pre + '-equip');
    eq.innerHTML = '';
    for (var s = 0; s < slots; s++) {
      var pid = powSel[s], sl = document.createElement('button');
      sl.type = 'button';
      sl.className = 'eslot' + (pid ? '' : ' empty') + (pid && pid === hpPop ? ' pop' : '');
      if (pid) {
        sl.appendChild(img(DC.POWERS[pid].sprite));
        sl.setAttribute('aria-label', DC.POWERS[pid].name + ', equipped. ' + powerLabel);
        (function (pid) { holdable(sl, function () { return powerInfo(pid); }, function () { onPower(pid); }); })(pid);
      } else {
        sl.setAttribute('aria-label', 'Empty power slot. Tap to choose a power.');
        sl.addEventListener('click', onEmpty);
      }
      eq.appendChild(sl);
    }
    var av = $('#' + pre + '-avatar');
    av.innerHTML = '';
    av.appendChild(img(D.sprite));
    av.setAttribute('aria-label', D.name + ', your hero. Press and hold for details.');
    $('#' + pre + '-name').textContent = D.name;
    av.appendChild(hpBadge(heroHp(heroSel)));
    $('#' + pre + '-stat').textContent = powSel.length + ' of ' + slots + ' powers';
  }

  function renderHome() {
    fixSelection();
    fillLoadout('home', function () { show('hero', 1); }, function () { show('hero', 1); }, 'Tap to change powers.');
    startSayings();
  }

  // A funny line under the Play button that cycles every few seconds while the home screen is open.
  var SAYINGS = [
    'The rats have unionised. Tread carefully.',
    'Skeletons hate this one weird trick: a sword.',
    'Health potions are mostly red food colouring.',
    'Every chest is a mimic until proven otherwise.',
    'The Phoenix refuses to die out of sheer spite.',
    'Ghosts are just skeletons that skipped leg day.',
    'Bring a sword. Bring two. Actually, you can only hold one.',
    'The Lich has been "almost done" with his spell for 300 years.',
    'Slimes are 98% water and 2% attitude.',
    'Mind the traps. They do not mind you.',
    'The Throne Room has excellent reviews. From survivors. Both of them.',
    'Gold cannot buy happiness, but it can buy a nicer coffin.',
    'Vampires keep asking for your blood type. Do not answer.',
    'The Cactus would like you to stop hugging it.',
    'Bats: like birds, but they made worse choices.'
  ];
  var sayIdx = Math.floor(Math.random() * SAYINGS.length), sayTimer = null;
  function startSayings() {
    var el = $('#home-progress');
    clearInterval(sayTimer);
    el.textContent = SAYINGS[sayIdx];
    el.classList.remove('out');
    sayTimer = setInterval(function () {
      if (current !== 'home') { clearInterval(sayTimer); return; }
      el.classList.add('out');
      setTimeout(function () {
        sayIdx = (sayIdx + 1) % SAYINGS.length;
        el.textContent = SAYINGS[sayIdx];
        el.classList.remove('out');
      }, 300);
    }, 4500);
  }

  function renderHero() {
    fixSelection();
    var slots = DC.HEROES[heroSel].slots;
    $('#hp-sub').textContent = 'Clear rooms or buy new heroes and powers.';

    // Loadout: powers above the head, then the hero.
    fillLoadout('hp', function (pid) { powSel.splice(powSel.indexOf(pid), 1); saveSelection(); renderHero(); },
      function () { if (hpPage !== 1) hpGo(1); }, 'Tap to remove.');
    hpPop = null;
    $('#hp-slots').textContent = powSel.length + '/' + slots;

    // Page 1: heroes.
    var hg = $('#hp-heroes');
    hg.innerHTML = '';
    Object.keys(DC.HEROES).sort(byOpen(heroOpen)).forEach(function (id) {
      var H = DC.HEROES[id], open = heroOpen(id), hp = heroHp(id);
      var t = tile('hero', id, H.sprite, H.name, open, id === heroSel);
      t.appendChild(hpBadge(hp));
      t.setAttribute('aria-label', t.getAttribute('aria-label') + ', health ' + hp);
      if (open) upgradeMarks(t, heroUpLv(id), DC.heroUpgradeCost(heroUpLv(id)), DC.HERO_MAX_LV);
      hg.appendChild(t);
    });
    // Page 2: powers.
    var pl = $('#hp-powers');
    pl.innerHTML = '';
    Object.keys(DC.POWERS).filter(function (id) { return !DC.POWERS[id].disabled; }).sort(byOpen(powerOpen)).forEach(function (id) {
      var P = DC.POWERS[id], open = powerOpen(id);
      var t = tile('power', id, P.sprite, P.name, open, powSel.indexOf(id) >= 0);
      if (open) upgradeMarks(t, upLv(id), DC.upgradeCost(upLv(id)), DC.POWER_MAX_LV);
      pl.appendChild(t);
    });
    $('#hp-purse').innerHTML = '';
    $('#hp-purse').appendChild(img('coin'));
    $('#hp-purse').appendChild(document.createTextNode(purse));
    $('#hp-purse').setAttribute('aria-label', 'Purse: ' + purse + ' gold');
    hpPlace(0, false);
  }

  // A second tap on the same tile within this many ms is a double tap. Done by hand rather than with
  // the dblclick event, which phones do not fire reliably for a double tap.
  // A single tap opens the details, but only once the double-tap window has passed, so a double tap
  // never flashes the details open: it just equips or unequips.
  var DOUBLE_TAP_MS = 350, lastTap = { key: '', at: 0 }, tapTimer = null;
  function hpTap(t) {
    var kind = t.dataset.kind, id = t.dataset.id;
    var open = kind === 'hero' ? heroOpen(id) : powerOpen(id);
    var info = function () { loInfo(kind === 'hero' ? heroInfo(id) : powerInfo(id)); };
    if (!open) { clearTimeout(tapTimer); lastTap = { key: '', at: 0 }; info(); return; } // locked: nothing to equip
    var key = kind + ':' + id, now = Date.now(), dbl = lastTap.key === key && now - lastTap.at < DOUBLE_TAP_MS;
    clearTimeout(tapTimer);
    if (!dbl) {
      lastTap = { key: key, at: now };
      tapTimer = setTimeout(function () { lastTap = { key: '', at: 0 }; info(); }, DOUBLE_TAP_MS);
      return;
    }
    lastTap = { key: '', at: 0 };
    loHide();
    // Double tap toggles: a hero is chosen (you always have one, so it cannot be un-chosen);
    // a power is unequipped if equipped, or equipped into an empty slot (it never pushes one out).
    if (kind === 'hero') { if (id !== heroSel) pickHero(id); return; }
    var P = DC.POWERS[id];
    if (powSel.indexOf(id) >= 0) { togglePower(id); toast(P.name + ' unequipped'); }
    else if (powSel.length < DC.HEROES[heroSel].slots) { togglePower(id); toast(P.name + ' equipped'); }
    else toast('All power slots are full. Double-tap an equipped power to free one.');
  }
  function pickHero(id) {
    heroSel = id; fixSelection(); saveSelection(); refreshLoadoutScreen();
    var av = $('#' + (current === 'home' ? 'home' : 'hp') + '-avatar'); av.classList.remove('swap'); void av.offsetWidth; av.classList.add('swap');
  }
  function togglePower(id) {
    var slots = DC.HEROES[heroSel].slots, at = powSel.indexOf(id);
    if (at >= 0) powSel.splice(at, 1);
    else { powSel.push(id); if (powSel.length > slots) powSel.shift(); hpPop = id; }
    saveSelection(); refreshLoadoutScreen();
  }

  // Pager. Only two pages, so "the other page" always sits on whichever side you drag toward: a seamless loop.
  var pager = $('#hp-pager'), pages = [$('#hp-heroes'), $('#hp-powers')];
  function hpPlace(dx, anim, side) {
    var W = pager.clientWidth || 1, a = pages[hpPage], b = pages[1 - hpPage];
    if (!side) side = dx <= 0 ? 1 : -1;
    a.style.transition = b.style.transition = anim ? 'transform .26s cubic-bezier(.2,.8,.2,1)' : 'none';
    a.style.transform = 'translateX(' + dx + 'px)';
    b.style.transform = 'translateX(' + (dx + side * W) + 'px)';
    b.style.visibility = dx === 0 && !anim ? 'hidden' : '';
    a.style.visibility = '';
    a.setAttribute('aria-hidden', 'false'); b.setAttribute('aria-hidden', dx === 0 ? 'true' : 'false');
    a.inert = false; b.inert = true;
    for (var i = 0; i < 2; i++) {
      var tb = $('#hp-tab-' + i);
      tb.classList.toggle('on', i === hpPage);
      tb.setAttribute('aria-selected', i === hpPage);
    }
  }
  // d = +1: the next page slides in from the right; d = -1: from the left.
  function hpGo(d, fromDx) {
    if (hpAnim) return;
    var W = pager.clientWidth || 1, a = pages[hpPage], b = pages[1 - hpPage];
    hpAnim = true;
    if (typeof fromDx !== 'number' || !fromDx) {
      // Start the incoming page on the correct side before animating.
      a.style.transition = b.style.transition = 'none';
      b.style.visibility = '';
      b.style.transform = 'translateX(' + (d * W) + 'px)';
      void b.offsetWidth;
    }
    a.style.transition = b.style.transition = 'transform .26s cubic-bezier(.2,.8,.2,1)';
    a.style.transform = 'translateX(' + (-d * W) + 'px)';
    b.style.transform = 'translateX(0px)';
    setTimeout(function () { hpPage = 1 - hpPage; hpAnim = false; hpPlace(0, false); }, 270);
  }
  var pd = null;
  pager.addEventListener('pointerdown', function (e) {
    if (hpAnim) return;
    var t = e.target.closest('.tile');
    pd = { x: e.clientX, y: e.clientY, id: e.pointerId, t: t, drag: false, held: false, dx: 0, at: Date.now() };
    pd.timer = setTimeout(function () {
      if (!pd || !t) return;
      pd.held = true; t.classList.add('holding');
      loInfo(t.dataset.kind === 'hero' ? heroInfo(t.dataset.id) : powerInfo(t.dataset.id));
    }, 450);
  });
  pager.addEventListener('pointermove', function (e) {
    if (!pd || pd.id !== e.pointerId || pd.held) return;
    var dx = e.clientX - pd.x, dy = e.clientY - pd.y;
    if (!pd.drag) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        pd.drag = true; clearTimeout(pd.timer);
        try { pager.setPointerCapture(e.pointerId); } catch (err) {}
      } else if (Math.abs(dy) > 10) { clearTimeout(pd.timer); pd.t = null; return; }
      else return;
    }
    pd.dx = dx;
    hpPlace(dx, false);
  });
  function hpEnd(e, cancel) {
    if (!pd || (e && pd.id !== e.pointerId)) return;
    var p = pd; pd = null;
    clearTimeout(p.timer);
    if (p.t) p.t.classList.remove('holding');
    if (p.held) { hpSuppress = Date.now(); return; }
    if (p.drag) {
      hpSuppress = Date.now();
      var W = pager.clientWidth || 1, fast = Math.abs(p.dx) / Math.max(1, Date.now() - p.at) > 0.5;
      if (!cancel && (Math.abs(p.dx) > W * 0.22 || (fast && Math.abs(p.dx) > 30))) hpGo(p.dx < 0 ? 1 : -1, p.dx);
      else {
        hpAnim = true;
        hpPlace(0, true, p.dx <= 0 ? 1 : -1);
        setTimeout(function () { hpAnim = false; hpPlace(0, false); }, 270);
      }
      return;
    }
    if (!p.t) hpSuppress = Date.now();
  }
  var hpSuppress = 0;
  pager.addEventListener('pointerup', function (e) { hpEnd(e, false); });
  pager.addEventListener('pointercancel', function (e) { hpEnd(e, true); });
  pager.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  pager.addEventListener('click', function (e) {
    var t = e.target.closest('.tile');
    if (Date.now() - hpSuppress < 400) return;
    if (t) hpTap(t);
  });
  $('#hp-prev').addEventListener('click', function () { hpGo(-1); });
  $('#hp-next').addEventListener('click', function () { hpGo(1); });
  [0, 1].forEach(function (i) {
    $('#hp-tab-' + i).addEventListener('click', function () { if (i !== hpPage) hpGo(i > hpPage ? 1 : -1); });
  });
  holdable($('#hp-avatar'), function () { return heroInfo(heroSel); }, function () { if (hpPage !== 0) hpGo(-1); });
  holdable($('#home-avatar'), function () { return heroInfo(heroSel); }, function () { show('hero', 0); });
  // The whole loadout box on the home screen opens Hero & powers. The hero and power slots keep
  // their own tap and press-and-hold; a tap that only closes an open details panel does nothing else.
  var homeLo = $('.home-loadout'), homeInfoWasOpen = false, homeGen = -1;
  homeLo.addEventListener('pointerdown', function () { homeInfoWasOpen = $('#home-info').classList.contains('on'); homeGen = loGen; }, true);
  homeLo.addEventListener('click', function (e) {
    // Skip if details were open (this tap closes them) or opened during this press (a press-and-hold).
    if (homeInfoWasOpen || homeGen !== loGen || e.target.closest('button, .lo-info')) return;
    show('hero', 0);
  });
  document.addEventListener('keydown', function (e) {
    if (current !== 'hero' || e.metaKey || e.ctrlKey) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); hpGo(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); hpGo(1); }
  });
  window.addEventListener('resize', function () { if (current === 'hero' && !hpAnim) hpPlace(0, false); });

  // ---- Editor ---------------------------------------------------------------
  var ed = 0;
  var FIELDS = [
    ['name', 'Name', 'text', null, null, true],
    ['w', 'Columns (2–7)', 'number', 2, 7],
    ['h', 'Rows (2–7)', 'number', 2, 7],
    ['heroHP', 'Hero health', 'number', 3, 60],
    ['area', 'Area (1–' + AREAS.length + '; its last room is the boss and drops the next area\'s key)', 'number', 1, AREAS.length],
    ['from', 'Reached from rooms (numbers, 0 = entrance)', 'text'],
    ['req', 'Score that reveals the reward', 'number', 1, 9999, true],
    ['ramp', 'Turns per difficulty step', 'number', 1, 99],
    ['cap', 'Most difficulty steps', 'number', 0, 30]
  ];

  function setMsg(t, err) { var m = $('#e-msg'); m.textContent = t || ''; m.classList.toggle('err', !!err); }
  function syncJson() {
    $('#e-json').value = '[\n' + levels.map(function (l) { return ' ' + JSON.stringify(l); }).join(',\n') + '\n]';
  }
  function commit() {
    levels = levels.map(sanitize);
    saveLevels();
    syncJson();
  }

  function renderEditor() {
    if (ed >= levels.length) ed = levels.length - 1;
    var tabs = $('#e-tabs');
    tabs.innerHTML = '';
    levels.forEach(function (L, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = i + 1;
      b.className = i === ed ? 'on' : '';
      b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', i === ed);
      b.addEventListener('click', function () { ed = i; renderEditor(); });
      tabs.appendChild(b);
    });
    var L = levels[ed], f = $('#e-form');
    f.innerHTML = '';
    var fields = document.createElement('div');
    fields.className = 'fields';
    FIELDS.forEach(function (d) {
      var lab = document.createElement('label');
      lab.className = 'f' + (d[0] === 'name' ? ' wide' : '');
      lab.setAttribute('for', 'f-' + d[0]);
      lab.textContent = d[1];
      var inp = document.createElement('input');
      inp.id = 'f-' + d[0]; inp.type = d[2];
      if (d[2] === 'number') { inp.min = d[3]; inp.max = d[4]; inp.inputMode = 'numeric'; }
      inp.value = d[0] === 'from' ? L.from.join(', ') : L[d[0]];
      inp.addEventListener('change', function () {
        if (d[0] === 'from') L.from = inp.value.split(/[ ,]+/).filter(Boolean).map(Number);
        else L[d[0]] = d[2] === 'number' ? Number(inp.value) : inp.value;
        commit(); renderEditor();
      });
      lab.appendChild(inp);
      fields.appendChild(lab);
    });
    var tl = document.createElement('label'); tl.className = 'f'; tl.textContent = 'Theme (colours and icon)';
    var ts = document.createElement('select');
    Object.keys(THEMES).forEach(function (k) { var o = document.createElement('option'); o.value = k; o.textContent = k.charAt(0).toUpperCase() + k.slice(1); if (L.theme === k) o.selected = true; ts.appendChild(o); });
    ts.addEventListener('change', function () { L.theme = ts.value; commit(); renderEditor(); });
    tl.appendChild(ts); fields.appendChild(tl);
    var rl = document.createElement('label'); rl.className = 'f'; rl.textContent = 'Reward behind the bars';
    var rs = document.createElement('select');
    function opt(v, t, on) { var o = document.createElement('option'); o.value = v; o.textContent = t; if (on) o.selected = true; rs.appendChild(o); }
    opt('door:', 'Just open the next rooms', L.reward.kind === 'door');
    Object.keys(DC.HEROES).forEach(function (k) { opt('hero:' + k, 'Hero: ' + DC.HEROES[k].name, L.reward.kind === 'hero' && L.reward.id === k); });
    Object.keys(DC.POWERS).filter(function (k) { return !DC.POWERS[k].disabled; }).forEach(function (k) { opt('power:' + k, 'Power: ' + DC.POWERS[k].name, L.reward.kind === 'power' && L.reward.id === k); });
    rs.addEventListener('change', function () { var p = rs.value.split(':'); L.reward = { kind: p[0], id: p[1] || null }; commit(); renderEditor(); });
    rl.appendChild(rs); fields.appendChild(rl);
    f.appendChild(fields);

    var total = 0;
    TYPE_ORDER.forEach(function (k) { total += L.weights[k] || 0; });
    var head = document.createElement('div');
    head.className = 'pct';
    head.textContent = 'Card odds. Higher numbers appear more often.';
    f.appendChild(head);
    var g = document.createElement('div');
    g.className = 'wgrid';
    TYPE_ORDER.forEach(function (k) {
      var lab = document.createElement('label');
      lab.setAttribute('for', 'w-' + k);
      var em = img(typeIcon(k));
      var nm = document.createElement('span'); nm.style.cssText = 'font-size:.78rem'; nm.textContent = TYPES[k].name + (total ? ' ' + Math.round(100 * (L.weights[k] || 0) / total) + '%' : '');
      var inp = document.createElement('input');
      inp.id = 'w-' + k; inp.type = 'number'; inp.min = 0; inp.max = 999; inp.inputMode = 'numeric';
      inp.value = L.weights[k] || 0;
      inp.addEventListener('change', function () { L.weights[k] = Math.max(0, Number(inp.value) || 0); commit(); renderEditor(); });
      lab.appendChild(em); lab.appendChild(nm); lab.appendChild(inp);
      g.appendChild(lab);
    });
    f.appendChild(g);
    $('#e-all').checked = unlockAll;
    syncJson();
  }

  $('#e-done').addEventListener('click', function () { show('menu'); });
  $('#e-play').addEventListener('click', function () { startLevel(ed); });
  $('#e-add').addEventListener('click', function () {
    var prev = levels[levels.length - 1];
    var n = DC.nextLevel(prev, levels.length + 1);
    // Keep the new level at least as big and as long-lived as the last one.
    n.heroHP = Math.max(n.heroHP, prev.heroHP);
    n.from = [levels.length]; n.req = prev.req + 10; n.theme = 'throne'; n.reward = { kind: 'door' }; n.area = prev.area;
    levels.push(n); ed = levels.length - 1;
    commit(); renderEditor(); setMsg('Added level ' + levels.length + '. Tune it, then press Play this level.');
  });
  $('#e-dup').addEventListener('click', function () {
    var c = JSON.parse(JSON.stringify(levels[ed]));
    c.name = (c.name + ' copy').slice(0, 24);
    c.from = levels[ed].from.slice();
    levels.push(c); ed = levels.length - 1;
    commit(); renderEditor(); setMsg('Duplicated.');
  });
  $('#e-del').addEventListener('click', function () {
    if (levels.length < 2) { setMsg('Keep at least one level.', true); return; }
    var gone = levels[ed];
    levels.forEach(function (L) {
      var nf = [];
      L.from.forEach(function (p) {
        if (p === ed + 1) gone.from.forEach(function (q) { if (nf.indexOf(q) < 0) nf.push(q); });
        else { var v = p > ed + 1 ? p - 1 : p; if (nf.indexOf(v) < 0) nf.push(v); }
      });
      L.from = nf;
    });
    levels.splice(ed, 1);
    best = {}; saveBest(); cleared = {}; saveCleared();
    commit(); renderEditor(); setMsg('Deleted. Progress was reset because room numbers shifted.');
  });
  $('#e-gold').addEventListener('click', function () { purse += 25000; savePurse(); refreshLoadoutScreen(); toast('Added 25000 gold for testing'); }); // testing only
  $('#e-all').addEventListener('change', function (e) { unlockAll = e.target.checked; store.set('cc_all', unlockAll ? '1' : '0'); });
  $('#e-apply').addEventListener('click', function () {
    try { levels = parseLevels($('#e-json').value); saveLevels(); ed = 0; renderEditor(); setMsg('Loaded ' + levels.length + ' levels.'); }
    catch (err) { setMsg('Could not read that: ' + err.message, true); }
  });
  $('#e-copy').addEventListener('click', function () {
    var ta = $('#e-json');
    ta.focus(); ta.select();
    var done = false;
    try { if (navigator.clipboard) { navigator.clipboard.writeText(ta.value).then(function () { setMsg('Copied.'); }, function () { setMsg('Select the text above and copy it by hand.', true); }); done = true; } } catch (e) { /* fall through */ }
    if (!done) setMsg('Select the text above and copy it by hand.', true);
  });
  $('#e-reset').addEventListener('click', function () {
    levels = defaultLevels(); best = {}; saveBest(); cleared = {}; saveCleared(); saveLevels(); ed = 0; renderEditor(); setMsg('Back to the starter dungeon (' + AREAS.length + ' areas). Progress was reset.');
  });

  // Closing the app mid-run still banks that run's gold.

  // ---- Boot -----------------------------------------------------------------
  function start(data) {
    loadAll(data || {});
    show('home');
  }
  if (window.claude && window.claude.hot) {
    window.claude.hot.snapshot(function () { return { levels: levels, best: best, cleared: cleared, unlockAll: unlockAll, owned: owned, hero: heroSel, pows: powSel, purse: purse, ups: ups, hups: hups }; });
    if (window.claude.hot.ready) window.claude.hot.ready(start); else start(window.claude.hot.data || {});
  } else start({});
})();

/* ---- Android: hook the system Back button when running inside the Capacitor shell ---- */
(function () {
  var cap = window.Capacitor, A = cap && cap.Plugins && cap.Plugins.App;
  if (!A || !A.addListener) return;
  A.addListener('backButton', function () { if (!(window.__cryptBack && window.__cryptBack())) A.exitApp(); });
})();
