# share-the-note-mistake-check

**Status: scaffolded, not started.** Found 2026-09-28 during
`cover-hints-in-help-and-guard-tile-flags`, while writing Group's help section.

## Why

**Group's Check & save ignores a pencil mark that has crossed out a cell's
answer, and its hint reasons from that mark.** Its `findMistakes`
(`src/games/group/index.ts`) checks placed entries only, and its mistake type is
a bare `Point` (`GroupMistake` in `state.ts`), so there is no "note" mistake for
its renderer to draw. Its hint runs through `candidateHint` over `state.pencil`
(read 2026-09-28), so a wrong mark is a premise: the hint can narrate a
deduction from a mark that has already excluded the answer, instead of refusing
and pointing at it as every sibling does.

**The layer below is the defect.** The same loop — for each cell the player can
change, a wrong entry is a `cell` mistake, and an empty cell whose marks are
non-empty and exclude the answer is a `note` mistake — is written out by hand in
each game whose `findMistakes` emits `kind: "note"` (take the population with
`rg -l 'kind: "note"' src/games`). They differ only in how a note bit is spelled
(`1 << answer`, a `bit(answer)` helper, or the answer already being a mask) and
in what "the player can change" means. Group is the copy that dropped half of
it, which is the failure a hand-copied loop invites.

## What

- An engine helper that owns the loop, with the game supplying the solved
  answer, the entry and note arrays, the note-bit spelling and the fixed-cell
  predicate; adopt it in every game that writes the loop, Group included.
- Group's mistake type gains the `note` kind, and its renderer draws a note
  mistake the way its Latin siblings do (read theirs; do not invent a look).
- Group's help page (`help/games/group.md` § "Hints") currently promises the
  refusal only for a wrong entry, because that was true; widen it to marks once
  this lands.
- Test: a Group board with a mark set that excludes the answer is flagged, and
  its hint refuses. Prove it red against today's `findMistakes` first.

## Before starting

Re-read the population: the loop's shape is from a reading of seven Latin
games plus Crossing, Undead and Rome on 2026-09-28, and games outside the Latin
family (Seismic, Slant, Loopy) also emit `note`, possibly with a different
meaning. Classify each before adopting it, rather than bending one to the helper.
