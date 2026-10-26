# Tasks

## 1. The primitive

- [x] 1.1 `GameDrawing.drawRing(box, clear, thickness, { room, inside })` in `engine/game.ts`, `puzzle/drawing.ts`, `engine/testing/recording-drawing.ts` and `engine/testing/svg-drawing.ts`, the shape from `engine/ring.ts`'s `ringShape`; unit tests on an empty cell (a circle), corner notes (a rounded square at the border), growth into room, a domino (a pill), and the throw
- [x] 1.2 `resolvePalette` appends the ring ink before the stripes ink; `drawRing` reads it from there, and `hintInkIndices` finds it by color
- [x] 1.3 Census of game slots holding the ring's color: `DRAG_ADD` is `BLUE`, which is `HINT_RING`, and Mines, Rome and Spokes hold `BLUE` for meanings of their own, so a palette check by color cannot tell the ring from them (D2 as revised: the name `HINT_RING` is refused in game sources, `palette-source.test.ts`, and `hint-ink.test.ts` takes only the engine's slot for the ring)

## 2. The owner's choice of cell ring

- [x] 2.1 Render the inscribed circle, the circumscribed circle and the rounded square in a notes grid, Cube, a domino and an edge, and put them to the owner
- [x] 2.2 Record the answer in the design (D5)
- [x] 2.3 Measure the padding route in the app (9×9 Keen: notes ~40% smaller); owner chose the strike role and the over-notes placement ring (D6, D7)
- [x] 2.4 `ringShape` may draw in and shift off the box's center to step round a corner clue, nearest the box first; unit tests with Keen's clue cell, and the clue-and-digit cell it cannot ring
- [x] 2.5 The strike role: `MARK_ROLES`, its reference color, the legend, and the five sources that rang a NOTE (`candidate-plan.ts`, `hint-text.ts`, `overlay-sidecar.ts`, crossing, undead); a struck note no longer rings its cell, and a strike step's premise ring on that cell is drawn by its strikes
- [x] 2.6 `HintMarkStyle.text` names notes apart: crossable on the ringed cell, avoided round it; Keen's layout is upstream's

## 3. The engine painters

- [x] 3.1 `HintMarks.paint` rings targets through `drawRing`, with one pill for a straight joined piece and a ring per square otherwise, within the band's reach
- [x] 3.2 `engine/edge-hint.ts`: an asked side is a pill (`EdgeShapes.ring`), and the game's line or cross is its `inside`
- [x] 3.3 `engine/border-grid-render.ts`: the same for wall and not-wall asks, clear of the glyph in each square
- [x] 3.4 `engine/testing/mark-shape.ts`: `expectRing`, `ringsOf`, `expectPieceRing` and `outsideRings` read ring ops
- [x] 3.5 Engine tests: `hint-mark.test.ts` sweeps every hinting game for round rings and nothing else in the ring's ink; `edge-hint`, `border-grid-render`, `overlay-sidecar`, `midend`, `render-scenario`, `palette` tests updated

## 4. The games

- [x] 4.0 Keen, Tracks, both skeletons
- [x] 4.1 The candidate `HintMarks` games: abcd, group, mathrax, rome, salad (its entry inside the ring, `HintMarkStyle.inside`), seismic, solo, towers, unequal
- [x] 4.2 The other `HintMarks` games: clusters, crossing, dominosa, filling, magnets, samegame, starbattle, tents, undead
- [x] 4.3 Edges and lines: palisade, separate, path, pearl, loopy (its pair-note signs laid out off edge lines and off each other), bridges, spokes, slant
- [x] 4.4 Band rings on cells: bricks, flip, lightup, mines, pattern, range, singles, unruly
- [x] 4.5 Custom shapes: ascent, blackbox, boats, cube, galaxies, mosaic, sticks, rect
- [x] 4.6 Tiles and moves: fifteen, sixteen, netslide, net, twiddle (a ring on the block's pivot with the turn's arrow inside), slide, inertia, flood ("the ringed squares")
- [x] 4.7 The rest: guess, map, numgame, pegs, sokoban, subsets (its rule-out cell striped, the region the sentence names), untangle, signpost
- [x] 4.8 `palette-source.test.ts` "no game holds the ring's ink" passes: the worklist is empty
- [x] 4.9 `BoxRaster` paints rings and nests clips as the canvas does, so the repaint differential sees a stale ring (seen to fail with the ring case disabled)

## 5. Verify and document

- [x] 5.1 Every game's hint screenshot read; Keen, Tracks and Cube run in the app, and Keen in the dark scheme
- [x] 5.2 `docs/hints-marks.md`, `docs/hints.md`, `docs/engine-catalog.md`, `docs/testing.md`, `docs/rendering.md`; `engine/hint-mark.ts` header; help pages of Ascent, Flood, Sixteen and the six candidate games whose chains strike
- [x] 5.3 The gate, green (2026-10-26)

## 6. The owner's review (2026-10-26)

- [x] 6.1 A struck note is an X the engine draws (`drawStrike`), one size a board, inside its cell; Rome and Undead take one diagonal; the strike legends drop "a line through"
- [x] 6.2 Untangle: the line's ends come from the move, so hiding one reference leaves the other's end; the spot is "a better spot", or "a new spot" where the move does not cut the point's crossings, and three sentences are shortened to fit
- [x] 6.3 A reference's marks are measured with the canvas's specks cleared (`withoutSpecks`), and every measured frame is a full repaint (D8)
- [x] 6.4 A pressed pill stays readable while hovered: the flash outranks the colored hover
- [x] 6.5 The owner accepted on sight; the gate, green with the archive
