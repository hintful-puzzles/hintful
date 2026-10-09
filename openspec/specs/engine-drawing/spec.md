# engine-drawing Specification

## Purpose
Drawing: the shared drawing helpers, the draw state a game is handed, how the
midend repaints and sizes a board, and the guard that a warm frame matches a
fresh paint.

## Requirements

### Requirement: The engine provides a shared recessed-border drawing helper

The engine SHALL provide `drawRecessedBorder(dr, bounds, inset, highlight,
lowlight)` in `src/engine/draw.ts`, where `bounds` is the playfield's outer
pixel box (`{ left, top, right, bottom }`, edges inclusive), `inset` is the
bevel depth (the tile size), and `highlight` and `lowlight` are the two palette
colors. It SHALL draw the two-pentagon recessed bevel, a highlight wedge along
the bottom and right edges and a lowlight wedge along the top and left, in one
canonical winding.

#### Scenario: The two wedges split the frame along its diagonal

- **WHEN** `drawRecessedBorder` is called with a box, an inset and two colors
- **THEN** it draws two filled five-point polygons, one in each color
- **AND** the two share the two vertices on the box's diagonal, each `inset`
  inside its corner

### Requirement: A game draws its beveled frame through the recessed-border helper

Games that draw a beveled frame SHALL call `drawRecessedBorder`, each supplying
its own edge derivation, instead of re-deriving the polygons locally. Per-game
extras that are not the bevel, such as a separator rectangle just outside the
grid, SHALL remain at the call site.

#### Scenario: A beveled game draws its frame through the helper

- **WHEN** a game with a recessed border (Fifteen, Sixteen, Twiddle) draws its
  first frame
- **THEN** it calls `drawRecessedBorder` with its computed bounds, tile size, and
  highlight and lowlight colors

### Requirement: The engine provides a shared rectangle-outline drawing helper

The engine SHALL provide `drawRectOutline(dr, x, y, w, h, color)` in
`src/engine/draw.ts`, drawing a rectangle border as four lines in the
**inclusive** convention (corners `(x, y)` to `(x+w−1, y+h−1)`). The border
SHALL be one pixel thick unless the caller passes a thickness as a seventh
argument. Games drawing a rectangle outline (cursor markers, cell borders)
SHALL call this helper instead of carrying a private copy or inlining the four
`drawLine` calls.

#### Scenario: A caller draws an inclusive-convention outline

- **WHEN** a game calls `drawRectOutline(dr, x, y, w, h, color)`
- **THEN** the border spans `(x, y)`..`(x+w−1, y+h−1)` inclusive
- **AND** a caller that thinks in an exclusive `x+w` convention adjusts its
  width and height arguments to draw the pixels it means

### Requirement: A game is handed a draw state, never the absence of one

`Game.newDrawState` and `Game.redraw` SHALL be required members, and the draw
state passed to `Game.redraw` and `Game.interpretMove` SHALL be non-null and
SHALL have been built at the tile size it is drawn at. The midend SHALL decline
to redraw or to interpret input when no game has been set up.

#### Scenario: A game reads the tile size it is actually drawn at

- **WHEN** a game's `interpretMove` maps a pointer coordinate to a cell
- **THEN** it reads the tile size from the draw state it was passed, with no
  fallback, because the midend guarantees that value is set

#### Scenario: No board, no paint

- **WHEN** `redraw` or `processInput` is called before a game has been set up
- **THEN** the midend returns without calling into the game

### Requirement: A draw state is at one tile size for its whole life

`Game.newDrawState` SHALL receive the tile size as an argument, and the `Game`
contract SHALL have no separate step that sizes an existing draw state. The
midend SHALL build a new draw state whenever the tile size changes, so no
caller can hold a draw state whose tile size was never set or has since gone
stale.

#### Scenario: A game writes no resize invalidation

