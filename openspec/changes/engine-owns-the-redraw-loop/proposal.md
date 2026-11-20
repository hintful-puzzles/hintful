## Why

`architectural-review` item 1, the largest per-game repetition in the tree
(owner accepted every item, 2026-11-20). Measured at `9faabdf61`:
`fl 'function redraw'` → 63 games, 9,272 lines; 58 games build an
`Int32Array(n).fill(-1)` tile cache; `const COL_X = n` slots in 63 games,
847 lines; `colors(bg)` in 57 games, 1,243 lines, writing the same roles
(flash, hint, error, background, cursor) slot by slot. The engine supplies the
parts (`OverlaySidecar`, `HintMarks`, `winSlot`, `sweepStep`,
`color/palette.ts`) but every game assembles them by hand.

Second in the owner's order: 8, 1, 6, 10, 7, 11, 9. The scene-graph contract
withdrawn in May 2026 is history, not a constraint (owner, 2026-11-20: "old
decisions are very likely no longer relevant"). This change keeps games
drawing their own tiles imperatively; only the loop and the color roles move.

## What Changes

- An engine module beside `src/engine/draw.ts` that owns the tile-cache
  redraw: the draw state's cache and first frame, the loop that keys each
  tile, skips a cache hit unless the hint sidecar marks it stale, draws,
  updates and commits, and the win flash, cursor and hint-mark bookkeeping.
  The unit is a keyed tile: a game supplies its tiles, a key for each and
  `drawTile`. A board that is not a set of tiles (Untangle, Cube, Net's
  rotations, whatever the census finds) keeps the explicit form.
- The palette's shared roles are declared once and filled by the engine; a
  game writes only its own colors.
- Games migrate one at a time, each run in the app (rendering, animation,
  hint marks, flash, cursor) before it counts as moved.
- No intended player-visible change; frame time is measured against HEAD on
  the pilot and on the heaviest boards.

## Impact

`src/engine/` (new module), every `src/games/*/render.ts`,
`src/skeleton/*/render.ts`, render-scenario snapshots that move,
`docs/rendering.md`.
