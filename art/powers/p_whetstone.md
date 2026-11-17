# Request: Whetstone (power)

- **Sprite id:** `p_whetstone` (deliver `p_whetstone.png`)
- **Kind:** power icon
- **Read first:** `art/README.md` (format and style rules)
- **References:** `src/img/sprites/weapons/sword.png` (today's stand-in icon, and the blade being sharpened), `src/img/sprites/powers/p_forge.png` (the Forge power, which it must not be confused with)

## Where it appears

The icon of the **Whetstone** power, on its button in the power bar during play and on the Hero & powers screen. It is bought with gold. In play: the weapon you are holding gains 2 power (more with upgrades). It is shown small, so one bold shape beats detail.

Today it borrows the sword sprite, which makes it look like a weapon pickup.

## What it must look like

- A grey sharpening stone (`#5a6988` / `#8b9bb4`), a flat rounded block, with a sword blade (`#c0cbdc`) drawn across it at an angle, pointing up and to the right.
- A burst of bright sparks (`#fee761` / `#ffffff`) where the blade meets the stone.

## Do not

- Do not draw a hammer or an anvil: that is Forge.
- Do not add a background or a frame: only the icon, on transparency.

## For the developer (not the artist)

Add `p_whetstone` to `powers` in `art/groups.json`, add the file to `src/img/sprites/powers/` (or a sheet), run `node scripts/cut-sheets.js`, and set `sprite: 'p_whetstone'` on `whetstone` in `POWERS` (`src/js/engine.js`).

## Deliver

`p_whetstone.png` (at least 256 × 256, transparent; see `art/README.md`). Optionally up to three variants as `p_whetstone-1.png`, `p_whetstone-2.png`, `p_whetstone-3.png`.
