# Verdicts: netslide

## keep `netslide`: Netslide can be solved from any position

The two halves do not conflict. `engine-hints`, "Only a searching hint is
excused the walk's promise", relaxes only what the cross-game walk asks of a
searching game; it does not forbid a game promising more. Netslide does
promise more and holds it: `netslide-reconstruct.test.ts` walks every preset
to completion on recomputed hints with no `aux` (the `SEARCH_REACH` ledger in
`src/engine/hint-resume.test.ts` records it as what covers the game). The
requirement already says how the hint refuses where its bounded searches
return nothing, which is what `src/games/netslide/hint.ts` does with
`SEARCH_OUT_OF_REACH`.

## cut `netslide`: Netslide has no mistake check

declared: `notApplicable.findMistakes` in `src/games/netslide/index.ts` holds the same reason as a sentence ("Every arrangement of the tiles is a step on the way to the answer, so no move can be wrong, only longer."), the engine reads it for the section's state and the help page shows it, and `ts-engine`, "A not-applicable reason is a fact about the puzzle", is the rule about it. The prose copy says nothing the declaration does not.

## keep `netslide`: The distance to finished is a pure function of the board

`engine-hints`, "A plan steered by a measure SHALL be steered by one measure",
does not cover it: that forbids two measures taking turns, and this forbids
one measure frozen against an earlier board, and forbids hiding a loop by
carrying the plan. Both were tried here and would be proposed again (a frozen
assignment is far cheaper), so it is a refusal that still binds.
`docs/games/hints.md` § "Sliding-permutation games", lesson (a), tells the
story, and the spec is where a change to `travelToFinish` is checked.

## keep `netslide`: A subgoal of several slides is one journey

`engine-hints`, "One deduction firing is one journey", is conditioned on a
plan derived from a solver or deduction engine, and Netslide's plan comes from
a search: its journey is a run of slides serving one tile, grouped by the
game's own `narratePlan`. The shared requirement does not reach it, so the
game keeps it.

## keep `netslide`: The shuffle declines a slide that undoes or overshoots

It is what the `m` suffix of the params promises of a board: `movetarget`
slides that each count, none of them cancelling the one before. A session
changing the shuffle would check against the declined slides as much as the
default count, since counting a declined slide would make a move target of 20
deal boards a few slides from finished.

## note `netslide` has no requirement for what its preset titles mean

The presets were cut as `declared`, and nothing in the spec says what "easy",
"medium" and "hard" are. `presetTitle` in `src/games/netslide/index.ts` has
it: easy is every barrier the solution permits (`barrierProbability` 1),
medium is none, hard is a wrapping board. What a difficulty name means is
something the prune brief keeps, so a follow-up should add the requirement;
this pass may not.

## note Two sliding games each state the multi-leg journey for themselves

`netslide` "A subgoal of several slides is one journey" and `sixteen` "A
journey's second leg keeps its tile" both say that the slides serving one tile
are one journey flagged `continuesPrevious`, and `engine-hints` "One deduction
firing is one journey" says it only for deductive plans. Whoever settles
`engine-hints` could widen that requirement to a searched plan's subgoal;
until then each game keeps its own.
