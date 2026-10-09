# Rendering

How a game paints: the redraw contract and its doctrine, the per-tile cache,
overlays, drag previews and blitters, animation and flash, and the color
palette. This is one file of the [`docs/games/`](./README.md) set; input
(gesture semantics) is [`input.md`](./input.md), hint painting is
[`hints.md`](./hints.md), and the in-process render test harness is
[`testing.md`](./testing.md).

Authoritative specs:
[`engine-drawing`](../../openspec/specs/engine-drawing/spec.md) (the `GameDrawing`
contract; the repaint/animation requirement, which also owns the
ground/`canvasCleared` doctrine) ·
[`testing`](../../openspec/specs/testing/spec.md) (in-process render
verification). Exemplar to read end-to-end:
[`galaxies/render.ts`](../../src/games/galaxies/render.ts).

## The rendering doctrine

**The engine lays the ground; the game paints everything above it.** On the
first redraw of a fresh draw state the midend fills the whole canvas
(`computeSize` at the current tile size) in color 0, before `game.redraw`
runs; on every other redraw it paints nothing. So a game's first-frame branch
draws only what is its own — grid frame, border, fixed artwork — and never
repeats the color-0 fill. A game whose ground is another color paints that
fill itself on its first frame, over the midend's (Rect, Untangle). A game
that repaints its whole board every frame (Cube, Loopy) keeps its own fill,
because it is erasing the last frame, not laying the ground.
**`Midend.size` touches nothing at an unchanged tile size**, and **a fresh
draw state is the only cache-stale signal** — `size()` builds one when the
tile size changes, the worker adapter calls `canvasCleared()` when the canvas
backing store is genuinely recreated, `forceRedraw` builds one when the palette
or font is replaced, and nothing else may invalidate a draw state. The midend
repaints on every transition and drives the animation/flash timer; a game
never schedules its own frames.

Upstream's midend laid the ground too (`first_draw` in `midend_redraw`). The
port once withdrew it, because it was armed from every `size()` call and the
frontend calls `size()` on every layout tick, so the board flickered. It came
back once a fresh draw state could arise only from a real clear, a new palette
or a new tile size, each of which repaints everything anyway; four games had
meanwhile shipped a first frame with bare black pixels, which is what a fill
every game must remember to write gets you. `first-frame-coverage.test.ts`
rasterizes every game's first frame and holds it to full coverage. The owning
requirement is `engine-drawing` § "The midend repaints on every transition, rebuilds
the draw state for a new tile size, and lays the ground under a fresh one" —
link it, don't restate it.

**Full-vs-incremental redraw is the game's own policy.** The engine imposes
neither; upstream didn't either. In practice every game with per-cell state
uses the tile cache below, because a full repaint per frame is visibly slow on
large boards and the cache is what makes overlays correct.

## The tile cache and the diff key

This is the most-cited discipline in the tree. The shape: the draw state
holds one packed word per tile of *what the canvas currently shows*; each
frame computes what the tile *should* show, repaints only on mismatch, and
records what it painted.

**Pack the key into an `Int32Array`, never a `BigInt64Array`.** `BigInt` is
hot-path-expensive and idiomatically wrong here. When the bits run out, do not
widen — move the overflow into an overlay sidecar (below) or a second parallel
array. Exemplars: [`galaxies/render.ts`](../../src/games/galaxies/render.ts),
[`range/render.ts`](../../src/games/range/render.ts).

**When the candidate set alone exceeds ~26 bits, keep two parallel cache
arrays rather than packing digit and pencil bitmap into one word.** Keen packs
`digit | pencil << 16` because its order ≤ 9 leaves room; Solo's order can
reach 31, so a 5-bit digit plus an order-wide pencil mask overflows a single
`Int32`. The answer is a per-cell pair — a `tiles` word and a `pencil` word
compared together (a `1<<n` mark for `n` up to 31 still fits, sign bit and
all). Exemplar: [`solo/render.ts`](../../src/games/solo/render.ts)
(`SoloDrawState.tiles` + `.pencil` + `.wrong`).

### Overlay sidecars

**Every overlay that doesn't live in the tile value MUST be in the diff key —
or it silently fails to repaint.** A mistake/hint/highlight overlay is applied
*on top of* a cell, so it usually isn't part of the packed tile value. If it
isn't *also* compared in the cache-miss branch, it repaints only when the
cell's tile coincidentally changed that frame — and Check & Save (or a hint)
runs a frame *after* the move that drew the cell, so the overlay **never
shows**. Towers shipped exactly this: `ds.wrong` was passed to `drawTile` but
left out of the diff condition, and Check & Save highlighted nothing.

**Never hand-write the two-array dance.**
[`overlay-sidecar.ts`](../../src/engine/overlay-sidecar.ts)
(`OverlaySidecar`) owns repack/stale/commit for *any* overlay. Give each
overlay its own instance on the draw state, then per frame: pack it once, use
`ds.<overlay>.stale(i)` as a clause of the cache-miss test, hand
`ds.<overlay>.packed[i]` to the cell painter, `ds.<overlay>.commit(i)` after
drawing. Three pack entry points, by the shape of what you have:

| You have | Call | Exemplar |
| --- | --- | --- |
| A hint step's marks (ringed cells and notes, outlined and striped cells) | `pack(stepMarks(step), indexFn, markBitsFn)` | the candidate-family renders, e.g. [`towers/render.ts`](../../src/games/towers/render.ts) |
| A `findMistakes` cell list | `packCells(mistakes, indexFn)` | `towers/render.ts` `ds.wrong` |
| An overlay with its own topology | `clear()` + `add(i, bits)` | [`galaxies/render.ts`](../../src/games/galaxies/render.ts) `ds.wrongEdges` — one wrong wall is a *shared* edge, so it lights a different bit in each of the two tiles it separates |

