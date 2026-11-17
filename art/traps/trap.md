# Retired: Spike trap

- **Sprite id:** `trap` (still on `art/sheets/05_Dungeon_Hazards.png`, but no longer shown in the game)
- **Kind:** trap (object)

The spike trap has been replaced by the plain **Arrow trap**, a directional trap like the fire and ice traps but
without an element. The card keeps the id `trap` (so rooms and saved levels carry over), but it is drawn with the
shared block ([trapblock.md](trapblock.md)) and grey arrowheads ([traphead.md](traphead.md)), and the card guide
and room editor show the block as its icon.

Nothing needs drawing for this id. To change how arrow traps look, redraw the block or the arrowhead.
