## ADDED Requirements

### Requirement: The midend repaints on every transition and rebuilds the draw state for a new tile size

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

**The engine emits no pixels of its own.** `Midend.redraw(dr)`
SHALL delegate the entire frame to `game.redraw` (between
`startDraw`/`endDraw`). It SHALL NOT emit a background-fill rectangle,
a clear, or any other paint operation that overwrites what the game
last drew. Background and one-time setup (grid lines, board border,
fixed-position artwork) SHALL be the game's responsibility, painted
in its `!ds.started` branch and re-fired on a fresh drawstate.

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
  `redraw` SHALL paint from scratch.

- `Midend.canvasCleared()` — the signal that the canvas backing
  store has been reset by `Drawing.resize` (`alpha:false` clears to
  opaque black on every `canvas.width=` write). The midend SHALL
  discard the per-game drawstate and construct a fresh one via
  `game.newDrawState` at the current tile size. The next `redraw`
  SHALL therefore see `!ds.started` and the game SHALL paint from
  scratch, including its own background. The worker adapter SHALL
  invoke this from `resizeDrawing` immediately after `Drawing.resize`.

- `Midend.forceRedraw(dr)` — palette or font replacement does not
  clear the canvas but invalidates the color/font choices baked
  into cached tiles. `forceRedraw` SHALL discard the drawstate (the
  same effect as `canvasCleared`) and immediately call `redraw(dr)`;
  the game's `!ds.started` branch paints a fresh frame over the
  old pixels, in the new palette/font. The worker adapter SHALL
  invoke `forceRedraw` when `setDrawingPalette` or
  `setDrawingFontInfo` replaces an already-installed value.

A startup invariant: a drawstate created by `startFrom` (newGame /
newGameFromId / loadGame) SHALL have `started=false` (or its
per-game equivalent), so the first `redraw` after a new game paints
the bg + one-time setup via the game's first-paint branch.

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
  `redraw` to emit a background fill
- **AND** the per-tile cache the game holds survives unchanged

#### Scenario: A new tile size arrives as a fresh drawstate

- **WHEN** `size()` resolves a tile size different from the current one
- **THEN** the midend replaces the drawstate with one built at the new
  tile size
- **AND** the next `redraw(dr)` causes the game's `!ds.started` branch
  to run, so no tile cached at the old size is ever drawn again

#### Scenario: A real canvas clear invalidates the drawstate

- **WHEN** the worker adapter calls `Midend.canvasCleared()` after
  `Drawing.resize` reset the canvas backing store
- **THEN** the midend discards the per-game drawstate and constructs
  a fresh one (with `started=false` and any cache cleared)
- **AND** the next `redraw(dr)` causes the game's `!ds.started`
  branch to run, painting the bg + one-time setup + every tile
  fresh

#### Scenario: A palette replacement repaints without clearing the canvas

- **WHEN** the worker adapter receives a `setDrawingPalette` call that
  replaces an already-installed palette (e.g. the user toggles
  light/dark mode)
- **THEN** the adapter calls `engine.forceRedraw(dr)`, which discards
  the drawstate and runs `redraw`
- **AND** the game's `!ds.started` branch paints the full frame in
  the new palette over the existing canvas content — the framework
  itself emits no overpaint

#### Scenario: `Midend.redraw` emits no draw ops of its own

- **WHEN** `Midend.redraw(dr)` is called
- **THEN** the only ops it emits directly are `startDraw` and
  `endDraw`; every other paint operation in the recording originates
  from `game.redraw`
- **AND** there is no framework-level background fill, clear, or
  full-window overpaint

### Requirement: The capability snapshot records the draw state its constructor builds

The derived capability snapshot SHALL record the field names of a game's **draw
state** as well as of its `Ui`, so that a divergence in either is a reviewable
line in a text diff rather than something a reader must go looking for.

It SHALL record names only — not sizes, values or types — so that the snapshot
moves when a game's vocabulary moves and at no other time. A snapshot that moves
for unrelated reasons trains its readers to re-baseline without reading.

The snapshot SHALL continue to assert nothing about *which* names a game may
use. An approved vocabulary would be a manifest, which a game can be written
without and nothing would notice; the snapshot's whole job is to make a change
visible, not to permit or forbid one.

It SHALL read the draw state **as `newDrawState` returns it** at the game's
preferred tile size, before any `redraw`. A draw state is built at its size and
no step of the `Game` contract assigns into it afterwards, so that is the only
reading there is: no later step can put a field back that the constructor lost
before its names are taken.

#### Scenario: a shared mechanic is added to several games at once

- **GIVEN** a mechanic that several games remember in their draw state
- **WHEN** the snapshot is next taken
- **THEN** the field appears against each of those games in one place
- **AND** no assertion is made about what it should be called

