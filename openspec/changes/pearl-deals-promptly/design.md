# Design: pearl-deals-promptly

## Context

Pearl's menu (2026-10-27): 6x6, 6x8, 8x8, 10x10 and 8x12, each at Easy and
Tricky. The first three deal in well under a second; the last two do not
(see the proposal's numbers). Where the time goes has not been measured.

## Decisions

- **Profile before changing anything.** Count, for a dozen 10x10 deals, the
  loops tried, the gate's solves per loop and their time, and the removal's
  solves. Name the share each takes before choosing what to speed up
  (`docs/solver-and-generator.md`, and `docs/method.md` on measuring a
  headline number yourself).
- **The guarantees stay.** A speed-up that skips a gate solve or a removal
  check changes what a board is; the tier tests (`difficulty-contract`,
  `pearl-ladder.test.ts`) are what hold it.
- **Sizes follow the measurement.** Time a dozen deals of each candidate at
  each tier with `DEAL_WALK_CELLS=... DEAL_WALK_SEEDS=12 npm run deal-walk --
  pearl`, and offer the largest that stay near a second. If even the faster
  generator cannot deal a size near 10x10 promptly, the menu stops below it
  and the size stays a Custom away.

## Risks / Trade-offs

- [A faster generator deals different boards for the same seed] → frozen
  fixtures that pin a seed move; read each moved board, never re-baseline
  blind.
- [No speed-up is found] → the menu still drops the slow sizes, which is
  the owner's other option, and the change records what was tried.
