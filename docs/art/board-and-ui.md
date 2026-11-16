# Request: Board and interface

- **Sprite id:** many pieces, each with its own file name (listed under **Deliver**). All go in `art/ui/`.
- **Kind:** interface frames, panels, buttons and badges
- **Read first:** `README.md` (palette and style rules). This request **changes the size rule**: see below.
- **References:** `art/knight@8x.png` (outline and shading quality), `art/bars@8x.png` and `art/web@8x.png`
  (the interface sprites that already exist), and a screenshot of the game if you have one

## Why this request is different

Every other request is one 18×18 sprite. This one covers everything **around** the sprites: the board, the
card frames, the panels at the top of the screen, the power buttons, the weapon box, pop-ups, the home screen,
the dungeon map and the buttons. Today all of these are drawn in code with flat colours and square 4-pixel
"notched" borders. The look works, but it is plain. We want hand-drawn pixel frames that match the sprites.

## Rules for this request

Everything in the README still holds (palette only, hard alpha, `#181425` outline, lit from the left),
**except the 18×18 size**. Instead:

| Rule | Value |
|---|---|
| Pixel scale | Draw at the same chunkiness as the sprites. On a phone one art pixel shows as about **3 screen pixels**. All sizes below are in **art pixels** unless they say "screen px" |
| Frames that stretch | Deliver as a **9-slice**: a small square image whose corners stay fixed and whose edges and middle repeat. Say the border width in your notes. Edges must tile cleanly (a 1–2 pixel repeating pattern, or plain) |
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

| Room | Page background | Card face | Accent |
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

These room colours are not in the palette and that is fine: the game paints them. Your pixels stay in the
palette. Neutral frames (greys, slates, `#181425`) are safest; anything that must glow uses yellow `#fee761`.

---

## 1. Board

The board is a grid of square cells, from **3×3 up to 7×7**. A cell is between **40 and 118 screen px**
(about 13 to 39 art pixels); it shrinks as the grid grows. Each card sits inside its cell with a small gap.

| Piece | File | Size | Notes |
|---|---|---|---|
| Board frame | `ui_board.png` | 9-slice, about 16×16 with a 5-pixel border | Optional stone or wooden table edge drawn **around** the whole grid. Must work from 3×3 to 7×7 and must not eat into the cells. Centre transparent |
| Empty cell | `ui_cell_empty.png` | 9-slice, about 12×12 with a 2-pixel border | Shown where a card was used up and nothing slid in. Today a faint dashed outline. Should read as "nothing here", mostly transparent |

## 2. Card frames

