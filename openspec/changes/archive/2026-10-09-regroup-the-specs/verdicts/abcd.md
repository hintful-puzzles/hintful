# Verdicts: abcd

## keep `abcd`: ABCD's fill-all-marks command fills only cells with no marks

`engine-notes` "Mark-all is adaptive in a game with uniqueness regions", "The Mark-all cleanup is one pencilStrike, or no move" and "Repeated Mark-all presses converge" are each scoped to a game with a region provider, and ABCD has none: it passes its own rule (`abcdObviousMarks`) to `adaptiveMarkAll` in `src/games/abcd/index.ts`. So nothing shared binds ABCD to one `pencilStrike`, to keeping a cell's last mark, or to no move when nothing strikes, and its obvious-mark rule (a touching cell's letter, a line that has its count) is the puzzle's own.

## edit `abcd`: The generator's retry cap is sized to what the bound admits

The scenario stopped at the generator's layer. The throw is `RetryLimitExceeded` (`retryLimit` in `src/games/abcd/generator.ts`), and `engine-difficulty` "Only an exhausted retry bound is answered" with `dealing` "A deal that finds no board says so in the engine's sentence" say what the player then sees. Both are now said, and the rule is unchanged.

from: - **THEN** it throws, and deals no fallback board
to: - **THEN** it throws `RetryLimitExceeded` and deals no fallback board, and the player is shown the engine's sentence that no board was found

## keep `abcd`: The bound admits every preset and is asserted in both directions

No shared requirement says that every preset passes validation for generation: I searched the regrouped `engine-params`, `engine-difficulty`, `ts-engine`, `testing` and `dealing` for it. A cross-game test does hold it (`src/engine/params-declared.test.ts`, "every preset is valid"), and a test is not a home, so both halves stay.

## keep `abcd`: ABCD's generator accepts only a uniquely solvable fill

The seed sentence stays: a `<params>#<seed>` id is still loadable (`ts-engine` "The midend retains generator aux info for Solve"), and no shared requirement says a generator is reproducible from its seed. `testing` "The test suite is deterministic under parallel load" asks it only of tests.

## keep `abcd`: ABCD's menu offers a board under each of its rules

The second scenario's hint half is `engine-hints` "The hint walk SHALL cover every preset a game offers", but its deal half is the reason this preset may be on the menu at all: five letters at 6x6 sits inside the measured bound, and nothing shared promises that a preset deals at once.

## keep `abcd`: ABCD refuses board sizes it cannot generate

`engine-params` "A generation-only bound is gated on full" says how a game expresses such a bound. That ABCD's bound is one of them, so a shared ID outside it still loads, is ABCD's promise to those IDs and is one sentence.

## note engine-notes: the Mark-all cleanup rules are scoped to games with uniqueness regions

`engine-notes` "The Mark-all cleanup is one pencilStrike, or no move" and "Repeated Mark-all presses converge" open with "In a game with uniqueness regions" or rest on "the values placed in its regions". The code they describe (`adaptiveMarkAll` in `src/engine/candidate-hint.ts`) also serves a game with an obvious-candidate rule of its own, which "A game with no obvious-candidate rule keeps a fill-only Mark-all" already names as a kind. Widening the two to "a game with an obvious-candidate rule" would let ABCD's requirement shrink to its own rule.

## note engine-params: no requirement says a preset passes validation for generation

`src/engine/params-declared.test.ts` asserts `paramsError(g, leaf.params, true)` is null for every preset of every game, and no requirement of the regrouped `engine-params` states the rule that test holds. ABCD's "Every shipped preset SHALL pass validation for generation" is the only statement of it found.
