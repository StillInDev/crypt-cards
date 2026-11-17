# Request: Tremor ground crack

> **Update:** the hit effect (`fx_quake_hit` below) is now done with delivered art: a stone spike that grows out
> of the bottom of the hit square. Sources are `art/animations/src/tremor_spike_side.webp` (used for left/right
> moves: as drawn when moving left, mirrored when moving right) and `tremor_spike_up.webp` (up/down moves), 3 x 2
> grids of 6 growth frames. `python3 scripts/cut-tremor.py` turns them into `src/img/fx/tremor_side.png` and
> `tremor_up.png`. Only `fx_quake_feet` (the crack under the hero) is still open.

- **Sprite ids:** `fx_quake_hit` and `fx_quake_feet` (deliver `fx_quake_hit.png` and `fx_quake_feet.png`)
- **Kind:** animation (a short effect, several frames in one strip)
- **Read first:** `art/README.md` (format and style rules). This request **changes the size and framing rules**: see below.
- **References:** `src/img/sprites/powers/p_quake.png` (the Tremor power icon: match its colours and feel),
  `src/img/sprites/players/knight.png` (outline and quality bar), `src/img/sprites/monsters/rat.png` (a typical card the crack is drawn over)

## Why this is needed

Tremor is a power that is always on. Every time the hero steps, any monster that slides into the square the
hero just left gets hit, and the floor cracks. Today the crack is drawn in code as a row of evenly spaced dark
and brown stripes. Players see it as a **train track** or ladder, not a crack, and ask what it is. This request
replaces it with drawn art.

## Where it appears

The effect plays in two places at the same moment, about once every few moves:

1. **`fx_quake_hit`: on the square that was hit.** It plays over the card of the monster that just slid in,
   while that card is still arriving. It lasts **0.5 seconds**. The monster must stay readable underneath it.
2. **`fx_quake_feet`: under the hero's feet.** The hero stomps (a small jolt), and the ground cracks along the
   bottom of the hero's card. It starts **0.28 seconds** into the stomp and lasts **0.4 seconds**.

A card is about 100 screen pixels wide on a phone, so the crack must read at that size.

## What it must look like

- **Cracked stone floor.** Jagged, irregular lines that zig-zag and fork, splitting out from one point.
  A real crack has uneven gaps: some branches long, some short, none parallel.
- **Rubble:** a few small chunks of stone that jump up out of the crack and fall back, plus a small puff of dust.
- **Colours:** crack lines in the dark outline colour `#181425`, with the broken edges lit in brown `#733e39`
  and tan `#c28a54`. Dust in pale sand `#ead4aa`. These match the Tremor power icon.
- **Same pixel-art style** as the sprites: chunky, thick outline on the rubble chunks, hard edges.

### `fx_quake_hit` (on the hit square): 5 frames

| Frame | What happens |
|---|---|
| 1 | A small star-shaped split appears at the centre |
| 2 | The crack runs out in 3 to 5 jagged branches, rubble chunks jump up |
| 3 | Full crack across most of the square, chunks at their highest, dust puff |
| 4 | Chunks fall back, dust spreads and thins |
| 5 | Only a faint crack and a little dust remain (nearly empty) |

Keep the crack lines thin (2 to 3 art pixels) and the busiest part in the **lower half** of the square, so the
monster's face stays visible.

### `fx_quake_feet` (under the hero): 4 frames

| Frame | What happens |
|---|---|
| 1 | A short split appears under the centre of the feet |
| 2 | It runs left and right in a jagged line, two small chunks pop up |
| 3 | Full width of the card's bottom edge, dust kicks out to both sides |
| 4 | Dust fades, a faint crack remains (nearly empty) |

## Size and delivery (replaces the README's size rule)

| File | Frames | Each frame | Whole strip |
|---|---|---|---|
| `fx_quake_hit.png` | 5, left to right | 256 × 256 | 1280 × 256 |
| `fx_quake_feet.png` | 4, left to right | 256 × 96 | 1024 × 96 |

- PNG, RGBA, transparent background, frames touching edge to edge with no gaps or borders between them.
- Each frame is placed exactly where it sits on the card (do **not** centre each frame on its own drawing).
  The crack's starting point stays in the same place in every frame.
- Nothing may touch the outer edge of a frame, except dust that is fading out.

## Do not

- **Do not** draw evenly spaced parallel lines, straight lines, rails, ladder rungs, stitches, zips or dashes.
  That is the current look and the whole reason for this request.
- Do not cover the whole square with dark colour. The monster underneath must stay readable.
- Do not add a background, a frame, or a glow halo.
- Do not draw the hero or a monster: only the crack, rubble and dust.

## For the developer (not the artist)

The current crack is CSS: `.fx-quake::after` (on the hit square) and `.cast-quake .au.bk::before` (under the
hero's feet) in `src/css/style.css`. Swap each for the matching strip, played with `steps(5)` and `steps(4)`
over the same timings. Remove the stripe gradients once the art is in.

## Deliver

`fx_quake_hit.png` and `fx_quake_feet.png`, as above, plus one or two sentences on any choice that is not obvious.
Optionally send a second take as `fx_quake_hit-2.png` / `fx_quake_feet-2.png`.
