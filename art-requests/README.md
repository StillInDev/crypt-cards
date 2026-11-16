# Crypt Cards art requests

Each `.md` file in this folder (except this one and `TEMPLATE.md`) is one image request for an art agent.
Give the agent **this README plus the request file**, and the PNGs in `reference/` that the request names.
This README is the style guide every request must follow.

## The game, in one paragraph

Crypt Cards is a pixel-art dungeon card game. The board is a 3×3 (up to 7×7) grid of cards: monsters,
coins, potions, weapons, traps. The hero moves one square at a time and the cards slide in behind.
Each card shows one small sprite in the middle of a dark card face, with numbers in the corners.
Sprites must read instantly at small size on a phone.

## Hard rules (the build will not accept anything else)

| Rule | Value |
|---|---|
| Size | exactly **18 × 18 pixels** |
| Format | **PNG, RGBA**, 8 bits per channel |
| Background | fully **transparent** (alpha 0) |
| Alpha | every pixel is either fully opaque (255) or fully transparent (0). No anti-aliasing, no soft edges, no semi-transparent pixels |
| Colours | **only** the palette below. Exact hex values, no in-between shades |
| File name | `<sprite id>.png`, the id given in the request (for example `zombie.png`) |

The game scales sprites up with nearest-neighbour (crisp pixels), so every pixel shows.

## Palette

These are the only colours the game's 77 sprites use (a subset of the Endesga 32 palette).
Outline colour first, then roughly light to dark within each family.

| Use | Hex |
|---|---|
| **Outline (always)** | `#181425` |
| White / highlight | `#ffffff` |
| Light grey / bone | `#c0cbdc` |
| Grey | `#8b9bb4` |
| Dark grey | `#5a6988` |
| Slate | `#3a4466` |
| Darkest slate | `#262b44` |
| Light green | `#63c74d` |
| Green | `#3e8948` |
| Dark green | `#265c42` |
| Yellow | `#fee761` |
| Gold / orange | `#feae34` |
| Orange | `#f77622` |
| Red | `#e43b44` |
| Dark red | `#a22633` |
| Pink | `#ff8fa8` |
| Purple | `#b55088` |
| Dark purple | `#68386c` |
| Cyan | `#2ce8f5` |
| Blue | `#0099db` |
| Dark blue | `#124e89` |
| Sand / skin | `#ead4aa` |
| Tan / skin | `#e4a672` |
| Light brown | `#c28a54` |
| Brown | `#733e39` |
| Dark brown | `#3e2731` |

## Style

- **Outline:** a 1-pixel `#181425` outline around the whole silhouette and between major parts
  (head and body, shirt and trousers). The outline is what makes sprites readable; never skip it.
- **Shading:** two-tone, lit from the left. The left half of each shape uses the lighter shade of its
  colour and the right half the darker shade, split roughly down the middle (see `reference/knight@8x.png`).
- **Characters and monsters** are drawn as a full figure, head to feet, centred, standing on a dark
  floor strip of `#181425` along the bottom (rows 15–16 of 18). Leave the very bottom row and a pixel or
  two at the sides empty. See `knight`, `cactus` and `zombie` in `reference/`.
- **Objects** (tombs, chests, items) sit centred, using about 12–16 pixels of the width.
- **Faces:** big, simple eyes (1–2 pixels), clear expressions. One idea per sprite; no tiny clutter.
- **Contrast:** the sprite must read on every room's card colour. The darkest card faces are
  `#45433f`, `#3f3530`, `#2b4a42`, `#3a4262` and `#2e5469`, so keep the silhouette and outline strong.

## Reference sprites

`reference/` holds sprites already in the game. Each comes as the real 18×18 file and an 8× enlarged
copy (`@8x`) for viewing. Match their outline weight, shading and level of detail. **`knight` is the
quality bar for characters.**

## What to send back

1. The 18×18 PNG, named as the request says.
2. An 8× enlarged copy for review, named `<sprite id>@8x.png`.
3. One or two sentences on any choice that is not obvious.

If the request asks for options, send each one as `<sprite id>-1.png`, `<sprite id>-2.png` and so on.
