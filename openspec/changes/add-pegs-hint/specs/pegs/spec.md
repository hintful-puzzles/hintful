## ADDED Requirements

### Requirement: Pegs' hint walks a line of jumps it has found, and says only what it checked

Pegs SHALL provide a `hint` that searches for a line of jumps leaving one peg and offers it one jump per step, ringing the peg that jumps and the hole it lands in. A step SHALL say the jump is the only one that can still finish only where every other jump from that position was searched to the end and found to lose; it SHALL outline a peg some other jump would leave where no peg can ever arrive beside it; and a jump by the peg that jumped last SHALL continue the same journey. The hint SHALL refuse with a sentence counting the pegs no jump can ever involve again when there are any and more than one peg is left, with `NO_SOLUTION_FROM_HERE` when the search proved no line finishes, and with `SEARCH_OUT_OF_REACH` when the search could not settle the position.

#### Scenario: A peg cut off

- **WHEN** a peg has no peg beside it and no peg can ever arrive beside it, and another peg remains
- **THEN** the hint refuses, says how many pegs are cut off, and asks the player to undo

#### Scenario: The only jump that can finish

- **WHEN** every jump but one from the position leaves a board no line of jumps finishes from
- **THEN** the step for the remaining jump says it is the only one from here that can still finish with one peg

#### Scenario: Following the hint from the dealt board

- **WHEN** the player follows every step from a dealt board of any preset
- **THEN** the board ends with one peg

### Requirement: Pegs' Solve finishes from the player's position, or else from the dealt board

Pegs SHALL provide `solve`, whose move leaves one peg on the square the search's line of jumps ends on. It SHALL search from the player's position first and, when that position is lost or past the search's reach, from the dealt board. It SHALL refuse with `NO_SOLUTION` only when the search proved the dealt board has no finish, and with `PUZZLE_NOT_REASONABLE` otherwise.

#### Scenario: A lost position

- **WHEN** the player's position cannot finish and the dealt board can
- **THEN** Solve leaves the one peg where a line of jumps from the dealt board ends
