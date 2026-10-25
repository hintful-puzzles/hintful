# Tasks

## 1. The primitive

- [ ] 1.1 `GameDrawing.drawRing(box, thickness, inside?)` in `engine/game.ts`, `puzzle/drawing.ts` and `engine/testing/recording-drawing.ts`; a circle for a square box and a pill otherwise, with `inside` clipped to the interior
- [ ] 1.2 `resolvePalette` appends the ring ink before the stripes ink; `drawRing` and `hintInkIndices` read it from there; a game slot holding the ring's color throws, and that guard is seen to fail with a planted slot
- [ ] 1.3 Census: every game slot whose color equals `HINT_RING` for a meaning other than the ring, with what each becomes

## 2. The owner's choice of cell ring

- [ ] 2.1 Render A, B and C (design, "Open question") in Solo with notes, Cube and Tracks, in both schemes, and put them to the owner
- [ ] 2.2 Record the answer in the design, and fit `drawRing`'s square case to it

## 3. The engine painters

- [ ] 3.1 `HintMarks.paint` rings targets through `drawRing`, with one pill for a straight joined piece and a ring per square otherwise; `eraseBeforeTiles` erases evidence only
- [ ] 3.2 `engine/edge-hint.ts`: an edge is a pill, and the game's line or cross is its `inside`
- [ ] 3.3 `engine/border-grid-render.ts`: the same for wall and not-wall asks
- [ ] 3.4 `engine/testing/mark-shape.ts`: `expectRing` and `expectPieceRing` assert a ring op, not four rects

## 4. The games

- [ ] 4.1 Every `HintMarks` game and `skeleton/grid`: drop `COL_HINT`, and verify each diff by shape
- [ ] 4.2 The `drawMarkSides` and `drawThickRectOutline` rings (bricks, flip, lightup, mines, pattern, range, rect, singles, slant, slide, unruly, numgame, blackbox, subsets, guess, twiddle, net, netslide, sixteen, signpost)
- [ ] 4.3 The recolored shapes, each a ring with the old shape as `inside`: tracks, path, pearl, palisade, separate, loopy, bridges, spokes, boats, sticks, tents, inertia, ascent, cube, fifteen, galaxies, flood, map, dominosa barrier, undead strike, salad ghost
- [ ] 4.4 The round ones moved onto the primitive: pegs, sokoban, untangle
- [ ] 4.5 `hint-ink.test.ts` and the render snapshots: rebaseline, and read the diffs by shape

## 5. Verify and document

- [ ] 5.1 Run the app for each kind of element (cell, note, piece, edge, span, dot, tile) in both schemes, with a hint moving between cells in a game with an `outer` band
- [ ] 5.2 `docs/hints-marks.md`: "Shade vs ring", "A mark on something that is not a cell", "A piece is ringed as one shape" and "The engine colors the marks"; `engine/hint-mark.ts` header
- [ ] 5.3 The gate, green

## Workflow follow-up

- The owner accepts on sight (asked for by name). Then commit, push and archive.
