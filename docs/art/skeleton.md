# Request: Skeleton

- **Sprite id:** `skeleton` (deliver `skeleton.png`)
- **Kind:** monster
- **Read first:** `README.md` (format and style rules)
- **References:** `src/img/sprites/skeleton.png` (current version), `src/img/sprites/knight.png` (quality bar for characters)

## Where it appears

A **Skeleton** card. It appears in: Cellar, Barracks, Catacombs (also its map icon), Armory. In play: Deals damage equal to its number. The number on the card is its health.

## What it must look like

- Currently a skull only. Redraw as a **full skeleton**: bone white (`#ffffff` / `#c0cbdc`), dark eye sockets, ribs, thin arm and leg bones, standing on the floor strip.
- Optional: a rusty sword or shield, but keep it simple.
- It is the most common undead monster, so it must read in a split second.

## Do not

- Do not add a background or a frame: only the icon, on transparency.
- Do not use gold: that is the Golden skeleton.

## Deliver

`skeleton.png` (at least 256 × 256, transparent; see `README.md`). Optionally up to three variants as `skeleton-1.png`, `skeleton-2.png`, `skeleton-3.png`.
