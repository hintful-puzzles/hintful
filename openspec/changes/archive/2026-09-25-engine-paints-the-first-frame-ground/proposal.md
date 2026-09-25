# engine-paints-the-first-frame-ground

Found by `test-touch-on-a-real-device` (2026-09-24). See its
`device-report.md` § "Found on the way: four boards framed in unpainted
canvas".

## Why

The frontend's canvas is opaque, so every resize resets it to black, and the
`ts-engine` spec says the engine "emits no pixels of its own": each game's
`!ds.started` branch must fill the whole canvas itself. Four games did not.
Pegs and Sixteen shipped framed in a black square, and Mines and Pearl with a
thin black ring. Every snapshot stayed green. Those four now fill, and
`src/engine/first-frame-coverage.test.ts` holds every game to it.

The guard stops the defect from coming back. It does not remove the
decision. Filling the canvas in the background color is not about any
puzzle, and no game would legitimately want to leave pixels black. Yet each
game still writes the line, each with its own spelling of the canvas size
(`computeSize(...)`, `size`, `fullW`, `aw + 2 * BORDER`, `ts * w + 2 * b`,
`drawWidth`). That is the shape AGENTS.md § "A consistent idiom is not the
finish line; the framework owning it is" describes.

Upstream's midend owned it (`midend_redraw`, `first_draw`: "we also don't want
to require every single game to go to the effort of clearing the window").
`b49bfdb8` withdrew that for a reason that has since gone. The fill was armed
by *every* `Midend.size()` call, and the frontend calls `size()` on every
layout tick, so it flickered. Today `size()` has no side effects at an
unchanged tile size, and a fresh drawstate happens only when the canvas really
was cleared, the palette replaced or the tile size changed. Each of those
already repaints everything.

## What would change

- `Midend.redraw` fills `computeSize(params, tileSize)` with color 0 before
  `game.redraw`, on the first redraw of a fresh drawstate only. `size()` never
  arms it.
- The `ts-engine` requirement stating "the engine emits no pixels of its own"
  is replaced, by `REMOVED` + `ADDED`, with one where the engine lays the
  ground and the game paints everything above it.
- Each game's own color-0 full-canvas fill is deleted, with the full-canvas
  `drawUpdate` beside it. A game whose ground is another color (Rect,
  Untangle) keeps its fill, which is the override. Bricks, named here at
  scaffolding as the override, is not one: its `COL_MIDLIGHT` is color 0.
  A game that repaints its whole board every frame (Cube, Loopy) keeps its
  fill too, because that fill erases the previous frame.
- `first-frame-coverage.test.ts` stays, and now checks the engine too.

## Costs to weigh before starting

- Every game's first-frame render snapshot gains or loses one rect. That is a
  mechanical re-baseline, verified by shape: every changed snapshot line is
  that rect. (Measured: most snapshots did not change, because the game's fill
  was its first op with the same rectangle and color the midend now draws.
  Twenty-five did, in four shapes, each checked line by line: Clusters and
  Sticks had filled one pixel past their canvas, so the ground is 1px smaller;
  Loopy, Rect and Untangle gain the ground under their own fill; and a Subsets
  test that calls `redraw` without a midend loses the fill.)
- Before deleting a game's fill, check that the game does not repaint its
  ground on a *later* frame. A flash that recolors the ground, for example,
  needs its own fill.
