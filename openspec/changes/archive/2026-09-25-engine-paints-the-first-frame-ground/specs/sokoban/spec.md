## MODIFIED Requirements

### Requirement: Sokoban rendering

Sokoban SHALL render each cell as its content — walls with a beveled face, targets,
pits, deep pits, the player and barrels as discs, and labeled barrels with their
letter — over grid lines drawn once, on the ground the midend lays. Moves SHALL be
applied instantly (there is no walk or push animation), and the board SHALL flash on
completion.

#### Scenario: A completed board flashes

- **WHEN** a move transitions the board from not-completed to completed
- **THEN** the board flashes for the completion flash duration and then settles

#### Scenario: A labeled barrel shows its letter

- **WHEN** the board contains a capital-letter barrel
- **THEN** that barrel is drawn with its letter label
