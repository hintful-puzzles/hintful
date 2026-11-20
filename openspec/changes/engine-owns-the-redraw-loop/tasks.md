## 1. Design on a hard game

- [x] 1.1 Re-run the census. Sort the 60-odd `redraw`s by shape: cell
      tiles, edge or vertex tiles, layered tiles, not tiles at all. Record
      each with its query.

      Census of 2026-11-20 (re-check before relying on it). Queries:
      `grep -nE "function redraw" src/games/*/render.ts src/engine/edge-clue-latin/render.ts`
      (63 own redraws; adjacent and unequal re-export edge-clue-latin's;
      palisade and separate share `border-grid-render.ts`), and per file
      `grep -c` of `fill(-1)`, `.stale(`, `.commit(`, `HintMarks`, `animTime`.
      - **Cell tiles, one cache** (about 37): abcd's cells, clusters, dominosa,
        filling, flip, flood, galaxies, inertia, keen, lightup, mathrax, mines,
        mosaic, norinori, palisade, path, pearl, pegs, range, rect, rome,
        samegame, seismic, separate, signpost, singles, slide, sokoban, solo,
        starbattle, sticks, unruly, wordguess, wordtrail, edge-clue-latin.
        Several need a key of more than one word (galaxies, path, wordtrail,
        rect, solo, edge-clue-latin).
      - **More than one family of tiles** (about 17): clue margins (abcd, boats,
        magnets, pattern, salad, tents, tracks, group's legend), blackbox's
        lasers, bridges' edges, guess's rows, panels (crossing, subsets,
        undead). One cache per family.
      - **Tiles that paint into their neighbors, or move** (9): ascent, bricks,
        fifteen, net, netslide, sixteen, spokes, towers, twiddle; map and
        boats in part. They use `forget` and `overlayMoved`.
      - **Not tiles** (keep the explicit form): cube, loopy, untangle (full
        repaint each frame), numgame's elements, ballsort's pour.
      - **String or object keys**: pegs, sokoban, ballsort, guess, and the
        ring caches of map and rect. Each is settled when its game moves.

      Design (decided 2026-11-20): the engine owns the per-tile body, not the
      walk. `TileCache` (`src/engine/tile-cache.ts`) holds the keys (one or
      more words a tile), the first frame, and the overlays registered when
      the draw state is built; `changed(i, key…)` is the miss test and the
      record in one call, so no frame can test the key and forget an overlay.
      The walk stays the game's, because the census shows it differs in
      every way that matters: border rings, several families, Towers' clip
      over four neighbors. The palette's shared roles (background, flash,
      flash lead, hint outline, error, cursor) are fixed slots filled by
      `rolePalette` (`src/engine/color/roles.ts`); a game numbers its own from
      `FIRST_GAME_SLOT`, and `winSlot`, `highlightFill` and
      `drawCellBackground` default to the role slots. Snapshots record colors,
      not indices, so the renumbering leaves them unchanged: that is the check
      on each game's palette edit.
- [x] 1.2 Write the loop and the palette roles. Pilot on a game that
      pressures the design (several layers, text, animation, hint marks),
      not the simplest one. Pilot: Towers (four-word key over a clip that
      paints four tiles, two overlays, notes, hint marks, flash). Planting
      "ignore the overlays" in `TileCache.changed` failed
      `warm-repaint.test.ts` and Towers' withdrawn-mistake test.
- [x] 1.3 Measure the pilot's frame time against HEAD, back to back under
      load; run it in the app (mouse, touch, keyboard, win flash, hint).
      Towers 9×9 with a no-op canvas, HEAD worktree and pilot alternated
      four times: still frames 9–12 µs on HEAD against 12 µs, changing frames
      17–18 µs against 19–22 µs. A rest-argument `changed` cost more and was
      replaced by fixed parameters. The 2–3 µs left is the method call per
      clip, and one tile's canvas paint costs more than that, so it stands.
      In Chrome: 3D towers, notes and the notes corner, the pencil indicator,
      hint rings, outlines and stripes through an auto-solve, Check & Save's
      red clues and outline, the traveling win flash in both tones, and mouse,
      keyboard and touch entry.

## 2. Migrate

- [ ] 2.1 Move the games in batches by shape; each runs in the app before it
      counts. Record in this file which are moved and which keep the
      explicit form, and why.

      Per game: `colors()` from `rolePalette`, own slots from
      `FIRST_GAME_SLOT` (a region-fill run stays last), the role slots
      dropped from `winSlot`/`highlightFill`/`drawCellBackground`, tests
      import the roles from `color/roles.ts`; the draw state's
      `started`/cache become a `TileCache` with the sidecars registered. A
      slot named for a role but holding another color (Seismic's
      `COL_CURSOR` is a wash) keeps a slot of its own, renamed for what it is.
      Check: typecheck, the game's tests, `src/engine/color`, warm-repaint,
      hint-overlay, first-frame-coverage, win-flash, hint-ink; no render
      snapshot moves. `src/capability-surface.test.ts` records each draw
      state's fields, so it moves with every game: update it with
      `--update` and check the diff is only `cache`/`started` → `tiles`. In the app: a move, a hint, auto-solve to the win flash.

      Moved: towers, clusters, norinori, starbattle, seismic, keen,
      samegame, sticks, lightup, singles, range, flood, mines, wordguess,
      solo, mathrax, rome, flip, unruly, filling, mosaic, dominosa, pearl.
      A game whose board
      values are palette indices (SameGame's and Flood's tile colors) numbers
      them from a run after its own slots (`COL_PIECE + c - 1`,
      `COL_TILE + c`); a whole-board repaint (SameGame's margin) is
      `forgetAll`. Seismic's, Mathrax's and Rome's `COL_CURSOR` was the
      note-taking wash and is `COL_HIGHLIGHT_WASH`; Flood's mark on a tile
      stays black and Mines' cursor pink, each its own slot with its reason
      on the assignment (`palette-departures.test.ts` reads it there). A
      cursor repainted by "did it move" (Mines' `curX`/`curY`) goes into the
      key instead. Mines' `colors()` moved from `index.ts` beside its slots.
      Two slots holding the error color (Dominosa's clash and mistake,
      Pearl's live error and mistake) are both `COL_ERROR`. Filling's
      `COL_ERROR` was the region wash, and its mistake outline borrowed it:
      the wash is `COL_ERROR_WASH`, and the outline is red like every other
      game's. A second key word replaces a side lane (Dominosa's mark sides,
      Pearl's hint word). `src/puzzle/neighbor-contrast.test.ts` keys its
      close-on-purpose pairs by palette index, so a renumbered game's entry
      moves with it (Pearl's did; Galaxies', Guess's and Undead's will).
      Next: edge-clue-latin (adjacent, unequal), which is one family of cell
      tiles after all (its clues ride in each cell's flag word): a three-word
      key of number, flash and cursor; flags; pencil. Then the multi-family games, then
      the neighbor-painting ones. Not tiles, keeping the explicit form:
      cube, loopy, untangle (palette roles only).
- [ ] 2.2 The skeletons' `render.ts` write the engine's form. Grid done;
      code and edges to go.

## 3. Finish

- [ ] 3.1 `docs/rendering.md` describes the one way. Run
      `npm run test:hint-sweeps`; commit, push, archive.
