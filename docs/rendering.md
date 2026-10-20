# Rendering

How a game paints: what the engine paints for it, the per-tile cache and its
diff key, overlays, drag previews and blitters, animation and the win flash,
sizing, and the color palette. It rests on the specs
[`engine-drawing`](../openspec/specs/engine-drawing/spec.md) (the
`GameDrawing` contract, the repaint and animation requirements),
`engine-colors`, `ts-engine` (the win flash) and
[`testing`](../openspec/specs/testing/spec.md) (in-process render
verification). Gesture semantics are [`input.md`](./input.md), what a hint
step draws is [`hints.md`](./hints.md), and the render test harness is
[`testing.md`](./testing.md). A full game's renderer to read end to end is
[`galaxies/render.ts`](../src/games/galaxies/render.ts).

## What every game does

The skeleton's [`render.ts`](../src/skeleton/grid/render.ts) does steps 1 to
8; a copy changes what a square holds and keeps the shape.

1. Name the palette slots as `COL_*` indices, slot 0 the board, and fill
   them in `colors(defaultBackground)` from the meanings in
   `engine/color/palette.ts`. See § "The palette: three layers, meaning
   first".
2. Write `computeSize(params, tileSize)` with the border it uses, and export
   the preferred tile size. See § "Sizing".
3. In `newDrawState`, return `started`, `tileSize`, an `Int32Array` cache
   filled with -1, an `OverlaySidecar` for the hint and a `HintMarks`. See
   § "The tile cache and the diff key" and § "Overlay sidecars".
4. In `redraw`, on the first frame, draw only what is the game's own (the
   grid's frame). The ground is already laid. See § "The first frame and a
   fresh draw state".
5. Read the displayed step's marks with `stepMarks(hint)`, put them in the
   sidecar, and call `eraseBeforeTiles` before the tile loop. See
   `hints-marks.md` § "Where the band goes, and who rubs it out".
6. For each tile, work out what it should show, the mistake flag, the cursor
   and `flash.win(sweepStep(x, y))` included, and pack it into a key. Skip
   the tile when the cache holds that key and the sidecar is not stale;
   otherwise paint it, record the key and `commit` the sidecar. See § "The
   win flash".
7. In `drawTile`, paint inside the tile's own box, with the shapes of
   `engine/draw.ts` and `engine/piece.ts`, and end with `drawUpdate`. See
   § "A warm frame must match a fresh one" and § "What a board looks like:
   pieces on a quiet surface".
8. Paint the hint marks after the tile loop, outside any clip.
9. In the game's own test, paint the mistake overlay and assert what it
   drew. Its repaint is `warm-repaint.test.ts`'s. See § "Prove the overlay
   repaints".

## Sections

| Section | Read it when |
| --- | --- |
| The first frame and a fresh draw state | you write a first-frame branch, a ground that is not color 0, or anything that would invalidate a cache |
| The tile cache and the diff key | your game has per-cell state, or a cell's key holds a digit and a candidate mask |
| – Overlay sidecars | a mistake, hint or highlight is handed to the cell painter beside the tile value |
| – A cue with no tile to live in | a cue sits in a margin or a panel with a cache of its own, or you change how a cached cue is drawn |
| – When the packed key runs out of bits | a new flag does not fit the tile word |
| – A warm frame must match a fresh one | `warm-repaint.test.ts` names your game, or its hint paints a mark the seeded run never shows |
| – A mark that crosses tiles | a mark, bar or arrow covers more than one tile |
| – Prove the overlay repaints | your game shows a mistake overlay, or repaints its whole frame with no cache |
| – A mark band with `outer: 0` lies inside the tile's clip | a tile's drawn outline is not the rect it clips to, or hint marks pile up as the hint walks |
| Drag previews and blitters | your game has a drag, a held piece or a keyboard cursor |
| – A simulated-release preview lives in `moves.ts` | `redraw` shows what releasing the drag would do |
| – `changedState` cancels a dangling drag | a key can change the board while a drag or an armed key gesture holds a piece |
| – A pointer-following overlay must erase everything it painted | something is painted after the tile loop at pointer or cursor position |
| – A transient affordance needs an authored color | a cursor or drag preview is tinted from the background |
| – A cursor is usually a cache key, not a blitter | upstream saves the pixels under a cursor, or the cursor selects part of a cell |
| A press preview must not look like a commit | a press shows a preview before the release decides |
| When two games share a mechanic, they share its look too | a second game draws a mechanic an engine module already owns |
| – The note-taking cell's picture | your game has notes mode, or a selected cell or region |
| – A shape another game also draws | you write vertex arithmetic for a frame, a bevel, an outline or brackets |
| Bespoke board geometry, draw side | the board is sheared or not a plain grid |
| A rule that input and display both need | `redraw` works out what a click or a move would do |
| Special paint shapes | the game has a clue margin or region-inset cells, or its C stores display state |
| – A clue-ring erase must not wipe the grid | clues sit in a margin around the grid and repaint one at a time |
| – Negative-space grids | the grid lines are what the cell fills leave uncovered |
| – Display state in a narrow type | the C keeps a frame counter or a mask in a `bool` or a `char` |
| Animation and flash | a move animates, or `redraw` reads `animTime` |
| – The win flash | always: every game says where its elements are |
| – A flash that is not a win | the game flashes for a death, a loss or a dead end, or reacts to being solved |
| Sizing | you write `computeSize` or `newDrawState`, or are tempted to guard on the tile size |
| The palette: three layers, meaning first | you assign any slot in `colors()` |
| – What a board looks like: pieces on a quiet surface | you choose how a cell, a state, a given, a wall or a ruled-out mark looks |
| – A relative color is a named function | a color is a shade of the background or of another color |
| – Black pieces stay black | a piece, or a word in the help or a hint, is black, white, shaded or lit |
| – Assign the color, never a copy | you spread or rebuild a named color |
| – Declare the scheme beside the palette | the game draws a bevel from `mkhighlight`, or its board is not color 0 |
| – Every board is one tone | you assign the background slot |
| – Highlights from a fixed base | a beveled tile is not the board's color |
| – A cue that equals the background is a bug | a cue is white or near the board's tone |
| – Completed regions share one color | a finished region is filled |
| – Dark mode is the app's concern | a color looks wrong in the dark scheme |
| – When a palette guard names your game | a color test fails, or you restyle the palette |

## The first frame and a fresh draw state

**The engine lays the ground; the game paints everything above it.** On the
first redraw of a fresh draw state the midend fills the whole canvas
(`computeSize` at the current tile size) in color 0 before `game.redraw`
runs, and on every other redraw it paints nothing. The requirement is
`engine-drawing` § "The midend repaints on every transition, rebuilds the
draw state for a new tile size, and lays the ground under a fresh one".

