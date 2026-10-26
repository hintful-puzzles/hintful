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

The ring's color is no game's to hold by name. It was first planned that
`resolvePalette` would throw on a game slot holding that color. The census
(tasks 1.3) refuted that: `DRAG_ADD` is `BLUE`, which is the ring's color,
and Mines, Rome and Spokes hold `BLUE` for meanings of their own. So:

- No game source names `HINT_RING` (`palette-source.test.ts`).
- The ink guard counts only the engine's slot as the ring's
  (`hint-ink.test.ts`).
- The frame sweep holds that slot to rings and what is drawn inside them
  (`hint-mark.test.ts`).

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

The owner added: *"I'm also ok with going a bit outside the referred
elements, like in A and B, as long as it doesn't cover any content there."*

So `drawRing` takes the element's box and `clear`: the text it encloses (the
element's own) and the text it leaves outside (a clue in the element's
corner, or a neighbor's). It strokes a rounded rectangle round the element
and picks the **roundest one whose stroke and edge (`MARK_EDGE_PX`) cross no
text**:

- It may grow past the element's box into `room`, the pixels the game
  repaints when the ring moves.
- It may draw in from the box, or shift off its center, to leave a corner's
  clue outside.
- Among equally round shapes, the one nearest the box wins.
- Below a floor of roundness, a corner radius of a third of the short side,
  it throws and names the box. That throw is the structural half of "then it
  shouldn't be a ring there".

`clear` is the text the frame shows, and a glyph's ink comes from the
engine's `textBox`, which a game calls with the arguments it passes
`drawText`.

### D6. Struck notes are a strike, not a ring

The first pass padded every cell's text so a ring would always fit round it.
Measured in the app on 9×9 Keen at phone width (2026-10-26), that shrinks
pencil marks by about 40%, and the marks in a cage-clue cell become dots.
Ringing the single note instead does not fit either: there, notes are about
9 px tall with 2.7 px between rows, and the thinnest ring with its edge
needs about 3 px.

The owner chose (2026-10-26) **a fourth engine role, the strike**: a note
the step rules out is marked by the line through it, with the word "struck".
It takes a reference color of its own. It is drawn as today's struck note
is, in the note's own ink, and found by the repaint by what it changes. No
ring is drawn round a struck note, and a struck note no longer rings its
cell (`NOTE.within`). Note grids keep their size.

A line through the note was too faint to see over the stripes, in the
note's ink and then in a thicker bar. From a design comparison sheet the
owner chose (2026-10-26) an X in the strike's crimson, drawn by the engine
(`drawStrike`), not by each game. Every X is one size: a digit's width, from
the note size, so a board's Xs match. It is clamped inside the note's cell so
a border never clips it. A struck shape that is not a note, such as Rome's
arrow or an Undead monster, takes one diagonal of it, since a full X reads as
a different piece.

### D7. A placement in a cell of notes rings the whole cell, over its notes

The owner chose (2026-10-26) that when a step places a value in a cell that
shows notes, the cell gets a round ring whose stroke may cross **that cell's
own notes**. The step replaces them all. The clue and any neighbor's text are
still kept clear.

The owner offered this as the fallback for when a ring round the note
cannot clear its neighbors. It is made the rule for every placement in a
cell of notes, so each kind of step has one look, and its words ("this
cell") do not depend on how many pixels a note grid leaves. A game's
`HintMarkStyle.text` therefore names a cell's notes apart from its other
text: crossable on the ringed cell, avoided round it.

### D8. A reference's marks are measured with the canvas's specks cleared

A pressed pill's leader points at the nearest pixel that differs between the
board drawn with the reference's marks and without them. Chrome's GPU canvas
antialiases a line slightly differently as the frame's other paths change,
even with identical draw calls on both sides (measured 2026-10-26). So lines
no reference touches differ in faint runs a pixel wide. On a 2× display
these reached the leader's threshold, and Untangle's "a better spot"
pointed at an edge. `withoutSpecks` keeps only the pixels within two of a
solid core, and a mark with no core keeps every pixel. `willReadFrequently`
would rasterize in software but loses the context in Android Chrome's
worker. Each measured frame is a full repaint, so it does not depend on
which marks a game's draw cache is keyed on.

## Risks / Trade-offs

- **Render snapshots across the collection rebaseline.** The diffs are
  verified by shape, which means a ring op where a band was, and the app is
  run per kind of element.
- **A ring that grows past its element lies in tiles it does not own.** Its
  erase takes the path an `outer` band takes today (`eraseBeforeTiles` and
  the `overlaps` repaint), sized to the ring's own bounds, and a game is
  played with a hint moving between cells.
- **Where text crowds an element, the ring that fits can be a poor mark.**
  On 9×11 Hats Hard, about 20 pair notes the hint itself pencils fan out from
  one dot. Loopy's pair signs are now laid out off edge lines and off each
  other. Even so, two steps there fit only a 4px ring at one end of a pair's
  connector, and a pill that sits beside its edge rather than round it. Both
  are round and cross no text. A floor in `ringShape` on size or on staying
  round the element would make those steps throw again, so it is left to the
  owner whether such a spot takes another mark.
- **A ring that cannot fit throws at play time.** The shapes are judged
  against the frame's text, so a board no test reaches could crash a game.
  The cross-game hint frame tests (`hint-ink.test.ts` and each game's hint
  test) draw every game's steps. A throw found in play is a defect in that
  game's text or its element, and is fixed there.
- **Echoes inside a ring are smaller than today's recolored shapes.** An edge
  pill is thin, and a cross inside it may be hard to read. Edge games are run
  in the app before the change is called done.
- **The tile caches of games with an `outer` band.** If the ring leaves the
  gutter and the erase pass goes with it, a stale ring could survive. Every
  `outer` game is played with a hint moving between cells.
