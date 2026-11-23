## ADDED Requirements

### Requirement: The candidate-note family is played from its descriptions

Solo, Salad, Group, ABCD, Undead, Magnets, Rome, Crossing and Map SHALL each
be dealt, drawn, played and hinted from its description on the fill board,
its directory under `src/games/` holding no TypeScript but tests, unless the
gap list sends a game to a later group of the route that builds what it
needs, naming the group.

#### Scenario: A moved game is its description

- **WHEN** a game of the nine has flipped
- **THEN** its directory holds its description and its `cases.yaml`, and no
  hand-written TypeScript

### Requirement: A born game with notes is walked over every unit it has

The candidate walk of a born game with notes SHALL read a value's places in
every unit of the board's space, rows, columns, diagonals and the blocks of
the partition among its units, beside the parts of each dealt partition a
rule holds distinct. A unit a modifier adds SHALL be a unit only of a board
the modifier is on. A partition among the units stated as `blocks(a, b)`
SHALL be cut by the engine from the board's sizes; a partition stated by
any other formula SHALL be refused.

#### Scenario: A single in a block or a diagonal

- **WHEN** a value has one place left in a block, or in a diagonal of a
  board with the diagonals' modifier on, and in no unit listed before it
- **THEN** the hint places it there, naming the block by its partition's
  name or the diagonal as a diagonal, and striping it whole

#### Scenario: A placed value's reach follows the modifier

- **WHEN** a value is placed with auto-pencil on, on a board in blocks with
  areas a rule holds distinct
- **THEN** it is struck from the notes of its row, column, block and area,
  and of its diagonal only where the diagonals' modifier is on; and the
  walk's words for that reach are the description's, chosen by the
  modifier as a flag by its name

#### Scenario: A partition by another formula is refused

- **WHEN** a description states a partition by a formula other than
  `blocks(a, b)` with each side a number or a size, or states one by
  formula that is not among its units
- **THEN** the description does not compile
