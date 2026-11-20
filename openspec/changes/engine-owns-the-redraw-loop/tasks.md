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
- [ ] 2.2 The skeletons' `render.ts` write the engine's form.

## 3. Finish

- [ ] 3.1 `docs/rendering.md` describes the one way. Run
      `npm run test:hint-sweeps`; commit, push, archive.
