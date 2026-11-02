## ADDED Requirements

### Requirement: Generation: Magnets' ladder keeps a tile's two ends opposite

Magnets' ladder SHALL be compiled from its description, and every technique SHALL be checked sound. At either tier, as a value is placed, the other end of its tile SHALL take the opposite and a pole SHALL leave the squares beside it; as a value is struck from one end of a tile, the opposite SHALL be struck from the other.

#### Scenario: A pole placed

- **WHEN** the solver places `+` at one end of a tile
- **THEN** the other end holds `−`, `+` is ruled out of the squares beside the first end, and `−` out of those beside the other

## MODIFIED Requirements

### Requirement: Generation: The deductions of Magnets' Easy tier

The Easy tier SHALL perform: a square down to one value takes it; a line's count of a value, read for each value in turn, rules the value out of its open squares once met, and places it in each square that can take it once just reachable; and a line with every neutral square placed, needing one more of a pole than of the other, places that pole at the start of its one odd-length stretch of open squares.

#### Scenario: A met count clears its line

- **WHEN** a column already holds all the `+` its clue allows
- **THEN** the solver at Easy rules `+` out of the column's other squares

### Requirement: Generation: The deductions of Magnets' Normal tier

The Normal tier SHALL add: a line whose count of a pole the magnets lying along it make up rules the pole out of its other open squares; a line with room for one more neutral square rules neutral out of every open tile along it; a line needing as many of a pole as it has open tiles rules neutral out of its open squares; and where those tiles are the ones able to bring the pole, a tile with one end in the line able to take it takes it there.

#### Scenario: Easy stops short of them

- **WHEN** the solver is run at Easy
- **THEN** none of the deductions the Normal tier adds is applied
