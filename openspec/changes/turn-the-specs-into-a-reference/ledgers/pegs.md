# Ledger: pegs

Base: bb004490

Where every rule of Pegs' spec went in the reference form.

## Pegs game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `pegs` game implements `Game`, with three board types, drag-to-jump, a keyboard cursor with jump-select, a per-tile render cache, a blitter drag sprite and a win flash | spec: Pegs game implements the Game interface |
| Scenarios: Cross board generation and play, Random board generation, drag input, keyboard cursor with jump-select | spec: Pegs game implements the Game interface |

## Pegs discards a drag or an armed jump when the board changes under it

| Rule | Where it went |
| --- | --- |
| The dragged peg and the armed keyboard jump are cleared whenever the midend replaces the state | spec: Pegs discards a drag or an armed jump when the board changes under it |
| Scenario: an undo disarms a selected jump | spec: Pegs discards a drag or an armed jump when the board changes under it |

## Pegs' hint sets the jump it offers against the jumps that lose, and says only what it checked

| Rule | Where it went |
| --- | --- |
| The hint searches for a line leaving one peg, offers its first jump with the peg and hole ringed, and judges the other jumps within a work allowance per request | spec: Pegs' hint offers the first jump of a line that leaves one peg |
| The title's rule: a step says only what the hint checked | spec: Pegs' hint offers the first jump of a line that leaves one peg |
| A jump that would leave a peg no peg can ever arrive beside, at once or after any jump that follows, is striped and the peg outlined | spec: Pegs' hint shows a jump that would cut a peg off |
| Three or six jumps that empty a line of three or a two-by-three block and leave every other peg in place are one journey with the shape striped | spec: Pegs' hint clears a shape as one journey |
| The shape's journey is offered wherever the line opens with one, stated without condition beside the cut-off rule | untrue: `hint` in `src/games/pegs/hint.ts` looks for a rival that cuts a peg off first and returns that step, reaching `packageAt` only when there is none, so the new requirement carries the condition |
| Otherwise, where some other jump was proved unable to finish, arrows on each other jump a finish was found after, and only these can finish said only when none was left unsettled | spec: Pegs' hint claims about the other jumps only what the search settled |
| Every jump can still finish is said only where a finish was found after each one | spec: Pegs' hint claims about the other jumps only what the search settled |
| Where nothing is settled, a peg is called stranded only where no peg is beside it, now or after a striped jump, and such a jump is not said to lose | spec: Pegs' hint calls a peg stranded only where no peg is beside it |
| The refusal for pegs no jump can ever involve again, when more than one peg is left | spec: Pegs' hint refuses a position it cannot finish from |
| That refusal's sentence counts the pegs, and the scenario says how many are cut off | untrue: the sentence in `hint` in `src/games/pegs/hint.ts` reads "The outlined peg is cut off" or "The outlined pegs are cut off" and outlines them through `markedDeadEnd`, with no number in it |
| `NO_SOLUTION_FROM_HERE` when the search proved no line finishes, `SEARCH_OUT_OF_REACH` when it could not settle the position | spec: Pegs' hint refuses a position it cannot finish from |
| Scenario: a peg cut off | spec: Pegs' hint refuses a position it cannot finish from |
| Scenario: a jump that would cut a peg off | spec: Pegs' hint shows a jump that would cut a peg off |
| Scenario: a stranded peg | spec: Pegs' hint calls a peg stranded only where no peg is beside it |
| Scenarios: the only jump that can finish, a jump the search could not settle | spec: Pegs' hint claims about the other jumps only what the search settled |
| Scenario: following the hint from the dealt board | spec: Pegs' hint offers the first jump of a line that leaves one peg |

## Pegs' Solve finishes from the player's position, or else from the dealt board

| Rule | Where it went |
| --- | --- |
| `solve` leaves one peg where the search's line ends, searching the player's position first and then the dealt board, and refuses with `NO_SOLUTION` or `PUZZLE_NOT_REASONABLE` | spec: Pegs' Solve finishes from the player's position, or else from the dealt board |
| Scenario: a lost position | spec: Pegs' Solve finishes from the player's position, or else from the dealt board |

## Pegs draws its pegs as pieces on a quiet board

| Rule | Where it went |
| --- | --- |
| Pieces on a quiet surface with no bevel, every playable cell the plain cell surface with the grid line between cells and round the outline, a peg the disc piece in a color no mark uses | spec: Pegs draws its pegs as pieces on a quiet board |
| An empty hole is a ring and never a fill of its own, so no state is a step of gray | spec: An empty hole is a ring, never a fill |
| The cursor at the corners of its cell, recoloring neither peg nor hole, and a held peg in its own color inside a ring in the held color | spec: Pegs' marks sit beside the peg and never recolor it |
| A hint's rings, outline, stripes and arrows are drawn beside the peg | spec: Pegs' marks sit beside the peg and never recolor it |
| The hint's marks are drawn "as before" | history |
| The completion flash lifts every cell to the lifted surface on its lit beats | spec: The completion flash lifts every cell |
| No palette swap for the dark scheme, and no hue named in hint sentences or the help page | spec: Pegs names no hue and swaps no palette |
| Scenario: a peg and a hole on one surface | spec: Pegs draws its pegs as pieces on a quiet board |
| Scenarios: the cursor is beside the peg, a held peg wears a ring | spec: Pegs' marks sit beside the peg and never recolor it |
