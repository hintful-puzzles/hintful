# engine-drawing Specification

## Purpose
Drawing: the shared drawing helpers, the draw state a game is handed, how the
midend repaints and sizes a board, and the guard that a warm frame matches a
fresh paint.

## Requirements

### Requirement: The engine provides a shared recessed-border drawing helper

The engine SHALL provide `drawRecessedBorder(dr, bounds, inset, highlight,
lowlight)` in `src/engine/draw.ts`, where `bounds` is the playfield's
outer pixel box (`{ left, top, right, bottom }`, edges inclusive), `inset` is the
bevel depth (the tile size), and `highlight`/`lowlight` are the two palette
colors. It SHALL draw the upstream two-pentagon recessed bevel — a top-right
highlight wedge and a bottom-left lowlight wedge — in one canonical winding.
Games that draw a beveled frame SHALL call this helper, each supplying its own
edge derivation, instead of re-deriving the polygons locally. Per-game extras
that are not the bevel (e.g. a separator rectangle just outside the grid) SHALL
remain at the call site.

#### Scenario: A beveled game draws its frame through the helper

- **WHEN** a game with a recessed border (e.g. Fifteen, Sixteen, Twiddle,
  Samegame, Flood) draws its first frame
- **THEN** it calls `drawRecessedBorder` with its computed bounds, tile size, and
  highlight/lowlight colors
- **AND** the two filled pentagons cover the same pixels the game's prior private
  copy did (the lowlight wedge is winding-independent, so traversal order does not
  change the filled region)

### Requirement: The engine provides a shared rectangle-outline drawing helper

The engine SHALL provide `drawRectOutline(dr, x, y, w, h, color)` in
`src/engine/draw.ts`, drawing a 1px-thick rectangle border via four lines
using the upstream-faithful **inclusive** convention (corners `(x,y)` to
`(x+w−1, y+h−1)`), matching upstream `draw_rect_outline`. Games drawing a
rectangle outline (cursor markers, cell borders) SHALL call this helper instead
of carrying a private copy or inlining the four `drawLine` calls.

#### Scenario: A caller draws an inclusive-convention outline

- **WHEN** a game calls `drawRectOutline(dr, x, y, w, h, color)`
- **THEN** the border spans `(x, y)`..`(x+w−1, y+h−1)` inclusive
- **AND** a caller that previously used an exclusive `x+w` convention adjusts its
  width/height argument so its drawn pixels are unchanged

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

### Requirement: The engine provides a shared raised-bevel drawing helper

The engine SHALL provide `drawRaisedTile(dr, body, tileSize, face, highlight, lowlight)` in
`src/engine/draw.ts`, where `body` is the rectangle of pixels the tile covers.
It SHALL draw the raised block over `body` — a bottom-right lowlight triangle
and a top-left highlight triangle, lowlight first, in one canonical winding —
and then `face` over the middle, inset by `raisedBevelWidth(tileSize)` on all
four sides. Games that draw a raised tile SHALL call this helper instead of
re-deriving the triangles or the inset locally. A game whose tile keeps a grid
line SHALL pass the box inside the line as `body`, so the border is the same
width on every side.

The engine SHALL provide `raisedBevelWidth(tileSize)`, returning
`max(1, floor(tileSize / 16))`. The `max(1, …)` floor is normative: without it
the inset reaches zero at small tile sizes and the face covers both triangles,
so the bevel disappears rather than thinning.

The engine SHALL also provide `drawRaisedBevel(dr, bounds, highlight, lowlight)`,
the two triangles alone over a pixel box (`{ left, top, right, bottom }`, edges
inclusive), for a relief that has no face of its own.

#### Scenario: A raised-tile game draws its bevel through the helper

- **WHEN** a game with a raised tile (e.g. Fifteen, Sixteen, Mines, Inertia,
  Sokoban, Crossing) draws a tile
- **THEN** it calls `drawRaisedTile` with that tile's own body, its face color
  and its highlight/lowlight colors
- **AND** it computes no bevel width or inner rectangle of its own

#### Scenario: A tile inside a grid line has a border on every side

- **WHEN** `drawRaisedTile` is called with a body one pixel short of the tile
  size in each direction, at any tile size
- **THEN** the face leaves `raisedBevelWidth(tileSize)` pixels of bevel on the
  left, top, right and bottom alike
- **AND** that width is at least one

#### Scenario: A pressed-in tile swaps the two colors

- **WHEN** a game draws a tile that reads as pressed in (Crossing's walls, and
  its selected digit)
- **THEN** it calls the same helper with the highlight and lowlight exchanged

#### Scenario: A game whose bevel is not two triangles keeps its own

- **WHEN** a game draws a beveled shape that is not the two-triangle block —
  Twiddle's four trapezoids meeting a center point, each taking its own
  cursor-highlight color and rotating during its animation
