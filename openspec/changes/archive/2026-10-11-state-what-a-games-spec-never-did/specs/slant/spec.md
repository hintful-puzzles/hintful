## ADDED Requirements

### Requirement: A Slant difficulty letter that is missing or unknown reads as Easy

`decodeParams` SHALL read a string with no `d` segment, and one whose `d` is
followed by a letter other than `e` or `h`, as the default difficulty, Easy,
and SHALL NOT refuse it.

#### Scenario: The short form of a Normal preset

- **WHEN** `5x5`, the short form of the preset `5x5dh`, is decoded
- **THEN** the params are 5 by 5 at Easy, the board `5x5de` names
- **AND** `5x5dh` with its `h` written `x` decodes to the same board and is
  not refused

### Requirement: A Slant clue above 4 is refused

`newState` SHALL refuse a description holding a digit from `5` to `9`, as a
number out of range and not as an unknown character: a point has four squares
round it at most.

#### Scenario: A 5 where a 0 was

- **WHEN** `1a0a11a22a3b22b1a1g330a1b1a` is loaded on a `5x5de` board with
  its first `0` written `5`
- **THEN** it is refused as holding a number out of range for its board

### Requirement: Slant refuses a grid too large to count

`validateParams` SHALL refuse a width times height past the largest whole
number the app counts exactly, whether or not the board is to be dealt, with
the collection's sentence "Width times height must not be unreasonably large."

#### Scenario: A height of sixteen digits

- **WHEN** `5x5de` is entered with its height written `9007199254740991`
- **THEN** the params are refused with that sentence

### Requirement: Slant's hint steps come in the order its solver finds them

The hint's square steps SHALL come in the order the solver forces them from
the player's position. Clues are read first, row by row. Only when no clue
forces a square are the empty squares read, for a slant that would close a
loop, join two dead ends, or differ from a placed square marked alike with it;
where several hold, the step names the last of them that does. Only then are
v-shapes read, which join pairs and force no square. A pass that forces
anything starts the clues again.

#### Scenario: A clue comes before a loop

- **WHEN** one clue has exactly as many empty squares as lines left, and an
  empty square elsewhere would close a loop if slanted one way
- **THEN** the plan's first step is the clue's

### Requirement: Slant's hint uses every technique at either difficulty

The hint SHALL plan with the Normal solver's techniques on every board, an
Easy one included, so that a same-slant mark the player has put down is used
whatever the board's difficulty.

#### Scenario: A mark is used on an Easy board

- **WHEN** on the Easy board `5x5de:1a0a11a22a3b22b1a1g330a1b1a` the clues
  force nothing more, and an empty square is marked as slanting alike with a
  drawn one
- **THEN** the reading of the squares that follows gives it the drawn
  square's slant, citing the mark
