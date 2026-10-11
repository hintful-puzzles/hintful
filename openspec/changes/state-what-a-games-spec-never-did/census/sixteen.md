# sixteen

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the tiles in reading order, comma-separated | gap | "A Sixteen description is the tiles in reading order" (new) |
| desc | refusals: too few or too many numbers, a number out of range, a number given twice, another character | gap | "A Sixteen description is the tiles in reading order" (new) |
| desc | `hasNoSolution`: both sides odd and an odd permutation | gap | "A Sixteen board no slides can order does not load" (new) |
| desc | that a board with no solution does not load | not-owed | `engine-params`: "A board its game proves has no solution does not load" |
| desc | `supersededDesc` | not-owed | The game has none (`facts.json`: `supersededDesc: false`) |
| params | `WxH` and the `m` letter | stated | "Sixteen's params choose how the board is scrambled" |
| params | when `m` is written; what the short form leaves out (nothing); the square shorthand | gap | "Sixteen writes its shuffle count wherever it is not zero" (new) |
| params | refusal: a side below 2 | gap | "Sixteen writes its shuffle count wherever it is not zero" (new) |
| params | `validateParams` | not-owed | The game has none (`facts.json`: `validateParams: false`) |
| pref | none (`facts.json`: `prefs: []`) | not-owed | The game has none |
| control | a drag of a square along its row or column | stated | "The Sixteen port supports direct row and column dragging" |
| control | a click and a right click on an edge arrow | gap | "A click on a Sixteen edge arrow slides its line one square" (new) |
| control | the arrow keys walk the squares and the edge arrows; Enter and Space on an arrow | gap | "Sixteen's cursor walks the squares and the arrows round them" (new) |
| control | Ctrl and an arrow key; Shift and an arrow key | gap | "Ctrl or Shift with an arrow key slides the cursor's line" (new) |
| control | Enter or Space on a square locks the arrow keys | gap | "Enter or Space on a Sixteen square locks the arrow keys to sliding" (new); "Sixteen slides whole rows and columns until the tiles read in order" names the three modes and says nothing of the keys |
| control | `requestKeys` / the keypad | not-owed | The game has none (`facts.json`: `keypad: null`) |
| hint | `home` | stated | "A step says whether its tile arrives or is staged" |
| hint | `settingUp` | stated | "A step says whether its tile arrives or is staged" |
| hint | the order: a searched plan, not a ladder | stated | "The Sixteen hint plans in full-slide moves" |
| hint | what a step says and which tile it names | stated | "A step narrates what its move does"; "A journey's second leg keeps its tile" |
| hint | the "Working on tile N:" opening | not-owed | `engine-hints`: "A subgoal prefixes any form of sentence" |
| hint | the marks | stated | "Sixteen draws the hinted tile, its landing cell and its arrow" |
| hint | the refusal past the search's reach | not-owed | `engine-hints`: "A hint that plans by searching SHALL refuse honestly past its reach" |
| words | the status bar: "Moves: N", "(target M)" | gap | "Sixteen's status bar counts the moves" (new) |
| words | the status bar's completion words | not-owed | `ts-engine`: "The status bar's completion words come from the engine" |
| words | how a title is put together ("3x3") | not-owed | `engine-params`: "One describer labels every params set" |
| words | the title's own words: "10 shuffles" on a board dealt by shuffling | gap | "A shuffled Sixteen board's title counts its shuffles" (new) |

## Defects

- The help says "On a square, Ctrl and an arrow key slides that square's
  line, and the cursor goes with the square; Shift and an arrow key slides
  the line under a cursor that stays put" (`help/games/sixteen.md:18`). From
  the last column going right, and from the last row going down, the code
  slides the line the other way (`src/games/sixteen/index.ts:151` and `:154`:
  `clamped.x > at.x ? 1 : -1` is −1 when the clamped cursor has not moved).
  Here the code is wrong and the help is the rule: the bug under Notes. The
  requirement "Ctrl or Shift with an arrow key slides the cursor's line"
  states the help's rule for every column and row, not what the code does in
  the last ones, and neither of its scenarios is a press from the last column
  or the last row.

## Notes

- **A bug, reproduced through the midend 2026-10-11: Ctrl or Shift with Right
  from the last column, or with Down from the last row, slides the line the
  wrong way.** What a player presses and sees, on `3x3:4,1,3,2,8,6,5,7,9`,
  whose top row reads 4 1 3 and whose first column reads 4 2 5:
  - Right, Right puts the cursor on the 3 at the end of the top row. Ctrl+Right
    makes the row read 1 3 4: it slid left. The cursor jumps to the first
    square, which now holds the 1, and the 3 it was on sits in the middle. The
    help's rule gives 3 4 1, with the cursor on the 3 in the first square.
  - From the same square Shift+Right also gives 1 3 4, the cursor staying on
    the last square; the rule gives 3 4 1.
  - Down, Down puts the cursor on the 5 at the foot of the first column.
    Ctrl+Down makes the column read 2 5 4 (it slid up) with the cursor on the
    top square, now the 2; Shift+Down gives 2 5 4 with the cursor still at the
    foot. The rule gives 5 4 2 both times.
  - With the arrows locked (Enter, Enter on the top-left square), Right three
    times reads 3 4 1, then 1 3 4, then 3 4 1 again: the third press, from the
    last column, undoes the second and leaves the cursor on the first square
    while the 4 it was carrying sits in the second.
  - Right from any other column, Down from any other row, and every Left and
    Up, the first column and the first row included, slide the arrow's way
    and under Ctrl keep the cursor on its tile: Ctrl+Left on the top-left 4
    gives 1 3 4 with the cursor on the 4 at the end.
- Why: `src/games/sixteen/index.ts:151` and `:154` take the direction from
  whether the cursor, stopped at the edge, moved forward. At the last column
  or row it did not move, so the answer is −1. Upstream's `sixteen.c:643` and
  `:645` take it from the stopped coordinate being non-zero, which is +1
  there. The two lines want the key's direction. No test holds it: the game's
  tests have no Ctrl press, and every Shift press in `sixteen-midend.test.ts`
  goes right or down from the first column or row, or left from the first
  column.
- **A wording bug: a board dealt by one shuffling move is titled "4x4, 1
  shuffles".** Run 2026-10-11: the midend's `describeParams` titles `4x4m1`
  so, and a board matching no preset shows that title as its type. The label is
  `src/games/sixteen/state.ts`'s `${p.movetarget} shuffles`, with no singular.
  The new title requirement's scenario is ten moves and does not assert this
  case.
- Sixteen has no `validateParams` and so no area bound: `3x9007199254740993`
  passed the engine's params check. See the note on the area refusal in
  `census/samegame.md`.
- A Solve adds one to the move count the status bar shows
  (`src/games/sixteen/index.ts`, `executeMove`'s `solve` arm).
- A decoded `m` below zero cannot be written: the decoder reads `3x4m-1` as
  no shuffling moves.
