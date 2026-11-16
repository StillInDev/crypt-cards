# Backgrounds

Full backgrounds that sit behind everything else. They are seamless tiles, dark and quiet, so the cards,
rooms and text on top always stand out.

| Request | What it covers | In the game today |
|---|---|---|
| [room-floors.md](room-floors.md) | One floor per room theme (12), behind the play screen | A flat colour per room (`THEMES` in `src/js/app.js`, the `bg` value) |
| [map.md](map.md) | One backdrop per area (5), behind the dungeon map | A dark brick pattern (`.mapwrap` in `src/css/style.css`) |

To request another background, copy `art/TEMPLATE.md` here and say:

- which screen or room it is for, and the size it must fill (backgrounds must tile, or stretch to a phone
  screen in portrait without the important part being cut off),
- that it sits **behind** the cards, so it must be darker and quieter than any sprite.
