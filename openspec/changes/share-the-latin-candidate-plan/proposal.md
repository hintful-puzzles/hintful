# share-the-latin-candidate-plan

## Why

`candidate-plan-kit` moved the candidate plans' loop into the engine and said
the next new hint would show what the kit still leaves each game to write.
`add-mathrax-hint` was that game. Three of the fourteen lines of its
`runCandidatePlan` call are about Mathrax; the rest are plumbing or the
row/column Latin family's answers, typed out again. Measured against the tree on
2026-09-19 (`add-mathrax-hint`'s `design.md` § 4) — re-measure before designing,
because the population moves.

1. **Two fields say only "this is a plain Latin square".** Four games write
   `regionsOf: (x, y) => rowColRegions(x, y, w)` verbatim and six write
   `singleReason: singleReasonOf`. The second is not a decision: a plan whose
   `regionsOf` returns `RowColRegion` has no other function of that type to
   pass, so it is the *first* question answered twice. The hidden-single
   placement area (`hiddenSingleLine(reason.line, reason.index, w)`) is a third
   copy of the same fact — verbatim in Unequal and Mathrax, inside Keen's and
   Towers' own `placementArea`.
2. **`strikeWords` digs the acted-on cell back out of the marks it was handed.**
   Unequal and Mathrax both compute `{ x: marks[0].x, y: marks[0].y }`. The walk
   has already computed that cell for the step's `targets`. Worse, `marks[0]` is
   *the* cell only because `strikeAxis` keeps a firing inside one cell; a game
   whose axis lets a firing span cells names the wrong one silently. This is the
   defect class `candidate-plan-kit` removed from `reads`, in a second place.
3. **The setup vocabulary's region phrase is derivable, and one game derives
   it.** Keen, Unequal and Mathrax each type
   `cleanObviousText("number", "standing", "row or column")`. Solo, the game that
   could not type an answer, derives the phrase from the regions it declares
   (`joinOr(noRepeatRegionNames(state))`). Three games typed what the plan
   already knows.

**Re-measured 2026-09-20, before the work.** Two of the three findings did not
survive it — finding 2's defect cannot happen, and finding 3's precedent does
not exist — and finding 1's count was low. `design.md` § 6 holds what moved and
why; the sections below are the proposal as written, kept so the correction has
something to be a correction *of*. What shipped is § 6.

## What changes

- **A row/column Latin preset** over `runCandidatePlan` supplying `regionsOf`,
  `singleReason` and the hidden-single placement area, so a plain Latin game
  supplies its recording solver and its words and nothing else. Every game keeps
  the explicit form as a first-class override; Solo and Salad, whose regions or
  values differ, stay on the general entry.
- **The walk passes the firing's cell to `strikeWords`** instead of each game
  re-deriving it, so the evidence a game shades cannot name a different cell
  from the one the move acts on.
- **`cleanObviousText`'s region phrase comes from `regionsOf`** where the
  regions can name themselves, as Solo's already does.

Behavior-preserving throughout. The render snapshots, `hint-resume.test.ts` and
`hint-quality.test.ts` are the net; a moved snapshot is a finding to explain,
not a baseline to refresh.

## What this does not do

- **Not the `Game.hint` / keep-track / refresh wrappers.** Recorded as a no-go
  with its reason in `add-mathrax-hint`'s `design.md` F4: folding them away
  means a game declaring accessors *about* itself to save three three-line
  wrappers.
- **Not the narration.** Sentences stay in each game's `hint-text.ts`.
