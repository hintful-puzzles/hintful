# Verdicts: galaxies

## keep `galaxies`: The Galaxies solver grades by deduction, then bounded recursion

It is not a copy of the enum. `GalaxiesDiff` in `src/games/galaxies/solver.ts` is two tiers and three verdicts in one type, and its lowest member is spelled `Normal` while the tier a player picks is Easy (`GALAXIES_TIERS` in `index.ts`). The requirement is the one place in prose that says `Normal` means the Easy tier, and the status bar prints these verdict words, so a session renaming a member or adding a tier checks against it.

## reword `galaxies`: Galaxies has a plain-text format

The text is what a player gets from the share dialog (`src/dialogs/share-dialog.ts` asks `formatAsText`), so it is specified and not cut, and the scenario is completed from `textFormat` in `src/games/galaxies/index.ts`, which also writes `+` for a vertex and `W` or `B` for an associated tile. The rule is unchanged.

### Requirement: Galaxies has a plain-text format

The game SHALL provide a plain-text format of the board.

#### Scenario: The board is copied as text

- **WHEN** the board is asked for as text
- **THEN** each dot is an `o`, each grid vertex with no dot a `+`, each set
  edge a `|` or a `-`, and each tile associated with a dot a `W` or a `B` for
  that dot's color
- **AND** an edge that is not set and a tile with no association are spaces

## keep `galaxies`: The Galaxies hint never guesses

`engine-hints`, "A Search is refused and never narrated", gives the rule for every game, and this requirement says what a Search is in Galaxies: hypothesizing a cell's dot and propagating until something breaks. That is the game's own, and it is the refusal "The hint plan finishes the board with walls" and "An Easy board is finished by deduction alone" refer to. The checkpoint advice in the scenario is the wording of `DEDUCTION_EXHAUSTED` in `src/engine/hint-refusal.ts`, which was Galaxies' before it was the collection's. A hint's refusal stays.

## reword `galaxies`: Galaxies highlights the mistakes it finds

The clause on when the highlight is drawn and cleared is `ts-engine`, "The midend shows mistakes until the next transition", which holds the list in the midend and clears it on every transition for every game. It goes. What the highlight looks like is the game's and stays.

### Requirement: Galaxies highlights the mistakes it finds

Galaxies SHALL render the flagged tiles and walls with a distinct mistake
highlight.

#### Scenario: A flagged tile and a flagged wall are lit

- **WHEN** mistake checking has flagged a tile and a wall
- **THEN** the renderer highlights the tile, and draws the wall in the mistake
  color

## keep `galaxies`: A transient overlay is clipped to a tile and erased by its repaint

No shared requirement states the scenario "Nothing is painted undeclared". `engine-drawing` holds a warm frame to a fresh one and says who paints the ground, and neither speaks of a pixel outside what `redraw` declares. The scenario stays with the game that had the defect.

## edit `galaxies`: Candidate dots are ringed during a cell-to-dot drag, by preference

The entry found the preference's key in no requirement. A preference key is a promise to saved settings, so it is named here, with its default, from `prefs` and `newUi` in `src/games/galaxies/index.ts`.

from: The rings SHALL be subject to a
to: Under the key `galaxies-show-drag-candidates`, on by default, the rings SHALL be subject to a

## keep `galaxies`: Galaxies reports solved from its edges

The `solved-with-help` half the entry names is already gone: the requirement now speaks only of `solved`, and the upgrade is `ts-engine`, "The engine derives a board's history from its position". Nothing is left to settle.

## note galaxies: the three misfiled sentences are settled

"Galaxies is in the cross-game hint guards" and "A hint refuses on a board with a mistake" were cut by the pruning, and both cuts are right. Enrollment is derived from a game having `hint()` (`src/engine/testing/hint-games.ts`), which is `ts-engine`, "A shared mechanic is joined by having it, not by declaring it". The refusal is `engine-hints`, "The midend SHALL refuse a hint on a finished or wrong board before asking the game", which forbids a game to write it, and `src/games/galaxies/hint.ts` does not. The Purpose of the regrouped spec says both are not restated.

## note galaxies: a params refusal is in no requirement

`validateParams` in `src/games/galaxies/index.ts` refuses, of full params only, a 3×3 board at Unreasonable, with the engine's `noSuchTier` sentence: no such board exists (the source comment gives the count it rests on). A written 3×3 Unreasonable game ID still loads. Tents and Light Up state the same kind of refusal in their params requirements, and Galaxies has no requirement to carry it: "Galaxies parameter strings decode leniently and round-trip" is about the encoding. A later change should add one, in the form of `tents`, "Tents' parameters": "Of full params `validateParams` SHALL refuse a 3×3 at Unreasonable, a size none of whose boards needs the tier", with a scenario that the same params arriving with a description load.
