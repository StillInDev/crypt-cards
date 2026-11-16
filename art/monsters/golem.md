# Request: Golem

- **Sprite id:** `golem` (deliver `golem.png`)
- **Kind:** monster
- **Read first:** `art/README.md` (format and style rules)
- **References:** `src/img/sprites/monsters/golem.png` (current version), `src/img/sprites/players/knight.png` (quality bar for characters)

## Where it appears

A **Golem** card. It appears in: Mine, Frozen Cavern. It used to be the Ice golem; since 2026-11-16 it
is a plain stone golem with no element, so fire and ice both hurt it normally.

In play: it **never moves**. When the hero moves, cards slide up to it but never push it, and a new card
appears in the space it leaves open. It also stops corner shifts and arrow slides, and when frozen it
cannot be swapped: the hero just bumps into it. It deals damage equal to its number, which is its health.

## What it must look like

- A full figure built from chunky grey stone blocks, with patches of green moss and glowing eyes, like
  the current sprite.
- Heavy, rooted and planted: wide feet, square shoulders. It should look like it cannot be pushed.

## Do not

- Do not add a background or a frame: only the icon, on transparency.
- Do not make it icy or blue: it is no longer an ice monster.
- Do not draw it walking or mid-stride.

## Deliver

`golem.png` (at least 256 × 256, transparent; see `art/README.md`). Optionally up to three variants as `golem-1.png`, `golem-2.png`, `golem-3.png`.
