# Request: Hourglass (power)

**Delivered** 2026-11-17 as `art/sheets/13_Power_Hourglass.png`, now in the game. This brief stays for any redraw.

- **Sprite id:** `p_hourglass` (deliver `p_hourglass.png`)
- **Kind:** power icon
- **Read first:** `art/README.md` (format and style rules)
- **References:** `src/img/sprites/powers/p_teleport.png` (today's stand-in icon, which it must not look like), `src/img/sprites/powers/p_shield.png` (power icon style)

## Where it appears

The icon of the **Hourglass** power, on its button in the power bar during play and on the Hero & powers screen. It is bought with gold. In play: it halves the time left on your other powers, so they are ready sooner. It is shown small, so one bold shape beats detail.

## What it must look like

- An hourglass with a dark wooden or gold frame (`#feae34` / `#733e39`) and pale glass (`#c0cbdc`).
- Sand (`#fee761`) pouring fast from the top bulb to the bottom, with a few loose grains, so it reads as "time speeding up".
- Optionally a small swirl or speed lines beside it.

## Do not

- Do not draw a clock face or numbers.
- Do not add a background or a frame: only the icon, on transparency.

## For the developer (not the artist)

Add `p_hourglass` to `powers` in `art/groups.json`, add the file to `src/img/sprites/powers/` (or a sheet), run `node scripts/cut-sheets.js`, and set `sprite: 'p_hourglass'` on `hourglass` in `POWERS` (`src/js/engine.js`).

## Deliver

`p_hourglass.png` (at least 256 × 256, transparent; see `art/README.md`). Optionally up to three variants as `p_hourglass-1.png`, `p_hourglass-2.png`, `p_hourglass-3.png`.