- **WHEN** the tile size changes
- **THEN** the game receives a draw state built at the new size
- **AND** no game code runs against a draw state built at the old size

### Requirement: The engine provides a shared raised-bevel drawing helper

The engine SHALL provide `drawRaisedTile(dr, body, tileSize, face, highlight,
lowlight)` in `src/engine/draw.ts`, where `body` is the rectangle of pixels the
tile covers. It SHALL draw the raised block over `body`, a bottom-right
lowlight triangle and a top-left highlight triangle, lowlight first, in one
canonical winding, and then `face` over the middle, inset by
`raisedBevelWidth(tileSize)` on all four sides.

#### Scenario: A tile inside a grid line has a border on every side

- **WHEN** `drawRaisedTile` is called with a body one pixel short of the tile
  size in each direction, at any tile size
- **THEN** the face leaves `raisedBevelWidth(tileSize)` pixels of bevel on the
  left, top, right and bottom alike
- **AND** that width is at least one

### Requirement: The raised bevel's width never reaches zero

The engine SHALL provide `raisedBevelWidth(tileSize)`, returning
`max(1, floor(tileSize / 16))`. The `max(1, …)` floor is normative: without it
the inset reaches zero at small tile sizes and the face covers both triangles,
so the bevel disappears rather than thinning.

#### Scenario: A small tile keeps a one-pixel bevel

- **WHEN** `raisedBevelWidth` is called with a tile size below sixteen
- **THEN** it returns one

### Requirement: The engine provides the raised bevel without a face

The engine SHALL provide `drawRaisedBevel(dr, bounds, highlight, lowlight)`,
the two triangles alone over a pixel box (`{ left, top, right, bottom }`, edges
inclusive), for a relief that has no face of its own.

#### Scenario: A relief with no face

- **WHEN** `drawRaisedBevel` is called with a box and two colors
- **THEN** it draws the lowlight triangle over the bottom-right half and then
  the highlight triangle over the top-left half
- **AND** it draws no rectangle over them

### Requirement: A game draws a raised tile through the shared helper

Games that draw a raised tile SHALL call `drawRaisedTile` instead of
re-deriving the triangles or the inset locally. A game whose tile keeps a grid
line SHALL pass the box inside the line as `body`, so the border is the same
width on every side. A beveled shape that is not the two-triangle block SHALL
NOT be expressed through this helper, and keeps its own drawing code.

#### Scenario: A raised-tile game draws its bevel through the helper

- **WHEN** a game with a raised tile (Fifteen, Sixteen) draws a tile
- **THEN** it calls `drawRaisedTile` with that tile's own body, its face color
  and its highlight and lowlight colors
- **AND** it computes no bevel width or inner rectangle of its own

#### Scenario: A pressed-in tile swaps the two colors

- **WHEN** a game draws a tile that reads as pressed in
- **THEN** it calls the same helper with the highlight and lowlight exchanged

#### Scenario: A game whose bevel is not two triangles keeps its own

- **WHEN** a game draws a beveled shape that is not the two-triangle block:
  Twiddle's four trapezoids meeting a center point, each taking its own
  cursor-highlight color and rotating during its animation
- **THEN** it SHALL NOT be expressed through this helper, and keeps its own
  drawing code

### Requirement: No game re-derives a bevel

A cross-game guard SHALL read each game's sample frames for a bevel by shape,
two polygons drawn one after the other that split one box along its diagonal,
and count the game's calls to the shared helpers while those frames are drawn.
Every game SHALL draw exactly as many two-triangle bevels as it made calls to
`drawRaisedTile` and `drawRaisedBevel`, and exactly as many two-pentagon bevels
as it made calls to `drawRecessedBorder`.

#### Scenario: A game draws a bevel of its own

- **WHEN** a game's frames hold a two-triangle or a two-pentagon bevel that no
  call to a shared helper drew
- **THEN** the guard fails for that game

#### Scenario: The guard reads nothing

