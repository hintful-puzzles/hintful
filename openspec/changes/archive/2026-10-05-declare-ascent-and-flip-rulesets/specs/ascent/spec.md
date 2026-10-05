## REMOVED Requirements

### Requirement: Ascent's presets are grouped by kind of board

**Reason**: It grouped the menu by hand, with a "Hex" heading and an "Edges" heading. Edges is a ruleset now, and the engine sections a ruleset game's menu.

**Migration**: "Ascent's rulesets are Ascent and Edges" below, which keeps the Edges presets apart and the one size of each hexagonal shape.

## ADDED Requirements

### Requirement: Ascent's rulesets are Ascent and Edges

Ascent SHALL declare two rulesets: Ascent, played on any of its four grids, and Edges, played on the Rectangle. The Custom dialog SHALL ask for the ruleset and the grid type as separate fields, the grid type offering the four grids and not Edges, and SHALL refuse Edges on any grid but the Rectangle with a sentence saying so. The params encoding SHALL be unchanged: one mode letter, `E` for Edges.

The Type menu SHALL hold a section for each ruleset. It SHALL offer one size of each hexagonal shape, Normal to Hard, in the Ascent section; other sizes are Custom's.

#### Scenario: Edges has its own section

- **WHEN** the player opens Ascent's Type menu
- **THEN** the Edges presets are in an "Edges" section of their own, and every
  other preset is in the "Ascent" section

#### Scenario: Edges is asked for on the Hexagon

- **WHEN** the Custom dialog is submitted with the game mode Edges and the grid
  type Hexagon
- **THEN** it is refused: "Edges is played on the Rectangle grid."

#### Scenario: A game ID from before the split

- **WHEN** a params string with the mode letter `E`, `H` or any other is decoded
- **THEN** it names the board it always did
