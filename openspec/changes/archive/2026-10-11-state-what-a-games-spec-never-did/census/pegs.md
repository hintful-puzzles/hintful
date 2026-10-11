# pegs

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: one letter a cell, `P`, `H`, `O` | gap | "Pegs descriptions are one letter for each cell" (new) |
| desc | what `newState` refuses: another character, a wrong length, fewer than two pegs, no hole | gap | "Pegs descriptions are one letter for each cell" (new) |
| desc | a board the search proves has no finish does not load (`hasNoSolution`) | not-owed | `engine-params`: "A board its game proves has no solution does not load" |
| params | `{w}x{h}` | not-owed | `engine-params`: "The engine provides a shared dimension param parser" |
| params | the board-type word `cross`, `octagon`, `random`; left out of the short form; no word reads as Cross | gap | "Pegs params are a size and a board-type word" (new) |
| params | refusals for dealing: a side of 3 or less, a Cross's sides, an Octagon's size | gap | "Pegs refuses a board its type cannot make" (new) |
| params | refusal: more than 10,000 cells | gap | "Pegs refuses a board its type cannot make" (new) |
| params | the three board types | stated | "Pegs is won when one peg remains" |
| control | drag a peg to its landing; a release elsewhere ends the drag | stated | "A peg jumps by a drag, or from the keyboard" |
| control | Enter or Space arms a jump, an arrow jumps, select again disarms | stated | "A peg jumps by a drag, or from the keyboard" |
| control | the cursor keeps off the cells outside the board; an arrow with no jump disarms; select on a hidden cursor or a hole | gap | "Pegs' cursor keeps to the board's cells" (new) |
| control | the arrows move a cursor, the first press showing it | not-owed | `engine-input`: "One arrow press reveals the cursor and moves it" |
| control | the secondary button, a held finger | not-owed | `engine-input`: "A game with no secondary meaning is not given a synthetic one" |
| control | a drag or an armed jump when the board changes under it | stated | "Pegs discards a drag or an armed jump when the board changes under it" |
| hint | `last`: the jump that leaves one peg | gap | "Pegs' hint says the last jump finishes, and otherwise may name the jump alone" (new) |
| hint | `trap`, `trapSoon`: another jump cuts a peg off, at once or a jump later | stated | "Pegs' hint shows a jump that would cut a peg off" |
| hint | `package`: three or six jumps that clear a shape | stated | "Pegs' hint clears a shape as one journey" |
| hint | `anyJump`, `only`, `onlyThese`, `alsoThese`: what the search settled of the other jumps | stated | "Pegs' hint claims about the other jumps only what the search settled" |
| hint | `joins`, `leavesAlone`: a stranded peg | stated | "Pegs' hint calls a peg stranded only where no peg is beside it" |
| hint | `plain`: the jump alone | gap | "Pegs' hint says the last jump finishes, and otherwise may name the jump alone" (new) |
| hint | the order the reasons are tried in | gap | "Pegs' hint gives the first reason that holds" (new) |
| hint | what the step rings, and the search behind it | stated | "Pegs' hint offers the first jump of a line that leaves one peg" |
| hint | the refusals | stated | "Pegs' hint refuses a position it cannot finish from" |
| words | the status bar (none) | not-owed | `ts-engine`: "Solve, the status bar and text export follow from the game's methods" |
| words | the preset titles (`5x7 Cross`) | not-owed | `engine-params`: "One describer labels every params set" |

## Defects

None.

## Notes

- The ceiling on a board's area is each game's own (`AREA_TOO_LARGE` gives
  only the words), and three of this batch's specs had not stated theirs:
  Pegs 10,000 cells, Rectangles 1,000,000 squares, both now written. Pearl's
  is stated.
- `decodeParams` reads any text after the size that is not one of the three
  words as Cross, silently. The requirement states it as the code does it.
