# Request: Tomb

- **Sprite id:** `tomb` (deliver `tomb.png`)
- **Kind:** object (no character, no floor strip)
- **Read first:** `README.md` (size, palette and style rules)
- **References:** `reference/tomb@8x.png` (current placeholder), `reference/zombie@8x.png` (the monster that leaves it)

## Where it appears

When a weapon kills a zombie, the zombie becomes a tomb in the same square. The tomb blocks the way:
walking into it bare-handed just wastes a turn, and any damage at all shatters it. It has 1 health.
The player must recognise it at a glance as "the zombie's grave, break it to get through".

## What it must look like

- A grey stone headstone: `#8b9bb4` on the lit left, `#5a6988` on the right, with a `#181425` outline.
- A carved cross on the stone, in `#3a4466`.
- A small mound at the base: a strip of green moss (`#3e8948`) over brown earth (`#733e39` / `#3e2731`).
- Optional: a crack in the stone, to hint that one hit breaks it.
- Centred, about 12 pixels wide, sitting low in the frame like other objects.

## Do not

- Do not draw the zombie or a hand coming out of it.
- Do not use colours outside the palette.

## Deliver

`tomb.png` (18×18) and `tomb@8x.png`.
