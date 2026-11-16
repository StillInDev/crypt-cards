# Request: Fire trap

- **Sprite id:** `firetrap` (deliver `firetrap.png`)
- **Kind:** trap (object)
- **Read first:** `art/README.md` (format and style rules)
- **References:** `src/img/sprites/traps/firetrap.png` (current version), `src/img/sprites/monsters/tomb.png` (object style)

## Where it appears

A **Fire trap** card. It appears in: Mine, Ember Halls, Throne Room. In play: Burns every card its heads point at, then turns clockwise each turn. Fire monsters are immune, ice monsters take double.

## What it must look like

- A round dark iron trap (`#3a4466` / `#262b44`) with a flame in the middle (`#f77622` / `#fee761`).
- In play it has "heads" that point in directions and turn each turn; the game draws those heads separately, so the sprite is just the trap body.

## Do not

- Do not add a background or a frame: only the icon, on transparency.
- Do not draw arrows or heads in the sprite.

## Deliver

`firetrap.png` (at least 256 × 256, transparent; see `art/README.md`). Optionally up to three variants as `firetrap-1.png`, `firetrap-2.png`, `firetrap-3.png`.
