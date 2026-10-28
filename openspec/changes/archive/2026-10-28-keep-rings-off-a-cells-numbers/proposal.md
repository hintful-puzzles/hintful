# Proposal

## Why

The owner (2026-10-28), on a Keen hint ring that crossed a cell's numbers:
*"I'm otherwise very happy with the current ring rendering, but we need to
get it right so that it doesn't write over numbers."*

That revises one rule of `make-rings-round` (design D7, owner 2026-10-26): a
placement's ring may cross the cell's own notes, the notes it replaces
(`engine-hints`, "A ring is round, and only the engine draws one", scenario
"A placement crosses only the notes it replaces"). A ring now crosses no
number at all: not a clue, not a neighbor's text, and not the ringed cell's
own notes.

## What was seen (2026-10-28, `c2ab5dfb`)

Keen `4dx:_a_a_aac_6aa,m8a5s1s1a5m4s1`. Press Hint and Apply the hint until
the step reads "Every other cell in this column rules out 3, so this cell
must be 3": the bottom-left cell, its notes 1 2 3 4 under the cage clue
"1−" in its top-left corner. The ring found is not the same at two sizes:

- **Large cells** (the owner's, about 108 CSS px; 138 px at a 1600×1000
  window, dark scheme): a cell-sized rounded square shifted up and left
  until its corner clears the clue. It lies over the board's white frame,
  stops short of the cell's right side, and its stroke runs through the
  notes 3 and 4 (`reference/keen-dark-108px-shifted.png`).
- **Smaller cells** (87 px, a 1280×720 window, light scheme): a small circle
  round the note 2, which reads as "the 2" while the step places a 3, and is
  not the whole-cell ring D7 promised a placement
  (`reference/keen-light-87px-note-circle.png`).

Both are what the search was built to do. `ringShape`
(`src/engine/ring.ts`) takes the **roundest** shape whose stroke clears the
text it must avoid, may grow into `room` or shift off center for a corner
clue, and on a tie takes the one nearest the box. A circle round one note is
rounder than any cell-sized ring that clears the clue, so where both fit the
circle wins; where only a shifted ring fits, it is taken however far off
center it sits. `drawPieceRing` (`src/engine/hint-mark.ts`) hands it the
cell's notes as crossable on the ringed cell, per D7.

## What Changes

- The ring's search keeps clear of every number, the ringed cell's notes
  included, and prefers a ring that is about the cell (centered, enclosing
  it) over a rounder one about a part of it.
- **First, fit the ring in the padding** (owner, 2026-10-28): a ring
  centered on the cell whose stroke runs in the padding between the cell's
  content (its clue and notes) and its edge, enclosing all of it. Measure how
  much padding each game's cells leave at phone and desktop sizes, and what
  that ring needs, before anything else is tried.
- Only where the padding cannot hold it does the content make room, and how
  is the owner's to see from a comparison in the app. Shrinking a cell's
  notes was measured in `make-rings-round` D6 (9×9 Keen at phone width:
  about 40% smaller, a clue cell's notes become dots).
- The scenario "A placement crosses only the notes it replaces" is replaced.

## Impact

`src/engine/ring.ts`, `src/engine/hint-mark.ts`, the cell text each game
hands its ring (the games that draw rings are the users of `HintMarks`:
`npm run refs -- src/engine/hint-mark.ts HintMarks`; the type
`HintMarkStyle` alone misses most, which build it inline), render snapshots
across those games, and `engine-hints`.
