# Request: Last Stand (power)

- **Sprite id:** `p_laststand` (deliver `p_laststand.png`)
- **Kind:** power icon
- **Read first:** `art/README.md` (format and style rules)
- **References:** `src/img/sprites/monsters/goldskull.png` (today's stand-in icon, a monster, which it must not look like), `src/img/sprites/powers/p_quake.png` (the other always-on power)

## Where it appears

The icon of the **Last Stand** power, on its button in the power bar during play and on the Hero & powers screen. It is bought with gold. It is always on: once per room, a hit that would kill you leaves you at 1 health instead. Its button then reads USED for the rest of the room. It is shown small, so one bold shape beats detail.

## What it must look like

- A cracked red heart (`#e43b44` / `#a22633`), the same pixel heart the game uses for health, held together by a gold band or bandage (`#feae34`), so it reads as "broken but still beating".
- A small bright glint (`#ffffff`) on the heart.

## Do not

- Do not use a skull: it reads as a monster on the board.
- Do not draw a plus sign: that is Healing.
- Do not add a background or a frame: only the icon, on transparency.

## For the developer (not the artist)

Add `p_laststand` to `powers` in `art/groups.json`, add the file to `src/img/sprites/powers/` (or a sheet), run `node scripts/cut-sheets.js`, and set `sprite: 'p_laststand'` on `laststand` in `POWERS` (`src/js/engine.js`).

## Deliver

`p_laststand.png` (at least 256 × 256, transparent; see `art/README.md`). Optionally up to three variants as `p_laststand-1.png`, `p_laststand-2.png`, `p_laststand-3.png`.
