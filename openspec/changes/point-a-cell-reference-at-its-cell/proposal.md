# Proposal

## Why

The owner (2026-10-28), on a Keen strike step: *"sometimes a reference to a
cell actually links to just a single value in it."*

Keen `4dx:_a_a_aac_6aa,m8a5s1s1a5m4s1`, Hint and Apply the hint until the
step reads "No way to make this cage multiply to 4 puts 4 in this cell, so
the 4 must go". Pressing the pill "this cell" draws its leader to the X on
the struck 4, the same pixel "the 4" points at. The words name a cell; the
board answers with one note.

This is by design today, and the design is the engine's, so every candidate
game's strike step does it (Keen's cage steps, Unequal's signs, the wing):

- `make-rings-round` D6 (owner, 2026-10-26) made a struck note a strike, and
  "no ring is drawn round a struck note, and a struck note no longer rings
  its cell". `NOTE.within` (`src/engine/hint-words.ts`) makes a mark on a
  note mark its cell: "a struck note's ring is its cell's". So "this cell"
  has no mark of its own, only the strike inside it.
- A pressed pill's leader goes to the nearest pixel its marks hold
  (`nearestMarked`, `src/puzzle/mark-flash.ts`; D8 of the same change), and
  the only pixels "this cell" holds are the X's.

## What Changes

- A reference that names a cell points at the cell when pressed: its leader
  ends on the cell, and what it flashes is the cell, not one note in it.
  Whether the cell then carries a visible mark of its own at rest, or only
  while its pill is pressed, is the owner's to choose from a comparison in
  the app; D6's decision that a struck note is not ringed stands either way.
- A guard over the candidate walks: a pressed cell reference's leader ends
  inside its cell's box and outside every note's.

## Impact

`src/engine/hint-words.ts` (`within`), `src/puzzle/mark-flash.ts`, the
candidate games' strike steps (every game on `candidate-plan.ts`), and
`engine-hints`.
