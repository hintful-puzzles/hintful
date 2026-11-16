# deal-walk-says-why-a-draw-failed

Filed 2026-11-16 from a review of the `add-norinori` session's transcript;
the owner agreed to it the same day.

## What the work found

Writing Norinori's deal took about half of a two-hour session. Its design
records the measured attempts, each a count of rejected draws and where
the mend stalled. None of these counts came from an instrument:

- The agent added a `DEBUG` export of counters to `generator.ts` (draws,
  rounds missed, too small, mends, mended, best). It wrote timing harnesses
  as scratch tests, and logged with `appendFileSync`, since vitest hides
  console output.
- That cost 25 scratch vitest runs, 42 edits to `generator.ts`, and 25
  stop, edit and restart loops.
- `npm run deal-walk` was found an hour in. It reports a deal's time, not
  why draws were rejected.

Every new game's generator retries a draw until its judge accepts it
(`retryLimit`, `mendDivision`). The engine knows each rejection's stage and
reports none.

## What this change does

- The engine's retry and mend helpers count rejections by stage. For a
  mend, they also record how many squares were left open where it stalled,
  and under which rungs. These are gathered only when asked for, so a deal
  pays nothing in the app.
- `npm run deal-walk` prints them for each preset or Custom size, beside
  the times.
- A game's generator names its own stages (a closed domino rejected, a
  region too small) through the same counter, and adds no export of its own.
- `docs/new-game.md`'s generator route names `deal-walk` as the first
  instrument, beside `deal-profile`, which `docs/solver-and-generator.md`
  § "Generators" names for profiling.

## Before it starts

- Re-check at HEAD what `deal-walk` reports. Use Norinori's design (§
  "The deal") as the test: its four measured attempts should be readable
  from the new counts on its current generator, and on a reverted one.
