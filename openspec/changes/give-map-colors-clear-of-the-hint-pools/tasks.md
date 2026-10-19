# Tasks

- [x] 1.1 Measure every game's content colors against every pool shade in
      both schemes (2026-10-19). Every game's palette has an entry within
      0.1 of a shade, most of them the hint's own meanings the pools stand
      in for (`HINT_ACTION` is 0.048 from `#1c7ed6`), so "every color in
      `colors()`" is no population for a guard. Map's region fills are 0.186
      or more from every shade, the region palette 0.120 or more. What does
      fail is the pools against the palette's bars: the proposal's § "Why".
- [x] 1.2 Which shades a game's hints draw (2026-10-19, hint-guided play over
      every game's gate presets): Map one ring and up to three outlines a
      step, Star Battle one of each role, so neither shows violet, cyan or
      pink. Magnets drew four outlines in one step, so its fourth takes the
      first's color again.
- [x] 1.3 A reference's marks inside another's are painted over them
      (`view.ts`): on a Map chain step, "Region 1"'s color had no pixel on the
      board, and has 1,104 after.
- [x] 1.4 The owner's choice of the light-scheme shades (2026-10-19:
      "Proposed", from a comparison of today's and the proposed on the cell
      surface and Map's four fills, both schemes).
- [x] 1.5 The pools as `HINT_REFERENCE_COLORS` in `colors.ts`, a value per
      scheme, resolved for the scheme the board is drawn in
      (`Puzzle.hintReferenceColorsIn`: overlay, pills, leader line), and
      repainted when the scheme changes under a hint.
- [x] 1.6 The guards take them (`palette.test.ts`): the pair's hue rule, the
      bars on the cell surface and every region fill, stripes visible, any
      two apart; seen failing on today's violet (2.71:1 on the dark surface,
      20° from the pair's purple). The dead-color guard counts the app's
      overlay as a consumer.
- [x] 1.7 Run the app (2026-10-19): Map's chain step light and dark, Star
      Battle light and dark (ring, outline and stripes), every pill matching
      its marks. In the light scheme Map's three outline greens read alike;
      raised with the owner (§ 1.8).
- [ ] 1.8 The owner's word on the three light outline greens: no three
      greens at the light board's lightness separate well (three searches,
      by lightness, by hue and over all nine), and the vivid lime that stood
      apart was the one that vanished on a pale fill.
- [x] 1.9 Filed: a repainted mark on a game's own content
      (`keep-a-repainted-mark-off-the-content-under-it`), seen in Samegame,
      whose keyline the repaint turns green.
