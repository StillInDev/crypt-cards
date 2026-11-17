(function (root) {
  'use strict';

  // ---- Card catalogue -------------------------------------------------------
  // lo/hi: value range when a card is created. bf: how strongly the level's
  // difficulty ramp raises the card's value.
  const TYPES = {
    coin:      { kind: 'gold',    name: 'Coin',            lo: 1, hi: 3, bf: 0.5, tip: 'Step on it to add its value to your gold.' },
    gem:       { kind: 'gold',    name: 'Gem',             lo: 4, hi: 6, bf: 0.5, tip: 'Worth a lot of gold.' },
    potion:    { kind: 'heal',    name: 'Potion',          lo: 2, hi: 5, bf: 0.7, tip: 'Restores health, up to your maximum, and cures poison.' },
    chest:     { kind: 'chest',   name: 'Chest',           lo: 0, hi: 0, bf: 0,   tip: 'Step toward it to open it. You stay where you are and the turn is spent, and an item appears in its place for you to pick up.' },
    poison:    { kind: 'harm',    name: 'Poison',          lo: 1, hi: 4, bf: 1,   tip: 'Poisons you. You lose 1 health every turn for as many turns as its number, but it can never take you below 1. Any healing cures it.' },
    // The one trap: a square base with 1 to 4 arrows. Every turn it turns clockwise and its spikes stab whatever the arrows point at.
    trap:      { kind: 'dtrap',   name: 'Spike trap',      lo: 1, hi: 4, bf: 1,   tip: 'Its arrows show where its spikes stab. Every turn it turns clockwise, then hits whatever its arrows point at, you or a monster, for its number. Stepping on it hurts too.' },
    // Monster tips say only what makes that monster different. The shared rules (it hurts for its number,
    // fire and ice monsters, shields, freezing) are not repeated on every card.
    rat:       { kind: 'monster', name: 'Rat',             lo: 1, hi: 3, bf: 1,   ability: 'breed', tip: 'Breeds: if it stays put for 3 turns, it bites a neighbouring card (even another rat) for its number. An empty square, or a card it destroys, becomes another rat just as strong. When rats bite the same card, only the biggest bite lands.' },
    bat:       { kind: 'monster', name: 'Bat',             lo: 2, hi: 4, bf: 1,   frail: true, tip: 'Weakness, paper wings: any hit at all kills it.' },
    skeleton:  { kind: 'monster', name: 'Skeleton',        lo: 3, hi: 6, bf: 1,   brittle: true, bones: 3, tip: 'Weakness, brittle bones: weapons hit it for double. Bone wall: when 3 or more skeletons touch in a chain, each one gains a quarter of its health (once).' },
    ogre:      { kind: 'monster', name: 'Ogre',            lo: 5, hi: 9, bf: 1,   thick: 1, tip: 'Thick skull: a weapon that hits it wears down 1 extra.' },
    goldskull: { kind: 'monster', name: 'Golden skeleton', lo: 2, hi: 5, bf: 0.7, pays: true, tip: 'Made of gold: beat it and it pays out its number in gold.' },
    hive:      { kind: 'monster', name: 'Hive queen',      lo: 3, hi: 6, bf: 1,   ability: 'queen', tip: 'Swarm: every 4 turns it turns a neighbouring card into a bat.' },
    imp:       { kind: 'monster', name: 'Fire imp',       lo: 2, hi: 5, bf: 1,   el: 'fire', glow: true, tip: 'Embers: when it dies, its square glows for 3 turns. Whatever stands on it counts 3 more while it is there: a monster, a potion, a coin, a weapon, or you. Pick something up there and you keep the bonus.' },
    // anchor: never moves. Cards slide up to it but never push it; the space it would have filled gets a new card.
    golem:     { kind: 'monster', name: 'Golem',           lo: 3, hi: 6, bf: 1,   anchor: true, tip: 'Rooted in stone: it never moves. Cards slide up to it but never push it, and a new card fills the space it leaves open. Frozen, it cannot be swapped either.' },
    firesword: { kind: 'weapon',  name: 'Fire sword',      lo: 4, hi: 8, bf: 1, el: 'fire', tip: 'A fire weapon. It cannot hurt fire monsters and hits ice monsters for double.' },
    icesword:  { kind: 'weapon',  name: 'Ice sword',       lo: 4, hi: 8, bf: 1, el: 'ice',  tip: 'An ice weapon. It cannot hurt ice monsters and hits fire monsters for double. A monster it hits but does not kill freezes solid, and a frozen monster cannot be hit: you swap places with it. It can kill a Phoenix.' },
    scythe:    { kind: 'weapon',  name: 'Scythe',         lo: 3, hi: 6, bf: 1,   sweep: true, tip: 'Step toward a monster to sweep: the target and the two squares beside it (across your swing) all take the scythe\'s power. The scythe wears down by the most damage it deals to one target.' },
    webspider: { kind: 'monster', name: 'Web spider',     lo: 3, hi: 9, bf: 1,   tip: 'Hides in its web while you hold any weapon: its health drops to 0 and you can walk straight through it. Catch it bare-handed and it fights back.' },
    ninjastar: { kind: 'weapon',  name: 'Ninja star',      lo: 3, hi: 6, bf: 1,   bow: true, star: true, tip: 'One throw. Tap a monster in your row or column to hit it for the star\'s power. No chain, and nothing outside your row or column can be hit.' },
    windblade: { kind: 'weapon',  name: 'Wind blade',      lo: 2, hi: 4, bf: 0.5, grows: 'wind', tip: 'While it lies on the board it gains 1 power every time it slides to a new square. Once you pick it up it stops growing and fights like a normal sword.' },
    painblade: { kind: 'weapon',  name: 'Blade of pain',   lo: 2, hi: 4, bf: 0.5, grows: 'pain', tip: 'While it lies on the board it gains 1 power every time you take damage. Once you pick it up it stops growing and fights like a normal sword.' },
    elecbow:   { kind: 'weapon',  name: 'Electric bow',   lo: 3, hi: 5, bf: 0.5, bow: true, tip: 'A bow with one arrow. Tap any monster on the board to shoot it for the bow\'s power. The shock then jumps to every monster touching the one it hit, 1 weaker with each jump. Frozen monsters are not hit. Stepping into a monster with a bow is just like having no weapon.' },
    // A wand fights like a sword, but its hit pierces: whatever power is left after a monster carries on
    // down the line into the next one, to the edge of the board. It wears down by the health it cuts through.
    firewand:  { kind: 'weapon',  name: 'Fire wand',       lo: 4, hi: 8, bf: 1, el: 'fire', wand: true, tip: 'A fire weapon that pierces. Step toward a monster to hit it; any power left over carries on down that row or column into the monsters behind it. It wears down by the health it burns through. Fire monsters are immune, ice monsters take double.' },
    icewand:   { kind: 'weapon',  name: 'Ice wand',        lo: 4, hi: 8, bf: 1, el: 'ice',  wand: true, tip: 'An ice weapon that pierces. Step toward a monster to hit it; any power left over carries on down that row or column into the monsters behind it, freezing the ones it does not kill. It wears down by the health it cuts through. Ice monsters are immune, fire monsters take double. It can kill a Phoenix.' },
    phoenix:   { kind: 'monster', name: 'Phoenix',         lo: 4, hi: 8, bf: 1,   el: 'fire', immortal: true, tip: 'Reborn from ash: damage only wears it down to 1. Step on it with no weapon, or hit it with an ice weapon, to finish it.' },
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
    ['harpy', 'Harpy', 3, 6], ['troll', 'Troll', 5, 9], ['minotaur', 'Minotaur', 15, 25], ['snake', 'Viper', 2, 4],
    ['beetle', 'Beetle', 2, 5], ['mummy', 'Mummy', 4, 7], ['vampire', 'Vampire', 4, 7], ['banshee', 'Banshee', 3, 6],
    ['salamander', 'Salamander', 3, 6, 'fire'], ['magmaslime', 'Magma slime', 2, 5, 'fire'],
    ['frostwolf', 'Frost wolf', 3, 6, 'ice'], ['frostwisp', 'Frost wisp', 2, 5, 'ice'], ['icespider', 'Ice spider', 3, 5, 'ice']
  ];
  // Each one gets its own trick, in theme. The weaker minions get a weakness instead.
  const GIMMICKS = {
    slime:      { slippery: true, tip: 'Slippery: hit it and it survives, and it slides away, swapping places with a card next to it.' },
    goblin:     { loot: true, tip: 'Looter: every turn it robs a coin or gem next to it of a third of its own health (rounded up). It won\'t risk it if you hit it in the last 2 turns.' },
    zombie:     { tip: 'Undying: killed by a weapon, it leaves a tomb in its square.' },
    ghost:      { phase: true, haunt: 2, tip: 'Flickers: every other turn it fades out and nothing can touch it; walk into it then and you pass through. Hit it while it is solid and its chill poisons you for 2 turns.' },
    spider:     { squish: true, tip: 'Weakness, squishy: step on it bare-handed and it only hurts you for 1.' },
    scorpion:   { sting: true, tip: 'Stinger: hit it with a weapon while standing next to it and it stings you for 1, even as it dies.' },
    wolf:       { pack: true, tip: 'Pack hunter: when a wolf or frost wolf dies, every other one on the board gets 2 stronger.' },
    cultist:    { pact: true, tip: 'Blood pact: when it dies, the monsters next to it get 2 stronger.' },
    wraith:     { resist: true, tip: 'Last breath: when it dies, no monster can be hurt until the end of your next turn.' },
    shroom:     { fragile: 2, tip: 'Weakness, delicate: every time it slides to a new square it loses 2 health, and it crumbles at 0.' },
    gargoyle:   { stone: 2, tip: 'Stone skin: hits of 2 damage or less do nothing to it.' },
    lich:       { ability: 'raise', tip: 'Necromancer: every 6 turns it turns a random card next to it (anything but a skeleton) into a skeleton.' },
    harpy:      { ability: 'snatch', tip: 'Magpie: every 3 turns it swoops onto a coin anywhere on the board, taking its square and leaving its old one empty.' },
    troll:      { feeds: 1, tip: 'Glutton: every time another monster dies, it grows 1 bigger.' },
    // The minotaur is a boss: only found in the last room of an area, never more than one on the board.
    minotaur:   { boss: true, shell: true, bf: 0, ability: 'stampede', horns: true, tip: 'Boss. Arrives shielded. Every 2 turns it stamps and shuffles the cards around it. Horns: a sword, scythe or wand hit that does not kill it breaks the weapon.' },
    snake:      { venom: true, tip: 'Venom: its bite also poisons you for its number of turns: 1 damage a turn, never below 1 health.' },
    beetle:     { shell: true, tip: 'Hard shell: the first hit only cracks its shell and does no damage. After that it takes damage as normal.' },
    mummy:      { treasure: true, tip: 'Buried treasure: killed by a weapon, it leaves a chest in its square.' },
    vampire:    { thirst: 2, tip: 'Bloodthirst: every time you take damage, it gets 2 stronger.' },
    banshee:    { wail: true, tip: 'Wail: while it is on the board, your powers recharge at half speed.' },
    salamander: { tail: true, tip: 'Drops its tail: hit it without killing it and it escapes off the board, leaving a wriggling 1-health tail behind.' },
    magmaslime: { splits: true, tip: 'Splits: killed by a weapon, it bursts into a slime half as strong as it started.' },
    frostwolf:  { pack: true, tip: 'Pack hunter: when a wolf or frost wolf dies, every other one on the board gets 2 stronger.' },
    frostwisp:  { melts: true, tip: 'Weakness, melting: it loses 1 every turn and melts away at 0.' },
    icespider:  { squish: true, tip: 'Weakness, squishy: step on it bare-handed and it only hurts you for 1.' }
  };
  MORE.forEach(function (m) {
    TYPES[m[0]] = Object.assign({ kind: 'monster', name: m[1], lo: m[2], hi: m[3], bf: 1, el: m[4] }, GIMMICKS[m[0]]);
  });
  // What a salamander leaves behind when it escapes.
  TYPES.tail = { kind: 'monster', name: 'Salamander tail', lo: 1, hi: 1, bf: 0, hidden: true,
    tip: 'A salamander\'s dropped tail, still wriggling. The salamander itself got away.' };
  // When a fire imp dies, its square glows for this many turns: whatever is on it counts this much more.
  const IMP_GLOW = { amt: 3, turns: 3 };
  // A dead zombie's tomb: any damage at all shatters it. Bare-handed, you just bump into it.
  TYPES.tomb = { kind: 'monster', name: 'Tomb', lo: 1, hi: 1, bf: 0, hidden: true, tomb: true,
    tip: 'A zombie\'s tomb. It blocks the way: bump into it bare-handed and your turn is spent. Any damage at all shatters it, from a weapon, a power, a trap or a bomb.' };
  // Abilities that fire every few turns: turns between uses.
  const PERIOD = { queen: 4, raise: 6, snatch: 3, stampede: 2 };

  // ---- Heroes ---------------------------------------------------------------
  // hp: change to the level's hero health. rech: power recharge multiplier.
  const HEROES = {
    knight:   { name: 'Knight',   sprite: 'knight',   hp: 2,  slots: 3, unlock: 0,  pass: { swordBonus: 1 }, desc: 'Sturdy. Swords you pick up are 1 stronger.' },
    sorcerer: { name: 'Sorcerer', sprite: 'sorcerer', hp: -2, slots: 3, unlock: 30, pass: { rech: 0.7 }, startReady: true, desc: 'Frail, but powers start ready and recharge 30% faster.' },
    // Shown as the Yeti; the id stays 'icemage' so saved picks and the Frozen Cavern reward keep working.
    icemage:  { name: 'Yeti',     sprite: 'yeti',     hp: 0,  slots: 3, unlock: 60, pass: { cut: 1 }, desc: 'Thick fur: monsters hit you for 1 less.' },
    // Shown as the Ninja; the id stays 'rogue' so saved picks and the Armory reward keep working.
    rogue:    { name: 'Ninja',    sprite: 'rogue',    hp: -1, slots: 3, unlock: 90, pass: { trapproof: 1 }, desc: 'Silent feet: traps cannot hurt you.' },
    stormmage: { name: 'Lightning Wizard', sprite: 'stormmage', hp: 0, slots: 3, unlock: 0, pass: { storm: 1 }, desc: '8 kills charge a smite: the next attack kills outright. Every 4th attack chains lightning to the monsters next to the target, for 1 + his level in damage.' },
    bard:     { name: 'Bard',     sprite: 'bard',     hp: 0,  slots: 3, unlock: 0,  pass: { song: 1 }, desc: 'Soothing tunes: heals 2 + his upgrades every turn, and every coin, gem, potion and weapon on the board grows by 1 each turn. All healing can take him over his max health, by up to 3 + his upgrades.' },
    dragonkin: { name: 'Dragonborn', sprite: 'dragonkin', hp: 1, slots: 3, unlock: 0, pass: { stomp: 1 }, desc: 'Scaly feet: stomps monsters with 1 health, taking no damage and not using his weapon.' },
    count:    { name: 'Vampire',  sprite: 'count',    hp: -1, slots: 3, unlock: 0,  pass: { drain: 3 }, desc: 'Lifesteal: heals 1 for every 3 damage his weapons deal.' },
    barbarian: { name: 'Barbarian', sprite: 'barbarian', hp: 2, slots: 3, unlock: 0, pass: { rage: 1 }, desc: 'Rage: at a quarter health or less, weapon hits have a 1 in 3 chance to crit for double damage, without wearing the weapon down any faster.' },
    cactus:   { name: 'Cactus',   sprite: 'cactus',   hp: 1,  slots: 3, unlock: 0,  pass: { thorns: 1 }, desc: 'Prickly: at half health or less, every monster next to you takes 1 damage each turn.' },
  };

  // ---- Powers ---------------------------------------------------------------
  // cd: turns to recharge. target: what a tap must hit (null = acts at once).
  // desc: what the power does, shown in its details (the numbers are in the stats above it).
  // tip: the in-game text, with numbers. disabled: kept in the engine (and its tests) but the app leaves it out.
  const POWERS = {
    heal:     { name: 'Healing',      sprite: 'p_heal',     cd: 14, target: null,      unlock: 0,  desc: 'Restores health equal to its power.', tip: 'Restore 5 health.' },
    forge:    { name: 'Forge',        sprite: 'p_forge',    cd: 12, target: null,      unlock: 10, desc: 'Conjures a sword with its power. If you already hold a weapon, the sword waits and arrives as soon as your hands are empty.', tip: 'Conjure a sword as strong as your max health. If you already hold a weapon, the sword waits and arrives as soon as your hands are empty.' },
    dart:     { name: 'Poison dart',  sprite: 'p_dart',     cd: 8,  target: null,      unlock: 20, desc: 'Flies at a random monster and hits it for its power. The monster is also poisoned: it loses 1 health a turn for 3 turns.', tip: 'Flies at a random monster. It takes 4 damage and is poisoned: it loses 1 health a turn for 3 turns.' },
    fire:     { name: 'Fire touch',   sprite: 'p_fire',     cd: 10, target: 'card',    unlock: 30, desc: 'Tap any card to burn it away. A new card takes its place.', tip: 'Tap any card to burn it away. A new card takes its place.' },
    scythe:   { name: 'Scythe',       sprite: 'p_scythe',   cd: 15, target: null,      unlock: 40, desc: 'Cuts down every monster, trap and poison in the 8 cards around you.', tip: 'Cut down every monster, trap and poison in the 8 cards around you.' },
    massheal: { name: 'Mass healing', sprite: 'p_massheal', cd: 14, target: null,      unlock: 50, desc: 'Heals you by its power, and makes every potion on the board that much stronger.', tip: 'Heal 2, and make every potion on the board 2 stronger.' },
    thunder:  { name: 'Thunder',      sprite: 'p_thunder',  cd: 16, target: null,      unlock: 60, desc: 'Lightning strikes 3 random monsters, each for its power in damage.', tip: 'Lightning strikes 3 random monsters on the board for 3 damage each.' },
    ice:      { name: 'Frost',        sprite: 'p_ice',      cd: 18, target: null,      unlock: 70, disabled: true, desc: 'Monsters deal no damage to you for as many moves as its power.', tip: 'Monsters deal no damage for your next 3 moves.' },
    teleport: { name: 'Teleport orb', sprite: 'p_teleport', cd: 12, target: 'card',    unlock: 80, desc: 'Tap any card. You jump there without using it, and it vanishes.', tip: 'Tap any card. You jump there without using it, and it vanishes.' },
    quake:    { name: 'Tremor',       sprite: 'p_quake',    cd: 0,  target: null,      unlock: 45, passive: true, desc: 'Every time you step, a monster that slides into the square you left is hit for its power.', tip: 'Every time you step, a monster that slides into the square you left is hit. Damage is 3, plus 1 for every 25 points of your best score (up to 12).' },
    burst:    { name: 'Potion burst', sprite: 'p_burst',    cd: 10, target: 'potion',  unlock: 90, desc: 'Tap a potion. It explodes and hits the monsters next to it for the potion\'s number.', tip: 'Tap a potion. It explodes and hits neighbouring monsters for its number.' },
    ward:     { name: 'Shield',       sprite: 'p_shield',   cd: 12, target: null,      unlock: 50, desc: 'Fire and ice monsters can\'t hurt you for as many turns as its power.', tip: 'For your next 4 turns, fire and ice monsters can\'t hurt you.' },
    // Placeholder sprites until their own icons are drawn (art/powers/p_magnet.md and the rest).
    magnet:   { name: 'Magnet',       sprite: 'coin',       cd: 16, target: null,      unlock: 100, desc: 'Every coin and gem on the board flies into your purse. Upgrades add bonus gold to each one.', tip: 'Every coin and gem on the board flies into your purse.' },
    hourglass: { name: 'Hourglass',   sprite: 'p_teleport', cd: 20, target: null,      unlock: 110, desc: 'Halves the time left on your other powers.', tip: 'Halves the time left on your other powers.' },
    whetstone: { name: 'Whetstone',   sprite: 'sword',      cd: 10, target: null,      unlock: 120, desc: 'Sharpens the weapon you hold: it gains its power.', tip: 'Sharpen the weapon you hold: it gains 2 power.' },
    laststand: { name: 'Last Stand',  sprite: 'goldskull',  cd: 0,  target: null,      unlock: 130, passive: true, desc: 'Once per room, a hit that would kill you leaves you with health equal to its power instead.', tip: 'Once per room, a hit that would kill you leaves you at 1 health instead.' }
  };

  // ---- Power upgrades (bought with banked gold between runs) ----------------
  // Each power has levels 0..POWER_MAX_LV. amt: [base, gain per level] for its main number;
  // cdCut: turns of recharge removed per level. {n} in the text is the current amount.
  const POWER_MAX_LV = 4;
  const DART_POISON = 3; // turns of poison a dart leaves in the monster it hits (1 damage a turn)
  // All prices are multiples of 500, from 1000 up.
  const UPGRADE_COST = [1000, 2500, 5000, 10000]; // gold to go from level i to i + 1
  const UPGRADES = {
    heal:     { amt: [5, 2],  text: 'Restore {n} health.', what: '+2 healing' },
    forge:    { bonus: [0, 1, 3, 7, 15], text: 'Conjure a sword.', what: ['+1 sword power', '+2 sword power', '+4 sword power', '+8 sword power'] },
    dart:     { amt: [4, 2],  text: 'Flies at a random monster. It takes {n} damage and is poisoned: it loses 1 health a turn for 3 turns.', what: '+2 damage' },
    fire:     { cdCut: 2, what: '2 turns faster recharge' },
    scythe:   { cdCut: 2, what: '2 turns faster recharge' },
    massheal: { amt: [2, 1],  text: 'Heal {n}, and make every potion on the board {n} stronger.', what: '+1 healing and potion boost' },
    thunder:  { amt: [3, 1],  text: 'Lightning strikes 3 random monsters on the board for {n} damage each.', what: '+1 damage' },
    ice:      { amt: [3, 1],  text: 'Monsters deal no damage for your next {n} moves.', what: '+1 frozen move' },
    teleport: { cdCut: 2, what: '2 turns faster recharge' },
    quake:    { amt: [0, 1],  what: '+1 tremor damage' },
    burst:    { cdCut: 2, what: '2 turns faster recharge' },
    ward:     { amt: [4, 1],  text: 'For your next {n} turns, fire and ice monsters can\'t hurt you.', what: '+1 shielded turn' },
    magnet:   { amt: [0, 1],  what: '+1 gold from each coin and gem' },
    hourglass: { cdCut: 2,    what: '2 turns faster recharge' },
    whetstone: { amt: [2, 1], text: 'Sharpen the weapon you hold: it gains {n} power.', what: '+1 power' },
    laststand: { amt: [1, 1], text: 'Once per room, a hit that would kill you leaves you at {n} health instead.', what: '+1 health left after it saves you' }
  };
  function clampLv(lv) { return Math.max(0, Math.min(POWER_MAX_LV, lv | 0)); }
  function powerAmount(id, lv) { const u = UPGRADES[id]; if (u && u.bonus) return u.bonus[clampLv(lv)]; return u && u.amt ? u.amt[0] + u.amt[1] * clampLv(lv) : 0; }
  // What the next upgrade of a power adds, for the upgrade button.
  function upgradeWhat(id, lv) { const w = UPGRADES[id] && UPGRADES[id].what; return Array.isArray(w) ? w[clampLv(lv)] : w; }
  // Forge: a sword as strong as the hero's max health, plus the upgrade bonus.
  function forgePower(S, lv) { return S.hero.max + powerAmount('forge', lv); }
  function powerCd(id, lv) { const u = UPGRADES[id]; return Math.max(1, POWERS[id].cd - (u && u.cdCut ? u.cdCut * clampLv(lv) : 0)); }
  function upgradeCost(lv) { lv = lv | 0; return lv >= POWER_MAX_LV ? null : UPGRADE_COST[lv]; }

  // Hero upgrades: each level adds HERO_UP_HP max health.
  const HERO_UPGRADE_COST = [1000, 2500, 5000, 10000];
  // Gold to unlock a hero or power straight away instead of finding it in its room.
  const HERO_BUY_COST = 1500, POWER_BUY_COST = 1000;
  const HERO_MAX_LV = HERO_UPGRADE_COST.length;
  const HERO_UP_HP = 2;
  function heroLv(lv) { return Math.max(0, Math.min(HERO_MAX_LV, lv | 0)); }
  function heroHpBonus(lv) { return HERO_UP_HP * heroLv(lv); }
  function heroUpgradeCost(lv) { lv = lv | 0; return lv >= HERO_MAX_LV ? null : HERO_UPGRADE_COST[lv]; }
  // The tip text for a power at an upgrade level (and, for Tremor, the player's power level).
  function powerTip(id, lv, plv) {
    const u = UPGRADES[id];
    if (id === 'quake') return POWERS.quake.tip + ' Right now: ' + quakeDamage(plv, lv) + ' damage.';
    return u && u.text ? u.text.replace(/\{n\}/g, powerAmount(id, lv)) : POWERS[id].tip;
  }

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
    if (T.bow) c.t = 1; // one throw or shot: no weapon attacks more than once
    if (T.kind === 'monster') c.mx = v; // the strength it arrived with (trolls heal back to it, magma slimes split from it)
    if (T.kind === 'monster' && (T.shell || (L.shieldP && S.rng() < L.shieldP))) c.sh = 1; // the first hit is absorbed
    if (T.kind === 'dtrap') {
      // Heads: up, right, down, left. One to four of them, fewer being more common.
      const r = S.rng(), n = r < 0.35 ? 1 : r < 0.7 ? 2 : r < 0.9 ? 3 : 4;
      const hd = [0, 0, 0, 0]; let placed = 0;
      while (placed < n) { const d = Math.floor(S.rng() * 4); if (!hd[d]) { hd[d] = 1; placed++; } }
      c.h = hd;
    }
    return c;
  }

  const RAT_TURNS = 3;
  const THUNDER_HITS = 3; // monsters the Thunder power strikes
  // Lightning Wizard: kills that charge a smite, and attacks between chain lightning bolts.
  const STORM_KILLS = 8, STORM_CHAIN = 4;
  // Bard: heals 2 + upgrades every turn, and every turn the helpful cards on the board (not chests,
  // whose value is hidden) grow by 1. His healing can overfill max health by 3 + upgrades.
  function songHeal(lv) { return 2 + (lv | 0); }
  const SONG_GROWS = { gold: 1, heal: 1, weapon: 1 };
  function overheal(lv) { return 3 + (lv | 0); }
  function healCap(H) { return H.max + (H.pass.song ? overheal(H.lv) : 0); }
  function healBy(H, amt) { const g = Math.max(0, Math.min(amt, healCap(H) - H.hp)); H.hp += g; return g; }
  // Any healing cures poison: potions and healing powers always, passive healing (song, lifesteal)
  // when it actually restores health.
  function cure(H, fx, cell) {
    if (H.poison > 0) { H.poison = 0; fx.push({ cell: cell == null ? H.pos : cell, text: 'Cured', cls: 'heal', anim: 'heal' }); }
  }
  // Barbarian: at a quarter health or less, a weapon hit crits (double damage) 1 time in 3.
  function critMul(S) { const H = S.hero; return H.pass.rage && S.rng && H.hp > 0 && H.hp * 4 <= H.max && S.rng() < 1 / 3 ? 2 : 1; }
  // Vampire: damage dealt by weapons this step, for lifesteal.
  let weaponDealt = 0;
  function chainDamage(lv) { return 2 + (lv | 0); } // 1 + the level shown (Lvl. 1 at no upgrades) // still turns before a rat strikes
  function blankCard(S) { return { uid: ++S.uid, type: 'blank', kind: 'empty', v: 0 }; }

  // Helpful cards can't flood the board: once one kind of them (all weapons, all potions, all coins and
  // gems, all chests) fills half the squares, no more of that kind appears.
  // Monsters, traps, poison and bombs are never capped.
  const HELPFUL = { weapon: 1, heal: 1, gold: 1, chest: 1 };
  function cappedKinds(S) {
    const n = {}, max = Math.floor(S.level.w * S.level.h / 2), full = {};
    for (const c of S.grid) if (c && HELPFUL[c.kind]) n[c.kind] = (n[c.kind] || 0) + 1;
    for (const k in n) if (n[k] >= max) full[k] = true;
    return full;
  }
  // Weighted pick from {type: weight}, skipping capped kinds. If everything is capped, the cap is ignored.
  function pickFrom(S, weights, fallback) {
    const full = cappedKinds(S);
    for (let pass = 0; pass < 2; pass++) {
      let total = 0;
      const w = {};
      for (const k in weights) { const x = pass === 0 && full[TYPES[k].kind] ? 0 : weights[k]; w[k] = x; total += x; }
      if (total <= 0) continue;
      let r = S.rng() * total;
      for (const k in w) { r -= w[k]; if (r < 0) return k; }
    }
    return fallback;
  }

  function pickType(S) {
    const L = S.level;
    const w = {};
    for (const k in TYPES) {
      let x = Number((L.weights || {})[k]) || 0;
      if (x > 0 && L.adapt !== false && TYPES[k].kind === 'heal' && S.hero.hp / S.hero.max < 0.4) x *= 2;
      if (x > 0) w[k] = x;
    }
    // A boss never has company of its own kind: one on the board at a time.
    for (const k in w) if (TYPES[k].boss && S.grid.some(function (c) { return c && c.type === k; })) delete w[k];
    return pickFrom(S, w, 'coin');
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
    const maxHp = Math.max(3, level.heroHP + HD.hp + heroHpBonus(opts.heroLevel));
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
        sword: null, forge: 0, poison: 0, frost: 0, ward: 0, pass: pass,
        lv: heroLv(opts.heroLevel), kills: 0, hits: 0, drain: 0, song: 0,
        powers: ids.map(function (id) {
          const lv = clampLv((opts.upgrades || {})[id]);
          if (POWERS[id].passive) return { id: id, max: 0, cd: 0, lv: lv };
          const rc = Math.max(1, Math.ceil(powerCd(id, lv) * (pass.rech || 1)));
          return { id: id, max: rc, cd: HD.startReady ? 0 : Math.ceil(rc / 2), lv: lv };
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
      grid: S.grid.map(function (c) { return c && { uid: c.uid, type: c.type, kind: c.kind, v: c.v, t: c.t, h: Array.isArray(c.h) ? c.h.slice() : c.h, frozen: c.frozen, sh: c.sh, rw: c.rw, psn: c.psn, mx: c.mx, ph: c.ph, wall: c.wall }; }),
      resist: S.resist,
      hero: {
        id: S.hero.id, pos: S.hero.pos, hp: S.hero.hp, max: S.hero.max, gold: S.hero.gold, turn: S.hero.turn,
        frost: S.hero.frost, ward: S.hero.ward, poison: S.hero.poison, pass: S.hero.pass, forge: S.hero.forge,
        lv: S.hero.lv, kills: S.hero.kills, hits: S.hero.hits, drain: S.hero.drain, song: S.hero.song, stood: S.hero.stood,
        sword: S.hero.sword && { v: S.hero.sword.v, type: S.hero.sword.type, el: S.hero.sword.el, wand: S.hero.sword.wand, bow: S.hero.sword.bow, c: S.hero.sword.c, sweep: S.hero.sword.sweep, star: S.hero.sword.star },
        powers: S.hero.powers.map(function (p) { return { id: p.id, max: p.max, cd: p.cd, lv: p.lv }; })
      }
    };
  }

  function hurtHero(S, amount) {
    const H = S.hero;
    let d = amount;
    // Last Stand (passive): once per room, a hit that would kill leaves the hero standing.
    const ls = d > 0 && H.hp - d <= 0 && !H.stood && H.powers.find(function (p) { return p.id === 'laststand'; });
    if (ls) {
      const left = Math.max(1, Math.min(H.max, powerAmount('laststand', ls.lv)));
      d = Math.max(0, H.hp - left);
      H.hp = left; H.stood = true; H.standNow = true;
      S.hurts = (S.hurts | 0) + 1;
      return d;
    }
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
  // byWeapon: the blow came from a weapon the hero holds (sword, scythe, wand, bow, star).
  // The game being changed right now, and the monsters that died during it. Deaths are gathered so that
  // death abilities (wolf packs, cultist pacts) run once the turn's damage is done.
  let CUR = null;
  function noteDeath(m, pos) {
    if (!CUR) return;
    const S = CUR.S, p = pos != null ? pos : S.grid.indexOf(m);
    const adj = p < 0 ? [] : neighbours4(S, p).map(function (ap) { return S.grid[ap]; }).filter(function (c) { return c && c.kind === 'monster'; });
    CUR.deaths.push({ m: m, p: p, adj: adj });
  }
  function begin(S) { CUR = { S: S, deaths: [] }; }
  // Death abilities, once the turn's damage is done: wolf packs howl, cultist pacts pass on, trolls feed,
  // a wraith's last breath shields every monster, a fire imp leaves a glowing square.
  function finishDeaths(S, fx) {
    const deaths = CUR ? CUR.deaths : [];
    CUR = null;
    deaths.forEach(function (d) {
      const T = TYPES[d.m.type];
      if (T.pack) S.grid.forEach(function (c, p) {
        if (c && c !== d.m && c.kind === 'monster' && TYPES[c.type].pack) { c.v += 2; fx.push({ cell: p, text: 'Howl +2', cls: 'hurt', anim: 'spark' }); }
      });
      if (T.pact) d.adj.forEach(function (c) {
        const p = S.grid.indexOf(c);
        if (p >= 0 && c.kind === 'monster') { c.v += 2; fx.push({ cell: p, text: 'Pact +2', cls: 'hurt', anim: 'spark' }); }
      });
      S.grid.forEach(function (c, p) {
        if (c && c !== d.m && c.kind === 'monster' && TYPES[c.type].feeds) { c.v += TYPES[c.type].feeds; fx.push({ cell: p, text: '+' + TYPES[c.type].feeds, cls: 'hurt', anim: 'spark' }); }
      });
      if (T.resist) { S.resist = 1; if (d.p >= 0) fx.push({ cell: d.p, text: 'Last breath', cls: 'hurt', anim: 'immune' }); }
      if (T.glow && d.p >= 0) {
        unglow(S);
        S.glow = { cell: d.p, amt: IMP_GLOW.amt, left: IMP_GLOW.turns, on: null };
        fx.push({ cell: d.p, text: 'Embers', cls: 'gold', anim: 'fire' });
      }
    });
  }
  // The fire imp's glowing square. Whatever is on it counts IMP_GLOW.amt more; leave it (or let the glow
  // fade) and the bonus goes away. A card used up while standing on it keeps what it had.
  function glowTarget(S) {
    const G = S.glow;
    if (!G) return null;
    return G.cell === S.hero.pos ? 'hero' : S.grid[G.cell] || null;
  }
  function unglow(S) {
    const G = S.glow;
    if (!G || !G.on) return;
    if (G.on === 'hero') { S.hero.max -= G.amt; S.hero.hp = Math.max(1, Math.min(S.hero.max, S.hero.hp - G.amt)); }
    else if (S.grid.indexOf(G.on) >= 0) G.on.v = Math.max(G.on.kind === 'monster' ? 1 : 0, G.on.v - G.amt);
    G.on = null;
  }
  function syncGlow(S, fx, tick) {
    const G = S.glow;
    if (!G) return;
    if (tick && --G.left < 0) { unglow(S); S.glow = null; return; }
    const now = glowTarget(S);
    if (now === G.on) return;
    unglow(S);
    if (!now || (now !== 'hero' && (now.kind === 'empty' || now.kind === 'reward' || now.kind === 'chest'))) return;
    if (now === 'hero') { S.hero.max += G.amt; S.hero.hp += G.amt; } else now.v += G.amt; // you: health and its cap both rise
    G.on = now;
    fx.push({ cell: G.cell, text: '+' + G.amt, cls: 'gold', anim: 'fire' });
  }

  function hurtMonster(m, base, srcEl, lethal, byWeapon) {
    const T = TYPES[m.type];
    const mult = relation(srcEl, m);
    if (byWeapon && CUR) m.hitT = CUR.S.hero.turn; // goblins remember who just hit them
    if (T.phase && m.ph) return { dealt: 0, killed: false, mult: 0, immune: true, phased: true }; // a faded ghost
    if (CUR && CUR.S.resist > 0 && base > 0) return { dealt: 0, killed: false, mult: 0, immune: true, resisted: true }; // a wraith's last breath
    if (m.sh && mult !== 0 && base > 0) { m.sh = 0; return { dealt: 0, killed: false, mult: 0, immune: false, absorbed: true }; }
    if (mult === 0 || base <= 0) return { dealt: 0, killed: false, mult: mult, immune: mult === 0 };
    const eff = mult * (T.brittle && byWeapon ? 2 : 1); // brittle bones take double from weapons
    if (T.stone && base * eff <= T.stone) return { dealt: 0, killed: false, mult: mult, eff: eff, immune: false, stone: true };
    let nv = m.v - base * eff;
    if (T.frail) nv = 0; // any hit kills
    if (T.immortal) nv = lethal ? 0 : Math.max(1, nv); // only a lethal blow can finish it
    const killed = nv <= 0;
    const dealt = m.v - Math.max(nv, 0);
    if (byWeapon) weaponDealt += dealt;
    m.v = Math.max(nv, 0);
    const out = { dealt: dealt, killed: killed, mult: mult, eff: eff, immune: false };
    if (!killed && dealt > 0 && T.tail) {
      // Hurt but alive, the salamander escapes off the board and leaves its tail wriggling in its square.
      m.type = 'tail'; m.v = 1; m.mx = 1; m.sh = 0; m.frozen = false; m.tail = 0;
      out.escaped = true; out.morphed = true;
      return out;
    }
    if (!killed && dealt > 0 && T.slippery && CUR && CUR.S.rng) {
      // Hurt but alive, a slime slides away: it swaps places with a card next to it.
      const S = CUR.S, p = S.grid.indexOf(m);
      const opts = p < 0 ? [] : neighbours4(S, p).filter(function (ap) { const c = S.grid[ap]; return c && ap !== S.hero.pos && c.kind !== 'reward' && !isAnchor(c); });
      if (opts.length) { const ap = opts[Math.floor(S.rng() * opts.length)]; S.grid[p] = S.grid[ap]; S.grid[ap] = m; out.slid = ap; }
    }
    // Cut down by a weapon, some monsters leave something in the same square (the same card, so it
    // does not slide away and the hero does not step in). Any other death is final.
    if (killed && byWeapon && m.type === 'zombie') {
      m.type = 'tomb'; m.v = 1; m.sh = 0; m.frozen = false;
      out.killed = false; out.entombed = true; out.morphed = true;
    } else if (killed && byWeapon && T.treasure) {
      m.type = 'chest'; m.kind = 'chest'; m.v = 0; m.sh = 0; m.frozen = false;
      out.killed = false; out.looted = true; out.morphed = true;
    } else if (killed && byWeapon && T.splits && ((m.mx | 0) >> 1) >= 1) {
      m.v = m.mx >> 1; m.mx = m.v; m.sh = 0; m.frozen = false;
      out.killed = false; out.split = true; out.morphed = true;
    }
    if (out.killed) noteDeath(m);
    return out;
  }
  // How much power a weapon spends on a hit: the health it cut through (less when it hit for double),
  // nothing on soft slime, 1 extra on a thick skull. Never more than the weapon had to give.
  function wearOf(m, res, power) {
    const T = TYPES[m.type];
    if (res.immune) return 0;
    let cost = res.eff ? Math.ceil(res.dealt / res.eff) : 0;
    cost = Math.min(power, cost);
    if (T.thick && (res.dealt > 0 || res.stone)) cost += T.thick;
    return cost;
  }
  // A Barbarian crit deals double, but wearOf caps the wear at the weapon's power: the same as a normal hit.
  // A weapon in your hands hit monster m at p. Scorpions sting back; a minotaur that survives breaks it.
  // Returns true when the weapon broke.
  function weaponHitBack(S, m, p, res, fx) {
    const T = TYPES[m.type];
    if (res.immune) return false;
    if (T.haunt && !res.absorbed) { S.hero.poison += T.haunt; fx.push({ cell: S.hero.pos, text: 'Poison ' + T.haunt, cls: 'hurt', anim: 'poison' }); }
    if (T.sting && neighbours4(S, S.hero.pos).indexOf(p) >= 0) {
      const lost = hurtHero(S, 1);
      fx.push({ cell: S.hero.pos, text: 'Sting −' + lost, cls: 'hurt', anim: 'poison' });
    }
    return !!(T.horns && !res.killed && !res.absorbed && S.grid[p] === m && m.kind === 'monster');
  }
  function resultFx(S, m, p, res, v0, fx, anim) {
    const H = S.hero;
    if (res.phased) fx.push({ cell: p, text: 'Faded', cls: 'info', anim: 'immune' });
    else if (res.resisted) fx.push({ cell: p, text: 'Resisted', cls: 'info', anim: 'immune' });
    else if (res.escaped) fx.push({ cell: p, text: 'Escaped!', cls: 'info', anim: 'puff' });
    else if (res.immune) fx.push({ cell: p, text: 'Immune', cls: 'info', anim: 'immune' });
    else if (res.stone) fx.push({ cell: p, text: 'Stone', cls: 'info', anim: 'immune' });
    else if (res.looted) fx.push({ cell: p, text: 'Treasure', cls: 'gold', anim: 'open' });
    else if (res.split) fx.push({ cell: p, text: 'Split', cls: 'info', anim: 'puff' });
    else if (res.killed) {
      fx.push({ cell: p, text: 'Slain', cls: 'info', anim: 'puff' });
      if (TYPES[m.type].pays) { H.gold += v0; fx.push({ cell: p, text: '+' + v0 + 'G', cls: 'gold', anim: 'gold' }); }
    } else if (!res.absorbed) {
      fx.push({ cell: res.slid != null ? res.slid : p, text: '−' + res.dealt, cls: 'info', anim: anim || null, hit: m.uid });
      if (res.slid != null) fx.push({ cell: res.slid, text: 'Slips away', cls: 'info', anim: 'swirl' });
      if (TYPES[m.type].immortal) fx.push({ cell: p, text: 'Reborn', cls: 'info', anim: 'flare' });
    }
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
        else if (isAnchor(S.grid[p])) { fix(seg, lb, 'edge'); seg = []; lb = 'edge'; } // a golem bounds the line like an edge
        else seg.push(p);
      }
      fix(seg, lb, 'edge');
    }
    return out;
  }

  // Cards that never move (golems). Slides stop at them and new cards fill the space they leave.
  function isAnchor(c) { return !!(c && TYPES[c.type] && TYPES[c.type].anchor); }

  // ---- One move -------------------------------------------------------------
  // Mutates S. Returns null when the move is off the grid.
  // Chests hold one of these. Weights, not levels: a chest is a gamble on what you need.
  const LOOT = { sword: 4, scythe: 2, firesword: 1, icesword: 1, firewand: 1, icewand: 1, elecbow: 1, ninjastar: 1, windblade: 1, painblade: 1, potion: 3, gem: 2 };
  function lootCard(S) {
    return makeCard(S, pickFrom(S, LOOT, 'potion'));
  }

  // Growing blades on the board: a wind blade gains 1 power each time it slides to a new square,
  // a blade of pain gains 1 power each time the hero is hurt. Picked up, they are plain swords.
  function bladeSnap(S) {
    const at = {};
    S.grid.forEach(function (c, p) { if (c && TYPES[c.type].grows) at[c.uid] = p; });
    return at;
  }
  function bladeGrowth(S, before, hits, fx) {
    S.grid.forEach(function (c, p) {
      if (!c || before[c.uid] == null) return; // only blades that were already on the board
      const g = TYPES[c.type].grows;
      const gain = g === 'wind' ? (before[c.uid] !== p ? 1 : 0) : g === 'pain' ? hits : 0;
      if (gain > 0) { c.v = Math.min(99, c.v + gain); fx.push({ cell: p, text: '+' + gain, cls: 'info', anim: 'spark' }); }
    });
  }

  // Abilities that fire every few turns (PERIOD). Ones that need something to act on (a potion for the
  // shroom, gold for the harpy, a monster for the ice spider) stay ready until there is something there.
  function periodic(S, fx) {
    const H = S.hero, done = new Set();
    for (let p = 0; p < S.grid.length; p++) {
      const q = S.grid[p];
      if (!q || q.kind !== 'monster' || done.has(q.uid)) continue;
      const ab = TYPES[q.type].ability, n = PERIOD[ab];
      if (!n) continue;
      done.add(q.uid);
      q.t = (q.t || 0) + 1;
      if (q.t < n) continue;
      const near = neighbours4(S, p).filter(function (ap) { const c = S.grid[ap]; return c && ap !== H.pos && c.kind !== 'reward'; });
      const pick = function (ok) { const o = near.filter(function (ap) { return ok(S.grid[ap]); }); return o.length ? o[Math.floor(S.rng() * o.length)] : -1; };
      let ap = -1;
      if (ab === 'queen' || ab === 'raise') {
        // A hive queen hatches a bat, a lich turns a neighbouring card (never a skeleton) into a skeleton.
        const kid = ab === 'queen' ? 'bat' : 'skeleton';
        ap = pick(function (c) { return c.kind !== 'empty' && c.type !== q.type && c.type !== kid && !isAnchor(c) && !TYPES[c.type].boss; });
        q.t = 0;
        if (ap >= 0) { S.grid[ap] = makeCard(S, kid); fx.push({ cell: ap, text: ab === 'queen' ? 'Swarm' : 'Rise', cls: 'hurt', anim: 'puff' }); }
      } else if (ab === 'snatch') {
        // A harpy swoops onto a coin anywhere on the board: it takes that square, its old one is left empty.
        const coins = [];
        S.grid.forEach(function (c, cp) { if (c && c.type === 'coin') coins.push(cp); });
        if (coins.length) {
          ap = coins[Math.floor(S.rng() * coins.length)];
          S.grid[ap] = q; S.grid[p] = blankCard(S);
          fx.push({ cell: ap, text: 'Swoop', cls: 'hurt', anim: 'loot' }); fx.push({ cell: p, text: '', cls: 'info', anim: 'puff' });
        }
      } else if (ab === 'stampede') {
        // The minotaur stamps: the cards around it are shuffled into random places (never you).
        const cells = near.filter(function (np) { return !isAnchor(S.grid[np]); });
        const cards = cells.map(function (np) { return S.grid[np]; });
        for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(S.rng() * (i + 1)); const tmp = cards[i]; cards[i] = cards[j]; cards[j] = tmp; }
        cells.forEach(function (np, i) { S.grid[np] = cards[i]; fx.push({ cell: np, text: '', cls: 'info', anim: 'quake' }); });
        if (cells.length) fx.push({ cell: p, text: 'Stampede', cls: 'hurt', anim: 'quake' });
        ap = cells.length ? cells[0] : -1;
      }
      if (ab === 'snatch' || ab === 'stampede') q.t = ap >= 0 ? 0 : n; // nothing to act on: stay ready
    }
  }

  // sell: 'sword' turns the held weapon into gold and spends the turn in place.
  function step(S, dir, doSpawn, sell, aim) {
    const L = S.level, w = L.w, h = L.h, H = S.hero;
    const hx = H.pos % w, hy = (H.pos / w) | 0;
    const hurt0 = S.hurts | 0, extraSpawn = [], blades0 = bladeSnap(S);
    let tpos, card = null, T = null;
    if (sell) {
      if (sell === 'bow') {
        const am = S.grid[aim];
        if (!H.sword || !H.sword.bow || aim === H.pos || !am || am.kind !== 'monster' || am.frozen || am.type === 'webspider') return null;
        if (H.sword.star && (aim % w !== hx && ((aim / w) | 0) !== hy)) return null; // a star only flies along your row or column
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
    begin(S);
    weaponDealt = 0;
    const swing = sell === 'bow' || (!sell && card.kind === 'monster' && !card.frozen && card.type !== 'webspider' && H.sword && !H.sword.bow);
    const crit = swing ? critMul(S) : 1;
    if (crit > 1) fx.push({ cell: sell === 'bow' ? aim : tpos, text: 'Crit!', cls: 'hurt', anim: 'spark' });
    let struck = 0; // a melee attack on a monster this turn: 1 hit, 2 killed (counted for the Lightning Wizard)

    if (sell === 'bow') {
      // Shoot: the target takes full power, and the shock jumps to touching monsters, 1 weaker each jump.
      attacked = true;
      const seen = { [aim]: H.sword.v * crit }, order = [aim], hits = [];
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
        const m = S.grid[p], v0 = m.v, res = hurtMonster(m, seen[p], null, false, true);
        hits.push({ cell: p, dmg: seen[p] });
        fx.push({ cell: p, text: '', cls: 'info', anim: 'bolt' });
        resultFx(S, m, p, res, v0, fx);
        if (res.killed) S.grid[p] = null;
        weaponHitBack(S, m, p, res, fx); // a scorpion next to you still stings; arrows never break on horns
      });
      attack = { dmg: H.sword.v, killed: false, el: null, type: H.sword.type, immune: false, bow: { from: from, target: aim, hits: hits } };
      H.sword.c--;
      if (H.sword.c <= 0) { const thrown = H.sword.star; H.sword = null; fx.push({ cell: from, text: thrown ? 'Thrown' : 'Bow spent', cls: 'info', anim: 'break' }); }
    } else if (sell) {
      const g = H[sell].v;
      H.gold += g; H[sell] = null; attacked = true;
      fx.push({ cell: from, text: 'Sold +' + g + 'G', cls: 'gold', anim: 'gold' });
    } else if (card.kind === 'chest') {
      attacked = true;
      if (S.rng) { S.grid[tpos] = lootCard(S); fx.push({ cell: tpos, text: 'Opened', cls: 'info', anim: 'open' }); }
      else fx.push({ cell: tpos, text: 'Opens', cls: 'info' });
    } else if (card.type === 'webspider' && H.sword) {
      fx.push({ cell: tpos, text: 'Webs', cls: 'info', anim: 'puff' }); // hidden: nothing to fight
    } else if (card.kind === 'monster' && card.frozen && T.anchor) {
      // A frozen golem cannot be hit and will not move to swap: you just bump into it.
      attacked = true; fx.push({ cell: tpos, text: 'Bump', cls: 'info', anim: 'frost' });
    } else if (card.kind === 'monster' && card.frozen) {
      // A frozen monster cannot be hit, even with a weapon. You just swap places with it.
      swap = true; fx.push({ cell: tpos, text: 'Swap', cls: 'info', anim: 'frost' });
    } else if (card.kind === 'monster' && T.phase && card.ph) {
      // A faded ghost: you pass right through it and swap places. Nothing hits, nothing hurts.
      swap = true; fx.push({ cell: tpos, text: 'Passes through', cls: 'info', anim: 'immune' });
    } else if (card.kind === 'monster' && H.pass.stomp && card.v <= 1 && !(T.immortal)) {
      // Dragonborn: a 1-health monster is simply stomped. No damage, and the weapon is not used.
      fx.push({ cell: tpos, text: 'Stomp', cls: 'info', anim: 'puff' });
      if (T.pays) { H.gold += card.v; fx.push({ cell: tpos, text: '+' + card.v + 'G', cls: 'gold', anim: 'gold' }); }
      noteDeath(card, tpos);
      struck = 2;
    } else if (card.kind === 'monster' && H.pass.storm && (H.kills | 0) >= STORM_KILLS && !(H.sword && H.sword.bow)) {
      // Smite: the charged attack kills any monster outright and does not wear the weapon down.
      const v0 = card.v;
      card.v = 0; H.kills = 0; noteDeath(card, tpos);
      attack = { dmg: v0, killed: true, el: null, type: 'smite', immune: false };
      fx.push({ cell: tpos, text: '', cls: 'info', anim: 'bolt' });
      fx.push({ cell: tpos, text: 'Smite', cls: 'info', anim: 'puff' });
      if (T.pays) { H.gold += v0; fx.push({ cell: tpos, text: '+' + v0 + 'G', cls: 'gold', anim: 'gold' }); }
      struck = 3;
    } else if (card.kind === 'monster' && H.sword && H.sword.wand) {
      // A wand hits like a sword, but pierces: whatever power is left after a monster carries on down
      // the row or column into the next one, until the power runs out or the beam reaches the edge.
      const wel = H.sword.el, beam = [];
      let power = H.sword.v, cx = hx + DIRS[dir][0], cy = hy + DIRS[dir][1], first = true;
      attack = { dmg: 0, killed: false, el: wel, type: H.sword.type, immune: false, beam: { dir: dir, from: from }, hits: 0 };
      while (power > 0 && cx >= 0 && cy >= 0 && cx < w && cy < h) {
        const p = cy * w + cx, m = S.grid[p];
        beam.push(p);
        if (m && m.kind === 'monster' && !m.frozen && m.type !== 'webspider') {
          const v0 = m.v, res = hurtMonster(m, power * (first ? crit : 1), wel, wel === 'ice', true);
          attack.hits++;
          power -= wearOf(m, res, power);
          resultFx(S, m, p, res, v0, fx, wel);
          if (res.killed) { if (first) attack.killed = true; else S.grid[p] = null; }
          else if (wel === 'ice' && !res.immune && !res.absorbed && !res.morphed && !res.stone) { m.frozen = true; fx.push({ cell: p, text: 'Frozen', cls: 'info', anim: 'frost' }); }
          if (first) { attack.dmg = res.dealt; attack.immune = res.immune; }
          if (weaponHitBack(S, m, p, res, fx)) { power = 0; fx.push({ cell: p, text: 'Gored', cls: 'hurt', anim: 'break' }); }
        }
        first = false;
        cx += DIRS[dir][0]; cy += DIRS[dir][1];
      }
      attack.beam.cells = beam;
      struck = attack.killed ? 2 : 1;
      H.sword.v = Math.max(0, power);
      if (H.sword.v <= 0) { H.sword = null; fx.push({ cell: from, text: 'Wand spent', cls: 'info', anim: 'break' }); }
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
      let cost = 0, gored = false;
      cells.forEach(function (p, idx) {
        const m = S.grid[p];
        if (!m || m.kind !== 'monster' || m.frozen || m.type === 'webspider') return;
        const v0 = m.v, res = hurtMonster(m, H.sword.v * crit, null, false, true);
        cost = Math.max(cost, wearOf(m, res, H.sword.v));
        if (idx === 0) { attack.dmg = res.dealt; attack.killed = res.killed; }
        resultFx(S, m, p, res, v0, fx);
        if (res.killed && idx !== 0) S.grid[p] = null;
        if (weaponHitBack(S, m, p, res, fx)) { gored = true; fx.push({ cell: p, text: 'Gored', cls: 'hurt', anim: 'break' }); }
      });
      struck = attack.killed ? 2 : 1;
      H.sword.v -= cost;
      if (gored) H.sword = null;
      else if (H.sword.v <= 0) { H.sword = null; fx.push({ cell: from, text: 'Scythe broke', cls: 'info', anim: 'break' }); }
      attacked = !attack.killed;
    } else if (card.kind === 'monster' && H.sword && !H.sword.bow) {
      // Armed: hit the monster instead of walking into it. If it dies, take its place.
      const wel = H.sword.el || null, v0 = card.v;
      const res = hurtMonster(card, H.sword.v * crit, wel, wel === 'ice', true);
      H.sword.v -= wearOf(card, res, H.sword.v); // the blade wears down by the power it spends
      attack = { dmg: res.dealt, killed: res.killed, el: wel, type: H.sword.type || 'sword', immune: res.immune };
      resultFx(S, card, tpos, res, v0, fx);
      if (!res.killed && !res.immune && !res.absorbed && !res.morphed && !res.stone && wel === 'ice') { card.frozen = true; attack.froze = true; fx.push({ cell: tpos, text: 'Frozen', cls: 'info', anim: 'frost' }); }
      if (weaponHitBack(S, card, tpos, res, fx)) { H.sword = null; fx.push({ cell: from, text: 'Gored', cls: 'hurt', anim: 'break' }); }
      else if (H.sword.v <= 0) { H.sword = null; fx.push({ cell: from, text: 'Sword broke', cls: 'info', anim: 'break' }); }
      attacked = !res.killed;
      if (!res.immune) struck = res.killed ? 2 : 1;
    } else if (card.type === 'tomb') {
      // Bare-handed (or holding a bow): you bump into the tomb. Nothing breaks, the turn is spent.
      attacked = true; fx.push({ cell: tpos, text: 'Bump', cls: 'info' });
    } else if (card.kind === 'gold') {
      const g = card.v + (H.pass.gold || 0);
      H.gold += g; fx.push({ cell: tpos, text: '+' + g, cls: 'gold', anim: 'gold' });
    } else if (card.kind === 'heal') {
      const g = healBy(H, card.v); fx.push({ cell: tpos, text: '+' + g, cls: 'heal', anim: 'heal' }); cure(H, fx, tpos);
      if (T.bonusGold) { H.gold += T.bonusGold; fx.push({ cell: tpos, text: '+' + T.bonusGold + 'G', cls: 'gold' }); }
    } else if (card.kind === 'harm' || card.kind === 'dtrap') {
      if (card.type === 'poison') {
        H.poison += card.v; fx.push({ cell: tpos, text: 'Poison ' + card.v, cls: 'hurt', anim: 'poison' });
      } else if (H.pass.trapproof) {
        fx.push({ cell: tpos, text: 'Dodged', cls: 'info', anim: 'immune' }); // the Ninja steps over traps
      } else if (T.el && H.ward > 0) {
        fx.push({ cell: tpos, text: 'Shielded', cls: 'info', anim: 'immune' });
      } else {
        const lost = hurtHero(S, card.v, true);
        fx.push({ cell: tpos, text: lost > 0 ? '−' + lost : 'Blocked', cls: lost > 0 ? 'hurt' : 'info' });
      }
    } else if (card.kind === 'monster') {
      let lost = 0;
      struck = 2; // bare-handed you take the hit, and the monster is gone
      if (H.frost > 0) fx.push({ cell: tpos, text: 'Frozen', cls: 'info' });
      else if (T.el && H.ward > 0) fx.push({ cell: tpos, text: 'Shielded', cls: 'info', anim: 'immune' });
      else {
        const dmg = T.squish ? 1 : card.v; // a cave spider squashes underfoot
        lost = hurtHero(S, Math.max(0, dmg - (H.pass.cut || 0)), true);
        fx.push({ cell: tpos, text: lost > 0 ? '−' + lost : 'Blocked', cls: lost > 0 ? 'hurt' : 'info' });
        // Venom: a bite that hurts also poisons you for the monster's number of turns.
        if (T.venom && lost > 0) { H.poison += card.v; fx.push({ cell: tpos, text: 'Poison ' + card.v, cls: 'hurt', anim: 'poison' }); }
      }
      if (T.pays) { H.gold += card.v; fx.push({ cell: tpos, text: '+' + card.v + 'G', cls: 'gold' }); }
      noteDeath(card, tpos); // walked over bare-handed, it is gone for good
    } else if (card.kind === 'reward') {
      S.claimed = card.rw;
      fx.push({ cell: tpos, text: 'Unlocked!', cls: 'gold', anim: 'gold' });
    } else if (card.kind === 'weapon') {
      H.sword = T.bow ? { v: card.v, type: card.type, el: null, bow: true, star: !!T.star, c: card.t } : T.sweep ? { v: card.v + (H.pass.swordBonus || 0), type: card.type, el: null, sweep: true } : T.wand ? { v: card.v, type: card.type, el: T.el, wand: true } : { v: card.v + (H.pass.swordBonus || 0), type: card.type, el: T.el || null }; fx.push({ cell: tpos, text: 'Sword ' + H.sword.v, cls: 'info' });
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

    // Lightning Wizard: kills charge the smite, and every 4th attack chains lightning to the
    // monsters next to the target.
    if (H.pass.storm && struck) {
      if (struck === 2) H.kills = Math.min(STORM_KILLS, (H.kills | 0) + 1);
      H.hits = (H.hits | 0) + 1;
      if (H.hits >= STORM_CHAIN) {
        H.hits = 0;
        const zap = chainDamage(H.lv);
        for (const ap of neighbours4(S, tpos)) {
          const m = S.grid[ap];
          if (ap === H.pos || !m || m.kind !== 'monster' || m.frozen || m.type === 'webspider') continue;
          const v0 = m.v, res = hurtMonster(m, zap, null, false);
          fx.push({ cell: ap, text: '', cls: 'info', anim: 'bolt' });
          if (res.killed) {
            fx.push({ cell: ap, text: 'Slain', cls: 'info', anim: 'puff' });
            if (TYPES[m.type].pays) { H.gold += v0; fx.push({ cell: ap, text: '+' + v0 + 'G', cls: 'gold', anim: 'gold' }); }
            S.grid[ap] = null;
          } else if (res.dealt) fx.push({ cell: ap, text: '−' + res.dealt, cls: 'info', hit: m.uid });
        }
      }
    }

    // Vampire: weapon damage this step heals 1 per 3, the rest carries over.
    if (H.pass.drain && weaponDealt > 0 && H.hp > 0) {
      H.drain = (H.drain | 0) + weaponDealt;
      const g = Math.min(Math.floor(H.drain / H.pass.drain), Math.max(0, H.max - H.hp));
      H.drain %= H.pass.drain;
      if (g > 0) { H.hp += g; fx.push({ cell: H.pos, text: '+' + g, cls: 'heal', anim: 'heal' }); cure(H, fx); }
    }
    // Bard: heals every turn, and every helpful card on the board (coins, gems, potions, weapons) grows by 1.
    if (H.pass.song && H.hp > 0) {
      const g = healBy(H, songHeal(H.lv));
      if (g) { fx.push({ cell: H.pos, text: '+' + g, cls: 'heal', anim: 'heal' }); cure(H, fx); }
      S.grid.forEach(function (c, p) {
        if (!c || !SONG_GROWS[c.kind]) return;
        c.v += 1; fx.push({ cell: p, text: '+1', cls: c.kind === 'gold' ? 'gold' : c.kind === 'heal' ? 'heal' : 'info' });
      });
    }

    let tremor = null; // the square Tremor hit this turn, if any (set after the slide below)

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

    // Monsters with a trick every few turns: hive queens, liches, spore shrooms, harpies, imps, ice spiders.
    if (S.rng) periodic(S, fx);

    // Powers recharge and frost wears off. A wailing banshee halves the recharge: every other turn only.
    const wail = S.grid.some(function (c) { return c && c.kind === 'monster' && TYPES[c.type].wail; });
    if (!wail || H.turn % 2 === 0) for (const pw of H.powers) if (pw.cd > 0) pw.cd--;
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
        // A golem on that edge stops the shift: everything up to it moves along and the new card
        // appears right in front of it instead of at the far end.
        let stop = line.length;
        for (let k = 1; k < line.length; k++) if (isAnchor(S.grid[line[k]])) { stop = k; break; }
        for (let k = 0; k < stop - 1; k++) S.grid[line[k]] = S.grid[line[k + 1]];
        const far = line[stop - 1];
        S.grid[far] = null;
        spawned.push({ card: spawn(S, far), cell: far });
      }
      // Stepping into the middle square (odd-by-odd boards only): the square you left is filled
      // clockwise. The card just before it going clockwise around the middle slides in, and its
      // own square is then refilled by the normal slide below, so new cards still enter at the edge.
      // E.g. on 1 2 3 / 4 5 6 / 7 8 9, moving 2 -> 5 slides 1 into 2 and a new card appears at 1.
      const mid = (w % 2 && h % 2) ? ((h - 1) / 2) * w + (w - 1) / 2 : -1;
      const gx = fx0 - (w - 1) / 2, gy = fy0 - (h - 1) / 2; // where the gap sits relative to the middle
      // Skipped when this turn left other gaps too (a scythe swing killing several monsters): two gaps
      // in one line would push a new card off the edge, so those turns refill the usual way.
      const onlyGap = S.grid.every(function (c, p) { return c || p === from || p === H.pos; });
      if (!sell && !attacked && !swap && !S.over && onlyGap && H.pos === mid && Math.abs(gx) + Math.abs(gy) === 1) {
        const prev = (fy0 - gx) * w + (fx0 + gy); // one step back, clockwise: above -> left, right -> above, below -> right, left -> below
        if (!isAnchor(S.grid[prev])) { // a golem stays put; the normal slide below refills the gap instead
          S.grid[from] = S.grid[prev];
          S.grid[prev] = null;
        }
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

    // Tremor (passive): every step, a monster that slid into the square the hero left is hit.
    const qp = H.powers.find(function (p) { return p.id === 'quake'; });
    if (S.rng && H.pos !== from && H.hp > 0 && qp) {
      const mp = from, m = S.grid[mp];
      if (m && m.kind === 'monster') {
        tremor = mp;
        const res = hurtMonster(m, quakeDamage(S.powerLevel, qp.lv), null, false);
        if (res.killed) { S.grid[mp] = blankCard(S); fx.push({ cell: mp, text: 'Slain', cls: 'info', anim: 'puff' }); }
        else fx.push({ cell: mp, text: '−' + res.dealt, cls: 'info', hit: m.uid });
        fx.push({ cell: mp, text: '', cls: 'info', anim: 'quake' });
      }
    }

    // Poisoned monsters (from the poison dart) lose 1 health a turn until the poison wears off.
    if (S.rng && H.hp > 0) {
      for (let p = 0; p < S.grid.length; p++) {
        const m = S.grid[p];
        if (!m || m.kind !== 'monster' || !(m.psn > 0)) continue;
        m.psn--;
        const res = hurtMonster(m, 1, null, false);
        if (res.killed) { S.grid[p] = blankCard(S); fx.push({ cell: p, text: 'Slain', cls: 'info', anim: 'puff' }); }
        else if (res.dealt) fx.push({ cell: p, text: '−1', cls: 'hurt', anim: 'poison', hit: m.uid });
      }
    }

    // Rats (passive): checked after the cards have slid. A rat that stays in the same square
    // for 3 turns bites a random neighbouring card (anything but the hero and the room's reward,
    // other rats included). An empty square is simply taken over by a new rat. Otherwise the card
    // takes damage equal to the rat's number, and if that destroys it, a new rat just as strong
    // takes its place. All rats choose first and then bite together: if several pick the same
    // square, only the biggest bite lands. Moving resets the count.
    if (S.rng && H.hp > 0) {
      const bites = {}; // target square -> strongest rat biting it
      for (let p = 0; p < S.grid.length; p++) {
        const r = S.grid[p];
        if (!r || TYPES[r.type].ability !== 'breed') continue;
        if (r.rp !== p) { r.rp = p; r.t = 0; continue; }
        r.t = (r.t || 0) + 1;
        if (r.t < RAT_TURNS) continue;
        const options = neighbours4(S, p).filter(function (ap) { const c = S.grid[ap]; return c && ap !== H.pos && c.kind !== 'reward'; });
        if (!options.length) continue; // boxed in: it stays ready and strikes as soon as there is a target
        r.t = 0;
        const ap = options[Math.floor(S.rng() * options.length)];
        if (!bites[ap] || r.v > bites[ap]) bites[ap] = r.v;
      }
      for (const key in bites) {
        const ap = +key, dmg = bites[key], c = S.grid[ap];
        let killed;
        if (c.kind === 'empty') killed = true;
        else if (c.kind === 'monster') {
          const res = hurtMonster(c, dmg, null, false);
          killed = res.killed;
          if (!killed) fx.push({ cell: ap, text: res.absorbed ? 'Blocked' : '−' + res.dealt, cls: 'hurt', hit: c.uid });
        } else {
          const dealt = Math.min(c.v, dmg);
          c.v -= dealt; killed = c.v <= 0;
          if (!killed) fx.push({ cell: ap, text: '−' + dealt, cls: 'hurt', hit: c.uid });
        }
        if (!killed) continue;
        const kid = makeCard(S, 'rat');
        kid.v = dmg; kid.rp = ap; kid.t = 0; kid.sh = 0;
        S.grid[ap] = kid;
        fx.push({ cell: ap, text: 'Rat!', cls: 'hurt', anim: 'puff' });
      }
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
          const tel = TYPES[tr.type].el || null; // spike traps have no element
          fx.push({ cell: ap, text: '', cls: 'info', anim: tel || 'slash' });
          if (ap === H.pos) {
            if (H.pass.trapproof) { fx.push({ cell: ap, text: 'Dodged', cls: 'info', anim: 'immune' }); continue; }
            if (tel && H.ward > 0) { fx.push({ cell: ap, text: 'Shielded', cls: 'info', anim: 'immune' }); continue; }
            const lost = hurtHero(S, tr.v, true);
            fx.push({ cell: ap, text: lost > 0 ? '−' + lost : 'Blocked', cls: lost > 0 ? 'hurt' : 'info' });
            continue;
          }
          const m = S.grid[ap];
          if (!m || m.kind !== 'monster') continue;
          const res = hurtMonster(m, tr.v, tel, false);
          if (res.immune) { fx.push({ cell: ap, text: 'Immune', cls: 'info', anim: 'immune' }); continue; }
          if (res.killed) { S.grid[ap] = blankCard(S); fx.push({ cell: ap, text: 'Slain', cls: 'info', anim: 'puff' }); }
          else fx.push({ cell: ap, text: '−' + res.dealt, cls: 'info', hit: m.uid });
        }
      }
      if (H.hp <= 0) { S.over = true; H.hp = 0; }
    }

    // Bone wall: skeletons that touch in a chain of SKELETON_CHAIN or more each gain a quarter of their
    // health (rounded up), once per skeleton.
    if (S.rng && H.hp > 0) {
      const seen = {};
      for (let p = 0; p < S.grid.length; p++) {
        const c0 = S.grid[p];
        if (seen[p] || !c0 || c0.type !== 'skeleton') continue;
        const group = [p]; seen[p] = 1;
        for (let gi = 0; gi < group.length; gi++) {
          for (const ap of neighbours4(S, group[gi])) {
            const c = S.grid[ap];
            if (!seen[ap] && c && c.type === 'skeleton') { seen[ap] = 1; group.push(ap); }
          }
        }
        if (group.length < TYPES.skeleton.bones) continue;
        group.forEach(function (gp) {
          const sk = S.grid[gp];
          if (sk.wall) return;
          const gain = Math.max(1, Math.ceil(sk.v / 4));
          sk.v += gain; sk.wall = 1;
          fx.push({ cell: gp, text: '+' + gain, cls: 'hurt', anim: 'spark' });
        });
      }
    }

    // End-of-turn monster traits: frost wisps melt, shrooms bruise when they slide, ghosts flicker,
    // goblins rob the coins and gems next to them.
    if (S.rng && H.hp > 0) {
      for (let p = 0; p < S.grid.length; p++) {
        const m = S.grid[p];
        if (!m || m.kind !== 'monster') continue;
        const MT = TYPES[m.type];
        if (MT.melts) {
          m.v--;
          if (m.v <= 0) { S.grid[p] = blankCard(S); fx.push({ cell: p, text: 'Melted', cls: 'info', anim: 'puff' }); continue; }
          fx.push({ cell: p, text: '−1', cls: 'info', hit: m.uid });
        }
        if (MT.fragile) {
          if (m.sp != null && m.sp !== p) {
            m.v -= MT.fragile;
            if (m.v <= 0) { noteDeath(m, p); S.grid[p] = blankCard(S); fx.push({ cell: p, text: 'Crumbled', cls: 'info', anim: 'puff' }); continue; }
            fx.push({ cell: p, text: '−' + MT.fragile, cls: 'info', anim: 'poison', hit: m.uid });
          }
          m.sp = p;
        }
        if (MT.phase) m.ph = m.ph ? 0 : 1;
        if (MT.loot && (m.hitT == null || H.turn - m.hitT > 2)) {
          const take = Math.ceil(m.v / 3), opts = neighbours4(S, p).filter(function (ap) { const c = S.grid[ap]; return c && c.kind === 'gold' && c.v > 0; });
          if (take > 0 && opts.length) {
            const ap = opts[Math.floor(S.rng() * opts.length)], g = S.grid[ap], got = Math.min(take, g.v);
            g.v -= got;
            fx.push({ cell: ap, text: '−' + got + 'G', cls: 'hurt', anim: 'loot' });
            if (g.v <= 0) S.grid[ap] = blankCard(S);
          }
        }
      }
    }

    // The elemental shield wears off after the end-of-turn traps have fired.
    if (H.ward > 0) H.ward--;

    // Vampires smell blood: each one grows for every time you were hurt this turn.
    const hits = (S.hurts | 0) - hurt0;
    if (hits > 0) S.grid.forEach(function (c, p) {
      const th = c && c.kind === 'monster' && TYPES[c.type].thirst;
      if (th) { c.v += hits * th; fx.push({ cell: p, text: '+' + hits * th, cls: 'hurt', anim: 'spark' }); }
    });

    // A wraith's last breath fades, then this turn's deaths take effect (which may start a new one).
    if (S.resist > 0) S.resist--;
    finishDeaths(S, fx);
    // The fire imp's glow: one turn of it is used up, and whatever now stands on the square gets the bonus.
    if (S.rng) syncGlow(S, fx, true);

    // Growing blades still lying on the board.
    bladeGrowth(S, blades0, hits, fx);

    // A forged sword that was waiting arrives once the hero's hands are empty.
    if (H.forge && !H.sword && H.hp > 0) {
      H.sword = { v: H.forge, type: 'sword', el: null }; H.forge = 0;
      fx.push({ cell: H.pos, text: 'Sword ' + H.sword.v, cls: 'info', anim: 'gold' });
    }

    let stand = false;
    if (H.standNow) { H.standNow = false; stand = true; fx.push({ cell: H.pos, text: 'Last stand!', cls: 'heal', anim: 'immune' }); }
    return { from: from, to: tpos, eaten: card, fx: fx, spawned: spawned, attack: attack, moved: !attacked, sold: sell || null, thorns: thornHits, tremor: tremor, stand: stand };
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
    m.hitT = S.hero.turn; // a power counts as your hit too
    const res = hurtMonster(m, dmg, null, false);
    if (res.killed) { S.grid[pos] = null; holes.push(pos); fx.push({ cell: pos, text: 'Slain', cls: 'info', anim: 'puff' }); }
    else if (res.immune || res.escaped) resultFx(S, m, pos, res, 0, fx);
    else fx.push({ cell: res.slid != null ? res.slid : pos, text: '−' + res.dealt, cls: 'info', hit: m.uid });
  }

  // lv: the player's power level (best score / 25); up: Tremor's upgrade level, added on top of the cap.
  function quakeDamage(lv, up) { return Math.min(12, 3 + (lv | 0)) + powerAmount('quake', up); }

  // Activates the power in slot idx. Free action: it does not take a turn.
  // Returns null when it cannot be used, else { fx, spawned }.
  function usePower(S, idx, target) {
    if (S.over) return null;
    const H = S.hero, pw = H.powers[idx];
    if (!pw || pw.cd > 0) return null;
    const def = POWERS[pw.id];
    if (def.passive) return null; // always on; nothing to activate
    if (def.target && !validTarget(S, idx, target)) return null;
    if (pw.id === 'forge' && H.forge) return null; // a forged sword is already waiting
    if (pw.id === 'whetstone' && !H.sword) return null; // nothing to sharpen
    if (pw.id === 'magnet' && !S.grid.some(function (c) { return c && c.kind === 'gold'; })) return null;
    if (pw.id === 'hourglass' && !H.powers.some(function (p) { return p !== pw && p.cd > 0; })) return null; // nothing to speed up
    if (pw.id === 'dart') {
      // The dart picks its own victim: any monster on the board, at random.
      const foes = [];
      S.grid.forEach(function (c, p) { if (c && c.kind === 'monster') foes.push(p); });
      if (!foes.length) return null;
      target = foes[Math.floor((S.rng ? S.rng() : Math.random()) * foes.length)];
    }
    const w = S.level.w, h = S.level.h;
    const fx = [], holes = [], blades0 = bladeSnap(S);
    let extra = null;
    const amt = powerAmount(pw.id, pw.lv);
    begin(S);

    switch (pw.id) {
      case 'heal': {
        const g = healBy(H, amt);
        fx.push({ cell: H.pos, text: '+' + g, cls: 'heal', anim: 'heal' }); cure(H, fx); break;
      }
      case 'forge': {
        // Never replaces a held weapon: the sword waits until the hero's hands are empty.
        const v = forgePower(S, pw.lv);
        if (H.sword) { H.forge = v; fx.push({ cell: H.pos, text: 'Forging…', cls: 'info', anim: 'gold' }); }
        else { H.sword = { v: v, type: 'sword', el: null }; fx.push({ cell: H.pos, text: 'Sword ' + v, cls: 'info', anim: 'gold' }); }
        break;
      }
      case 'dart': {
        hitMonster(S, target, amt, holes, fx); extra = { dart: target };
        const m = S.grid[target];
        if (m && m.kind === 'monster') { m.psn = (m.psn | 0) + DART_POISON; fx.push({ cell: target, text: 'Poison', cls: 'hurt', anim: 'poison' }); }
        break;
      }
      case 'fire': if (S.grid[target].kind === 'monster') noteDeath(S.grid[target], target); S.grid[target] = null; holes.push(target); fx.push({ cell: target, text: 'Burn', cls: 'hurt', anim: 'fire' }); break;
      case 'scythe': {
        const x = H.pos % w, y = (H.pos / w) | 0;
        for (const d of ALL8) {
          const ax = x + d[0], ay = y + d[1];
          if (ax < 0 || ay < 0 || ax >= w || ay >= h) continue;
          const ap = ay * w + ax, c = S.grid[ap];
          if (c && c.kind === 'monster' && TYPES[c.type].immortal) { hitMonster(S, ap, 99, holes, fx); fx.push({ cell: ap, text: '', cls: 'info', anim: 'slash' }); }
          else if (c && (c.kind === 'monster' || c.kind === 'harm' || c.kind === 'dtrap')) { if (c.kind === 'monster') noteDeath(c, ap); S.grid[ap] = null; holes.push(ap); fx.push({ cell: ap, text: 'Slash', cls: 'info', anim: 'slash' }); }
        }
        break;
      }
      case 'massheal': {
        const g = healBy(H, amt);
        fx.push({ cell: H.pos, text: '+' + g, cls: 'heal', anim: 'heal' }); cure(H, fx);
        S.grid.forEach(function (c, p) { if (c && c.kind === 'heal') { c.v += amt; fx.push({ cell: p, text: '+' + amt, cls: 'heal', anim: 'heal' }); } });
        break;
      }
      case 'thunder': {
        // Strikes THUNDER_HITS different monsters at random (all of them if there are fewer).
        const foes = [];
        S.grid.forEach(function (c, p) { if (c && c.kind === 'monster') foes.push(p); });
        const rnd = S.rng || Math.random;
        for (let n = 0; n < THUNDER_HITS && foes.length; n++) {
          const p = foes.splice(Math.floor(rnd() * foes.length), 1)[0];
          fx.push({ cell: p, text: '', cls: 'info', anim: 'bolt' }); hitMonster(S, p, amt, holes, fx);
        }
        break;
      }
      case 'ice': H.frost = amt; fx.push({ cell: H.pos, text: 'Frost', cls: 'info', anim: 'frost' }); break;
      case 'ward': H.ward = amt; fx.push({ cell: H.pos, text: 'Shield', cls: 'info', anim: 'immune' }); break;
      case 'teleport': {
        extra = H.pos; S.grid[target] = null; H.pos = target;
        fx.push({ cell: target, text: 'Warp', cls: 'info', anim: 'swirl' }); fx.push({ cell: extra, text: '', cls: 'info', anim: 'swirl' }); break;
      }
      case 'magnet': {
        // Every coin and gem pays out as if you had stepped on it, plus the upgrade bonus, and leaves the board.
        S.grid.forEach(function (c, p) {
          if (!c || c.kind !== 'gold') return;
          const g = c.v + (H.pass.gold || 0) + amt;
          H.gold += g; S.grid[p] = null; holes.push(p);
          fx.push({ cell: p, text: '+' + g, cls: 'gold', anim: 'gold' });
        });
        break;
      }
      case 'hourglass': {
        // Halves (rounding down) the turns left on every other power.
        for (const p of H.powers) if (p !== pw && p.cd > 0) p.cd = Math.floor(p.cd / 2);
        fx.push({ cell: H.pos, text: 'Hurry!', cls: 'info', anim: 'swirl' });
        break;
      }
      case 'whetstone': {
        H.sword.v += amt;
        fx.push({ cell: H.pos, text: 'Sharpened +' + amt, cls: 'info', anim: 'gold' });
        break;
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
    finishDeaths(S, fx);
    const spawned = settle(S, DIRS[S.lastDir == null ? 1 : S.lastDir]);
    syncGlow(S, fx, false); // a power that moved cards (or you) on or off the glowing square
    bladeGrowth(S, blades0, 0, fx); // wind blades the refill slid along grow too
    return { fx: fx, spawned: spawned, id: pw.id, target: target, from: extra };
  }

  // ---- Level helpers --------------------------------------------------------
  const WEAPON_RATE = 0.5;
  // Turns per +1 to new card values. Room targets run up to 100 gold, so runs are long and the climb is gentle.
  const RAMP = 30;
  // Starting health before the hero's own bonus (halved from 15 to make runs tighter).
  const HERO_BASE_HP = 8;
  const SIZES = [[3, 3], [3, 4], [4, 4], [4, 5], [5, 5], [5, 6], [6, 6], [6, 7], [7, 7]];

  const BASE_WEIGHTS = { coin: 28, gem: 5, potion: 12, chest: 3, poison: 6, trap: 6, rat: 14, bat: 10, skeleton: 8, ogre: 2, goldskull: 3, hive: 0, sword: 10, scythe: 0, firesword: 0, icesword: 0, firewand: 0, icewand: 0, elecbow: 0, ninjastar: 0, windblade: 0, painblade: 0, webspider: 0, phoenix: 0, bomb: 5, imp: 0, golem: 0 };
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
    // Weapons are twice as common in the early levels, easing back to the normal rate by level 10.
    // WEAPON_RATE scales every weapon's odds: they are both your attack and (sold) your main gold.
    const wm = (2 - Math.min(1, i / 10)) * WEAPON_RATE;
    wts.sword = Math.round(10 * wm);
    wts.scythe = i >= 1 ? Math.round(3 * wm) : 0;
    wts.firesword = i >= 1 ? Math.round(2 * wm) : 0;
    wts.icesword = i >= 1 ? Math.round(2 * wm) : 0;
    wts.webspider = i >= 1 ? 3 : 0;
    wts.windblade = i >= 1 ? Math.round(1.5 * wm) : 0;
    wts.painblade = i >= 1 ? Math.round(1.5 * wm) : 0;
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
    TYPES: TYPES, HEROES: HEROES, POWERS: POWERS, DIRS: DIRS, PERIOD: PERIOD,
    newGame: newGame, move: move, sellItem: sellItem, shootBow: shootBow, quakeDamage: quakeDamage,
    POWER_MAX_LV: POWER_MAX_LV, UPGRADES: UPGRADES, upgradeCost: upgradeCost, upgradeWhat: upgradeWhat, forgePower: forgePower,
    HERO_MAX_LV: HERO_MAX_LV, STORM_KILLS: STORM_KILLS, THUNDER_HITS: THUNDER_HITS, songHeal: songHeal, overheal: overheal, healCap: healCap, STORM_CHAIN: STORM_CHAIN, chainDamage: chainDamage, HERO_BUY_COST: HERO_BUY_COST, POWER_BUY_COST: POWER_BUY_COST, HERO_UP_HP: HERO_UP_HP, heroHpBonus: heroHpBonus, heroUpgradeCost: heroUpgradeCost, powerAmount: powerAmount, powerCd: powerCd, powerTip: powerTip, preview: preview, usePower: usePower, validTarget: validTarget,
    nextLevel: nextLevel, BASE_WEIGHTS: BASE_WEIGHTS, WEAPON_RATE: WEAPON_RATE, HERO_BASE_HP: HERO_BASE_HP, mulberry32: mulberry32
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DC = api;
})(typeof window !== 'undefined' ? window : globalThis);
