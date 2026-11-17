# Request: Board and interface

- **Sprite id:** many pieces, each with its own file name (listed under **Deliver**). All go in `art/interface/ui/`.
- **Kind:** interface frames, panels, buttons and badges
- **Read first:** `art/README.md` (style rules). This request **changes the size rule**: see below.
- **References:** `src/img/sprites/players/knight.png` (outline and shading quality), `src/img/sprites/interface/bars.png`,
  `src/img/sprites/interface/key.png` and `src/img/sprites/interface/web.png` (the interface sprites that already exist),
  the sheets in `art/sheets/` (the style to match), and a screenshot of the game if you have one

## Why this request is different

Every other request is one sprite. This one covers everything **around** the sprites: the board, the
card frames, the panels at the top of the screen, the power buttons, the weapon box, pop-ups, the home screen,
the upgrade marks, the dungeon map and the buttons. Today all of these are drawn in code with flat colours and square
"notched" borders. The look works, but it is plain, and it no longer matches the sprites since the new art
sheets arrived. We want drawn frames in the same style as the sprites.

## Rules for this request

Everything in the README still holds (the chunky chibi style of the sheets, a thick dark outline, transparent
background), **except the sprite size**. Instead:

| Rule | Value |
|---|---|
| Units | The sizes in the tables below are in **units**. One unit shows as about **3 screen pixels** on a phone. Sizes that say "screen px" are what the player sees |
| Delivery size | Draw and deliver every piece at **8 pixels per unit** (a 16×16 unit frame is a 128×128 PNG, and its 3-unit border is 24 px). The game scales them down, the same way it scales the sprites |
| Frames that stretch | Deliver as a **9-slice**: a square image whose corners stay fixed and whose edges and middle repeat. Say the border width in your notes. Edges must tile cleanly (a short repeating pattern, or plain) |
| Centres | A frame's centre is **transparent** unless the piece says otherwise. The game fills it with a colour (often the room's colour) |
| Text | Do **not** draw words or numbers. The game writes all text in its own pixel fonts (Press Start 2P for titles and numbers, Pixelify Sans for body text). The one exception is the title logo |
| States | Where a piece has states (ready, pressed, locked...), deliver one file per state at the same size, so the game can swap them without anything moving |

## The screen, top to bottom

The game is portrait, phone first, at most 560 screen px wide. The play screen stacks, top to bottom:

