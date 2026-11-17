# Request: Hit, pickup and projectile effects

- **Sprite ids:** `fx_<name>` for each effect below (deliver `fx_slash.png`, `fx_gold.png` and so on)
- **Kind:** animations (short effects, several frames in one strip) and a few small projectiles
- **Read first:** `art/README.md` (style rules). This request **changes the size and framing rules**: see below.
- **References:** the sprites the effects relate to (`src/img/sprites/items/coin.png`, `.../items/potion.png`,
  `.../items/poison.png`, `.../items/bomb.png`, `.../weapons/sword.png`, `.../weapons/firesword.png`,
  `.../weapons/icesword.png`), and `art/animations/tremor-crack.md` and `art/animations/power-casts.md` (the
  same kind of request)

## Why this is needed

Every time something happens on a card (a monster dies, you pick up gold, a sword hits, a bomb goes off) a short
effect plays over that card. Today all of them are built in code from a handful of coloured squares, circles and
stripes. They are fast and readable but look cheap next to the new sprites. This request replaces them.

## Where they appear

Over a single card (about 100 screen px wide on a phone), except where the table says otherwise. They play on
top of the card's sprite while the game is also sliding cards around, so they must be quick and clear.

## The effects

### On one card

| Id | When it plays | What it should show (today's version in brackets) | Length |
|---|---|---|---|
| `fx_slash` | The hero hits a monster with a plain sword | A white sword slash, diagonal from bottom left to top right, with a thinner second trail (white diagonal bar) | 0.32 s |
| `fx_fslash` | The same with a **fire** sword | The slash in orange and yellow, ending in a small burst of flame (orange bar, orange glow) | 0.42 s |
| `fx_islash` | The same with an **ice** sword | The slash in cyan and white, ending in a burst of frost (cyan bar, cyan glow) | 0.42 s |
| `fx_puff` | A monster is slain (also: webs cleared, a swarm or rat appears) | A puff of grey smoke that spreads and fades (grey ring of squares, grey glow) | 0.4 s |
| `fx_gold` | Gold is gained: a coin picked up, a golden monster slain, a weapon sold, a reward unlocked | Gold sparkles and a coin glint rising and fading (yellow and white squares rising) | 0.55 s |
| `fx_heal` | The hero is healed (potion, Healing power), or a potion gets stronger | Green sparkles and small **+** shapes rising (green and pale green squares rising) | 0.55 s |
| `fx_poison` | The hero is poisoned, or takes a poison tick | Green poison bubbles rising and popping (green squares rising) | 0.7 s |
| `fx_hurt` | The hero takes damage | A red flash with a few red sparks flying out (red squares around the card) | 0.4 s |
| `fx_immune` | A hit does nothing: an immune monster, the Ninja dodging a trap, the Shield power blocking | A grey ring or a small shield shape that flashes and fades (grey circle outline) | 0.4 s |
| `fx_break` | The hero's weapon breaks or runs out, or a monster's shield breaks | Grey metal shards breaking apart (white and grey squares) | 0.4 s |
| `fx_open` | A chest is opened | A burst of gold light and sparkles from the lid (yellow squares rising) | 0.55 s |
| `fx_frost` | A monster is frozen by an ice weapon, the Frost power is used, a bomb is swapped or bumped | A burst of cyan frost and a few ice crystals (cyan glow) | 0.5 s |
| `fx_fire` | Fire touch burns a card away | Flames that flare up and burn out, with embers (orange glow, orange and yellow squares rising) | 0.5 s |
| `fx_flare` | A phoenix is reborn | A bright orange-white flare, like a small sun (orange glow) | 0.4 s |
| `fx_bolt` | Thunder hits a monster, or a bow shot lands | A jagged lightning bolt striking down through the card, from above its top edge (white zig-zag bar) | 0.34 s |
| `fx_swirl` | The Teleport orb: where the hero leaves and where they land | A purple and white swirl spinning inward and shrinking to nothing (8 dots spinning in) | 0.5 s |
| `fx_spark` | A thorn hits a monster (Cactus hero), or a potion grows stronger | A small green spark burst | 0.4 s |
| `fx_boom` | A bomb explodes, or the centre of a Potion burst | A big explosion: white core, yellow and orange fire, smoke, bits flying out past the card edge. The board also shakes (orange and yellow squares, orange glow) | 0.4 s |
| `fx_blast` | The squares next to an explosion are hit | A smaller orange blast wave, weaker than `fx_boom` (orange glow) | 0.38 s |

### Across several cards

| Id | When it plays | What it should show | Length |
|---|---|---|---|
| `fx_sweep` | The hero swings a scythe (weapon) and hits the 3 cards in front | A white curved slash across three cards in a row | 0.4 s |
| `fx_beam_fire`, `fx_beam_ice` | A fire or ice wand fires down a whole row or column | A beam of fire or ice, from the hero to the board's edge | 0.5 s |

### Projectiles (one still image each; the game moves and rotates them)

| Id | When | What |
|---|---|---|
| `fx_dart` | The Poison dart power, and bow shots (`fx_star` for the ninja star) | A small dart flying from the hero to the target. Pointing **straight up** |
| `fx_star` | The ninja star weapon | A spinning ninja star seen flat (the game spins it) |
| `fx_spike` | The Cactus hero's thorns | A green thorn. Pointing **straight up** |

## Size and delivery (replaces the README's size rule)

| Kind | Frames | Each frame | Notes |
|---|---|---|---|
| On one card | **6**, left to right | 256 × 256 | The card fills the frame except for a 32 px margin on each side, which effects may spill into (`fx_boom` should) |
| `fx_sweep` | 6 | 768 × 256 | Three cards side by side, drawn sweeping left to right. The game mirrors and rotates it for other directions |
| `fx_beam_*` | 6 | 256 × 96 | One card-length of beam, running left to right, that **tiles seamlessly** end to end. The game repeats it along the row and rotates it for columns |
| Projectiles | 1 | 96 × 96 | Centred, pointing straight up |

- PNG, RGBA, transparent background, frames touching with no gaps.
- Draw each frame in place; do **not** centre each frame on its own drawing.
- The frames play evenly over the length in the table. Frame 1 starts small, the last frame is nearly empty.

## Style

- Same chunky look as the sprites, with the dark outline `#181425` on solid pieces (sparks, shards, bubbles,
  crystals, the bolt). Glows may be soft but must be part of the drawing, not a faint haze.
- Effects that share an idea share a look: the three slashes are one family, `fx_boom` and `fx_blast` are one
  family, `fx_heal` / `fx_gold` / `fx_poison` rise the same way in their own colours.
- Gold is yellow `#fee761`, healing green `#7be26b`, poison darker green `#63c74d`, fire orange `#ff5a1f`,
  ice cyan `#2ce8f5`, teleport purple `#d874c0`, hurt red `#e43b44`.

## Do not

- Do not cover the whole card for more than a frame or two: the card underneath must stay readable.
- Do not draw text. The game already floats words like "Slain" and "+3G" over the card.
- Do not use evenly spaced parallel stripes or dashes.
- Do not draw cards, monsters or a background.

## For the developer (not the artist)

Today these are the `.fx-<name>` rules in `src/css/style.css` (played by `burst` / `playFx` in `src/js/app.js`,
from the `anim` names the engine returns in `src/js/engine.js`), plus `.fx-sweep`, `.fx-beam` and the dart and
spike SVGs in `src/js/app.js`. `fx_quake` is in `art/animations/tremor-crack.md`.

## Deliver

One PNG per id in the tables, as above, plus one or two sentences on any choice that is not obvious. If you can
only do some, do them in this order: `fx_slash`, `fx_puff`, `fx_gold`, `fx_heal`, `fx_hurt`, `fx_boom`, then the rest.
