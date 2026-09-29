# draw-hint-marks-from-roles

**Status: scaffolded, not started (2026-09-29).** Follows
`bind-the-remaining-hints`, which left every hinted game bound. Read that
change's `design.md` and the pilot's (`archive/2026-09-29-bind-hint-words-to-marks`,
D5) first.

## Why

A bound game declares `hintMarks.drawn(highlights)`: which marks a step's
highlights paint. The binding walk checks the words against `drawn`, and only
the tier-2.5 render tests check `drawn` against what `redraw` actually paints.
So `drawn` is a statement *about* the renderer, sitting beside it: the one
second copy the pilot's design admits to (pilot D5). The sweep made the risk
concrete more than once: games whose renderer read a mark off `step.move` had
to add highlight fields (Loopy's `placedCorner`/`placedPair`, Subsets' `slot`)
purely so that `drawn` could see what was painted.

Several games already derive part of the drawing from the words (the candidate
walk's `area` and `hatch`, the border grid's legs, Galaxies' `tell(hl)`). The
direction is to finish that: a step's marks come from its words' references,
and the renderer paints each reference by role and kind, so there is nothing
for `drawn` to say.

## What changes

1. For each game, the renderer reads the step's mark references (by role and
   kind) instead of game-specific highlight fields, or the highlights are
   built from the references in one engine helper.
2. The glyph for a role on a kind stays the game's (a clue recolored, a ring
   round a rim dot, a double ring), declared where the kind is.
3. `HintMarkLegend.drawn` is deleted, and `testing/hint-binding.ts` checks the
   words against what `redraw` records instead (tier 2.5), which measures the
   thing itself rather than a statement about it.

## Before starting

Re-derive the population and the blocker: count the games whose `drawn` is not
a straight read of fields the words already produce. If most are, step 3
alone (check words against the recorded frame) may retire `drawn` without
touching renderers at all.
