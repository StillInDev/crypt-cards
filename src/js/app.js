(function () {
  'use strict';
  var DC = window.DC, TYPES = DC.TYPES, SPR = window.SPR || {};
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
                w: { rat: 8, bat: 5, slime: 5, skeleton: 3, poison: 6, trap: 4, bomb: 2 } },
    sewers:   { bg: '#13241f', card: '#2b4a42', acc: '#63c74d', icon: 'slime',     sub: 'Slime and poison',
                w: { slime: 8, rat: 6, snake: 6, zombie: 2, poison: 12, potion: 14, trap: 3 } },
    barracks: { bg: '#1b1f31', card: '#3a4262', acc: '#f0883a', icon: 'goblin',    sub: 'Goblins and steel',
                w: { goblin: 8, skeleton: 5, cultist: 2, goldskull: 3, sword: 16, scythe: 6, gemblade: 4, ninjastar: 3, trap: 5 } },
    fungus:   { bg: '#231a30', card: '#4a3560', acc: '#e07bd8', icon: 'shroom',    sub: 'Spores everywhere',
                w: { shroom: 8, spider: 6, hive: 3, slime: 3, beetle: 3, poison: 10, potion: 18, webspider: 3 } },
    catacombs:{ bg: '#1a1a1b', card: '#45433f', acc: '#e0dac0', icon: 'skeleton',  sub: 'The restless dead',
                w: { skeleton: 8, zombie: 6, ghost: 5, mummy: 3, wraith: 2, goldskull: 4, trap: 5, icetrap: 2 } },
    mine:     { bg: '#261e14', card: '#4e4230', acc: '#fee761', icon: 'gem',       sub: 'Gems and gunpowder',
                w: { scorpion: 6, beetle: 6, goldskull: 5, golem: 3, imp: 3, gem: 14, bomb: 7, trap: 6, firetrap: 3 } },
    frozen:   { bg: '#0f2230', card: '#2e5469', acc: '#2ce8f5', icon: 'icespider', sub: 'Everything is frozen',
                w: { frostwolf: 6, frostwisp: 6, icespider: 5, golem: 6, icetrap: 6, icewand: 4, icesword: 4, icearrow: 4, firesword: 3 } },
    library:  { bg: '#1d1730', card: '#403669', acc: '#a58bff', icon: 'lich',      sub: 'Forbidden knowledge',
                w: { cultist: 6, lich: 3, banshee: 5, wraith: 4, ghost: 3, firearrow: 4, icearrow: 4, elecbow: 4, firewand: 2, icewand: 2 } },
    ember:    { bg: '#2a1410', card: '#5d2e25', acc: '#ff6a1f', icon: 'imp',       sub: 'Fire and brimstone',
                w: { imp: 6, salamander: 6, magmaslime: 6, phoenix: 2, firetrap: 6, firewand: 4, firesword: 4, icesword: 3, bomb: 4 } },
    armory:   { bg: '#1a2029', card: '#4a5569', acc: '#c0cbdc', icon: 'gargoyle',  sub: 'Every weapon you can think of',
                w: { gargoyle: 6, goblin: 4, minotaur: 3, skeleton: 4, sword: 14, firesword: 4, icesword: 4, scythe: 5, gemblade: 5, ninjastar: 4, elecbow: 3 } },
    vampire:  { bg: '#270f1d', card: '#5b2641', acc: '#ff5560', icon: 'vampire',   sub: 'They hunt in the dark',
                w: { vampire: 6, bat: 8, wolf: 4, mummy: 4, banshee: 3, potion: 8, poison: 6, trap: 4 } },
    throne:   { bg: '#1e1236', card: '#56366f', acc: '#fee761', icon: 'minotaur',  sub: 'The last stand',
                w: { troll: 6, minotaur: 4, lich: 3, gargoyle: 4, vampire: 3, hive: 2, goldskull: 3, trap: 6, firetrap: 3, icetrap: 3 } }
  };
  var ROOMS = [
    { name: 'Cellar',         theme: 'cellar',    row: 0, from: [0],       req: 14, reward: { kind: 'door' } },
    { name: 'Sewers',         theme: 'sewers',    row: 1, from: [1],       req: 18, reward: { kind: 'power', id: 'massheal' } },
    { name: 'Barracks',       theme: 'barracks',  row: 1, from: [1],       req: 18, reward: { kind: 'power', id: 'scythe' } },
    { name: 'Fungus Caves',   theme: 'fungus',    row: 2, from: [2],       req: 22, reward: { kind: 'power', id: 'burst' } },
    { name: 'Catacombs',      theme: 'catacombs', row: 2, from: [2, 3],    req: 22, reward: { kind: 'hero', id: 'sorcerer' } },
    { name: 'Mine',           theme: 'mine',      row: 2, from: [3],       req: 22, reward: { kind: 'power', id: 'quake' } },
    { name: 'Frozen Cavern',  theme: 'frozen',    row: 3, from: [4],       req: 28, reward: { kind: 'hero', id: 'icemage' } },
    { name: 'Bone Library',   theme: 'library',   row: 3, from: [4, 5, 6], req: 28, reward: { kind: 'power', id: 'teleport' } },
    { name: 'Ember Halls',    theme: 'ember',     row: 3, from: [6],       req: 28, reward: { kind: 'power', id: 'fire' } },
    { name: 'Armory',         theme: 'armory',    row: 4, from: [7, 8],    req: 34, reward: { kind: 'hero', id: 'rogue' } },
    { name: 'Vampire Crypt',  theme: 'vampire',   row: 4, from: [8, 9],    req: 34, reward: { kind: 'power', id: 'thunder' } },
    { name: 'Throne Room',    theme: 'throne',    row: 5, from: [10, 11],  req: 42, reward: { kind: 'power', id: 'ice' } }
  ];
  var THEME_ORDER = ROOMS.map(function (r) { return r.theme; });
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
    if (r && r.kind === 'power' && DC.POWERS[r.id]) return { kind: 'power', id: r.id };
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
      heroHP: clampInt(L.heroHP, 3, 60, 10),
      from: cleanFrom(L.from, i),
      req: clampInt(L.req, 1, 9999, 12 + 2 * i),
      theme: THEMES[L.theme] ? L.theme : (THEME_ORDER[i] || 'cellar'),
      reward: cleanReward(L.reward),
      ramp: clampInt(L.ramp, 1, 99, 12), cap: clampInt(L.cap, 0, 30, 6),
      adapt: L.adapt !== false,
      shieldP: sp,
      weights: w
    };
  }
  // Every room gets its own monsters and items: start from the depth's generic odds, drop all monsters, then apply the theme.
  function themedWeights(themeKey, diffId) {
    var base = DC.nextLevel(null, diffId).weights, w = {};
    var CLEAR = ['bomb', 'firetrap', 'icetrap', 'firesword', 'icesword', 'firewand', 'icewand', 'firearrow', 'icearrow', 'elecbow', 'ninjastar', 'gemblade', 'scythe', 'trap', 'poison', 'goldskull'];
    for (var k in TYPES) {
      var T = TYPES[k];
      w[k] = (T.kind === 'monster' || CLEAR.indexOf(k) >= 0) ? 0 : (base[k] || 0);
    }
    var tw = THEMES[themeKey].w;
    for (var t in tw) if (TYPES[t]) w[t] = tw[t];
    return w;
  }
  function defaultLevels() {
    return ROOMS.map(function (R, i) {
      var diff = 1 + R.row * 2;
      var L = DC.nextLevel(null, diff);
      L.name = R.name; L.theme = R.theme; L.from = R.from.slice(); L.req = R.req; L.reward = { kind: R.reward.kind, id: R.reward.id };
      L.weights = themedWeights(R.theme, diff);
      L.shieldP = R.theme === 'throne' ? 0.45 : R.row >= 4 ? 0.2 : R.row >= 3 ? 0.1 : 0;
      return sanitize(L, i);
    });
  }
  function parseLevels(text) {
    var d = JSON.parse(text);
    if (!Array.isArray(d) || !d.length) throw new Error('Expected a list with at least one level.');
    if (d.length > 200) throw new Error('That is more than 200 levels.');
    return d.map(sanitize);
  }

  var levels, best = {}, cleared = {}, unlockAll = false, heroSel = 'knight', powSel = ['heal'];
  function loadAll(snapshot) {
    levels = null;
    try { var t = store.get('cc_levels2'); if (t) levels = parseLevels(t); } catch (e) { levels = null; }
    // A snapshot from the old score-gated map has no rewards or themes, so it is ignored.
    if (snapshot && snapshot.levels && snapshot.levels[0] && snapshot.levels[0].reward) { try { levels = snapshot.levels.map(sanitize); } catch (e) { /* keep */ } }
    if (!levels) levels = defaultLevels();
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
    fixSelection();
  }
  function maxScore() {
    var m = 0;
    for (var k in best) m = Math.max(m, best[k] || 0);
    return m;
  }
  function powerLevel() { return unlockAll ? 9 : Math.min(9, Math.floor(maxScore() / 10)); }
  function powerTip(id) {
    var T = DC.POWERS[id].tip;
    return id === 'quake' ? T + ' Right now: ' + DC.quakeDamage(powerLevel()) + ' damage.' : T;
  }
  // Where a hero or power is found: the room whose reward it is (null for the ones you start with).
  function rewardRoom(kind, id) {
    for (var i = 0; i < levels.length; i++) { var r = levels[i].reward; if (r && r.kind === kind && r.id === id) return i; }
    return -1;
  }
  function heroOpen(id) {
    if (unlockAll || START_HEROES.indexOf(id) >= 0) return true;
    var r = rewardRoom('hero', id);
    return r < 0 ? false : !!cleared[r];
  }
  function powerOpen(id) {
    if (unlockAll || START_POWERS.indexOf(id) >= 0) return true;
    var r = rewardRoom('power', id);
    return r < 0 ? false : !!cleared[r];
  }
  function fixSelection() {
    if (!DC.HEROES[heroSel] || !heroOpen(heroSel)) heroSel = 'knight';
    var slots = DC.HEROES[heroSel].slots;
    powSel = (Array.isArray(powSel) ? powSel : []).filter(function (p, i, a) { return DC.POWERS[p] && powerOpen(p) && a.indexOf(p) === i; }).slice(0, slots);
    if (!powSel.length && powerOpen('heal')) powSel = ['heal'];
  }
  function saveSelection() { store.set('cc_hero', heroSel); store.set('cc_pows', JSON.stringify(powSel)); }
  function saveLevels() { store.set('cc_levels2', JSON.stringify(levels)); }
  function saveCleared() { store.set('cc_clear', JSON.stringify(cleared)); }
  function saveBest() { store.set('cc_best', JSON.stringify(best)); }
  function isUnlocked(i) {
    var L = levels[i];
    return unlockAll || L.from.some(function (p) { return p === 0 || !!cleared[p - 1]; });
  }
  function childrenOf(i) {
    var out = [];
    levels.forEach(function (L, j) { if (L.from.indexOf(i + 1) >= 0 && j !== i) out.push(j); });
    return out;
  }

  function rewardSprite(rw) {
    if (rw && rw.kind === 'hero' && DC.HEROES[rw.id]) return DC.HEROES[rw.id].sprite;
    if (rw && rw.kind === 'power' && DC.POWERS[rw.id]) return DC.POWERS[rw.id].sprite;
    return 'key';
  }
  function rewardName(rw) {
    if (rw && rw.kind === 'hero' && DC.HEROES[rw.id]) return 'the ' + DC.HEROES[rw.id].name + ' hero';
    if (rw && rw.kind === 'power' && DC.POWERS[rw.id]) return 'the ' + DC.POWERS[rw.id].name + ' power';
    return 'the way to the next rooms';
  }

  // ---- Views ----------------------------------------------------------------
  var views = { menu: $('#v-menu'), play: $('#v-play'), edit: $('#v-edit'), hero: $('#v-hero') };
  var current = 'menu';
  function show(name) {
    current = name;
    for (var k in views) views[k].classList.toggle('on', k === name);
    if (name !== 'play') { document.body.style.removeProperty('--bodybg'); document.body.style.removeProperty('--tc'); }
    if (name === 'menu') renderMenu();
    if (name === 'edit') renderEditor();
    if (name === 'hero') renderHero();
    if (name === 'play') layoutBoard();
  }

  // Android Back button: close the result card, otherwise go back to the menu. False means "nothing to go back to".
  window.__cryptBack = function () {
    var ov = $('#over');
    if (ov && ov.classList.contains('on')) { ov.classList.remove('on'); return true; }
    if (current === 'menu') return false;
    show('menu');
    return true;
  };

  // ---- Menu -----------------------------------------------------------------
  function renderMenu() {
    var map = $('#map');
    map.innerHTML = '';
    var COLW = 106, ROWH = 142, NS = 70, TOP = 190;
    var depth = [0], rows = [[]];
    levels.forEach(function (L, i) {
      var d = 1;
      L.from.forEach(function (p) { d = Math.max(d, (depth[p] || 0) + 1); });
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
    hd.innerHTML = '<div class="pips"><i class="on"></i></div><div class="ch">The Crypt</div><div class="chs"></div>';
    var cl = 0; levels.forEach(function (L, i) { if (cleared[i]) cl++; });
    hd.querySelector('.chs').textContent = cl + ' of ' + levels.length + ' rooms cleared';
    map.appendChild(hd);
    // Drifting dust, like the reference
    var dust = '';
    for (var q = 0; q < 14; q++) { var sx = (q * 97 + 31) % W, sy = (q * 211 + 57) % H; dust += '<i style="left:' + sx + 'px;top:' + sy + 'px;animation-delay:' + (-q * 0.7) + 's' + (q % 3 === 0 ? ';background:#4a4a5a' : '') + '"></i>'; }
    map.insertAdjacentHTML('beforeend', '<div class="dust">' + dust + '</div>');
    var svg = '<svg class="paths" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">';
    levels.forEach(function (L, i) {
      var k = i + 1;
      L.from.forEach(function (p) {
        var lit = p === 0 || cleared[p - 1] || unlockAll;
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
    levels.forEach(function (L, i) {
      var k = i + 1, ok = isUnlocked(i), bs = best[i] || 0, th = THEMES[L.theme], done = !!cleared[i];
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'room node' + (ok ? '' : ' locked') + (done ? ' done' : '') + (i === levels.length - 1 ? ' boss' : '');
      b.style.left = cx(k) + 'px'; b.style.top = cy(k) + 'px';
      b.style.setProperty('--ra', th.acc); b.style.setProperty('--rb', th.card);
      b.innerHTML = '<span class="num"></span><span class="box"></span><span class="sz"></span><span class="sc"></span>';
      b.querySelector('.num').textContent = k;
      b.querySelector('.box').appendChild(img(ok ? (i === levels.length - 1 ? 'goldskull' : th.icon) : 'bars'));
      b.querySelector('.sz').textContent = L.w + '×' + L.h;
      b.querySelector('.sc').textContent = done ? '✓ ' + (bs || L.req) : L.req;
      var rw = img(rewardSprite(L.reward), 'rw'); rw.title = 'Reward: ' + rewardName(L.reward);
      b.appendChild(rw);
      b.setAttribute('aria-label', 'Room ' + k + ', ' + (ok ? L.name + (done ? ', cleared' : ', reach ' + L.req + ' to unlock ' + rewardName(L.reward)) : 'sealed'));
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
        d.insertBefore(img(k), d.firstChild);
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
  function cardEl(c) {
    var card = document.createElement('div');
    card.className = 'card k-' + c.kind;
    if (c.type === 'blank') {
      card.className = 'card k-empty';
      card.innerHTML = '<span class="chip"></span>';
    } else {
      card.innerHTML = '<span class="hp"><svg class="ic" viewBox="0 0 7 6" shape-rendering="crispEdges"><path fill="#e43b44" d="M1 0h2v1h1V0h2v1h1v2H6v1H5v1H4v1H3V5H2V4H1V3H0V1h1z"/><path fill="#ff8a8f" d="M1 1h1v1H1z"/></svg><b></b></span><span class="dm"><b></b></span><span class="val"></span><span class="shd"><svg class="ic" viewBox="0 0 7 8" shape-rendering="crispEdges"><path fill="#41a6f6" d="M0 0h7v4H6v2H5v1H4v1H3V7H2V6H1V4H0z"/><path fill="#b3d4ff" d="M1 1h2v3H1z"/><path fill="#1d5fa8" d="M4 1h2v3H4z"/></svg></span><span class="jw"><i></i><i></i><i></i></span><span class="chip"></span>';
      card.insertBefore(img(c.kind === 'reward' ? rewardSprite(c.rw) : c.type, 'art'), card.firstChild);
      if (c.kind === 'reward') card.appendChild(img('bars', 'bars'));
      if (c.kind === 'dtrap') {
        var hs = document.createElement('span'); hs.className = 'heads ' + TYPES[c.type].el;
        ['n', 'e', 's', 'w'].forEach(function (d) { var i = document.createElement('i'); i.className = 'hd ' + d; hs.appendChild(i); });
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
    cur = i;
    fixSelection();
    S = DC.newGame(levels[i], null, { hero: heroSel, powers: powSel, powerLevel: powerLevel(), claimed: !!cleared[i] });
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
    hc.innerHTML = '<span class="hp"><svg class="ic" viewBox="0 0 7 6" shape-rendering="crispEdges"><path fill="#e43b44" d="M1 0h2v1h1V0h2v1h1v2H6v1H5v1H4v1H3V5H2V4H1V3H0V1h1z"/><path fill="#ff8a8f" d="M1 1h1v1H1z"/></svg><b></b></span><span class="jw"><i></i><i></i><i></i></span>';
    hc.insertBefore(img(DC.HEROES[heroSel].sprite, 'art'), hc.firstChild);
    // Power cast layers: one paints behind the hero sprite, one in front (see .cast-* in the CSS).
    var auB = document.createElement('span'); auB.className = 'au bk'; hc.insertBefore(auB, hc.firstChild);
    var auF = document.createElement('span'); auF.className = 'au fr'; hc.appendChild(auF);
    hc.appendChild(img('sword', 'held'));
    var wv = document.createElement('span'); wv.className = 'wv'; hc.appendChild(wv);
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
      if (c.t != null && (T.wand || T.bow)) t += '×' + c.t;
      val.textContent = t;
    }
    el.classList.toggle('webbed', hidden);
    var art = el.querySelector('.art'), want = SPR[hidden ? 'web' : c.kind === 'reward' ? rewardSprite(c.rw) : c.type];
    if (want && art.getAttribute('src') !== want) art.src = want;
    var shd = el.querySelector('.shd');
    var had = el._sh; el._sh = !!c.sh;
    shd.style.display = c.sh ? '' : 'none';
    if (had && !c.sh) { flash(el, 'strike', 380); burst('fx-break', pos); }
    var jw = el.querySelector('.jw');
    jw.style.display = c.g ? '' : 'none';
    if (c.g) Array.prototype.forEach.call(jw.children, function (i, k) { i.className = c.g[k] || ''; });
    if (c.kind === 'arrow') {
      var art2 = el.querySelector('.art');
      if (el._ah == null) el._rot = c.h * 90;
      else if (c.h !== el._ah) el._rot += 90 * (((c.h - el._ah) + 4) % 4);
      el._ah = c.h;
      art2.style.transform = 'rotate(' + el._rot + 'deg)';
    }
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
    heroEl.querySelector('.hp b').textContent = H.hp + '/' + H.max;
    var hj = heroEl.querySelector('.jw'); hj.style.display = H.sword && H.sword.g ? '' : 'none';
    if (H.sword && H.sword.g) Array.prototype.forEach.call(hj.children, function (i, k) { i.className = H.sword.g[k] || ''; });
    var heldEl = heroEl.querySelector('.held');
    heldEl.style.display = H.sword ? '' : 'none';
    if (H.sword) heldEl.src = SPR[H.sword.type || 'sword'] || '';
    var wvEl = heroEl.querySelector('.wv');
    wvEl.style.display = H.sword ? '' : 'none';
    if (H.sword) wvEl.textContent = H.sword.c != null ? H.sword.v + '×' + H.sword.c : H.sword.v;
    heroEl.classList.toggle('thorns', !!H.pass.thorns && H.hp * 2 <= H.max);
    if (H.hp < lastHp) {
      heroEl.classList.remove('hit'); void heroEl.offsetWidth; heroEl.classList.add('hit');
      burst('fx-hurt', H.pos);
      flash(board, 'ouch', 420);
    }
    heroEl.classList.toggle('dead', H.hp <= 0);
    els.forEach(function (el) { el.classList.remove('marked'); });
    heroEl.classList.toggle('armed', !!(H.mark && H.mark.cell === H.pos));
    if (H.mark && H.mark.cell !== H.pos && S.grid[H.mark.cell]) { var me = els.get(S.grid[H.mark.cell].uid); if (me) me.classList.add('marked'); }
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
    $('#p-hint').textContent = targeting != null && H.powers[targeting] ? powerTip(H.powers[targeting].id) + ' Tap the power again to cancel.' : HINT;

    // HUD
    $('#h-hp').textContent = H.hp + ' / ' + H.max;
    var bar = $('#h-bar');
    bar.style.width = (100 * H.hp / H.max) + '%';
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
      if (H[w].c != null) { var q = document.createElement('small'); q.textContent = '×' + H[w].c; b.appendChild(q); }
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
      b.className = 'pw' + (ready ? ' ready' : '') + (targeting === i ? ' aim' : '');
      b.disabled = S.over;
      b.setAttribute('aria-label', def.name + (ready ? ', ready' : ', recharging, ' + pw.cd + ' turns'));
      b.appendChild(img(def.sprite));
      var nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = def.name;
      var st = document.createElement('span'); st.className = 'st'; st.textContent = ready ? 'READY' : pw.cd + ' turns';
      var bar2 = document.createElement('i'); bar2.style.width = (100 * (1 - pw.cd / pw.max)) + '%';
      b.appendChild(nm); b.appendChild(st); b.appendChild(bar2);
      var held = false, timer = null;
      b.addEventListener('pointerdown', function () {
        held = false; clearTimeout(timer);
        timer = setTimeout(function () {
          held = true;
          showInfo({ sprite: def.sprite, title: def.name, text: powerTip(pw.id) + ' Recharges in ' + pw.max + ' turns. ' + (pw.cd > 0 ? 'Ready in ' + pw.cd + '.' : 'Ready now.') });
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
    if (pw.cd > 0) { toast(DC.POWERS[pw.id].name + ' needs ' + pw.cd + ' more turns'); return; }
    if (DC.POWERS[pw.id].target) { targeting = targeting === i ? null : i; render(); return; }
    firePower(i);
  }
  function firePower(i, target) {
    var r = DC.usePower(S, i, target);
    if (!r) return;
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
    var r = sell === 'bow' ? DC.shootBow(S, aim) : sell === 'arrow' ? DC.fireArrow(S, aim) : sell ? DC.sellItem(S, sell) : DC.move(S, dir);
    if (!r) {
      board.classList.remove('shake'); void board.offsetWidth; board.classList.add('shake');
      return;
    }
    busy = true; setTimeout(function () { busy = false; }, 110);
    floaters(r.fx);
    if (r.attack && r.attack.bow) { shoot('dart', fromCell, aim, r.attack.type === 'ninjastar' ? '#c0cbdc' : '#ffd76a'); flash(heroEl.querySelector('.held'), 'swing', 320); }
    else if (r.attack && r.attack.beam) playBeam(fromCell, dir, r.attack.el);
    else if (r.attack && r.attack.sweep) playSweep(dir, r.attack.sweep.cells, heroEl);
    else if (r.attack && tEl) playAttack(dir, tEl, tCell, r.attack.type || weapon, r.attack.immune);
    playFx(r.fx);
    if (r.thorns && r.thorns.length) setTimeout(function () { if (S) playThorns(r.thorns); }, 60);
    if (S.hero.gold > (best[cur] || 0)) { best[cur] = S.hero.gold; saveBest(); }
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
    cleared[i] = 1; saveCleared();
    var msgs = [];
    if (i === levels.length - 1) msgs.push('Dungeon conquered!');
    if (rw && rw.kind === 'hero' && DC.HEROES[rw.id]) msgs.push('Hero unlocked: ' + DC.HEROES[rw.id].name);
    if (rw && rw.kind === 'power' && DC.POWERS[rw.id]) msgs.push('Power unlocked: ' + DC.POWERS[rw.id].name);
    var rooms = [];
    levels.forEach(function (L, j) { if (!wasOpen[j] && isUnlocked(j)) rooms.push(L.name); });
    if (rooms.length) msgs.push('New room' + (rooms.length > 1 ? 's' : '') + ': ' + rooms.join(', '));
    if (!msgs.length) msgs.push('Room cleared');
    toast(msgs.join('. '), 4200);
    flash(heroEl, 'strike', 400);
  }

  var nextPick = null;
  function showOver() {
    var L = levels[cur], g = S.hero.gold;
    var prevBest = (best[cur] || 0);
    $('#o-score').textContent = g;
    var kidsOf = childrenOf(cur), open = [], note = '';
    $('#o-sub').textContent = 'gold on ' + L.name;
    if (cleared[cur]) {
      kidsOf.forEach(function (j) {
        if (isUnlocked(j)) open.push(j);
        note += (note ? ' ' : '') + levels[j].name + (isUnlocked(j) ? ' is open.' : ' is still sealed.');
      });
      if (!kidsOf.length) note = 'The end of the dungeon.';
    } else if (S.rewardGiven) {
      note = 'The locked reward appeared, but you fell before reaching it.';
    } else {
      note = 'Reach ' + L.req + ' gold (' + Math.max(0, L.req - g) + ' short) to reveal the reward, then step on it to clear this room.';
    }
    if (g > 0 && g >= prevBest) note = 'Personal best. ' + note;
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
      case 'heal': t = 'Restores ' + n + ' health, up to your maximum.' + (T.bonusGold ? ' Also pays ' + T.bonusGold + ' gold.' : ''); break;
      case 'harm':
        t = c.type === 'poison'
          ? 'Poisons you for ' + n + ' turns. You lose 1 health each turn, but never drop below 1. '
          : 'Deals ' + n + ' damage when you step on it. ';
        break;
      case 'monster':
        t = (c.frozen ? 'FROZEN: it cannot be hit, even with a weapon. Step on it to swap places. ' : '') + (T.el ? (T.el === 'fire' ? 'A fire monster. Immune to fire traps and weapons, takes double from ice. ' : 'An ice monster. Immune to ice traps and weapons, takes double from fire. ') : '') + (T.immortal ? 'It cannot be killed by damage, only worn down to 1. Step on it with no weapon, or hit it with an ice weapon, to finish it. ' : '') + 'Has ' + n + ' health. Stepping on it costs you ' + n + ' health. With a sword you attack it instead, and take its place if it dies.';
        if (c.sh) t += ' SHIELDED: the first hit is absorbed completely.';
        if (c.type === 'webspider' && S.hero.sword) t = 'Hiding in its web while you hold a weapon: 0 health, harmless. Walk through it.';
        if (T.pays) t += ' Pays ' + n + ' gold when you beat it.';
        if (T.ability === 'queen') t += ' In ' + (4 - (c.t || 0)) + ' turns it turns a neighbouring card into a bat.';
        break;
      case 'dtrap': {
        var n4 = (c.h[0] + c.h[1] + c.h[2] + c.h[3]), el = T.el, opp = el === 'fire' ? 'ice' : 'fire';
        t = (el === 'fire' ? 'Fire' : 'Ice') + ' trap with ' + n4 + (n4 === 1 ? ' head' : ' heads') + ', ' + n + ' damage each. Every turn it turns clockwise, then hits whatever its heads point at: you, and monsters. ' +
          (el === 'fire' ? 'Fire' : 'Ice') + ' monsters are immune; ' + opp + ' monsters take ' + (n * 2) + '. Other monsters take ' + n + '. Stepping on it costs ' + n + '.';
        break;
      }
      case 'chest': t = 'Step toward it to open it. You stay put and the turn is spent, then an item (a sword, potion or gem) appears in its place to pick up.'; break;
      case 'weapon': if (T.gems) { t = 'Jewel blade, power ' + n + '. Each green jewel adds 1 power whenever you take damage; each blue jewel adds 1 whenever you move. Slots: ' + c.g.map(function (g) { return g === 'g' ? 'green' : g === 'b' ? 'blue' : 'empty'; }).join(', ') + '.'; break; }
        if (T.bow && T.star) { t = 'Ninja star, power ' + n + ', ' + c.t + ' throws. Tap a monster in your row or column to hit it. No chain.'; break; }
        if (T.bow) { t = 'Electric bow, power ' + n + ', ' + c.t + ' arrows. Tap any monster to shoot it. The shock jumps to every monster touching it, 1 weaker each jump. Frozen monsters are not hit.'; break; }
        if (T.sweep) { t = 'Power ' + n + '. Step toward a monster to sweep: the target and the two squares beside it (across your swing) all take that much. The scythe loses power equal to the most damage it deals to one monster, and breaks at 0. If the target dies you take its place.'; break; }
        if (T.wand) { t = (T.el === 'ice' ? 'Ice' : 'Fire') + ' wand, power ' + n + ', ' + c.t + ' charges. Step toward an adjacent monster to fire a beam from you to the far edge of that row or column, hitting every monster on the way. ' + (T.el === 'ice' ? 'Survivors freeze. Ice monsters are immune, fire monsters take double. Can kill a Phoenix.' : 'Fire monsters are immune, ice monsters take double.'); break; }
        t = (T.el ? (T.el === 'ice' ? 'An ice weapon: no effect on ice monsters, double against fire ones, and a monster it hits but does not kill freezes solid. It can kill a Phoenix. ' : 'A fire weapon: no effect on fire monsters, double against ice ones. ') : '') + 'Power ' + n + '. Step toward a monster to hit it; the sword loses power equal to the damage it deals, and breaks at 0. If the monster dies you take its place.'; break;
      case 'bomb': t = 'Explodes in ' + c.t + ' turns for ' + n + ' damage to you and the monsters next to it. Step on it to swap places. Monsters it kills leave empty spaces.'; break;
      case 'reward': t = 'A locked reward. Step on it to unlock ' + rewardName(c.rw) + ' and clear this room.'; break;
      default: t = T.tip;
    }
    return { sprite: c.type === 'blank' ? 'coin' : c.kind === 'reward' ? rewardSprite(c.rw) : c.type, title: T.name + (c.kind === 'empty' || c.kind === 'reward' ? '' : ' ' + n), text: t };
  }
  function describeHero() {
    var H = S.hero, D = DC.HEROES[H.id], t = D.desc + ' Health ' + H.hp + ' of ' + H.max + '.';
    if (H.poison > 0) t += ' Poisoned for ' + H.poison + ' more turns.';
    if (H.frost > 0) t += ' Frost for ' + H.frost + ' more moves.';
    if (H.sword) t += ' ' + TYPES[H.sword.type || 'sword'].name + ', power ' + H.sword.v + (H.sword.c != null ? ', ' + H.sword.c + (H.sword.bow ? ' arrows' : ' charges') : '') + '.';
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
      if (bc && bc.kind === 'arrow') { doMove(null, 'arrow', bp); return; }
      var sw = S.hero.sword;
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
    if (e.key >= '1' && e.key <= '3') { slotClick(Number(e.key) - 1); return; }
    var m = { ArrowUp: 0, ArrowRight: 1, ArrowDown: 2, ArrowLeft: 3, w: 0, d: 1, s: 2, a: 3 };
    if (e.key in m && !e.metaKey && !e.ctrlKey) { e.preventDefault(); doMove(m[e.key]); }
  });
  window.addEventListener('resize', layoutBoard);

  $('#b-back').addEventListener('click', function () { show('menu'); });
  $('#b-restart').addEventListener('click', function () { startLevel(cur); });
  $('#o-again').addEventListener('click', function () { startLevel(cur); });
  $('#o-next').addEventListener('click', function () { if (nextPick != null) startLevel(nextPick); });
  $('#o-menu').addEventListener('click', function () { $('#over').classList.remove('on'); show('menu'); });
  $('#b-edit').addEventListener('click', function () { show('edit'); });
  $('#b-hero').addEventListener('click', function () { show('hero'); });
  $('#hp-done').addEventListener('click', function () { show('menu'); });

  function lockText(kind, id) {
    var r = rewardRoom(kind, id);
    return r < 0 ? 'Not in any room' : 'Clear room ' + (r + 1) + ': ' + levels[r].name;
  }
  // ---- Hero and power select ------------------------------------------------
  function renderHero() {
    fixSelection();
    var ms = maxScore();
    $('#hp-sub').textContent = 'Clear rooms to find new heroes and powers. Your best single run is ' + ms + ' gold.';
    var hg = $('#hp-heroes');
    hg.innerHTML = '';
    Object.keys(DC.HEROES).sort(function (p, q) { return (heroOpen(q) ? 1 : 0) - (heroOpen(p) ? 1 : 0); }).forEach(function (id) {
      var H = DC.HEROES[id], open = heroOpen(id);
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'hc' + (id === heroSel ? ' sel' : '') + (open ? '' : ' locked');
      b.disabled = !open;
      b.appendChild(img(H.sprite));
      var d = document.createElement('div');
      var nm = document.createElement('b'); nm.textContent = H.name;
      var st = document.createElement('span'); st.className = 'st';
      st.textContent = open ? ('Health ' + (10 + H.hp) + ' · ' + H.slots + ' powers') : lockText('hero', id);
      var ds = document.createElement('p'); ds.textContent = H.desc;
      d.appendChild(nm); d.appendChild(st); d.appendChild(ds);
      b.appendChild(d);
      b.addEventListener('click', function () { heroSel = id; fixSelection(); saveSelection(); renderHero(); });
      hg.appendChild(b);
    });
    var slots = DC.HEROES[heroSel].slots;
    $('#hp-slots').textContent = powSel.length + ' of ' + slots + ' slots';
    var pl = $('#hp-powers');
    pl.innerHTML = '';
    Object.keys(DC.POWERS).forEach(function (id) {
      var P = DC.POWERS[id], open = powerOpen(id), on = powSel.indexOf(id) >= 0;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pc' + (on ? ' sel' : '') + (open ? '' : ' locked');
      b.disabled = !open;
      b.setAttribute('aria-pressed', on);
      b.appendChild(img(P.sprite));
      var d = document.createElement('div');
      var nm = document.createElement('b'); nm.textContent = P.name;
      var st = document.createElement('span'); st.className = 'st';
      st.textContent = open ? ('Recharges in ' + P.cd + ' turns') : lockText('power', id);
      var ds = document.createElement('p'); ds.textContent = powerTip(id);
      d.appendChild(nm); d.appendChild(st); d.appendChild(ds);
      b.appendChild(d);
      b.addEventListener('click', function () {
        if (on) powSel.splice(powSel.indexOf(id), 1);
        else { powSel.push(id); if (powSel.length > slots) powSel.shift(); }
        saveSelection(); renderHero();
      });
      pl.appendChild(b);
    });
  }

  // ---- Editor ---------------------------------------------------------------
  var ed = 0;
  var FIELDS = [
    ['name', 'Name', 'text', null, null, true],
    ['w', 'Columns (2–7)', 'number', 2, 7],
    ['h', 'Rows (2–7)', 'number', 2, 7],
    ['heroHP', 'Hero health', 'number', 3, 60],
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
    Object.keys(DC.POWERS).forEach(function (k) { opt('power:' + k, 'Power: ' + DC.POWERS[k].name, L.reward.kind === 'power' && L.reward.id === k); });
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
      var em = img(k);
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
    n.from = [levels.length]; n.req = prev.req + 4; n.theme = 'throne'; n.reward = { kind: 'door' };
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
    levels = defaultLevels(); best = {}; saveBest(); cleared = {}; saveCleared(); saveLevels(); ed = 0; renderEditor(); setMsg('Back to the 12 starter rooms. Progress was reset.');
  });

  // ---- Boot -----------------------------------------------------------------
  function start(data) {
    loadAll(data || {});
    show('menu');
  }
  if (window.claude && window.claude.hot) {
    window.claude.hot.snapshot(function () { return { levels: levels, best: best, cleared: cleared, unlockAll: unlockAll, hero: heroSel, pows: powSel }; });
    if (window.claude.hot.ready) window.claude.hot.ready(start); else start(window.claude.hot.data || {});
  } else start({});
})();

/* ---- Android: hook the system Back button when running inside the Capacitor shell ---- */
(function () {
  var cap = window.Capacitor, A = cap && cap.Plugins && cap.Plugins.App;
  if (!A || !A.addListener) return;
  A.addListener('backButton', function () { if (!(window.__cryptBack && window.__cryptBack())) A.exitApp(); });
})();
