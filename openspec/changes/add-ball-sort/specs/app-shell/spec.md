## ADDED Requirements

### Requirement: The type is one chip

The readout row SHALL show the board's type as one chip holding its whole
label, qualifiers after a comma included. The chip is the trigger of one
menu whose presets set every field at once, so the label SHALL NOT be split
into boxes that read as choices to be made apart.

#### Scenario: A type with a qualifier

- **WHEN** a Mines board of "9x9, 10 mines" is open
- **THEN** the row shows one chip reading "9x9, 10 mines"

### Requirement: The Custom dialog says a limit the player meets

A numeric field whose max is a limit of the game a player meets, such as
the colors it has, SHALL be labeled in the Custom dialog with that max,
written from the declared bound; a refusal SHALL still name the field alone.

#### Scenario: Ball Sort's colors

- **WHEN** a player opens Ball Sort's Custom dialog
- **THEN** the colors field reads "Colors (up to 10)"
- **AND** asking for 11 is refused with "Colors must be at most 10."
