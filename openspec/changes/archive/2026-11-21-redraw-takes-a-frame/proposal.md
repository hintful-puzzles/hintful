## Why

`architectural-review-second-pass` item 3 (owner accepted every item,
2026-11-21). `Game.redraw` takes 11 positional parameters (`dr, ds, prev, s,
dir, ui, animTime, flash, hint, mistakes, deadEnd`). Measured at
`22ba4e45f` over `src/games/*/render.ts`: 54 games name `_dir` only to
ignore it, 49 `_prev`, 47 `_animTime`. A new frame input is a signature edit
in every game, as `deadEnd` was.

## What Changes

- `redraw(dr, ds, frame)`, where `frame` holds the state, the previous
  state and direction, the `Ui`, animation time, flash, hint step,
  mistakes and dead end. A game destructures what it reads.
- Every game, the shared renderers and the skeletons move; the midend
  builds the frame once.
- No behavior change; no render snapshot moves.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None: the contract's requirements say what a frame shows, not the
signature. Add a delta if one names it.

## Impact

`src/engine/contract/game.ts`, `src/engine/midend/`, every `render.ts`,
`src/engine/edge-clue-latin/render.ts`, the shared grid renderers,
`src/skeleton/*/render.ts`, `docs/rendering.md`.