Every card is a square frame with the sprite in the middle and small numbers in the corners
(health top right, damage bottom left, an item's value bottom right). The **face colour** is the room's card
colour from the table above, so the frame's centre stays transparent.

All card frames: **9-slice, about 16×16 with a 3-pixel border**, rounded or chipped corners welcome.

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
| Arrow trap heads | `ui_head_fire.png`, `ui_head_ice.png` | 5×3, pointing **up** | The little triangles on the edges of an arrow trap card that show which way it fires. The game rotates them. Fire is orange, ice is cyan |

## 3. HUD panels

Three panels in a row above the board. Widths are shared 1.6 : 1 : 1, so on a phone Health is about
140 screen px wide and the others about 90; all three are about **60 screen px tall**. Each shows a small grey
label on top and a number underneath.

| Piece | File | Size | Notes |
|---|---|---|---|
| Panel frame | `ui_panel.png` | 9-slice, about 12×12 with a 3-pixel border | Shared by all three panels. Dark slate `#262b44` centre is fine here (not transparent) |
| Health bar, back | `ui_hpbar_back.png` | 9-slice, about 6×4 | A thin trough under the health number, full panel width, about 3 art pixels tall |
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

All power buttons: **9-slice, about 14×14 with a 3-pixel border**. Centre may be filled (dark slate).

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
| Weapon box | `ui_sell.png` | 9-slice, about 12×12 with a 3-pixel border | Same family as the card frame, so it reads as "your hand". Dark centre is fine |
| Weapon box, pressed | `ui_sell_down.png` | Same | Pushed in by 1 pixel |
| Arrow | `ui_arrow.png` | 7×5, pointing right | The "→" between the weapon and the coin. Grey `#c0cbdc` |

## 6. Toast

A short message that slides down from the top of the screen for two to four seconds: "Power unlocked: Forge",
"Forge works on its own", "Room cleared". One or two lines, up to about 340 screen px wide. Today it is a
yellow `#fee761` slab with dark text and a dark notched edge.

| Piece | File | Size | Notes |
|---|---|---|---|
| Toast | `ui_toast.png` | 9-slice, about 12×12 with a 3-pixel border | Filled centre. Keep it yellow so it pops, or make it a parchment or banner. Dark text must stay readable on it |

## 7. Info popup

Press and hold any card, the hero or a power to see what it does. A panel appears at the bottom of the screen,
up to 420 screen px wide, with the thing's sprite (54 screen px) on the left and a yellow title plus two or
three lines of text on the right. The hero screen uses the same panel over the hero's portrait.

| Piece | File | Size | Notes |
|---|---|---|---|
| Info panel | `ui_info.png` | 9-slice, about 16×16 with a 4-pixel border | Dark `#262b44` or `#181425` centre. Yellow `#fee761` frame today; a scroll or stone tablet would suit. Keep the centre plain so the text reads |
| Locked tag | `ui_tag_locked.png` | 9-slice, about 8×8 | A small dark-red tag the panel shows above a locked hero or power ("Unlocks at..."). Dark red `#a22633` / `#3e2731` |

## 8. Game over sheet

A centred panel over a dark veil when a run ends: a title ("You fell"), a big gold number, a short note and
up to three buttons. About 380 screen px wide.

| Piece | File | Size | Notes |
|---|---|---|---|
| Sheet | `ui_sheet.png` | 9-slice, about 20×20 with a 5-pixel border | The grandest frame in the game: a yellow `#fee761` frame today. Dark centre |

## 9. Title and loadout screen

The first screen. Top to bottom: the game's **title**, a **loadout panel** (the equipped powers float above
the hero, who stands in the middle with a shadow, a health badge at the side, and the hero's name and power
count below), then a big **Play** button and a line of grey text.

| Piece | File | Size | Notes |
|---|---|---|---|
| Title logo | `ui_logo.png` | about 120×40 | "CRYPT CARDS" as a pixel logo, on two lines or one. Yellow `#fee761` / gold `#feae34` letters with a dark outline. A card, skull or tomb worked into it is welcome. The only piece with text in it |
| Loadout panel | `ui_loadout.png` | 9-slice, about 24×24 with a 4-pixel border | A large panel, about 520×320 screen px. Today slate with a faint yellow glow on the floor where the hero stands. A crypt alcove or stone niche would suit. Filled centre |
| Hero floor | `ui_floor.png` | about 30×6 | The shadow or stone slab under the hero's feet. The hero sprite is shown 108–144 screen px tall above it |
| Power slot, filled | `ui_eslot.png` | 18×18 | A frame around each equipped power's icon (54 screen px). Today slate with a yellow edge. The slots bob gently |
| Power slot, empty | `ui_eslot_empty.png` | 18×18 | An open slot with a "+". Dashed or broken outline, mostly transparent. The hero has 3 slots (Sorcerer 4), so up to four sit in a row |
| Health badge | uses `ui_heart.png` | | Beside the hero, a heart over the hero's health number |

The **hero and powers screen** (tap the hero or a power) reuses the loadout panel and adds a grid of tiles,
about 84×100 screen px each, one per hero or power, with two tabs above it ("Heroes", "Powers 2/3").

| Piece | File | Size | Notes |
|---|---|---|---|
| Tile | `ui_tile.png` | 9-slice, about 12×12 with a 3-pixel border | Holds an icon (54 screen px) and a name. Filled centre |
| Tile, selected | `ui_tile_sel.png` | Same | Equipped or chosen. Yellow edge today |
| Tile, locked | `ui_tile_locked.png` | Same | Not unlocked yet. The game also greys the icon and lays `bars` over it |
| Tab underline | `ui_tab.png` | 9-slice, about 6×3 | Under the active tab. Yellow |

## 10. Dungeon map

"The Crypt": a vertical map of 12 rooms joined by lines, from the **Entrance** at the top down to the
**Throne Room** at the bottom (rows of 1, 2, 3, 3, 2, 1 rooms). It scrolls inside a dark framed box.

