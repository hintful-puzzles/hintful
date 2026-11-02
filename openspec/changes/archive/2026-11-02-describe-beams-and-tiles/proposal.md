# describe-beams-and-tiles

**Status: filed by `describe-beams-tiles-and-bricks` (2026-11-02)**, the
rest of step 7 of `describe-the-whole-catalog`'s plan (`design.md` § "The
plan"), which split again at its start and took Bricks. **Split again at its
start (2026-11-02): it takes Light Up** and files Magnets as
`describe-tiles`, which files step 8, `describe-connectivity` (`design.md`
§ "The split").

## Why

Magnets and Light Up each run a hand-written ladder beside a description
that states only its help. What they read that the language lacks: P,
propagation when a candidate is struck, not only when a value is placed
(Magnets); tile marks (Magnets); and walls (Light Up). L is there, `with
place(c, d): P`, and Q is: `stretch(L, c, S)` is Light Up's beam along a
line until a wall. Light Up's solver is the fixpoint header's named
exception, a scan that is not a ladder.

## What Changes

- **P, tile marks and walls** in the description language, the ladder
  runtime and the checker, each only as far as a game of the two reads it.
- **Each game's ladder stated**, its tiers as the game grades them, and the
  hand-written rungs retired; Light Up's exception in the fixpoint header
  retired with its scan. A search tier is the engine's search
  (`engine/answer-search.ts`), as Bricks' became.

## Acceptance

Each game runs its compiled ladder for its hint and its generator's
grading; the hand-written rungs removed; every technique checked sound;
the boards dealt, their tiers and the hint walks compared with HEAD and
each difference reported, with which saves or links no longer load; the
guides updated; step 8 filed.

## What step 7's earlier parts learned that binds here

- Record the comparison at HEAD before any code moves: a scratch
  `src/scratch-*.test.ts` that deals every preset at several seeds and walks
  each hint to the end by its first step, writing desc, deal time and every
  step's rung, move and words as JSON to the session's scratchpad; run it
  again after, and diff by each square's color and rule, not by step count:
  a board can turn solved with squares a player needn't mark still open, so
  the walks' lengths move with their order (Bricks).
- Measure a search budget against boards HEAD deals at sizes beyond the
  presets, in a scratchpad worktree of HEAD: the presets alone understate
  what a saved custom board needs. Where the game's harder tier was a
  lookahead, make it the search's `assume` (`docs/solver-and-generator.md`
  § "What the search needs of the game's deduction"): Bricks' then dealt
  HEAD's boards exactly.
- A library name must be spelled apart from every name a description
  defines (Untangle's `run`, the library's `across`); the compiler's error is
  a geometry refusal, not a clash, so grep the descriptions and `compile.ts`'
  names first.
- A hint that deduces from the player's notes builds marks from the values
  placed and the notes shown and asks the compiled rung's `firings`
  (`abcd/hint.ts`' `lineFirings`); its plan and words stay its own. One
  without notes walks the compiled firings with `ladderWalk`
  (`sticks/solver.ts`' `deduceSticksPlan`, `bricks/solver.ts`'
  `deduceBricksPlan`, which splits a firing into steps of one cell).
- A hand-written trial that validates once and classifies the break is as
  many techniques as the classifier has branches, in its ranking, each
  stating its break as a local rule or a `with`; their union forces what the
  trial forced where each break is monotone in the marks (Bricks, Sticks).
- Fold a contradiction the hand-written solver found only at its final
  classification into a technique's conclusion, so the search tries the same
  positions.
- A square that holds no answer value is a value of its own, or the clear
  value, given by a clue whose meaning places it and a domain read off the
  clue (Sticks' blocks, Bricks' holes): Light Up's walls may need no more.
- A hexagonal or sheared board needs no geometry: `adj8` less a diagonal
  (Bricks' `around`).
- A game that keeps clues and marks in one cloned array gives its state a
  shared `board` for `answerCache` to key on (Bricks).

## Figures to re-check

Measured on `describe-beams-tiles-and-bricks`' last commit (2026-11-02):
`solver.ts` and `hint.ts` lines, Magnets 597 + 894, Light Up 679 (one
file). Re-measure before designing against any of them, and record the HEAD
baseline at the session's start.
