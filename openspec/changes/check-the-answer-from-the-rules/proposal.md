# check-the-answer-from-the-rules

**Status: filed by `describe-a-board-beyond-the-latin-square` (2026-11-01)**,
step 2 of `describe-the-whole-catalog`'s plan (`design.md` § "The plan"). It
files step 3, `describe-moves-and-finishes`, when it is archived.

## Why

A described game states its rules twice: once in its description's `shape`,
`rules` and `clues`, which the soundness checker reads, and once by hand in
the code that decides whether a finished board is right. Nothing in `src/`
reads the stated rules. Compiling them into the check the engine calls makes
them one copy, and every game described from here on states its rules once
from its first day.

## What Changes

- **The rules compiled.** `npm run describe` compiles a description's rules
  (its shape, its rules and what each clue means) to a check over a
  completed grid, which the compiled module exports and the engine calls.
- **Each described game's hand-written check goes**: the Latin games' `valid`
  callbacks, Unruly's run and count validators, Seismic's `validateGame`,
  where the compiled check says the same.
- **What a check owes the board's drawing.** A hand-written validator also
  marks which cells break which rule for the error overlay (Unruly's `FE_*`,
  Seismic's `FM_ERROR*`). The change decides whether the compiled check names
  the cells each rule's failing binding reads, or the overlay keeps its own
  code and says why.
- **Measured**: the check's speed where a generator calls it per board, and
  every fixture and deal unchanged.

## Facts for the session (2026-11-01; re-check)

- The hand-written checks: `clueValid`
  (`engine/edge-clue-latin/solver.ts:14`), `groupValid`
  (`group/solver.ts:99`), `keenValid` (`keen/solver.ts:102`), Towers'
  `towersValid`, Mathrax's `valid: null` (its clue readings check every
  clue), Salad's `latinholesCheck`, Solo's `checkValid` and
  `checkKillerCageSum` (`solo/state.ts:498,608`); Unruly's
  `validateRows`, `validateCounts` and `isComplete`
  (`unruly/solver.ts:271-392`); Seismic's `validateGame`
  (`seismic/solver.ts:181`).
- The checker already reads every rule as z3 constraints
  (`research/technique-check/describe-check.ts` `worldOf`), and the research
  interpreter evaluates them on concrete boards (`research/describe/`):
  either is a reference for what each rule means.
- Seismic's keep-apart mode is a dealt size (`mode`), and its domain a
  cell's (`domainOf`); Unruly's unique rule is a modifier's shape.

## Decisions it inherits

`describe-the-whole-catalog/design.md` § "Decisions made here".

## Acceptance

Every described game's completion check is its compiled rules, its
hand-written check removed or kept with the reason; every fixture, deal and
hint walk unchanged (`research/describe/trace-latin.test.ts`); the guides
updated (`docs/descriptions.md`).
