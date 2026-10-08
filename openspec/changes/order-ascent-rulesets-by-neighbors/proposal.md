# order-ascent-rulesets-by-neighbors

Asked for by the owner (2026-10-08), who decided the names, the order and the
cut corners in the same sitting.

## Why

Ascent's hexagonal boards had two lines of its Type menu, both Normal, and the
board without diagonal moves had none. Two changes of 2026-10-05 did it:
declaring Edges as a ruleset flattened the "Hex" submenu into the Ascent
section, and the twelve-line cap then gave "a second kind of board" one line.

Both followed from filing the grid as a *kind* of board, as Loopy's tilings
are. A kind changes the board's shape and not the puzzle. Ascent's grids
change which squares are neighbors, which is the puzzle's one rule: a player
reasons differently with four, six and eight neighbors. The guide's own test
agrees, since settings that exclude each other are one ruleset field, and no
two of these combine.

## What changes

- **Four rulesets, told apart by a square's neighbors and ordered fewest
  first**: Orthogonal (4), Hex (6), Classic (8), Edges (8, with arrows). The
  owner's order is easiest to learn first, as in the rest of the catalog.
- **Honeycomb and Hexagon are the two shapes of Hex.** The dialog's "Grid
  type" becomes "Board shape" (Rectangle, Honeycomb, Hexagon), which only Hex
  leaves a choice of.
- **The menu is eighteen lines, one board of each ruleset**: Orthogonal 6x7,
  Honeycomb 6x8 and Classic 6x7 at every tier, the Size 7 Hexagon from Normal
  to Hard, and Edges as it was. A new game starts on the first line,
  Orthogonal 6x7 Easy. Classic's 8x10 leaves the menu for the Custom dialog.
- **A whole menu holds at most eighteen lines** (owner). A first build of this
  change offered two sizes of everything, 35 lines, each section within the
  twelve-line cap; the owner refused it and set the cap on the menu. Loopy
  (25) and Unequal (23) were over it already and are in the test's ledger,
  the owner's to trim.
- **A square has its corners cut off where the path may step diagonally**
  (Classic and Edges), so the two square boards are told apart at a glance.
- **Compatibility**: no params encoding moves. A mode letter names the board
  it always did, and a string that names no mode still decodes as the
  Rectangle with diagonals. Titles change ("Ascent: 6x8 Honeycomb Normal" is
  "Hex: 6x8 Honeycomb Normal").

## What was measured (2026-10-08)

Six boards dealt at each tier of each candidate cell, timed, and graded by the
lowest solver cap that solves them. Every board needed exactly the tier it was
dealt at. Slowest worst cases among the candidates: Honeycomb 8x10 Hard
147 ms, Orthogonal 8x10 Hard 135 ms, Hexagon Size 9 Hard 80 ms; the boards
the menu kept are all under 50 ms. Upstream
started its hexagonal presets at Normal; Easy deals and binds on all four.

Every game's menu was counted: Loopy 25, Unequal 23, Ascent 18, Seismic 16,
Salad 15, and no other over 12.

## Capabilities

### Modified Capabilities

- `ascent`: its rulesets, menu, dialog fields and cell outlines.
- `engine-params`: a cap on the whole menu.
