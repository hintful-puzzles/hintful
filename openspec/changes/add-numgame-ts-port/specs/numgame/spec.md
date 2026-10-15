# numgame Specification Delta — add-numgame-ts-port

## ADDED Requirements

### Requirement: Rules: Numgame's board and what solves it

The board SHALL be six places, each holding a number or nothing, and a target. A move SHALL combine the numbers in two places with +, −, × or ÷, empty one place and put the result in the other, recording how it was made. The puzzle SHALL be solved when a number on the board equals the target, whichever place holds it.

#### Scenario: Making the target wins

- **WHEN** on `l4dh:100,75,50,25,6,3=952` the player makes 23800 and then divides it by 25
- **THEN** the place that held 23800 holds 952 and the game's status is solved

### Requirement: Rules: Every result is a positive whole number

A combination SHALL be a move only where its result is a positive whole number. − and ÷ SHALL take the smaller number from or into the larger. The result SHALL take the larger number's place, the lower place between equals, and the smaller's place SHALL be emptied, so the order the two were picked in changes nothing. A subtraction of equal numbers and a division with a remainder SHALL NOT be moves.

#### Scenario: Subtraction takes the smaller from the larger

- **WHEN** 3 is combined with 75 by −, 3 picked first
- **THEN** the result is 72, in 75's place, and 3's place is empty

#### Scenario: A division with a remainder is refused

- **WHEN** 75 is combined with 6 by ÷
- **THEN** no move is made

### Requirement: Params: Numgame's params are its declared codec's

The params SHALL be how many of the six numbers are large (0 to 4) and the tier, written `l<large>d<tier letter>` with the tier letters `e`, `n`, `t` and `h`. The tier SHALL be written only in the full form; a string without it SHALL decode to Normal.

#### Scenario: A params string round-trips

- **WHEN** `l2dt` is decoded and encoded in full
- **THEN** the result is `l2dt`, two large numbers at Tricky

### Requirement: Description: Six numbers and a target

A description SHALL be the six numbers, comma-separated, each from 1 to 100, then `=` and the target, from 1 to 9999. Anything else SHALL be refused. A description whose numbers cannot make its target SHALL NOT load.

#### Scenario: The famous board loads

- **WHEN** `100,75,50,25,6,3=952` is loaded
- **THEN** the places hold 100, 75, 50, 25, 6 and 3 and the target is 952

#### Scenario: An unreachable target is refused

- **WHEN** `1,1,2,2,3,3=952` is loaded
- **THEN** it is refused as having no solution

### Requirement: Generation: A tier is the fewest operations the target needs

A board SHALL be dealt as Countdown deals its cards: the large numbers drawn without replacement from 25, 50, 75 and 100, the rest from two each of 1 to 10, large numbers first. Its target SHALL be a number from 100 to 999 whose fewest operations are exactly the tier's: two at Easy, three at Normal, four at Tricky, five at Hard. Every count of large numbers SHALL deal every tier.

#### Scenario: A Hard board needs five operations

- **WHEN** a board is dealt at Hard
- **THEN** its target can be made in five operations and in no fewer

### Requirement: Solver: The solver finds the fewest operations to every value

The solver SHALL find, for the numbers on the board, every value they can make and the fewest operations each needs, and a calculation of each in that many operations. Solve SHALL play a shortest line from the board as played where one exists, and otherwise from the numbers as dealt.

#### Scenario: Solve starts again from a lost board

- **WHEN** the player has combined numbers so that the target can no longer be made, and presses Solve
- **THEN** the board is solved from the numbers as dealt

### Requirement: Controls: A number, an operator and another number make a move

A tap on a number SHALL select it, or deselect it if selected, or move the selection while no operator is chosen. A tap on an operator with a number selected SHALL choose or unchoose it. A tap on a number with both chosen SHALL make the move where it is legal. The keys `+ - * x /` SHALL choose an operator, first selecting the number under the cursor where none is. Escape SHALL drop the selection, and every board change SHALL clear it.

#### Scenario: Three taps make a move

- **WHEN** the player taps 100, then +, then 6
- **THEN** 100 + 6 is played and 106 stands in 100's place

### Requirement: Hint: One operation of a shortest line, and no more

A hint SHALL give one combination: of the shortest line from the board on display, one whose two numbers are on the board, the one working on the biggest number. It SHALL say the fewest operations the target needs and offer the combination as one of them, or, where it is the last, that it makes the target. It SHALL ring the two numbers and the operator, and SHALL say nothing more of the line.

#### Scenario: The famous board's hint

- **WHEN** a hint is asked on `l4dh:100,75,50,25,6,3=952`
- **THEN** it reads "952 needs at least 5 operations. One of them: 100 + 3 = 103."

### Requirement: Hint: A lost board is refused with the way back

Where the numbers on the board can no longer make the target, the hint SHALL refuse, saying so and that Undo takes the player back to where they could.

#### Scenario: Multiplying away the target

- **WHEN** on `l4dh:100,75,50,25,6,3=952` the player has made 375000 from 100, 75 and 50
- **THEN** a hint says the numbers left can no longer make 952

### Requirement: Look: A made number says how it was made

A number the player made SHALL show beneath its value the operation that made it, larger operand first. A number SHALL sit on the given surface whether dealt or made. With a number and an operator chosen, the numbers they cannot combine with SHALL be grayed. A move SHALL slide the smaller number onto the larger's place.

#### Scenario: A made number shows its sum

- **WHEN** 100 and 6 are added
- **THEN** the new tile reads 106, with `100 + 6` beneath it
