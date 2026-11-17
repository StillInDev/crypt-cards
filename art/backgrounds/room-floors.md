# Request: Room floors (play screen backgrounds)

- **Sprite ids:** `bg_<theme>` for each of the 12 room themes (deliver `bg_cellar.png`, `bg_sewers.png` and so on)
- **Kind:** background (a seamless tile)
- **Read first:** `art/README.md` (style rules) and `art/backgrounds/README.md`. This request **changes the size rule**: see below.
- **References:** each theme's monsters in `src/img/sprites/monsters/` (the table below names them), and a
  screenshot of the play screen if you have one

## Why this is needed

While a room is being played, the whole screen behind the board is one flat colour, picked per room. The rooms
already have their own monsters and colours, but nothing tells the player where they are. A floor per room
(damp cellar stones, slimy sewer bricks, frozen cave ice) would give every room its own place.

## Where it appears

Behind **everything** on the play screen: behind the top bar, the HUD panels, the power buttons and the board.
The cards sit on top of it with small gaps between them, so the floor shows between the cards too.
The screen is portrait, up to 560 screen px wide; the floor is **tiled** to fill any height.

Because cards, numbers and text sit on top, the floor must be **dark and quiet**: much darker and lower in
contrast than any sprite, with no shapes that could be mistaken for a card or a monster.

## The rooms

The floor's average colour should stay close to the room's page colour (the game keeps using it for anything
the floor does not cover).

| Theme id | Room | Mood | Monsters you meet there | Page colour | Accent |
|---|---|---|---|---|---|
| `cellar` | Cellar | Rats and rot | rat, bat, slime, skeleton | `#201a16` | `#d1a45f` |
| `sewers` | Sewers | Slime and poison | slime, rat, snake, zombie | `#13241f` | `#63c74d` |
| `barracks` | Barracks | Goblins and steel | goblin, skeleton, cultist | `#1b1f31` | `#f0883a` |
| `fungus` | Fungus Caves | Spores everywhere | shroom, spider, hive, beetle | `#231a30` | `#e07bd8` |
| `catacombs` | Catacombs | The restless dead | skeleton, zombie, ghost, mummy, wraith | `#1a1a1b` | `#e0dac0` |
| `mine` | Mine | Gems and gunpowder | scorpion, beetle, golem, imp | `#261e14` | `#fee761` |
| `frozen` | Frozen Cavern | Everything is frozen | frostwolf, frostwisp, icespider, golem | `#0f2230` | `#2ce8f5` |
| `library` | Bone Library | Forbidden knowledge | cultist, lich, banshee, wraith | `#1d1730` | `#a58bff` |
| `ember` | Ember Halls | Fire and brimstone | imp, salamander, magmaslime, phoenix | `#2a1410` | `#ff6a1f` |
| `armory` | Armory | Every weapon you can think of | gargoyle, goblin, minotaur | `#1a2029` | `#c0cbdc` |
| `vampire` | Vampire Crypt | They hunt in the dark | vampire, bat, wolf, mummy | `#270f1d` | `#ff5560` |
| `throne` | Throne Room | The last stand | troll, minotaur, lich, gargoyle | `#1e1236` | `#fee761` |

Ideas, not rules: flagstones with straw and rat holes for the Cellar; wet bricks with a drain channel for the
Sewers; stone tiles with spore patches for the Fungus Caves; carved floor tiles with a purple-gold carpet edge
for the Throne Room. Small details (a crack, a bone, a puddle) should be sparse so the tile does not visibly repeat.

## Size and delivery (replaces the README's size rule)

- One PNG per theme, **512 × 512**, that **tiles seamlessly** in both directions.
- Opaque (no transparency needed).
- Drawn in the chunky style of the sprites, but flatter and darker: no thick outlines needed on floor details.

## Do not

- Do not use bright colours or strong contrast. Test it: the room's darkest card face (see `art/interface/board-and-ui.md`)
  and white text must both stand out clearly on it.
- Do not draw monsters, items, cards or anything that looks like them.
- Do not draw a visible grid that could be confused with the board's cells.

## For the developer (not the artist)

Today the play screen sets `--bodybg` to the theme's `bg` colour (`THEMES` in `src/js/app.js`, applied in
`startLevel`). Add the tile as a `background-image` on the body for that theme, keeping the colour underneath.

## Deliver

`bg_<theme>.png` for each of the 12 themes, as above, plus one or two sentences on any choice that is not
obvious. If you can only do some, start with `cellar`, `sewers` and `throne`.
