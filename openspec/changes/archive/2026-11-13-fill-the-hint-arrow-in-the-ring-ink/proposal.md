# fill-the-hint-arrow-in-the-ring-ink

**Status: filed 2026-11-13, from `reword-the-netslide-hint`, as the engine's
finding.** Player-visible (how a hint's control looks), so its result goes to
the owner before it is archived.

## Why

The owner (2026-11-13) on Netslide's hint: a ring round the arrow to click, with
the arrow drawn again inside it, is more than is needed; "just turning it blue
is enough". Netslide now fills the arrow in the ring ink
(`GameDrawing.drawRingInkPolygon`) and rings only the tile.

Sixteen draws its hint arrow the old way: `drawRing(square, …, { inside: arrow })`
for a `"ringed"` fill (`src/games/sixteen/render.ts`). It has the same circle
and the same doubling risk, so the same reasoning applies. The other
`inside:` users (Twiddle's rotation shape, Tracks' pill) draw the move's shape
for a cell, which a ring round the cell still needs; this is not about them.

## What Changes

- Find every game whose hint rings a control (an arrow, a button) and draws the
  control inside the ring. Query: `drawRing(` with an `inside:` that draws a
  border control, over `src/games/*/render.ts`; state the count and the sample.
- Draw that control with `drawRingInkPolygon` and no ring, as Netslide does,
  where the control is a polygon; ask the owner for any control that is not.
- Say in `docs/hints-marks.md` § "Echo the move's shape in the hint color" when
  to ring and when to fill a control: a control the player presses is filled,
  an element the step acts on is ringed.

## What it must not become

A per-game exception list in `mark-shape.ts`: the recorder flags the op
(`hintControl`) and the guard reads the flag.

## Acceptance

Each game found shows the arrow filled blue with no ring and no leftover
outline when the hint moves on, seen in the running app.
