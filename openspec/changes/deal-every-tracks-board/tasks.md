## 0. Measure

- [ ] 0.1 Count, per rejection reason, the attempts `newDesc` spends at
      15x15 Tricky over the seven failing seeds and a sample of passing ones.
      Record the distribution of attempts per deal in `design.md`.

## 1. Fix

- [ ] 1.1 Remove the dominant rejection's tail, so that no seed in a wide
      sample (at least 1 000 per preset) reaches the cap.
- [ ] 1.2 Pin the failing seeds at that preset in `tracks.test.ts`.
