# Design: keep-rings-off-a-cells-numbers

## Context

`make-rings-round` D7 let a placement's ring cross the ringed cell's own
notes. The owner revoked that (2026-10-28): a ring crosses no number. The
owner's first approach is a ring centered on the cell, running in the padding
between the cell's text and its edge, round all of it.

## Measured (2026-10-28, `ebc5ef77` plus a probe in `drawPieceRing`)

Every game that rings cells through `HintMarks` was walked: every gate
preset, boards of 340, 700 and 1100 px, up to 80 hint steps each, a ring
recorded wherever the ringed cell shows notes or a clue. For each ring: does
a centered ring at least `RING_MIN_ROUNDNESS` round, its stroke inside the
`room` the game repaints (`MarkBand.box` grown by `outer`), go round all the
cell's own text and clear its neighbors'? Where not, by how many pixels the
room falls short, and how far the notes would have to shrink.

| Game | Fits the room today | Short by | Notes would shrink to |
| --- | --- | --- | --- |
| Magnets, Unequal, Solo (Killer clues included), plain Mathrax | every ring | — | — |
| Group | at 68 px and up | 1.75 px at 31 px | 0.74 |
| Keen, a cell without a clue | most | up to 3.25 px | 0.90–0.98 |
| ABCD, Salad, Seismic | none | 1–3.75 px | 0.72–0.94 |
| Towers | almost none | 5–13 px | 0.72–0.84 |
| Mathrax, a cell with clues on its corners | 4 of 25 | most cannot fit at any room | 0.34–0.66 |
| Keen, a cell with its cage clue | none | about half cannot fit at any room: the neighbors' text is in the way | the clue must move too |

A corner clue is where a round ring's corner has to pass, so in Keen no ring
in the room goes round a clue cell's text as it is laid out today, and no
shrink of the notes alone changes that.

## The question for the owner (task 1.3)

The padding ring fits a minority of cells. Where it does not, the cell's text
has to make room. Seen in the app, on the proposal's board (87 px light,
142 px dark) and on 6×6 Keen at phone width:

- **B. Every cell lays its text out inside the ring's room, always.** The
  engine gives the box a cell's text keeps to (`ringContentBox`: the cell's
  box drawn in until its corners clear a centered ring at the roundness
  floor), and each game lays its notes and corner clue out inside it. Keen's
  notes come out at 0.77–0.89 of today's size (17 px become 14 at phone
  width), and the clue keeps its size and moves a few pixels in. A ring then
  always fits round the whole cell. Every board changes, ringed or not.
- **C. Only the ringed cell lays its text out smaller, while the hint
  shows.** Other cells keep today's notes. The ringed cell's text jumps
  when the hint opens and back when it closes. The app finds a reference's
  marks by drawing the frame with and without them, so text that moves with
  a mark is drawn as part of the ring: the prototype shows doubled glyphs.
  Fixing that means a second rule about what a mark may change.

Recommendation: B.

## Decisions

### D1. The ring encloses the ringed cell's notes

`drawPieceRing` hands the ringed cell's notes to the ring as text it
encloses, as it does the value, so `CellText` folds into `RingClear`: a
cell's value and notes are what a ring on it encloses, and all of a
neighbor's text is what it leaves outside.

### D2. The owner's choice: every cell lays its text out for a ring (B)

The owner chose B (2026-10-28) from the comparison above. The engine says
where a cell's text keeps (`ringTextBox` in `engine/hint-mark.ts`, from the
cell's `MarkBand`, so the box and the ring are computed from one band), and
`noteGrid` (`engine/note-taking-cell.ts`) lays a cell's notes out in it, on
every cell and in every frame, hint or not.

The padding ring was to be tried first, so that a game whose text already
left the room would change nothing. The census found no game that could be
left out safely: Solo missed by 0.25 px at 29 px cells, and Seismic and Group
missed at sizes a six-step sweep never reaches. So every note grid of a
`HintMarks` game goes through `noteGrid` and `ringTextBox`: ABCD, Crossing,
Group, Keen, Salad, Seismic, Solo, Towers and Unequal, and Mathrax (D5).
Ascent's path-end numbers, drawn by its own ring, sit in the corners of
`ringContentBox`, at a third of the tile or less where a hex or a three-digit
number needs it.

### D3. A ring on a cell is centered

`HintMarks` asks `drawRing` for a `centered` ring: it may grow or draw in, and
never shifts. A shift is how the search fitted a ring round part of a cell
beside a corner clue, which is the ring the owner saw at 108 px. With D2 a
centered ring always fits, and a game whose text does not leave room throws
in its tests instead of drawing a ring beside the cell.

### D4. A clue does not shrink or move a cell's notes

The owner (2026-10-28), on 9×9 Killer, where a sum cell's notes came out at
about half the size of its neighbor's: "make them all the same, and try to
make the best use of the space available". A sum or cage clue takes the top
of a cell's text box, so a cell with one fits three rows of notes in less
height. Keen and Killer now lay every cell's notes in the part of the box
below where a clue goes, whether the cell has one or not: the notes are one
size across the board, for a given number of notes, and sit on the same rows
as their neighbors'. The clue's ink sits in the box's top-left corner,
reclaiming the strip above the clue's ink that a baseline placement wasted.
At the owner's Killer size (about 74 px cells) the notes are 15 px: about 21
in a cell without a sum before, and about 11 in one with. Salad's balls take
their notes inset, so `noteGrid`'s `sizedBy` gives every square on a board
with balls the size a ball leaves.

### D5. Mathrax's ring passes under its clues

Laid out clear of the clues on a cell's corners, Mathrax's notes in those
cells came out at 0.34–0.66 of the size of their neighbors'. Mathrax already
paints each marked cell's corner clues again over the marks (its evidence
outline passes behind them), so a ring there is hidden under the clue's disc
and the label sits on the disc. The ring keeps no clear of the labels, and
`ringCrossings` does not count text on a filled disc drawn after the ring.

### D6. Mosaic's ring reaches between its neighbors' numbers on a small tile

Mosaic's 50×50 board threw on a hint at every board narrower than 768 px
(measured 2026-10-28 on `ebc5ef77`: tiles of 6–10 px hold no ring round their
number with a 2 px stroke). The owner: a crash is not acceptable. Mosaic now
draws its ring after the tile loop and outside any clip, restamps it every
frame, and repaints the tiles round a ring that goes, as `HintMarks` does for
an `outer` band. Where a ring fits inside the tile (`ringFits`) it is the ring
of before; where none does, it reaches half a tile into the neighbors at a
1 px stroke, between their numbers. On tiles of 6 px or under no step of the
search fits between 3 px numbers, so there the numbers are a pixel smaller.
Shrinking every number until a ring fit inside its tile was measured and
refused: on a phone the numbers went to 0–2 px.

## Found on the way

- Below 5 px tiles (a 50×50 Mosaic on a board under about 260 px, narrower
  than any phone) no ring fits between the numbers, and a hint still throws.
