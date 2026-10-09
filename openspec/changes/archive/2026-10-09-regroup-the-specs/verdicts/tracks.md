# Verdicts: tracks

## keep `tracks`: A stalled bare Tracks board goes on to clue-laying

This is the requirement the doubt knew as "Tracks rejects a bare board as too
easy only when it solves". The scenario in doubt, "Easy boards are unchanged"
(the generator writing upstream's description byte for byte), is not in the
regrouped requirement, and the test it leaned on is gone:
`src/games/tracks/tracks-differential.test.ts` does not exist. The generator
now lays its track by construction, which upstream's does not, so no byte
match is promised or possible. What is left is the generator's own rule.

## keep `tracks`: Tracks generates solver-gated boards reproducibly

Not `collection`: no shared requirement says a generator deals the same board
for the same seed. Searched the regrouped `engine-*`, `ts-engine`, `dealing`,
`testing`, `app-shell`, `random` and `ts-migration` for "same seed" and
"reproducib": nothing. `random` "The random module's output is stable across
builds" is about the stream, not about a generator's use of it. See the note.

## keep `tracks`: Tracks' parameters

The constants are the trap, and the spec is where a reader meets it: the
letters are `e`, `t` and `h` and the tiers are Easy, Normal and Tricky, so
`t` reads as Tricky and is Normal. The parenthesis is the only thing in the
requirement that pairs each tier with its letter in order
(`DIFF_EASY`, `DIFF_TRICKY`, `DIFF_HARD` are 0, 1 and 2 in
`src/games/tracks/state.ts`), and the scenario leans on it.

## keep `tracks`: A firing the board already shows is hidden

`engine-hints` "A hint SHALL show only steps the player's board does not
already decide" gives the mechanism and "What is evident is the game's
judgment, held to move legality" leaves the judgment to the game. This is
that judgment: the three cases in which Tracks would refuse the player the
contrary. Naming `showable` (`src/games/tracks/hint.ts`) ties it to the hook
the shared requirement names, and "every change a rung makes is recorded" is
what lets a hidden firing still advance the working board; neither is how.

## keep `tracks`: Three rules of update-flags declare no reason

Which rules are never a step, and why each is evident, is the hint's
behavior. `engine-hints` "What is evident is the game's judgment, held to move
legality" asks that a game declaring which rules are evident hold the
declaration to the derivation, and the last sentence here is Tracks doing so.

## keep `tracks`: Tracks renders rails, clues, drag previews and the completion flash

It reads as an inventory, and most of its items are decisions no later
requirement states: no gutter and a one-tile margin holding the clues and the
A and B labels, sleepers on a straight rail, the two drag-preview colors, and
a clue number turning red. The surface, cross and flash requirements after it
cover the rest and repeat none of these.

## keep `tracks`: Tracks explains the next deduction

The misfiled first sentence, the midend's refusal on a solved or mistaken
board, is already gone from the regrouped requirement, cut as `collection`
against `engine-hints` "The midend SHALL refuse a hint on a finished or wrong
board before asking the game". What is left is the plan and its scenarios.

## keep `tracks`: A Tracks interaction that changes nothing makes no move

No shared requirement states it; see the note in `verdicts/pearl.md`. What a
control does stays with the game until one does.

## keep `tracks`: The Tracks keyboard cursor's outline is at least two pixels thick

No shared home. Searched the regrouped `engine-input`, `engine-drawing` and
`engine-colors` for a cursor's thickness: `engine-drawing` says only that the
shared rectangle outline is one pixel thick unless told otherwise. A floor of
two is Tracks's own decision, for its half-grid cursor at small tiles.

## keep `tracks`: An undecided Tracks square is the cell surface

No shared home for the one-pixel grid line. `engine-colors` says what color a
quiet grid line is and how far it stands from its cell, and nothing says how
wide one is or that it does not grow with the tile.

## note the two `collection` cuts the pruning asked a reviewer about stand

"The Tracks hint runs the solver's own rungs" restated `engine-hints` "The
solver and the hint are two projections of one deduction engine", which is in
the regrouped `engine-hints` and covers Tracks with no departure. The midend
refusal sentence restated "The midend SHALL refuse a hint on a finished or
wrong board before asking the game". The brief answers the question put to the
owner: a game's spec does not repeat a refusal the midend makes for every
game.

## note no shared requirement says a seed deals one board

`tracks` "Tracks generates solver-gated boards reproducibly", `slant` "Slant
generates solver-gated boards reproducibly" and `loopy` "A redraw changes only
which description is drawn" each say it for one game, and `ts-engine` "The
midend retains generator aux info for Solve" assumes it of a `#seed` id. If
it is every generator's promise it wants one statement, in `ts-engine` or
`random`.

## note the cursor's thickness and the grid line's width have no shared statement

The pruning's report proposed a shared home for "The Tracks keyboard cursor's
outline is at least two pixels thick" and for the one-pixel grid line of "An
undecided Tracks square is the cell surface". None exists in the regrouped
`engine-input`, `engine-drawing` or `engine-colors`. Whether either is a
collection rule is a question for those capabilities; Tracks keeps its own.
