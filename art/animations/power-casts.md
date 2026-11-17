# Request: Power cast effects

- **Sprite ids:** `cast_<power>` for each power below (deliver `cast_heal.png`, `cast_fire.png` and so on)
- **Kind:** animations (short effects, several frames in one strip)
- **Read first:** `art/README.md` (style rules). This request **changes the size and framing rules**: see below.
- **References:** each power's icon in `src/img/sprites/powers/` (match its colours and idea),
  `src/img/sprites/players/knight.png` (the hero the effect plays around), `art/animations/tremor-crack.md`
  (the same kind of request, for the Tremor power)

## Why this is needed

When the player uses a power, the hero's card plays a short effect: a glow, flames, a lightning bolt. Today
every one is drawn in code from flat circles, squares and stripes. They work but look cheap next to the new
sprites, and some are hard to read (the Tremor crack looked like a train track). This request replaces them
with drawn effects, one per power.

## Where it appears

On the **hero's card** only, the moment a power is used. Each effect lasts **0.8 seconds**, then the card goes
back to normal. The hero sprite stays visible the whole time, so each effect has two layers:

- **Back layer** (`cast_<power>_back.png`): drawn **behind** the hero, inside the card: glows, auras, rings.
- **Front layer** (`cast_<power>_front.png`): drawn **in front** of the hero: sparks, plus signs, bolts, drips.

A power may use only one of the two layers. The card is about 100 screen px wide on a phone.

Some powers also play a small effect on the cards they hit (Thunder on every monster, Fire touch on the burned
card). Those are in `art/animations/hit-effects.md`, not here.

## The powers

| Power | Icon | What it does | What the effect should show (today's version in brackets) |
|---|---|---|---|
| Healing | `p_heal` | Restores 5 health | A soft green glow behind the hero; two or three green **+** signs float up and fade (green radial glow, two "+" characters rising) |
| Mass healing | `p_massheal` | Heals 2 and makes every potion stronger | A golden-green ring that widens out from the hero past the card edge; small green sparkles rise (yellow ring growing, one green square rising) |
| Forge | `p_forge` | Makes a power-10 sword in the hero's hand | A hot orange glow from below, like an anvil or forge; white and yellow sparks burst out twice, hammer-blow rhythm (orange glow, white square popping twice) |
| Poison dart | `p_dart` | Throws a dart at a random monster | A puff of green poison at the hero's hand and a few green drips falling (green bubble, three green drips) |
| Fire touch | `p_fire` | Burns away any card the player taps | Flames rising up behind the hero; embers floating up in front (orange flame shape behind, four ember squares) |
| Scythe | `p_scythe` | Cuts every monster in the 8 cards around the hero | A red crescent sweeping a full circle around the hero; red shards flying outward (red arc spinning, 8 red squares flying out) |
| Thunder | `p_thunder` | Every monster on the board takes 3 damage | A white-yellow flash; a lightning bolt strikes down onto the hero from above the card (white flash, yellow bar from the top) |
| Frost | `p_ice` | Monsters deal no damage for 3 moves | Frost creeping in from the card edges; ice crystals forming around the hero, who shivers (cyan inner glow, white crystal squares) |
| Teleport orb | `p_teleport` | The hero jumps to a tapped card | A purple swirling portal behind the hero; white and pink sparkles spiralling inward (purple dashed ring spinning, 8 dots spinning) |
| Potion burst | `p_burst` | A tapped potion explodes, hurting neighbours | Pink bubbles popping out from the hero (pink circle, two bubbles rising) |
| Shield | `p_shield` | Fire and ice can't hurt the hero for 4 turns | **No effect today.** A blue shield shape or dome closing around the hero, with a bright flash where it seals |
| Tremor | `p_quake` | Always on: hits a monster that slides into the square the hero left | Not here: see `art/animations/tremor-crack.md` |
| Magnet | `p_magnet` | Every coin and gem on the board flies into the purse | A gold pulse ring pulling **inward** to the hero; small coins streaking in from the card edges and vanishing at the hero (a gold outline glow and a pulse) |
| Hourglass | `p_hourglass` | Halves the time left on the other powers | Falling golden sand swirling fast around the hero, a pale silver clock-hand sweep behind, ending in a bright "tick" flash (a silver outline glow and a pulse) |
| Whetstone | `p_whetstone` | The held weapon gains 2 power | Bright sparks flying off the weapon in the hero's hand (the right side of the card) in two quick scrapes, with a short white glint along the blade (a grey outline glow and a pulse) |
| Last Stand | `p_laststand` | Always on: once per room, a killing hit leaves the hero at 1 health | Plays when it saves the hero: a red heartbeat flash behind the hero, cracks of light across the card that seal up, and a small heart rising (a red outline glow and a pulse) |

## Size and delivery (replaces the README's size rule)

- Each layer is **one strip of 8 frames**, left to right, each frame **256 × 256** (the whole strip is 2048 × 256).
  The frames play evenly over 0.8 seconds (0.1 s each).
- Each frame covers the **whole card**: the hero stands in the middle, feet about 80% of the way down. Draw each
  frame in place; do **not** centre each frame on its own drawing.
- Effects may spill a little past the card (the ring of Mass healing, the bolt of Thunder) but must stay inside
  the 256 × 256 frame: draw the card's edge as if it were at 32 px in from each side, and use the margin for spill.
- PNG, RGBA, transparent background. Frame 1 should start small and frame 8 should be nearly empty, so the
  effect starts and ends cleanly.

## Style

- Same chunky look as the sprites, with the thick dark outline `#181425` on solid shapes (sparks, crystals,
  bolts, bubbles). Glows may be soft but must be part of the drawing, not a faint haze (see the README).
- Each power's main colour should match its icon, so a player learns which effect goes with which button.

## Do not

- Do not cover the hero's face for more than one or two frames.
- Do not draw the hero, the card, or a background.
- Do not use evenly spaced parallel stripes or dashes (they read as tracks or zips at this size).

## For the developer (not the artist)

Today these are the `.cast-<power> .au.bk` / `.au.fr` rules in `src/css/style.css` (the `au` spans in the hero
card, added for 0.8 s by `castLook` in `src/js/app.js`). Shield has no rule yet; `castLook` would need to be
called for it with id `ward`. Magnet, Hourglass, Whetstone and Last Stand only have an outline glow and a pulse
today (`.cast-magnet` and the rest). Last Stand's look is triggered from the move result (`r.stand`), not a tap.

## Deliver

`cast_<power>_back.png` and/or `cast_<power>_front.png` for each power in the table (except Tremor), as above,
plus one or two sentences on any choice that is not obvious. Ids: `heal`, `massheal`, `forge`, `dart`, `fire`,
`scythe`, `thunder`, `ice`, `teleport`, `burst`, `shield`, `magnet`, `hourglass`, `whetstone`, `laststand`.
If you do these in batches, the four newest (Magnet, Hourglass, Whetstone, Last Stand) are the most bare today.