`pack` also keys each evidence cell on its **outline sides**, not only on being
evidence. A hint mark drawn inside a cell is undone only by that cell's repaint,
and a cell can stay evidence while the shape around it changes; without the
sides it keeps the outline it no longer has (`hints.md` § "Where the band goes,
and who rubs it out").

### A cue with a tile available belongs in the tile key, not in a second cache

**Prefer a bit in the per-tile key over a sidecar scalar on the draw state.** A
sidecar is a *second cache*, and a second cache is a second key to forget an
input from — which is the failure below, and it is silent.

The pencil-mode indicator was the collection's worked example of both answers,
and is now an example of the second only: the engine picks its position
(`pencilIndicatorBox`), that position is a margin, and a margin is no tile's — so
every game with the mode keeps a `ds.pencilModeShown` beside its tile cache.
Towers packed it into its tile cache while where to put it was still Towers' own
choice, and gave the bit up along with the choice. Crossing — the same file, a
neighboring surface — is where the bug actually happened.

A sidecar is still right when the cue has no tile to live in (a panel below the
board, a margin outside the grid). Reach for it second, and then name **every**
input the painter reads in its key.

**The sidecars also showed what a second cache costs in tests.** Each of the nine
there were then was covered only through a render snapshot, and `RecordingDrawing` keeps
`drawUpdate` out of `ops` deliberately — so deleting the invalidation from all
nine at once failed *zero* tests. Exemplar of the fix:
[`engine/pencil-indicator.ts`](../../src/engine/pencil-indicator.ts)
(`repaintPencilIndicator`), whose own test asserts the `updates` channel that no
snapshot can see.

### Moving a cue out of the key's channel is how the key loses it

**A cache key names inputs, so changing how a cue is *rendered* can silently
drop it from the key.** Crossing's clue panel has its own cache
(`ds.numberState`) beside the tile cache, and "held" was originally a color
class — `colorClass` returned `3`, the key was `colorClass(l)`, and held was
covered for free. Turning held from a color into a **box** moved it out of that
channel: the class return was deleted and `heldOf` was passed to the painter as
a separate predicate, so nothing in the key mentioned it. Picking a clue up then
painted the box exactly once, on a cold draw state, and never again — nor erased
it. Every test missed it because they all build a draw state per frame.

Two things generalize. **When a cue stops being expressed as something the key
already reads, it needs its own term in the key** — and the diff is small enough
to look innocent, because the paint is plainly still there. And **the stale
comment is what hid it**: `CLASS_COLOR` kept an unreachable entry labeled
`3 held`, which reads as though held were still a class. A key's comment is a
claim about coverage; when you take a class out, take its label out in the same
edit. Exemplar: [`crossing/render.ts`](../../src/games/crossing/render.ts)
(`panelState`).

**The test has to reuse a draw state.** A frame-per-draw-state test meets a cold
cache every time and cannot observe a missing key term at all — § "Prove the
overlay repaints" below is the same discipline aimed at the tile cache.

### A packed diff key runs out of bits, and dead flags are where the next one comes from

**A game that packs every overlay into one `Int32Array` word has 31 usable bits
and no warning when they are gone** — bit 31 is the array's sign. Slide reached
exactly full: eleven flags, two eight-bit shape fields, four gate borders. The
next overlay cannot simply be `<< 27`.

Before widening, **audit the flags for one that is written and never read**.
Slide's `BG_NORMAL` was set on every non-target square and tested nowhere,
because `drawTile` asks `val & BG_TARGET` and takes the floor as the `else` — a
bit spent saying nothing, and the bit the keyboard cursor now uses. This is the
Method section's "what would have to break for this to matter?" aimed at a
bitfield, and it is worth one grep before any restructuring: a flag that appears
exactly twice (its definition and one `val |=`) is dead.

When there genuinely is no dead flag, **widen the key rather than squeezing** —
it is a repaint cache, not a wire format, so nothing outside the renderer
constrains its type. Do it as a deliberate step and say so in a comment, because
the failure mode of getting it wrong is silence.

### A tile paints only its own box, and tiles that share pixels repaint together

**A warm frame must look like a fresh paint of the same state**, and
`src/engine/warm-repaint.test.ts` holds every game to it by driving a real
`Midend` through seeded input and comparing each frame with its fresh twin
(`engine/testing/repaint-differential.ts`). Every way a cache goes wrong shows
up there as the same symptom, whatever the cause. When it convicts a game, the
cause has so far always been one of these:

- **An input the key does not carry.** The painter reads something (a `Ui`
  field, a mode) that no key term names. Subsets' inspect badge read
  `ui.highlightCell`; the fix gave it a bit of its own and made the painter read
  that bit, so what it shows cannot leave the key.
- **A field wider than its lane.** A shift counts mod 32, so a value past bit 31
  lands on another field. Candidate masks go through `engine/candidate-bits.ts`,
  which throws instead.
- **A tile painting outside its box.** Magnets drew a domino half one pixel into
  its partner, so the half repainting alone overwrote the partner's edge. Paint
  to `ts - 1`, and let the neighbor fill from its own edge.
- **Pixels two tiles share, repainted by one.** A shared border row, or a mark
  band laid over the border, belongs to both tiles, and a fresh paint settles it
  in loop order. Netslide's sliding line painted over the border it shares with
  the line beside it; the fix repaints that line too while the slide runs.
  `HintMarks` erasing a removed band over a cell that had just repainted was the
  engine's own case of it; the answer is to erase *before* the tile loop
  (`eraseBeforeTiles`) and let every tile the band touches repaint on top —
  [`hints.md`](hints.md) § "Where the band goes, and who rubs it out".
- **A mark drawn whole across its neighbors.** Bricks' three-in-a-row bar and
  gravity diamond sit across tile edges. A diamond on the board's left edge
  lands a quarter on the ground beside it, which no tile owned, and 171 px of it
  stayed after its flag cleared. The fix has two parts. The edge square owns
  that ground and repaints it, which is what clears the piece. Each tile also
  clips to what it owns, as upstream does, so a flagged square's repaint cannot
  paint over its neighbors. Every square a mark crosses must carry the mark in
  its key, and every pixel the mark lands on must belong to one of those
  squares.
- **A decoration that repaints only on its own change, inside a tile's box.**
  Towers' pencil-mode indicator lives in a corner square of the clue ring. When
  that square repainted for a hint mark beside it, it filled over the indicator,
  which `repaintPencilIndicator` draws only when the mode changes. A tile that
  repaints over a decoration must forget what the decoration showed.
- **A cue erased on one event that another event also retires.** Guess erased
  its "current move" marker when `nextGo` moved. A win keeps the winning row
  at `nextGo`, so the marker stayed beside it on the won board. A fresh paint
  of that board draws no marker. Erase on everything that retires the cue,
  not only on the event that usually does.

**A mark that crosses tiles goes into each tile's key in one of two ways**, and
the choice is the game's:

- **By piece.** The tile's key says which piece of the mark it draws: a side,
  a direction, half a bar. This is upstream's idiom. Bridges' spans, Pearl's
  edges, Net's sides and Bricks' rule flags all work this way, and the piece is
  the game's own geometry. Region outlines are the shared case
  (`MarkOutlines.packed`, `engine/hint-mark.ts`).
- **By identity.** The tile's key names the marks crossing it, and the tile
  draws each one whole while clipped to its box. Pegs' hint jumps work this way
  (`pegs/render.ts`). It suits a mark whose shape is not a grid's (an arrow
  over three squares), at the cost of a key that lists marks rather than packs
  bits.

There is no engine helper for either: what the two share is the clip, and
`share-marks-across-tiles` records why that was not worth extracting.

**What the run reaches is part of the result.** A pass means nothing for a
frame the run never painted. So the run:

- ticks the clock in 0.05 s steps after every event, painting each frame until
  one comes out still (`Midend.timer` takes seconds);
- paints once mid-drag;
- starts a hinted game by showing its hint and playing three steps;
- checks the board as Check & save does, so a marked dead end is painted;
- then, on a draw state of its own, walks the hint's plan from the deal to its
  end, and checks where it stopped. The walk paints where each event starts
  and where it settles, not the frames between, because a slide puzzle's plan
  is long and every step moves in slow motion.

`RepaintRun.reached` counts animated, hinted and mistaken frames. It also
records the marks the frames painted (`marks`) and every mark the renderer
asked for (`asked`), each as `role|kind`. The test requires:

- an armed animation to have been painted part-way;
- a hinted game to have painted every mark its renderer asks for, in a role
  its legend (`hintMarks`) lists;
- every role in the legend to be one its renderer asks for.

Each requirement was proven red by planting its absence. Mistake frames are
counted but not required, for the reason the next section gives.

**What a game can paint is what its renderer asks for.** A bound game reads
its hint marks only through `StepMarks.of(role, kind)`, and asks on every
frame whether or not the step has any. The differential records those reads,
so the requirement does not depend on any run's reach. A pair whose role the
legend does not list needs nothing, since no step may name it: Undead's shared
`HintSidecar` asks for striped cells, and Undead never stripes anything.

**A mark the seeded run never shows needs a board that does.** Name it in
`warm-repaint.test.ts`'s `PINNED`, as the board itself (`params:desc`), never
as a seed. Find one by walking deals across the presets until the plan paints
the pair. A pin must paint something the seeded run does not, so a pin the
run has caught up with fails and gets removed. A mark no board reaches goes in
`UNREACHED` with its reason, and the test holds that ledger exact.

A mark that is not a hint mark is not covered by that requirement. Bricks'
edge diamond is a rule flag. The run once convicted it and later fell out of
its reach, so Bricks pins its board and event seed in its own tests
(`bricks.test.ts`, "takes an edge diamond away whole, ground included").

Read the report before the code: it names the frame, the event before it, the
first differing pixel, what each canvas shows there and which frame painted
the warm one. And suspect the instrument too — it is a raster of inks, exact
for rects, polygons, circles and one-pixel strokes, estimated for text and thick
lines, and each of its approximations has convicted an innocent game once.

