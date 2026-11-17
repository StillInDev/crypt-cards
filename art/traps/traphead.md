# Request: Arrow trap head

- **Sprite id:** `traphead` (sheet `art/sheets/11_Trap_Head.png`)
- **Kind:** trap (object part)
- **Read first:** `art/README.md` (format and style rules)
- **References:** `src/img/sprites/traps/traphead.png` (current version, delivered), `src/img/sprites/traps/trapblock.png` (the block it attaches to)

## Where it appears

On **Arrow trap**, **Fire trap** and **Ice trap** cards, one arrowhead on each side of the block that the trap fires at (one to four of them). The game rotates this one sprite to face up, right, down or left, and turns the heads clockwise each turn. It outlines them in the trap's element: grey for the plain arrow trap, orange for fire, cyan for ice.

## What it must look like

- A steel arrowhead or spear tip (`#c0cbdc` / `#8b9bb4`) with a short collar at its base, where it meets the block.
- Drawn pointing **straight up**, centred left to right, with the base at the bottom, so it rotates cleanly.
- Thick dark outline, like the other sprites.

## Do not

- Do not tint it fire or ice: the game adds the element colour.
- Do not draw it at an angle: the game turns it.
- Do not add a background or a frame: only the icon, on transparency.

## Deliver

Redraw the single cell in `art/sheets/11_Trap_Head.png` (at least 256 × 256, transparent; see `art/README.md`), then run `node scripts/cut-sheets.js`.
