## Context

The proposal's table, checked in the app on 2026-11-23: Boats' left drag
filled its first square only, its right drag watered along one row, and its
water was a plain blue wash, as the code read. Pattern's, Tents' and
Kakurasu's drags run through the same two code paths (`stroke: sweep` and
`stroke: line` in `engine/fill/play.ts`), so they were read from the code.

## Decisions

### The one drag is the fill engine's own: press, preview, one edit on release

Two mechanisms carried the fill games' drags: the engine-wide sweep
(`input/target-verb.ts`), which makes a move at each square as the pointer
reaches it, and the fill engine's line drag, which keeps a `GridDrag`,
previews, and makes one edit on release. The line drag is kept and given a
second path, the cells the pointer passes; the sweep leaves the fill games.

- Tents' link drag and Sticks' lines need the line drag: a link is made on
  release from where the drag ends, and a Sticks line takes its value from
  the way the drag runs, neither of which "repeat the press" can say.
- Tracks' square drag, the hand-written game nearest a born one, is the same
  shape (a `GridDrag` along a line, previewed, one move), so the born Tracks
  takes `straight` and keeps it.
- The sweep stays the engine's drag for hand-written games and marks
  (`dragMarkVerbs`); the fill games leave `target-verb-sweep.test.ts`, whose
  population is the games that declare one. Their drag is tested in
  `fill/play.test.ts`, through the engine both paths share.

The drag's Controls sentence is generated from `play` (`TargetVerbs.drags`,
which `controlsMarkdown` reads where a game declares no sweep), so no help
page writes it.

### What the one model keeps, and drops

From the hand-written Boats (`git show 0c15e5b38~1:src/games/boats/index.ts`)
and Tracks:

- **Kept**: a drag that never leaves its square is its button's click; the
  axis is chosen at each drag event, the coordinate that moved less going
  back to the start; a release off the board commits nothing; a drag the
  board changed under commits nothing.
- **Dropped**: Boats' right drag turned every square of the line to water,
  boats included ("from `*`"). Now it turns only the squares that held what
  the pressed one held, as every fill game's drag does; Ctrl with an arrow
  still waters over boats.
- **Not the engine's**: Tracks' left drag lays rails from a square that
  carries track and marks squares from one that does not. That is two kinds
  of target, Tracks' own, and stays in Tracks when it is born.

### Which games are straight

The rule: straight where the clues are numbers on rows and columns, or the
values are lines; free otherwise. `fillInput` refuses a game whose values are
lines without `straight`.

| Game | Drag | Why |
|---|---|---|
| Boats, Kakurasu, Pattern, Tents | straight | clues on rows and columns |
| Sticks | straight | values are lines |
| Bricks, Clusters, Light Up, Mosaic, Norinori, Range, Singles, Star Battle, Unruly | free | clues in cells or regions |

Light Up keeps `sweepWith: secondary`: a row of lights is never right and a
free drag makes one by accident easily, and the option costs one line in
the drag.

### Boats' water

The player's water is drawn with the engine's ruled-out cross on the sea's
wash, and given water with waves alone: a painter's `given` now draws in
place of its `paint` on a fixed cell, so the cross never lands under the
waves. `sea` is the only painter with `given`.

## Found on the way

- A synthetic drag whose first move comes instantly after the press loses
  that move: the view takes the press asynchronously and drops moves until
  it is tracked (releases are parked and replayed). A real pointer's first
  move is a pixel or two; the engine samples between the events it gets, so
  nothing is skipped but the corner a dropped event would have turned.
