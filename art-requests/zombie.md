# Request: Zombie

- **Sprite id:** `zombie` (deliver `zombie.png`)
- **Kind:** monster, full figure
- **Read first:** `README.md` (size, palette and style rules)
- **References:** `reference/zombie@8x.png` (current version, to improve on), `reference/knight@8x.png` (quality bar)

## Where it appears

A common monster in the Sewers room. Its number is its health; stepping on it bare-handed costs that much
health. When a weapon kills it, it leaves a **tomb** card behind (see `tomb.md`), so it should feel
undead and stubborn, not fast or scary-fast.

## What it must look like

The current version (`reference/zombie@8x.png`) has the right idea. Keep:

- A full figure, head to feet, standing on the dark floor strip, like the knight.
- Green skin: `#63c74d` on the lit left side, `#3e8948` on the right. A small `#265c42` rot spot is welcome.
- Messy, dark green hair (`#265c42`), with some skin showing at the fringe.
- Small red eyes (`#e43b44`) in dark sockets.
- A **flat, straight, closed mouth**: one horizontal dark line. No teeth, no stitches, no frown, no open jaw.
- A torn purple shirt: `#b55088` left, `#68386c` right, with a ragged bottom edge and a V-neck.
  **The shirt must be solid purple: no green or skin-coloured spots or holes on it.**
- Green arms hanging at the sides, blue-grey trousers (`#5a6988` / `#3a4466`), dark feet.

Improve on the current version with more of the knight's detail: clearer arm shapes and hands, a touch
of highlight, and a better hairline. Stay readable at small size.

## Do not

- Do not add blood or gore beyond a small rot spot.
- Do not use colours outside the palette.
- Do not change the pose to running or lunging.

## Deliver

`zombie.png` (18×18) and `zombie@8x.png`. Optionally up to three variants as `zombie-1.png`, `zombie-2.png`, `zombie-3.png`.