| Piece | File | Size | Notes |
|---|---|---|---|
| Map backdrop | `ui_map_bg.png` | tile, about 16×8 | A repeating brick or flagstone floor behind the map. Very dark (`#181425`, `#262b44`) so the rooms stand out. Today dark bricks |
| Map frame | `ui_map_frame.png` | 9-slice, about 16×16 with a 4-pixel border | Around the whole map box. Centre transparent (the backdrop shows through) |
| Room node | `ui_room.png` | 24×24 | Each room is a square box, 70 screen px. It holds the room's monster icon (40 screen px). Its border is painted in the room's accent colour, so draw the border **white `#ffffff` / light grey `#c0cbdc`** and the game will tint it; or deliver it neutral and say so |
| Room node, cleared | `ui_room_done.png` | 24×24 | Cleared rooms have a green `#63c74d` border today. A small tick mark or banner would help |
| Room node, sealed | `ui_room_locked.png` | 24×24 | Not open yet. Dark, with the `bars` sprite inside instead of the icon |
| Room node, throne | `ui_room_boss.png` | 24×24 or a little larger | The last room. Should look grander: a crown, gold trim, skulls |
| Reward badge | `ui_room_reward.png` | 12×12 | A small dark frame at the top right corner of each room holding the reward's sprite (36 screen px) |
| Path, open | `ui_path_lit.png` | tile, 2×2 | The line between two rooms once the way is open. Purple `#b55088` today. The game draws lines at any angle, so a plain colour or a 2-pixel repeat is enough |
| Path, sealed | `ui_path_dark.png` | tile, 2×2 | A line to a room that is not open yet. Dark slate `#3a4466` |
| Entrance | `ui_entrance.png` | about 24×12 | A doorway or stair at the top of the map where the paths start. Today a yellow-ringed label reading "Entrance" |

The room number, the grid size (for example "4×4") and the target score are text the game writes around the
node; leave room for them below and in the corners.

## 11. Buttons

Every button in the game is one of these. Buttons hold text the game writes (Press Start 2P, small capitals).
All: **9-slice, about 12×12 with a 3-pixel border**, filled centre. Deliver each in two states: up, and
`_down` (pressed, the face drops 1 pixel and the bottom shade shrinks).

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
- The particle effects (slashes, sparks, beams, heal plus signs): they are animated in code and are out of scope.
- The page background grid pattern: the room colour plus a faint grid is fine, unless you want to offer a
  repeating floor tile (`ui_page_bg.png`, 16×16, very dark and low contrast) as an option.

## Priority

If you cannot do everything at once, do it in this order, because it is what the player looks at most:

1. Card frames (section 2) and the empty cell
2. Power bar buttons (section 4), all six states
3. HUD panels (section 3) and the weapon box (section 5)
4. Buttons (section 11)
5. Info popup, toast and game over sheet (sections 6–8)
6. Title logo and loadout screen (section 9)
7. Dungeon map (section 10)
8. Board frame (section 1) and the small badges

## Do not

- Do not use colours outside the palette.
- Do not draw text or numbers into any piece except the title logo.
- Do not fill frame centres that the request says are transparent: the room colours must show through.
- Do not make the Ready, Always on and Auto power buttons look alike. A player must tell at a glance which
  power to press (Ready), which works by itself every turn (Always on) and which will fire by itself when
  needed (Auto).
- Do not let card frames get heavier than the sprites inside them. On a 7×7 board a card is only about
  13 art pixels across, so the frame must stay thin (3 pixels at most) and the sprite must stay the star.

## Deliver

Every file named above, in `art/ui/`, each as the real-size PNG plus an 8× copy named `<file>@8x.png`.
For each 9-slice, write its border width in your notes (for example "`ui_card.png`: 3 px on every side").

Also send **one mock-up** (`ui_mockup.png`, at real art-pixel scale, any size) showing the play screen put
together: top bar, HUD, a power bar with four buttons in different states (Ready, Recharging, Always on,
Auto), a 4×4 board with a few existing sprites on it, and the weapon box. Use the Catacombs or Ember Halls
colours from the table above. This is the main thing we will review.

Optionally send variants of any piece as `<file>-1.png`, `<file>-2.png`.
