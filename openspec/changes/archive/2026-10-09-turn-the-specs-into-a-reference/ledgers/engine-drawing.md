# Ledger: engine-drawing

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## The engine provides a shared recessed-border drawing helper

| Rule | Where it went |
| --- | --- |
| The engine provides `drawRecessedBorder(dr, bounds, inset, highlight, lowlight)` in `src/engine/draw.ts`, with `bounds` an inclusive outer pixel box, `inset` the tile size and two palette colors | spec: The engine provides a shared recessed-border drawing helper |
| It draws two pentagons in one canonical winding | spec: The engine provides a shared recessed-border drawing helper |
| The highlight wedge is top-right and the lowlight wedge bottom-left | untrue: with `top` above `bottom` in pixels, the highlight pentagon of `drawRecessedBorder` in `src/engine/draw.ts` holds the bottom-right corner and runs along the bottom and right edges, and the lowlight one holds the top-left corner and runs along the top and left |
| The bevel is upstream's | history |
| Games that draw a beveled frame call the helper, each with its own edge derivation, and do not re-derive the polygons | spec: A game draws its beveled frame through the recessed-border helper |
| Per-game extras that are not the bevel stay at the call site | spec: A game draws its beveled frame through the recessed-border helper |
| Scenario: a beveled game calls the helper with its bounds, tile size and colors | spec: A game draws its beveled frame through the recessed-border helper |
| The scenario's examples include Samegame and Flood | untrue: only `src/games/fifteen/render.ts`, `src/games/sixteen/render.ts` and `src/games/twiddle/render.ts` call `drawRecessedBorder`, and `src/puzzle/bevels.test.ts` holds the games that draw a bevel to those three |
| The two pentagons cover the pixels the game's prior private copy did | history |

## The engine provides a shared rectangle-outline drawing helper

| Rule | Where it went |
| --- | --- |
| The engine provides `drawRectOutline(dr, x, y, w, h, color)` in `src/engine/draw.ts`, four lines in the inclusive convention | spec: The engine provides a shared rectangle-outline drawing helper |
| The border is always one pixel thick | untrue: `drawRectOutline` in `src/engine/draw.ts` takes a seventh argument, `thickness = 1`, and passes it to each `drawLine`, so the requirement now says one pixel unless a thickness is passed |
| It matches upstream `draw_rect_outline` | history |
| Games drawing a rectangle outline call the helper and carry no private copy or four inlined `drawLine` calls | spec: The engine provides a shared rectangle-outline drawing helper |
| Scenario: the border spans the inclusive corners, and a caller in the exclusive convention adjusts its width and height | spec: The engine provides a shared rectangle-outline drawing helper |

## A game is handed a draw state, never the absence of one

| Rule | Where it went |
| --- | --- |
| `Game.newDrawState` and `Game.redraw` are required members | spec: A game is handed a draw state, never the absence of one |
| The draw state passed to `redraw` and `interpretMove` is non-null and built at the tile size it is drawn at | spec: A game is handed a draw state, never the absence of one |
| The midend declines to redraw or interpret input when no game has been set up | spec: A game is handed a draw state, never the absence of one |
| `newDrawState` receives the tile size, and the contract has no separate sizing step | spec: A draw state is at one tile size for its whole life |
| The midend builds a new draw state whenever the tile size changes | spec: A draw state is at one tile size for its whole life |
| While `newDrawState` was optional, games guarded against a null and mapped pointers through a fallback tile size | history |
| Fifty-five games, fifty-seven games, ten games, with the date they were measured | figure |
| While sizing was a second step, games wrote their own invalidation, Map reallocating its blitter | history |
| Scenario: `interpretMove` reads the tile size from the draw state with no fallback | spec: A game is handed a draw state, never the absence of one |
| Scenario: no board, no paint | spec: A game is handed a draw state, never the absence of one |
| Scenario: a game writes no resize invalidation | spec: A draw state is at one tile size for its whole life |

## The engine provides a shared raised-bevel drawing helper