- **THEN** it SHALL NOT be expressed through this helper, and keeps its own
  drawing code

#### Scenario: No game re-derives the bevel

- **WHEN** each game's sample frames are read for a bevel by shape — two
  polygons drawn one after the other that split one box along its diagonal —
  and the game's calls to the shared helpers are counted while those frames
  are drawn
- **THEN** every game draws exactly as many two-triangle bevels as it made
  calls to `drawRaisedTile` and `drawRaisedBevel`
- **AND** exactly as many two-pentagon bevels as it made calls to
  `drawRecessedBorder`
- **AND** the guard fails if it found no game drawing a bevel or no call to a
  helper, so it cannot pass by reading nothing

### Requirement: The engine provides a shared centered-glyph text-options helper
The engine SHALL provide one helper returning the text options a game uses to
draw a glyph centered in a tile, and games SHALL call it rather than writing the
option object themselves.

Centering a digit in a tile is not a decision a game makes. Measured 2026-09-12,
56 copies of the same four-field object stood in 40 game files, and three games
had already pulled it into a local helper under three different names. A game
that genuinely needs different text options writes them, as the eight sites
drawing fixed-width, left- or right-aligned text already do; the helper covers
the one shape the rest share.

#### Scenario: a game draws a digit in a tile

- **WHEN** a game's renderer draws a glyph centered in a tile
- **THEN** it takes its text options from the engine helper, passing only the size
- **AND** the drawn output is identical to the literal it replaced, which the
  game's render snapshots assert

#### Scenario: a game needs different text options

- **WHEN** a game draws fixed-width or non-centered text
- **THEN** it writes the options it needs, and the helper does not grow a
  parameter to cover the case

### Requirement: A game's render test records through the shared recording drawing
A test asserting what a game draws SHALL drive the engine's shared recording
drawing rather than a double of its own, so that the record it asserts against
contains every primitive the game emitted.

A hand-rolled double records only the calls its author anticipated. A game that
begins drawing something new, or stops drawing something, leaves such a test
green, and the test reads as coverage while being a filter. Measured 2026-09-12:
18 game test files carried their own double against 37 using the shared one, and
96 of the repository's 109 `as unknown as` casts were in test files, most of them
making those doubles typecheck.

#### Scenario: a game changes what it draws

- **WHEN** a game's renderer emits a primitive it did not emit before
- **THEN** the recording contains it, whether or not the test asserts on it
- **AND** a test asserting the frame as a whole shows it as a reviewable diff

#### Scenario: a migrated test still catches its own defect

- **WHEN** a test moves from a local double to the shared recorder
- **THEN** the defect named in the test's title is planted, seen red, and restored
- **AND** a test that cannot be made red is reported as the finding it is

### Requirement: A repaint cue belongs in the tile cache before a sidecar
Where a cue can be expressed as a bit in a game's existing per-tile cache key,
the game SHOULD express it that way rather than adding a second cache keyed on
its own scalar. A second cache is a second key, and a key that stops naming one
of its inputs fails silently — the cue simply never repaints.

A game SHALL add a sidecar cache only where the cue has no tile to live in, and
SHALL then name every input the painter reads in that cache's key.

#### Scenario: a cue that has a tile available

- **GIVEN** a cue whose position coincides with a tile the game already caches
- **WHEN** the game renders it
- **THEN** it packs the cue into that tile's key rather than comparing a scalar
  on the draw state

### Requirement: The capability snapshot records the draw state its constructor builds

The derived capability snapshot SHALL record the field names of a game's **draw
state** as well as of its `Ui`, so that a divergence in either is a reviewable
line in a text diff rather than something a reader must go looking for.

It SHALL record names only — not sizes, values or types — so that the snapshot
moves when a game's vocabulary moves and at no other time. A snapshot that moves
for unrelated reasons trains its readers to re-baseline without reading.

The snapshot SHALL continue to assert nothing about *which* names a game may
use. An approved vocabulary would be a list that only this check reads, and no
mechanism consumes; a game can be written without it and nothing would notice.
The snapshot's whole job is to make a change visible, not to permit or forbid
one.

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

### Requirement: A warm frame matches a fresh paint of the same state

For every registered game, a frame drawn on a draw state that has painted earlier
frames SHALL show what the same frame shows drawn on a fresh draw state. A render
cache that repaints a tile only when its key changes breaks this whenever the
painter reads something the key does not carry — two flags sharing a bit, a value
overflowing its field, or an input the key never names — and every one of those
is invisible to a snapshot, which starts from a fresh draw state.

