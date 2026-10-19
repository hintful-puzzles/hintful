## MODIFIED Requirements

### Requirement: Hint: A Pattern run's overlap is shaded, and a cell no run reaches is clear

With each run packed as far to one end of its line as the line's marks
allow, and then to the other, the cells a run covers both ways SHALL be
shaded, and a cell no run covers anywhere between its two placings SHALL be
clear. Every cell of a line with no clues SHALL be clear. A step SHALL take
one unbroken stretch of undecided cells: of one run's overlap, or of the
cells out of reach.

#### Scenario: A run with no room to slide

- **WHEN** the hint's plan on the 10×10 board
  `8/6.1/4.1.1.1/4.1/4.3/2/2/2.2/2.1.2/1.2/3.2/3.2/5/5/2.2/5/1.2/3.1/6/8`
  reaches its third column, whose runs 4, 1, 1 and 1 fill the column with
  one gap between each
- **THEN** four steps shade the runs, each saying its run "has nowhere to
  slide", and three more clear the gaps, each saying "No run of this column's
  outlined clue can reach the ringed cell, so that cell must be clear."