1. **Top bar:** a "Levels" button, the room title (in the room's accent colour), a "Restart" button.
2. **HUD:** three panels side by side: **Health**, **Gold**, **Best**.
3. **Power bar:** one button per equipped power, side by side.
4. **Board:** the grid of cards, filling the space left.
5. **Weapon box:** bottom right, shows the held weapon and its sell price.
6. **Hint line:** one line of grey text.

Pop-ups sit on top: the **toast** (top), the **info popup** (bottom), the **game over sheet** (centre).

Every room tints the screen. The game will keep doing this, so frames must read on **all** of these:

| Level (room theme) | Page background | Card face | Accent |
|---|---|---|---|
| Cellar | `#201a16` | `#3f3530` | `#d1a45f` |
| Sewers | `#13241f` | `#2b4a42` | `#63c74d` |
| Barracks | `#1b1f31` | `#3a4262` | `#f0883a` |
| Fungus Caves | `#231a30` | `#4a3560` | `#e07bd8` |
| Catacombs | `#1a1a1b` | `#45433f` | `#e0dac0` |
| Mine | `#261e14` | `#4e4230` | `#fee761` |
| Frozen Cavern | `#0f2230` | `#2e5469` | `#2ce8f5` |
| Bone Library | `#1d1730` | `#403669` | `#a58bff` |
| Ember Halls | `#2a1410` | `#5d2e25` | `#ff6a1f` |
| Armory | `#1a2029` | `#4a5569` | `#c0cbdc` |
| Vampire Crypt | `#270f1d` | `#5b2641` | `#ff5560` |
| Throne Room | `#1e1236` | `#56366f` | `#fee761` |

The game paints these room colours itself. Neutral frames (greys, slates, the dark outline `#181425`) are
safest; anything that must glow uses yellow `#fee761`.

---

## 1. Board

The board is a grid of square cells, from **3×3 up to 7×7**. A cell is between **40 and 118 screen px**
(about 13 to 39 units); it shrinks as the grid grows. Each card sits inside its cell with a small gap.

| Piece | File | Size | Notes |
|---|---|---|---|
| Board frame | `ui_board.png` | 9-slice, about 16×16 with a 5-unit border | Optional stone or wooden table edge drawn **around** the whole grid. Must work from 3×3 to 7×7 and must not eat into the cells. Centre transparent |
| Empty cell | `ui_cell_empty.png` | 9-slice, about 12×12 with a 2-unit border | Shown where a card was used up and nothing slid in. Today a faint dashed outline. Should read as "nothing here", mostly transparent |

## 2. Card frames

Every card is a square frame with the sprite in the middle and small numbers in the corners
(health top right, damage bottom left, an item's value bottom right). The **face colour** is the room's card
colour from the table above, so the frame's centre stays transparent.

All card frames: **9-slice, about 16×16 with a 3-unit border**, rounded or chipped corners welcome.

| State | File | When | Today |
|---|---|---|---|
| Normal | `ui_card.png` | Every card on the board | Dark edge `#26273b` with a thin inner bevel |
| Hero | `ui_card_hero.png` | The hero's own card | Orange edge `#f0883a` |
| Hero, thorns | `ui_card_hero_thorns.png` | Cactus hero at half health or less (its thorns are hurting neighbours) | Green edge `#63c74d` |
| Frozen | `ui_card_frozen.png` | A monster frozen by an ice weapon | Cyan edge `#2ce8f5` with frost inside. You may draw ice crystals into the corners and a frosted edge on the inside of the border |
| Locked reward | `ui_card_reward.png` | The reward card that appears once the room's target score is reached | Glowing yellow `#fee761` frame that blinks. The `bars` sprite is drawn over the reward's icon |
| Target | `ui_card_target.png` | Cards a power can hit, while the player is aiming it | The card blinks brighter. A thin yellow selection ring is fine |

Small badges drawn on cards (currently tiny code-drawn shapes, would be nicer as pixel art):

| Piece | File | Size | Notes |
|---|---|---|---|
| Heart | `ui_heart.png` | 7×6 | Beside the health number, top right of monster, potion, poison, trap and hero cards. Today red `#e43b44` with a pink `#ff8fa8` glint |
| Shield | `ui_shield.png` | 7×8 | Top left of a monster that carries a shield (it blocks the first hit). Today blue |
| Bomb fuse badge | `ui_fuse.png`, `ui_fuse_lit.png` | 9-slice, about 8×8 | Small dark box, top left of a bomb card, holding its countdown number. `_lit` is the last turn (today red, flashing) |
| Weapon power badge | `ui_wv.png` | 9-slice, about 8×8 | Small dark box with a grey `#c0cbdc` ring, top right of the hero card, holding the held weapon's power |
| Spike trap arrows | see `art/traps/trap_arrow.md` | pointing **up** | The arrows on the sides of a spike trap card that show which sides hurt to step in from. Now its own sprite request (`trap_arrow`). The game places and rotates them |

## 3. HUD panels

Three panels in a row above the board. Widths are shared 1.6 : 1 : 1, so on a phone Health is about
140 screen px wide and the others about 90; all three are about **60 screen px tall**. Each shows a small grey
label on top and a number underneath.

| Piece | File | Size | Notes |
|---|---|---|---|
| Panel frame | `ui_panel.png` | 9-slice, about 12×12 with a 3-unit border | Shared by all three panels. Dark slate `#262b44` centre is fine here (not transparent) |
| Health bar, back | `ui_hpbar_back.png` | 9-slice, about 6×4 | A thin trough under the health number, full panel width, about 3 units tall |
| Health bar, fill | `ui_hpbar_fill.png`, `ui_hpbar_low.png` | 9-slice, same height | Green `#63c74d` normally, red `#e43b44` at 35% health or less. The game crops it to the current health |
| Gold icon (optional) | `ui_icon_gold.png` | 9×9 | A small coin to sit beside the Gold label. May reuse the look of `coin` |
| Best icon (optional) | `ui_icon_best.png` | 9×9 | A small trophy, crown or star beside the Best label |

The Health panel also shows small status icons after the number (poison, frost, shield). Those reuse the
`poison`, `p_ice` and `p_shield` sprites at 18 screen px, so nothing new is needed for them. The Gold panel
shows the room's reward sprite after the target score; it bobs once the reward is on the board.

## 4. Power bar buttons

One button per equipped power, side by side across the full width. **Heroes carry 3 powers; the Sorcerer
carries 4**, so design for **four buttons in a row on a 390 screen px phone**: each about **80 screen px wide
and 52 tall** (up to about 130 wide on a bigger screen). Each button holds the power's icon (34 screen px) on
the left, the power's name, and a one-word state underneath. A thin progress bar runs along the bottom edge.

All power buttons: **9-slice, about 14×14 with a 3-unit border**. Centre may be filled (dark slate).

| State | File | When | What it should say at a glance |
|---|---|---|---|
| Recharging | `ui_pw_charging.png` | The power was used and needs more turns. Text reads "5 turns" | Quiet, dim, clearly not usable |
| Ready | `ui_pw_ready.png` | Charged; tap it to use it. Text reads "READY" | Bright, inviting: a yellow `#fee761` frame today. "Press me" |
| Aiming | `ui_pw_aim.png` | The player tapped a power that needs a target and the game is waiting for them to tap a card | A brighter or alternate version of Ready; the game blinks between Ready and this |
| Always on | `ui_pw_always.png` | A passive power such as Tremor that works every turn by itself. Text reads "ALWAYS ON". Its progress bar is always full | Steady and calm: working, but **not** a button to press. Must look different from Ready, perhaps a green `#63c74d` or grey frame with no glow |
| Auto | `ui_pw_auto.png` | The **Forge** power, charged. Forge now fires **by itself** (a sword appears in your hand the moment it is empty), so when charged it reads "AUTO" instead of "READY". Tapping it only shows a message | Charged and waiting, but not asking to be pressed. Must look different from Ready and from Always on: for example an orange `#f77622` / `#feae34` frame, or a small gear or spark mark in a corner |
| Disabled | `ui_pw_off.png` | The run is over | Greyed out |

| Piece | File | Size | Notes |
|---|---|---|---|
| Progress bar, fill | `ui_pw_bar.png`, `ui_pw_bar_ready.png`, `ui_pw_bar_auto.png` | 9-slice, about 4×2 | Grows left to right along the bottom edge as the power recharges. Grey while charging, yellow when ready, matching the Auto colour when Forge is charged. Always on uses the full ready bar |

## 5. Weapon box

Bottom right, under the board. It appears only while the hero holds a weapon. It is a button: tap it to sell
the weapon. It shows, left to right: the weapon's sprite (36 screen px), its charges if it has any ("×6"), an
arrow, a `coin` sprite, and the gold it sells for. About **48 screen px tall**, as wide as its contents
(roughly 150 screen px).

| Piece | File | Size | Notes |
|---|---|---|---|
| Weapon box | `ui_sell.png` | 9-slice, about 12×12 with a 3-unit border | Same family as the card frame, so it reads as "your hand". Dark centre is fine |
| Weapon box, pressed | `ui_sell_down.png` | Same | Pushed in by 1 unit |
| Arrow | `ui_arrow.png` | 7×5, pointing right | The "→" between the weapon and the coin. Grey `#c0cbdc` |

## 6. Toast

A short message that slides down from the top of the screen for two to four seconds: "Power unlocked: Forge",
"Forge works on its own", "Room cleared". One or two lines, up to about 340 screen px wide. Today it is a
yellow `#fee761` slab with dark text and a dark notched edge.

| Piece | File | Size | Notes |
|---|---|---|---|
| Toast | `ui_toast.png` | 9-slice, about 12×12 with a 3-unit border | Filled centre. Keep it yellow so it pops, or make it a parchment or banner. Dark text must stay readable on it |

## 7. Info popup

Press and hold any card, the hero or a power to see what it does. A panel appears at the bottom of the screen,
up to 420 screen px wide, with the thing's sprite (54 screen px) on the left and a yellow title plus two or
three lines of text on the right. The hero screen uses the same panel over the hero's portrait.

| Piece | File | Size | Notes |
|---|---|---|---|
| Info panel | `ui_info.png` | 9-slice, about 16×16 with a 4-unit border | Dark `#262b44` or `#181425` centre. Yellow `#fee761` frame today; a scroll or stone tablet would suit. Keep the centre plain so the text reads |
| Locked tag | `ui_tag_locked.png` | 9-slice, about 8×8 | A small dark-red tag the panel shows above a locked hero or power ("Unlocks at..."). Dark red `#a22633` / `#3e2731` |

## 8. Game over sheet

A centred panel over a dark veil when a run ends: a title ("You fell"), a big gold number, a short note and
up to three buttons. About 380 screen px wide.

| Piece | File | Size | Notes |
|---|---|---|---|
| Sheet | `ui_sheet.png` | 9-slice, about 20×20 with a 5-unit border | The grandest frame in the game: a yellow `#fee761` frame today. Dark centre |

## 9. Title and loadout screen

The first screen. Top to bottom: the game's **title**, a **loadout panel** (the equipped powers float above
the hero, who stands in the middle with a shadow, a health badge at the side, and the hero's name and power
count below), then a big **Play** button and a line of grey text.

| Piece | File | Size | Notes |
|---|---|---|---|
| Title logo | `ui_logo.png` | about 120×40 | "CRYPT CARDS" as a pixel logo, on two lines or one. Yellow `#fee761` / gold `#feae34` letters with a dark outline. A card, skull or tomb worked into it is welcome. The only piece with text in it |
| Loadout panel | `ui_loadout.png` | 9-slice, about 24×24 with a 4-unit border | A large panel, about 520×320 screen px. Today slate with a faint yellow glow on the floor where the hero stands. A crypt alcove or stone niche would suit. Filled centre |
| Hero floor | `ui_floor.png` | about 30×6 | The shadow or stone slab under the hero's feet. The hero sprite is shown 108–144 screen px tall above it |
| Power slot, filled | `ui_eslot.png` | 18×18 | A frame around each equipped power's icon (54 screen px). Today slate with a yellow edge. The slots bob gently |
| Power slot, empty | `ui_eslot_empty.png` | 18×18 | An open slot with a "+". Dashed or broken outline, mostly transparent. The hero has 3 slots (Sorcerer 4), so up to four sit in a row |
| Health badge | uses `ui_heart.png` | | Beside the hero, a heart over the hero's health number |

The **hero and powers screen** (tap the hero or a power) reuses the loadout panel and adds a grid of tiles,
about 84×100 screen px each, one per hero or power, with two tabs above it ("Heroes", "Powers 2/3").

| Piece | File | Size | Notes |
|---|---|---|---|
| Tile | `ui_tile.png` | 9-slice, about 12×12 with a 3-unit border | Holds an icon (54 screen px) and a name. Filled centre |
| Tile, selected | `ui_tile_sel.png` | Same | Equipped or chosen. Yellow edge today |
| Tile, locked | `ui_tile_locked.png` | Same | Not unlocked yet. The game also greys the icon and lays `bars` over it |
| Tab underline | `ui_tab.png` | 9-slice, about 6×3 | Under the active tab. Yellow |

### Upgrades

Gold from finished runs is banked in a **purse**. On the hero and powers screen the player spends it to
upgrade a hero (up to **7 levels**, +2 max health each) or a power (up to **3 levels**, stronger or faster
recharge). Press and hold a tile to open its details panel, which then shows the next level and an
**Upgrade** button with its gold cost.

| Piece | File | Size | Notes |
|---|---|---|---|
| Purse | `ui_purse.png` | 12×12 | Beside the banked gold total in the screen's header, next to the Done button. Today the `coin` sprite. A small coin pouch or chest would make "banked gold" read differently from gold picked up in a run |
| Level pip, empty | `ui_pip.png` | 3×3 | A row of pips under each tile's name and in the details panel, one per upgrade level. Empty = not bought. Today a dark square with a grey ring |
| Level pip, filled | `ui_pip_on.png` | 3×3 | A bought level. Yellow `#fee761` today. Heroes show 7 pips in a row, so they must stay readable at this size with a 1-unit gap |
| Upgrade ready badge | `ui_upgrade.png` | 7×7 | Top right corner of a tile when the player can afford its next level. Today a green `#63c74d` tag with a "▲" that bobs. An up-arrow, a spark or a hammer |
| Upgrade button | uses `ui_btn_go.png` | | The Upgrade button in the details panel is a normal button holding "Upgrade" plus a `coin` and the cost. It is greyed out (`ui_btn_off.png`) when the purse is short |

## 10. Dungeon map and area tabs

Pressing Play opens the **dungeon map** ("Choose a room"). The dungeon is split into **5 areas** (The Crypt,
The Depths, Sunken Halls, Ashen Keep, The Abyss). A row of **area tabs** across the top switches between them;
under it, the chosen area's map shows its 12 rooms as squares joined by paths, from an **Entrance** label at the
top down to the **boss room** at the bottom.

- An area is **sealed** until the boss of the area before it is beaten. Each boss drops a **special key** to the
  next area. A sealed area's tab shows a key, and its map shows every room sealed.
- A room opens once any room above it that leads to it is cleared. Its square shows the room's monster icon,
  the board size (bottom right, "3×3"), its target score underneath, and its reward sprite (top right corner).
- The map header shows the area's name, "4 of 12 rooms cleared", and a line with the key: "Beat Throne Room for
  the key to The Depths".

| Piece | File | Size | Notes |
|---|---|---|---|
| Area tab | `ui_areatab.png` | 9-slice, about 12×12 with a 3-unit border | About 150×44 screen px, holding the area's number and name (the game writes both). Dark slate today |
| Area tab, chosen | `ui_areatab_on.png` | Same | The area being shown. Purple `#4a3a72` with a lilac `#9a6fd0` ring today. Must stand out from the rest of the row |
| Area tab, sealed | `ui_areatab_locked.png` | Same | An area not open yet. Dark and dim; the game puts a small `key` sprite on it |
| Room square | `ui_room.png` | 9-slice, about 14×14 with a 3-unit border | 70 screen px. The border is the room's accent colour today, so draw it **white `#ffffff` / light grey `#c0cbdc`** and the game will tint it, or deliver it neutral and say so. Dark centre (`#2a2840`) holding the room's icon |
| Room square, cleared | `ui_room_done.png` | Same | Green `#63c74d` border today. A small tick or laurel in a corner is welcome |
| Room square, sealed | `ui_room_locked.png` | Same | Grey border, dim; the game shows the `bars` sprite inside |
| Boss room square | `ui_room_boss.png` | Same | The last room of each area, which shows the `goldskull`. Should look grander: a crown, gold trim, skulls. The game puts the `key` sprite on its top left corner |
| Reward corner | `ui_room_reward.png` | 12×12 | The small dark box at a room's top right corner holding its reward sprite (36 screen px). Faded once the room is cleared |
| Entrance sign | `ui_entrance.png` | 9-slice, about 12×8 with a 2-unit border | The "Entrance" label at the top of each map (the game writes the word). Yellow `#fee761` edge today. A wooden sign or stone lintel would suit |
| Path, open | `ui_path.png` | 4×4, tiles in both directions | The lines joining rooms, about 6 screen px thick. Lilac `#9a6fd0` today. The game draws them at any angle, so keep it a plain or evenly speckled strip |
| Path, sealed | `ui_path_dark.png` | Same | A path into a room that is not open yet. Dark `#3d3a52` |

The map's backdrop (today a dark brick pattern) is a separate request: `art/backgrounds/map.md`. The area tab
icons and the special key are in `art/interface/areas.md`.

## 11. Buttons

Every button in the game is one of these. Buttons hold text the game writes (Press Start 2P, small capitals).
All: **9-slice, about 12×12 with a 3-unit border**, filled centre. Deliver each in two states: up, and
`_down` (pressed, the face drops 1 unit and the bottom shade shrinks).

| Kind | File | Used for | Today |
|---|---|---|---|
| Normal | `ui_btn.png`, `ui_btn_down.png` | Home, Done, Next level, the level editor's buttons | Slate `#3a4466` with a dark notched edge and a darker bottom row |
| Primary | `ui_btn_go.png`, `ui_btn_go_down.png` | **Play**, Try again | Yellow `#fee761` with dark text. The big Play button on the home screen is about 520×70 screen px, so this must stretch wide and still look good |
| Quiet | none needed | Levels and Restart in the top bar during play | Text only, no frame |
| Danger | `ui_btn_bad.png`, `ui_btn_bad_down.png` | Delete, Reset (level editor only) | Normal button with pink-red text. A red-tinted frame is fine |
| Disabled | `ui_btn_off.png` | Any button that cannot be pressed | Faded |
| Pager arrows | `ui_arrow_left.png`, `ui_arrow_right.png` | ‹ and › either side of the Heroes / Powers tabs | 7×9 each, light grey `#c0cbdc` |

## What can stay as it is

- The level editor screen (a developer tool): it can use the normal buttons and panels, nothing special.
- The effects (slashes, sparks, beams, heal plus signs, power casts): they have their own requests in
  `art/animations/`.
- Backgrounds (the map backdrop and the room floors): they have their own requests in `art/backgrounds/`.

## Priority

If you cannot do everything at once, do it in this order, because it is what the player looks at most:

1. Card frames (section 2) and the empty cell
2. Power bar buttons (section 4), all six states
3. HUD panels (section 3) and the weapon box (section 5)
4. Buttons (section 11)
5. Info popup, toast and game over sheet (sections 6–8)
6. Title logo and loadout screen (section 9)
7. Dungeon map and area tabs (section 10) and the upgrade pieces (end of section 9)
8. Board frame (section 1) and the small badges

## Do not

- Do not draw text or numbers into any piece except the title logo.
- Do not fill frame centres that the request says are transparent: the room colours must show through.
- Do not make the Ready, Always on and Auto power buttons look alike. A player must tell at a glance which
  power to press (Ready), which works by itself every turn (Always on) and which will fire by itself when
  needed (Auto).
- Do not let card frames get heavier than the sprites inside them. On a 7×7 board a card is only about
  13 units across, so the frame must stay thin (3 units at most) and the sprite must stay the star.

## Deliver

Every file named above, in `art/interface/ui/`, as a PNG at 8 pixels per unit (see the rules at the top).
For each 9-slice, write its border width in your notes (for example "`ui_card.png`: 24 px on every side").

Also send **one mock-up** (`ui_mockup.png`, about 1170 px wide, the size of a phone screen at 3×) showing the play screen put
together: top bar, HUD, a power bar with four buttons in different states (Ready, Recharging, Always on,
Auto), a 4×4 board with a few existing sprites on it, and the weapon box. Use the Catacombs or Ember Halls
colours from the table above. This is the main thing we will review.

Optionally send variants of any piece as `<file>-1.png`, `<file>-2.png`.
