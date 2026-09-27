## Why

Owner playtest (2026-09-27), on a hint that named a missing 35: "the mention of 35 doesn't help, and … we in general
prefer to avoid mentioning numbers that aren't on the board (and aren't the one
where placing), and also, in this specific case, the better deduction seems to
be that there's only one placement for the 33-37 run that wouldn't leave a gap."

## What Changes

- A hint sentence names only numbers on the board and the ones its step places.
  A rival is named as its run ("the run between 41 and 43 can't, as this square
  doesn't touch 41"), and a step count by the side it rules out ("4 steps from
  48 rules out anything higher").
- A run with several routes, exactly one of which leaves a neighboring run at
  least one route of its own, is placed in one step: "Only one route for the run
  between 33 and 37 leaves the run between 28 and 33 a way through, so it must
  take the line."
- The whole-run step is asked of every placement's run, not only of a run the
  plan has followed to its end.

## Impact

- `src/games/ascent/hint.ts`, `hint-text.ts`, their tests and snapshots.
- `help/games/ascent.md`, `docs/games/hints.md`.
- Spec: `ascent`.
