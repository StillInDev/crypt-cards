# Request: Spike trap arrow

- **Sprite id:** `trap_arrow` (deliver `trap_arrow.png`)
- **Kind:** trap part (object)
- **Read first:** `art/README.md` (format and style rules)
- **Goes with:** `art/traps/trap.md` (the square base it sits on)

## Where it appears

On the sides of the **Spike trap** card. Each trap has 1 to 4 of these arrows, one per side, showing which
neighbouring squares its spikes stab. The game places and turns this one sprite for each side (up, right, down,
left) and turns them all a quarter clockwise every turn, so different traps are made from the same two pieces.

## What it must look like

- A short, chunky arrowhead or spike pointing **straight up**, centred left to right.
- Steel (`#c0cbdc` / `#8b9bb4`) with a red tip (`#e43b44`) so it stands out on any card colour.
- Wide and short rather than long: it sits at the edge of the card, about a quarter of the card's width.
- Thick dark outline, like every other sprite.

## Do not

- Do not add a background or a frame: only the icon, on transparency.
- Do not point it any way but straight up: the game rotates it.
- Do not draw the trap base.

## Deliver

`trap_arrow.png` (at least 256 × 256, transparent, pointing straight up; see `art/README.md`). Until it exists,
the game draws plain grey triangles in its place.
