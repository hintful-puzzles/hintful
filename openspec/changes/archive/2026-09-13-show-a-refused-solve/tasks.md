# show-a-refused-solve — tasks

## 1. Confirm

- [x] 1.1 Re-read `Puzzle.solve`, the `solve` command in `puzzle-screen.ts` and
      `showSolution` in `end-notification.ts`, and confirm the refusal is still
      discarded at each. Confirmed 2026-09-13. Also found: the desktop rail
      rendered the banner only inside the `canHint` block, so for Mines (no
      hint) routing the refusal to the banner alone would still have shown
      nothing; and `solve` bypassed `enqueueInput`, unlike every other move.
- [x] 1.2 In the app, press Solve on a fresh Mines board and confirm nothing is
      shown.

## 2. Implement

- [x] 2.1 Surface the refusal in the transient banner, as `hintOnce` does —
      inside `Puzzle.solve`, so both callers are covered unchanged. Solve now
      queues through `enqueueInput`. The rail renders the banner under the
      Help-me-play group for a hintless game. The banner signal is renamed
      `autoHintMessage` → `helpMessage`, since it has carried more than
      Auto-Hint's words since the stepper, and now carries Solve's.
- [x] 2.2 A `Puzzle`-level test for a refused and a successful Solve, and for
      Solve waiting behind an in-flight step (`puzzle-hint-stepper.test.ts`);
      a rail render test that the banner appears exactly once with and without
      `canHint` (`puzzle-command-homes.test.ts`). All three seen red against
      planted reverts.
- [x] 2.3 Spec delta: no existing requirement holds Solve's feedback (the Hint
      stepper requirement is about Hint's beats), so it is an `ADDED`
      `ts-engine` requirement rather than an extension.

## 3. Verify

- [x] 3.1 Run the app: Solve on a fresh Mines board shows the refusal; Solve
      after the first click solves with no banner. Checked in Chromium on the
      dev server, desktop rail: the refusal shows under "Show solution…", and
      after a first click and the 3 s lapse Solve reveals the board with no
      banner.
