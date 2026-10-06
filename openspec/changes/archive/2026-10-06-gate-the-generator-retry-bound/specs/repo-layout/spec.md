## ADDED Requirements

### Requirement: The gate holds every open loop that draws randomness to a stated bound

A loop under `src/games/` or `src/engine/` whose header does not count (a
`while`, a `do…while`, or a `for` missing its condition or its incrementor) and
which draws from the RNG SHALL either call a `retryLimit` guard once per pass,
or be listed in a ledger with what ends it. The ledger SHALL be asserted equal
to the set of such loops the scan finds unguarded, in both directions, so an
entry cannot outlive its loop and a new loop cannot arrive without an answer.

The scan SHALL key on the loop's shape and on references, not on a file name or
a list of games: an RNG is a declaration typed `RandomState` or initialized from
a function declared to return one, a draw is followed through local functions
and relative imports, and a guard is a variable initialized from the
`retryLimit` that `engine/retry-limit.ts` exports. It SHALL run in the gate's
source-scan pass, and SHALL carry its own known positives: a bare loop of each
open shape that it finds, and a guard that is not the loop's own that it
refuses.

A loop that deals a whole board again until one is acceptable SHALL take the
guard, a loop that only rejects an already-solved shuffle included. A ledger
entry is for a loop that uses something up each pass, that counts for itself,
or that is rejection sampling for a single item; for the last, the reason SHALL
say what keeps an acceptable draw on offer. A default-budget guard SHALL NOT be
put on per-item rejection sampling, because a legal board can exhaust it.

A deterministic open loop is outside this requirement: one that never ends
hangs on every run, and the first test to reach it finds it.

#### Scenario: A generator's guard is removed

- **WHEN** the call to a `retryLimit` guard is removed from a retry loop that
  draws from the RNG, whatever file it is in and whether the loop is
  `for (;;)`, `while (true)`, `do…while` or `while (!generate(rng))`
- **THEN** the gate fails in its source-scan pass, naming the loop by file,
  function and line

#### Scenario: A ledger entry outlives its loop

- **WHEN** a ledgered loop is deleted, renamed with its function, or given a
  guard
- **THEN** the gate fails until the entry is removed

#### Scenario: A new game samples a free square by rejection

- **WHEN** a generator draws a square until it finds one not taken, in an open
  loop
- **THEN** the gate fails until the ledger says what keeps a free square on
  offer
