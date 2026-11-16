# Backgrounds

Requests for full backgrounds go here: the dungeon map backdrop, the board's floor behind the cards,
one floor per room theme (Cellar, Sewers, Barracks and so on), and the home screen.

Nothing is requested yet. Today every background is a flat colour or a CSS pattern:

- **Map backdrop:** a dark brick pattern (`.mapwrap` in `src/css/style.css`).
- **Play screen:** each room's theme colour (`THEMES` in `src/js/app.js`, the `bg` value).

To request one, copy `art/TEMPLATE.md` here and say:

- which screen or room it is for, and the size it must fill (backgrounds must tile, or stretch to a phone
  screen in portrait without the important part being cut off),
- that it sits **behind** the cards, so it must be darker and quieter than any sprite.