`src/engine/warm-repaint.test.ts` SHALL drive each game through seeded input on a
real `Midend` and compare every frame against its fresh twin
(`engine/testing/repaint-differential.ts`). The comparison SHALL claim for each
op only pixels the op surely paints, so that a difference is stale content and
never an artifact of the approximation. The population is the registry, and the
test SHALL assert that it looked at the whole registry and compared frames.

#### Scenario: A painter input is missing from the key

- **WHEN** a game paints a tile from state its cache key does not include, and
  that state changes while the key does not
- **THEN** the warm frame differs from the fresh one and the test fails, naming
  the game, the frame, the event before it and the differing pixel

#### Scenario: A packed field overflows onto another

- **WHEN** a value shifted into a key wraps onto another field's bit
- **THEN** two different draw states share a key, the warm frame keeps the older
  one, and the test fails

### Requirement: The warm-frame comparison answers for what it reached

The run behind "A warm frame matches a fresh paint of the same state" SHALL paint
the frames a player sees between two settled ones, and SHALL report what it
showed each game, because a pass says nothing about a frame the run never
painted.

- **Animation frames.** After every event it SHALL advance the midend's clock
  in steps shorter than any animation or flash in the collection, painting each
  frame until one is still. `Midend.timer` takes seconds.
- **Drag previews.** It SHALL paint a drag's preview before the drag is released.
- **Hint frames.** It SHALL show a game that has a hint its hint, and play some
  of that hint's steps. It SHALL then, on a draw state of its own, follow the
  hint's plan from the same board to its end, and check the board where the
  plan stopped. That walk MAY paint only the frame each event leaves and the
  frame it settles to.
- **Checks.** Its events SHALL include the check Check & save makes, so that a
  marked dead end is painted.
- **Counts.** It SHALL count the frames painted mid-animation, with a hint
  displayed, and with a mistake overlay, and the events after which an
  animation was armed. It SHALL record, as `role|kind`, the marks the painted
  frames carried, and every mark the renderer asked the displayed marks for
  (`StepMarks.of`).
- **What the test requires.** `src/engine/warm-repaint.test.ts` SHALL require
  that an armed animation was painted part-way. For a game with a hint, it
  SHALL require that every mark the renderer asked for, in a role the game's
  `hintMarks` legend lists, was painted by the seeded run or by a pinned
  board. It SHALL also require that every role the legend lists is one the
  renderer asks for.
- **Mistake frames** are counted and not required, because reaching a mistaken
  board takes a move specific to the game.
- **Pinned boards.** The comparison SHALL accept a game id to start from in
  place of a seeded deal. A hint mark the seeded run does not paint SHALL be
  reached from a board named in `warm-repaint.test.ts`'s ledger of pinned
  boards, as the board itself and never as a deal seed. Each pinned board
  SHALL paint a mark the seeded run does not. A mark that no board reaches
  SHALL be named, with the reason, in a ledger the test holds exact. A mark
  drawn across tiles that is not a hint mark SHALL run the comparison from a
  board that shows it, pinned in the game's own tests as the board and the
  event stream.

#### Scenario: The clock ticks in whole seconds

- **WHEN** the run advances the clock by one second or more after an event that
  armed an animation
- **THEN** the animation ends inside the tick with none of its frames painted,
  and the test fails for that game

#### Scenario: A hinted game is never shown its hint

- **WHEN** the run shows a game that has a hint no hint frame
- **THEN** the test fails for that game, rather than passing over a hint overlay
  it never painted

#### Scenario: A mark drawn across tiles outlives its flag

- **WHEN** a frame the comparison paints draws a mark across tile edges, and a
  later frame clears the mark while repainting only some of the tiles it
  crossed
- **THEN** a warm frame keeps the mark's pieces over the tiles that did not
  repaint, and the comparison fails

#### Scenario: A cross-tile mark the seeded deal never shows

- **WHEN** a game's cross-tile mark leaves its tile key, and the seeded run
  never paints that mark
- **THEN** the game's comparison from a pinned board that shows the mark fails,
  where the seeded run alone would pass

#### Scenario: A hint mark no run paints

- **WHEN** a game's renderer asks for a mark in a role its legend lists, and
  neither the seeded run nor a pinned board paints it
- **THEN** the test fails for that game and names the mark, unless the ledger
  of unreached marks names it with the reason

#### Scenario: A pin the seeded run has caught up with

- **WHEN** a pinned board paints no mark the seeded run does not
- **THEN** the test fails for that game and names the board

#### Scenario: A legend role the renderer never reads

- **WHEN** a game's legend lists a role its renderer never asks the displayed
  marks for
- **THEN** the test fails for that game, because the help's list of marks
  describes a mark the game cannot paint

#### Scenario: A frame a plan wins on

- **WHEN** a hint's plan ends on a step that solves the board, and the win
  frame leaves a cue the fresh paint does not draw
- **THEN** the walk paints that frame and the comparison fails
