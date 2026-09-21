# assert-deduction-runs-out-only-on-unreasonable — tasks

## 1. Before building

- [x] 1.1 Find what the player sees when `hint()` throws through the worker.
      The Hint press rejects, the unhandled-rejection handler opens the crash
      dialog, and the report goes to Sentry. Auto-Hint was the gap: its loop is
      unawaited and stayed marked active after a throw (2.6).
- [x] 1.2 Take the population of `DEDUCTION_EXHAUSTED` call sites by reference
      and check each is deduction-complete below `Unreasonable`.
      `npm run refs` found 22 games, plus `candidate-hint.ts` for the candidate
      games. Checked by behavior, not by reading each: see 1.3.
- [x] 1.3 Check whether any game's annotation mistake can end in exhaustion.
      A scratch sweep (not committed) played every hinting game's gate presets
      that do not permit search: 4 boards each, hint moves mixed with random
      clicks, keys and undos. It checked the hint 32,596 times and never saw
      `DEDUCTION_EXHAUSTED`. The player's wrong entries got
      `FIX_MISTAKES_FIRST` or `CONTRADICTION_UNLOCALIZED`. Positive control:
      the same sweep on `Unreasonable` presets saw 1,390 exhaustions across 9
      games. The sweep also found Rome's hint throwing on one board; filed as
      `rome-hint-survives-a-restored-note`.

## 2. Build

- [x] 2.1 Extract `permitsSearch` into an engine helper; point
      `hint-resume.test.ts` at it.
- [x] 2.2 Throw from `Midend`'s hint path on `DEDUCTION_EXHAUSTED` outside an
      `Unreasonable` tier, with the game id and tier in the message.
- [x] 2.3 Pin the owner's board under an Easy-pinned full id; prove red.
- [x] 2.4 Spec delta on `ts-engine` for the hint-refusal requirement.
- [x] 2.5 Run the app on the pinned board and confirm what the player sees:
      in Chrome, the next Hint press after move 10 opens the crash dialog,
      and its message carries the full id.
- [x] 2.6 Stop Auto-Hint when a step throws; stepper test, proved red.
- [x] 2.7 The check's first catch, in the gate: `towers-stale-hint.test.ts`
      loaded its "hard" and "extreme" boards as `5h:` and `5x:`, which Towers
      decodes as Easy (its spelling is `5dh`). The walk returned quietly on the
      refusal, so those boards had only ever been walked at Easy's rules until
      they ran out. The test now builds the id with the game's encoder, asserts
      the tier it loaded, and asserts every walk reaches solved (proved red with
      the old spelling).
