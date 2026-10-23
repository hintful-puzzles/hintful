# spread-the-long-hint-walks

Filed 2026-10-23, found while fixing the CI gate on the owner's word.

## Why

Six of the eight Gate runs on 2026-10-22 were canceled at the job's
30-minute limit, so those pushes had no verdict, and a real failure
(Crossing's long sentence) went unseen behind them. The suite's files sum to
73.8 minutes of test time on a four-core runner, about 18.5 minutes spread
over the workers; but vitest runs one file's tests in turn, and two files
are most of the wall clock alone: `src/engine/hint-resume.test.ts` took
21.5 minutes and `src/engine/hint-quality.test.ts` 16 in a run of 23.5
(run 39872039775). A runner 1.7 times slower (run 39876358730, every file
alike) takes the run past 30.

The limit was raised to 45 minutes to restore verdicts. That is room, not a
cure: the two files grow with every game and every preset.

## What changes

- The two walks are spread over several files, each walking a share of the
  hint games derived from `HINT_GAMES` (never a hand-kept list), so the
  workers share them.
- Their coverage checks ("covered enough boards to mean something") are
  restated so each share is held to its own count, or a count is kept
  across shares; which is the design's question.
- The Gate limit comes back down to what the spread run needs with room for
  a slow runner, measured.

## Measure first

Re-read both runs' per-file times before designing: whether the two files'
cost is spread over many games or held by a few presets decides between
sharding by game and trimming a walk.
