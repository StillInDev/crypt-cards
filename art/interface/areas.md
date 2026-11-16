# Request: Area icons and the boss keys

- **Sprite ids:** `area_crypt`, `area_depths`, `area_sunken`, `area_ashen`, `area_abyss`, and `bosskey`
- **Kind:** objects (icons)
- **Read first:** `art/README.md` (format and style rules)
- **References:** `src/img/sprites/interface/key.png` (the ordinary key, which the special key must not be
  mistaken for), `src/img/sprites/monsters/goldskull.png` (the boss icon on the map),
  `src/img/sprites/players/knight.png` (quality bar)

## Where it appears

The dungeon is split into **5 areas**, picked with a row of tabs above the dungeon map. Each tab shows the area's
number and name. An area is sealed until the **boss** of the area before it (the last room, at the bottom of
the map) is beaten. The boss drops a **special key** that opens the next area.

Today the tabs have no picture, and the special key reuses the ordinary `key` sprite, so it looks the same as
every other key in the game.

1. **Area icons** sit on the left of each tab, before the name, about **28 screen px**, and may later head each
   area's map. One look should tell the player what the area is like.
2. **The boss key** sits on the corner of each area's boss room on the map (about 30 screen px), in the map's
   header ("Beat Throne Room for the key to The Depths"), and on each sealed tab. It must read as **special**:
   grander than the ordinary key, clearly a prize.

## The areas

Areas 2 to 5 are new and do not have their own rooms yet, so these icons help decide what they are.

| Icon | Area | What it should show |
|---|---|---|
| `area_crypt` | 1. The Crypt | A stone tomb or crypt door with a skull. Grey-purple stone. The area every player starts in |
| `area_depths` | 2. The Depths | A cave mouth or a stalactite with a water drop. Dark blue-grey rock |
| `area_sunken` | 3. Sunken Halls | A broken pillar or archway half under water. Teal and green, with moss |
| `area_ashen` | 4. Ashen Keep | A burnt castle tower with embers and a wisp of smoke. Charcoal and orange |
| `area_abyss` | 5. The Abyss | A glowing eye or a crack of purple void. Black and violet. The last area: the most ominous |

The five should read as one set: same size, same framing, same outline, like badges.

## The boss key

| Icon | What it should show |
|---|---|
| `bosskey` | A large ornate key: gold `#fee761` / `#feae34` with a skull or crown worked into the bow (the round end), a jewel in it, and a faint glow. Pointing up and to the right like the ordinary key. Same family as `goldskull`, so it reads as "the boss's key" |

## Do not

- Do not add a background or a frame: only the icon, on transparency (the tab is the frame).
- Do not draw text, numbers or letters.
- Do not make `bosskey` so close to `key` that the two could be confused at 30 screen px.

## For the developer (not the artist)

Add the ids to `art/groups.json` (`interface`), then either put them on a sheet and add the sheet to
`scripts/cut-sheets.js`, or add the single files to `src/img/sprites/interface/` by hand and run the script to
regenerate `src/js/sprites.js`. Use `area_<id>` in `renderAreaTabs` and `bosskey` instead of `key` for the boss
badge, header and sealed tabs in `src/js/app.js`.

## Deliver

`area_crypt.png`, `area_depths.png`, `area_sunken.png`, `area_ashen.png`, `area_abyss.png` and `bosskey.png`
(at least 256 × 256, transparent; see `art/README.md`). Optionally variants as `<id>-1.png`, `<id>-2.png`.
