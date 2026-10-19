# keep-a-repainted-mark-off-the-content-under-it

**Status: filed 2026-10-19 by `give-map-colors-clear-of-the-hint-pools`.**
The engine's: the app's repaint of a hint's marks, in every game.

## Why

While a hint shows, the app repaints each reference's marks in a color of
its own (`HINT_REFERENCE_COLORS`, `colors.ts`; `showHintColors` in
`puzzle/components/view.ts`). The repaint covers every pixel the reference's
marks changed, whatever the game drew there, so it overrides the decisions
`docs/hints-marks.md` § "When the game has already spent the hint hue"
describes:

- **Samegame** (seen 2026-10-19, light scheme, 5x5 3 colors): its marks
  carry a black keyline so they show on pieces of every hue
  (`COL_HINT_KEY`). The repaint turns the keyline the outline's green too,
  and an outlined green group reads as a larger green group.
- **Crossing, Galaxies, Slide, Sticks, Spokes, Subsets** moved their hint, or
  their cursor, off a hue the game had spent; the repaint puts the hint back
  in the reference colors' blues, greens and warms. Not yet looked at in the
  app.

The colors themselves meet the bars a mark is held to on the cell surface
and on every region fill (`give-map-colors-clear-of-the-hint-pools`). What is
not measured is a repainted mark against a game's own content.

## What changes

- A repainted mark stays readable on what it is drawn over, in every game and
  both schemes: an edge, such as the keyline Samegame chose, for the repaint
  itself, or another shape the measurement favors. One way for every game,
  and no game choosing reference colors of its own.
- A guard over each game's hint frames, measured against the colors the game
  draws under its marks, its population derived from the games.
- `docs/hints-marks.md` § "When the game has already spent the hint hue"
  restated for the repaint.

## What has to be settled

- Measure first: which games' repainted marks fall under a mark's bars on
  their own content, from their frames, before choosing the edge.
- An edge on every mark changes how every hint looks: the owner's call, with
  screenshots.