- **WHEN** the guard finds no game drawing a bevel, or no call to a helper
- **THEN** it fails, so it cannot pass by reading nothing

### Requirement: The engine provides a shared centered-glyph text-options helper

The engine SHALL provide one helper returning the text options a game uses to
draw a glyph centered in a tile, and games SHALL call it rather than writing
the option object themselves, because centering a digit in a tile is not a
decision a game makes. A game that needs different text
options, for fixed-width or left- or right-aligned text, SHALL write them, and
the helper SHALL NOT grow a parameter to cover the case.

#### Scenario: a game draws a digit in a tile

- **WHEN** a game's renderer draws a glyph centered in a tile
- **THEN** it takes its text options from the engine helper, passing only the size

#### Scenario: a game needs different text options

- **WHEN** a game draws fixed-width or non-centered text
- **THEN** it writes the options it needs, and the helper does not grow a
  parameter to cover the case

### Requirement: A game's render test records through the shared recording drawing

A test asserting what a game draws SHALL drive the engine's shared recording
drawing rather than a double of its own, so that the record it asserts against
contains every primitive the game emitted. A hand-rolled double records only
the calls its author anticipated, so a game that begins drawing something new,
or stops drawing something, leaves such a test green.

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
of its inputs fails silently: the cue simply never repaints.

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
line in a text diff rather than something a reader must go looking for. It
SHALL record names only, not sizes, values or types, so that the snapshot moves
when a game's vocabulary moves and at no other time.

#### Scenario: a game's draw state loses a field

- **GIVEN** a change that removes a field from one game's draw state
- **WHEN** the suite runs
- **THEN** the snapshot moves, and the loss is visible in the diff

### Requirement: The capability snapshot permits and forbids no name

The capability snapshot SHALL continue to assert nothing about *which* names a
game uses in its draw state or its `Ui`. Its whole job is to make a change
visible, not to permit or forbid one: an approved vocabulary would be a list
that only this check reads and no mechanism consumes.

#### Scenario: a shared mechanic is added to several games at once

- **GIVEN** a mechanic that several games remember in their draw state
- **WHEN** the snapshot is next taken
- **THEN** the field appears against each of those games in one place
- **AND** no assertion is made about what it should be called

### Requirement: The capability snapshot reads the draw state as newDrawState returns it

The capability snapshot SHALL read a game's draw state **as `newDrawState`
returns it** at the game's preferred tile size, before any `redraw`. A draw
state is built at its size and no step of the `Game` contract assigns into it
afterwards, so no later step can put back a field the constructor lost before
its names are taken.

#### Scenario: a field built from the tile size

- **GIVEN** a game whose `newDrawState` builds a field from the tile size it is
  handed
- **WHEN** a change removes that field
- **THEN** the snapshot moves, as it does for every other field `newDrawState`
  builds

### Requirement: Fit-to-window sizing fills the slot

`Midend.size(maxSize)` SHALL resolve the tile size as the largest integer tile
size whose `computeSize` result fits `maxSize` (binary search), growing beyond
the game's preferred tile size when the slot allows, so that a game occupies
the layout slot it is given rather than freezing at its preferred size. Capping
the board at a multiple of its preferred size is the `maxScale` setting's job,
and it SHALL do so by shrinking `maxSize` before the call.

#### Scenario: A large slot expands the board

- **WHEN** `size` is called on a slot much larger than the preferred-size board
- **THEN** the resolved tile size exceeds the preferred tile size and the
  returned window size fits the slot

### Requirement: The midend repaints on every transition, rebuilds the draw state for a new tile size, and lays the ground under a fresh one

The midend SHALL cause the canvas to repaint after every state transition it
processes: moves, undo, redo, solve, restart, load, and UI-only updates. A
transition that changes what is displayed SHALL NOT leave the canvas stale. The
timer that paints an animation, the ground under a fresh draw state, and the
three signals that a draw state is stale are each stated by the requirements
that follow this one.

