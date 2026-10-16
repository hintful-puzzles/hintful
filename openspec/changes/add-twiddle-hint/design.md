# Design: add-twiddle-hint

Measurements here are dated 2026-10-16; re-measure before relying on one.

## 1. The plan's shape: reading order, a library of sequences

The hint does what a person does: it puts the tiles in place in reading
order and keeps every finished tile where it is. A *stage* is the first cell
whose tile is wrong.

- **Free turns.** While a block clear of the finished cells reaches the
  tile, the tile travels by those turns. They cannot disturb a finished tile.
- **Runs.** At the end of a row, and throughout the last rows, every block
  covers a finished cell. There the tile goes in by a *run*: a sequence of
  turns whose net effect leaves every finished cell as it was.

The runs come from a **library** built once per board shape
(`twiddle/solver.ts`). It holds:

- commutators of two overlapping blocks' turns;
- commutators of two of those whose supports meet in exactly one cell (always
  a three-tile cycle);
- for orientation, twists: two sequences that move the same tiles the same
  way, one undone after the other;
- where a turn changes a parity no commutator keeps (a block of side 2 mod 4
  is an odd permutation; an odd block's turn is a four-cycle on each square
  color), a turn times small sequences inside its own block;
- and every placing of the small ones reached by conjugating with single
  turns.

A sequence leaves the finished cells alone however the rest of the board
lies. So all it does to a stage is carry one tile, and the cost of bringing a
stage's tile home is a table over that tile's (cell, turn), built by a
backward Dijkstra. The table does not depend on the board.

**Why not the slide planner.** `planSlides` was weighed and not taken. Its
search is over whole boards toward the finished one, and its exact
bidirectional search is what makes its plans recompute-stable. Two
measurements ruled out the board-search route for Twiddle:

- An exact search per stage, tracking only the finished tiles and the next,
  is affordable on 3×3, 4×4 n2 and 4×4 n3 (at most 220k states a stage).
- It is not affordable on the large blocks. 5×5 n3's second cell of the last
  row needs 11 turns and 6M states. On 6×6 n4, a stage in the fourth row
  passed 16M states without meeting.

The library is what makes the large blocks cheap. A request is microseconds
once the library is built.

**Learning.** Some shapes no preset deals need a run the families above do
not produce: a 3-block as wide or as tall as the board, or an odd block with
orientation. Where a stage has no way on, the planner learns one: an exact
search from both ends that follows only the finished tiles and the one to
place. The way it finds leaves the finished cells alone, so it is a library
sequence. It joins the library, and its remainders join the remainders.

**Known limit: orientation with an odd block.** This is custom only; the one
orientable preset has a 2-block. An odd block's turn also turns its center
tile where it stands. So every commutator turns tiles in place, and none is
small enough to join the library. Learning covers the early stages, but its
search follows every finished tile, and late in the game it passes its
budget.

Measured on 4×4 n3 orientable and 5×5 n3 orientable, two boards each: one
board finished; the other three refused partway through the last two rows
(`SEARCH_OUT_OF_REACH`). A request costs at most about a second.

The fix is a family of small in-place twists for odd blocks. It is the
owner's call whether this change waits for it or files it.

## 2. The integer every hinted move lowers

A plan is ranked by two things: the prefix it leaves in place when it ends,
and then its length. A plan is either the stage's own (its tile home) or a
*remainder* of a library sequence followed by the stage plan from where the
remainder leaves the board.

The library holds every remainder of every sequence a stage plan uses. So
after a hinted turn, the rest of the plan is still a candidate, one turn
shorter, and the rank strictly falls. Halfway through a run the finished
cells are disturbed. The remainder that restores them is found by trying the
remainders that start on the first wrong cell, and those that move the
stage's tile.

Learning only adds sequences. An addition can lower what a plan costs and
never raise it, so the potential still falls.

`twiddle-hint.test.ts` walks every preset and eight custom shapes: ask, play
the first turn, throw the plan away, ask again, to solved, with no refusal
allowed. `hint-resume.test.ts` walks the same way.

## 3. What a step says

