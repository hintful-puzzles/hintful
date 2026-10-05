# declare-ascent-and-flip-rulesets

**Status: implemented 2026-10-05.** Asked for by the owner on reading
`declare-rulesets-explicitly`, which left Ascent's Edges undeclared, and on a
survey of every game's `paramConfig` for others: *"For Ascent's Edges, we
should definitely declare it as a ruleset"*; *"regarding Flip, Crosses /
Random do really feel like separate rulesets to me, and I'd promote them, and
make it clearer in the help."*

## What Changes

**Ascent.** Edges was the fifth choice of a "Grid type" field whose other four
are grids. It is a different puzzle (1to25, where the others are Hidato), on
the Rectangle only. The dialog now asks two things: "Game mode", Ascent or
Edges, and "Grid type", the four grids. Params keep their one `mode`, so no
game ID moves; the two fields read and write it between them, and Edges asked
for on another grid is refused: "Edges is played on the Rectangle grid." A
params label starts with the ruleset ("Ascent: 6x7 Easy", "Edges: 5x5
Normal"), and the menu has a section for each. The "Hex" heading goes, since a
ruleset game lists its presets flat; the hexagonal presets say their grid in
their own titles.

**Flip.** Crosses and Random were a "Shape type" in the `kind` slot. They are
rulesets: a press flips a different group of squares in each. Titles read
"Crosses: 5x5" where they read "5x5 Crosses", the menu has a section for each,
and the help states each one's rule at the top, where it said only that the
Random settings give "more varied puzzles".

**Salad's help.** Which puzzles Letters and Numbers come from moved out of the
rules into a section of its own below the controls (owner: it is not what a
reader learning the game is after).

The params-stability snapshot moved for Ascent and Flip in label and menu
path only: the set of encodings is unchanged.

## The survey

All 57 games' `paramConfig`, 41 choices and checkbox fields beyond difficulty
and the declared rulesets, read for a field whose values are different
puzzles. Flip's was the one found, and Cube's solids the one considered and
left (the same rule on another solid and tiling). Most fields were judged from
their `doc`; help pages were opened for the nine candidates.

It also found fields that add or remove one rule and combine with others
(Solo's X, Jigsaw and Killer; Net's wrapping; Twiddle's two). Those are not
rulesets, and `declare-rule-modifiers` holds them.

## Hints to pull in

None.
