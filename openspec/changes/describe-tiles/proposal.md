# describe-tiles

**Status: filed by `describe-beams-and-tiles` (2026-11-02)**, the last of
step 7 of `describe-the-whole-catalog`'s plan (`design.md` § "The plan"),
which split at its start and took Light Up. It files step 8,
`describe-connectivity`, when it is archived.

## Why

Magnets runs a hand-written ladder (`magnets/solver.ts`'s `MagnetsSolver`
and the hint beside it) next to a description that states only its help.
What it reads that the language lacks: P, propagation when a candidate is
struck and not only when a value is placed (`unflag` strikes the opposite
pole from a domino's other end), and tile marks (a domino a player marks as
a magnet without saying which way round, the hint's `?`).

## What Changes

- **P and tile marks** in the description language, the ladder runtime and
  the checker, as far as Magnets reads them.
- **Magnets' ladder stated**, its tiers as the game grades them, and the
  hand-written rungs retired. Its tiers have no search: `solveUnnumbered`,
  the generator's own ladder of two rungs while it lays dominoes, is part of
  what is stated or kept with its reason.

## Acceptance

Magnets runs its compiled ladder for its hint and its generator's grading;
the hand-written rungs removed; every technique checked sound; the boards
dealt, their tiers and the hint walks compared with HEAD and each
difference reported, with which saves or links no longer load; the guides
updated; step 8 filed.

## What step 7's earlier parts learned that binds here

- Record the comparison at HEAD before any code moves: a scratch
  `src/scratch-*.test.ts` that deals every preset at several seeds and walks
  each hint to the end by its first step, writing desc, deal time and every
  step's rung, move and words as JSON to the session's scratchpad; run it
  again after, and diff by each square's mark and rule, not by step count.
  A square one walk marks and the other does not is often one the other
  walk's order reached another way (Light Up lit what HEAD crossed), so look
  at the board before calling the closure weaker.
- A generator that asks which clues its solver used reads them off the
  recorded firings with `wholePasses` (Mosaic's and Light Up's deals).
  Magnets' strip asks only whether each removal still solves to the same
  grid (`generator.ts`, read 2026-11-02), so it needs no more than
  `deductionFinishes` and the grid the ladder reached.
- A definition is computed at each read, so bind a term a technique reads
  more than once (`docs/descriptions.md` § "What a technique compiles to");
  profile a deal with `node:inspector/promises`' `Session` inside a scratch
  test, since a worker writes no `--cpu-prof`.
- The checker reads both sides of a guard: a term over `first(S)` behind
  `|S| > 0` is read of none too. It reads a value, a line, cells, neighbors
  and a stretch of none as nothing; extend that table where a new term is
  read of none, rather than restating the technique.
- A placing technique may place as well as strike, and its false conclusion
  is no contradiction, so a rung holds the rule it relies on (Light Up's
  `shine` and `square`). P is the converse: a technique run on a strike.
- A library name must be spelled apart from every name a description
  defines; grep the descriptions and `compile.ts`' names first.
- A hint that deduces from the player's notes builds marks from the values
  placed and the notes shown and asks the compiled rung's `firings`
  (`abcd/hint.ts`' `lineFirings`); its plan and words stay its own. Magnets'
  `?` marks are such notes.
- A game that keeps clues and marks in one cloned array gives its state a
  shared `board` for `answerCache` to key on (Bricks, Light Up).
- A frozen upstream differential the generator no longer reproduces becomes
  a check that each frozen board validates, round-trips and grades at its
  tier (Bricks', Light Up's `*-differential.test.ts`).

## Figures to re-check

Measured on `describe-beams-and-tiles`' last commit (2026-11-02):
`magnets/solver.ts` 597 lines and `magnets/hint.ts` 894. Re-measure before
designing against either, and record the HEAD baseline at the session's
start.