- A first-frame branch draws only what is the game's own (grid frame,
  border, fixed artwork) and never repeats the color-0 fill.
- A game whose ground is another color paints that fill itself on its first
  frame, over the midend's (exemplars: Rect, Untangle).
- A game that repaints its whole board every frame keeps its own fill,
  because it is erasing the last frame (exemplars: Cube, Loopy).
- A fresh draw state is the only cache-stale signal. The midend builds one
  when the tile size changes, when the canvas backing store is recreated
  (`canvasCleared()`) and when the palette or font is replaced
  (`forceRedraw`). `Midend.size` touches nothing at an unchanged tile size.
  A game invalidates nothing for any of these.
- The midend repaints on every transition and drives the animation and
  flash timer. A game never schedules its own frames.
- Full or incremental redraw is the game's own policy. Use the tile cache
  for any game with per-cell state: a full repaint per frame is visibly slow
  on a large board, and the cache is what makes overlays correct.

`src/engine/first-frame-coverage.test.ts` rasterizes every game's first
frame and holds it to full coverage.

## The tile cache and the diff key

The draw state holds one packed word per tile of what the canvas shows. Each
frame works out what the tile should show, repaints only on a mismatch, and
records what it painted. The skeleton's `redraw` is the shape.

- **Every word of the key is an `Int32Array` element, never a
  `BigInt64Array` one.** `BigInt` is expensive on the hot path. A key that
  needs more than one word's bits grows by a second `Int32Array` beside the
  first, an overlay sidecar or a parallel array, and the two are compared
  together (§ "When the packed key runs out of bits").
  Exemplars: [`galaxies/render.ts`](../src/games/galaxies/render.ts),
  [`range/render.ts`](../src/games/range/render.ts).
- **When the candidate set alone exceeds about 26 bits, keep two parallel
  cache arrays** and compare them together, not a digit and a pencil bitmap
  in one word. A `1 << n` mark for `n` up to 31 still fits an `Int32`, sign
  bit and all. Candidate masks go through `engine/candidate-bits.ts`, which
  throws where a shift would wrap. Exemplar:
  [`solo/render.ts`](../src/games/solo/render.ts) (`SoloDrawState.tiles`,
  `.pencil`, `.wrong`); Keen packs both in one word because its order leaves
  room.

### Overlay sidecars

**Every overlay that is not in the tile value must be in the diff test, or it
silently fails to repaint.** A mistake, hint or highlight overlay is applied
on top of a cell, and Check & Save or a hint runs a frame after the move
that drew the cell, so an overlay compared nowhere never shows.

**Never hand-write the two-array comparison.** `OverlaySidecar`
([`engine/overlay-sidecar.ts`](../src/engine/overlay-sidecar.ts)) owns
repack, stale and commit for any overlay. Give each overlay its own instance
on the draw state. Each frame: pack it once, use `ds.<overlay>.stale(i)` as a
clause of the cache-miss test, hand `ds.<overlay>.packed[i]` to the cell
painter, and call `ds.<overlay>.commit(i)` after drawing.

| You have | Call | Exemplar |
| --- | --- | --- |
| A hint step's marks (ringed cells and notes, outlined and striped cells) | `pack(stepMarks(step), indexFn, markBitsFn)`, with no `markBitsFn` in a game without notes | [`towers/render.ts`](../src/games/towers/render.ts), [`starbattle/render.ts`](../src/games/starbattle/render.ts) |
| A `findMistakes` cell list | `packCells(mistakes, indexFn)` | `towers/render.ts` `ds.wrong` |
| An overlay with its own topology | `clear()` then `add(i, bits)` | [`galaxies/render.ts`](../src/games/galaxies/render.ts) `ds.wrongEdges`: a wrong wall is a shared edge, so it lights a different bit in each of its two tiles |

`pack` also keys each evidence cell on its outline sides, so a cell that
stays evidence while the shape around it changes still repaints
(`hints-marks.md` § "Where the band goes, and who rubs it out").

A game that folds the overlay bit into the packed tile value, as the
skeleton does with its mistake flag, cannot leave it out of the diff test.

### A cue with no tile to live in

**Prefer a bit in the per-tile key over a scalar cache on the draw state.**
A second cache is a second key to forget an input from, and the failure is
silent.

- A second cache is right only when the cue has no tile: a panel below the
  board, a margin outside the grid. Then name every input the painter reads
  in its key.
- The pencil-mode indicator is the shared case. The engine picks its
  position (`pencilIndicatorBox`), a game with the mode keeps
  `ds.pencilModeShown` beside its tile cache and repaints through
  `repaintPencilIndicator`
  ([`engine/pencil-indicator.ts`](../src/engine/pencil-indicator.ts)).
- **When a cue stops being drawn as something the key already reads, give it
  its own term in the key.** Turning a cue from a color class into a box, and
  passing it to the painter as a separate predicate, drops it from a key that
  was the color class. Exemplar:
  [`crossing/render.ts`](../src/games/crossing/render.ts) (`panelState`).
- A key's comment is a claim about coverage. When a class leaves the key,
  remove its label in the same edit.
- **Test it on a reused draw state.** A test that builds a draw state per
  frame meets a cold cache and cannot see a missing key term. A render
  snapshot cannot see it either: `RecordingDrawing` keeps `drawUpdate` out
  of `ops`, so assert on its `updates` channel, as `pencil-indicator.ts`'s
  own test does.

### When the packed key runs out of bits

**One `Int32Array` word has 31 usable bits, bit 31 being the sign, and
nothing warns when they are gone.**

1. Look first for a flag that is written and never read: one that appears
   exactly twice, its definition and one `val |=`, is dead. A flag for the
   state the painter takes as its `else` is the usual one.
2. With no dead flag, give the key a second word: an `OverlaySidecar` or a
   parallel `Int32Array`, compared with the first in the cache-miss test.
   Do not narrow an existing field to free a bit, and do not change the
   array's type to `BigInt64Array`. The key is a repaint cache and not a
   wire format, so nothing outside the renderer constrains how many words
   it has. Say what each word holds in a comment, because a field that
   overflows fails silently.

Exemplars: [`slide/render.ts`](../src/games/slide/render.ts) (a full word),
[`map/render.ts`](../src/games/map/render.ts) (a second word per cell).

### A warm frame must match a fresh one

**A frame drawn on a warm draw state must look like a fresh paint of the
same state.** `src/engine/warm-repaint.test.ts` holds every registered game
to it, by driving a real `Midend` through seeded input and comparing each
frame with its fresh twin (`engine/testing/repaint-differential.ts`). Run it
with `npx vitest run src/engine/warm-repaint.test.ts -t <game>`.

