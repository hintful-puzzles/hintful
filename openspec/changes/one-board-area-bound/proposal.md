## Why

`architectural-review-second-pass` item 7 (owner accepted every item,
2026-11-21). Measured at `22ba4e45f`: 24 games refuse a large board with
`AREA_TOO_LARGE` under 11 different bounds (`0x7fffffff`,
`Number.MAX_SAFE_INTEGER`, `2 ** 28 - 1`, half of `INT_MAX`, one million,
ten thousand), most of them upstream's C overflow guards; the other games
have none. Which Custom sizes a player may enter differs by game for no
reason a player could see.

## What Changes

- One engine bound on a board's area, held where params are validated
  (`dimensionParamConfig` and `paramsError`), set from what the app can deal
  and draw in reasonable time, measured.
- The games' own overflow guards go. A game keeps a tighter bound only
  where its own logic needs it, with the reason.
- **Player-visible**: the Custom dialog accepts the same largest board in
  every game, and a shared game ID beyond the bound is refused where some
  loaded before. Pre-approved for consistency (owner, 2026-11-21: "It's
  absolutely ok to change things a player sees in order to make them more
  consistent across games").

## Capabilities

### New Capabilities

None.

### Modified Capabilities

`engine-params`; each game spec that states its own bound.

## Impact

`src/engine/game-id/params.ts`, the games' `validateParams`, the
params-stability and custom-params guards, help pages that state a limit.
