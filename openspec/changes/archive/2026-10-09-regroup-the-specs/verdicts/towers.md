# Verdicts: towers

## keep `towers`: Towers' grid size runs from 3 to 9

The ceiling is not only a declared bound: a description writes a given tower as one decimal digit, so 9 is what the format allows. The requirement also carries two rules that are Towers' own, the unknown difficulty letter and the 3×3 refusal above Normal (`validateParams` in `src/games/towers/state.ts`).

## keep `towers`: A Towers hint step populates, eliminates or places

`engine-candidate-hints` "The walk owns the setup" holds the populate and the clean, but that Towers starts on the `populate` reading and that an elimination is one step for each height it rules out are Towers' own, and a hint's steps stay with the game.

## keep `towers`: A Towers hint is ordered the way a person solves

`engine-candidate-hints` "The walk owns the ladder" gives the frame (singles, the game's own rungs, recorded strikes, recorded placements). What Towers puts in it, the two clue lines that need no notes and so open an empty board before any fill, is stated only here.

## keep `towers`: Every Towers hint step is progress the hint never undoes

The qualifier "a board whose tier needs no search" is not said of Towers anywhere in `engine-hints`: "Deduction runs out only where the tier permits search" derives the permission from the tier's name for every game. No shared requirement says a step is never undone by the hint or that a recompute skips what is already on the board, so the requirement stays whole.

## keep `towers`: Towers repaints the neighbors a tower reaches into

The rule is the trap a render session needs: a tower's change makes the three cells it leans into stale. The scenario states the observable, and the body's mention of the cache is how the rule is said, not a second rule.

## keep `towers`: Towers provides on-screen key labels

No shared requirement says a digit game's keypad is its digits and then Clear: `engine-input` "A key label carries its resolved text" shows `digitKeys`' shape only in a scenario about labels. The keypad is a control.

## keep `towers`: Towers renders in selectable 3D and 2D styles with pencil marks

The clause about the pencil-mode indicator's place is not restored. `engine-notes` "A game reserves the indicator's reach at every tile size" covers Towers with no departure: `border` in `src/games/towers/render.ts` is never narrower than `pencilIndicatorReach`, and the indicator's box is the clue ring's top-right corner, which the comment at `PENCIL_BOX` records no tower reaches. The shared rule's scenario, that nothing of the board is painted inside the indicator's box, is the clause that was dropped.

## keep `towers`: An outside clue is struck through by a click or a modified cursor key

The drag along the clues is not missing from the specs: `engine-input` "A draggable mark is declared as a sweep or as drag-mark verbs" states it, with Towers' clue as its scenario, and `clueDrag` in `src/games/towers/index.ts` is that declaration (`dragMarkVerbs`). The click and the modified cursor key are Towers' own and stay here.

## keep `towers`: hintKeepTrack advances the plan when a move matches the step

The shared requirement does not state the rule. `engine-candidate-hints` "The shared track and refresh read a game's move dialect" names the helper in its body and gives only the pencil toggle's two verdicts, in a scenario. Neither it nor `engine-hints` "A player move is classified against the stored plan" says that a `pencilStrike` of all the step's marks completes it, nor that every other move is `off`: the midend's scenario drops the plan on a "conflicting" move, and `keepCandidateHintTrack` in `src/engine/candidate-hint.ts` drops it on any move that is not the step's, a placement answering a strike step among them. Towers's `hintKeepTrack` is one call of that helper, so the rule is the family's, but a shared capability is not added to from here and this is a hint's behavior, so the game keeps it.

## reword `towers`: Towers tells its inks and its selection apart

The highlight's picture left this requirement in the prune, for `engine-notes` "The note-taking cell's highlight has one picture, drawn by the engine", and the title still promised it. Only the title changes.

### Requirement: Towers tells its inks apart

The renderer SHALL color given towers, user-entered towers, struck-through
("done") clues, and error cells distinctly.

#### Scenario: Two towers of one height in a row

- **WHEN** the player enters a height a second time in one row
- **THEN** both of those towers' digits are drawn in the error color

## keep `towers`: Towers offers a sticky pencil mode

The behavior is the engine's (`pressNoteTakingCell` in `src/engine/note-taking-cell.ts`), but `engine-notes` states neither what a left press does under a latched mode nor what the two presses do with the preference off, except in scenarios of "The sticky pencil toggle is a mode switch, not a selection" and "An unoffered pencil preference is read from its absence", and it does not give the default. A shared capability is not added to from here, so Towers keeps it.

## keep `towers`: Towers selects a cell by pointer or by keyboard cursor

The hit-testing that follows a leaning tower is Towers' own. Enter toggling the mode is `toggleNoteTakingMode`, which every member calls, but `engine-notes` "One way into note-taking across the collection" only permits it as a gesture a game may have and does not state it, so it stays.

## note `engine-notes` leaves three rules of the family to the games

1. What the presses do: with the sticky preference on, a secondary press switches pencil mode and a primary press highlights in the mode that is on; with it off, a primary press highlights for an entry and reverts the mode, and a secondary press highlights for a pencil mark. `pressNoteTakingCell` does this for every member, and it is written out in `towers` "Towers offers a sticky pencil mode", `solo` "Solo selects a cell by pointer or keyboard" and `salad` "Salad selects a square and enters a symbol or a marker".
2. The defaults: "Every member offers the keep-highlight preference, defaulted the same way" says the defaults agree and not what they are (sticky on, keep-highlight on, auto-pencil off). Towers, Solo, Keen, Unequal and Mathrax each say them.
3. The select key on a showing highlight toggles pencil mode (`toggleNoteTakingMode`, called by every member). Towers, Solo, Keen and Salad each say it.

A requirement of `engine-notes` for each would let the games drop their copies.

## note Towers' spec does not list its hint's clue techniques

`TOWERS_RUNGS` in `src/games/towers/index.ts` adds six rungs to the Latin family's, and the spec names two of them (a clue equal to the grid size, a clue of 1). The four the recording solver supplies have no requirement: facing clues that sum to `w + 1` fix the tallest tower's place (`facing`); a clue that already sees a rising run one short of its count puts the tallest remaining tower beside it (`lineFull`); a height too tall to hide this close to its clue is struck (`lowerBound`); and a height no arrangement giving the clue's count puts here is struck (`arrangement`). A change should add a requirement naming them and their tiers; it does not fit in "A Towers hint is ordered the way a person solves" within 500 characters.

## note The entries' other requirements were already cut

"A hint is refused on a solved board or one with mistakes", "Check & Save refuses a board with an invalid note" and "Recording a deduction script leaves the generator's solve unchanged" are not in the regrouped `towers` spec. What held them still stands: `engine-hints` "The midend SHALL refuse a hint on a finished or wrong board before asking the game", `ts-engine` "A candidate note that excludes the answer is a mistake", `engine-hints` "The solver and the hint are two projections of one deduction engine".
