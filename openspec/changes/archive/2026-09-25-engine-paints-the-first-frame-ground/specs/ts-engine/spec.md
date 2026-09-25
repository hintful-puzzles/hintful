## REMOVED Requirements

### Requirement: The midend repaints on every transition and rebuilds the draw state for a new tile size

**Reason**: It stated that the engine emits no pixels of its own, so every game
had to fill its whole canvas in color 0 on the first frame of a fresh
drawstate. That fill is not a decision about any puzzle, and four games got it
wrong. The reason the engine gave it up — `size()` armed the fill on every
layout tick, which flickered — no longer holds: a fresh drawstate now arises
only from a real canvas clear, a palette or font replacement, or a new tile
size, and each of those repaints everything anyway.

**Migration**: Replaced by "The midend repaints on every transition, rebuilds
the draw state for a new tile size, and lays the ground under a fresh one",
which keeps every surviving scenario and retires "`Midend.redraw` emits no draw
ops of its own". A game deletes its own color-0 full-canvas fill; a game whose
ground is another color keeps its fill, which paints over the midend's.

## ADDED Requirements

### Requirement: The midend repaints on every transition, rebuilds the draw state for a new tile size, and lays the ground under a fresh one

The TS midend SHALL cause the canvas to repaint after every state
transition it processes — moves, undo, redo, solve, restart, load,
and UI-only updates. A transition that changes what is displayed
SHALL NOT leave the canvas stale.

For games that animate, the midend SHALL drive the animation/flash
timer: it SHALL obtain the animation and
flash durations from the game, run the timer while either an
animation/flash is in progress or a timed-clock game is running, paint
each animation frame, and settle to a final clean paint when the
animation completes. A non-animated transition SHALL paint once;
animation frames (including the first) SHALL be driven by the timer
rather than by an extra synchronous paint that would race the timer.

**The engine lays the ground; the game paints everything above it.** On
the first `Midend.redraw(dr)` of a fresh drawstate, and on no other,
the midend SHALL fill the rectangle `(0, 0)`–`computeSize(params,
tileSize)` in color 0 and report it with `drawUpdate`, after
`startDraw` and before `game.redraw`. Only building a fresh drawstate
SHALL arm the ground; `size()` at an unchanged tile size SHALL NOT. On
every other redraw the midend SHALL emit no paint operation of its own
between `startDraw` and `endDraw`. Everything above the ground —
one-time setup such as grid lines, board border and fixed artwork, and
every tile — SHALL be the game's responsibility, painted on the first
frame of a fresh drawstate. A game SHALL NOT repeat the color-0
full-canvas fill; a game whose ground is another color SHALL paint that
fill itself on its first frame, over the midend's.

**Canvas-cleared / cache-stale signals.** The engine SHALL expose:

