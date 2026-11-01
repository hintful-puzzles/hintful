# Report: pushes, blocks and solids described

Measured 2026-11-01 against `a15780e5` (HEAD before this change).

## Deals and hint walks

A trace dealt four boards of every preset of Sokoban, Slide and Cube (40
deals) and walked each by the hint's first step, up to 400 steps, recording
each deal, each step's rung, move and sentence, the status and the dead-end
verdict. It ran on HEAD in a scratchpad worktree and on the finished tree.
The traces are byte-identical: Sokoban 480 lines (12 deals), Slide 679 (12),
Cube 750 (16). Every walk ends solved on both trees.

Every existing test and snapshot of the three games passes. Cube's hint
snapshot first changed: the hint told faces apart by numbering their paint,
which the compiled roll, carrying paint as 0 or 1, does not keep. The hint
now follows each face through the roll table's permutation, and the
snapshot is back to HEAD's.

## Saves and links

Desc and move encodings are unchanged, so every save and link loads. One
move that no interface makes is now refused rather than played: a Slide
move of a block to a square it cannot reach by shifts. A Sokoban walk to the
square the man stands on is still accepted.

## Dead-end claims

`research/technique-check/results-dead-end.txt` has the per-world counts.

- **Sokoban `dead` and `jammed`** (where every barrel is needed, a barrel off
  a target that no push could bring to one; one that can never move again):
  sound on every board of up to six
  squares, 201,684 positions on each of 2×3 and 3×2, where they hold of
  13,168 and 14,430. Each names its barrels, which the hint's refusal
  outlines.
- **Cube `short`** (fewer painted squares and faces than the solid has
  faces): sound on the tetrahedron's two smallest arenas and the cube's 2×4,
  4×2 and 3×3, 704,512 positions in all, the arenas and roll tables dealt by
  the game's own code (`research/technique-check/boards/cube.ts`).
- **Cube's old test was unsound.** It called a board with any count of paint
  other than the solid's faces unsolvable, but a board with more paint than
  that can finish: the solid fills, then rolls without swapping. Such a
  board, made by hand, showed "no solution" and its hint refused; now it is
  playable, and the hint solves boards of 7 and 9 painted squares on a 4×4
  cube. The planner's floor was the same mistake, and now stops at the spare
  paint.
- **Slide** states no claim.
- A planted unsound claim beside each came out unsound.

## What each game kept, and why

| Game | Compiled and called | Kept, with the reason |
| --- | --- | --- |
| Sokoban | step, walk and push legality and `play` (`executeMove`, the drag preview's route), finish, `dead` and `jammed` and their witnesses (the banner, the hint's refusal) | the solver's packed board: the compiled moves and `play` took 5.3× as long a position on 10×12, 14.9× on 16×20 and 57.6× on 30×40, the walk's reach growing with the board; `sokoban-solver.test.ts` "the search's board" holds its pushes, finish and stuck verdicts to the compiled rules, and planted defects failed it |
| Slide | shift legality and `play` (the reachable squares a drag offers, the move, the drawn result), finish | the solver's search: 20× the compiled shifts' speed a position on 6×8 (3.16 µs against 62.3 µs); `slide.test.ts` "moves as the description's shifts do" holds the two to the same reachable positions, and a planted forcefield defect failed it |
| Cube | roll legality and `play`, finish, `short` (`hasNoSolution`) | the planner's packed roll: 14.8× the compiled roll's speed on a 4×4 cube, 39.9× on the icosahedron; `cube.test.ts` "the planner's roll" holds it to the compiled roll (a planted defect failed it); the roll's geometry, which deals the roll table and gives the animation its turn |

`hasNoSolution` and `status` together, the compiled claims and finish, take
0.02 ms a move on Sokoban's presets and 0.11 ms on a 30×40 board.

## The running app

These checks ran in Chrome against the dev server, with no console error:

- **Sokoban**: on a 7×5 level, a drag previewed a walk round and a push
  onto a target, which played; a tap walked; the keys pushed; a barrel
  wedged in a corner made the hint refuse with it outlined.
- **Slide**: on a 6×7 board, a block dragged toward the forcefield stopped
  one square short of it, and the hint then showed its next shift.
- **Cube**: on a 4×4 cube, a roll onto paint picked it up and a roll onto a
  bare square carried it; Auto-solve finished the board. On the
  tetrahedron's triangular arena, a tap and the keys rolled, the hint showed
  its next roll, and Auto-solve finished it.
