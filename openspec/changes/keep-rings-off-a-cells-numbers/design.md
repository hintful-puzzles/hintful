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
- Wider gutters between cells, so the room grows instead, cost the notes
  about as much as B at the same window size, and thicken every grid line.

Recommendation: B, with the padding ring tried first, so a game whose text
already leaves room changes nothing.

## Decisions

### D1. The ring encloses the ringed cell's notes

`drawPieceRing` hands the ringed cell's notes to the ring as text it
encloses, not text it may cross. `CellText.notes` stays apart from
`enclose` only because a neighbor's notes are avoided, not enclosed.

## Found on the way

- Mosaic's 50×50 preset on a 340 px board (5 px cells) throws "No round ring
  fits" on its first hint frame. The ring search changes in this change, so
  it is checked again after 2.1, at phone width.
