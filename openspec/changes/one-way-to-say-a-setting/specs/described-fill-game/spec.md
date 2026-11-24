## ADDED Requirements

### Requirement: A setting the params give is stated one way

A description SHALL state every setting its params give (a flag, a number or a choice, with its letter, its Custom field and what it gates) through one settings concept, and the description language SHALL NOT offer a second key for a setting of the same kind.

#### Scenario: A variation and a deal option

- **WHEN** one description has a modifier that adds a rule and an option that changes only the deal
- **THEN** both are stated as settings, differing in what they gate

### Requirement: A game ID is read and written by one codec

The params and description of a born game SHALL be encoded and decoded by one codec whose segment kinds are named for what they encode, and a byte layout upstream's IDs need SHALL be a property of a segment kind, never a segment kind of its own.

#### Scenario: An upstream ID with a quirk

- **WHEN** an upstream game ID with a layout only one game uses is loaded
- **THEN** it reads through a segment kind other games also use, with the quirk stated as that kind's property

## MODIFIED Requirements

### Requirement: A born game's run code may write a clue after a letter

A run-letter stream's code MAY name a kind whose digit follows it, written
straight after the code for a clue of that kind on its cell, absent where
it has none, and the reading SHALL refuse a digit past the kind's largest.

#### Scenario: Sticks' numbered block

- **WHEN** `4x1:B2_1_3a` is read
- **THEN** the first square is a block numbered 2, and the next two hold the
  numbers 1 and 3

### Requirement: A born game's run code may write another kind as a number

A run-letter stream's code MAY be a number, past the segment's own kind's
largest, that SHALL be read as a clue of another kind at its cell, and
written for one there.

#### Scenario: Bricks' 7

- **WHEN** `4x4:2b1c7c2_2b1` is read
- **THEN** the cell the 7 stands on is a hole, clear and fixed, and holds no
  number

### Requirement: A born game's ID may close and hide numbers and name values by letters

`numbers` SHALL write `hidden`'s character for a clue not shown and, where
`closed`, a comma after each. A run-letter stream SHALL write a cell kind's
values by codes, runs of empty cells `a` to `z` between them, and with
`lastRun: false` the last run dropped but for its whole runs of 26.

#### Scenario: An upstream Boats ID

- **WHEN** `6x6f3deS,3,2,1:2,2,1,1,0,4,1,-,3,1,-,1,WaWWgTLqWaW` is opened
- **THEN** its desc is written back the same
