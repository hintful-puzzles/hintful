# describe-cuts-chains-loops-and-fleets

**Status: filed by `describe-connectivity` (2026-11-02)**, the rest of step 8
of `describe-the-whole-catalog`'s plan (`design.md` § "The plan"). **Split at
its start (2026-11-02)**: it takes Range, which needs only what exists, and
files Rome, Slant and Boats as `describe-chains-loops-and-fleets`, which
files step 9 when it is archived.

## Why

Range ran a hand-written ladder (three rules in `solver.ts`, swept for the
hint by `SweepOffers`) beside a description that stated only its help. What
it reads the language already had: a number's arms as `ray(k, a)`, the clear
squares' cut vertices as `cuts(S)` (`describe-connectivity`).

## What Changes

- **Range's rules and ladder stated** in `range.description.yaml`: the
  answer check compiled from the rules, and four Easy techniques
  (`besideShaded`, `capped`, `reach`, `cut`), each stating the guard that
  makes a broken position a contradiction, so the search beneath the ladder
  refuses a position as early as the hand-written error check did.
- **The hand-written rules retired**: the solve, the generator's
  uniqueness test, the search's deduction and the hint all run the compiled
  ladder; the hint walks it with `ladderWalk`, one step a square. The live
  error overlay stays the game's own.
- **`ray` read by the soundness checker**, which lacked it.
- **A binder over `range(a, b)` counted** rather than read off a 32-bit
  mask, which wrapped past 31: a position along a long arm read wrong, and
  so did Unruly's `range(0, |line| - 3)` on a line longer than 33. A `min` or
  `max` of such a binder's own numbers stops at the first that passes.
- **`ray` built once a space**, since a technique asks it of every arm every
  pass.

## Acceptance

Range runs its compiled ladder for its hint, its solve and its generator's
grading; the hand-written rules removed; every technique checked sound, each
with a plant that comes out unsound; the boards dealt, their tiers and the
hint walks compared with HEAD and each difference reported, with which saves
or links no longer load; the guides updated; the next step filed.

## What the comparison found

Every preset at both tiers, six seeds each (48 boards), dealt at HEAD and
after, each hint walked to its end by its first step:

- **The same boards and grades**: all 48 descs and both grades of each are
  as at HEAD. So no save or link stops loading.
- **The same squares, decided the same way**, with the same number of steps
  in every walk. The order moved in 44 walks, as the plan accepted
  (`describe-the-whole-catalog/design.md` § "Decisions made here"): a step
  that two rules force is said by the first of them in the ladder, so
  adjacency says 766 steps where it said 458, and a number's reach 1,367
  where it said 1,677. Every sentence is one HEAD speaks.
- **A broken position is refused sooner**: the clear squares falling apart
  is now a contradiction the hint stops at, where HEAD's rules went on
  filling cells.
- **Deal time**, back to back with HEAD under the same load: presets within
  a few milliseconds; Easy 30×30 1.8 s against 2.1, 40×40 9.6 s against 9.7,
  10×118 5.6 s against 5.1; Unreasonable 20×20 0.55 s against 1.36, 25×25
  2.4 s against 5.9.
