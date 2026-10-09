# Verdicts: unequal

## keep `unequal`: A kept plan follows the player's own move

The shared requirement does not state the rule. `engine-candidate-hints` "The shared track and refresh read a game's move dialect" names the helper in its body and gives only the pencil toggle's two verdicts, in a scenario. Neither it nor `engine-hints` "A player move is classified against the stored plan" says that a `pencilStrike` of all the step's marks completes it, nor that every other move is `off`: the midend's scenario drops the plan on a "conflicting" move, and `keepCandidateHintTrack` in `src/engine/candidate-hint.ts` drops it on any move that is not the step's, a placement answering a strike step among them. Unequal's `hintKeepTrack` is one call of that helper, so the rule is the family's, but a shared capability is not added to from here and this is a hint's behavior, so the game keeps it.

## keep `unequal`: The selection is drawn over the box and the hint's marks beside it

`engine-hints` "A hint mark is drawn on the cell's border" leaves the place to the game's layout ("the gutter between cells or the cell's own outermost pixels"). That Unequal's boxes stand apart and its marks go in the gap, where its clues also are, is the game's own choice, as Keen's and Towers' specs each state theirs.

## keep `unequal`: Unequal draws a cell's number or its pencil marks

No shared requirement states the three inks of a digit game: `engine-colors` gives roles and not which game uses which. The error ink on a duplicate is what a player sees, and each digit game says it for itself.

## cut `unequal`: A firing that forces several strikes is one journey

collection: `engine-candidate-hints` "A firing is emitted whole" covers Unequal with no departure, and its scenario names this case: both ends of a link in Unequal are consecutive steps, the first unflagged and the rest flagged `continuesPrevious`. Unequal's own grain, one cell a leg, stays in "A clue elimination is one firing of one clue".

## keep `unequal`: A clue is struck through by a click or a modified arrow

The drag through the gaps is not missing from the specs: `engine-input` "A draggable mark is declared as a sweep or as drag-mark verbs" states it for a clue marked done, and `spentDrag` in `src/games/unequal/index.ts` is that declaration (`dragMarkVerbs`). The click and the modified arrow are Unequal's own.

## keep `unequal`: Unequal exposes pencil-mark preferences

`engine-notes` "Every member offers the keep-highlight preference, defaulted the same way" says the family's defaults agree and not what they are, so the values stay here. The fourth preference the code offers, `candidateReadingPref`, is `engine-candidate-hints` "A candidate hint plan reads an unmarked cell the way the player chose", which requires it of every game on the walk, so nothing is missing.

## keep `unequal`: The hint prefers a single, then a strike, then a placement

`engine-candidate-hints` "The walk owns the ladder" gives the frame, and a hint's order stays with its game. What fills the frame here, the row and column eliminations of a placed value before the clue eliminations, is said only in this requirement.

## note The cut of "The solver's recording is gated" stands

It is not in the regrouped `unequal` spec. `engine-hints` "The solver and the hint are two projections of one deduction engine" says the generator runs with the recorder off, and Solo's copy of the rule is cut in this pass against it, so the candidate games agree.

## note The family's preference defaults belong in `engine-notes`

Sticky on, keep-highlight on and auto-pencil off are the same in every member and are written in each game's spec. See the note in `verdicts/towers.md`.
