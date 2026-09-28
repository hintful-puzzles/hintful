# retire-the-ladder-oracles

## Why

Owner, 2026-09-28: *"please delete any old code that's just used for reference;
that's what git is for."*

Every game that adopted `runDeductionFixpoint` kept the hand-written loop it
replaced, callable only from its `<game>-ladder.test.ts`, which compared the
two at every cap. Thirteen games carried one. The comparison earned its place
during each adoption, when it was the proof that re-plumbing changed nothing;
once it passed, the old loop was a second copy of the solver that no player
path runs, kept in step with nothing, and read by every future edit to the
solver file.

The same shape sat in `run-length.test.ts`: Palisade's pre-extraction encoder,
kept as the fuzz oracle.

## What changes

- The thirteen legacy loops, and whatever only they used, are deleted.
- `engine/testing/ladder-equivalence.ts` becomes `ladder-census.ts`: each game
  walks its corpus at every cap and asserts which rungs fired, with the
  `unreached` ledger as before. The census is the half that stays meaningful
  without an oracle, and several plants were caught *only* by it (ABCD's runs
  rung, Tents' diagonal pair, Separate's walled-apart).
- `run-length.test.ts` pins the bytes at every run boundary and fuzzes the round
  trip instead of comparing against the old encoder.
- `docs/games/solver-and-generator.md` § "Proving an adoption" now says to
  compare against the old loop while adopting and delete it in the same change.
- The five specs that required the oracle (ABCD, Pearl, Solo, Tents, Separate)
  require the census instead.

Not in scope: the upstream C under open changes' `reference/` directories. Those
are inputs to work not yet done, and the owner asked to keep them.

## What replaces the oracle

Per game: the firing census, plus the frozen differential where the game has one
(all five spec'd games do), which is what says a refactor moved a board.
