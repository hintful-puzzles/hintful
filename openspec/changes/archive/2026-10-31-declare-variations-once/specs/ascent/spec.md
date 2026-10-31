## ADDED Requirements

### Requirement: Params: Edges is a rule a Classic board adds

Ascent SHALL offer Edges as a modifier, "Edge clues", which only a Classic
board takes: the Orthogonal and Hex rulesets SHALL hold it off. While it is on,
the board SHALL offer no Easy and no symmetrical clues.

#### Scenario: Edges is ticked and Hex chosen

- **WHEN** the player ticks Edge clues and then chooses the game mode Hex
- **THEN** Edge clues is shown off and disabled, and Easy is offered again

## MODIFIED Requirements

### Requirement: Params: One mode letter names an Ascent ruleset and its shape

The params encoding SHALL hold the ruleset, Edges and the board's shape, which
the Custom dialog asks for as separate fields, in one mode letter: `O` for
Orthogonal, `H` and `C` for Hex, `R` for Classic and `E` for Classic with
Edges. A string that names no mode SHALL decode as Classic.

#### Scenario: Hex is chosen in the dialog

- **WHEN** the player selects the game mode Hex on a Rectangle board
- **THEN** the board shape offers Honeycomb and Hexagon with Honeycomb chosen,
  and OK deals a Hex board

#### Scenario: A game ID from before the rulesets were split

- **WHEN** a params string with any mode letter, or with none, is decoded
- **THEN** it names the board it always did
