## MODIFIED Requirements

### Requirement: Ascent's rulesets are Ascent and Edges

Ascent SHALL declare two rulesets: Ascent, played on any of its four grids, and Edges, played on the Rectangle. The Custom dialog SHALL ask for the ruleset and the grid type as separate fields, the grid type offering the four grids and not Edges. The params encoding SHALL be unchanged: one mode letter, `E` for Edges.

Edges SHALL declare what it offers (`Ruleset.only`): the Rectangle alone of the grid types, symmetrical clues off, and the tiers from Normal up. Ascent's params SHALL hold no value for Edges on another grid, and `validateParams` SHALL write no refusal for any of the three.

The Type menu SHALL hold a section for each ruleset. It SHALL offer one size of each hexagonal shape, Normal to Hard, in the Ascent section; other sizes are Custom's.

#### Scenario: Edges has its own section

- **WHEN** the player opens Ascent's Type menu
- **THEN** the Edges presets are in an "Edges" section of their own, and every
  other preset is in the "Ascent" section

#### Scenario: Edges is chosen with the Hexagon selected

- **WHEN** the player selects the grid type Hexagon and then the game mode Edges
- **THEN** the grid type is shown disabled at Rectangle, and OK deals an Edges
  board

#### Scenario: Edges is asked for on the Hexagon

- **WHEN** the dialog's values are submitted, by something other than its form, with the game mode Edges and the
  grid type Hexagon
- **THEN** it is refused: "Grid type must be Rectangle for Edges."

#### Scenario: A game ID from before the split

- **WHEN** a params string with the mode letter `E`, `H` or any other is decoded
- **THEN** it names the board it always did
