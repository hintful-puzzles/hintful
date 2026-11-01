# Report: components and open domains described

Measured 2026-11-01 against `a386703d` (HEAD before this change).

## Deals and hint walks

A trace dealt three boards of every preset of Flood, Same Game, Netslide,
Numgame and Untangle (87 deals) and walked each by the hint's first step,
up to 150 steps, recording each deal, each step's rung, move and sentence,
the status and the dead-end verdict. It ran on HEAD in a scratchpad
worktree and on the finished tree. The traces are byte-identical, 3438
lines: Flood 21 deals, Same Game 15, Netslide 27, Numgame 9, Untangle 15.
Every walk ends solved on both trees, and none was refused.

Every snapshot and fixture of the five games is unchanged. Same Game's
tests that called the copies this change removed (`check`, `snuggle`,
`lastOfColor`, the state's `impossible`) assert the same boards and
verdicts through the compiled rules; every other existing test passes
unchanged.

## Saves and links

Desc and move encodings are unchanged, so every save and link loads. Two
moves that no interface makes are now refused rather than played:

- **A Netslide slide of the source's row or column**: the arrows beside
  them are not drawn, and the description's slide excludes those lines.
- **A move whose cell or place is a fraction**, in any planning game: a
  compiled `legal` tested a range or a shift, which let `1.5` through.
  Untangle's hand-written check already refused it; every game's does now.

## Dead-end claims

`research/technique-check/results-dead-end.txt` has the per-world counts.

- **Flood `short`** (the fills made, plus one for each color outside the
  corner's region, exceed the limit): sound on every board of up to 4×4 with
  up to 4 colors and limits 0 to 3, 3,496,108 positions in 153 worlds. The
  count of fills is an open layer, searched up to one fill past the limit;
  the results count the positions with a fill past that window.
- **Same Game `stuck` and `last`** (no two squares of a color side by side;
  a square the last of its color): sound on every board of up to 4×4 with
  up to 4 colors, 1,326,541 positions.
- **Netslide `bare` and `short`** (a tile with no wire; too few wire ends to
  join every tile): sound on every board of up to four squares, walled and
  wrapping, with every set of barriers where there are four sites or fewer
  and none, each single and all otherwise, 4,170,752 positions. The boards
  and their tables of sides are dealt by the game's own code
  (`research/technique-check/boards/netslide.ts`).
- **Numgame and Untangle** state no claim: what proves their boards lost
  (Numgame's exhaustive search of what the numbers make, Untangle's
  planarity test) is a search, which no formula states. Both are listed as
  stating none.
- A planted unsound claim beside each came out unsound.

## What each game kept, and why

| Game | Compiled and called | Kept, with the reason |
| --- | --- | --- |
| Flood | fill legality and `play` (`executeMove`), finish (`status`), `short` (`hasNoSolution`) | the solver's in-place fill: the compiled `play` is 4.9× its time on 12×12 and 7.6× on 20×20; `flood-solver.test.ts` "fills, and rings what joins, as the description's fill does" holds it to the compiled fill, and a planted defect failed it. The lost status, the limit reached unfinished, is the game's own: upstream lets the player fill on, and a lost position has no moves |
| Same Game | removal legality and `play`, the group as a view (the selection, its highlight), finish, `stuck` (the status bar) and `last` (`hasNoSolution`, the hint's trap) | the search's groups and removal: the compiled moves and `play` are 17.7× their time on 10×10, 22.9× on 15×10 and 42.4× on 20×15; `samegame.test.ts` "Same Game's search reads its board as the description's rules do" holds them to the compiled rules (a planted defect failed it). The three copies of the finish and the last-of-a-color test are one |
| Netslide | slide legality and `play`, the planner's slide list and goal test, the powered tiles as a view (the status bar), `bare` and `short` (`hasNoSolution`), finish (`status`) | `engine/wires.ts`' `computeActive` for the drawn power, which leaves a line in motion unpowered, and is shared with Net; `netslide.test.ts` "slides and powers as the description says" holds it and the slide to the compiled ones (a planted barrier defect failed it) |
| Numgame | the four operations' legality and `play` (a tap, the hint's starts, `executeMove`), finish (`status`) | the solver's search: it combines subsets of values, which no move list feeds, with its own arithmetic; `numgame.test.ts` "combines as the solver's search does" holds that to the compiled moves over 2,025 pairs and each operator (a planted defect failed it) |
| Untangle | place legality and `play` (`executeMove`), finish (`status`) | `findCrossings` for the render's red lines and the hint's counts: the description's `crossed` view is 10× to 13× its time on a board with no crossing, 10 to 200 points; `untangle.test.ts` "crosses as the description says" holds the flags and the finish to the compiled ones over 3,000 boards of six points on a 3×3 grid, where ends lie on lines (a planted defect failed it) |

The compiled finish is the status, asked once a state. Untangle's is the
costliest: 2.2× to 2.7× `findCrossings`' time on a board with no crossing,
0.31 ms on 25 points (the largest preset) and 19 ms on 200; a board with a
crossing answers at the first.

## The running app

These checks ran in Chrome against the dev server, with no console error:

- **Untangle**: on 6 points, the hint walked the board to solved in three
  moves and the win flash showed; a point dragged across a line turned both
  lines red and the board went back to ongoing.
- **Numgame**: 3 × 50 tapped made 150 in 50's place and emptied the other;
  the hint ringed 150, + and 2 with "150 + 2 = 152, the target.", and
  applying it finished the board.
- **Flood**, **Same Game** and **Netslide**: the hint walked a 12×12, a 5×5
  and a 3×3 board to the finish, each with its win, and Netslide's status
  bar read "COMPLETED! Moves: 5 Active: 9/9".
