## RENAMED Requirements

- FROM: `### Requirement: The pencil-mode indicator is legible against the canvas and never covers the board`
- TO: `### Requirement: The pencil-mode indicator is legible against the canvas`

## REMOVED Requirements

### Requirement: One note-taking vocabulary across games

**Reason**: Its scenario "A game whose notes are a cube" called a candidate cube
of `n` slots per cell conforming, and named ABCD. No game keeps one: every
`pencil` array, ABCD's included, holds one bitmask per cell or region, and the
shared Mark-all guard reads it that way.

**Migration**: Replaced by "One note-taking vocabulary and one layout across
games".

## ADDED Requirements

### Requirement: One note-taking vocabulary and one layout across games

A game holding the player's provisional candidate marks SHALL keep them in a
typed array named `pencil`, the word the engine uses everywhere else it speaks
about notes, so that shared code and cross-game guards read a game's notes
without being told per game where they live. Each element SHALL be one
candidate bitmask: of a cell, or of a region where regions are what the player
fills. The element type SHALL stay the game's own.

#### Scenario: A game whose notes belong to regions

- **WHEN** a game's player marks candidates on regions and not on cells, as in
  Map
- **THEN** its `pencil` array holds one bitmask per region, and it conforms as
  a game keeping one bitmask per cell does

## MODIFIED Requirements

### Requirement: A sticky notes mode is visible on the board

Every game that takes notes SHALL show the pencil-mode indicator in the
engine's corner, reserving the room for it, by a border wide enough or by a
canvas grown to make one, because a sticky mode whose state cannot be seen is a
mode the player cannot trust. The population SHALL be the one the Marks key is
offered by, so a game given the key is held to showing what the key did.

#### Scenario: A latched mode can be read off the board

- **WHEN** a player latches pencil mode in any game that takes notes, and no
  cell is highlighted
- **THEN** the glyph in the engine's corner shows that the mode is on
