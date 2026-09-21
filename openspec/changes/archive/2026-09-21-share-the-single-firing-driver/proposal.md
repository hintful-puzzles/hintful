# share-the-single-firing-driver

**Status: implemented and archived 2026-09-21** (design.md records the
decisions). Owner-requested, 2026-09-21, from
`add-magnets-hint`.

## Why

Three games build their hint by running their solver's ladder on
`runDeductionFixpoint` one firing at a time: Tracks (`tracksRecordingPass`),
Bridges (its recording pass in `solver.ts`) and Magnets (`recordingPass` in
`hint.ts`). The runner has no way to say "stop after this firing", so each game
bends `settled` into doing it, and each bent it differently (read 2026-09-21):

- **Tracks** stops when its recorder holds any op, and records every change as
  one, so it returns one firing per call.
- **Bridges** stops when its recorder holds any op, but records none for its
  max-cap rule, so it deliberately **runs on through invisible firings** until
  one has a move to show.
- **Magnets** wraps every technique to set a `fired` flag and stops on that,
  returning every firing, invisible ones included, and lets `deduceHintPlan`'s
  `showable` hide the invisible ones.

None of those differences is about its puzzle. This is the shape `AGENTS.md`
§ "Convention over configuration" names: several games writing the same loop,
which the framework should own, with the games supplying only what is theirs.
The next adopter would otherwise invent a fourth trick.

## The decision this change exists to make

**Where invisible firings are hidden.** Bridges hides them inside the driver;
Magnets hides them in the plan loop's `showable`. The guide's rule
(docs/games/hints.md § "Show only what the board does not already say") puts
hiding in `showable`: a hidden firing still advances the board, the plan cap
counts shown steps only, and `hidden` is the count a test reads to prove the
hook ran. Recommendation: **one firing per call, always**, with Bridges' max-cap
case moving to `showable`. Measure Bridges' plans before and after; its tests
should pass unedited (the guide's bar for a behavior-preserving extraction).

## What changes

1. **An engine driver**, shape to be settled in the change, roughly
   `nextFiring(techniques, { maxTier?, budget, beforeTechnique? })` returning the
   technique that fired, `null` when the ladder is exhausted, or a contradiction
   marker. It is the runner with one more stop condition, not a second runner;
   if it can be an option on `runDeductionFixpoint` rather than a new function,
   prefer that.
2. **Optionally, what a firing changed.** Magnets reads its firing's effect off
   a before/after comparison of the board (the Galaxies lesson), and needed a
   mask because `advancedfull` rewrites a scratch bit whether or not it fires.
   If the driver takes an optional `snapshot`/`diff` pair, the next game cannot
   forget either half. Do this only if it falls out of item 1 cleanly; a
   recorder that already records ops (Tracks, Bridges) does not need it.
3. **Move Tracks, Bridges and Magnets onto it**, each proved
   behavior-preserving by its hint tests passing unedited and its
   ladder-equivalence test still green.

## What this does not do

- It does not touch the generator's path. `solve` still runs the ladder to a
  fixpoint with no recorder, and the frozen differentials must not move.
- It does not unify recorders. What a firing records stays per game.
