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

### Requirement: A born game is graded on each of its scales

A born game whose description names scales besides its tiers SHALL run its
ladder, for a deal, a solve, a hint and a search alike, capped at the
board's tier and at the top of each other scale. Its deal SHALL keep only a
board that needs the asked tier and, on each other scale its ladder has an
entry of, the top of that scale: the scale's tier under its top, with the
asked tier, does not finish it. A board of a search tier SHALL be held on
the tiers alone.

#### Scenario: A board needs the top of the other scale

- **WHEN** a board of a game with a second scale is dealt at any tier but
  the search's
- **THEN** its ladder finishes it at the asked tier with the other scale at
  its top, and does not with the other scale a tier under its top

#### Scenario: A hint reads the other scale

- **WHEN** a hint is asked on such a board
- **THEN** the walk may take a technique of the other scale up to its top,
  and hints the board to the end

### Requirement: A born game's blocks may be dealt in equal parts

A born game's partition among its units MAY be dealt, the board's space
then taking its blocks from the board's clues. `deal.divide` with `equal`
SHALL tile the board with connected parts of that many cells, and a desc
whose parts of that partition are not all of that size SHALL be refused.
`deal.divide` MAY list several partitions, divided in turn, and the answer
SHALL be searched under them all.

#### Scenario: Jigsaw blocks and cages

- **WHEN** a born game whose blocks are divided into parts of the board's
  width and whose cages are divided after them deals a 5×5 board
- **THEN** five connected blocks of five tile it, every row, column and
  block holds 1 to 5 once, and no cage repeats a number

#### Scenario: Blocks walled, cages inset, diagonals stroked

- **WHEN** such a board is drawn, with the diagonals' modifier on
- **THEN** its blocks are drawn as walls, its cages as dashed outlines
  inset inside the squares with each cage's sum at its first square clear
  of the dashes, and each diagonal as a line corner to corner

#### Scenario: Blocks of unequal size are refused

- **WHEN** a desc of such a game writes a 4×4 board's blocks as one of
  eight cells and two of four
- **THEN** the desc is refused as malformed

### Requirement: A born game's clues may keep a symmetry the player chooses

A born game's deal MAY hide a clue kind at cells keeping a symmetry, one
named by what it keeps or the one a deal option's choice names. A clue
SHALL be hidden with the clues of its orbit still shown, and one a square of
whose orbit holds none SHALL not be shown.

#### Scenario: Givens closed under the chosen symmetry

- **WHEN** a board is dealt with any of Solo's eight symmetries chosen
- **THEN** every square the symmetry takes a given's square to holds a
  given

### Requirement: A deal option may be written by its choices' codes

A deal option with no letter SHALL write its choice's code in a full game
ID, after the modifiers' letters, and nothing for its default; reading an
ID, the default's code or none SHALL give the default.

#### Scenario: Upstream solo.c's symmetry suffix

- **WHEN** a board with the diagonals' modifier and 4-way mirror symmetry is
  written as a full game ID
- **THEN** the ID ends `xm4` and its tier, and `r2` or no suffix reads as the
  default 2-way rotation

### Requirement: A born game may be sized by its blocks

A born game whose blocks are `blocks(a, b)` of two sizes, the grid `a * b`
on a side, MAY be sized by them (`play.blocks`). Its params SHALL give the
blocks across and down, written as upstream solo.c writes them, `{b}x{a}`,
or `{b}` and a letter where the blocks are one square wide, and a bare
number SHALL read as that many both ways. The variation that deals the
blocks SHALL be on exactly where they are one square wide; only there SHALL
the board deal them, and its desc write them.

#### Scenario: Jigsaw read as upstream writes it

- **WHEN** the params `5j` or `2x3` are read
- **THEN** the first is a 5×5 board that deals its blocks, the second a 6×6
  board of blocks 3 wide and 2 tall that deals none and writes none in its
  desc

### Requirement: The Custom dialog of a board sized by its blocks

The Custom dialog of a board sized by its blocks SHALL offer the blocks
across and down, and after them the game mode, which folds the blocks into
dealt ones and back to the squarest blocks of the order.

#### Scenario: The game mode folds the blocks

- **WHEN** the Custom dialog's game mode is set to the dealt blocks on a
  `2x3` board, and back
- **THEN** the board is a 6×6 dealing its blocks, then `2x3` again, with any
  modifier left as it was
