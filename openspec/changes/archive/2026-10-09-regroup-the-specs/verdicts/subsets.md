# Verdicts: subsets

## reword `subsets`: Subsets provides an explained hint

The sentence "A firing that decides several letter slots SHALL be one journey" and its scenario restated `engine-hints` "One deduction firing is one journey", which covers Subsets with no departure: its plan comes from a recorder over its solver, and `src/games/subsets/index.ts` flags every leg after the first `continuesPrevious`. Both go. The refusal sentence and its scenario stay, because Subsets' `hint` does write a refusal of its own (see the note below), so the sentence is not only the midend's.

### Requirement: Subsets provides an explained hint

Subsets SHALL implement `hint()`, planning from the player's current marks and
rule-outs and narrating each firing as the deduction that forces it. A hint on
a board that contradicts its own clues SHALL be refused, pointing at the
mistakes.

#### Scenario: A hint narrates an arrow deduction

- **WHEN** a hint is requested on a board where a horseshoe forces a letter
- **THEN** the explanation names the arrow relation that forces it, not just the
  letter to write

#### Scenario: A hidden single is shown with its placement spotlight

- **WHEN** a set has exactly one cell it can still legally occupy
- **THEN** the hint places it there and spotlights that cell as the only
  candidate

#### Scenario: A mistaken board is refused honestly

- **WHEN** a hint is requested on a board contradicting its own clues
- **THEN** the hint refuses and points at the mistakes instead of deducing from
  a wrong position

## keep `subsets`: Subsets generates uniqueness-gated boards

One verdict for both doubts. The seed sentence stays: a `<params>#<seed>` id is still loadable (`ts-engine` "The midend retains generator aux info for Solve") and no shared requirement says a generator is reproducible from its seed. The construction steps stay with it: the clause that a cell stays blank only while the capped solver still completes is the promise, and "A board above the lowest tier is not solved by the tier below" rests on every candidate drawing fresh randomness, which the single shuffle is.

## keep `subsets`: Subsets solves by candidate elimination

The list of rules is what the lower tier means and what the hint's rungs are drawn from ("The hint narrates every deduction the solver may use"), so a change to the solver is checked against it. The fixpoint clause is seven words introducing that list.

## keep `subsets`: The Custom dialog offers the tier alone

`engine-params` "No game ships an empty custom-params dialog" makes what a game's dialog offers the game's own decision and says nothing of what Subsets chose. That the board shape has one legal value, so the tier is the only field, is that decision and its reason.

## keep `subsets`: Subsets players can rule a set out of a cell

The absolute `rule` move is a promise to saved move logs, and the tally press is what a control does. "Stored per cell" says a rule-out belongs to one cell, which a player sees, and cannot be cut from its sentence without rewriting the rule around it.

## keep `subsets`: Subsets is solved when every set is placed once and every clue holds

The added sentence is welcome: the rules of the puzzle are first on the list of what stays, and before it they stood only in the Purpose. It matches `subsetsValidate` in `src/games/subsets/solver.ts`: with a horseshoe the pointed-at set must be contained in the other, and with none either way neither set may contain the other.

## note subsets: a wrong letter that breaks no clue is refused by Check & Save without pointing at it

Read in the code, not run. The reviewer corrected this note's first reading: Check & Save does not pass such a board. `Midend.check()` asks the hint when `findMistakes` is empty, the hint's refusal counts as a dead end, and the app shows "Not saved" with the sentence and marks no cell (`subsets-hint.test.ts`, "refuses honestly on a wrong-but-locally-clean mark"). What follows is the reading of the two functions, and its "passes" means only that `findMistakes` reports nothing. `findMistakes` (`src/games/subsets/solver.ts`) reports a set placed twice, a broken horseshoe or missing-horseshoe relation between two decided cells, and a wrong rule-out. It does not report a letter the player has marked or cleared that disagrees with the unique solution while breaking no clue yet. `hint` (`src/games/subsets/index.ts`) then solves a copy, finds that disagreement cell by cell, and refuses with `CONTRADICTION_UNLOCALIZED` ("These entries contradict each other..."), a sentence written for a board on which no entry can be proved wrong. Here one can: the hint has just compared each cell with the solution. So Check & Save passes a board the hint calls contradictory, and the spec's "refused, pointing at the mistakes" is not what happens in that case. The spec's "Subsets flags mistakes for Check & Save" describes the code as it is. Recommended: `findMistakes` reports a decided letter that the unique solution contradicts, after which the midend's `FIX_MISTAKES_FIRST` covers the case and the hint's own comparison can go.
