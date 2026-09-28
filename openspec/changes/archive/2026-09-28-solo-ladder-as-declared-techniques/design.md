# Design: solo-ladder-as-declared-techniques

## D1. Two grades, one runner

Solo grades on two scales, sudoku `diff` and killer `kdiff`, each with its own
cap, and the runner has one grade and one `maxTier`. Neither is used. The
ladder is built holding only the rungs both caps admit, and each rung, when it
fires, raises its own scale. That is exactly upstream's loop:

- its sudoku gates are `break`s at the first over-cap rung, and the sudoku
  rungs are in tier order with every killer rung before the first `break`, so
  leaving an over-cap rung out is the same as breaking there;
- its killer gates skip one rung at a time, and are not in `kdiff` order (the
  region rule, `DIFF_KINTERSECT`, runs before min/max and sums), which leaving
  a rung out also reproduces.

No option was added to the runner.

## D2. Rungs that read only the board

Upstream's killer rungs read two things an earlier step of the same pass left
behind: the working cages, reduced by their filled cells before the killer
single; and the partial cages the region rule worked out, which min/max and
sums then read. A replay running one rung alone would see neither.

- Every killer rung reduces the cages first. It is a no-op until another cell is
  placed, so within a pass only the first call does anything, as before.
- The partial cages depend on the filled cells alone (the cages are reduced by
  them), so they are cached against a count of placed cells. The region rung
  fills the cache; min/max and sums read it, and work it out without placing
  anything when it is stale, which happens only in a replay.

The rungs are finer than upstream's comments (rows and columns are one rung,
diagonals another) where that keeps a replay's technique to one kind of
reasoning; splitting a pass into consecutive rungs in the same order changes
nothing, and the equivalence test holds it.

## D3. What replaces the differential's hold on the loop order

`solo-ladder.test.ts`, on `engine/testing/ladder-equivalence.ts`: thirteen
pinned descs (every variant and tier, a digit-set board and a diagonal-set
board found by search) and four of them one digit wrong, at every pair of
deduction caps and at search. Every rung fires. Seen red: `naked-single`
declared at Tricky (5 tests), and `naked-single` moved after the intersections
(2).

It runs in under a second. A killer X board was dropped: searching it with its
killer rungs capped away took 122 s, and the other Killer board fires every
killer rung. Search is walked at the top cap only, because a search branch is a
fresh solve through the runner on both sides.

Before the oracle was trusted, the new solver was compared against HEAD's on
494 boards (the frozen fixtures, generated Killer and X Killer boards, and
random partial and one-digit-wrong grids from each) at all 24 cap pairs: the
same verdict, grade and grid in all 11,856 solves, and the same 331,644
recorded hint operations with their grouping.

## D4. What it earned the premise audit

On the guard's boards (every preset, both candidate readings), measured on this
change against HEAD:

| | tested | put back |
| --- | --- | --- |
| HEAD, whole-ladder replay | 296 | 14,399 |
| one rung replayed | 8,178 | 3,859 |

Of those, Killer aside: 61 to 782 before (the proposal's figure), about 1,160
to 440 now. No finding and nothing unreproduced.

Planted: a line-block intersection whose step no longer names the region it
confines the digit to is found now and was not on HEAD. A Killer cage's filled cell cut from its
reads is found (34 findings, and `firing-replay.test.ts` goes red). Either of
the region rule's two reads cut short is still not found on these boards, so
the recording test in `solo-hint.test.ts` keeps holding them.

## D5. A region with nothing left is a contradiction

Reading the region rung turned up an upstream quirk the port kept on purpose:
when searching (`maxdiff >= DIFF_RECURSIVE`), a region whose filled cells and
whole cages already make its total with cells still open set
`DIFF_IMPOSSIBLE`, which `got_result` then overwrote with the grade so far. A
wrong guess in a search branch was therefore counted as a solution. Measured:
three stray digits on a published Killer board, where the old solver said
"solved at Easy" and returned the grid unfinished. It is now a contradiction at
every cap.

Who sees it: only a search on a Killer board, so only a Killer desc a player
types in. Generated Killer boards grade at Easy and never search, and a board
consistent with a solution never leaves a region nothing, so no generated board
or verdict on one moves; the frozen differential is untouched.