Every step's aim is the tile the stage puts in place ("Working on tile 7:").
A rows-only board's tiles share their row's number, so there the aim is the
outlined tile ("Working on the outlined 2:"). The block to turn is ringed,
and the tile is outlined.

- **A free turn** says "to put it in place" or "to carry it toward its
  place". Rungs `home` and `carry`.
- **A run** is one journey, and each turn says its part in a technique a
  player can learn and reuse, with the names the owner chose (2026-10-16):
  a **tuck** (`X Y X⁻¹`), a **cycle** (`X Y X⁻¹ Y⁻¹`), **lining up**
  (`S … S⁻¹`), **small cycles** (a cycle of two cycles, for 4×4 blocks,
  narrated by phase), a **swap** (a turn, then a cycle inside its block), a
  **twist**. Beside the part, it says what the board will show: finished
  tiles it lifts out ("lifting the striped tiles"), finished tiles that come
  back ("the striped tiles return"), the tile landing ("it is in place").
  Stripes mark those tiles where they stand, and only on the step whose words
  name them. A finished tile is named when the run first lifts it and when it
  goes back for good; the goal tile is "in place" only on the turn after
  which it stays. No turn says which turn of the run it is: the hint's counter
  shows that (owner, 2026-10-16). Rung `run`.
- **Parts are read off the turns played, not off how the library built
  them.** Each turn is paired with the nearest later turn that undoes it:
  interleaved pairs are a cycle, a pair around unpaired turns a tuck, a pair
  around other pairs a lining up, and an unpaired turn that leaves the tile
  where it is lines up the technique the run plays next (its undo was cut).
  So a cut, a free reduction or a remainder's missing start never leaves a
  "turn the first block back" with no first block. The build roles add only
  what pairing cannot see: the small cycles' phases, a twist's two routes, a
  swap's first turn, and that a learned sequence was found by search. On
  2026-10-16, 7 of 474 run and free steps across every preset had no part to
  name and say only the turn.
- Words in the library are free-reduced: a turn followed by its own inverse
  is canceled, so a hint never says "turn it" and then "turn it back".
- **A run that puts tiles before its goal in place too** (the rest of a run
  the player broke off, or one that fills several on its way) reads the same.
  Rung `fill`.
- **A run stops at the turn that completes its stage.** A library sequence's
  last turns can only put back tiles after the stage's, which the plan from
  there does not need, so the planner cuts them.
- A run always ends with its tile in place. Every segment of a stage, from
  the first that is not a free turn to the tile's arrival, is one run, so no
  step promises a square short of home.

"In place" is the tile's own square and, where orientation matters, upright.
The help page says so, which keeps the sentences inside 120 characters.

**Why this rotation.** For a free turn, it is the first turn of the cheapest
way home among turns that leave the finished tiles alone. For a run, the
reason is that it leaves the finished tiles intact. Every turn can be undone,
so judging rivals has one verdict (`hints-search.md` § "A move puzzle teaches
order"), and the step says what the plan shows the move is for.

## 4. The variants

- **Orientable:** turning a tile upright is part of putting it in place, not
  a stage of its own. The stage's goal state is (its cell, upright), and twists
  are library sequences.
- **Rows-only:** a stage is still a cell. Any tile of the row's number may
  fill it, so the stage cost is the least over those tiles. A remainder may
  rebuild a finished cell with another tile of its number, so remainders
  starting before the stage are tried too.
- **`movetarget`:** a short shuffle is just a board, and the plan is the same.
  The move target is in the status bar; the hint does not aim at it.

## 5. The engine question

The proposal asked whether the stage-by-stage placement of Fifteen and Sixteen
could be stated over any permutation move, so that the planner took a move set
rather than slides. The answer from this work is yes. The parts that do not
depend on Twiddle are:

- the library over permutation effects (commutator descent, conjugation
  closure, parity products);
- the per-stage tile tables;
- the remainder lookup;
- the rank.

The only input that is Twiddle's own is the list of moves as cell
permutations with turn deltas. Sixteen's slides, Fifteen's gap moves and
Netslide's slides are such lists. That is filed as an engine change
(`openspec/changes/plan-permutation-puzzles-by-stage`), not done here: Twiddle
is its only consumer today.
