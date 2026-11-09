## MODIFIED Requirements

### Requirement: Controls: A stroke from a number draws its line ahead again

A drag that begins on a number SHALL replace the line that runs on from it, to that line's end, once it leaves that line: on release, each of those lines the drag does not lay again SHALL be taken up. A drag that only retraces it SHALL change nothing. Under Path, a side whose first number is lower SHALL stay, and a side reaching no number SHALL be replaced only where it must run on. Under Pairs the whole line is replaced.

#### Scenario: A stroke from the 2 keeps the line from the 1

- **WHEN** on `4x3zde:1f2_3b4` the whole answer is drawn, and a drag from the 2 runs straight down to the 4
- **THEN** the line from the 1 to the 2 stays, every line on from the 2 is taken up, and the edge from the 2 down to the 4 is drawn

#### Scenario: A slip along the line keeps it

- **WHEN** on the same board, with the whole answer drawn, a drag from the 2 follows its line one square and is released
- **THEN** no move is made

#### Scenario: A loose line from a middle number stays

- **WHEN** on `4x3zde:1f2_3b4` a line is drawn from the 3 up toward the 2, reaching no number, and a drag from the 3 runs right to the 4
- **THEN** the line from the 3 up stays, and the drag's lines are drawn
