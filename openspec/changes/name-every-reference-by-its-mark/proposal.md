# name-every-reference-by-its-mark

**Status: filed 2026-10-19 by `show-what-a-hint-names`, as the engine's**, on
the owner's decision.

## Why

A hint has to read against the board without a press. The owner, of a
Tracks hint ("No track here means none below either, but this column can
spare just one more empty, so this must carry track"): "before, it was
possible to look at the hint against the board and understand what's going
on, but now it's impossible without clicking." Two shapes of reference make
it so:

- **Bare deixis**: "here", "this", "it" as the whole of a reference, beside
  other marks, so nothing in the words says which mark is meant.
- **A clause as the pill**: "means none below either", "can spare just one
  more empty" (Tracks), "clues need" (Magnets). A pill is pressed for a thing
  on the board; a clause is not one.

Each pill and its marks now share a color of their own
(`show-what-a-hint-names`), which ties them, but color alone carries nothing
for a player who cannot tell the hues apart, and the owner asked to keep
the words: "let's keep those reference words if we can."

## What changes

- **A reference's words are a noun phrase for a thing on the board, and say
  which mark it is**: its role's word ("the outlined 6", "the striped
  column", "the ringed square"), or a value that singles it out where only
  one such thing is marked. `docs/hints.md` § "Keep the narration terse"
  already says so (rewritten with this filing).
- **A guard over every hinting game's steps**, keyed on the `Narration`'s
  references and not a regex over prose: a reference whose words carry no
  role word and are a bare deictic, or whose words are not a noun phrase,
  fails, naming the game and rung. See it fail on Tracks' `sharedFate`
  rungs before trusting it.
- **Each game the guard names is reworded**, within the length walk's limit
  where it can be; a sentence that needs the room is ledgered with its
  reason, as today.
- **The decided mark's word and shape**, the owner's to leave to this change
  ("For the outline word and shape, up to you"). "Ringed" names a square
  band in most games (Twiddle's 2x2 block is "the ringed block" drawn as a
  square), and true circles cannot be drawn from the engine: `HintMarks`
  is handed one cell's sides, and 17 games draw their marks themselves
  (census 2026-10-19 in `show-what-a-hint-names`). Choose a word true of
  every game's drawing, or keep "ringed" as the legend's term, and record why.

## What has to be settled

- Which words the guard accepts as naming a mark: the three role adjectives,
  and which values (a clue's number, a color word) single out one thing.
- Whether "this cell", where the cell is the step's only ring, passes: it
  names a thing, and its pill's color is the ring's.