### Prove the overlay repaints

**A cold-frame test proves nothing about an overlay.** On frame 1 every cell
misses the cache anyway, so an overlay missing from the diff key still paints.
The **hint** overlay is guarded cross-game by
[`hint-overlay.test.ts`](../../src/engine/hint-overlay.test.ts) (warm the
drawstate, display a hint, assert the same drawstate emits paint ops) — every
game in [`testing/hint-games.ts`](../../src/engine/testing/hint-games.ts) is
covered automatically. The **mistake** overlay still needs a per-game
paint-twice test (a mistaken board can't be built generically): paint, run
`findMistakes()`, redraw the *same* drawstate, and assert the highlight
appears on the **second** paint — ideally also that a third frame without the
overlay erases it. Exemplars: `towers.test.ts` ("highlights a mistake even
when the cell was already drawn"), `galaxies.test.ts` ("recolors a flagged
wall on a board that was already drawn").

**Assert the settled frame paints nothing, first.** The overlay frame's op
count only means something against a frame that emitted zero — otherwise a game
that repaints unconditionally (Loopy repaints its whole canvas every frame)
passes the test while proving nothing about its cache. Warm, redraw once more,
assert *that* frame is empty, and only then turn the overlay on.

**A game that repaints its whole frame needs none of this plumbing, and that is
a finding, not a gap.** Loopy has no tile cache and no diff key, so its hint
(`add-loopy-hint`) added no sidecar and nothing to erase: `redraw` reads the
displayed step and draws its marks in their place in the z-order, every frame.
What such a game owes instead is the **z-order**: a mark that goes under the
content it points at (Loopy's edge bands and dot rings, painted before the edges
so the edge's own state stays legible) and labels that go last (its chain
ordinals, drawn after the edges so nothing covers them). The overlay guard passes
for it because every frame paints; the mark tests are what check where the marks
land.

**The bug is only expressible where the overlay is handed to the painter
*beside* the key.** A game that folds its overlay bit into the packed tile value
— `if (mistakeSet.has(i)) f |= DS_MISTAKE` — cannot omit it from the diff test,
because the key *is* the diff test. The class lives in the sidecar games and in
hand-packed side channels (Galaxies' wall mask), which is where the stale clause
has to be. Measured 2026-09-09 across all 57 games
(`openspec/postmortems/2026-09-09-tile-loop-inversion-withdrawal.md`): all 38
whose `redraw` takes a `mistakes` parameter route it correctly, so the class has
no live instance today — but it shipped twice before, and a new game reaching
for a sidecar is reaching for the one shape that can still get it wrong.

### A mark band with `outer: 0` must lie inside the tile's *clip*, not on its outline

`HintMarks` with `MarkBand.outer` 0 keeps no history on purpose: the band is
inside the cell's content box, so the cell's own repaint — which the hint
`OverlaySidecar` already triggers — erases it. That is true only of pixels the
cell is allowed to paint, and **a tile's drawn outline is not always inside its
clip**. Mathrax traces its cell outline at `ty − 1` and `tx + ts`, a pixel above
and a pixel past the `{tx, ty, ts, ts}` rect it clips to, so the line the player
sees between two cells is the *neighbor's*. A band placed on the traced
rectangle put its top row in nobody's tile, nothing ever repainted it, and every
step the hint moved on from left a stray colored line across the board
(`add-mathrax-hint`, caught by running the app, not by any test — the tier-2.5
recorder captures one frame, and a leak is about the frame *after*).

So take the band's box from the rect the painter clips to, and check the two
against each other rather than assuming they agree. The symptom is unmistakable
once you are looking for it: marks accumulate as the hint walks, and a reload
clears them.

## Drag previews and blitters

### A simulated-release preview lives in `moves.ts`

**A drag game whose `redraw` previews the in-progress drag by simulating the
release move must keep move application in a separate module.** Upstream
`game_redraw` for such a game (Signpost; Untangle earlier) draws the state
that *would* result — so `render.ts` needs `executeMove` plus the
release-move helper, and if those live in `index.ts`, `render ↔ index` is an
import cycle. Split them into a small `moves.ts` both import. Exemplar:
[`signpost/moves.ts`](../../src/games/signpost/moves.ts).

**Reach for this shape before a table of cases.** A drag whose release does
one of several things (Bridges: add a bridge, lift a full bundle off, lower a
limit, place or clear a cross) can be previewed by asking the release's own
function for its move, executing it, and drawing *only the gesture's own
cells* from the result. `render.ts` then holds no second statement of what a
drag does, and where the changed cells are packed into the tile key the cache
repaints and restores them unasked. Read no more than those cells from the
executed board: it also carries the release's consequences elsewhere (an
island turned red), and showing those recolors pieces the finger is not on.
Exemplar: [`bridges/moves.ts`](../../src/games/bridges/moves.ts)
(`dragReleaseOps`).

### `changedState` cancels a dangling drag

**A drag preview names a piece on the board, and the board can change while
the pointer is still down** — an undo from the Bar or the keyboard mid-drag.
Upstream's `game_redraw` `assert`s the simulated move succeeds, so that
sequence is a thrown error in a naive port. Cancel the drag in `changedState`
(a bare `UI_UPDATE` never reaches that hook, so the live gesture is unharmed)
and make the preview fall back to the plain board rather than throwing.
**Tell:** a `redraw` that calls the game's own move helper on `ui` state and
can't handle "no". Exemplar:
[`slide/index.ts`](../../src/games/slide/index.ts) (`changedState`).

**A keyboard arm is the same bug with a longer window.** A pointer drag ends
on the release; a gesture armed by Enter and fired by a later arrow can sit
armed across any number of presses, so it meets far more state changes. Pegs'
`curJumping` remembered a *peg*, checked the direction at fire time and took
that peg on trust — an undo left it aimed at a hole, and `executeMove` rejected
the player's keypress with a thrown error. The population was read in full:
Bridges, Map, Rect, Sixteen, Spokes and Tracks all arm across presses and all
are safe, each for one of the two reasons in
[`engine/game.ts`](../../src/engine/game.ts) (`changedState`'s doc) — what they
remember is fixed geometry, or the fire re-derives it. **So the question is
never "is this a drag?" but "can a state change make what I am holding
false?"** Exemplar: [`pegs/index.ts`](../../src/games/pegs/index.ts)
(`changedState`), with the repro in `pegs-midend.test.ts`.

### A pointer-following overlay must erase everything it painted

**An overlay drawn outside the per-tile cache owns its own cleanup, in
full — and partial invalidation is the smear bug.** Galaxies' original
drag arrow was drawn at raw pixel positions after the tile loop and
invalidated only the single tile under the pointer: every other tile the
arrow spanned kept a stale frame, the mirror arrow's tiles were never
invalidated at all, and ink that landed outside the board could *never*
be erased (the border repaints only on first-draw). The result read as
"continuous rendering" but was accumulated garbage — owner-reported with
a screenshot, 2026-08-08. Before drawing anything pointer-positioned
outside the cache, ask what erases it, tile by tile, including off-board
pixels; the safe default is to **snap the preview into cells** so the
cache's own repaint is the eraser (see the aim-style drag in
[input](./input.md) § "Other drag shapes"). Exemplar:
[`galaxies/render.ts`](../../src/games/galaxies/render.ts) (the
`overlay` sidecar; the closing comment of `redraw` records the trap).

**The same file had a second one, and its color was hiding it.** Galaxies'
half-grid keyboard cursor — the mark on a vertex or an edge, as opposed to the
tile-center cursor that was already a key bit — was drawn after the tile loop
with a bare `drawRect` and left a mark at *every* vertex and edge it visited.
Nobody had reported it in the two years the port has existed, because the
cursor was painted in a near-invisible tint of the board; fixing the color is
what exposed it. Two things generalize. **Sweep for the whole class when you
find one instance** — grep the file for paint outside the cell loop, not just
the overlay you were sent to fix. And **"I can't see it" and "it is broken"
are frequently the same report**: a low-contrast affordance is also an
unreviewed one, so its rendering bugs accumulate undisturbed.

**Folding a half-grid overlay in is the same trick the dots already use.** A
mark on a vertex or an edge straddles up to four tiles, which sounds like it
needs a blitter and does not: give each tile a bit per subcell position of its
own 3×3 block and let each paint its clipped share, exactly as a game already
does for dots that sit on tile corners. Galaxies packs the drag preview plane,
the cursor position and the drag's candidate rings into one `OverlaySidecar`
word for this reason.

### A transient affordance needs an authored color

**A color derived from the board cannot be prominent against the board — in
either scheme.** Galaxies' cursor was `[min(r × 1.4, 1), g × 0.8, b × 0.8]` of
the background, a faithful port of upstream's idiom, which on this app's
`#d5d5d5` board is `#ffaaaa`: a pale pink, one pixel wide. And because it is
*computed* rather than authored, dark mode adapts it by calculation, so it
comes out a faint tint there too — the failure mode `hand-author-dark-palette`
recorded for Light Up, arrived at from the other direction. The drag preview
had inherited it, and the owner reported both as unreadable in both schemes.

Reach into [`color/palette.ts`](../../src/engine/color/palette.ts) for a
*meaning* instead — `CURSOR` for the keyboard cursor (green, because most
boards are grays and blacks and whites), `DRAG_ADD` for "let go and this is
laid". Those are authored per scheme. Keep board-relative derivation for what
it is good at: fills, grids and shades that are *supposed* to sit close to the
board.

### A cursor is usually a cache key, not a blitter

**A C *cursor* blitter usually shouldn't become a TS blitter.** Upstream
often blitter-saves the pixels under the keyboard cursor so it can draw it
anywhere without dirtying the cell cache. When the cursor sits inside a cell
(or a sub-cell slot), the simpler faithful translation is to fold the cursor
position into that cell's packed key and draw the cursor marks in the cell
repaint — the old cell repaints when the cursor leaves (its key changed), no
save/restore needed, and the recording double sees real ops instead of
blitter no-ops. Reserve actual blitters for sprites that cross cell
boundaries mid-drag (Pegs' and Signpost's drag sprites). Exemplar:
[`subsets/render.ts`](../../src/games/subsets/render.ts) (upstream's
`draw_rect_corners` blitter cursor as a `cursor-slot` field of the cell key).

**The exception: a cell repaint that deliberately doesn't clear the whole
cell.** Folding the cursor into the key only erases it because the repaint
paints over where it was. Spokes' repaint clears a plus-shape, leaving its
corner squares for a second pass that owns the diagonal through the
four-cell meeting point — and the cursor's diagonal offsets land in exactly
those corners. There the blitter is right, and costs nothing testable: the
recording double no-ops only `blitterSave`/`blitterLoad`, so the cursor's own
draw ops are still asserted. Check what your cell repaint actually clears
before applying the default. Exemplar:
[`spokes/render.ts`](../../src/games/spokes/render.ts) (the corner protocol
is in its module header).

**Draw the cursor inside the thing it selects, not merely in the right cell.**
Map's cursor is a cell *plus a direction*, which is how upstream names one of
the two regions a diagonally-split cell holds — and upstream nudged its ring one
pixel, which on a divided cell parked it on the diagonal saying nothing about
which half was meant. Fine while the cursor only picked a color up; not fine once
`give-map-element-keys` made every key press act on it. The first fix moved the
ring to the triangle's centroid; the real one (`share-the-selected-cell-highlight`)
stopped drawing a *point* for a selection that is a *region*, and outlines the
region instead (§ "The note-taking cell's picture"). The centroid survives for
the color the keyboard carries, which does name a point. The general rule:
**when a selection starts being acted on, re-ask whether it is legible** — and
ask what the selection *is* before asking where to put its mark.

## A press preview must not look like a commit

**If a transient press/preview overlay is visually indistinguishable from a
committed state, a press that doesn't commit reads as a glitch.** Mines'
mouse-down chord highlight was drawn identically to an opened cell — faithful
to upstream — so a plain left-click on an unsatisfied number flashed a false
"uncover" that reverted on release, read by the owner as "uncovered blocks
re-covered". The fix decouples preview from intent: a left press keeps the
chord semantics but drops the preview, while the deliberate chord gesture
(middle / Shift+left) keeps it. Make the preview distinct, or suppress it on
the gesture that usually won't commit. Exemplar:
[`mines/render.ts`](../../src/games/mines/render.ts) (design D11 in the Mines
change).

## When two games share a mechanic, they share its look too

**A renderer is shareable when the thing it draws is a shared *mechanic*, and
not when it merely resembles another renderer.** Those read the same and are
not: the second is true of almost any grid game here.

The worked example is [`engine/border-grid-render.ts`](../../src/engine/border-grid-render.ts),
which Palisade and Separate both draw through. What moved is the mechanic's own
look — the error model over its two DSFs, the half-grid cursor whose *movement*
`border-grid.ts` already owned, the four edge rects keyed off its border bits,
and the tile skeleton around them. What stayed is each game's clue layer:
Palisade's digit and hint marks, Separate's letter and region shading. The
shared code takes each game's palette indices and a `drawContent` callback and
never asks which game it is drawing.

Three things that generalize:

- **A callback is the honest shape when order is the point.** Content goes under
  the edges, and the clip / unclip / `drawUpdate` bookkeeping wraps all of it.
  Exporting three steps instead would put that bookkeeping back in both games,
  which is exactly what drifts.
- **The diff key is part of the shared contract.** Both games pack their tile
  flags into one `Int32Array` cache; unifying the *bit layout* was free only
  because those flags are draw state — rebuilt by `newDrawState`, never in a
  desc or a save. Check that before unifying a cache key, and reserve the game's
  own bits above a named floor so the two can grow apart without colliding.
- **The proof is a byte-clean snapshot, not a green suite.** A pure extraction
  must leave every draw call, argument and order identical, and tier 2.5 records
  exactly that — 225 and 237 ops here, unchanged. If a snapshot needs `-u`,
  pixels moved and the extraction is wrong.

### The note-taking cell's picture

The selected cell looks the same in every note-taking game: the whole cell
washed when typing enters a value, a triangle in its top-left corner when typing
enters a note, and the same whether the mouse or the keyboard put it there. The
game calls `drawCellBackground` from
[`engine/note-taking-cell.ts`](../../src/engine/note-taking-cell.ts) where it
used to paint its cell's background rect, and hands it that same rect.

- **It draws inside the tile repaint, so it rides the tile key.** Pack
  `cellHighlight(ui, x, y)` — two bits — into the key, or the old cell never
  repaints when the highlight leaves (§ "A cursor is usually a cache key, not a
  blitter"). A game that hides the highlight for its own reasons, a completion
  flash, passes `HIGHLIGHT_NONE` rather than skipping the call.
- **The triangle is background.** It is drawn with the rect, before any content,
  so a clue in the same corner (Keen's cage label, a pencil mark in the top-left
  slot) sits on top of it, and so do Group's dividers, which the triangle used
  to cover.
- **The legs are half of the rect the game paints**, not half a tile, so Solo's
  and Keen's cells, which reach into the gutter they share with their block,
  keep a triangle in proportion.
- **The color is `highlightWash(background)`, at an index the game names.** It
  is the palette's "you are here" wash under content (§ "The palette: three
  layers, meaning first"). Before `share-the-selected-cell-highlight` five
  games had drifted into four other answers — mkhighlight's near-white, its
  lowlight, and pairs of the two — each a reasonable local choice, and not one
  of them about the puzzle.

What legitimately differs stays in the game: a Crossing *wall* can only be
reached by the arrow keys and has no background to wash, so the keyboard
cursor there is still the corner brackets, and a Crossing digit is a raised tile
whose face takes the wash and whose bevel also presses in. Rome's keyboard can
be *armed* to await a direction, which the picture alone cannot say, so an
armed square adds a `?` in the ink of what it will draw.

**A region takes the picture in its own shape.** Map's selection is a region of
half-cell triangles, and its fill is the answer, so a wash over a red region
would read as a different red. It draws a band in `CURSOR` just inside the
region's whole boundary in both modes — the region "filled" without its fill
changing — and in notes mode the corner triangle in the region's first cell.
The band is each cell's convex pieces clipped to a strip along their boundary
sides, plus a corner square where the boundary only passes through a corner (an
L-shaped region's inner corner, where two strips would meet at a point); see
`drawSelection` in [`map/render.ts`](../../src/games/map/render.ts). The cell
guard excuses Map through a one-entry ledger it holds exactly right, and Map's
own tests say what the band must be: inside the region, on every boundary cell,
and well under half its area — the last is what tells a band from a wash.

### Sharing a *primitive* is a different, smaller move

`border-grid-render.ts` shares a mechanic's whole look. `engine/draw.ts` shares
single shapes — the recessed frame, the raised tile bevel, the thick error
frame, the corner brackets — and three of those were promoted only after six,
seven and eight games had each written the vertex arithmetic out. **A shape any
other game also draws belongs there**, and unlike a mechanic it needs no
callback and no shared cache key: it takes a rect and colors and draws.

Learned promoting the last two
(`unify-the-raised-tile-bevel`, `promote-the-thick-rect-outline`):

- **Check whether the *dimensions* were drifting too, not only the shape.** The
  six raised-tile games had four thickness formulas, so one idiom read 1px in
  Fifteen and 3px in Mines at the same tile size. `raisedBevelWidth` ships
  beside `drawRaisedBevel` for that reason. Splitting the extraction (no pixels
  move) from the sizing fix (pixels move) into two commits is what makes the
  second one reviewable.
- **If every caller follows the helper with the same next call, the helper
  stopped one call short.** `drawRaisedBevel` left the face to the caller, and
  three games that keep a grid line each inset it from the unclipped tile, which
  left the right and bottom borders a pixel thinner than the left and top, and
  absent at a width of one. `drawRaisedTile` draws the face too
  (`draw-crossings-tile-through-the-bevel-helper`). Pass it the pixels the tile
  covers, which for a tile inside a grid line is
  `{ x: tx + 1, y: ty + 1, w: ts - 1, h: ts - 1 }`.
- **A byte-clean snapshot is only evidence if something is watching.** Deleting
  a whole side of the error frame, with the helper wired into eight games,
  failed **one** test in the collection. Break the helper deliberately and see
  what goes red before you believe an unchanged snapshot.
- **The games may disagree on something the survey didn't measure.** Here it was
  *vertex order inside the polygon* — three orders across six games. Winding is
  invisible in the painted frame but a snapshot records the points array, so
  "changes no draw call" was achievable for only the largest group; the rest
  moved to the commit where a moved recording was already expected.

## Bespoke board geometry, draw side

Some games store an odd-shaped board in a padded rectangle and shear it on
draw (Bricks' hexagon: each row offset rightward by half a tile per row). The
state/coordinate half — the bounds mask, the neighbor table, the inverse
pointer transform — is logic and lives with
[`mechanics.md`](./mechanics.md) § "Bespoke geometry". On the draw side:

- **Force the tile size even** (`ts & ~1`) in *both* `computeSize` and
  `newDrawState`, so half-tile shears are exact.
- **The shear/origin/bevel choices are display** — match the look, keep the
  code clean; they were never in byte-parity scope.
- **An SVG dump is the fastest shear check**: `toSvg` a `renderScenario`
  frame and rasterize it (see [`testing.md`](./testing.md)); a wrong offset
  shows instantly as a staircase, where at 1× a missing hairline is easy to
  miss.

**Render asks; move code decides.** Any rule the input and the display both
need is one function, called by both — coordinates are only the obvious case.
Crossing colored each clue by which run a click would send it to, with the
rule written twice (a helper for the click, an inline loop in `redraw`); they
agreed until the rule got a tie-break, and then the list said "down" while
the click put it across. Delete the copy: `redraw` now asks `runForNumber`.
**Tell:** a predicate in `redraw` that answers what a *move* would do.
Exemplars: [`bricks/render.ts`](../../src/games/bricks/render.ts) +
[`bricks/index.ts`](../../src/games/bricks/index.ts) (shared `offsets`),
[`crossing/state.ts`](../../src/games/crossing/state.ts) (`runForNumber`).

## Special paint shapes

### A clue-ring erase must not wipe the grid

**Games with a margin of clues repaint one clue tile at a time — and on one
edge, the grid's outermost border line lands on the clue tile's first
pixel.** A tidy symmetric erase wipes it. That is why upstream's four
per-side erase rects look gratuitously inconsistent (Salad's right-clue erase
is inset where the other three sides aren't): **the asymmetry is
load-bearing; do not fold the four sides into one uniform rect.** Salad
shipped exactly that tidy-up and lost the right-hand border of every clued
row — visible only on the edge, only for clued rows, reading as an
anti-aliasing artifact. Pin the *invariant* ("no clue-tile erase overlaps the
grid's outline box"), not the pixel offset, so a different fix still passes.
Exemplar: `salad-render.test.ts` ("does not let a border clue's erase wipe
the grid's outline").

### Negative-space grids

**Some games draw their grid lines as negative space — don't "add" the lines
you can't find.** Rome's `game_redraw` contains no line-drawing at all: the
first frame floods the canvas with the border color, and every square paints
its own background rect inset by one pixel everywhere, and further on each
side that meets a different region. What survives the fills *is* the grid. A
port that "helpfully" strokes the boundaries will double-draw; the *inset* is
the thing to assert in a tier-2.5 test (compare a square whose neighbor
shares its region against one whose doesn't and expect a wider rect), not a
line op that does not exist. Exemplar:
[`rome/render.ts`](../../src/games/rome/render.ts) + `rome-render.test.ts`
("insets a square's fill on each side that meets a different region").

### Display state in a narrow type

**A display-only value stored in the wrong type is a bug you may just fix.**
Byte-parity rules were about the generator/solver/codec; on the drawing path,
deliberate visual improvements are the point of the fork. Crossing's C
declared `bool flash` and assigned a nine-phase frame index to it, collapsing
its completion animation to a static color shift — the fix is one type, and
a tier-2.5 test that two flash phases paint differently pins it (a snapshot
alone won't tell you the animation is *moving*). Seismic widens the tell to
plain data: its C assigned a 9-bit pencil mask to a `char`, so a penciled 9
was truncated away and never drawn. **Tell:** a frame counter, phase index or
animation step stored in a `bool`/`char`; any bitmask copied into a narrower
local before use. When the exposing input is one the generator never produces
(no generated Seismic board has a nine-cell region), hand-build the board
through the game's own codec for the regression test — which also proves the
input is reachable in play. Exemplar:
[`seismic/render.ts`](../../src/games/seismic/render.ts) + `seismic.test.ts`
("draws every pencil mark, including a 9").

## Animation and flash

**The contract:** `animLength(a, b, dir, ui)` and the flash hooks return
durations; the midend runs the timer and calls `redraw` with
`animTime`/`flashTime`; the game interpolates. A non-animated transition
paints once; animation frames — including the first — are driven by the
timer (`engine-drawing` § "The midend repaints on every transition, rebuilds the
draw state for a new tile size, and lays the ground under a fresh one").

**When the win flash plays is the engine's; how long is the game's.** The
midend flashes on a forward move, other than the Solve command, that leaves the
board's status solved when it was not (`ts-engine` § "The engine derives a
board's history from its position"). The game supplies only the duration:

```ts
solvedFlash: () => FLASH_TIME,
```

A duration that sweeps the board (Ascent, Net, Netslide, Flood, Flip) computes
it from the solved state `solvedFlash` is handed; one that is a preference
(Map) reads the `Ui`. Durations differ because each game's redraw paces its own
flash frames, which is a fact about that game's look.

**What is suppressed is the Solve *command*, not a cheated *board*.** A player
who uses Solve, unmakes part of it and then finishes by hand has won, and gets
the celebration; the record that the solver was used is the midend's, in the
status bar and "solved with help". That rule came from Palisade, which had it
right first. And because the status is the board's *now*, a solved board the
player breaks and solves again flashes again; undoing a break does not.

**`flashLength(a, b, dir, ui)` is for a flash the status does not show**: a
death (Inertia, Mines), a board with no move left (Same Game), a loss (Flood)
or a reveal that flashes on Solve too (Black Box). The midend asks it first on
every transition and a nonzero answer replaces the win flash, so it returns 0
for a win. Where the redraw picks the flash's kind from a `Ui` field that
`flashLength` sets, a win must still select the win kind.

Dominosa's flash used to clear its hovered-pair highlight as a side effect;
that belongs to `changedState` on the transition into solved, which is where a
game reacts to a status change (ABCD, Light Up, Magnets, Signpost and Singles
hide their cursor there).

**Flash isolation is a midend concern the games inherited the hard way**:
Flip's solve celebration once fired on every animated move because the midend
accumulated `flashTime` unconditionally. If a flash overlay appears where it
shouldn't, suspect the *armed/settled* state machine before the game's
condition — and keep a flash-overlay-isolation test (Flip has one).

## Sizing

`computeSize(params, tileSize)` is the pure size function;
`newDrawState(state, tileSize)` builds the draw state at the chosen size,
deriving any tile-size geometry (radii, gaps, offsets) right there, so
`interpretMove` coordinate mapping and `redraw` agree; `preferredTileSize` is
the baseline (default 32).

**A draw state lives at one tile size.** `Midend.size` builds a fresh one when
the tile size it resolves differs from the last, and touches nothing when it is
the same, so a layout jiggle keeps the cache (see the doctrine above). So a game
writes **no resize invalidation**: no `if (ds.tileSize !== ts)` guard, no cache
wipe, no dropping a wrongly-sized blitter — a blitter allocated lazily in
`redraw` is the right size for as long as its draw state lives, so `if (!ds.bl)`
is the whole check. And a game's `redraw`/`interpretMove` is handed a draw state
that is both non-null and at the size on screen — so no `if (!ds) return;` and
no `ds?.tileSize ?? PREFERRED_TILE_SIZE` (see [mechanics](./mechanics.md) §
"interpretMove and UI_UPDATE").

**The draw state's field is `tileSize`**, the word `preferredTileSize` and
`computeSize(p, tileSize)` already use. It is not a decision a game makes — the
collection once spelled it several ways, and no game had a reason to. A board
that is not tiled holds its scale as `tileSize` too (Cube's grid scale, Guess's
peg size), because that is the number `newDrawState` is handed. Nothing enforces the name; a new spelling
shows up as a line in the capability snapshot ([testing](./testing.md) § "The
divergence no clone detector can see").

*Compressed history:* the retired web build defined `NARROW_BORDERS`, so C
games with an `#ifdef NARROW_BORDERS` variant (Slant's slim border; Bricks'
`BORDER = 0`) were ported in the *narrow* variant — parity was with what the
browser actually showed, not the desktop default. If a border constant looks
surprisingly small, that is why. Exemplar:
[`bricks/render.ts`](../../src/games/bricks/render.ts). Slant's slim border has
since grown by `pencilIndicatorReach`, the room notes mode's pencil needs at the
canvas's top-right corner.

## The palette: three layers, meaning first

**A game contains no color value. Not one.** Every color a game shows is a
reference into the collection's color system, or a call to a shared function
from it. Three layers, three import paths, and which one you reach for is the
decision:

- [`engine/color/palette.ts`](../../src/engine/color/palette.ts) — **the
  meanings**, and your default: `ERROR`, `ERROR_TEXT`, `ERROR_WASH`,
  `HINT_ACTION`, `HINT_EVIDENCE`, `HINT_EVIDENCE_WASH`,
  `HINT_BLACKREF`/`HINT_WHITEREF`, `CURSOR`, `HELD`, `DRAG_ADD`/`DRAG_REMOVE`,
  `FLASH`, `RULED_OUT`, `GRID_MID`, `GRID_DARK`, `PENCIL_BODY`,
  `INK`, `PAPER`, plus the background-derived functions (`pencilColor`, `playerEntryColor`,
  `highlightWash`, `lineMaybeColor`, `lineNoColor`, `clueDoneColor`, and the
  surfaces `cellSurface`, `surfaceGrid` and `givenSurface`, and `wallFill`),
  `SHADED` and `REGION_DONE`. Each is a *reference* to a named
  color, so restyling red restyles every meaning built on red.

  Three of these are worth naming by the mistake they replace. **The
  cursor** is `CURSOR` when it is a *mark* (a ring, outline, line or disc);
  a cursor that *fills a cell under the cell's content* is `highlightWash`,
  the "you are here" wash Solo's family draws with; and when the board has
  spent green, the collection's second choice is `PURPLE`, so a purple cursor
  reads as "the cursor, on a board that uses green" rather than as a new
  color — the doc on `CURSOR` says why. **"This clue is
  done"** is `clueDoneColor` for retired *text* and `REGION_DONE` for
  a completed *fill* — five games once encoded it five ways, from `INK` (Loopy,
  which made the distinction invisible) to a bespoke `bg × 0.85`. **The solved
  flash** is `FLASH` wherever a board flashes to a fill or line color; a bevel
  wave, a state swap or a color cycle is an animation, not a color, and keeps
  its own mechanism.
- [`engine/color/colors.ts`](../../src/engine/color/colors.ts) — **the
  palette itself**: twelve names, most at three intensities (base, `_WASH`,
  `_BOLD`), plus the distinguishability sets (`TEN`, `TEN_NAMES`,
  `EIGHT_FILLS`, `FOUR_FILLS`).
- [`engine/color/palette-games.ts`](../../src/engine/color/palette-games.ts)
  — colors a game defines **relative to its own board**, prefixed with its
  id (`slantGrid`, `undeadGhost`). Functions, not values.

Write `out[COL_ERROR] = ERROR;`. Tokens deliberately drop the `COL_` prefix
(which in this codebase means "a palette **index**"), so a game's own index
constants keep matching its C enum and the namespaces never collide.

**Reach for a meaning first. Reach past it to a named color only where the
*name* is load-bearing to the player** — a member of a set whose job is to be
told apart (`TEN`), or a color the game says out loud (Flood's hint reads
"Fill with orange"; `TEN_NAMES` is re-exported alongside `TEN` so word and
color cannot drift). If you write `out[COL_CURSOR] = GREEN` where `CURSOR`
would do, the next scheme has to rediscover that this green was a cursor.

**The escape hatch is real but narrow, and it is where sprawl grows back.** A
game whose board has *spent* the default may pick a different named color
(Spokes' cursor is `PURPLE` because green is a held hub and blue a ruled-out
spoke). **Say why, at the assignment, in one line** — on the assignment line
or the line above it, which is where
[`palette-departures.test.ts`](../../src/engine/color/palette-departures.test.ts)
looks: for every slot whose name says cursor, held, drag or hint, it requires
the role or a comment, and fails on a bare departure. Before
`consolidate-colour-palette` there were 190 named colors and seventeen
cursors; the seventeen read as seventeen decisions and were one decision plus
collisions. If nothing in the palette fits, that is an exception recorded in
`palette-games.ts` under your game's prefix, with why no meaning and no named
color serves — there is currently **none** in the collection. Aim to add
none.

**Pick the replacement against the span of what it lands on, not against one
material — and remember the span inverts.** A cursor is clamped to the whole
grid, so it sits on every material the board has. Slide's run from the key block
and wall at the dark end to the floor and exit at the light end, which rules out
every mid-tone: teal, pink and orange all disappear against something, and
yellow vanishes into the floor outright. That argues for an *end* of the range —
except that in dark mode the ladder flips, and the wall and key block become the
**lightest** things on the board. There is no flat color at the dark end of
both schemes, which is why the tie-break is **chroma**: red against a neutral
gray wall reads at equal lightness, where a second gray would not, and red
against the blue key block is opposite in hue rather than adjacent to it.
Purple was tried first and read as a smudge on that block for exactly that
reason. This is `hand-author-dark-palette` F1's "'brightest' is scheme-relative"
seen from the other side: it applies to *darkest* too, and to any argument that
picks a color by where it sits in one scheme's ordering.

### What a board looks like: pieces on a quiet surface

The owner's decisions (2026-10-07, from the mock-ups in the archived change
`give-the-boards-a-visual-identity`), which hold for every game they fit:

- **The board recedes and the content carries the color.** A cell is
  `cellSurface`, a small step off the board; the line between cells is
  `surfaceGrid`, thin, and the frame round the grid is no heavier than it.
- **A state is a piece, and a piece is a shape as well as a color**
  ([`engine/piece.ts`](../../src/engine/piece.ts), `drawPiece`). It sits inset
  on its cell, so the grid shows between neighbors of one kind and a mark at
  the cell's edge (cursor, hint ring, outline) lands beside it. State is never
  a step of gray alone.
- **Two states where neither is the important one are `TWO`**: purple and
  yellow, a square and a disc (`TWO_SHAPES`). Not blue, green, orange or red,
  which the marks drawn on a board have spent.
- **Shaded or not is one color, not two** (owner, 2026-10-07; Pattern, Mosaic,
  Range, Singles, Bricks; in Singles the mark for a cell kept clear is the
  puzzle's own ring round its number, not the cross). The states are not equals:
  the shaded cells are what the puzzle is about, and "not shaded" is a note. A shaded cell is the
  `SHADED` piece (`SHADED_SHAPE`, `SHADED_NAME`), a cell ruled out is quiet
  surface with `drawRuledOutCross`, and an undecided one is plain surface, so a
  finished picture still reads as a picture. **Ruled out is a cross in every
  game** (owner, 2026-10-08, replacing the dot of the day before): a cell, a
  slot or a square the player has said holds nothing takes `drawRuledOutCross`
  and never a mark of the game's own, so the mark is learned once. A cell
  that also holds a number passes a corner box (Mosaic). The words are `SHADED_NAME` and
  `UNSHADED_NAME`, never "black" and "white". Flip is not one of these: lit
  and unlit are both states the player makes, and it takes the pair.
- **The pair's hues are the board's content beyond two states** (owner,
  2026-10-07: more of the theme where a board is mostly gray or carries a hue
  with no reason). A thing the player pushes or carries is `MOVED` (Sokoban's
  barrel, Cube's paint); where they are going or what they are after is `GOAL`
  (Sokoban's target, Inertia's gem, Rome's goal); the figure they steer is
  `CURSOR`'s green. A game whose content is one kind of placed thing takes
  `SHADED` for it (Boats, Dominosa, Sticks). Not a drawn line (Loopy, Slant,
  Pearl): a purple line beside the hint's blue line of the same width is the
  pair a color-blind player cannot tell. Not text. A hue that is the puzzle's
  own meaning stays (Map, Flood, Undead).
- **A given is told by the cell under it** (`givenSurface`, lifted toward
  white), not by a mark on the piece: a given piece is the same piece.
- **The two surfaces mean one thing everywhere.** The plain cell is "still
  yours to work"; the lifted one is "settled": a given (Solo, Range), a tile
  the player locked (Net), a hub or island that has what it needs (Spokes,
  Bridges), a closed region (Galaxies), a square still covered (Mines). A new
  game that needs a second tone for a cell takes the lifted surface for the
  settled side and says which reading it is at the assignment. A selected cell
  (`highlightWash`) sinks below the cell in both schemes, and a finished
  region (`REGION_DONE`) takes the wash of the pair's first hue, so neither is
  taken for a given. A finished region is not a step of gray: darker is a hole
  in the dark board, and lighter is the given.
- **The dark board stays where it was** (the proposal's question 7). Cells
  sink below it and a settled cell rises to about its tone, which opened the
  contrast the question was after without moving every game's board.
- **A wall is one flat strong fill** (`wallFill`), not a bevel and not a
  game's own black: Inertia, Sokoban, Crossing, Light Up, Sticks. A digit on
  it is the pinned `WHITE`.
- **A glyph that sits on a piece is a badge**: its own disc, with the glyph in
  the fill's text color (Unruly's count `!` is `ERROR` under `ERROR_TEXT`). Ink
  of one hue on a piece of another differs in hue and not in lightness.
- **A bevel is kept only where the tile is an object the player moves**
  (Fifteen, Sixteen, Twiddle, Slide).

**The game names no hue.** It takes `TWO[i]`, `TWO_NAMES[i]` for its hint
words and verbs, and `TWO_SHAPES[i]`, and its help page writes `{{pair:0}}` and
`{{pair:1}}` ([`help-pages.md`](../help-pages.md)). A different pair, or a
theme a player picks, is then a change to `colors.ts` and `piece.ts` and to no
game. A hue typed in a game, a hint sentence or a help page is the copy that
change would leave behind. Exemplar:
[`unruly/render.ts`](../../src/games/unruly/render.ts),
[`unruly/hint-text.ts`](../../src/games/unruly/hint-text.ts).

### A relative color is a named function

**A color defined relative to something is a named function in
`palette-games.ts`** — never open-coded `bg[0] * 0.9` in the game, which is
the same color decision written as arithmetic somewhere no scheme can reach.
The derived form matters more than it looks:
[`puzzle/components/view.ts`](../../src/puzzle/components/view.ts) hands the
engine **pure white** as the background in dark mode (so `background × 0.9`
derivations keep working; `resolvePalette` shifts it to a light gray before
any game sees it) and adapts the returned palette itself — so a
color that must stay legible against the board has to be a *function of the
background*, and an absolute color should be a *named* one (a named color
authors both schemes; a derivation handed pure white authors neither).

An arithmetic trap that cost a diff: `scale(c, 1/1.5)` is **not** `c / 1.5`.
The ratio is not representable, so pre-computing it rounds once more. Use
[`divide(c, 1.5)`](../../src/engine/color/color-token.ts), which keeps
upstream's *operation*.

### Black pieces stay black

**If the color means "this piece is black/white", use `BLACK`/`WHITE` from
`colors.ts`, not `INK`/`PAPER`.** Same color; the difference only shows in
dark mode — which is exactly why it gets missed. `INK` is maximum contrast
against the surface, so it inverts; a piece's black is the piece's identity,
so it is preserved (an inverted peg tells the player it is the other color).

### Assign the color, never a copy

**Every named color authors both schemes; a derivation authors neither.**
The dark value rides on the array as an own property, so `[...BLACK]` is the
right color with its scheme decision silently removed — and no test can
catch that in general.

### Declare the scheme beside the palette

**What your palette needs from the color schemes beyond its tokens is
`Game.paletteScheme`, written with your own `COL_*` constants.** Most games
declare nothing. It names slots and never a color: a color that is wrong in
the dark scheme is fixed by authoring the dark value on its token. The two
things it can say:

- `darkSwaps` — the pairs dark mode exchanges. Inverting lightness turns an
  emboss into an inset, so a bevel drawn from `mkhighlight` lists its
  `[COL_HIGHLIGHT, COL_LOWLIGHT]` to stay lit from one side. A highlight you
  use as a cursor or a selection is not a bevel and stays out. A bevel built
  with `mkhighlightSpecific` from a base that authors its dark value needs no
  swap, because the trio is derived again from the dark base (Crossing's
  wall).
- `board` — the color the board is painted in, when it is not color 0
  (Untangle, whose color 0 is the dead space around the play area). The page
  around the canvas takes it.

Nothing outside your game addresses its palette by number, so the order of
your `COL_*` constants is yours: insert, drop or reorder freely. Exemplars:
[`slide/render.ts`](../../src/games/slide/render.ts).

### Every board is one tone

**The background your `colors()` receives is already the board.** The
midend's
[`resolvePalette`](../../src/engine/color/color-mkhighlight.ts) shifts the
host background off pure white and pure black (`mkhighlightBackground`) once,
before any game sees it, so every game paints the same board tone whether
its C called `game_mkhighlight` or took `frontend_default_colour` raw.
Assign `out[COL_BACKGROUND] = defaultBackground` and call `mkhighlight` only
when you want the bevel trio — it re-derives the identical background, the
shift being exactly idempotent. Before this, the collection was split 22/30
along that C distinction, invisibly in light mode and loudly in dark, where
Loopy's board resolved to `#161616` and Palisade's to `#3c3c3c` and every
raw-background game's white flash landed on its own board.
`board-background.test.ts` holds every registered game to one board.

### Highlights from a fixed base

**Highlight/lowlight from a fixed base color needs `mkhighlightSpecific`,
not `mkhighlight`.**
[`mkhighlight(bg)`](../../src/engine/color/color-mkhighlight.ts) derives
its trio from the frontend background and never extrapolates the base;
`mkhighlightSpecific(base)` extrapolates a near-extreme base toward the
opposite extreme, exactly as the C's `game_mkhighlight_specific`. Reach for
it whenever a tile color isn't the host background (Slide's blocks).

### Make determined state legible

**Where upstream leaves known cells looking like undecided ones, give each
determined state its own fill** — deliberate divergence; display was never in
parity scope. Range paints a known-white cell pure white (via a dedicated
color derived from `color-mkhighlight.ts`, which shifts the background off
pure white precisely so a pure-white cell stays distinguishable), leaving
only undecided cells gray. Exemplar:
[`range/render.ts`](../../src/games/range/render.ts).

### A cue that equals the background is a bug

**A "highlight" upstream draws as pure white may be invisible here — check
both schemes.** Spokes' satisfied-hub fill read as nothing in light mode and
as *literally the background* in dark mode, because `view.ts` handed the game
pure white there (the engine now shifts it first — see "Every board is one
tone" — but a pure-white cue is still only a sixth of the range above the
board). A cue that has to be seen must be a clear step **away**
from the background (`defaultBackground × 0.85` is enough; grays survive the
dark-mode adaptation because it inverts lightness about the real background).
When a game's own color nearly equals its background, fix it, don't preserve
it. Pair the cue with a `GamePref` when it is a solving aid rather than game
state (Bridges' `auto-mark-complete` and Spokes' `mark-satisfied` are the
same control). Exemplars:
[`spokes/render.ts`](../../src/games/spokes/render.ts),
[`bridges/render.ts`](../../src/games/bridges/render.ts).

### Completed regions share one color

**Fill a completed-and-correct region with
[`REGION_DONE`](../../src/engine/color/palette.ts), not
an invented hue** — so "done and correct" reads the same across every game
and is tuned in one place (a green invented for Separate/Palisade was the
inconsistency this rule exists to prevent). Compute local validity per
wall-bounded component, OR an `F_CORRECT` bit into the packed cache key (it
must be in the diff key so it paints *and clears* as regions complete/break),
and prioritize it below flash/hint fills. Exemplars:
[`separate/render.ts`](../../src/games/separate/render.ts),
[`palisade/render.ts`](../../src/games/palisade/render.ts).

### Dark mode is the app's concern

**Don't make a color derivation luminance-aware in the game.** `colors()`
never sees a dark background: `view.ts` passes pure white precisely because
puzzles multiply the background down, then adapts the whole returned palette
in OKLCH — a token's authored dark value first, calculation otherwise, with
the game's `paletteScheme` on top. A luminance test in a
game is dead code, and a second adaptation fights the layer that owns the
concern. Derive exactly as upstream does, and when the derived dark value is
wrong (Loopy's undecided edge inverted to near-invisible), **author the dark
value on the shared role** with `token(light, dark)` rather than patching the
game — that fixed Loopy, Palisade and Separate at once and retired the three
identical `{ n: 0.6 }` overrides they carried. Exemplar:
[`loopy/render.ts`](../../src/games/loopy/render.ts), and
`lineMaybeColor` in [`palette.ts`](../../src/engine/color/palette.ts).

### What enforces the palette rules

[`palette-source.test.ts`](../../src/engine/color/palette-source.test.ts)
reads your game's source and fails on a color literal, on channel-indexing
the background, on importing the color combinators, and on importing another
game's token (a genuinely-not-a-color three-number array is declared in its
`NOT_COLORS` with a reason — it has two entries and should stay about that
size). [`colors.test.ts`](../../src/engine/color/colors.test.ts) measures
every must-stay-distinguishable set in both schemes;
`palette.test.ts` checks no meaning has quietly become a color of its own
(meanings are references, checked by identity).

Two guards hold the dark scheme, and both read your game's frames without
being told about it.
[`neighbor-contrast.test.ts`](../../src/puzzle/neighbor-contrast.test.ts)
paints your frames into palette indices, takes every pair that ends up side by
side, and fails when two areas stand closer than its floor in the dark scheme
(or a mark does, where the light scheme gave it twice the distance). Two
indices that hold one color in both schemes are one role under two names and
owe each other nothing. If it
names a pair of yours, look at the game in the dark scheme before deciding: a
pair that is close on purpose goes in its ledger with what it is, and a pair
that is not gets an authored dark value on the shared role. It reads the deal
and one frame some hint steps in, so a color only input brings out is not
covered by it.
[`bevels.test.ts`](../../src/puzzle/bevels.test.ts) finds the bevels
on the same frames by shape (two polygons in a row splitting one box along its
diagonal, which is what `drawRaisedTile`, `drawRaisedBevel` and
`drawRecessedBorder` emit) and fails when a bevel's lighter color is not the
lighter one in both schemes. So a bevel whose `darkSwaps` pair you forgot fails
without being listed anywhere. The same file counts each game's calls to those
helpers while the frames are drawn, and fails a game that draws a bevel of that
shape itself.
A bevel drawn another way (Slide's piece parts, Twiddle's trapezoids, Black
Box's) is not seen by it; draw through the helpers where the shape allows.

**If a bevel's two colors are also tints, give the bevel its own pair of
slots.** A swap changes the dark value of every use of the slot, and a tint
wants the opposite of what a bevel wants. Crossing's placed digit is the case:
`COL_TILE_HIGH` and `COL_TILE_LOW` hold the same colors as `COL_HIGHLIGHT` and
`COL_LOWLIGHT` and are the only ones swapped.

**A color your words name is a piece's color, and a piece's color is pinned.**
If the help page, a hint or a parameter label calls something black, white,
shaded or lit, paint it in `BLACK` or `WHITE` (`colors.ts`), not in `INK`,
`PAPER` or a bevel's highlight, which all invert with the scheme: Flip's page
said "light up all the squares" while the dark scheme drew a lit square black.
A digit on a pinned cell is pinned with it, and a grid between pinned-white
cells is `GRID_DARK`, since ink would be white on white. Where the thing really
is ink (a blocked square beside ink digits), fix the word instead.
[`help-lightness-words.test.ts`](../../src/help-lightness-words.test.ts) holds
the help page to this; it checks that the palette holds such a color, not where
it is painted, so look at the dark frame too.

To see a change to the palette across the collection, run the contact sheet
(`npx vitest run -c scripts/checks/diff.vitest.config.mts contact-sheet`): every
game in both schemes on one page, with the close pairs listed beside it. Its
`repaint` paints a recorded frame through any palette, which is how to mock up
a restyle without touching a game.
