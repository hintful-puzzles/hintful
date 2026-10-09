# Verdicts: mines

## edit `mines`: What Mines draws on its two surfaces

The sentence is a decision about the look and not a note from removing the bevel: `src/games/mines/render.ts` gives each count a palette slot of its own (`COL_1`..`COL_8`) and fills an opened number in `COL_WRONGNUMBER` when more flags stand beside it than it counts. The tint was named and never said, so the edit says when it is drawn.

from: the too-many-flags tint
to: the tint on a number with more flags beside it than it counts

## reword `mines`: Mines' parameters leave room for a safe first click

The lower bound on the mine count is a rule a player meets in the Custom dialog and a game ID is refused by, so it stays; that it is met by the item's `bounds` and not by `validateParams` is how it is built (`engine-params`, "A rule that a game rejects params is met by the engine's check"). The requirement now states the bound and not where it is declared.

### Requirement: Mines' parameters leave room for a safe first click

Params SHALL be refused unless `1 ≤ n ≤ w·h − 9`, and, for a board about to be
generated, unless `w > 2 && h > 2`.

#### Scenario: Too many mines for a safe first click

- **WHEN** a 9×9 board with 73 mines is validated
- **THEN** it is refused, since fewer than nine squares would hold no mine

## keep `mines`: The rules of Mines

What counts as solved is first on the prune brief's list of what stays, and no other requirement of the spec said it. The sentence matches `isWon` in `src/games/mines/state.ts`: every square without a mine open, on a board not died on, flags or no flags.

## note mines: the description format and the hint's order are not in the spec

Nothing was added here, since no requirement holds either. A later change should write two requirements: the description's two forms as `parseDesc` in `src/games/mines/state.ts` reads them (the board not laid out yet, and the layout with its first square), which saved games and game IDs depend on; and the hint's order, which `MINES_RUNGS` in `src/games/mines/hint.ts` declares as first click, satisfied number, full number, pair of numbers, mine count. "Each Mines hint step names its numbers and its reason" lists the four reasons and not their order.

## note mines: "Elapsed time SHALL survive a save and restore" is already gone

The entry R mines 1 names a sentence of "Solve stops the clock, and elapsed time survives a save", a requirement the pruning removed whole. That sentence went as `collection` to `ts-engine`, "The engine uses a clean TS-native save format", whose envelope carries the timer's elapsed time. There is nothing left in `mines` to move or cut.
