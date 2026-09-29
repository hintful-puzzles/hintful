# fix-twiddle-custom-header

**Status: implemented (2026-09-29).** Phase 0 of `envision-the-game-contract` (its
`design.md` § "Phase 0").

## Why

A custom Twiddle game's header reads "WxH, rotating NaNxNaN blocks". The
header is built by Twiddle's formatter in `src/puzzle/augmentation.ts`. That
formatter reads `rotating-block-size`, `one-number-per-row`,
`orientation-matters` and `number-of-shuffling-moves` from the config the
worker builds. The config's non-dimension fields come only from a game's
`describeParams`, and Twiddle has none. So the block size reads as `NaN`, and
the "rows only" and "orientable" qualifiers never show.

`augmentation.test.ts` passes it, because it checks only for an unsubstituted
`{field}` placeholder, and Twiddle's formatter is a function.

This is a small instance of the defect `declare-params-in-one-place` removes
structurally: a game's params are described three times, and nothing holds the
copies together. It is fixed now because it reaches players today.

## What changes

- Twiddle gains `describeParams`, returning the four fields its formatter reads.
- A test covers every game whose formatter is a function: fed each of that
  game's presets, the header contains no `NaN` and no `undefined`. It is proven
  red on Twiddle before the fix.
