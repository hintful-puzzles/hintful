## REMOVED Requirements

### Requirement: Solver: The segment-reachability look-behind bounds are kept

**Reason**: They were kept so the generator's solver matched upstream's power byte for byte. The solver is the described ladder, whose `reach` reads every cell beyond, and the boards it deals are upstream's on every fixture and on 240 seeded boards; the live overlay reads room as the ladder does.
**Migration**: "Solver: Sticks' ladder reads a number's room as the cells its line could still take".

### Requirement: Hint: The Sticks hint takes the first forced square in reading order

**Reason**: The hint walks the compiled ladder's firings, taking the one that carries on from its last step, as every ladder hint does.
**Migration**: "Hint: The Sticks hint carries on from its last step, by the rules in order".

## ADDED Requirements

### Requirement: Solver: Sticks' ladder reads a number's room as the cells its line could still take

A number's room SHALL be the run through it, along its line's way, of the cells that are no block, hold no line the other way, and with a line that way would carry no number but its own; the live error overlay SHALL read room the same way on the board as it stands.

#### Scenario: A line beside another number's line is no room

- **WHEN** a 3 has a horizontal line, and the blank square beside it has, beyond it, a horizontal line carrying a 1
- **THEN** that blank square is not counted as the 3's room

### Requirement: Hint: The Sticks hint carries on from its last step, by the rules in order

`hint` SHALL take, of the numbers that a line one way in a blank square would break, the one whose firing carries on from the squares its last step decided, and otherwise the first by its rule and then by the number's place in reading order. One firing SHALL be one journey, every square that number and rule force on that board.

#### Scenario: A dealt board's first steps

- **WHEN** a hint is asked for on the 5×5 board `3bB1b5c2aB3c2a2_2aB2b1` with no line placed
- **THEN** the first step makes the top-left square, the 3, horizontal, since a vertical line there would leave it only 2 squares
- **AND** the next journey makes the second and third squares of the top row horizontal, both by that 3, and the journey after it reasons from the 1 block

### Requirement: Hint: Sticks' rules are taken in order

The rules a supposed line breaks SHALL be taken in this order: a block with more lines than its number, a line over two numbers, a line longer than its number, a block left too few open sides, a line with too little room.

#### Scenario: A line that would join two numbers

- **WHEN** a line in a square would join a 2's line to a 1's, which is also too long for each
- **THEN** the step speaks of the two numbers joined
