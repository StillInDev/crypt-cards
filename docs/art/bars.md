# Request: Lock bars

- **Sprite id:** `bars` (deliver `bars.png`)
- **Kind:** interface icon
- **Read first:** `README.md` (format and style rules)
- **References:** `src/img/sprites/bars.png` (current version), `src/img/sprites/tomb.png` (object style)

## Where it appears

Iron bars drawn over the locked reward card (until the room's target score is reached), and over locked rooms on the dungeon map.

## What it must look like

- Iron gate bars: a grey frame (`#c0cbdc` / `#8b9bb4`) with three or four vertical bars and dark gaps.
- Drawn **on top of** another sprite (the locked reward and locked rooms on the map), so the gaps must stay transparent and the bars thin enough to see through.

## Do not

- Do not add a background or a frame: only the icon, on transparency.
- Do not fill the gaps.

## Deliver

`bars.png` (at least 256 × 256, transparent; see `README.md`). Optionally up to three variants as `bars-1.png`, `bars-2.png`, `bars-3.png`.
