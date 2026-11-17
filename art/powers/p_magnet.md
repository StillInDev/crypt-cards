# Request: Magnet (power)

**Delivered** 2026-11-17 as `art/sheets/12_Power_Magnet.png`, now in the game. This brief stays for any redraw.

- **Sprite id:** `p_magnet` (deliver `p_magnet.png`)
- **Kind:** power icon
- **Read first:** `art/README.md` (format and style rules)
- **References:** `src/img/sprites/items/coin.png` (the coin it pulls in, and today's stand-in icon), `src/img/sprites/powers/p_shield.png` (power icon style)

## Where it appears

The icon of the **Magnet** power, on its button in the power bar during play and on the Hero & powers screen. It is bought with gold. In play: every coin and gem on the board flies into your purse. It is shown small, so one bold shape beats detail.

Today it borrows the coin sprite, which makes it look like a pickup instead of a power.

## What it must look like

- A classic red horseshoe magnet (`#e43b44` / `#a22633`) with silver tips (`#c0cbdc`), pointing up and to the right.
- Two or three small gold coins (`#feae34` / `#fee761`) flying toward the tips, with short motion lines.

## Do not

- Do not let the coins be bigger than the magnet: it must read as the magnet, not as a coin.
- Do not add a background or a frame: only the icon, on transparency.

## For the developer (not the artist)

Add `p_magnet` to `powers` in `art/groups.json`, add the file to `src/img/sprites/powers/` (or a sheet), run `node scripts/cut-sheets.js`, and set `sprite: 'p_magnet'` on `magnet` in `POWERS` (`src/js/engine.js`).

## Deliver

`p_magnet.png` (at least 256 × 256, transparent; see `art/README.md`). Optionally up to three variants as `p_magnet-1.png`, `p_magnet-2.png`, `p_magnet-3.png`.
