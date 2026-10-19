# Tasks

- [x] 1.1 Measure every game's repainted marks against the colors under them
      in its hint frames, both schemes; record the games under the bars.
      (2026-10-19: each hinting game's first gate preset, two seeds, up to 40
      steps, painted to palette indices with and without each reference, its
      repaint color against the filled areas beside its marks. Rings and
      outlines only: the index painter skips a hatch. Repainted in one
      color, Samegame, Flood, Cube, Boats, Dominosa, Palisade, Separate,
      Slide, Sticks, Mosaic, Inertia, Galaxies, Magnets, Net and Tracks fell
      to 1.0-1.6:1 on content of their own, and most dark boards to 2.2-2.4
      on a raised cell. With an edge in black or white, whichever is farther
      from the mark, the least on any game was 2.29 light, 2.40 dark; black
      alone left light at 1.78, white alone dark at 1.56.)
- [ ] 1.2 Choose the repaint's edge with the owner, from screenshots.
- [x] 1.3 The edge, in the repaint, for every game: `edgeFor` and `edged` in
      `puzzle/mark-flash.ts`, one CSS pixel round a ring or an outline. A
      stripe takes it inside its band, half as wide: an edge beside a band
      covered the glyphs the game draws over the stripes, and at the full
      width a band in the dark scheme kept only a thread of its color.
- [x] 1.4 The guard. Measured on each game's frames it would sample what an
      edge already bounds for every color: a mark and an edge of contrast C
      read at least √C on any content, whatever a game draws. So the guard
      is that floor, swept over every luminance for every reference color in
      both schemes (`mark-flash.test.ts`, above 2.1; the hint's own blue in
      light is the least, 2.14), with `edged`'s geometry unit-tested beside
      it. Seen failing with an edge always black (ring 2, light, 1.52) and
      with no edge (ring 0, light, 1.00).
- [x] 1.5 `docs/hints-marks.md` § "When the game has already spent the hint
      hue" restated.
- [x] 1.6 Run the app: Samegame, Crossing and Galaxies, a hint on each, light
      and dark (and Flood and Magnets), at device pixel ratio 2.
