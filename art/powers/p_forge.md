# Request: Forge (power)

- **Sprite id:** `p_forge` (deliver `p_forge.png`)
- **Kind:** power icon
- **Read first:** `art/README.md` (format and style rules)
- **References:** `src/img/sprites/powers/p_forge.png` (current version), `src/img/sprites/monsters/tomb.png` (object style)

## Where it appears

The icon of the **Forge** power. It sits on a small button in the top bar during play, and on the locked reward card of the room that unlocks it. Available from the start. In play: Conjure a sword as strong as your max health. If you already hold a weapon, the sword waits and arrives as soon as your hands are empty. It is shown small, so one bold shape beats detail.

## What it must look like

- The **Forge** power conjures a sword as strong as the hero's max health. Today it is identical to the `sword` item. Make it clearly a power: the sword over an anvil, or a sword wreathed in forge sparks (`#feae34` / `#f77622`).

## Do not

- Do not add a background or a frame: only the icon, on transparency.
- Do not leave it identical to `sword`.

## Deliver

`p_forge.png` (at least 256 × 256, transparent; see `art/README.md`). Optionally up to three variants as `p_forge-1.png`, `p_forge-2.png`, `p_forge-3.png`.
