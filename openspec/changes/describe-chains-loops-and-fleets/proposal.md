# describe-chains-loops-and-fleets

**Status: filed by `describe-cuts-chains-loops-and-fleets` (2026-11-02)**,
which split at its start and took Range. The rest of step 8 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"). It files step
9, `describe-edges-and-divisions`, when it is archived, or the part of itself
it splits off first.

## Why

Rome, Slant and Boats each run a hand-written ladder beside a description
that states only its help. What they read that the language lacks (the
catalog's survey, `design.md` § "The constructs"): more of C (a chain along
Rome's arrows, acyclic over Slant's border vertices, Boats' components and
fleet); a direction step (Rome, Boats); border vertices (Slant); relation
marks (Slant's alike and v-shapes); and L or a restatement where a rule is a
look. `ray(c, n)` exists and the checker reads it (Range).

## What Changes

- **The rest of C, a direction step, border vertices and relation marks**
  in the description language, the ladder runtime and the checker, as far
  as these games read them.
- **Each game's ladder stated**, its tiers as it grades them, and its
  hand-written rungs retired. Boats' `hint-solver.ts` is a second ladder; a
  description makes the two one. `engine/firing-replay.ts` retires if Rome
  was its last reader outside the engine.
- **Split at the start** if the session finds the step too large, as steps 7
  and 8 split by game: the proposal is re-scoped to what it takes, and the
  rest filed as a change of its own. Rome is the cheapest to take first: its
  answer and marks fit today's `Marks`.

## Acceptance

Each game runs its compiled ladder for its hint and its generator's grading;
the hand-written rungs removed; every technique checked sound; the boards
dealt, their tiers and the hint walks compared with HEAD and each difference
reported, with which saves or links no longer load; the guides updated; the
next step filed.

## What steps 7 and 8 learned that binds here

- Record the comparison at HEAD before any code moves: a scratch
  `src/scratch-*.test.ts` that deals every preset at several seeds and walks
  each hint to the end by its first step, writing desc, deal time, both
  grades and every step's rung, move and words as JSON to the session's
  scratchpad; run it again after, and diff by each square's final mark and
  rule, keyed by what a move decides, not by step count. Range's whole
  comparison ran in seconds.
- Time large boards back to back with HEAD, from a worktree of HEAD in the
  scratchpad: Range's presets moved by milliseconds while 10×118 first went
  3.6 times slower, and a profile (`node:inspector/promises`' `Session` in a
  scratch test) named the cause.
- **A set of numbers is a 32-bit mask.** A position along a line is a
  number bound by `range`, which counts; read as a set it holds nothing past
  31 (`docs/descriptions.md` § "The formula syntax").
- `place` on a cell already holding a value is no fact and no
  contradiction, so a technique states its guard (`value(p) != 1 and
  place(p, 2)`, Range's `besideShaded`) where the search beneath it must see
  a broken position before the board is full.
- `connected(S)` and `cuts(S)` exist; bind `cuts` once by `=`.
- A hand-written cascade a hint showed as steps of its own is a rung at the
  top of the ladder, not `on: place`, which folds it into the placing step
  (Singles' `besideCovered`, Range's `besideShaded`).
- An upstream else-if chain is one technique whose conclusion is the chain
  (`(not A or P) and (A or ...)`, Singles' `corner`); split into techniques,
  every first reading runs before any second.
- Two readings a hand-written scan interleaves are one technique bound by
  the clue (`docs/descriptions.md` § "A statement's order is behavior"),
  unless the order change is the plan's accepted one, as Range's was.
- The checker reads marks the game never reaches; a technique that leans on
  the game's placements is unsound there, and the statement states the
  guard. It cannot divide a count it does not fix.
- A plant must apply on the smallest board checked (order 3): a plant that
  binds nothing there is called sound and fails the run.
- A definition is computed at each read, so bind a term read more than once.
- A library name must be spelled apart from every name a description
  defines; grep the descriptions and `compile.ts`' names first. A plant is
  keyed `<game>.<id>` where another game states the id.
- A generator that lays its answer while deducing runs the same ladder on
  the board it is laying, where only the techniques that read nothing yet
  dealt can fire.
- A MODIFIED requirement cannot drop a scenario that is now false: REMOVED
  the requirement and ADDED its successor (Range's hint order).

## Figures to re-check

Measured on `describe-cuts-chains-loops-and-fleets`' last commit
(2026-11-02), solver and hint files: Rome `solver.ts` 938 and `hint.ts` 313;
Slant `solver.ts` 904 and `hint.ts` 802; Boats `solver.ts` 1,026 and
`hint-solver.ts` 1,407. `firing-replay.ts` is imported by Rome, Seismic and
Solo among the games. Re-measure before designing against any of these, and
record the HEAD baseline at the session's start.
