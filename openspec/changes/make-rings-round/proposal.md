# Proposal: make-rings-round

## Why

A hint says "the ringed square", but almost no game draws a ring. In the
owner's playtest (2026-10-25), Tracks called four short bars on a square's
sides "the ringed ones", and Cube called a square frame "the ringed square"
beside another square frame it called "the outlined square". The two Cube
marks differ only in color, which breaks "color is never the only carrier".
The owner asked for the engine to guarantee, structurally, that a ring is
always round.

The cause is a split of ownership. The engine owns the word for each role
(`MARK_ROLES` in `engine/hint-words.ts`), and each game owns the shape it
draws in the role's ink. The spec itself defines the ring as "a ring of thin
sides drawn on the cell's border", which is a square. A census on 2026-10-25
(`git grep -n HINT_RING src`, then each game's drawing traced) found:

- 3 of 60 game directories draw a round ring: Pegs, Sokoban and Untangle.
- Most draw the rectangular band of `HintMarks.paint` or `drawMarkSides`.
  That band has the same shape as the outline, so the two roles differ only
  in color: every `HintMarks` game, and Cube, Blackbox and Ascent.
- The rest recolor the game's own shape in the ring ink: a line or cross on
  an edge (Tracks, Path, Pearl, Palisade, Separate, Loopy), a span (Bridges),
  a glyph (Signpost, Inertia), or a whole tile face (Fifteen, Sixteen).

## What Changes

- **The engine draws every ring, and draws it round.** A new colorless
  `GameDrawing` primitive draws a ring around an element's box: a circle
  around a square box, and a pill around an elongated one (a domino, an
  edge, a span). It is modeled on `drawHatch`, which already makes stripes
  the engine's.
- **The ring ink leaves the game palette.** `resolvePalette` appends the ring
  ink, as it appends the stripes ink. No game holds `HINT_RING` in a slot, so
  nothing but the primitive can draw in the ring's color.
- **A game's echo of the move is drawn inside the ring.** Today a game shows
  its move's shape (a line or a cross on an edge) in the ring ink. That echo
  becomes an optional painter the ring calls, clipped to the ring's inside, so
  the echo can never stand in for the ring.
- Every game and both skeletons move their ring role to the primitive. The
  outline keeps its rectangular contour, so the two roles differ in shape as
  well as color.
- **The owner decides the shape on sight** (open question in `design.md`): a
  ring around a square cell that holds pencil notes either crosses the corner
  notes, spills onto the neighbors, or is a strongly rounded square.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `engine-hints`: the ring is a round mark drawn by the engine; the
  requirement that the acted-on cell is "a ring of thin sides drawn on the
  cell's border" changes; a piece is one round ring around it.
- `app-shell`: "The engine colors every hint mark" names the ring ink as the
  engine's, appended to every palette, as the stripes ink is.

## Impact

- `engine/game.ts` (`GameDrawing`), `puzzle/drawing.ts`,
  `engine/testing/recording-drawing.ts`, `engine/color/color-mkhighlight.ts`
  (`resolvePalette`), `engine/color/palette.ts`, `engine/midend.ts`
  (`hintInkIndices`).
- `engine/hint-mark.ts`: `HintMarks` keeps the outline's band, and its target
  role draws through the new primitive. Also `engine/edge-hint.ts` and
  `engine/border-grid-render.ts`.
- Every game's `render.ts` and the two skeletons: the `COL_HINT` slot is
  removed, and the ring is drawn through the primitive.
- Render snapshots across the collection are rebaselined.
- `docs/hints-marks.md`: "Shade vs ring", "A mark on something that is not a
  cell", "A piece is ringed as one shape" and "The engine colors the marks".
- No save, preference or game-ID format changes.
