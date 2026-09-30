## MODIFIED Requirements

### Requirement: Subsets input, marking, mistakes and completion

Subsets SHALL be played by toggling individual letter slots within each cell. A
left-click or select SHALL cycle a slot unknown → known → cleared → unknown, a
right-click or secondary select SHALL cycle unknown → cleared → known → unknown,
and Backspace SHALL reset a slot to unknown; a given (immutable) slot SHALL NOT
change. A keyboard cursor SHALL navigate slots, skipping the gaps between cell
blocks. A move SHALL be modeled as a discriminated union, not a move string.

The game SHALL flag mistakes for Check & Save: a set-value placed in more than one
cell, any edge whose horseshoe (or missing-horseshoe disjointness) relation is
violated by two decided cells, and, when the board has a unique solution, any
set ruled out of the cell that solution puts it in, which is drawn in the mistake
color. A Solve action SHALL fill the board from the solver
unless the board is invalid, and SHALL complete the game as solved-with-help
without firing the win flash — a deliberate divergence from upstream, whose solve
move omits the completion bookkeeping (the collection convention wins). The board
SHALL be formattable as text. Rendering
SHALL show each cell's letter slots, the horseshoe arrows, a tally of every
set-value with its placement count, and a completion flash; there SHALL be no move
animation.

#### Scenario: Toggling a letter slot cycles its state

- **WHEN** a mutable letter slot is left-clicked repeatedly
- **THEN** it advances unknown → known → cleared and back to unknown, and a given
  slot does not change

#### Scenario: Completing the grid wins and flashes

- **WHEN** every set is placed exactly once so that all clues hold
- **THEN** the game is reported solved and flashes

#### Scenario: A duplicated placement is flagged as a mistake

- **WHEN** the same set-value is fully placed in two cells and mistakes are checked
- **THEN** both offending cells are reported as mistakes

#### Scenario: A wrong rule-out is a mistake

- **WHEN** a set is ruled out of the cell the unique solution puts it in
- **THEN** `findMistakes` reports that rule-out and the hint refuses
