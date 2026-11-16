# Request: Dungeon map backdrops

- **Sprite ids:** `bg_map_<area>` for each of the 5 areas (deliver `bg_map_crypt.png`, `bg_map_depths.png`,
  `bg_map_sunken.png`, `bg_map_ashen.png`, `bg_map_abyss.png`)
- **Kind:** background (a seamless tile)
- **Read first:** `art/README.md` (style rules), `art/backgrounds/README.md`, and `art/interface/areas.md` (what each
  area is). This request **changes the size rule**: see below.
- **References:** a screenshot of the dungeon map if you have one; `src/img/sprites/monsters/goldskull.png` (the boss icon on the map)

## Why this is needed

Pressing Play opens the dungeon map: area tabs across the top, and under them the chosen area's rooms as
squares joined by paths. Behind the rooms is a dark brick pattern built in code, the same for every area.
A drawn backdrop per area would make each area feel like a different place, and make moving to the next area
feel like a reward.

## Where it appears

Inside the map's box, behind the rooms and the paths. The box is about **360 screen px wide** and about
**1200 screen px tall** (it scrolls). From top to bottom it holds the area's name and progress text, an
"Entrance" sign, then 12 room squares (70 screen px each) in rows of 1, 2, 3, 3, 2 and 1, joined by lilac
paths, with the boss room at the bottom. The backdrop is **tiled** to fill the box.

## The areas

See `art/interface/areas.md` for the full description of each area. In short:

| Area | Id | Feel |
|---|---|---|
| 1. The Crypt | `crypt` | Old stone crypt: worn bricks, tomb niches, cobwebs. Close to today's dark purple-grey bricks |
| 2. The Depths | `depths` | Natural cave below the crypt: rough rock, roots, drips of water |
| 3. Sunken Halls | `sunken` | Flooded ruins: green-blue tiles under shallow water, moss |
| 4. Ashen Keep | `ashen` | A burnt castle: scorched stone, ash, a few glowing embers |
| 5. The Abyss | `abyss` | Near nothing: cracked black stone floating over a dark purple void, faint stars |

## Size and delivery (replaces the README's size rule)

- One PNG per area, **512 × 512**, that **tiles seamlessly** in both directions.
- Opaque. Very dark: the average colour should be near `#14111d` (today's backdrop), tinted toward the area's feel.
- Drawn in the chunky style of the sprites, but flat and quiet: no thick outlines on the details.

## Do not

- Do not draw paths, room squares, doors or anything that could be read as part of the map. The game draws those.
- Do not use bright colours or strong contrast: the room squares, the lilac paths and white text must all stand
  out clearly on top.
- Do not let a detail repeat so obviously that the tiling shows (keep big features rare and irregular).

## For the developer (not the artist)

Today the backdrop is the `background-image` gradients on `.mapwrap` in `src/css/style.css`. Swap in the
chosen area's tile in `renderMenu` (`src/js/app.js`), keyed by `menuArea`.

## Deliver

The five tiles, as above, plus one or two sentences on any choice that is not obvious. If you can only do some,
start with `crypt` (the area every player sees).