#### Scenario: a game's draw state loses a field

- **GIVEN** a change that removes a field from one game's draw state
- **WHEN** the suite runs
- **THEN** the snapshot moves, and the loss is visible in the diff
- **AND** this holds for every field the game's `newDrawState` builds,
  including those it derives from the tile size

### Requirement: Fit-to-window sizing fills the slot

`Midend.size(maxSize)` SHALL resolve the tile size as upstream `midend_size`
does in its user-size form: the largest integer tile size whose `computeSize`
result fits `maxSize` (binary search), growing beyond the game's preferred tile
size when the slot allows, so that a game occupies the layout slot it is given
rather than freezing at its preferred size. Capping the board at a multiple of
its preferred size is the `maxScale` setting's job, and it does so by shrinking
`maxSize` before the call. What the call does to the draw state is stated by
"The midend repaints on every transition and rebuilds the draw state for a new
tile size".

#### Scenario: A large slot expands the board

- **WHEN** `size` is called on a slot much larger than the preferred-size board
- **THEN** the resolved tile size exceeds the preferred tile size and the
  returned window size fits the slot

## MODIFIED Requirements

### Requirement: A game is handed a draw state, never the absence of one

`Game.newDrawState` and `Game.redraw` SHALL be required members, and the draw
state passed to `Game.redraw` and `Game.interpretMove` SHALL be non-null and
SHALL have been built at the tile size it is drawn at.

`Game.newDrawState` SHALL receive the tile size as an argument, and the `Game`
contract SHALL have no separate step that sizes an existing draw state. A draw
state is therefore at one tile size for its whole life: the midend SHALL build
a new one whenever the tile size changes, so no caller can hold a draw state
whose tile size was never set or has since gone stale. The midend SHALL decline
to redraw or to interpret input when no game has been set up.

This exists because the alternative was measured: while `newDrawState` was
optional, fifty-five games opened `redraw` with a guard against a null the
engine could not produce, and fifty-seven mapped pointer coordinates through a
`ds?.tilesize ?? PREFERRED_TILE_SIZE` fallback — not inert, but a silent wrong
answer waiting for a null that would have sent every click to the wrong cell.
And while sizing was a second step, ten games wrote their own invalidation for a
live draw state re-sized under them — nine in the sizing hook, and Map in
`redraw`, reallocating its blitter when the tile size moved (measured
2026-09-15).

#### Scenario: A game reads the tile size it is actually drawn at

- **WHEN** a game's `interpretMove` maps a pointer coordinate to a cell
- **THEN** it reads the tile size from the draw state it was passed, with no
  fallback, because the midend guarantees that value is set

#### Scenario: No board, no paint

- **WHEN** `redraw` or `processInput` is called before a game has been set up
- **THEN** the midend returns without calling into the game

#### Scenario: A game writes no resize invalidation

- **WHEN** the tile size changes
- **THEN** the game receives a draw state built at the new size
- **AND** no game code runs against a draw state built at the old size

## REMOVED Requirements

### Requirement: The midend repaints on every transition and drives the animation timer

**Reason**: Its scenario "`Midend.size` is purely informational" states that
`size()` never replaces the draw state, and a `size()` that resolves a new tile
size now does; its text also has `size()` inform the game via `setTileSize`,
which no longer exists. Keeping the heading over a narrowed body would leave a
heading describing a case the requirement no longer allows.

**Migration**: Replaced by "The midend repaints on every transition and rebuilds
the draw state for a new tile size", which carries every other scenario verbatim,
restates the same-tile-size promise as "A layout jiggle at the same tile size
touches nothing", and adds "A new tile size arrives as a fresh drawstate".

### Requirement: Fit-to-window sizing honors user-size expansion

**Reason**: It names an `isUserSize` parameter that `Midend.size(maxSize)` does
not take — the board always fills its slot, and `maxScale` caps the slot before
the call — so its scenario "Without user-size the preferred size is the ceiling"
describes a call nothing can make. It also calls `size()` "purely
informational", which a new tile size no longer is.

**Migration**: Replaced by "Fit-to-window sizing fills the slot", which carries
"A large slot expands the board" without the user-size flag.

### Requirement: The capability snapshot covers both halves of what a game remembers

**Reason**: It required reading the draw state before `setTileSize`, and its
scenario "a game assigns a draw-state field only once its tile size is known"
required a test comparing sized and unsized readings. `Game.setTileSize` no
longer exists, so there is one reading and the hazard cannot be written.

**Migration**: Replaced by "The capability snapshot records the draw state its
constructor builds", which carries the two surviving scenarios. The comparison
test ("loses nothing by reading the draw state before it is sized") is deleted.
