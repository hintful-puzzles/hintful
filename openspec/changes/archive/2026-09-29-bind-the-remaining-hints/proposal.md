# bind-the-remaining-hints

**Status: done (2026-09-29).** The sweep `bind-hint-words-to-marks` ends
by scaffolding. That change's `design.md` and the "Bind the words to the marks"
section of `docs/games/hints.md` are the how; read both first.

## Why

The pilot bound fourteen games: Palisade, Separate, Signpost and the eleven on
the candidate walk. Every other hinted game still writes its sentence beside
its marks, where the Boats defect ("the striped row" over rings) can recur.
Take the population as the hinted games without `hintMarks`, not as the list
below: `HINT_GAMES.filter(([, g]) => !g.hintMarks)` in a scratch test. The
batches below were read off each game's imports on 2026-09-29; re-read them
before starting, because a game may have moved machinery since.

## Batches, by the machinery they share

Each batch is one commit. A shared helper is bound once, and its games follow.

1. **Firing ladders on `hint-plan.ts`**: Clusters, Filling, Light Up, Pattern,
   Range, Singles, Slant, Subsets, Unruly. Filling, Light Up, Pattern and
   Singles also follow placements through `hint-track.ts`, and Tents uses that
   alone, so it joins this batch.
2. **Technique ladders on `deduction-fixpoint.ts`**: Bridges, Galaxies,
   Magnets, Pearl, Spokes.
3. **Their own deduction loops**: Boats, Bricks, Dominosa, Sticks, Loopy (on
   the planar grid), and Crossing and Undead, which use the candidate helpers
   but not the walk.
4. **Planners and heuristic hints**: Fifteen, Sixteen and Netslide (slide
   planner), Inertia, Untangle, Flood and Guess. Their marks are mostly the
   move's own shape; check whether "ring what the step decides" fits a slide
   before forcing it.

## Open questions the pilot left

- **Is a recolored clue a role?** Salad's and ABCD's clue glyphs are drawn in
  the action color and declared as outlines (evidence the sentence names). The
  guide's table still lists "clue digit, action color" and "clue digit,
  evidence color" beside the roles. Decide whether that is a fourth role, or
  an outline glyph on a clue kind, before batch 1, where Pattern and Light Up
  recolor clues too.
- **Salad's count-marker journeys** bind "every other square in it must hold a
  letter" to the one square each leg rings, though the words describe all the
  squares left. Reword, or ring the squares left.
- **`drawn` is a statement about the renderer.** The candidate walk and the
  border grid derive their marks from the words, but `hintMarks.drawn` still
  says which highlight field paints which role. Once every game is bound, have
  the renderers draw from the roles and retire `drawn`.
- `src/games/tents/tents-hint.test.ts` clones a whole step with
  `structuredClone`, which throws once a step carries words. Clone its move and
  highlights instead, as ABCD's test now does.

## Done when

Every hinted game declares `hintMarks`, the binding walk's floor in
`hint-quality.test.ts` equals the hinted population, and every hinted game's
help page lists its marks through `{{hint-marks}}`.
