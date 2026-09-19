# bound-loopy-note-journeys

## Why

`order-hints-from-the-frontier` moved each of Loopy's notes to the firing that
cites it, and that made the notes arrive with their consumer: 24.1% of notes did
before, 80.9% after. It also concentrated them. `firstUse` puts every fact a
firing cites onto that firing, so a firing citing many previously-uncited facts
opens one long journey: **hint 112 of the 10×10 Hard replay is 55 legs**, 54 notes
and then one line (`order-hints-from-the-frontier/findings.md` § 6.1). Nothing
bounds it.

A journey is walked, one leg per press, not dumped, so 55 legs is roughly a minute
under Auto-Hint rather than a wall of moves at once. Whether it *reads* as a long
chain or as a wall is the owner's call, and the earlier change filed it open for
that reason.

The residual 19% of notes still placed where the solver found them waits on the
same answer. Those are the notes whose sentence names which edges are still open,
and placing each at the latest position its sentence still describes would
concentrate notes onto their consumers even harder.

Carried from `sequence-hints-in-cell-games` §3–§4, where it had been scheduled
beside the cell-game ordering it shares nothing with.

## What changes

Gated on the owner's read of a long journey in the running app:

- **If a long journey reads fine**, nothing is bounded, and the residual notes
  move to the latest position their explanation still describes.
- **If it reads as a wall**, either cap a journey or spread a note back across
  the firings between its discovery and its use, saying what the player sees
  instead. The widened placement then follows under whichever bound is chosen.

## What this does not do

- **Not the extraction of Loopy's note placement into the engine.** One member,
  no shared fact graph (`sequence-hints-in-cell-games` D5). The trigger is a
  second game recording derived facts as notes.
