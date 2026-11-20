## 1. The helper

- [x] 1.1 Re-run the census; sort the `textFormat`s by shape (cell grid,
      grid with edges, grid with clue rows or columns, not a grid). Record
      the counts with their query.

      2026-11-20, `git grep -n -E "^(export )?function textFormat|^  textFormat\(" -- src`
      less tests: 53 (50 games, the edge-clue Latin engine, two skeletons).
      Cells in rows 24; cells joined by edges 7; boxed cells 10; a grid in a
      clue frame 7; not a walk over the grid's places 5 (Bricks, Dominosa,
      Flip, Loopy, Subsets, each saying why at its `textFormat`).
- [x] 1.2 Write the helper for the shapes several games share, with its own
      tests. `src/engine/grid-text.ts`: `gridText` (cells, `across`,
      `between`, `ends`, `finalNewline`) and `boxedGridText` over it.

## 2. Migrate

- [x] 2.1 Move each grid-shaped game onto it. Its output stays
      byte-identical: check by the game's own text tests and by diffing
      `formatAsText` over its presets before and after, not by a green suite.

      The diff: every registered game with a `textFormat`, each gate-slice
      board's start, every hint step's board (up to 60) and its solved
      board, 5,830 texts. 5,779 identical; the 51 that differ are all Tents,
      whose last line now ends as upstream's does (`+` and three spaces, then
      a newline, `tents.c` `game_text_format`) where the port had left five
      spaces and no newline. Tents also writes a three-digit clue, as upstream
      does, which the port had dropped.
- [x] 2.2 The skeletons and any guide that shows the shell write the helper.

## 3. Finish

- [x] 3.1 Commit, push, archive.