| Rule | Where it went |
| --- | --- |
| The engine provides `drawRaisedTile(dr, body, tileSize, face, highlight, lowlight)`, the two triangles lowlight first and then the face inset by `raisedBevelWidth(tileSize)` on all four sides | spec: The engine provides a shared raised-bevel drawing helper |
| Games that draw a raised tile call the helper and do not re-derive the triangles or the inset | spec: A game draws a raised tile through the shared helper |
| A game whose tile keeps a grid line passes the box inside the line as `body` | spec: A game draws a raised tile through the shared helper |
| `raisedBevelWidth(tileSize)` returns `max(1, floor(tileSize / 16))`, and the floor of one is normative | spec: The raised bevel's width never reaches zero |
| The engine provides `drawRaisedBevel(dr, bounds, highlight, lowlight)`, the two triangles alone | spec: The engine provides the raised bevel without a face |
| Scenario: a raised-tile game calls the helper and computes no width or inner rectangle | spec: A game draws a raised tile through the shared helper |
| The scenario's examples include Mines, Inertia, Sokoban and Crossing | untrue: only `src/games/fifteen/render.ts` and `src/games/sixteen/render.ts` call `drawRaisedTile`, and no other game draws a two-triangle bevel on the frames `src/puzzle/bevels.test.ts` reads |
| Scenario: a tile inside a grid line has a border on every side, at least one pixel wide | spec: The engine provides a shared raised-bevel drawing helper |
| Scenario: a pressed-in tile calls the same helper with the two colors exchanged | spec: A game draws a raised tile through the shared helper |
| The pressed-in tiles are Crossing's walls and its selected digit | untrue: `src/games/crossing/render.ts` calls neither raised-bevel helper, so the scenario names no game |
| Scenario: a bevel that is not two triangles, as Twiddle's four trapezoids, is not expressed through the helper | spec: A game draws a raised tile through the shared helper |
| Scenario: every game draws as many bevels of each shape as it made calls to the helpers, read by shape from its sample frames | spec: No game re-derives a bevel |
| The guard fails if it found no game drawing a bevel or no call to a helper | spec: No game re-derives a bevel |

## The engine provides a shared centered-glyph text-options helper

| Rule | Where it went |
| --- | --- |
| The engine provides one helper returning the text options for a glyph centered in a tile, and games call it | spec: The engine provides a shared centered-glyph text-options helper |
| Centering a digit in a tile is not a decision a game makes | spec: The engine provides a shared centered-glyph text-options helper |
| 56 copies in 40 files, three local helpers under three names, eight sites that differ, with the date | figure |
| A game that needs different text options writes them | spec: The engine provides a shared centered-glyph text-options helper |
| Scenario: a game takes its options from the helper, passing only the size | spec: The engine provides a shared centered-glyph text-options helper |
| The drawn output is identical to the literal the helper replaced, which the render snapshots assert | history |
| Scenario: the helper does not grow a parameter for fixed-width or non-centered text | spec: The engine provides a shared centered-glyph text-options helper |

## A game's render test records through the shared recording drawing

| Rule | Where it went |
| --- | --- |
| A test asserting what a game draws drives the shared recording drawing and not a double of its own | spec: A game's render test records through the shared recording drawing |
| A hand-rolled double records only what its author anticipated, so a change in what is drawn leaves the test green | spec: A game's render test records through the shared recording drawing |
| 18 files against 37, and 96 of 109 casts, with the date | figure |
| Scenario: a new primitive is in the recording whether or not the test asserts on it | spec: A game's render test records through the shared recording drawing |
| Scenario: a migrated test has its defect planted, seen red and restored, and one that cannot be made red is reported | spec: A game's render test records through the shared recording drawing |

## A repaint cue belongs in the tile cache before a sidecar

| Rule | Where it went |
| --- | --- |
| A cue that fits a bit of the per-tile key should go there and not in a second cache, which is a second key that fails silently | spec: A repaint cue belongs in the tile cache before a sidecar |
| A sidecar cache only where the cue has no tile, naming every input the painter reads in its key | spec: A repaint cue belongs in the tile cache before a sidecar |
| Scenario: a cue that has a tile available | spec: A repaint cue belongs in the tile cache before a sidecar |

## The capability snapshot records the draw state its constructor builds

| Rule | Where it went |
| --- | --- |
| The snapshot records the field names of a game's draw state as well as its `Ui` | spec: The capability snapshot records the draw state its constructor builds |
| It records names only, not sizes, values or types | spec: The capability snapshot records the draw state its constructor builds |
| A snapshot that moves for unrelated reasons trains its readers to re-baseline without reading | reason |
| It asserts nothing about which names a game may use | spec: The capability snapshot permits and forbids no name |
| An approved vocabulary would be a list only this check reads | spec: The capability snapshot permits and forbids no name |
| A game can be written without the list and nothing would notice | reason |
| It reads the draw state as `newDrawState` returns it at the preferred tile size, before any `redraw` | spec: The capability snapshot reads the draw state as newDrawState returns it |
| Scenario: a shared mechanic appears against each game, with no assertion about its name | spec: The capability snapshot permits and forbids no name |
| Scenario: a lost field moves the snapshot | spec: The capability snapshot records the draw state its constructor builds |
| That holds for every field `newDrawState` builds, including those derived from the tile size | spec: The capability snapshot reads the draw state as newDrawState returns it |

