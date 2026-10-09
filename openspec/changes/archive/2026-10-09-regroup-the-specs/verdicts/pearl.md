# Verdicts: pearl

## keep `pearl`: A Pearl input that changes nothing makes no move

No shared requirement covers it. `engine-input` "A game declines a button it
did not act on" is about codes no game can mean, and `ts-engine` "A UI-only
input redraws without a history entry" says what the midend does with nothing,
not when a game must answer nothing. That a drag or click changing no segment
leaves no step of Undo is what a control does, and stays with the game. See
the note.

## keep `pearl`: Pearl's parameter bounds

The overflow clause is true of the code (`validateParams` in
`src/games/pearl/state.ts` returns `AREA_TOO_LARGE`) and no shared requirement
says a grid game refuses such a size: `engine-params` "A limit on a typed
number stays in validateParams" says only where such a limit is written. It is
one clause, and it is a refusal a shared link can meet.

## keep `pearl`: Pearl's pearls are the same black and white in both schemes

`engine-colors` 'A color that means "this piece is black or white" is distinct
from ink and paper' gives the first sentence its reason and does not make it
redundant: that Pearl's pearls are such pieces is Pearl's statement, and the
white pearl's outline and the black pearl's ink rim rest on it.

## keep `pearl`: Pearl's solver is a certified deduction ladder

The census sentence stays. `docs/games/solver-and-generator.md` § "Proving an
adoption: the fixtures are not enough" says why a ladder wants a firing
census; it does not say Pearl has one or that it runs at both caps, and the
scenario "A silenced rung fails" names the census as one of the two things
that catch it (`src/games/pearl/pearl-ladder.test.ts`). It is the rule the
guard exists to hold, in one sentence.

## keep `pearl`: Pearl's Solve uses the generator's solution when it has one

The requirement is in the regrouped spec, so it was restored, and it should
be. `ts-engine` "The midend retains generator aux info for Solve" says a game
whose solver needs the aux reports the solution as unknown on a board entered
by its description. Pearl is not such a game, and only this requirement says
so: Solve works on a pasted game ID and on a loaded save.

## keep `pearl`: Pearl's mistakes draw apart from its error marks

The misfiled sentence, that Check & Save refuses to save while a mistake is
present, is already gone from the regrouped requirement, and its title lost
"gate Check & Save" with it. What is left is Pearl's own: two signals, and
which color the overlay draws.

## note no shared requirement says an input that changes nothing makes no move

`pearl` "A Pearl input that changes nothing makes no move", `tracks` "A Tracks
interaction that changes nothing makes no move", a sentence of `separate` "The
grid rim cannot be edited" and, by the Tracks pruning's report, `abcd` each
state it for one game. If it is the collection's rule it wants one statement
in `engine-input` or `ts-engine`, with the departures recorded there
(`engine-input` already notes that Clear on an empty cell is a legitimate
move in some games), and the games' copies could then go.
