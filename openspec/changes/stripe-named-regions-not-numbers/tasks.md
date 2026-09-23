# stripe-named-regions-not-numbers — tasks

## 1. Lines named by number

- [x] 1.1 Boats: "this row" / "this column" over its striped line, in every
      sentence that numbered one; a refutation's broken line is "the striped
      row", since it need not be the square's own.
- [x] 1.2 Sixteen: "the outlined square", or "the nearer outlined square, then
      the other" when two landings are previewed. The test that guarded "name
      the line the move lands on" now checks the outlined target is exactly
      where the move puts the tile.
- [x] 1.3 Netslide: "the dashed square", or "the outlined square, where it
      belongs", by the mark `drawHintTargets` draws; "This column never slides",
      striped.
- [x] 1.4 A guard in `hint-quality.test.ts`'s narration walk: no sentence names
      a row or column by number. Seen to fail with Boats' numbering planted.

## 2. Regions as subject

- [x] 2.1 Keen cages; Solo blocks.
- [x] 2.2 Filling, Palisade, Galaxies: the region a sentence is about.
- [x] 2.3 Rome, Seismic: areas and groups. Seismic's outline-shape repaint
      test is retired: an area is no longer outlined, so no cell is outlined
      twice in different shapes, and the hatch lane is in the sidecar's key.
- [x] 2.4 Crossing, Range: runs. Crossing's `crossRuns` hatches both runs it
      names; Range's `reach` hatches the run to the target and keeps the
      clue's other seen arms outlined as particular cells.
- [x] 2.5 Tracks: the closed block.
- [x] 2.6 The cross-game guard counts regions as well as lines (it reads the
      `hatch` list and a game's own `line` together), and requires region
      games among those it saw. Seen to fail on Tracks' block before the
      reading summed both.

## 3. Close out

- [x] 3.1 `docs/games/hints.md`: the rule is about the line or region a
      sentence names.
- [ ] 3.2 Spec delta; Chrome on a sample in light and dark; archive.