## Fit-to-window sizing fills the slot

| Rule | Where it went |
| --- | --- |
| `Midend.size(maxSize)` resolves the largest integer tile size whose `computeSize` fits, by binary search, growing past the preferred size | spec: Fit-to-window sizing fills the slot |
| It does so as upstream `midend_size` does in its user-size form | history |
| `maxScale` caps the board by shrinking `maxSize` before the call | spec: Fit-to-window sizing fills the slot |
| What the call does to the draw state is stated by another requirement | spec: Midend.size at an unchanged tile size has no other effect; spec: Midend.size replaces the draw state when the tile size changes |
| Scenario: a large slot expands the board | spec: Fit-to-window sizing fills the slot |

## The midend repaints on every transition, rebuilds the draw state for a new tile size, and lays the ground under a fresh one

| Rule | Where it went |
| --- | --- |
| The midend repaints after every transition it processes, and none leaves the canvas stale | spec: The midend repaints on every transition, rebuilds the draw state for a new tile size, and lays the ground under a fresh one |
| The midend gets the durations from the game, runs the timer while an animation, a flash or a timed clock runs, paints each frame and settles to a clean paint | spec: The midend drives the animation and flash timer |
| A non-animated transition paints once, and animation frames including the first come from the timer | spec: The midend drives the animation and flash timer |
| On the first redraw of a fresh draw state and no other, the midend fills `(0, 0)`–`computeSize` in color 0 and reports it, after `startDraw` and before `game.redraw` | spec: The midend lays the ground under a fresh draw state's first frame |
| Only building a fresh draw state arms the ground, and `size()` at an unchanged tile size does not | spec: The midend lays the ground under a fresh draw state's first frame |
| On every other redraw the midend emits no paint operation of its own | spec: The midend lays the ground under a fresh draw state's first frame |
| Everything above the ground is the game's, painted on the first frame of a fresh draw state | spec: The game paints everything above the ground |
| A game does not repeat the color-0 fill, and one whose ground is another color paints it over the midend's | spec: The game paints everything above the ground |
| `size()` returns the pixel size at the resolved tile size, and at an unchanged one does nothing else | spec: Midend.size at an unchanged tile size has no other effect |
| The frontend calls `size()` on every layout perturbation | spec: Midend.size at an unchanged tile size has no other effect |
| Every element-size change goes through `src/puzzle/components/view.ts`'s `ResizeController` | held: src/puzzle/components/view.ts "new ResizeController(this" |
| At a changed tile size the midend replaces the draw state with one built at the new size, and the next redraw lays the ground | spec: Midend.size replaces the draw state when the tile size changes |
| `canvasCleared()` is the signal that `Drawing.resize` reset the backing store, and the midend builds a fresh draw state at the current tile size | spec: Midend.canvasCleared discards the draw state after a canvas clear |
| The worker adapter calls it from `resizeDrawing` right after `Drawing.resize` | spec: Midend.canvasCleared discards the draw state after a canvas clear |
| `forceRedraw(dr)` discards the draw state and redraws at once, for a replacement that leaves the canvas uncleared | spec: Midend.forceRedraw repaints from a fresh draw state without a canvas clear |
| The worker adapter calls `forceRedraw` when `setDrawingPalette` replaces an installed palette | spec: Midend.forceRedraw repaints from a fresh draw state without a canvas clear |
| The worker adapter calls `forceRedraw` when `setDrawingFontInfo` replaces an installed font | untrue: there is no `setDrawingFontInfo` in `src/puzzle/worker-adapter.ts`, the font arrives once through `attachCanvas`, and `src/puzzle/drawing.ts` says "There is no `setFontInfo`" |
| A draw state created at startup, by a new game, a game id or a load, is fresh | spec: A game starts on a fresh draw state |
| Scenario: a processed move repaints | spec: The midend repaints on every transition, rebuilds the draw state for a new tile size, and lays the ground under a fresh one |
| Scenario: an animated move is driven by the timer to completion | spec: The midend drives the animation and flash timer |
| Scenario: a layout jiggle at the same tile size touches nothing | spec: Midend.size at an unchanged tile size has no other effect |
| Scenario: a new tile size arrives as a fresh draw state | spec: Midend.size replaces the draw state when the tile size changes |
| Scenario: a real canvas clear invalidates the draw state | spec: Midend.canvasCleared discards the draw state after a canvas clear |
| Scenario: a palette replacement repaints without clearing the canvas | spec: Midend.forceRedraw repaints from a fresh draw state without a canvas clear |
| Scenarios: the ground is the first paint of a fresh frame, a later redraw emits none of the engine's own, and every game's first frame covers its canvas | spec: The midend lays the ground under a fresh draw state's first frame |

