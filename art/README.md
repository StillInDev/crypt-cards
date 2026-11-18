# Crypt Cards art

Everything about the game's art lives in this folder: the style guide (this file), the source sheets,
and one `.md` **request** per image. A request is the brief for an art agent: give the agent
**this README plus the request file**, and the images the request names.

The first full set of art arrived on 2026-11-16 as eight sheets (`art/sheets/`) and is now in the game.
The requests stay as the brief for redrawing any single sprite later. Where a request's "What it must
look like" describes the old 18×18 sprite, the sprite in `src/img/sprites/` now wins on the details;
the request still sets what the sprite is for and what it must not be confused with.

## Folder layout

| Folder | What is in it | Game images |
|---|---|---|
| `players/` | The heroes you play as | `src/img/sprites/players/` |
| `monsters/` | Everything you fight (and the tomb that spawns them) | `src/img/sprites/monsters/` |
| `items/` | Board pickups: coin, gem, potion, poison, bomb, chest | `src/img/sprites/items/` |
| `weapons/` | Swords, wands, bows and the other weapons | `src/img/sprites/weapons/` |
| `traps/` | The spike trap: its square base and its arrow | `src/img/sprites/traps/` |
| `powers/` | The power button icons | `src/img/sprites/powers/` |
| `interface/` | Lock bars, key, web, and the board and UI frames | `src/img/sprites/interface/` |
| `animations/` | Effects that play for a moment: hits, casts, cracks | not in the game yet |
| `backgrounds/` | Room, board and screen backgrounds | not in the game yet |
| `sheets/` | The source sheets the sprites are cut from | |

Each request is named after the sprite it makes: `monsters/rat.md` makes `src/img/sprites/monsters/rat.png`.
`groups.json` lists which folder every sprite id belongs to. To add a sprite, add its id to a group there
and put its request in the matching folder (copy `TEMPLATE.md`).

## How sprites get into the game

- `art/sheets/` holds the source sheets. Each sheet is a grid of icons on a transparent background
  (5 columns × 2 rows, or 3 × 3).
- `node scripts/cut-sheets.js` cuts every sheet into `src/img/sprites/<folder>/<id>.png` (96 × 96) and
  rewrites `src/js/sprites.js`, the id → file map the game loads. The order of the ids on each sheet is
  listed at the top of that script. Add `--sheet out.png` to also get one image of every cut sprite to review.
- To change a sprite, redraw it in its cell on its sheet (or replace the sheet) and run the script.
- Animations and backgrounds are not cut from sheets. Their requests say how each one is delivered.

## The game, in one paragraph

Crypt Cards is a dungeon card game. The board is a 3×3 (up to 7×7) grid of cards: monsters,
coins, potions, weapons, traps. The hero moves one square at a time and the cards slide in behind.
Each card shows one sprite in the middle of a dark card face, with numbers in the corners.
Sprites must read instantly at small size on a phone (a card is about 100 px wide).

## Hard rules

| Rule | Value |
|---|---|
| Format | **PNG, RGBA**, 8 bits per channel |
| Background | fully **transparent** |
| Size | at least **256 × 256 pixels** per icon; it is shrunk to 96 × 96 |
| Framing | the icon centred, filling most of its square; nothing touching the edge |
| Delivery | either a sheet in the same grid and order as the one it replaces, or single files named `<sprite id>.png` |

Faint glow (alpha below about 10%) is dropped when the sheet is cut, so a glow should be part of the
drawing, not a soft haze.

## Style

Match the sheets in `art/sheets/`:

- **Look:** chunky, chibi pixel-art style. Big heads, short bodies, simple shapes.
- **Outline:** a thick dark outline around the whole silhouette. This is what makes sprites readable on
  the dark cards; never skip it.
- **Faces:** big, simple eyes and a clear expression. Monsters look grumpy or fierce, heroes friendly.
- **Characters and monsters** are drawn as a full figure, head to feet. Flying and floating creatures
  (bats, ghosts, winged monsters) and crawling ones (slimes, spiders, insects) are drawn whole.
- **Objects** (tombs, chests, items, weapons) sit centred. Weapons point up and to the right.
- **Trap arrows** (`trap_arrow`) are placed and rotated by the game, so draw them pointing straight up.
  The spike trap is built from two pieces: the square base (`trap`) and the arrow (`trap_arrow`).
- **One idea per sprite.** Sets that belong together (fire and ice versions, the swords, the spiders,
  the wolves) keep matching shapes so they read as a family.

## Contrast

The sprite must read on every room's card colour. The darkest card faces are `#45433f`, `#3f3530`,
`#2b4a42`, `#3a4262` and `#2e5469`, so keep the silhouette and outline strong. The colours named in
the requests (hex values from the old palette) are a guide to the intended colour, not a hard rule.

## What to send back

