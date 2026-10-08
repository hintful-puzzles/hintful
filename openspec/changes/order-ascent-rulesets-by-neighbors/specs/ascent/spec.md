## REMOVED Requirements

### Requirement: Ascent's rulesets are Ascent and Edges

**Reason**: The grids change which squares are neighbors, so they are
rulesets and not kinds of one board.

**Migration**: "Ascent's rulesets are told apart by a square's neighbors".
No params encoding moves.

## ADDED Requirements

### Requirement: Ascent's rulesets are told apart by a square's neighbors

Ascent SHALL declare four rulesets, in this order: Orthogonal (four neighbors, mode letter `O`), Hex (six, `H` and `C`), Classic (eight, `R`) and Edges (eight, with arrows round the grid, `E`). The Custom dialog SHALL ask for the ruleset and the board's shape as separate fields, the shape offering Rectangle, Honeycomb and Hexagon. The params encoding SHALL be unchanged: one mode letter, and a string that names no mode SHALL decode as Classic.

Each ruleset SHALL declare what it offers (`Ruleset.only`): Hex the Honeycomb and the Hexagon, and every other ruleset the Rectangle alone; Edges also symmetrical clues off and the tiers from Normal up. `validateParams` SHALL write no refusal for any of these.

The Type menu SHALL hold a section for each ruleset, each offering one board: Orthogonal, Hex's Honeycomb and Classic at every tier, Edges from Normal up, and Hex's Hexagon from Normal up beside the Honeycomb. Other sizes are Custom's. The game's default SHALL be the menu's first line.

#### Scenario: The menu's sections

- **WHEN** the player opens Ascent's Type menu
- **THEN** its sections are Orthogonal, Hex, Classic and Edges, in that order, and the Hex section holds a Honeycomb board at every tier and a Hexagon board from Normal to Hard

#### Scenario: Hex is chosen in the dialog

- **WHEN** the player selects the game mode Hex on a Rectangle board
- **THEN** the board shape offers Honeycomb and Hexagon with Honeycomb chosen, and OK deals a Hex board

#### Scenario: A ruleset is asked for on a shape it does not have

- **WHEN** the dialog's values are submitted, by something other than its form, with the game mode Edges and the board shape Hexagon
- **THEN** it is refused: "Board shape must be Rectangle for Edges."

#### Scenario: A game ID from before the rulesets were split

- **WHEN** a params string with any mode letter, or with none, is decoded
- **THEN** it names the board it always did

### Requirement: A square's corners are cut where the path may step diagonally

On a Rectangle board whose ruleset lets the path step diagonally (Classic and Edges), `redraw` SHALL draw each square of the grid with its corners cut off, the board showing in the gap, and a hint's ring or outline round such a square SHALL follow the cut. On an Orthogonal board a square SHALL be drawn whole. An edge number's arrow is not a square of the grid and SHALL be drawn as before.

#### Scenario: The two square boards are told apart

- **WHEN** a Classic board and an Orthogonal board of one size are drawn
- **THEN** every cell outline of the Classic board has eight sides and every one of the Orthogonal board four
