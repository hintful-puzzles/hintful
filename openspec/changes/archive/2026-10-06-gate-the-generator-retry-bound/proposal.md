# gate-the-generator-retry-bound

**Status: done (2026-10-06).** A follow-up from
`strengthen-the-sokoban-solver`.

## Why

docs/games/solver-and-generator.md § "Every retry loop is bounded" says a
"generate until it works" loop takes a `retryLimit` guard, because a
synchronous loop that never succeeds owns its thread. Nothing checks it. On
2026-10-04 five such loops were found with no bound, all by reading:

- Sokoban's deal, which at a Custom 40×40 ran for minutes (bounded in
  `strengthen-the-sokoban-solver`);
- Slant, Pegs, Flip and Same Game (guarded in the commit that added
  `engine/search-outcome.ts`).

And one is still open, read the same day: **Rect's generator**
(`src/games/rect/generator.ts`, the `for (;;)` that deals again where the hint
cannot finish the board) has no guard.

That survey read only the generator files that do not import `retryLimit`, so
a file that imports it for one loop and leaves another bare was not looked at.
Five games answered this rule five ways without anything noticing, which is
the shape a convention should make impossible.

## What Changes

- A source scan in the gate's fast pass: every unconditional loop (`for (;;)`,
  `while (true)`, `do … while`) in a game's generating code either calls a
  `retryLimit` guard or is in a ledger saying what else bounds it. Keyed on
  the loop's shape, not on a file name: Same Game's was in `state.ts`.
- The ledger holds the loops that are not retries (a heap drain, a walk that
  consumes its input) and those bounded by a counter of their own (Galaxies,
  Separate, Undead, Sokoban's deal), one line each, asserted to be exactly the
  loops the scan finds unguarded.
- Rect's loop takes its guard.
- The loops that only reject an already-solved shuffle (Fifteen, Twiddle,
  Flood, Flip's `index.ts`, Sixteen) are decided as a class: guarded, or
  ledgered with the reason they end.

## What the read changed (2026-10-06)

The shape above was wrong in both directions, and the scan was built on a
different one.

- **Too wide.** Of 180 unconditional and `do…while` loops, about 110 are solver
  fixpoints, heap drains and walks. A ledger line for each would have taxed
  every future solver for a rule about generators.
- **Too narrow.** Five guarded retries are `while (cond)` loops
  (`while (!spokesGenerate(…)) attempt()`, and Clusters, Magnets, Unruly), so
  removing their guards would not have failed the scan this proposal described.
  Two bare retries had the same shape: Ascent's `while (!grid)` and Boats'
  `while (!generateFleet(…))`.

What separates a retry from a fixpoint is that it **draws randomness each
pass**. A deterministic loop that never ends hangs every run and any test finds
it; a random one hangs on the seed nobody tried. So the population is every
loop whose header does not count and whose body reaches the RNG, followed by
reference through local functions and imports. It finds 49 of the 51 guards
that existed; the other two (Hat's coordinate step, Boats' clue seeding) are on
loops that draw nothing.

Found bare beyond Rect: Mosaic, Palisade, Range, Ascent's path loop, and the
tendril passes in `engine/loopgen.ts`, all guarded. Boats' fleet loop is
ledgered on the `validateParams` feasibility check the guide already records
as the answer there.

**The reject-a-solved-shuffle class is guarded**, since "it nearly always
works" is the case the rule exists for and the guard cannot fire on a working
generator. **Per-item rejection sampling is ledgered, not guarded**: a board
with one free square in 1,600 refuses 10,000 draws running about once in 500
deals, so the default budget would throw on a legal board.

Worst attempts measured for the new guards, 25 seeds on every preset, against
a budget of 10,000: Mosaic 100 (10×10), Palisade 9, the tendril passes 7,
Rect 4, the rest 1.

## What would show it worked

Removing a guard from any generator fails the gate in its fast pass, naming
the loop. The scan is seen red before it is trusted, and its count of loops
looked at is asserted.
