## MODIFIED Requirements

### Requirement: Hint: A bar is read against a neighbor that is still undecided

In Adjacent mode the hint SHALL rule out of a cell each number that fits none
of the numbers still open in a neighbor: across a bar, a number with nothing
open one away from it there, and across a gap with no bar, a number that every
open number there equals or is one away from. It SHALL say "A bar joins this
cell to its neighbor with nothing open one away from" those numbers, or "No bar
joins this cell to its neighbor, whose numbers all clash with" them.

#### Scenario: A bar beside a neighbor down to two numbers

- **WHEN** a bar joins a cell that can still be 1 to 5 to a neighbor whose
  open numbers are 1 and 2
- **THEN** 4 and 5 are ruled out of the cell and 3 is kept, the neighbor's 2
  being one away from it
- **AND** the sentence says the neighbor has nothing open one away from 4 or 5

#### Scenario: A cell with no pencil marks

- **WHEN** the step's cell has no pencil marks and the hint reads an unmarked
  cell as holding every number its row and column do not
- **THEN** the step pencils in the numbers left, and its sentence ends "so this
  cell can only be" those numbers after the same premise
