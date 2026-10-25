# Design: make-rings-round

## Context

The census in `proposal.md` (2026-10-25) is the starting point. The engine
owns the ring's word and colors its ink, and each game draws the ring's
shape. Stripes already have the structure this change wants:
`GameDrawing.drawHatch` takes no color, and `resolvePalette` appends the
stripes ink to every palette, so no game can draw stripes in any other way.

## Goals / Non-Goals

**Goals**

- A mark in the ring role is round in every game.
- That follows from the API, not from a sweep: a game has no way to draw in
  the ring ink except the engine's ring.
- Ring and outline differ in shape, so neither is told apart by color alone.

**Non-Goals**

- The outline keeps its rectangular contour and its band. Stripes are
  unchanged.
- The role words stay "ringed", "outlined" and "striped".
- The cross-game color-and-shape collision guard is
  `guard-color-and-shape-collisions`'s.

## Decisions

### D1. A colorless ring primitive

`GameDrawing.drawRing(box: Rect, clear: Rect, thickness: number, inside?:
(ink: number) => void)`:

- It strokes the roundest shape fitted to `box` that clears `clear` (D5):
  a circle or a pill wherever the content allows.
- It strokes in the ring ink at `thickness`. The ink is the palette slot that
  `resolvePalette` appends.
- `inside`, if given, runs clipped to the shape's interior and receives the
  ring ink's index. This is the only way a game can draw in that ink, and
  what it draws there is inside a ring. A game uses it to echo its move's
  shape: Tracks' line or cross, Bridges' span.

Alternatives rejected:

- **A guard that every op in the ring ink is round.** It is a sweep that
  reads frames, and a frame the scenarios never draw escapes it. The
  primitive makes the wrong shape unwritable.
- **Letting the word follow the shape** ("the boxed square"). The owner asked
  for the opposite. It also leaves ring and outline as two square shapes in
  most games.

### D2. The ring ink leaves the game palette

`resolvePalette` appends `[HINT_RING, HINT_STRIPES]`, and `drawRing` and
`drawHatch` index them from the palette's end. `hintInkIndices` derives the
ring slot from the same place. `HINT_RING` stops being exported to games.

`resolvePalette` throws if a game's own slot holds the ring's color. That
makes the ring the only thing that can carry it, and is a guard on the
palette rather than on frames. If a game holds that color for a meaning of
its own, the census in tasks 1.3 finds it, and the game changes its color.

### D3. Pieces and non-cell elements

| Element | Box handed to `drawRing` | Shape |
| --- | --- | --- |
| A cell | the cell's box | a circle |
| A straight piece (domino, a 1×n run) | the union box | a pill |
| An edge | a box around the side, as long as the side and a fraction of a tile thick | a pill |
| A span (Bridges) | the span's box | a pill |
| A note | the note's box | a small circle |
| A dot, a peg, a vertex | a box around the object | a circle, as Pegs and Untangle draw today |

A piece that is not straight (a SameGame group, a Tracks bend) gets one ring
per square. It is honest, as the outline's scattered rings are. The
alternative, a contour with rounded corners, is not round. `joinTargets`
remains the signal for a straight piece, and `HintMarks` decides straight
versus not.

### D4. `HintMarks` keeps the outline band and rings through the primitive

The target role of `HintMarks.paint` calls `drawRing` instead of
`drawMarkSides`. In a game whose band has an `outer` part, the ring is not in
the gutter, so `eraseBeforeTiles` erases only evidence. The ring then sits
inside the cell and is undone by the cell's own repaint, which the
`OverlaySidecar` already triggers when the overlay changes. Games with
`joinTargets` key on the target's piece and no longer on its sides.

### D5. The owner's choice: as round as the content allows, never over it

The owner chose on 2026-10-25, from drawn alternatives (an inscribed circle,
a circumscribed circle, a rounded square): *"Definitely C, but ensure it does
not cover any digits/text, by adding padding as needed, but keeping roundness.
If it can't be made round without covering content, then it shouldn't be a
ring there."*

So `drawRing` takes the element's box and the box its content may occupy
(`clear`). It strokes a rounded rectangle inside the element's box, with the
**largest corner radius that keeps the stroke and the app's edge
(`MARK_EDGE_PX`) off `clear`**, up to half the short side. An empty or
centered-glyph cell therefore gets a circle, and a cell of corner notes a
rounded square. Below a floor of roundness, a radius of a third of the short
side, it throws and names the box. That throw is the structural half of
"then it shouldn't be a ring there":

- A game whose element cannot clear its content at the floor either pads
  the content (it insets its notes), or marks that element with another
  role and says so in other words.
- `clear` is the area content *may* take (a game's note grid, its glyph
  box), not what a frame happens to show. So one game's rings keep one shape
  from frame to frame, and the throw is reached by the first frame that
  rings the element, not only by the frame with the fullest cell.

## Risks / Trade-offs

- **Render snapshots across the collection rebaseline.** The diffs are
  verified by shape, which means a ring op where a band was, and the app is
  run per kind of element.
- **A candidate game's notes may need to move inward** to clear the floor
  (D5). That is a layout change in each such game, and it is run in the app.
- **Echoes inside a ring are smaller than today's recolored shapes.** An edge
  pill is thin, and a cross inside it may be hard to read. Edge games are run
  in the app before the change is called done.
- **The tile caches of games with an `outer` band.** If the ring leaves the
  gutter and the erase pass goes with it, a stale ring could survive. Every
  `outer` game is played with a hint moving between cells.
