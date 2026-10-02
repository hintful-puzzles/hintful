## 0. Measure

- [x] 0.1 Count, per rejection reason, the attempts `newDesc` spends at
      15x15 Tricky over the seven failing seeds and a sample of passing ones.
      Record the distribution of attempts per deal in `design.md`.
      (The failing preset turned out to be 15x15 Hard; design D1, D2.)

## 1. Fix

- [x] 1.1 Remove the dominant rejection's tail, so that no seed in a wide
      sample (at least 1 000 per preset) reaches the cap. (The rejection that
      separates Hard is the bare-board grade, not `boring`; design D3.
      Sampled 200 per preset across all twelve presets plus 3,000 at 15x15
      Tricky, with P(cap) computed from the per-attempt rate: at worst
      10^−21.6.)
- [x] 1.2 Pin the failing seeds at that preset in `tracks.test.ts`. Planted
      the old check back; all seven fail with `RetryLimitExceeded`.
- [x] 1.3 Retire the C differential's desc byte-match above Easy; keep its
      grade half on every fixture (design D4).
- [x] 1.4 Ask the owner about seed links that now deal a different board
      (design D4): the fix ships.
- [x] 1.5 Record the lesson in `docs/games/solver-and-generator.md`.