When it names a game, the cause is one of these, and each is a rule:

- **Every input the painter reads is a term of the key.** A `Ui` field or a
  mode read in the painter and named by no key term leaves the past on
  screen. Give it a bit and make the painter read that bit.
- **No field is wider than its lane.** A shift counts mod 32, so a value past
  bit 31 lands on another field. Candidate masks go through
  `engine/candidate-bits.ts`, which throws.
- **A tile paints only its own box.** Paint to `ts - 1` and let the neighbor
  fill from its own edge.
- **Tiles that share pixels repaint together.** A shared border row, or a
  mark band laid over the border, belongs to both tiles, and a fresh paint
  settles it in loop order. Repaint the neighbor too, or erase before the
  tile loop (`HintMarks.eraseBeforeTiles`) and let every tile the band
  touches repaint on top.
- **Every square a mark crosses carries the mark in its key, and every pixel
  the mark lands on belongs to one of those squares.** Each tile clips to
  what it owns, and a tile on the board's edge owns the ground beside it
  that the mark reaches. Exemplar:
  [`bricks/render.ts`](../src/games/bricks/render.ts).
- **A tile that repaints over a decoration forgets what the decoration
  showed.** A decoration inside a tile's box that repaints only on its own
  change (the pencil indicator in a clue ring's corner) is otherwise filled
  over.
- **Erase a cue on everything that retires it**, not only on the event that
  usually does.

**Read the report before the code.** It names the frame, the event before
it, the first differing pixel, what each canvas shows there and which frame
painted the warm one. Suspect the instrument too: it is an estimate for text
and thick lines.

**A hinted game must have painted every mark its renderer asks for.** The
test requires each `role|kind` the renderer reads through
`StepMarks.of(role, kind)`, in a role the legend (`hintMarks`) lists, to
have been painted, and every role in the legend to be asked for.

- A mark the seeded run never shows needs a board that does. Name it in the
  test's `PINNED` as the board itself (`params:desc`), never as a seed. Find
  one by walking deals across the presets until the plan paints the pair.
- A pin must paint something the seeded run does not; one the run has caught
  up with fails and is removed.
- A mark no board reaches goes in `UNREACHED` with its reason.
- A mark that is not a hint mark is outside that requirement. Pin its board
  and event seed in the game's own test (exemplar: `bricks.test.ts`, "takes
  an edge diamond away whole, ground included").

**A game that finds mistakes must have painted its mistake overlay on a warm
frame.** The run's check puts the overlay on a board already painted, and
the next event takes it off, which are the two frames a key without the
overlay gets wrong. Where the seeded run never checks a wrong board, name
one in the test's `WRONG`: the board and the moves that make it wrong, since
no desc holds a player's mistake. Find the moves by playing seeded input on
the run's own deal until `findMistakes` flags the board, then drop each move
the mistake does not need. A pin the seeded run has caught up with fails
and is removed.

### A mark that crosses tiles

**A mark that crosses tiles goes into each tile's key, by piece or by
identity.** The choice is the game's, and there is no engine helper for
either.

- **By piece.** The tile's key says which piece of the mark it draws: a
  side, a direction, half a bar. The piece is the game's own geometry.
  Region outlines are the shared case (`MarkOutlines.packed`,
  `engine/hint-mark.ts`). Exemplars: Bridges' spans, Pearl's edges, Net's
  sides, Bricks' rule flags.
- **By identity.** The tile's key names the marks crossing it, and the tile
  draws each one whole while clipped to its box. It suits a mark whose shape
  is not a grid's, such as an arrow over three squares, at the cost of a key
  that lists marks. Exemplar: [`pegs/render.ts`](../src/games/pegs/render.ts).

### Prove the overlay repaints

**A cold-frame test proves nothing about an overlay.** On frame 1 every cell
misses the cache, so an overlay missing from the diff test still paints.

- **The hint overlay is guarded for every game with a hint** by
  [`hint-overlay.test.ts`](../src/engine/hint-overlay.test.ts). A game owes
  it nothing.
- **The mistake overlay is guarded for every game that finds mistakes** by
  the same test, which requires a warm mistaken frame and compares it, and
  the frame that takes the overlay off, with a fresh paint (§ "A warm frame
  must match a fresh one"). A game owes it at most a `WRONG` pin, whether
  the flag rides a sidecar or the tile key.
- **What the game's own test owes is the look.**
  `src/mistake-overlay-coverage.test.ts` requires a test that paints the
  overlay and asserts what it drew; a `renderScenario` `showMistakes` frame
  does. A test that also paints twice, as `towers.test.ts` ("highlights a
  mistake even when the cell was already drawn") does, proves the repaint
  again in the game's own words, and nothing requires it.
- **The bug needs an overlay handed to the painter beside the key.** A
  sidecar or a hand-packed side channel is where the stale clause has to be
  (`openspec/postmortems/2026-09-09-tile-loop-inversion-withdrawal.md`). A
  flag folded into the tile key cannot be left out of the diff test; what
  goes wrong there is a painter that reads the mistake from anywhere else,
  and the comparison catches that too.

**A game that repaints its whole frame needs none of this.** With no tile
cache it adds no sidecar and erases nothing: `redraw` reads the displayed
step and draws its marks every frame. What it owes is the z-order. A mark
goes under the content it points at, so the content stays legible, and
labels go last, so nothing covers them. Exemplar:
[`loopy/render.ts`](../src/games/loopy/render.ts).

### A mark band with `outer: 0` lies inside the tile's clip

**Take a hint band's box from the rect the painter clips to, not from the
outline it draws, and check the two against each other.** `HintMarks` with
`MarkBand.outer` 0 keeps no history: the cell's own repaint, which the hint
`OverlaySidecar` triggers, erases the band. That holds only for pixels the
cell may paint. A game that traces its cell outline a pixel outside its clip
rect leaves the band's outer row in nobody's tile.

The symptom: marks accumulate as the hint walks, and a reload clears them.
No recorded single frame shows it, so run the app. Exemplar:
[`mathrax/render.ts`](../src/games/mathrax/render.ts).

## Drag previews and blitters

What a game with a drag, a held piece or a keyboard cursor owes on the draw
side. The gestures themselves are [`input.md`](./input.md).

### A simulated-release preview lives in `moves.ts`

**A game whose `redraw` previews a drag by simulating the release keeps move
application in a module of its own.** `render.ts` needs `executeMove` and
the release-move helper, and if those live in `index.ts` the two files
import each other. Put them in a small `moves.ts` both import. Exemplar:
[`signpost/moves.ts`](../src/games/signpost/moves.ts).

**Reach for this before a table of cases.** Where a release does one of
several things, ask the release's own function for its move, execute it, and
draw only the gesture's own cells from the result. `render.ts` then holds no
second statement of what a drag does, and cells packed into the tile key
repaint and restore themselves. Read no more than those cells from the
executed board: it carries the release's consequences elsewhere, and showing
them recolors pieces the finger is not on. Exemplar:
[`bridges/moves.ts`](../src/games/bridges/moves.ts) (`dragReleaseOps`).

### `changedState` cancels a dangling drag

**Where a key can move the board under a drag held in fields of the game's
own, cancel the drag in `changedState`, and make the preview fall back to
the plain board when the simulated move is refused.** An undo from the Bar
or the keyboard, a hint and Solve are the engine's: it ends the gesture and
puts the `Ui` back ([`input.md`](./input.md) § "A board change under a
gesture is the engine's"). A bare `UI_UPDATE` never reaches `changedState`,
so the live gesture is unharmed.

- **Tell:** a `redraw` that calls the game's own move helper on `ui` state
  and cannot handle "no".
- **A keyboard arm is the same bug with a longer window.** A gesture armed by
  Enter and fired by a later arrow sits armed across any number of presses.
  Ask "can a state change make what I am holding false?", not "is this a
  drag?". It is safe when what is remembered is fixed geometry, or when the
  fire derives it again (`changedState`'s doc in
  [`engine/game.ts`](../src/engine/game.ts)).

Exemplars: [`slide/index.ts`](../src/games/slide/index.ts) and
[`pegs/index.ts`](../src/games/pegs/index.ts) (`changedState`), with the
repro in `pegs-midend.test.ts`.

### A pointer-following overlay must erase everything it painted

**An overlay drawn outside the per-tile cache owns its own cleanup, in
full.** Before drawing anything at pointer or cursor position after the tile
loop, ask what erases it, tile by tile, off-board pixels included: the
border repaints only on the first frame.

- **The default is to snap the preview into cells**, so the cache's own
  repaint is the eraser ([`input.md`](./input.md) § "The aim drag").
- **A mark on a vertex or an edge needs no blitter.** It straddles up to four
  tiles: give each tile a bit per subcell position of its own 3×3 block and
  let each paint its clipped share, as for dots on tile corners.
- **Sweep the file for the whole class**: grep for paint outside the cell
  loop, not only the overlay you came to fix. A low-contrast affordance is
  an unreviewed one, so look hardest there.

Exemplar: [`galaxies/render.ts`](../src/games/galaxies/render.ts) (the
`overlay` sidecar holds the drag preview, the cursor position and the drag's
candidate rings in one word).

### A transient affordance needs an authored color

**A color derived from the board cannot be prominent against the board, in
either scheme.** A tint computed from the background is pale in the light
scheme, and dark mode adapts it by calculation into another faint tint.

Take a meaning from [`color/palette.ts`](../src/engine/color/palette.ts):
`CURSOR` for the keyboard cursor, `DRAG_ADD` for "let go and this is laid".
Those are authored for each scheme. Keep board-relative derivation for
fills, grids and shades that are meant to sit close to the board.

### A cursor is usually a cache key, not a blitter

**Fold a cursor that sits inside a cell, or a slot of one, into that cell's
packed key, and draw it in the cell repaint.** The old cell repaints when
the cursor leaves, with no save and restore, and the recording double sees
real ops. Keep a blitter for a sprite that crosses cell boundaries mid-drag
(Pegs' and Signpost's drag sprites). Exemplar:
[`subsets/render.ts`](../src/games/subsets/render.ts) (a cursor-slot field
of the cell key).

- **The exception is a cell repaint that does not clear the whole cell.**
  Folding the cursor into the key erases it only because the repaint paints
  over where it was. Check what the repaint clears; where the cursor lands
  outside it, the blitter is right, and its draw ops are still recorded,
  since the double no-ops only `blitterSave` and `blitterLoad`. Exemplar:
  [`spokes/render.ts`](../src/games/spokes/render.ts) (module header).
- **Draw the cursor inside the thing it selects, not merely in the right
  cell.** Ask what the selection is before asking where its mark goes: a
  selection that is a region is outlined as a region (§ "The note-taking
  cell's picture"), and a point is marked at a point inside its own part of
  a divided cell.
- **When a selection starts being acted on, ask again whether it is
  legible.**

## A press preview must not look like a commit

**Make a transient press preview distinct from a committed state, or
suppress it on the gesture that usually will not commit.** A preview drawn
like the committed state reads as a glitch when the release does not commit.
Exemplar: [`mines/render.ts`](../src/games/mines/render.ts), whose pressed
preview shows only where the release will chord.

## When two games share a mechanic, they share its look too

**A renderer is shared when what it draws is a shared mechanic, not when it
merely resembles another renderer.** The second is true of almost any grid
game. Exemplar:
[`engine/border-grid-render.ts`](../src/engine/border-grid-render.ts), which
Palisade and Separate both draw through. It owns the mechanic's look (the
error model, the half-grid cursor, the edge rects keyed off the border bits,
the tile skeleton), takes each game's palette indices and a `drawContent`
callback for the clue layer, and never asks which game it is drawing.

- **Use a callback when order is the point.** Content goes under the edges,
  and the clip, unclip and `drawUpdate` wrap all of it. Exporting separate
  steps puts that bookkeeping back in both games.
- **The diff key is part of the shared contract.** Unifying a bit layout is
  free only because the flags are draw state, rebuilt by `newDrawState` and
  never in a desc or a save. Check that first, and reserve the game's own
  bits above a named floor.
- **The proof is a byte-clean snapshot, not a green suite.** A pure
  extraction leaves every draw call, argument and order identical. If a
  snapshot needs `-u`, pixels moved and the extraction is wrong.

### The note-taking cell's picture

**Paint a cell's background through `drawCellBackground`**
([`engine/note-taking-cell.ts`](../src/engine/note-taking-cell.ts)), handing
it the rect the game paints. The selected cell then looks the same in every
note-taking game, whether the mouse or the keyboard put it there: the whole
cell washed when typing enters a value, a triangle in its top-left corner
when typing enters a note.

- **Pack `cellHighlight(ui, x, y)`, three bits, into the tile key**, or the
  old cell never repaints when the highlight leaves.
- A game that hides the highlight for its own reasons passes
  `HIGHLIGHT_NONE` and still makes the call. A cell the win flash is on
  passes `winHighlight(tone) ?? cellHighlight(ui, x, y)` and the two flash
  slots.
- The triangle is background: it is drawn with the rect, before any content,
  so a clue or a note in the same corner sits on top.
- The triangle's legs are half of the rect the game hands over, not half a
  tile.
- The color is `highlightWash(background)`, at an index the game names. It
  is not a choice a game makes.

**What differs stays in the game, and says more than the picture can.** A
square with no background to wash keeps a mark of its own (Crossing's wall
takes corner brackets), and a state the picture cannot show adds to it
(Rome's armed cursor adds a `?`). Both are in those games' specs.

**A region takes the picture in its own shape.** Where the fill is the
answer, a wash would read as a different fill, so draw a band in `CURSOR`
just inside the region's whole boundary in both modes, and in notes mode the
corner triangle in the region's first cell. Exemplar: `drawBands` in
[`map/render.ts`](../src/games/map/render.ts).

### A shape another game also draws

**A single shape any other game also draws belongs in
[`engine/draw.ts`](../src/engine/draw.ts)**: the recessed frame
(`drawRecessedBorder`), the raised tile (`drawRaisedTile`,
`raisedBevelWidth`), the rect outlines (`drawRectOutline`,
`drawThickRectOutline`), the corner brackets (`drawRectCorners`), the move
arrow (`drawMoveArrow`). A primitive takes a rect and colors and draws; it
needs no callback and no shared cache key.

- **Pass `drawRaisedTile` the pixels the tile covers.** For a tile inside a
  grid line that is `{ x: tx + 1, y: ty + 1, w: ts - 1, h: ts - 1 }`. It
  draws the face too.
- Take a bevel's thickness from `raisedBevelWidth`, so one idiom is one
  width at one tile size in every game.

When promoting a shape:

- Check whether the dimensions drifted across the copies too. Put the
  extraction (no pixels move) and the sizing fix (pixels move) in two
  commits.
- If every caller follows the helper with the same next call, the helper
  stopped one call short.
- Break the helper deliberately and see what goes red before trusting an
  unchanged snapshot.
- The copies may disagree on something invisible in the frame, such as
  vertex order in a polygon. A snapshot records it, so move those games in
  the commit where a moved recording is expected.

## Bespoke board geometry, draw side

A game that stores an odd-shaped board in a padded rectangle and shears it
on draw keeps the state half (the bounds mask, the neighbor table, the
inverse pointer transform) by [`mechanics.md`](./mechanics.md) § "Bespoke
geometry". On the draw side:

- **Force the tile size even** (`ts & ~1`) in both `computeSize` and
  `newDrawState`, so half-tile shears are exact.
- The shear, origin and bevel choices are display: match the look and keep
  the code clean.
- **Check a shear with an SVG dump.** `toSvg` a `renderScenario` frame and
  rasterize it ([`testing.md`](./testing.md)). A wrong offset shows as a
  staircase.

Exemplar: [`bricks/render.ts`](../src/games/bricks/render.ts) and
[`bricks/index.ts`](../src/games/bricks/index.ts) (shared `offsets`).

## A rule that input and display both need

**Render asks; move code decides.** Any rule the input and the display both
need is one function, called by both. Coordinates are only the obvious case.
Two copies agree until the rule gains a tie-break.

**Tell:** a predicate in `redraw` that answers what a move would do.
Exemplar: [`crossing/state.ts`](../src/games/crossing/state.ts)
(`runForNumber`).

## Special paint shapes

Three shapes a port meets on the drawing path.

### A clue-ring erase must not wipe the grid

**Do not fold a clue margin's four per-side erase rects into one uniform
rect.** A game with a margin of clues repaints one clue tile at a time, and
on one edge the grid's outermost border line lands on the clue tile's first
pixel, so a symmetric erase wipes it. The asymmetry is load-bearing.

Pin the invariant, "no clue-tile erase overlaps the grid's outline box", and
not the pixel offset. Exemplar: `salad-render.test.ts` ("does not let a
border clue's erase wipe the grid's outline").

### Negative-space grids

**Where the grid lines are negative space, do not add the lines you cannot
find.** The first frame floods the canvas with the border color, and every
square paints its own background rect, inset by one pixel everywhere and
further on each side that meets a different region. What the fills leave is
the grid; stroking the boundaries draws it twice.

Assert the inset in a render test: a square whose neighbor shares its region
against one whose neighbor does not, expecting a wider rect. Exemplar:
[`rome/render.ts`](../src/games/rome/render.ts) and `rome-render.test.ts`
("insets a square's fill on each side that meets a different region").

### Display state in a narrow type

**A display-only value stored in too narrow a type is a bug to fix, not to
port.** On the drawing path a visual improvement is the point of the fork.

- **Tell:** a frame counter, phase index or animation step stored in a
  `bool` or a `char`; any bitmask copied into a narrower local before use.
- A snapshot alone does not show that an animation is moving.
- When the input that exposes it is one the generator never produces, build
  the board by hand through the game's own codec for the regression test.
  That also proves the input is reachable in play.

Exemplar: [`seismic/render.ts`](../src/games/seismic/render.ts) and
`seismic.test.ts` ("draws every pencil mark, including a 9").

## Animation and flash

**`animLength(a, b, dir, ui)` returns a duration, the midend runs the timer,
and the game interpolates in `redraw` from `animTime`.** A transition with
no animation paints once. Animation frames, the first included, are driven
by the timer (`engine-drawing` § "The midend repaints on every transition,
rebuilds the draw state for a new tile size, and lays the ground under a
fresh one").

**Only a change of position ends an animation.** An input that changes the
`Ui` alone (`UI_UPDATE`, a hover, a release that tidies the `Ui`) leaves a
move's animation and any flash running (`engine-drawing` § "A change of the
Ui alone leaves an animation running"). So `redraw` can be handed an
`animTime` partway through with a `Ui` that has moved on: paint the `Ui` as
it is.

### The win flash

**The win flash is the engine's, and a game only says where its elements
are** (`ts-engine` § "The win flash is one traveling highlight in every
game"). Its timing, its length and what reduced motion shows are
[`engine/win-wave.ts`](../src/engine/win-wave.ts)'s and the midend's, and a
game has no hook for any of them.

In the loop where `redraw` builds an element's flags, ask
`flash.win(position)` and paint the element lit when the answer is not
`WIN_NONE`, as the skeleton's `redraw` does. The position is the element's
place along the route, in steps (`ts-engine` § "A game gives each element a
position, and the route is which position it gives"):

| The board holds | Position | Exemplar |
| --- | --- | --- |
| a path | the element's step from the start | Tracks (`trackOrder`), Ascent, Signpost |
| a loop | `loopSteps` of its elements in route order | Loopy (`loopOrder`), Pearl |
| a network fed from a source | breadth-first distance from the source | Net, Netslide, Flood |
| none of these | `sweepStep(x, y)` of its center: a diagonal, bottom left to top right | Solo |
| none of these, and no grid | `sweepRanks(centers)`: the same diagonal by rank, so scattered elements leave no dark stretch | Untangle's points, Map's regions |

Four rules a game can break without a type error:

- **Ask for every element that can light, on every frame, and for no
  other.** The engine learns the route's two ends from the positions asked
  about in the frame before. A square off the path is never passed in, and
  the asking happens before the tile cache's comparison, not inside a branch
  the cache can skip.
- **Ask once per element per frame.** A redraw that paints in two passes
  asks before them and reads the answer in both.
- **The tone, not a lit bit, goes in the tile's diff key.**
- **Work the route out only while `flash.winning`.** A loop walk or a
  breadth-first search on every ordinary frame is waste.

**Paint a lit element in the tone's color and change nothing else about
it** (`engine-colors` § "A solved flash drawn as a color takes a shared
color"). `flash.win` answers `WIN_LEAD` or `WIN_BODY`: give `FLASH_LEAD`
and `FLASH` a palette slot each and pick with `winSlot(tone, body, lead)`.
An element with a ground has the ground filled and keeps what it holds on
top; a line is drawn in the color, and a thin one wider than at rest.

**A game writes nothing for when the flash plays** (`ts-engine` § "The win
flash plays on a forward move that solves the board"). The midend starts it
when the winning move's own animation ends, so a game that slides or spins a
tile writes no guard, and it is the midend that withholds it after the Solve
command.

`src/engine/win-flash.test.ts` paints every solvable game's solved board
through a flash. Pin the route in the game's own test: `winFlashRun` paints
the flash and `expectWinFlashTravels` asserts it lit every element once, in
the order of the positions handed over (`engine/testing/win-flash.ts`;
exemplar `tracks-flash.test.ts`).

### A flash that is not a win

**`flashLength(a, b, dir, ui)` is for a flash of the game's own**: a death
(Inertia, Mines), a board with no move left (Same Game), a loss (Flood).

- Return 0 for a win. The midend asks on every transition, and a nonzero
  answer replaces the win flash.
- Read it in `redraw` as `flash.time`, seconds in. `flash.time` is 0 through
  a win and `flash.winning` is false through a flash of the game's own, so a
  redraw needs no `Ui` field to tell which it is drawing.
- **A game that reacts to becoming solved in another way, such as hiding its
  cursor, does it in `changedState` on the transition into solved**, never
  as a side effect of drawing the flash.

## Sizing

**`computeSize(params, tileSize)` is the pure size function, and
`newDrawState(state, tileSize)` builds the draw state at the chosen size.**
Derive any tile-size geometry (radii, gaps, offsets) in `newDrawState`, so
`interpretMove`'s coordinate mapping and `redraw` agree. `preferredTileSize`
is the baseline, 32 by default.

- **A draw state lives at one tile size, so a game writes no resize
  invalidation** (`engine-drawing` § "A draw state is at one tile size for
  its whole life"). No
  `if (ds.tileSize !== ts)` guard, no cache wipe, no dropping a wrongly
  sized blitter: for a blitter allocated lazily in `redraw`, `if (!ds.bl)`
  is the whole check.
- **`redraw` and `interpretMove` are handed a draw state that is non-null
  and at the size on screen** (`engine-drawing` § "A game is handed a draw
  state, never the absence of one"). No `if (!ds) return;` and no
  `ds?.tileSize ?? PREFERRED_TILE_SIZE` ([`mechanics.md`](./mechanics.md)
  § "interpretMove and UI_UPDATE").
- **The draw state's field is `tileSize`**, also for a board that is not
  tiled, whose scale is the number `newDrawState` is handed.
  `src/capability-surface.test.ts` records the field names, and another
  spelling shows there as a line.
- **A game with notes mode keeps its border no narrower than
  `pencilIndicatorReach`**, or grows its canvas with `pencilIndicatorCanvas`
  where its own corner is taken
  ([`engine/pencil-indicator.ts`](../src/engine/pencil-indicator.ts)).
- A border constant that looks surprisingly small is upstream's
  `NARROW_BORDERS` variant. Leave it.

## The palette: three layers, meaning first

**A game contains no color value. Not one** (`engine-colors` § "A game
contains no color value"). Every color a game shows is a reference into the
collection's color system, or a call to a shared function from it. The
skeleton's `colors` is the shape: `out[COL_ERROR] = ERROR`. Three layers,
and which one you reach for is the decision:

- [`engine/color/palette.ts`](../src/engine/color/palette.ts) holds **the
  meanings**, and is the default: `ERROR`, `HINT_RING`, `HINT_OUTLINE`,
  `CURSOR`, `HELD`, `DRAG_ADD`, `FLASH`, `RULED_OUT`, `SHADED`,
  `REGION_DONE`, `INK`, `PAPER` and the rest of its exports, with the
  functions of the background (`cellSurface`, `surfaceGrid`, `givenSurface`,
  `wallFill`, `highlightWash`, `pencilColor`, `clueDoneColor`).
- [`engine/color/colors.ts`](../src/engine/color/colors.ts) holds **the
  palette itself**: the named colors, most at three intensities (base,
  `_WASH`, `_BOLD`), and the sets made to be told apart (`TEN`, `TEN_NAMES`,
  `REGION_FILLS`, `FOUR_FILLS`).
- [`engine/color/palette-games.ts`](../src/engine/color/palette-games.ts)
  holds colors a game defines **relative to its own board**, prefixed with
  its id (`slantGrounded`, `undeadGhost`). Functions, not values.

A token has no `COL_` prefix, which here means a palette index, so a game's
index constants and the tokens never collide. Nothing outside a game
addresses its palette by number, so the order of its `COL_*` constants is
its own.

- **The cursor** is `CURSOR` when it is a mark (a ring, outline, line or
  disc) and `highlightWash` when it fills a cell under the cell's content.
  On a board that has spent green, the second choice is `PURPLE` (the doc on
  `CURSOR` says why).
- **"This clue is done"** is `clueDoneColor` for retired text and
  `REGION_DONE` for a completed fill.
- **Reach past a meaning to a named color only where the name is
  load-bearing to the player**: a member of a set whose job is to be told
  apart (`TEN`), or a color the game says out loud (`TEN_NAMES`, read off
  `TEN` so word and color cannot drift). A name is a `ColorWord`
  (`engine/color/color-word.ts`), a word for each scheme, since a dark
  value can leave its light word (Map's dark yellow is a brown). A sentence
  takes it as a `phrase` part and is shown in the scheme in force. A text
  shown alike in every scheme, a help page, a control's `does` or a mark's
  own words, takes `.only`, which refuses a color with two words.
  `colors.test.ts` holds every word to its color in both schemes.
- **A game whose board has spent the default may pick a different named
  color, and says why on the assignment's line or the line above**
  (`engine-colors` § "A departure from a shared role is stated at the
  assignment").
  [`palette-departures.test.ts`](../src/engine/color/palette-departures.test.ts)
  fails a bare departure in a slot named for a cursor, a held or dragged
  item, a hint or a mistake. Exemplar:
  [`spokes/render.ts`](../src/games/spokes/render.ts) (`PURPLE` cursor).
- **Pick the replacement against everything it lands on, in both schemes.**
  A cursor sits on every material the board has, and the lightness ladder
  flips in the dark scheme, so an argument from where a color sits in one
  scheme's ordering fails in the other. Where no lightness clears both ends,
  choose by chroma and hue: a strong color against a neutral reads at equal
  lightness, and it should be opposite in hue to the materials, not adjacent.
  Exemplar: [`slide/render.ts`](../src/games/slide/render.ts).
- **If nothing in the palette fits**, record a function in
  `palette-games.ts` under the game's prefix, with why no meaning and no
  named color serves. Aim to add none.

### What a board looks like: pieces on a quiet surface

**Take the look of a board of pieces from the engine, by reference.** These
hold for every game they fit. The requirements are `engine-colors`', from
"The engine owns what a board of pieces looks like" on, and each bullet
names the one it applies.

- **The board recedes and the content carries the color.** A cell is
  `cellSurface`, the line between cells is `surfaceGrid`, thin, and the
  frame around the grid is no heavier than it.
- **A region the puzzle gives may take a fill in place of `cellSurface`**
  ("The palette holds one set of fills for regions"). The fill is one of
  `REGION_FILLS`, the region palette: eight faint fills of which a board
  takes the first four, six or eight, and `regionFills`
  ([`engine/region-fill.ts`](../src/engine/region-fill.ts)) says which
  region takes which, so that regions sharing a side differ. It says only
  "these cells are one region": the heavy border still tells two regions
  apart, and everything else is drawn over the fill as it is over the plain
  surface. A mistake's wash and the win flash take its place. Exemplar:
  [`starbattle/render.ts`](../src/games/starbattle/render.ts), on the first
  four.
  - **A region's color is one value a scheme in every game** (the owner,
    2026-10-15: consistency first), so a yellow region in Map and in Star
    Battle is one yellow in both schemes.
  - **Where the fill is the player's answer**, the game takes `FOUR_FILLS`,
    the first four as themselves in the order its numbers name them, and
    `FOUR_NAMES` for the words. Only the first four stand off a region with
    no color, so such a game has four. A dot or a swatch of the color drawn
    on a surface that is not the color takes `FOUR_FILL_MARKS`, stronger in
    the dark scheme, where a dot of the fill's own value does not show.
    Exemplar: Map, its pencil stipples.
  - **A color that names a group rather than a region**, as Signpost's
    chains do, is the palette's eight in turn and repeats past the eighth;
    the group's own label tells two of one color apart. Two fills are never
    mixed for a ninth: a mix of two fills this faint is a gray near the
    others.
  - **A game with numbers, notes or `REGION_DONE` in its regions is put to
    the owner with a drawing first.** Measured on the palette, not yet in
    the app: a pencil note and a player's entry read weaker on a dark fill
    than on a plain cell, and `REGION_DONE` is close to the light violet.
- **A state is a piece, drawn with `drawPiece`**
  ([`engine/piece.ts`](../src/engine/piece.ts); "A piece is drawn inset on
  its cell"). State is never a step of gray alone.
- **Two states where neither is the important one are `TWO`, and the game
  names no hue** ("A game that uses the pair names no hue or shape of its
  own"). It takes `TWO[i]`, `TWO_SHAPES[i]` and, for its hint words and
  verbs, `TWO_NAMES[i]`, and its help page writes `{{pair:0}}` and
  `{{pair:1}}` ([`help-pages.md`](./help-pages.md)). Exemplars:
  [`unruly/render.ts`](../src/games/unruly/render.ts),
  [`unruly/hint-text.ts`](../src/games/unruly/hint-text.ts).
- **Shaded or not is the `SHADED` piece alone** ("Shaded or not is the
  pair's first member alone"): a cell ruled out is quiet surface with a
  cross, and an undecided one is plain surface. The words are `SHADED_NAME`
  and `UNSHADED_NAME`, never "black" and "white". A game whose two states
  are both the player's making (Flip's lit and unlit) takes `TWO`.
- **Ruled out is a cross in every game**: a cell, slot or square the player
  has said holds nothing takes `drawRuledOutCross`, never a mark of the
  game's own. Where the puzzle has its own mark for a kept cell (Singles'
  ring around its number), that is the mark.
- **Where the work is coloring the whole board one way or the other, a clear
  square is `drawClearSquare`** ("A board colored half and half gives its
  clear squares a surface"). A retired number on it takes `CLEAR_MARK`, not
  `clueDoneColor`, and a contradicted number is a badge. A game that draws
  the bare cross (`git grep -l drawRuledOutCross -- src/games`) and might
  fit is put to the owner with a drawing, not changed.
- **Content beyond two states is `MOVED`, `GOAL` or, for the figure the
  player steers, `CURSOR`'s green** ("The pair's hues carry what a player
  moves, seeks and finishes"). One kind of placed thing is `SHADED`. A drawn
  line takes none of them, since beside the hint's line of the same width it
  is a pair a color-blind player cannot tell; nor does text. A hue that is
  the puzzle's own meaning stays (Map, Flood, Undead).
- **A given is told by the cell under it** (`givenSurface`), not by a mark
  on the piece.
- **The two surfaces mean one thing everywhere.** The plain cell is "still
  yours to work" and the lifted one is "settled": a given, a locked tile, a
  hub that has what it needs, a closed region, a square still covered. A
  game that needs a second cell tone takes the lifted surface for the
  settled side and says which reading it is at the assignment.
- **A selected cell is `highlightWash` and a finished region is
  `REGION_DONE`**, so neither is taken for a given. A finished region is
  never a step of gray.
- **A wall is one flat strong fill** (`wallFill`), not a bevel and not a
  game's own black. A digit on it is the pinned `WHITE`.
- **A glyph that sits on a piece is a badge**: its own disc, with the glyph
  in the fill's text color (`ERROR` under `ERROR_TEXT`).
- **A bevel is kept only where the tile is an object the player moves**
  (Fifteen, Sixteen, Twiddle, Slide).

### A relative color is a named function

**A color defined relative to something is a named function in
`palette-games.ts`**, never `bg[0] * 0.9` written out in the game. The game
is handed a light background in both schemes, and the app adapts the
returned palette itself. So a color that must stay legible against the board
is a function of the background, and an absolute color is a named one.

`scale(c, 1 / 1.5)` is not `c / 1.5`: the ratio is not representable. Use
`divide(c, 1.5)` ([`color-token.ts`](../src/engine/color/color-token.ts)).

### Black pieces stay black

**A color that means "this piece is black" or "white" is `BLACK` or `WHITE`
from `colors.ts`, not `INK` or `PAPER`.** They look the same in the light
scheme. `INK`, `PAPER` and a bevel's highlight invert in the dark scheme; a
piece's color is its identity and is pinned.

- **A color your words name is a piece's color.** If the help page, a hint
  or a parameter label calls something black, white, shaded or lit, paint it
  in a pinned color. Where the thing really is ink, fix the word.
- A digit on a pinned cell is pinned with it, and a grid between
  pinned-white cells is `GRID_DARK`.
- [`help-lightness-words.test.ts`](../src/help-lightness-words.test.ts)
  holds the help page to this. It checks that the palette holds such a
  color, not where it is painted, so look at the dark frame too.

### Assign the color, never a copy

**Assign the token itself.** A named color carries its dark value as an own
property of the array, so `[...BLACK]` is the right color with its scheme
decision removed, and no test catches that in general.

### Declare the scheme beside the palette

**What a palette needs from the color schemes beyond its tokens is
`Game.paletteScheme`, written with the game's own `COL_*` constants.** Most
games declare nothing. It names slots and never a color: a color that is
wrong in the dark scheme is fixed by authoring the dark value on its token.

- `darkSwaps`: the pairs dark mode exchanges. A bevel drawn from
  `mkhighlight` lists its `[COL_HIGHLIGHT, COL_LOWLIGHT]` to stay lit from
  one side. A highlight used as a cursor or a selection is not a bevel and
  stays out. A bevel built with `mkhighlightSpecific` from a base that
  authors its dark value needs no swap.
- `board`: the color the board is painted in, when it is not color 0. The
  page around the canvas takes it. Exemplar: Untangle.
- **A bevel's color that is also a tint or a fill takes two slots holding
  the one color, and only the bevel's is swapped.** A swap changes the dark
  value of every use of the slot, and a tint wants the opposite of what a
  bevel wants. Exemplar: `COL_ARROW` in
  [`sixteen/render.ts`](../src/games/sixteen/render.ts).

Exemplar: [`slide/render.ts`](../src/games/slide/render.ts).

### Every board is one tone

**Assign `out[COL_BACKGROUND] = defaultBackground`.** The background
`colors()` receives is already the board: `resolvePalette`
([`color-mkhighlight.ts`](../src/engine/color/color-mkhighlight.ts)) has
shifted it off pure white and pure black. Call `mkhighlight` only for the
bevel trio; it derives the same background again.
`src/puzzle/board-background.test.ts` holds every registered game to one
board.

### Highlights from a fixed base

**A highlight and lowlight from a color that is not the host background
come from `mkhighlightSpecific(base)`, not `mkhighlight(bg)`**
([`color-mkhighlight.ts`](../src/engine/color/color-mkhighlight.ts)). It
extrapolates a near-extreme base toward the opposite extreme; `mkhighlight`
never does. Exemplar: Slide's blocks.

### A cue that equals the background is a bug

**A cue that has to be seen is a clear step away from the board, in both
schemes, and a determined state does not look like an undecided one.** A
highlight upstream draws as pure white may be invisible here. Take the
surfaces of § "What a board looks like: pieces on a quiet surface". When a
game's own color nearly equals its background, fix it.

Pair the cue with a `GamePref` when it is a solving aid and not game state.
Exemplars: [`spokes/render.ts`](../src/games/spokes/render.ts)
(`COL_SATISFIED`, under the `mark-satisfied` pref of its `index.ts`),
[`bridges/render.ts`](../src/games/bridges/render.ts) (`auto-mark-complete`
likewise).

### Completed regions share one color

**Fill a completed and correct region with `REGION_DONE`**
([`palette.ts`](../src/engine/color/palette.ts)), never an invented hue.
Compute validity per wall-bounded component, put an `F_CORRECT` bit in the
packed cache key so it paints and clears as regions complete and break, and
rank it below flash and hint fills. Exemplars:
[`separate/render.ts`](../src/games/separate/render.ts),
[`palisade/render.ts`](../src/games/palisade/render.ts).

### Dark mode is the app's concern

**Do not make a color derivation luminance-aware in the game.** `colors()`
never sees a dark background; the app adapts the returned palette, taking a
token's authored dark value first, calculation otherwise, and the game's
`paletteScheme` on top. A luminance test in a game is dead code.

When a derived dark value is wrong, author the dark value on the shared role
with `token(light, dark)`; do not patch the game. Exemplar: `lineMaybeColor`
in [`palette.ts`](../src/engine/color/palette.ts), used by
[`loopy/render.ts`](../src/games/loopy/render.ts).

### When a palette guard names your game

Each guard reads every game without being told about it.

- [`palette-source.test.ts`](../src/engine/color/palette-source.test.ts)
  fails on a color literal, on indexing the background's channels, on
  importing the color combinators and on importing another game's token. A
  three-number array that is not a color goes in its `NOT_COLORS` with a
  reason.
- [`neighbor-contrast.test.ts`](../src/puzzle/neighbor-contrast.test.ts)
  fails when two things painted side by side stand too close in the dark
  scheme. Look at the game in the dark scheme before deciding: a pair close
  on purpose goes in its ledger with what it is, and any other gets an
  authored dark value on the shared role. It reads the deal and one frame
  some hint steps in, so a color only input brings out is not covered.
- [`bevels.test.ts`](../src/puzzle/bevels.test.ts) fails when a bevel's
  lighter color is not the lighter one in both schemes, which is a forgotten
  `darkSwaps` pair, and when a game draws the shared bevel shape itself. It
  finds bevels by the shape `drawRaisedTile`, `drawRaisedBevel` and
  `drawRecessedBorder` emit, so draw through them where the shape allows.
- `colors.test.ts` and `palette.test.ts` hold the palette's own sets and
  meanings; a game meets them only by changing `colors.ts` or `palette.ts`.

**To see a palette change across the collection, run the contact sheet**:
`npx vitest run -c scripts/checks/diff.vitest.config.mts contact-sheet`.
It shows every game in both schemes on one page, with the close pairs
listed. Its `repaint` paints a recorded frame through any palette, which is
how to mock up a restyle without touching a game.
