# move-seismic-onto-the-candidate-walk

**Status: done — go.** Owner-requested, 2026-09-25. Measure before building: the
outcome may be "not worth it", recorded. It was worth it; design.md has the
decisions and the measurements.

## Why

Seismic is a pencil-notes game whose hint plans without the shared walk
(`runCandidatePlan`). Its `buildSteps` in `seismic/hint.ts` (420 lines,
2026-09-25) writes its own populate (`populateStep`), its own obvious clean
(`obviousCleanStep` over its own marks), its own firing loop, and does not take
the `HintFrontier`. So it gets none of what the walk now owns, and in particular
not the player's "Hints pencil in" choice (`examine-implicit-candidates`): it
always pencils every candidate in first, and it has no auto-pencil preference
either.

What kept it off the walk is recorded in `docs/games/hints.md` § "Deduce from the
notes when the mistake check vouches for them (Seismic)": **a placed value's reach
depends on the value** (a 3 rules out 3s three cells along its row and column),
which `regionsOf` cannot express. The walk reads regions in three places, and
each would need the value-dependent form: the implicit view (`impliedNotes`),
the placement cull (`regionDuplicateMarks`) and the obvious clean
(`obviousCandidateMarks`).

## What to settle

1. **The hook.** Is "what a placed value `n` at a cell rules out" a clean
   replacement for `regionsOf` in those three places, alongside it (regions stay
   for the hidden-single classifier, where Seismic's areas are the regions), or
   something the game supplies as a function of `(cell, n)`? Rome already passed
   a per-cell `NoteEncoding.all`; this is the cull's analog.
2. **Seismic's rungs as the walk's.** Its three finders (singleton, hidden
   single, starved area) against the walk's ladder (naked singles, own rungs,
   recorded strikes, placements). Seismic has no recording solver: its finders
   deduce from the notes. Decide whether they become own rungs over the notes, or
   Seismic gains a recorder.
3. **Measure the reading.** With the walk in place, the same table as
   `docs/games/hints.md` § "Two readings of an unmarked cell" for Seismic, and a
   default from it. The value-dependent reach makes a note-less cell's implied
   candidates harder to read at a glance than a row/column's, which is exactly
   what the table's second column is for.

## If it goes ahead

- Seismic's `Ui` carries `candidateReading` and its prefs the shared pref, and
  `candidate-reading.test.ts` enrolls it by that field. Its premise check reads
  `state.grid`/`state.pencil` by `state.w` on a board that is not square, which
  Seismic's state carries (checked 2026-09-25).
- `seismic-hint.test.ts`'s trial-finder guard ("holds the trial finder to what
  `placeNumber` + `regionsViable` reject") must survive the move.
- The populate reading's plans should not change; where they do, say why.

## If it does not

Record the reason in `docs/games/hints.md` § "Two readings of an unmarked cell",
where Seismic is named as populating first, and archive this change with the
finding.
