## RENAMED Requirements

- FROM: `### Requirement: Controls: A stroke from a number draws its line ahead again`
- TO: `### Requirement: Controls: A stroke from a number or along a line draws the line ahead again`

## MODIFIED Requirements

### Requirement: Controls: A stroke from a number or along a line draws the line ahead again

A drag that begins on a number, or on a square in the middle of a line, SHALL replace the line ahead of it, to that line's end, once it lays a line: on release, each of those lines it does not lay again SHALL be taken up. Until then it SHALL change nothing. Under Path, ahead SHALL be the side the numbers rise along; under Pairs, a number's whole line, or the side away from the one number the line meets. Where that does not decide, ahead SHALL be the side the drag sets off along.

#### Scenario: A stroke from the 2 keeps the line from the 1

- **WHEN** on `4x3zde:1f2_3b4` the whole answer is drawn, and a drag from the 2 runs straight down to the 4
- **THEN** the line from the 1 to the 2 stays, every line on from the 2 is taken up, and the edge from the 2 down to the 4 is drawn

#### Scenario: A slip along the line keeps it

- **WHEN** on the same board, with the whole answer drawn, a drag from the 2 follows its line one square and is released
- **THEN** no move is made

#### Scenario: A loose line from a middle number stays

- **WHEN** on `4x3zde:1f2_3b4` a line is drawn from the 3 up toward the 2, reaching no number, and a drag from the 3 runs right to the 4
- **THEN** the line from the 3 up stays, and the drag's lines are drawn

#### Scenario: A stroke from between the 2 and the 3 redraws on through the 3

- **WHEN** on `4x3zde:1f2_3b4` the whole answer is drawn, and a drag from the middle row's second square runs down one square
- **THEN** the line from there on through the 3 to the 4 is taken up, the line back to the 2 stays, and the edge down is drawn

### Requirement: Controls: A drag draws a line through the squares it passes

A press and drag with the left button SHALL draw a line along each edge between the squares it passes, a rook move at a time, keeping the lines already there, as the engine's line drag does, and taking back the steps it retraces over its end. A drag from a line's loose end that passes only edges holding lines SHALL take them up. It SHALL stop where an edge is crossed or where its line would give a square more lines than it takes. A left click near an edge SHALL draw or remove its line.

#### Scenario: A drag draws a line

- **WHEN** on `4x3de:1_2_1c2e` the left button is pressed on the top 2, dragged down one square and right one square, and released
- **THEN** lines are drawn on edges 10 and 4, and the move is one step of Undo

#### Scenario: A drag along a line and past its end carries it on

- **WHEN** a drag starts along a line the player has drawn and goes on past its end
- **THEN** the line is kept and carried on along the drag, not taken up
