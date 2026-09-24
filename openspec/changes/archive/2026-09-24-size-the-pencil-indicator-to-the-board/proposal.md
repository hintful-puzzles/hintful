# size-the-pencil-indicator-to-the-board

Found while running the app for `own-the-select-or-drag-gesture` (2026-09-22):
Map's pencil-mode indicator is a speck. Nothing in that change touches the
indicator; this is the engine's sizing rule meeting the collection's
finest-grained board.

## Why

`pencilIndicatorSize(tileSize)` was `max(8, round(tileSize / 2) - 2 * inset)`,
so the glyph was **half a tile** — and the indicator's job is to say *the mode
is on*, which is a fact about the whole board rather than about a cell. On the
games whose tile is large that reads fine. On a fine-grained board it collapses
onto the floor.

Measured 2026-09-22, each game's own frame at a 682×556 viewport, glyph box:

| game | canvas | glyph |
| --- | --- | --- |
| Map | 417×547 | **9×9** |
| Rome | 556×556 | 30×30 |
| Keen | 552×552 | 30×30 |

The floor's own comment said it existed so the pencil is "never so small that
[it] stops reading as one on a tiny board" — and at 9px on a 417px canvas it
did not. The floor protected the wrong quantity: it bounded the glyph against
the *tile* when what makes a cue legible is its size against the *canvas* and
against the viewer.

## What was measured (task 1.1)

Every note-taking member, default params, the tile the midend fits into three
slots (phone 380×480, laptop 682×556, desktop 1100×800), glyph as a share of
the canvas's short side, 2026-09-24:

- **Served by the old rule** (≥ 3.8% everywhere): Crossing, Group, Guess, Keen,
  Mathrax, Rome, Salad, Seismic, Towers, Undead, Unequal, and Abcd/Solo/Slant
  at the edge (3.8–4.1%).
- **Not served**: Map at 2.2–2.5% (a 9px glyph at phone and laptop sizes) and
  Loopy at 3.3–3.5% (13px on a phone).

Default params understate it. Walking every preset, bump and tier at the phone
and laptop slots, the old rule fell under 3.5% in **nine** games — Group's 12×12
preset drew a 9px glyph on a 366px phone canvas, Crossing's 11×11 a 12px one.

**Map had a second defect that no size could fix.** Its style drew the outline
and graphite point in `COL_BACKGROUND`, so they vanished into the background
box and only the black body showed — a short dash, not a pencil. The site's
comment gave a reason for the body (no region color, or it reads as a fifth
region) and none for the ink. It is now an outlined pencil in the grid ink with
a background-colored body: still no region color, and the point is visible.

## The rule (task 1.2)

**Half a tile less the insets, clamped to [20, 48] CSS pixels.** A raised floor
rather than a fraction of the canvas, because the glyph's size has to be known
from the tile alone: eight members place their board at an origin computed from
`pencilIndicatorReach(ts)` with no params in hand, and a canvas-relative size is
circular for a game whose canvas is grown by the reach. The midend fits the
canvas to the player's slot, so an absolute floor is a canvas-relative floor
over the slots players have — 20px is 3.6% of a laptop slot's short side and
4.2% of a phone's. The ceiling stops a coarse board on a large screen growing
the cue past a toolbar icon (Salad and Mathrax reached 51px at desktop size).

**What it costs each member's margin.** The canvas-growing members (Abcd,
Loopy, Map, Mathrax, Rome, Seismic, Slant, Undead) grow their margin by the new
reach automatically, e.g. Map by 12px a side at its preferred tile. The eight
that held the glyph in a margin of their own were sized to the half-tile rule
and would have put a 20px glyph on their top-right cell at small tiles — the new
guard caught every one:

- Keen, Solo, Unequal, Group, Towers, Crossing: `border` is now
  `max(own, pencilIndicatorReach(ts))`, which is unchanged above a tile of about
  48 (Towers about 20) and a few pixels wider below it.
- Guess: the same, through a `borderPx` its size and geometry both read.
- Salad: its clue ring sits at the canvas edge, so it pads outside the ring by
  whatever the reach exceeds a tile by — zero above a tile of 22.

## The guard (task 1.3)

`pencil-indicator-placement.test.ts` gains two blocks. One sweeps tile sizes 12
to 96 and fails if anything of the board is painted in the indicator's box
other than the background under it. It was red for all eight margin-holding
games before their fix, and again when Keen's fix was reverted. The other fails
if the glyph is under 3.5% of the canvas's short side for any preset at the
phone or laptop slot. It was red for nine games under the old rule.

## Tasks

- [x] 1.1 Measure the glyph and the canvas for every member, not the three
      above, and say which of them the current rule serves.
- [x] 1.2 Decide the rule (canvas-relative with both bounds, or a raised floor)
      and state what it costs each member's margin.
- [x] 1.3 Give `pencil-indicator-placement.test.ts` the bound it lacks.
- [x] 1.4 Run the app across the family; this moves boards, so the owner sees it.
      Map (laptop), Keen (laptop) and Solo (phone) driven in Chromium with
      Marks on. Map's glyph reads as a pencil and Solo's clears the grid.
