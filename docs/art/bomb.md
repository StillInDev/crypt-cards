# Request: Bomb

- **Sprite id:** `bomb` (deliver `bomb.png`)
- **Kind:** board item (object)
- **Read first:** `README.md` (format and style rules)
- **References:** `src/img/sprites/bomb.png` (current version), `src/img/sprites/tomb.png` (object style)

## Where it appears

A **Bomb** card. It appears in: Cellar, Mine, Ember Halls. In play: The big number is its damage, the small one is the fuse. Step on it to swap places with it. At zero it explodes: monsters next to it take its damage, and so do you. Monsters it kills leave an empty space.

## What it must look like

- A round black bomb (`#3a4466` / `#262b44`) with a white highlight, a short fuse and a spark (`#fee761` / `#f77622`).
- The card also shows its fuse count, so leave the top-right corner of the sprite fairly clear.

## Do not

- Do not add a background or a frame: only the icon, on transparency.

## Deliver

`bomb.png` (at least 256 × 256, transparent; see `README.md`). Optionally up to three variants as `bomb-1.png`, `bomb-2.png`, `bomb-3.png`.
