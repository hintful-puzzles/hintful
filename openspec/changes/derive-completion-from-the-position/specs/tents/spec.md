## MODIFIED Requirements

### Requirement: Tents computes live errors and completion as upstream

`redraw` SHALL compute live error highlighting exactly as upstream
`find_errors`: diagonally- or orthogonally-adjacent tent pairs mark the
shared corner(s) with an error diamond; a row/column whose tent count exceeds
its clue or whose tents-plus-blanks fall below its clue marks that edge
number red; and, via two connected-component passes over the bipartite
tent/tree adjacency (a `dsf`), a tent in a component with fewer trees than
tents, or a tree in a component with more trees than tents-or-blanks, is
highlighted red. The board SHALL be reported complete exactly as upstream
`execute_move` judges it: the tent count equals the tree count, every edge
number is met, no two tents are adjacent, and the trees and tents admit a
perfect adjacency matching (bipartite `matching`). Completion SHALL be judged
from the board however it was reached, and the win flash SHALL NOT play for the
Solve command.

#### Scenario: Adjacent tents are flagged

- **WHEN** two tents are placed diagonally adjacent
- **THEN** the shared corner shows an error diamond

#### Scenario: An unmet clue is flagged

- **WHEN** a column already holds more tents than its edge number
- **THEN** that edge number renders red

#### Scenario: Completion requires a valid matching

- **WHEN** the tents match all edge numbers and are non-adjacent but no
  perfect tree↔tent matching exists
- **THEN** the state does not report completed
