# Design: add-ball-sort

The owner's decisions (undo and the hint's rewind are the way out of a dead
end; a move pours the top run) are in `proposal.md`. What the session
settled, with what it rests on:

## D1. Before you start

A new game with no upstream: nothing to triage, no upstream params strings,
no editor moves. The board is fixed by its desc, so no `supersededDesc`.
There is no `moves` skeleton (`scripts/new-game.sh` has `grid` and
`edges`), so the game was stamped from `grid` and reshaped to Pegs' files,
the exemplar `docs/new-game.md` names for its kind.

## D2. The board, its desc and its moves

- **The id is `ballsort`, the name Ball Sort**, aliases Water Sort and
  Color Sort; family `moves`.
- **The board is the description's one layer `ball`**, a grid as wide as
  there are tubes and as tall as a tube holds: a column is a tube, its top
  row the mouth, a slot holds a color from 1 or 0. Balls rest at the bottom.
- **The desc lists each tube's balls from the bottom up, a letter a color
  (`a` to `j`), tubes split by commas**: `abca,bcab,,` is two full tubes of
  four and two empty ones. The parse refuses a tube over the capacity, a
  letter past the colors, a wrong count of tubes, and a color without
  exactly one tube's worth of balls.
- **A move names two tubes, `P<from>,<to>`.** How many balls go is the
  board's to say (the top run, as much of it as fits), so the move does not
  carry it. Solve is the sorted board, each tube's color: `S<c>,<c>,…`.

## D3. Params, and why there are no tiers

**A deal is refused past 48 balls with one empty tube, and past 30 with
three** (measured 2026-11-18, 3,000 shuffles a size with one, 8 with three).
With one, the share of shuffles that can be sorted falls from 72% at 4
colors of 3 to 11 in 3,000 at 10 colors of 4 and none at 9 of 6; a try costs
under half a millisecond, so up to 48 balls a deal comes in about 0.2 s, and
at 10 of 5 it takes a second. With three, 8 colors of 4 reach 370,000
positions, near the budget, and 6 of 6 pass it. With two, every size deals
and the worst, 9 of 6, reaches 210,000 positions in 0.7 s.

Params: colors (2 to 10: the palette's `FREE` colors, each with a symbol
of its own), balls per tube (2 to 6, default 4) and empty
tubes (1 to 3), written `<colors>h<capacity>e<spare>`, `7h4e2`.

**Measured (2026-11-18)**, random deals of tubes of four, every reachable
position enumerated, forty random players a deal who never revisit a
position:

| Board | Deals solvable | Players stuck, quartiles | Dead share of reachable |
| --- | --- | --- | --- |
| 5 colors, 2 empty | 30/30 | 0% / 3% / 13% | 0.4% median |
| 7 colors, 2 empty | 30/30 | 28% / 42% / 57% | 6% |
| 9 colors, 2 empty | 15/15 | 60% / 85% / 93% | 15% |
| 5 colors, 1 empty | 67/300 | 68% / 85% / 95% | most |
| 7 colors, 1 empty | 97/1500 | 95% / 97% / 100% | most |

Of the search's measures, the share of reachable positions that are dead
ends tracks how often a player gets stuck best on two-empty boards
(correlation 0.57 to 0.78 within a size; traps on the shortest line 0.45 to
0.57, and none at all on most five- and seven-color deals). But the spread
between sizes and empty tubes is far wider than within one, and a tier on
the dead share would need its own thresholds at every size. **So the
difficulty is the board, not a tier**: the menu runs from four colors with
two empty tubes to seven colors with one, in order of how often a player is
stuck, and the game declares no difficulty contract
(`finishesByDeduction: nothingToDeduce`, as Pegs and Same Game). A deal is
any shuffle the search can sort.

## D4. The search

One exhaustive breadth-first sweep of every position reachable from the
board, two positions that differ only in the order of their tubes taken as
one, then a sweep backward from the sorted positions along the recorded
pours: every position's fewest pours to sorted, or none (`solver.ts`,
`Reach`). It costs about 1 ms at four colors, 16 ms at seven and 180 ms at
twelve with two empty tubes (2026-11-18), so it runs whole on every hint,
Solve and deal, budgeted at 400,000 positions. It is exhaustive, so it
proves a loss as surely as it finds a finish, and the hint never needs a
second search to prove one.

- **The line is the shortest, each pour the first legal one in tube order
  that brings the board one nearer.** The line from any position on it is
  the rest of it, so the hint's subgoal is stable by construction and its
  potential is the true distance (`docs/hints-search.md` §
  "Recompute-stable plans").
- **Every rival is settled by the same sweep**: it leads to a position
  with a distance or to one without. So the hint's claim about rivals is
  always a settled one.

## D5. The hint

- **The subgoal is the color the line next completes**: the first pour of
  the line that leaves a tube full of one color names it, and every pour up
  to it serves gathering that color. Its tube is marked, and the step's
  `aim` says it.
- **The rivals** are the other legal pours. Where one leads to a dead end,
  it is striped and the step says so; otherwise the step says every pour
  can still sort the board, or which can.
- **A dead end is refused** with `NO_SOLUTION_FROM_HERE`, which the engine
  answers with the rewind; `hasNoSolution` answers the description's
  `stuck` (no pour at all) at a glance.
