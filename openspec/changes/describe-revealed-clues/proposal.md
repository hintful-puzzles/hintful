# describe-revealed-clues

**Status: filed by `describe-the-king-move-games` (2026-11-01)**, step 5 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"). It files
step 6, `describe-on-a-graph`, when it is archived.

## Why

Guess, Mines and Black Box deduce from clues the board does not deal at the
start: a guess's feedback, a revealed square's count, a fired ray's exit.
Each runs a hand-written ladder beside a description that states only its
answer check (step 2), and Mines runs two: `deduce.ts` for the hint and
upstream's `minesolve` certifying each board it deals
(`describe-the-whole-catalog/design.md` § "Query games"). The vocabulary
they lack is X: clues revealed during play, rebuilt into the dealt clues
from the state on each hint, so a compiled technique reads them as it reads
a dealt clue.

## What Changes

- **X** in the description language and the ladder runtime: a clue kind
  the state reveals, the game saying how its state becomes the clue list on
  each solve and hint, with the checker's encoding of a clue that may or
  may not be revealed.
- **Guess's ladder** stated, its feedback a whole-board clue per guess;
  `hint.ts`' own rules and the brute-force soundness half of its test
  retired.
- **Mines' ladder** stated, with a binder over sets of revealed counts;
  `deduce.ts` retired, and `minesolve` too if the generator certifies on the
  compiled ladder at a deal cost the presets bear. Measure that cost first.
- **Black Box's ladder** stated, with a library term that runs a ray over
  partial marks; `settle` retired.

## Acceptance

Each of the three runs its compiled ladder for its hint, and Mines for its
generator's certificate unless the measured cost says otherwise, with the
reason recorded; the hand-written ladders removed; every technique checked
sound; the boards dealt and the hint walks compared with HEAD and each
difference reported, with which saves or links no longer load; the guides
updated; step 6 filed.

## What step 4 learned that binds here

- A name bound before a loop holds the marks of that moment
  (`docs/descriptions.md` § "What a technique compiles to"): bind a need
  after the binder it is compared across.
- Two readings a scan interleaves are one technique with a `let` choosing
  the reading. Split, the order they fire in moves, and with it which
  sentence a player reads.
- A `fill` over a set the marks decide is checked over every cell that may
  be in it, and its cost doubles with each (`docs/descriptions.md`
  § "Checking a technique sound"). `CHECK_TECHNIQUES` narrows a run to the
  techniques being worked on.

## Figures to re-check

Measured on `describe-the-king-move-games`' last commit (2026-11-01):
`mines/deduce.ts` 297 lines, `mines/solver.ts` 469, `mines/hint.ts` 399;
`guess/hint.ts` 649; `blackbox/hint.ts` 390, `blackbox/answer.ts` 93.
Re-measure before designing against any of them.
