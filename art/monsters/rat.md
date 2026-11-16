# Request: Rat

- **Sprite id:** `rat` (deliver `rat.png`)
- **Kind:** monster
- **Read first:** `art/README.md` (format and style rules)
- **References:** `src/img/sprites/monsters/rat.png` (current version), `src/img/sprites/players/knight.png` (quality bar for characters)

## Where it appears

A **Rat** card. It appears in: Cellar (also its map icon), Sewers. In play: Deals damage equal to its number. If it stays put for 3 turns, it turns a neighbouring card into another rat just as strong. The number on the card is its health.

## What it must look like

- Currently a grey rat face. Draw the **whole rat** side-on or three-quarter: grey body (`#8b9bb4` / `#5a6988`), pink ears, nose and tail (`#ff8fa8`), small red eye.
- It breeds (turns neighbours into rats), so a scruffy, twitchy look fits. It is also the Cellar's map icon.

## Do not

- Do not add a background or a frame: only the icon, on transparency.

## Deliver

`rat.png` (at least 256 × 256, transparent; see `art/README.md`). Optionally up to three variants as `rat-1.png`, `rat-2.png`, `rat-3.png`.
