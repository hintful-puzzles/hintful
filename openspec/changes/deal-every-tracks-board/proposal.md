# deal-every-tracks-board

**Status: scaffolded, not started (2026-10-02).** Found by
`reach-every-declared-mark`, while scanning presets for boards to pin.

## Why

New Game on Tracks' 15x15 Tricky preset throws instead of dealing on about one
deal in fourteen. Measured 2026-10-02: `newDesc` at that preset, seeds `pin-0`
to `pin-99`, gave `RetryLimitExceeded: tracks: generation: gave up after 10000
attempts` on 7 of 100 (`pin-0`, `pin-66`, `pin-71`, `pin-79`, `pin-83`,
`pin-94`, `pin-96`). Every other preset dealt all 20 seeds tried.

`engine/retry-limit.ts` says a working generator never reaches its cap, so
reaching it is a bug, and a player sees it as a crash.

Raising the cap is not the fix by itself. The failing seeds spend their 10 000
attempts in about three seconds, so a cap large enough to cover the tail would
turn the crash into a stall of many seconds on a phone.

## What Changes

- Measure which rejection in `newDesc`'s loop dominates at 15x15 Tricky: a
  row or column with no track (`boring`), the `singleOnes` rule, or
  `addClues` returning -1 (too easy, or never soluble).
- Fix the dominant rejection so the attempt count has a short tail. One
  option is to repair or re-lay the part of the path that failed rather than
  re-laying the whole path. Seeds that deal today must still deal the same
  board, unless the fix states why a changed board is worth it.
- Pin the seven seeds above as a test at that preset.

## Hints to pull in

None.
