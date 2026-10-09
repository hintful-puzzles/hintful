## REMOVED Requirements

### Requirement: Slide declares no findMistakes hook

**Reason**: declared: `notApplicable.findMistakes` in
`src/games/slide/index.ts` holds the reason as a sentence ("Every arrangement
of the blocks is a step on the way to the answer, so no move can be wrong, only
longer."), the engine reads it for the section's state and the help page shows
it. `ts-engine`, "A not-applicable reason is a fact about the puzzle", is the
rule that keeps such a sentence honest. The prose copy tells a reader nothing
the declaration does not.

### Requirement: The generator tests solubility after its final singleton removal

**Reason**: how: the promise is in "Slide's generator keeps every board
soluble", whose scenario asks a soluble board of every preset and every legal
size, the smallest included. Where the solubility test sits in the removal loop
is how that is met, and the comment at the test in
`src/games/slide/generator.ts` records that upstream omits it and aborts on
every 5×4 board. A session that took the test out would fail the kept scenario.

### Requirement: A Slide board is never turned

**Reason**: declared: `notApplicable.transposeParams` in
`src/games/slide/index.ts` holds the same reason ("The key block leaves by a
gate in the right-hand wall, so a board turned on its side would be a different
puzzle."), and `engine-params`, "A game may turn its params, says why not, or
is a draft", is the rule that a game leaving the hook out says why there. The
scenario, that a board is dealt at the size chosen, follows from the hook's
absence.