#### Scenario: A processed move repaints

- **WHEN** the midend processes a move, undo, redo, solve, restart,
  load, or UI-only update
- **THEN** a repaint of the canvas is requested for that transition
- **AND** the displayed board reflects the new state without requiring
  any further external redraw call

### Requirement: The midend drives the animation and flash timer

For games that animate, the midend SHALL obtain the animation and flash
durations from the game, run the timer while an animation or flash is in
progress or a timed-clock game is running, paint each animation frame, and
settle to a final clean paint when the animation completes. A non-animated
transition SHALL paint once. Animation frames, including the first, SHALL be
driven by the timer rather than by an extra synchronous paint that would race
the timer.

#### Scenario: An animated move is driven by the timer to completion

- **WHEN** a move on an animating game is processed
- **THEN** the midend arms the animation/flash timer and the canvas is
  repainted on each timer tick through the animation
- **AND** when the animation and flash complete the midend settles
  with a final paint of the resting state and releases the timer

### Requirement: The midend lays the ground under a fresh draw state's first frame

On the first `Midend.redraw(dr)` of a fresh draw state, and on no other, the
midend SHALL fill the rectangle `(0, 0)`–`computeSize(params, tileSize)` in
color 0 and report it with `drawUpdate`, after `startDraw` and before
`game.redraw`. Only building a fresh draw state SHALL arm the ground; `size()`
at an unchanged tile size SHALL NOT. On every other redraw the midend SHALL
emit no paint operation of its own between `startDraw` and `endDraw`.

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

### Requirement: The game paints everything above the ground

Everything above the ground SHALL be the game's responsibility, painted on the
first frame of a fresh draw state: one-time setup such as grid lines, board
border and fixed artwork, and every tile. A game SHALL NOT repeat the color-0
full-canvas fill. A game whose ground is another color SHALL paint that fill
itself on its first frame, over the midend's.

#### Scenario: A game whose ground is another color

- **WHEN** a game whose ground is not color 0 paints the first frame of a fresh
  draw state
- **THEN** its own full-canvas fill follows the midend's color-0 rectangle in
  the frame, and its setup and tiles follow that

### Requirement: Midend.size at an unchanged tile size has no other effect

`Midend.size(maxSize): Size` SHALL compute and return the puzzle's pixel size
at the resolved tile size. When the resolved tile size is unchanged it SHALL
have no other effect: it SHALL NOT recreate the draw state, invalidate any
per-tile cache, or schedule any framework-emitted overpaint. The frontend calls
`size()` on every layout perturbation, so a side effect there would wipe caches
at unrelated moments and cause spurious full repaints.

#### Scenario: A layout jiggle at the same tile size touches nothing

- **WHEN** the frontend calls `size()` repeatedly at slots that resolve
  to the same tile size (e.g. on every ResizeController tick, including
  ones with no actual canvas-size change)
- **THEN** the midend computes and returns the pixel size but DOES NOT
  recreate the drawstate, change drawstate identity, or cause the next
  `redraw` to lay the ground
- **AND** the per-tile cache the game holds survives unchanged

### Requirement: Midend.size replaces the draw state when the tile size changes

When `Midend.size(maxSize)` resolves a tile size different from the current
one, every tile the game has cached is at the wrong size, so the midend SHALL
replace the draw state with a fresh one built at the new tile size, and the
next `redraw` SHALL lay the ground and paint from scratch.

#### Scenario: A new tile size arrives as a fresh drawstate

- **WHEN** `size()` resolves a tile size different from the current one
- **THEN** the midend replaces the drawstate with one built at the new
  tile size
- **AND** the next `redraw(dr)` lays the ground and the game repaints
  from scratch, so no tile cached at the old size is ever drawn again

### Requirement: Midend.canvasCleared discards the draw state after a canvas clear

