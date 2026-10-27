# Proposal: rectangular-presets

## Why

The owner (2026-10-23), of Path's menu and then of every game: "please make
about half the presets be rectangular (I actually want this across all games
that support rectangular boards)". A phone held upright fits a tall board
better than a square one, and a rectangle is a different puzzle to plan
across. Today most games that take any width and height offer only squares.

## What Changes

- A game whose board may be any width and height offers at least half its
  menu's board sizes as rectangles (rounded down). Path does already
  (`2026-10-23-add-zip-to-path`): Path 6x6, 6x9 and 7x9, Pairs 5x5, 7x7, 8x12
  and 10x15.
- `preset-menu-shape.test.ts` holds every such game to it. Its population is
  derived from what each game accepts, never a list: a game takes rectangles
  where its `validateParams` accepts its first board with the width one or
  two wider (two for a game that needs an even width, as Unruly does).
- Each game below gains rectangles in place of some of its squares, upright
  (taller than wide) as Path's, Inertia's and Range's are, keeping the menu
  within its 18 and 12 lines. Every new size is timed (three deals, cut where
  the tail passes a second, as `docs/mechanics.md` § "The preset menu is a
  grid" says) and asked whether it needs its tier (`difficulty-contract`).
- Census (2026-10-23; re-run before starting): 46 games have a width and a
  height; these 27 offer no rectangle at all: ABCD, Black Box, Boats,
  Bridges, Clusters, Crossing, Fifteen, Flip, Flood, Galaxies, Light Up,
  Mosaic, Netslide, Pattern, Rect, Rome, Seismic, Separate, Signpost,
  Singles, Spokes, Sticks, Tents, Twiddle, Undead and Unruly. The skeletons
  (`src/skeleton/`), which new games copy, should start them right too.
  Fewer than half: Loopy (4 of 18 presets), Mines, Net, Pearl, Pegs, Slant,
  Sixteen, Tracks. Some of these may refuse a rectangle for a reason of their
  own (a Latin square, Twiddle's rotation); the census's probe is crude, and
  each game's own rule is checked before it is changed.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `engine-params`: a requirement that a game taking rectangles offers them.

## Impact

- `src/engine/preset-menu-shape.test.ts`, and each listed game's `state.ts`
  (its `BOARDS`), with its params-stability and capability snapshots, which
  move with the menu.
- A player's remembered board is a params string, which still deals; only
  the menu's lines change.