## A warm frame matches a fresh paint of the same state

| Rule | Where it went |
| --- | --- |
| For every registered game a warm frame shows what the fresh one shows | spec: A warm frame matches a fresh paint of the same state |
| A keyed cache breaks this when the painter reads what the key lacks, which a snapshot cannot see | spec: A warm frame matches a fresh paint of the same state |
| The three ways: two flags sharing a bit, a value overflowing its field, an input the key never names | spec: A warm frame matches a fresh paint of the same state |
| A test drives each game through seeded input on a real `Midend` and compares every frame with its fresh twin | spec: The warm-frame comparison drives every registered game on a real Midend |
| The test and its comparison are named by file | held: src/engine/warm-repaint.test.ts "repaintDifferential" |
| The comparison claims for each op only pixels it surely paints | spec: The warm-frame comparison drives every registered game on a real Midend |
| The population is the registry, and the test asserts it looked at all of it and compared frames | spec: The warm-frame comparison drives every registered game on a real Midend |
| Scenarios: a painter input missing from the key, and a packed field overflowing | spec: A warm frame matches a fresh paint of the same state |

## The warm-frame comparison answers for what it reached

| Rule | Where it went |
| --- | --- |
| The run paints the frames between two settled ones and reports what it showed each game | spec: The warm-frame comparison answers for what it reached |
| After every event it advances the clock in steps shorter than any animation or flash, painting until a frame is still, and `Midend.timer` takes seconds | spec: The comparison paints the frames of an animation |
| It paints a drag's preview before the release | spec: The comparison paints a drag's preview and a check |
| It shows a hinted game its hint, plays some steps, then walks the plan to its end on its own draw state and checks the board there | spec: The comparison shows a hint and walks its plan to the end |
| The walk may paint only the frame each event leaves and the frame it settles to | spec: The comparison shows a hint and walks its plan to the end |
| Its events include Check & save's check, so a marked dead end is painted | spec: The comparison paints a drag's preview and a check |
| It counts mid-animation, hinted and mistaken frames and armed events, and records the marks painted and asked for as `role\|kind` | spec: The comparison counts the frames and marks it painted |
| The test requires that an armed animation was painted part-way | spec: The comparison paints the frames of an animation |
| For a hinted game every mark asked for in a legend role was painted, and every legend role is asked for | spec: Every hint mark a renderer asks for is painted by some run |
| Mistake frames are counted and not required | spec: The comparison counts the frames and marks it painted |
| The comparison accepts a game id in place of a seeded deal, and a missed hint mark is reached from a pinned board, never a seed | spec: A mark the seeded run does not paint is reached from a pinned board |
| Each pinned board paints a mark the seeded run does not | spec: A mark the seeded run does not paint is reached from a pinned board |
| A mark no board reaches is named with its reason in a ledger held exact | spec: Every hint mark a renderer asks for is painted by some run |
| A cross-tile mark that is not a hint mark runs the comparison from a board pinned in the game's own tests | spec: A mark the seeded run does not paint is reached from a pinned board |
| The test and its ledger of pinned boards are named by file | held: src/engine/warm-repaint.test.ts "const PINNED" |
| Scenario: the clock ticks in whole seconds | spec: The comparison paints the frames of an animation |
| Scenario: a hinted game is never shown its hint | spec: The warm-frame comparison answers for what it reached |
| Scenarios: a mark across tiles outlives its flag, a cross-tile mark the deal never shows, and a pin the run has caught up with | spec: A mark the seeded run does not paint is reached from a pinned board |
| Scenarios: a hint mark no run paints, and a legend role the renderer never reads | spec: Every hint mark a renderer asks for is painted by some run |
| Scenario: a frame a plan wins on | spec: The comparison shows a hint and walks its plan to the end |