1. The sheet or files, as above.
2. One or two sentences on any choice that is not obvious.

If the request asks for options, send each one as `<sprite id>-1.png`, `<sprite id>-2.png` and so on.

## All requests

One request per delivered sprite (83 here; the five newest heroes on `09_New_Heroes.png` have none yet), then the requests still open.

**Players (5):** [Knight](players/knight.md), [Sorcerer](players/sorcerer.md), [Yeti](players/yeti.md), [Ninja](players/rogue.md), [Cactus](players/cactus.md)

**Monsters (36):** [Skeleton](monsters/skeleton.md), [Ogre](monsters/ogre.md), [Rat](monsters/rat.md), [Bat](monsters/bat.md), [Golden skeleton](monsters/goldskull.md), [Hive queen](monsters/hive.md), [Fire imp](monsters/imp.md), [Golem](monsters/golem.md), [Slime](monsters/slime.md), [Magma slime](monsters/magmaslime.md), [Goblin](monsters/goblin.md), [Zombie](monsters/zombie.md), [Cultist](monsters/cultist.md), [Lich](monsters/lich.md), [Troll](monsters/troll.md), [Vampire](monsters/vampire.md), [Mummy](monsters/mummy.md), [Ghost](monsters/ghost.md), [Wraith](monsters/wraith.md), [Banshee](monsters/banshee.md), [Frost wisp](monsters/frostwisp.md), [Wolf](monsters/wolf.md), [Frost wolf](monsters/frostwolf.md), [Minotaur](monsters/minotaur.md), [Cave spider](monsters/spider.md), [Ice spider](monsters/icespider.md), [Scorpion](monsters/scorpion.md), [Beetle](monsters/beetle.md), [Viper](monsters/snake.md), [Salamander](monsters/salamander.md), [Spore shroom](monsters/shroom.md), [Harpy](monsters/harpy.md), [Gargoyle](monsters/gargoyle.md), [Phoenix](monsters/phoenix.md), [Web spider](monsters/webspider.md), [Tomb](monsters/tomb.md)

**Board items (6):** [Gem](items/gem.md), [Coin](items/coin.md), [Potion](items/potion.md), [Poison](items/poison.md), [Bomb](items/bomb.md), [Chest](items/chest.md)

**Traps (3):** [Spike trap, retired](traps/trap.md), [Arrow trap block](traps/trapblock.md), [Arrow trap arrowhead](traps/traphead.md)

On the board the Arrow trap (id `trap`) shows the block with an arrowhead on each dangerous side. It only hurts
you if you step onto it from a side with an arrowhead. Fire and ice traps are gone from the game.

**Weapons (10):** [Sword](weapons/sword.md), [Fire sword](weapons/firesword.md), [Ice sword](weapons/icesword.md), [Fire wand](weapons/firewand.md), [Ice wand](weapons/icewand.md), [Scythe](weapons/scythe.md), [Electric bow](weapons/elecbow.md), [Ninja star](weapons/ninjastar.md), [Wind blade](weapons/windblade.md), [Blade of pain](weapons/painblade.md)

**Powers (16):** [Magnet (power)](powers/p_magnet.md), [Hourglass (power)](powers/p_hourglass.md), [Whetstone (power)](powers/p_whetstone.md), [Last Stand (power)](powers/p_laststand.md), [Healing (power)](powers/p_heal.md), [Mass healing (power)](powers/p_massheal.md), [Fire touch (power)](powers/p_fire.md), [Frost (power)](powers/p_ice.md), [Thunder (power)](powers/p_thunder.md), [Scythe (power)](powers/p_scythe.md), [Teleport orb (power)](powers/p_teleport.md), [Poison dart (power)](powers/p_dart.md), [Potion burst (power)](powers/p_burst.md), [Forge (power)](powers/p_forge.md), [Tremor (power)](powers/p_quake.md), [Shield (power)](powers/p_shield.md)

**Interface (3):** [Spider web](interface/web.md), [Lock bars](interface/bars.md), [Key](interface/key.md)

### Not delivered yet

These are open: nothing has been drawn for them yet. Suggested order:

1. [Board and interface frames](interface/board-and-ui.md): card frames, panels, power buttons, map and buttons
2. [Tremor ground crack](animations/tremor-crack.md): fixes the effect players read as a train track
3. [Power cast effects](animations/power-casts.md): one effect per power (all 16), on the hero's card
4. [Hit, pickup and projectile effects](animations/hit-effects.md): slashes, gold, smoke, explosions, darts
5. [Area icons and the boss keys](interface/areas.md): a picture for each area tab, and the special key
6. [Room floors](backgrounds/room-floors.md): one floor per room theme, behind the play screen
7. [Dungeon map backdrops](backgrounds/map.md): one backdrop per area, behind the map

The old 18 × 18 sprites (and an unused ghoul) are in git history before the sheets landed.
