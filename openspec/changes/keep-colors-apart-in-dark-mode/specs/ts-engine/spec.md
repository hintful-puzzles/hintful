## ADDED Requirements

### Requirement: Colors a game paints side by side stand apart in the dark scheme

Two palette colors that a game's frames paint next to each other SHALL stand at
least a stated distance apart in the dark scheme as the app paints it, measured
between the two colors within that scheme. The pairs SHALL be read off the
game's own draw record, so that a game is covered by being registered.

Two filled areas owe the distance outright. A thin mark or a glyph owes it only
where the light scheme gives the same pair at least twice the distance, since a
quiet grid line is quiet in both schemes on purpose. A pair that is closer on
purpose SHALL be recorded with what it is, one entry per pair, and an entry
whose pair is no longer close SHALL fail.

#### Scenario: A wall that sinks into the floor fails

- **WHEN** a movement game's wall and floor are painted as adjacent areas
- **AND** the wall's dark value stands closer to the floor than the stated
  distance
- **THEN** the cross-game guard fails and names the game and the pair

#### Scenario: A new game is covered without being listed

- **WHEN** a game is added to the catalog
- **THEN** its frames are measured by the same guard with no edit to the guard

#### Scenario: An excused pair that stops being close fails

- **WHEN** a recorded pair's dark distance rises above the stated distance, or
  the game stops painting the pair
- **THEN** the guard fails until the entry is removed

### Requirement: A dark-mode swap names a bevel's highlight and its lowlight

Each `paletteSwaps` pair SHALL address two palette indices whose `COL_*`
constants in the game are a highlight and the lowlight of the same name, unless
the pair is recorded as exchanging something else, with what it exchanges.

#### Scenario: A pair left behind by a moved index fails

- **WHEN** a color is added or dropped above a game's bevel so that its indices
  move
- **AND** the game's `paletteSwaps` pair still names the old indices
- **THEN** a test fails and names the two constants the pair now addresses
