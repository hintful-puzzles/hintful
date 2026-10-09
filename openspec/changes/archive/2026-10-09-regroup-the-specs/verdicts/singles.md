# Verdicts: singles

## keep `singles`: Singles generates unique, difficulty-graded boards

There is no shared requirement to cut the seed sentence against: `testing` "The test suite is deterministic under parallel load" asks seed-determinism only of tests, and a `<params>#<seed>` id is still loadable (`ts-engine` "The midend retains generator aux info for Solve"). Until one requirement says it of every generator, the game's copy stays.

## keep `singles`: Singles solve tries the current board, then the initial one

The order is what a player meets: Solve still finishes a board whose marks are wrong, because the second try starts from the puzzle's numbers (`solve` in `src/games/singles/index.ts`). A session simplifying Solve to one try would break that, and only this requirement says it was meant.

## keep `singles`: Distinct premise roles in a Singles hint take distinct colors

Not merged. This one alone says the three roles are disjoint and which cells of a corner deduction take which role; the other gives each role its band. They share one clause, and a hint's marks are not cut for a clause.

## keep `singles`: The forced cell, the number premises and the corner have their own colors

Not merged, for the same reason: it holds the band of each role, that the forced cell is drawn without the forced mark, and the stripe on the line a sentence names, none of which the other requirement states.

## keep `singles`: A Singles corner deduction is narrated as a contradiction

A hint's words and their order stay. This is the rule (name the board's numbers, tell it in the order of the proof), and it is the one a rewording of the sentence would be checked against.

## keep `singles`: The Singles corner sentence has one shape

The sentence is the one `src/games/singles/hint-text.ts` writes ("A touching pair of ...s sits at the corner, so one must be ... leaving the corner ... boxed in"), and the rule it adds to the arc is that each state word is the collection's. A hint's words are not cut as a snapshot.

## keep `singles`: Singles draws pieces on a quiet surface

`engine-colors` "The engine owns what a board of pieces looks like" and "A piece is drawn inset on its cell" provide the look and the helper. Which of Singles' cells holds a piece, that an undecided cell is plain surface, the weight of the frame and "never a step of gray" are the game's own, and the shared sentences are how they are said.

## keep `singles`: Singles is solved when the board breaks no rule

The added sentence stays: it is a rule of the puzzle, and it is true. `status` in `src/games/singles/solver.ts` calls `checkComplete` without `CC_MUST_FILL`, so a cell that is not black counts as white whether or not it is circled, as its comment says upstream completes it.

## keep `singles`: Singles completion flash

The clause about Solve is already gone from the regrouped requirement. What is left, that the flash lifts the surface of a cell with no piece and leaves a blackened cell's piece as it was, is Singles' own look.

## note singles: the hint's own refusal needs no requirement of the game's

`hint` returns `DEDUCTION_EXHAUSTED` when the deduction records nothing (`src/games/singles/index.ts`). `engine-hints` "Deduction running out on a sound board SHALL have one wording" and "Deduction runs out only where the tier permits search" say what that refusal is and that it may not be reached on a tier that does not permit search, for every game. Nothing is added. "A Singles hint is refused on a solved or mistaken board" is no longer in the regrouped spec, so there is nothing to settle for it.
