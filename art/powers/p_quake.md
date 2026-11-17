# Request: Tremor (power)

- **Sprite id:** `p_quake` (deliver `p_quake.png`)
- **Kind:** power icon
- **Read first:** `art/README.md` (format and style rules)
- **References:** `src/img/sprites/powers/p_quake.png` (current version), `src/img/sprites/monsters/tomb.png` (object style)

## Where it appears

The icon of the **Tremor** power. It sits on a small button in the top bar during play, and on the locked reward card of the room that unlocks it. Unlocked by clearing the Cellar. In play: Always on. Every time you step, a monster that slides into the square you left is hit. Damage is 3, plus 1 for every 25 points of your best score (up to 12). It is shown small, so one bold shape beats detail.

## What it must look like

- The **Tremor** power (always on): a cracked boulder or a ground slab splitting, brown rock (`#c28a54` / `#733e39`) with a bright crack (`#feae34`).

## Do not

- Do not add a background or a frame: only the icon, on transparency.

## Deliver

`p_quake.png` (at least 256 × 256, transparent; see `art/README.md`). Optionally up to three variants as `p_quake-1.png`, `p_quake-2.png`, `p_quake-3.png`.
