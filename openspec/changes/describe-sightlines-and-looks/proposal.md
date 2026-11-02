# describe-sightlines-and-looks

**Status: filed by `describe-runs-sightlines-and-looks` (2026-11-02)**, the
rest of step 7 of `describe-the-whole-catalog`'s plan (`design.md` § "The
plan"), which split at its start and took ABCD. It files step 8,
`describe-connectivity`, when it is archived. It may split again by game at
its start, each part filing the next.

## Why

Sticks, Magnets, Light Up and Bricks each run a hand-written ladder beside
a description that states only its help. What they read that the language
lacks: L, a `look` premise, the rules checked once on the marks with a fact
or two added and nothing propagated; P, propagation when a candidate is
struck, not only when a value is placed; W, cells outside the answer (Light
Up's walls, Bricks' holes); tile marks (Magnets); and a brick-wall space
(Bricks). Q is there: `stretch(L, c, S)` is Sticks' segment through a cell
and Light Up's beam along a line until a wall. Light Up's solver is the
fixpoint header's named exception, a scan that is not a ladder.

## What Changes

- **L, P, W, tile marks and a brick-wall space** in the description
  language, the ladder runtime and the checker, each only as far as a game
  of the four reads it.
- **Each game's ladder stated**, its tiers as the game grades them, and the
  hand-written rungs retired; Light Up's exception in the fixpoint header
  retired with its scan. A search tier stays the engine's search.

## Acceptance

Each game runs its compiled ladder for its hint and its generator's
grading; the hand-written rungs removed; every technique checked sound;
the boards dealt, their tiers and the hint walks compared with HEAD and
each difference reported, with which saves or links no longer load; the
guides updated; step 8 filed.

## What step 7's ABCD part learned that binds here

- Record the comparison at HEAD before any code moves: a scratch
  `src/scratch-*.test.ts` that deals every preset at several seeds and walks
  each hint to the end by its first step under each reading, writing desc,
  aux, deal time and every step's rung, move and words as JSON to the
  session's scratchpad; run it again after, and diff.
- A library name must be spelled apart from every name a description
  defines (Untangle's `run`); the compiler's error is a geometry refusal, not
  a clash, so grep the descriptions first.
- A hint that deduces from the player's notes builds marks from the values
  placed and the notes shown and asks the compiled rung's `firings`
  (`abcd/hint.ts`' `lineFirings`); its plan and words stay its own.
- Fold a contradiction the hand-written solver found only at its final
  classification into a technique's conclusion, so the search tries the same
  positions (ABCD's overfull line in `satisfied`).
- A placing technique a variation adds runs only where it is on
  (`placing` carries its variation).

## Figures to re-check

Measured on `describe-runs-sightlines-and-looks`' last commit (2026-11-02):
`solver.ts` and `hint.ts` lines, Sticks 733 (one file), Magnets 597 + 894,
Light Up 679 (one file), Bricks 538 (one file). Re-measure before designing
against any of them. The HEAD baseline of the four games' 350 boards was
recorded at that session's start, but HEAD has moved since: record it again.
