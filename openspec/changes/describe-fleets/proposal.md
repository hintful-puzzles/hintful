# describe-fleets

**Status: filed by `describe-loops-and-fleets` (2026-11-06)**, which split at
its start and took Slant. The rest of step 8 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"). It files step
9, `describe-edges-and-divisions`, when it is archived, or the part of itself
it splits off first.

## Why

Boats runs a hand-written ladder beside a description that states only its
help, and `hint-solver.ts` is a second ladder. What it reads that the
language lacks (the catalog's survey, `design.md` § "The constructs"):
components over the marks, their sizes and the fleet they make (C, S); the
king's-move neighborhood (N8, which Star Battle and Mosaic already state);
a look premise where a rule is a look (L); and a direction step where it
reads more than `step`. `connected`, `cuts`, `chain`, `linked`, `through`
and `points` exist and the checker reads them.

## What Changes

- **Components, a fleet and the rest of C** in the description language,
  the ladder runtime and the checker, as far as Boats reads them.
- **Boats' ladder stated**, its tiers as it grades them, and its
  hand-written rungs retired, `hint-solver.ts` with them: a description
  makes the two ladders one.
- **Split at the start** if the session finds the step too large: the
  proposal is re-scoped to what it takes, and the rest filed as a change of
  its own.

## Acceptance

Boats runs its compiled ladder for its hint and its generator's grading;
the hand-written rungs removed; every technique checked sound; the boards
dealt, their tiers and the hint walks compared with HEAD and each difference
reported, with which saves or links no longer load; the guides updated; the
next step filed.

## What steps 7 and 8 learned that binds here

Steps 7 and 8's earlier lessons are in `describe-loops-and-fleets`' proposal
(archived), all of which bind here; what Slant added:

- **Time large boards back to back with HEAD from the first working
  ladder**, not after the comparison: Slant's first compiled ladder dealt a
  20×20 Normal board 21 times slower than HEAD, the factor growing with the
  board, and three causes were each found only by a profile
  (`node:inspector/promises`' `Session` in a scratch test): a group rebuilt
  whole after every placement, a set over the whole board walked for every
  square, and a rule's reach walked from every point in the answer check.
  Bind a set over the board once by `=` and let the compiler build what it
  needs where it is bound (`edgeGroups`).
- **A solve makes each fact as it concludes it**: a binder that reads a set
  computed before a placement in the same run says `not known(x)` again
  (`docs/descriptions.md` § "A statement's order is behavior").
- **State the ladder in tier order**: the hint's walk never takes a firing
  harder than the ladder's next, so a harder technique stated first raises
  its cap while an easier firing waits.
- **A technique run on placing that only strikes edges** (Slant's `drawn`)
  makes facts no hint step shows; the hint reads them by comparing the marks
  before and after the placement's firing.
- **The checker reads a set the marks decide by position** (`nth` of an
  open-squares set); it cannot divide by a number the board does not fix, so
  state `2 * left = 2 + |R|`, not `left = ... - |R| / 2`.
- **A technique that binds a set over the whole board first is one z3
  query** at order 4 (Slant's `same`, over 40 minutes): `CHECK_SPLIT=2`
  made it sixteen, 80 s in all.
- A pin the comparison moves is re-found with `npm run hint-scan -- <test>`,
  and its words re-baselined with the path before `-u`.

## Figures to re-check

Measured on `describe-chains-loops-and-fleets`' last commit (635538a0,
2026-11-06), Boats' files: `solver.ts` 1,026 lines, `hint-solver.ts` 1,407,
`validate.ts` 518. Re-measure before designing against any of these, and
record the HEAD baseline at the session's start.
