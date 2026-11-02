# describe-beams-tiles-and-bricks

**Status: filed by `describe-sightlines-and-looks` (2026-11-02)**, the rest
of step 7 of `describe-the-whole-catalog`'s plan (`design.md` § "The plan"),
which split at its start and took Sticks and L. **Split again at its start
(2026-11-02): it takes Bricks** and files Magnets and Light Up as
`describe-beams-and-tiles`, which files step 8, `describe-connectivity`
(`design.md` § "The split").

## Why

Magnets, Light Up and Bricks each run a hand-written ladder beside a
description that states only its help. What they read that the language
lacks: P, propagation when a candidate is struck, not only when a value is
placed (Magnets); tile marks (Magnets); W as walls (Light Up) and holes
(Bricks); and a brick-wall space (Bricks). L is there, `with place(c, d):
P`, and Q is: `stretch(L, c, S)` is Light Up's beam along a line until a
wall. Light Up's solver is the fixpoint header's named exception, a scan
that is not a ladder.

## What Changes

- **P, tile marks, walls and holes, and a brick-wall space** in the
  description language, the ladder runtime and the checker, each only as far
  as a game of the three reads it.
- **Each game's ladder stated**, its tiers as the game grades them, and the
  hand-written rungs retired; Light Up's exception in the fixpoint header
  retired with its scan. A search tier stays the engine's search.

## Acceptance

Each game runs its compiled ladder for its hint and its generator's
grading; the hand-written rungs removed; every technique checked sound;
the boards dealt, their tiers and the hint walks compared with HEAD and
each difference reported, with which saves or links no longer load; the
guides updated; step 8 filed.

## What step 7's earlier parts learned that binds here

- Record the comparison at HEAD before any code moves: a scratch
  `src/scratch-*.test.ts` that deals every preset at several seeds and walks
  each hint to the end by its first step under each reading, writing desc,
  deal time and every step's rung, move and words as JSON to the session's
  scratchpad; run it again after, and diff. Ten seeds a preset agreed with
  forty on Sticks; take forty for the claim that no save stops loading.
- A library name must be spelled apart from every name a description
  defines (Untangle's `run`, the library's `across`); the compiler's error is
  a geometry refusal, not a clash, so grep the descriptions and `compile.ts`'
  names first.
- A hint that deduces from the player's notes builds marks from the values
  placed and the notes shown and asks the compiled rung's `firings`
  (`abcd/hint.ts`' `lineFirings`); its plan and words stay its own. One
  without notes walks the compiled firings with `ladderWalk`
  (`sticks/solver.ts`' `deduceSticksPlan`).
- Fold a contradiction the hand-written solver found only at its final
  classification into a technique's conclusion, so the search tries the same
  positions (ABCD's overfull line in `satisfied`, each Sticks technique's
  break on the marks as they stand).
- A `with` premise reuses the rules' own definitions under the supposition;
  bind the technique by the clue it breaks and conclude a `forall` over the
  squares it forces, so one firing is one clue's argument (Sticks).
- Where the hand-written classifier ranked the reasons one supposition
  breaks, the ladder's order is that ranking, and a rule the validator
  checked before another on the same structure comes first (Sticks'
  `twoClues` before `tooLong`).
- A plant that loosens a threshold inside a `with` can still come out
  unsound with the supposition ignored; the one that guards `with` supposes
  the wrong value (Sticks' `overConnected` plant).
- A square that holds no answer value is a value of its own, given by a clue
  whose meaning places it and a domain read off the clue (Sticks' blocks):
  walls and holes may need no more.

## Figures to re-check

Measured on `describe-sightlines-and-looks`' last commit (2026-11-02):
`solver.ts` and `hint.ts` lines, Magnets 597 + 894, Light Up 679 (one
file), Bricks 538 (one file). Re-measure before designing against any of
them, and record the HEAD baseline at the session's start.
