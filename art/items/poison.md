# Request: Poison

- **Sprite id:** `poison` (deliver `poison.png`)
- **Kind:** board item (object)
- **Read first:** `art/README.md` (format and style rules)
- **References:** `src/img/sprites/items/poison.png` (current version), `src/img/sprites/monsters/tomb.png` (object style)

## Where it appears

A **Poison** card. It appears in: Cellar, Sewers, Fungus Caves, Vampire Crypt. In play: Poisons you. You lose 1 health every turn for as many turns as its number, but it can never take you below 1.

## What it must look like

- The same flask as the Potion, but the liquid is **sickly green** (`#63c74d` / `#3e8948`) and there is a small skull on the glass.
- It hurts over time.

## Do not

- Do not add a background or a frame: only the icon, on transparency.

## Deliver

`poison.png` (at least 256 × 256, transparent; see `art/README.md`). Optionally up to three variants as `poison-1.png`, `poison-2.png`, `poison-3.png`.
