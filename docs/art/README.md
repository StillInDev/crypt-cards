# Crypt Cards art requests

Each `.md` file in this folder (except this one and `TEMPLATE.md`) is one image request for an art agent.
There is one request for every sprite in the game; the full list is at the bottom of this file.
Give the agent **this README plus the request file**, and the images that the request names.
This README is the style guide every request must follow.

The first full set of art arrived on 2026-11-16 as eight sheets (`art/sheets/`) and is now in the game.
The requests stay as the brief for redrawing any single sprite later. Where a request's "What it must
look like" describes the old 18×18 sprite, the sprite in `src/img/sprites/` now wins on the details;
the request still sets what the sprite is for and what it must not be confused with.

## Where the art lives

- `art/sheets/` (repo root) holds the source sheets. Each sheet is a grid of icons on a transparent
  background (5 columns × 2 rows, or 3 × 3).
- `node scripts/cut-sheets.js` cuts every sheet into `src/img/sprites/<id>.png` (96 × 96) and rewrites
  `src/js/sprites.js`, the id → file map the game loads. The order of the ids on each sheet is listed
  at the top of that script. Add `--sheet out.png` to also get one image of every cut sprite to review.
- To change a sprite, redraw it in its cell on its sheet (or replace the sheet) and run the script.

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
- **Arrows** (`firearrow`, `icearrow`) are rotated by the game, so they must point exactly one way:
  draw them pointing up-right like the sheet (the cut script turns them upright), or straight up as single files.
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

One request per sprite in the game (77 in all).

**Heroes (5):** [Knight](knight.md), [Sorcerer](sorcerer.md), [Yeti](yeti.md), [Ninja](rogue.md), [Cactus](cactus.md)

**Monsters (36):** [Skeleton](skeleton.md), [Ogre](ogre.md), [Rat](rat.md), [Bat](bat.md), [Golden skeleton](goldskull.md), [Hive queen](hive.md), [Fire imp](imp.md), [Golem](golem.md), [Slime](slime.md), [Magma slime](magmaslime.md), [Goblin](goblin.md), [Zombie](zombie.md), [Cultist](cultist.md), [Lich](lich.md), [Troll](troll.md), [Vampire](vampire.md), [Mummy](mummy.md), [Ghost](ghost.md), [Wraith](wraith.md), [Banshee](banshee.md), [Frost wisp](frostwisp.md), [Wolf](wolf.md), [Frost wolf](frostwolf.md), [Minotaur](minotaur.md), [Cave spider](spider.md), [Ice spider](icespider.md), [Scorpion](scorpion.md), [Beetle](beetle.md), [Viper](snake.md), [Salamander](salamander.md), [Spore shroom](shroom.md), [Harpy](harpy.md), [Gargoyle](gargoyle.md), [Phoenix](phoenix.md), [Web spider](webspider.md), [Tomb](tomb.md)

**Board items (6):** [Gem](gem.md), [Coin](coin.md), [Potion](potion.md), [Poison](poison.md), [Bomb](bomb.md), [Chest](chest.md)

**Traps (5):** [Spike trap](trap.md), [Fire trap](firetrap.md), [Ice trap](icetrap.md), [Fire arrow](firearrow.md), [Ice arrow](icearrow.md)

**Weapons (10):** [Sword](sword.md), [Fire sword](firesword.md), [Ice sword](icesword.md), [Fire wand](firewand.md), [Ice wand](icewand.md), [Scythe](scythe.md), [Electric bow](elecbow.md), [Ninja star](ninjastar.md), [Wind blade](windblade.md), [Blade of pain](painblade.md)

**Powers (12):** [Healing (power)](p_heal.md), [Mass healing (power)](p_massheal.md), [Fire touch (power)](p_fire.md), [Frost (power)](p_ice.md), [Thunder (power)](p_thunder.md), [Scythe (power)](p_scythe.md), [Teleport orb (power)](p_teleport.md), [Poison dart (power)](p_dart.md), [Potion burst (power)](p_burst.md), [Forge (power)](p_forge.md), [Tremor (power)](p_quake.md), [Shield (power)](p_shield.md)

**Interface (3):** [Spider web](web.md), [Lock bars](bars.md), [Key](key.md)

The old 18 × 18 sprites (and an unused ghoul) are in git history before the sheets landed.
