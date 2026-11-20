## 1. The helper

- [ ] 1.1 Re-run the census; sort the `textFormat`s by shape (cell grid,
      grid with edges, grid with clue rows or columns, not a grid). Record
      the counts with their query.
- [ ] 1.2 Write the helper for the shapes several games share, with its own
      tests.

## 2. Migrate

- [ ] 2.1 Move each grid-shaped game onto it. Its output stays
      byte-identical: check by the game's own text tests and by diffing
      `formatAsText` over its presets before and after, not by a green suite.
- [ ] 2.2 The skeletons and any guide that shows the shell write the helper.

## 3. Finish

- [ ] 3.1 Commit, push, archive.
