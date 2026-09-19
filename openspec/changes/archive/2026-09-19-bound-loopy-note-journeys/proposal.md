# bound-loopy-note-journeys

## Why

`order-hints-from-the-frontier` moved each of Loopy's notes to the firing that
cites it, which made the notes arrive with their consumer: 24.1% of notes did
before, 80.9% after. It also concentrated them. `firstUse` puts every fact a
firing cites onto that firing, so hint 112 of the 10×10 Hard replay became one
55-leg journey (`order-hints-from-the-frontier/findings.md` § 6.1), and it was
filed open for the owner to judge.

Walking the replay in the app, the owner stopped earlier, at a 15-leg journey
around move 29, because it **jumped around the board**: its legs visited four
different clues before the line they led up to. Measured on that board (seed
`frontier-squares-10x10-hard-replay-a`, 2026-09-19):

- **23 of 154 notes rode in a journey whose line does not cite them.** They were
  notes whose sentence can go stale ("already give it 2", "only these two edges
  are still open"), left at the position the solver found them, which is wherever
  its whole-board sweep happened to be before the next line. They also pulled back
  the monotone notes they cite. In the owner's journey, 8 of its 12 notes were of
  that kind.
- **Every journey with a jump of four or more edges carried such notes**, and no
  journey without them jumped at all.
- Even the cited notes came out in discovery order, which interleaves independent
  branches of one derivation.

Owner, on seeing it: the journey "looks like a combination of at least 2 smaller
ones, and I think it would be better to present it as such to the player."

## What changes

- **A journey is one deduction.** The notes placed at one plan position split into
  the separate derivations they make (facts joined by what they cite), and each is
  its own journey, ordered a branch at a time. A line resting on one derivation
  arrives as its last leg; a line combining several stands alone after them. A
  note its line does not rest on is never inside that line's journey.
- **A note whose sentence can go stale is placed at the latest position the
  sentence still describes**, walking forward from where it was found towards its
  consumer, instead of staying where it was found (the old task 3.4).
- The `ts-engine` requirement "A note a hint asks for is placed beside the step
  that uses it" drops "a note is part of its consumer's journey rather than a step
  of its own", which this replaces.

Measured after, on the replay board and three more 10×10 Hard boards: notes in a
journey whose line does not cite them 23 → 0; in-journey jumps of four or more edges
28 → 0 on the replay and 36 → 2 across the others; longest journey 55 → 16 legs.

## What this does not do

- **Not a cap on journey length.** Splitting took the 55-leg journey to 16. Whether
  a 16-leg derivation still wants bounding is the owner's read in the app, not a
  number.
- **Not the extraction of Loopy's note placement into the engine.** One member,
  no shared fact graph (`sequence-hints-in-cell-games` D5). The trigger is a
  second game recording derived facts as notes.
