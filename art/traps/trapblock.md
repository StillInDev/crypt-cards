# Request: Arrow trap block

- **Sprite id:** `trapblock` (sheet `art/sheets/10_Trap_Block.png`)
- **Kind:** trap (object)
- **Read first:** `art/README.md` (format and style rules)
- **References:** `src/img/sprites/traps/trapblock.png` (current version, delivered), `src/img/sprites/traps/traphead.png` (the arrowhead fixed to its sides)

## Where it appears

The body of every **Arrow trap**, **Fire trap** and **Ice trap** card on the board, in the middle of the card, and the Arrow trap's icon in the card guide and room editor. An arrowhead (`traphead`) is fixed to each side the trap fires at, and the heads turn clockwise each turn. The element shows as a coloured outline on the heads (grey for the plain arrow trap, orange for fire, cyan for ice), so the block itself is the same for all three.

## What it must look like

- A square, riveted grey-violet iron block (`#8b9bb4` / `#5a6988`) with a thick dark outline, seen straight on.
- A slot or socket in the middle of each of its four sides, where an arrowhead attaches.
- Symmetrical, because the arrowheads can sit on any side.

## Do not

- Do not draw arrowheads on the block: the game adds them per side.
- Do not tint it fire or ice: the same block serves both.
- Do not add a background or a frame: only the icon, on transparency.

## Deliver

Redraw the single cell in `art/sheets/10_Trap_Block.png` (at least 256 × 256, transparent; see `art/README.md`), then run `node scripts/cut-sheets.js`.
