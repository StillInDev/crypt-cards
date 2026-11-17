# Request: Spike trap (base)

- **Sprite id:** `trap` (deliver `trap.png`)
- **Kind:** trap (object)
- **Read first:** `art/README.md` (format and style rules)
- **Goes with:** `art/traps/trap_arrow.md` (the arrow the game places on its sides)
- **References:** `src/img/sprites/traps/trap.png` (current version), `src/img/sprites/monsters/tomb.png` (object style)

## Where it appears

The **Spike trap** card, the only trap in the game. It appears in most rooms. In play it has 1 to 4 arrows on
its sides, and they turn clockwise every turn. It only hurts the hero who steps onto it from a side that has an
arrow; from any other side it is safe. It never hits the cards around it.

The game builds the different trap variations itself: it draws this base once and adds a `trap_arrow` on each
side that has one. So this sprite is only the base.

## What it must look like

- A **square** iron plate or floor tile seen from above, dark metal (`#3a4466` / `#262b44`) with a lighter rim.
- Steel spikes (`#c0cbdc` / `#8b9bb4`) poking up through holes in the plate, so it reads as a spike trap at a glance.
- Symmetrical on all four sides, and the same from every direction: the game turns the arrows, not the base.
- Leave a clear margin on all four sides (about an eighth of the size) where the arrows sit.

## Do not

- Do not add a background or a frame: only the icon, on transparency.
- Do not draw arrows or direction marks: the arrows come from `trap_arrow`.
- No fire, ice or other element: elemental traps are gone.

## Deliver

`trap.png` (at least 256 × 256, transparent; see `art/README.md`). Optionally up to three variants as `trap-1.png`, `trap-2.png`, `trap-3.png`.
