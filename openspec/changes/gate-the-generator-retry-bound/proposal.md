# gate-the-generator-retry-bound

**Status: scaffolded, not started (2026-10-04).** A follow-up from
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

## What would show it worked

Removing a guard from any generator fails the gate in its fast pass, naming
the loop. The scan is seen red before it is trusted, and its count of loops
looked at is asserted.
