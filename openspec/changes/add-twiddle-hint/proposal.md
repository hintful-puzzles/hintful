# add-twiddle-hint

**Status: filed 2026-10-16 at the owner's word, split out of
`hintless-games-in-reserve`** (to be picked off one by one, and used as a
source of engine improvements and refactoring).

## Why

Twiddle has no hint, so it is a draft. A move rotates an `n`×`n` block 90°,
and the board is solved when the numbers read in order (and, when
`orientable`, every tile is upright).

## What is already there (read 2026-10-16; re-check before relying on it)

- `solve` returns the finished board (`src/games/twiddle/index.ts`); there is
  no search toward it. Input uses the shared target-verb model
  (`interpretTargetVerbs`).
- Fifteen and Sixteen, the other permutation games, hint with a staged plan
  ("Working on tile 1: …"), and Sixteen and Netslide build it with the shared
  slide planner (`git grep -l 'planSlides(' src/games`).

## What the hint has to settle

1. **The plan's shape.** A human method places tiles in reading order and
   keeps placed ones fixed, with a known endgame for the last rows. Decide
   whether the slide planner can take rotations as its moves, or the stages
   are Twiddle's own (`docs/hints-search.md` § "Hold a stable subgoal",
   § "A move puzzle teaches order").
2. **What a step can say**: which tile it works on, where it is going, and
   why this rotation and not another that moves it as far.
3. **`orientable`**: whether turning a tile upright is a stage of its own.
4. **Rows-only and `movetarget`** variants: what the plan does on each.

## Engine questions to carry

- If the stage-by-stage placement of Fifteen and Sixteen can be stated over
  any permutation move (a slide, a rotation), the planner should take a move
  set rather than slides. That is the generalization this game tests.

## Impact

- `src/games/twiddle/`: `solver.ts` or a planner use, `hint.ts`,
  `hintGesture`, marks, help page `## Hints`.
- Possibly the shared planner.
