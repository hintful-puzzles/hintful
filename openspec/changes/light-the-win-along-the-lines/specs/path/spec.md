## ADDED Requirements

### Requirement: Look: The win travels the lines in the numbers' order

The win flash SHALL travel the board's lines: under Path, the one line from the 1 to the highest number; under Pairs, each pair's line in turn from the 1s up, starting from the pair's first square in reading order.

#### Scenario: Path's win runs from the 1

- **WHEN** on `4x3zde:1f2_3b4` the whole answer is drawn and the win flash runs
- **THEN** it reaches the squares in the line's order: along the top row, down to the 2, back along the middle row, down to the 3 and on to the 4

#### Scenario: Pairs' win runs the 1s' line, then the 2s'

- **WHEN** on `4x3de:1_2_1c2e` the whole answer is drawn and the win flash runs
- **THEN** it runs from the top-left 1 round to the other 1, and then from the top 2 to the other 2