The engine SHALL expose `Midend.canvasCleared()`, the signal that
`Drawing.resize` has reset the canvas backing store: an opaque canvas clears to
black on every write of its size. The midend SHALL discard the per-game draw
state and construct a fresh one via `game.newDrawState` at the current tile
size, so the next `redraw` lays the ground and the game paints from scratch
over it. The worker adapter SHALL invoke it from `resizeDrawing` immediately
after `Drawing.resize`.

#### Scenario: A real canvas clear invalidates the drawstate

- **WHEN** the worker adapter calls `Midend.canvasCleared()` after
  `Drawing.resize` reset the canvas backing store
- **THEN** the midend discards the per-game drawstate and constructs
  a fresh one with any cache cleared
- **AND** the next `redraw(dr)` lays the ground, and the game paints
  its one-time setup and every tile fresh over it

### Requirement: Midend.forceRedraw repaints from a fresh draw state without a canvas clear

The engine SHALL expose `Midend.forceRedraw(dr)` for a replacement that does
not clear the canvas but invalidates the color and font choices baked into
cached tiles. It SHALL discard the draw state, the same effect as
`canvasCleared`, and immediately call `redraw(dr)`, which lays the ground and
lets the game paint a fresh frame over it in the new palette. The worker
adapter SHALL invoke `forceRedraw` when `setDrawingPalette` replaces an
already-installed palette.

#### Scenario: A palette replacement repaints without clearing the canvas

- **WHEN** the worker adapter receives a `setDrawingPalette` call that
  replaces an already-installed palette (e.g. the user toggles
  light/dark mode)
- **THEN** the adapter calls `engine.forceRedraw(dr)`, which discards
  the drawstate and runs `redraw`
- **AND** the ground and the game's full frame are painted in the new
  palette over the existing canvas content

### Requirement: A game starts on a fresh draw state

The draw state the midend builds when a game starts, whether from a new game, a
game id or a loaded save, SHALL be fresh, so the first `redraw` after a new
game lays the ground and the game paints its one-time setup and every tile.

#### Scenario: The first frame of a loaded save

- **WHEN** the midend loads a save and `redraw(dr)` runs for the first time
- **THEN** the frame opens with the ground, and the game paints its one-time
  setup and every tile over it

### Requirement: A warm frame matches a fresh paint of the same state

For every registered game, a frame drawn on a draw state that has painted
earlier frames SHALL show what the same frame shows drawn on a fresh draw
state. A render cache that repaints a tile only when its key changes breaks
this whenever the painter reads something the key does not carry, and a
snapshot, which starts from a fresh draw state, sees none of it.

#### Scenario: A painter input is missing from the key

- **WHEN** a game paints a tile from state its cache key does not include, and
  that state changes while the key does not
- **THEN** the warm frame differs from the fresh one and the test fails, naming
  the game, the frame, the event before it and the differing pixel

#### Scenario: A packed field overflows onto another

- **WHEN** a value shifted into a key wraps onto another field's bit
- **THEN** two different draw states share a key, the warm frame keeps the older
  one, and the test fails

#### Scenario: Two flags share a bit

- **WHEN** two flags a painter reads are packed into the same bit of a key
- **THEN** a change from one to the other leaves the key unmoved, the warm
  frame keeps the older picture, and the test fails

### Requirement: The warm-frame comparison drives every registered game on a real Midend

A cross-game test SHALL drive each game through seeded input on a real `Midend`
and compare every frame against its fresh twin. The comparison SHALL claim for
each op only pixels the op surely paints, so that a difference is stale content
and never an artifact of the approximation. The population is the registry, and
the test SHALL assert that it looked at the whole registry and compared frames.

#### Scenario: A run that compares no frames

- **WHEN** a game's run compares no frames
- **THEN** the test fails for that game, rather than passing over nothing

### Requirement: The warm-frame comparison answers for what it reached

