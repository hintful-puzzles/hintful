# The rungs of our games whose pairs need every technique

Read 2026-10-29 from the code, for task 2.1, by four agents told to read and
state, not to judge soundness; condensed here by the session. These are the
games of group C whose pairs are board shapes or rulesets, which entailment
cannot decide (`test.md` § "The computed cut"). Each rung is the code's, with
where its variants enter.

## Solo (`solo/solver.ts` `SolverUsage`; hint `index.ts` `buildSteps`)

Census: block-single, line-single, diag-single, naked-single, line-intersect,
diag-intersect, region-set, diag-set, digit-set, wing, forcing-chain, and the
four killer rungs. Every rung reads blocks only through `blocks`/`whichblock`,
so Jigsaw changes no rung; X enrolls the diag rungs and adds diagonals to
`sees` and `place`.

| Rung | Technique |
| --- | --- |
| block-single, line-single, diag-single | hidden single in a unit: the only cell of u with d in cand takes d |
| naked-single | cand(c) = {d}: c takes d |
| line-intersect, diag-intersect | pointing and claiming: d's candidates in one unit all inside a second unit strike d from the rest of the second (vacuous premise strikes too) |
| region-set, diag-set | naked/hidden subset in one unit, sizes 2..n-2 |
| digit-set | fish of every size over rows and columns, one digit |
| wing | XY- and XYZ-wing over `sees` (row, column, block, X diagonals) |
| forcing-chain | a Search: bivalue implication chain over `sees`; never hinted |

## Seismic (`seismic/solver.ts`, `hint.ts`)

Census: marks, areas, attempt. The clash relation is the only difference
between the rulesets: always another cell of the area; Seismic adds same row
or column within n of an n, Tectonic the 8 neighbors. It is one branch in
`placeNumber` and in `clashes()`; every rung reads clash only through them.

| Rung | Technique |
| --- | --- |
| marks (hint: single, regionsFull, singleton) | naked single; a cell's implied notes are 1..|area| less what a placed clash rules out |
| areas (hint: hidden) | hidden single in an area |
| attempt (hint: starve) | place n at c, strike n from every j with clash(c, j, n): some area loses every home for a value it owes. The hint states it directly: every home of n in area A clashes with c, so c is not n |
| dup, clean | strike n from every j with clash(p, j, n) for a placed n at p |

## Ascent (`ascent/solver.ts` `ascentLadder`; hint `hint.ts`, `hint-edges.ts`)

Adjacency is the movement table: Orthogonal 4, Hex 6, Classic and Edges 8.
`dist` is the matching metric (Manhattan, hex, Chebyshev), ignoring walls.
Every rung is one function general in the mode, reading it through `adj`,
`near` and `dist`; `lines` and `pointers` are offered only under Edges.

| Rung | Technique |
| --- | --- |
| single-position (hint touch, reach) | the only cell that may hold n takes it |
| proximity-simple, proximity-full | k cannot be farther than |m - k| steps from a placed m (`dist`) |
| update-path, adjacent-path, remove-endpoints, remove-path (hint deadEnd) | the path's links: a cell with two options left uses both; a link between placed numbers not consecutive is cut; the ends are 1 and N |
| overlap (hint route, routeBeside, routeOnly) | n stays at c only if some cell `near` c may hold n - 1, and one may hold n + 1 |
| single-number-simple, single-number-full (hint onlyBeside, only) | cand(c) = {n} |
| hint lines, pointers (Edges) | overlap and single-number with each arrow's line as the premise |
| hint wholeRun | a run of 2..8 unplaced numbers with one route, or one that covers what no other run reaches |

## Path (`path/solver.ts`)

`takes(c)`: 2 for an unnumbered cell; Pairs 1 for a number; Path 1 for 1 and
the highest, else 2. `fits(p, q)`: Path |p - q| = 1, Pairs p = q. `meets` is
false within one piece in Path, true in Pairs. Every rung is shared; the mode
enters only through `takes`, `fits` and `meets`, which `live` reads.

| Rung | Technique |
| --- | --- |
| forced | a cell needing k more lines with exactly k live edges takes them all |
| breaks | look: a line on a live edge (or on two of a cell's three live edges) gives a clash at once: closed, crowded, joined (numbers that may not meet), or stuck (a nearby cell can no longer reach its count) |
| weighed | every pair of a four-way cell's edges looked at; an edge in every surviving pair is a line, in none a cross |

## Star Battle (`starbattle/solver.ts`)

One ladder reading k = `b.stars` throughout; no branch per ruleset. `need(u)`
= k minus the stars in u; `roomFor(S, w)` is the most cells up to w of S with
no two touching.

| Rung | Technique |
| --- | --- |
| around | a cell touching a star is no star |
| full | a unit with need 0: its open cells are no star |
| exact | a unit whose open cells number its need: all are stars |
| confined, banded | n consecutive rows (columns) whose need equals the need of the regions confined to them: the rest of those lines is no star; or the regions meeting them: the rest of those regions is no star |
| needed | an open cell without which a unit cannot fit its need: a star (fires with k >= 2) |
| crowded, starved | look: a star at c leaves some unit without room for its need (starved also counts own units it would complete) |

## Flip (`flip/hint.ts`, `solver.ts`)

No ladder and no tier; one function general in the press pattern. Rungs:
`lastChance` (square j's last flipper in reading order must press when j is
unlit after the earlier presses: equation j after substitution), `lastPress`
and `fromTheAnswer`, which read the solver's minimum answer and are oracle
steps, not techniques.

## Net (`net/deduce.ts`; rung ids in `hint.ts`)

Four rungs: side, loop, sealed, neighbor. Every rung finds neighbors through
`offset`, which always wraps; a non-wrapping board is fenced by border walls.
So no rung branches on wrapping.

| Rung | Technique |
| --- | --- |
| side | a turning that disagrees with a known side (wall, note, locked neighbor) is out |
| loop | a turning that joins two ends of one known-wire group is out |
| sealed | a turning whose group can reach fewer tiles than the board has is out |
| neighbor | lock a tile at a turning: if a neighbor has no turning left by side or loop, or the group is sealed, the turning is out |

## Netslide (`netslide/hint.ts`; `engine/slide-planner.ts`)

The rungs `frozenLine`, `besideSource` and `working` label single slides of a
plan found by search (bidirectional BFS, then A*); they are not macros. A slide
always wraps its line; "walls wrap around" changes only which wires connect
across the border. Prunes outside the rungs: a tile with no arm, too few arms,
and a parity test.

## Twiddle (`twiddle/solver.ts`, `engine/permutation-planner.ts`, `hint.ts`)

Rungs `home`, `carry`, `run`, `fill` classify a step; the techniques the hint
names are parts of a library sequence: a single turn, a cycle (commutator
X Y X⁻¹ Y⁻¹ of two overlapping blocks), a tuck (X Y X⁻¹), small cycles
(commutators of narrow cycles), lining up (conjugation S C S⁻¹), a twist (only
with orientation: moves no piece, turns pieces), a parity swap, and a learned
sequence by search. Staging: the first unfinished cell in reading order.
Rows-only gives the same library and a non-strict finish; orientation adds
turns to every moved tile (and an odd block's center), twists to the library,
and turn 0 to the finish.
