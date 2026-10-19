# give-map-colors-clear-of-the-hint-pools

**Status: filed 2026-10-19 by `show-what-a-hint-names`**, on the owner's
decision: "if we can just change Map's own colors so that we don't need an
exception, that'd be better" than letting a game choose its hint pool.
**Rescoped 2026-10-19 by its measurement** (below): Map's colors need not
move, and the defect is the pools' own. The owner chose the proposed shades
(2026-10-19), and that a role's colors share a connotation rather than a
hue, so the outlines are green, teal and brown (`tasks.md` 1.8).

## Why

A hint's references each take a color of their own from their role's pool
(`HINT_COLOR_POOLS` in `src/puzzle/puzzle.ts`), and their marks are repainted
in it. The pools are nine hex values, the same in both schemes, held outside
the palette, so none of the palette's guards measures them. Measured
2026-10-19 against what the palette holds every mark to:

- **Map's fills are already clear of them.** Every region fill stands 0.12 or
  more from every pool shade by the palette's distance (the neighbor floor is
  0.07), and Map's hints draw one ring and up to three outlines a step
  (226 steps walked over its gate presets), so its violet and cyan ring
  shades and its pink stripe never reach a Map board. Star Battle draws one
  of each role.
- **The pools fail the bar a mark is held to on a region fill**
  (engine-colors § "A region's fill stays under everything drawn on it"):
  in the light scheme the lime outline (`#82c91e`) reads at 1.16:1 on a
  fill and 1.14:1 on the plain cell surface, the amber stripe at 1.22:1 and
  the cyan ring at 1.36:1, where the ring it replaced (`HINT_ACTION`) reads
  at 2.57:1 and the outline (`HINT_EVIDENCE`) at 4.60:1. In the dark scheme
  the violet ring reads at 1.94:1 on the teal fill, the dark green outline at
  2.47:1 and the pink stripe at 2.34:1, under the ring's floor of 2.8.
- **They break the pair's hue rule** (engine-colors § "The pair's colors keep
  off the marks' hues"): the violet ring is 20° from the pair's purple and
  the amber stripe 29° from its yellow, where the rule asks more than 30°.
  The rule's test keys on names starting `HINT_` in `palette.ts`, and the
  pools are neither.

## What changes

- **The pools become the palette's**: each shade a color with a value per
  scheme, its first ring shade the hint's own blue (`HINT_ACTION`), so a
  step with one reference of a role looks as the palette designed it.
- **The palette's guards measure them**: the pair's hue rule and the bars a
  mark on a fill is held to take every pool shade, and any two shades stand
  apart in both schemes.
- **A reference's marks inside another's paint over them** (done
  2026-10-19, in passing): a step's "region 1" lies inside "the chain", and
  was painted over, so its pill named a color the board did not show.
- Map's fills, its help and `FOUR_NAMES` do not change.

## The owner's answers

Shades that clear every bar exist (a search, 2026-10-19), but in the light
scheme a mark reads on the surface only at lightness 0.57 or below, so the
light pools turn deep: the cyan ring a teal-blue, the amber stripe a bronze.
The owner chose the deeper shades over the vivid ones from a comparison on
the cell surface and Map's four fills. Three greens that deep read as one,
and the owner: "There shouldn't be any requirement for all of a pool's
colors to be 'the same color' - we just need them to have similar emotional
connotation". The values are `REFERENCE_DESIGN` in `colors.ts`.
