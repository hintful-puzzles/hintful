# offer-salad-normal-presets

**Status: implemented (2026-10-05).** A follow-up from
`fix-salad-number-ball-hint-throw`.

## Why

Salad deals two difficulties and its menu offered one. All eleven presets
were Easy, which is upstream's list kept whole by the port
(`add-salad-ts-port`'s design: "all eleven upstream, `DIFF_EASY`"), not a
decision anyone here made. Two costs:

- **A player reaches Normal only through the Custom dialog**, in a game whose
  Normal tier is honest: the generator throws away any Normal board that Easy
  can solve.
- **No cross-game guard had ever dealt a Normal Salad board.** They deal from
  presets (`engine/testing/presets.ts`), and a field every preset holds the
  same value at is not an axis the slice can walk. That is how the hint came
  to throw on 71 of 1,195 Normal boards with the suite green.

## What Changes

Four Normal presets, after the Easy ones:

- Letters 5x5 A~C, Letters 5x5 A~D, Numbers 5x5 1~4, Letters 6x6 A~D.

Chosen by what the tier gate deals quickly. Forty deals a shape, 2026-10-05,
on a machine at load 5 and 16 GB into swap, so upper bounds:

| shape at Normal | median | worst of 40 |
|---|---|---|
| Letters 5x5 A~C | 27 ms | 119 ms |
| Letters 5x5 A~D | 4 ms | 24 ms |
| Numbers 5x5 1~4 | 10 ms | 167 ms |
| Letters 6x6 A~D | 48 ms | 173 ms |
| Letters 6x6 A~C | 64 ms | 351 ms |
| Letters 7x7 A~D | 192 ms | 1,693 ms |
| Letters 8x8 A~E | 566 ms | 2,446 ms |
| Numbers 6x6 1~4 | 612 ms | 3,987 ms |

The first four are the presets. The others stay Custom-only: a menu entry
that takes seconds some of the time is a worse offer than none, and the
other Number Ball shapes are slower still (5x5 with three numbers is about
3 s a board; `bound-custom-sizes-by-their-deal` has those).

Number Ball gets one Normal preset where Letters gets three. That is what
the generator can deal today, not a judgment about the mode.

## Compatibility

None to break. Presets are a menu; no saved game or shared ID names one, and
the params codec is unchanged.

## What would show it worked

The menu shows the four, each deals and solves at Normal and not at Easy
(`salad.test.ts`), and `presetAxes` over Salad's presets reports difficulty
as an axis, so `gatePresets` deals a Normal board in every guard built on it.
