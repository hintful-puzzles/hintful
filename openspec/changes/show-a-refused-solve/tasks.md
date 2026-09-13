# show-a-refused-solve — tasks

## 1. Confirm

- [ ] 1.1 Re-read `Puzzle.solve`, the `solve` command in `puzzle-screen.ts` and
      `showSolution` in `end-notification.ts`, and confirm the refusal is still
      discarded at each.
- [ ] 1.2 In the app, press Solve on a fresh Mines board and confirm nothing is
      shown.

## 2. Implement

- [ ] 2.1 Surface the refusal in the transient banner, as `hintOnce` does.
- [ ] 2.2 A `Puzzle`-level test for a refused and a successful Solve.
- [ ] 2.3 Spec delta: the `ts-engine` or app requirement that states what a
      refused Solve shows (grep the live specs for the Hint banner's
      requirement first, and extend the requirement that holds it).

## 3. Verify

- [ ] 3.1 Run the app: Solve on a fresh Mines board shows the refusal; Solve
      after the first click solves with no banner.