The run behind "A warm frame matches a fresh paint of the same state" SHALL
paint the frames a player sees between two settled ones, and SHALL report what
it showed each game, because a pass says nothing about a frame the run never
painted. The requirements that follow state which frames it paints and what the
test requires of the report.

#### Scenario: A hinted game is never shown its hint

- **WHEN** the run shows a game that has a hint no hint frame
- **THEN** the test fails for that game, rather than passing over a hint overlay
  it never painted

### Requirement: The comparison counts the frames and marks it painted

The run SHALL count the frames painted mid-animation, with a hint displayed,
and with a mistake overlay, and the events after which an animation was armed.
It SHALL record, as `role|kind`, the marks the painted frames carried, and
every mark the renderer asked the displayed marks for (`StepMarks.of`). Mistake
frames are counted and not required, because reaching a mistaken board
takes a move specific to the game.

#### Scenario: A run that paints no mistake frame

- **WHEN** a game's run paints no frame with a mistake overlay
- **THEN** the count is zero and the test does not fail on it

### Requirement: The comparison paints the frames of an animation

After every event the run SHALL advance the midend's clock in steps shorter
than any animation or flash in the collection, painting each frame until one is
still. `Midend.timer` takes seconds. The test SHALL require that an armed
animation was painted part-way.

#### Scenario: The clock ticks in whole seconds

- **WHEN** the run advances the clock by one second or more after an event that
  armed an animation
- **THEN** the animation ends inside the tick with none of its frames painted,
  and the test fails for that game

### Requirement: The comparison paints a drag's preview and a check

The run SHALL paint a drag's preview before the drag is released. Its events
SHALL include the check Check & save makes, so that a marked dead end is
painted.

#### Scenario: A drag in the seeded run

- **WHEN** the run presses, drags and releases
- **THEN** it paints and compares a frame after the drag and before the release

### Requirement: The comparison shows a hint and walks its plan to the end

The run SHALL show a game that has a hint its hint, and play some of that
hint's steps. It SHALL then, on a draw state of its own, follow the hint's plan
from the same board to its end, and check the board where the plan stopped.
That walk SHALL paint the frame each event leaves and the frame it settles to,
and is not required to paint the frames between.

#### Scenario: A frame a plan wins on

- **WHEN** a hint's plan ends on a step that solves the board, and the win
  frame leaves a cue the fresh paint does not draw
- **THEN** the walk paints that frame and the comparison fails

### Requirement: Every hint mark a renderer asks for is painted by some run

For a game with a hint, the test SHALL require that every mark the renderer
asked for, in a role the game's `hintMarks` legend lists, was painted by the
seeded run or by a pinned board. It SHALL also require that every role the
legend lists is one the renderer asks for. A mark that no board reaches SHALL
be named, with the reason, in a ledger the test holds exact.

#### Scenario: A hint mark no run paints

- **WHEN** a game's renderer asks for a mark in a role its legend lists, and
  neither the seeded run nor a pinned board paints it
- **THEN** the test fails for that game and names the mark, unless the ledger
  of unreached marks names it with the reason

#### Scenario: A legend role the renderer never reads

- **WHEN** a game's legend lists a role its renderer never asks the displayed
  marks for
- **THEN** the test fails for that game, because the help's list of marks
  describes a mark the game cannot paint

### Requirement: A mark the seeded run does not paint is reached from a pinned board

The comparison SHALL accept a game id to start from in place of a seeded deal.
A hint mark the seeded run does not paint SHALL be reached from a board named
in the test's ledger of pinned boards, as the board itself and never as a deal
seed. Each pinned board SHALL paint a mark the seeded run does not. A mark
drawn across tiles that is not a hint mark SHALL run the comparison from a
board that shows it, pinned in the game's own tests as the board and the event
stream.

#### Scenario: A pin the seeded run has caught up with

- **WHEN** a pinned board paints no mark the seeded run does not
- **THEN** the test fails for that game and names the board

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
