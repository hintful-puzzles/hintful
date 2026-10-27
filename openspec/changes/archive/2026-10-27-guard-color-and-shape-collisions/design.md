# Design: guard-color-and-shape-collisions

## Context

Render scenarios record every draw op with its palette slot and resolved
color (`engine/testing/recording-drawing.ts`); `color-collide` already
resolves each game's palette and measures each pair's distance; the slots are
named by each game's `COL_*` constants. What no instrument had was the mark a
slot is drawn as.

## Goals / Non-Goals

**Goals:** catch two unrelated things a player must tell apart that share a
color and a shape, in any game, as a gate once the collection is clean.

**Non-Goals:** colors that differ only in hue a color-blind player cannot
see (a separate question); marks of one meaning, which a game declares.

## Decisions

- **Shape from the ops, not from source** (`src/puzzle/mark-collisions.ts`).
  A `line` is a bar by its thickness and length, or a `slash` when it is at a
  slant, so the strokes of a cross are not a wall; a `rect` is a bar if one
  side is at least three times the other, a fill if its short side is at
  least 0.6 of a tile, a block otherwise; a circle is a disc, or a ring when
  unfilled or hollowed by a smaller one on its center; a polygon is a shape
  or outline of so many corners; text by its size. A round-capped line and a
  flat bar are one kind: the owner's case was exactly that.
- **A rim is no mark of its own**, because the fill it edges is what the
  player reads: the outline of a filled circle or polygon, a line drawn again
  along its path by a narrower one (Path's black edge under a colored line),
  a rect drawn over by one inset no more than 2 px on its center (Inertia's
  mine), and a bevel's `darkSwaps` slots. Each of these was a pair in the
  first census, and none was two things.
- **Like size is less than twice the other, in thickness and in reach.**
  Not the proposed 1.5: at Path's preferred tile its ink wall was 3 px and
  its line 5 px, a ratio of 1.67, which 1.5 would have passed. Twice as thick
  is how every grid game tells a border from its grid lines, and a tile-long
  grid line is not a few-pixel shaft.
- **The frames**: the deal, the default preset's board after half the hint's
  solve is played (the hint is played out once to count its steps, then half
  of them again), and that board with its next step shown. The per-game
  render scenarios were not harvested: they are each game's own tests with
  their own setups, and the played board puts the player's marks and the
  board's on screen together in every game alike.
- **A declaration is a ledger in the guard, held exact** (`DECLARED` in
  `mark-collisions.test.ts`), keyed by the game's exported `COL_*`
  constants, not a field beside `colors()`. Nothing in the app reads it, and
  a `Game` field only a check reads is what `docs/doctrine.md` refuses; the
  ledger is the shape `neighbor-contrast.test.ts` already uses, and an entry
  whose pair stops colliding fails. An entry is one meaning, or names what
  the player tells the two apart by beyond the stroke (an arrowhead), which
  the op-level instrument cannot see.

## The census (2026-10-27)

Every registered game, 60 of them, read in about 6 s. In the first pass each
game's frames painted between 5 and 16 of its slots, and the solve took 3 to
122 hint steps.

- The first pass, with the proposed rules, reported 18 pairs. Reading each
  op behind them gave the refinements above: crosses against walls (Star
  Battle, Tracks, Light Up), 2:1 border against grid (Crossing, Guess, Rome),
  rims (Path's edge, Inertia's mine, Pearl's and Netslide's outlines), polygons
  of different shape (Sixteen) and bevel pieces (Slide).
- After them, 5 pairs, all declared and none a defect:
  - Dominosa, Mosaic, Sticks: one number in ink on an open cell and in white
    on a dark piece, which the dark scheme lightens alike.
  - Galaxies: an arrow's shaft against the ink grid in a black dot's region;
    the arrow has a head and sits inside a cell.
  - Untangle: an edge against the play area's frame; an edge ends at a vertex
    at each end.
- The plant: Path's `COL_WALL` back to `INK` is reported as Path's slots 4
  and 33, bars 5x21 and 3x40, under each refinement in turn.

## Risks / Trade-offs

- [The size factor flags too much or too little] → set against the report,
  above; the Path plant fails the gate, and ink text beside an ink grid does
  not (the classifier's unit test).
- [A frame never shows a pair together] → the guard requires at least three
  painted slots per game, and the module counts which slots the frames drew;
  a slot only a drag, a mistake or the flash brings out is not covered, as
  `docs/rendering.md` § "When a palette guard names your game" says.
- [Declarations become a dumping ground] → every entry carries a reason a
  reviewer can check against the game, and the ledger is held exact.