- `Midend.size(maxSize): Size` — SHALL compute and return the puzzle's
  pixel size at the resolved tile size. **When the resolved tile size is
  unchanged** it SHALL have no other effect: it SHALL NOT recreate the
  drawstate, invalidate any per-tile cache, or schedule any
  framework-emitted overpaint. The frontend may call `size()` on every
  layout perturbation (any element-size change goes through it via
  `src/puzzle/components/view.ts`'s `ResizeController`); a side-effecting call there
  would wipe caches at unrelated moments and cause spurious full
  repaints. **When the resolved tile size changes**, every tile the
  game has cached is at the wrong size, so the midend SHALL replace the
  drawstate with a fresh one built at the new tile size, and the next
  `redraw` SHALL lay the ground and paint from scratch.

- `Midend.canvasCleared()` — the signal that the canvas backing
  store has been reset by `Drawing.resize` (`alpha:false` clears to
  opaque black on every `canvas.width=` write). The midend SHALL
  discard the per-game drawstate and construct a fresh one via
  `game.newDrawState` at the current tile size. The next `redraw`
  SHALL therefore lay the ground, and the game SHALL paint from
  scratch over it. The worker adapter SHALL
  invoke this from `resizeDrawing` immediately after `Drawing.resize`.

- `Midend.forceRedraw(dr)` — palette or font replacement does not
  clear the canvas but invalidates the color/font choices baked
  into cached tiles. `forceRedraw` SHALL discard the drawstate (the
  same effect as `canvasCleared`) and immediately call `redraw(dr)`,
  which lays the ground in the new palette and lets the game paint a
  fresh frame over it, in the new palette/font. The worker adapter SHALL
  invoke `forceRedraw` when `setDrawingPalette` or
  `setDrawingFontInfo` replaces an already-installed value.

A startup invariant: a drawstate created by `startFrom` (newGame /
newGameFromId / loadGame) SHALL be fresh, so the first `redraw` after
a new game lays the ground and the game paints its one-time setup and
every tile.

#### Scenario: A processed move repaints

- **WHEN** the midend processes a move, undo, redo, solve, restart,
  load, or UI-only update
- **THEN** a repaint of the canvas is requested for that transition
- **AND** the displayed board reflects the new state without requiring
  any further external redraw call

#### Scenario: An animated move is driven by the timer to completion

- **WHEN** a move on an animating game is processed
- **THEN** the midend arms the animation/flash timer and the canvas is
  repainted on each timer tick through the animation
- **AND** when the animation and flash complete the midend settles
  with a final paint of the resting state and releases the timer

#### Scenario: A layout jiggle at the same tile size touches nothing

- **WHEN** the frontend calls `size()` repeatedly at slots that resolve
  to the same tile size (e.g. on every ResizeController tick, including
  ones with no actual canvas-size change)
- **THEN** the midend computes and returns the pixel size but DOES NOT
  recreate the drawstate, change drawstate identity, or cause the next
  `redraw` to lay the ground
- **AND** the per-tile cache the game holds survives unchanged

#### Scenario: A new tile size arrives as a fresh drawstate

- **WHEN** `size()` resolves a tile size different from the current one
- **THEN** the midend replaces the drawstate with one built at the new
  tile size
- **AND** the next `redraw(dr)` lays the ground and the game repaints
  from scratch, so no tile cached at the old size is ever drawn again

#### Scenario: A real canvas clear invalidates the drawstate

- **WHEN** the worker adapter calls `Midend.canvasCleared()` after
  `Drawing.resize` reset the canvas backing store
- **THEN** the midend discards the per-game drawstate and constructs
  a fresh one with any cache cleared
- **AND** the next `redraw(dr)` lays the ground, and the game paints
  its one-time setup and every tile fresh over it

#### Scenario: A palette replacement repaints without clearing the canvas

- **WHEN** the worker adapter receives a `setDrawingPalette` call that
  replaces an already-installed palette (e.g. the user toggles
  light/dark mode)
- **THEN** the adapter calls `engine.forceRedraw(dr)`, which discards
  the drawstate and runs `redraw`
- **AND** the ground and the game's full frame are painted in the new
  palette over the existing canvas content

#### Scenario: The ground is the first thing a fresh drawstate's frame paints

- **WHEN** `Midend.redraw(dr)` runs on a fresh drawstate
- **THEN** the first paint operation is a color-0 rectangle at
  `(0, 0)` the size `computeSize` reports at the current tile size,
  followed by a `drawUpdate` of the same rectangle
- **AND** every other paint operation in the frame comes from
  `game.redraw`, after it

#### Scenario: A later redraw emits no draw ops of the engine's own

- **WHEN** `Midend.redraw(dr)` runs again on the same drawstate
- **THEN** the only ops it emits directly are `startDraw` and
  `endDraw`; every paint operation in the recording originates from
  `game.redraw`

#### Scenario: Every game's first frame covers its canvas

- **WHEN** any registered game's first frame is rasterized at its
  default parameters
- **THEN** no pixel of the canvas `computeSize` reports is left
  unpainted
