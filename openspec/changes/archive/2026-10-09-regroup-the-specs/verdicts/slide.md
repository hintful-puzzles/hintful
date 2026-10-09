# Verdicts: slide

## cut `slide`: Slide declares no findMistakes hook

declared: `notApplicable.findMistakes` in `src/games/slide/index.ts` holds the reason as a sentence ("Every arrangement of the blocks is a step on the way to the answer, so no move can be wrong, only longer."), the engine reads it for the section's state and the help page shows it. `ts-engine`, "A not-applicable reason is a fact about the puzzle", is the rule that keeps such a sentence honest. The prose copy tells a reader nothing the declaration does not.

## cut `slide`: A Slide board is never turned

declared: `notApplicable.transposeParams` in `src/games/slide/index.ts` holds the same reason ("The key block leaves by a gate in the right-hand wall, so a board turned on its side would be a different puzzle."), and `engine-params`, "A game may turn its params, says why not, or is a draft", is the rule that a game leaving the hook out says why there. The scenario, that a board is dealt at the size chosen, follows from the hook's absence.

## cut `slide`: The generator tests solubility after its final singleton removal

how: the promise is in "Slide's generator keeps every board soluble", whose scenario asks a soluble board of every preset and every legal size, the smallest included. Where the solubility test sits in the removal loop is how that is met, and the comment at the test in `src/games/slide/generator.ts` records that upstream omits it and aborts on every 5×4 board. A session that took the test out would fail the kept scenario.

## keep `slide`: Slide's generator keeps every board soluble

The procedure is a promise about the board and not only its construction:
singletons go only until the board first solves and blocks are then merged
for as long as it still does, which is what makes a dealt board as locked up
as solubility allows and gives the solution-length limit its meaning. A
session changing the generator would read it first. With the requirement
above cut, its "any preset or legal size" scenario is also what holds the
smallest size.

## keep `slide`: The cursor's color is chosen against every material it can land on

`engine-colors`, "A departure from a shared role is stated at the assignment",
asks for the reason beside the assignment, and `src/games/slide/render.ts` has
it at `COL_CURSOR`. That is why the role's green was not used. This
requirement is a different thing, the test any replacement color must pass:
it has to read on the key block and on the exit in both schemes, because the
board's ladder inverts. That is the game's own look rule, and a comment is
not what a change is checked against.

## keep `slide`: A malformed Slide description is rejected

A description format and what it refuses are a promise about game IDs and
stay. The too-long and too-short split is not only its test's: the kinds are
the collection's (`engine-params`, "A description error kind says what went
wrong for the player"), and which of them Slide's counted runs give is
Slide's own call at two places in `src/games/slide/state.ts` that the shared
cursor cannot make for it (a run overrunning the board, and a square where
the comma should stand, are both too long).
