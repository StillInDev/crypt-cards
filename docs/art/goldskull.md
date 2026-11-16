# Request: Golden skeleton

- **Sprite id:** `goldskull` (deliver `goldskull.png`)
- **Kind:** monster
- **Read first:** `README.md` (format and style rules)
- **References:** `src/img/sprites/goldskull.png` (current version), `src/img/sprites/knight.png` (quality bar for characters)

## Where it appears

A **Golden skeleton** card. It appears in: Barracks, Catacombs, Mine, Throne Room. It is also the icon of the final room on the map once cleared. In play: Hurts like a monster, but pays out its number in gold. The number on the card is its health.

## What it must look like

- Same body as the Skeleton, but **gold**: `#fee761` lit, `#feae34` shade, `#f77622` for the darkest bits.
- It pays out gold when you step on it, so it should look valuable: a small glint of white highlight.
- Also shown as the icon of the final room on the map, so it must look good on its own.

## Do not

- Do not add a background or a frame: only the icon, on transparency.
- Do not change the pose from the Skeleton's: the player should see "same monster, but gold".

## Deliver

`goldskull.png` (at least 256 × 256, transparent; see `README.md`). Optionally up to three variants as `goldskull-1.png`, `goldskull-2.png`, `goldskull-3.png`.
