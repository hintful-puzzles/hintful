## ADDED Requirements

### Requirement: Pegs' hint sets the jump it offers against the jumps that lose, and says only what it checked

Pegs SHALL provide a `hint` that searches for a line of jumps leaving one peg and offers its first jump, ringing the peg that jumps and the hole it lands in, and judging the other jumps from the same position within a work allowance per request. Where another jump would leave a peg that no peg can ever arrive beside, at once or after any jump that follows it, the step SHALL stripe that jump and outline that peg. Where the line opens with three or six jumps that empty a line of three or a two-by-three block and leave every other peg where it began, the hint SHALL offer those jumps as one journey with the shape striped. Otherwise, where some other jump was proved unable to finish, the step SHALL draw an arrow on each other jump a finish was found after, and SHALL say only these can finish only when no other jump was left unsettled. A step SHALL say every jump can still finish only where a finish was found after each one. Where nothing about the other jumps is settled, a step SHALL call a peg stranded only where no peg is beside it, either now, with the offered jump landing beside it, or after another jump that the step stripes, with a peg still beside it after the offered jump; and it SHALL NOT say that such a jump loses. The hint SHALL refuse with a sentence counting the pegs no jump can ever involve again when there are any and more than one peg is left, with `NO_SOLUTION_FROM_HERE` when the search proved no line finishes, and with `SEARCH_OUT_OF_REACH` when the search could not settle the position.

#### Scenario: A peg cut off

- **WHEN** a peg has no peg beside it and no peg can ever arrive beside it, and another peg remains
- **THEN** the hint refuses, says how many pegs are cut off, and asks the player to undo

#### Scenario: A jump that would cut a peg off

- **WHEN** some jump other than the one offered would leave a peg that no peg can ever arrive beside
- **THEN** the step stripes that jump, outlines that peg, and says the striped jump would cut it off

#### Scenario: A stranded peg

- **WHEN** nothing about the other jumps is settled, a peg has no peg beside it, and the offered jump lands beside it
- **THEN** the step outlines that peg, calls it stranded, and asks the player to go back for it

#### Scenario: The only jump that can finish

- **WHEN** every jump but one from the position leaves a board no line of jumps finishes from
- **THEN** the step for the remaining jump says it is the only one from here that can still finish with one peg

#### Scenario: A jump the search could not settle

- **WHEN** some other jump was proved to lose and another was neither found to finish nor proved to lose within the allowance
- **THEN** the step draws arrows only on jumps a finish was found after, and does not say that only those can finish

#### Scenario: Following the hint from the dealt board

- **WHEN** the player follows every step from a dealt board of any preset
- **THEN** the board ends with one peg

### Requirement: Pegs' Solve finishes from the player's position, or else from the dealt board

Pegs SHALL provide `solve`, whose move leaves one peg on the square the search's line of jumps ends on. It SHALL search from the player's position first and, when that position is lost or past the search's reach, from the dealt board. It SHALL refuse with `NO_SOLUTION` only when the search proved the dealt board has no finish, and with `PUZZLE_NOT_REASONABLE` otherwise.

#### Scenario: A lost position

- **WHEN** the player's position cannot finish and the dealt board can
- **THEN** Solve leaves the one peg where a line of jumps from the dealt board ends
