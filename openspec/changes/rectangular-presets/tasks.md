# Tasks

## 1. The rule

- [x] 1.1 Re-run the census (games with width and height, distinct sizes, rectangles among them, whether `validateParams` takes one or two wider) and compare it with the proposal's; record the date
  - 2026-10-27: 46 games have the dimension pair; all take one wider but Slide (whose menu is all rectangles) and Unruly (two wider). 28 fall short: the proposal's 27, and Net (1 of 5) and Pearl (1 of 4). Counted by distinct sizes and rounded down, Loopy (4 of 8), Mines (1 of 3), Pegs (3 of 6), Sixteen (2 of 5), Slant (1 of 3) and Tracks (2 of 5) already pass. The games with no pair are square by rule (`SQUARE_GRID`) or sized by a shape of their own (Cube, Dominosa).
- [x] 1.2 Add the requirement's check to `preset-menu-shape.test.ts`, population derived as the design says; see it fail on the census's games, and pass on Path
  - `rectangleShortfall` and `takesRectangles` in `engine/testing/presets.ts`; it failed on exactly the 28 and passed on Path. A floor holds the population over 30, so a renamed dimension field cannot empty it.
  - Two instruments read a board's width as `state.w` or the square root of its cells, which is wrong on a rectangle without `w` (ABCD's 5x7 read as six wide, and the frontier guard counted jumps that were not there). `boardWidth(game, params)` now gives `candidate-reading.test.ts` and `plan-continuity.ts` the width from the params, and an unknown width throws.

## 2. The games

- [x] 2.1 For each game the check refuses, choose upright rectangles in place of some squares, time three deals per tier, and run `difficulty-contract` with the slow tier on; the game's tests pass and its menu reads well in the app
  - Each replaced square became an upright board of about its area. Cut by timing (2026-10-27): Crossing offers Unreasonable up to 120 squares (11x13 took 1.4 s); Clusters offers Normal up to 81 (8x10 and 9x11 near 2 s, the old 10x10 10 s); Sticks' 10x10 (2.3 s) gave way to 8x10 (0.6 s). Light Up's 12x16, Seismic's 7x9 and Spokes' 5x7 tails pass a second at their hardest tier, but each is quicker than the square it replaced.
  - Spokes' default stays upstream's 6x6 Easy, written out, since a shared ID's missing fields are read from it.
  - Rome's 8x10 found a 122-character `opposite` narration; ledgered in `hint-quality.test.ts` with why it needs the room.
  - The modifier check counted sizes by the width field alone (Netslide's 4x4 and 4x6 were one size); it reads the size label now.
- [x] 2.2 The skeletons' menus offer rectangles; `skeleton.test.ts` passes
  - grid 7x9, edges 6x8 (its loops need both sides even; a 7x9 preset spun its generator). Checked with `rectangleShortfall` and a `paramsError` sweep of every preset in the collection.
- [x] 2.3 Read each moved params-stability and capability snapshot: only menu lines move, no params string

## 3. Verification

- [x] 3.1 The menu-shape check passes for the whole collection
- [x] 3.2 Open the Type menu of three changed games in the app, on a phone-sized window, and deal a rectangle of each
  - ABCD (menu, then 6x9 from it), Clusters 6x8, Unruly 12x16 at 390x844: upright, filling the width. ABCD's 5x7 opened turned, as the midend turns a deal whose turned board takes a larger tile.
- [ ] 3.3 The gate, green

## Workflow follow-up

- Commit a few games at a time, push, archive
