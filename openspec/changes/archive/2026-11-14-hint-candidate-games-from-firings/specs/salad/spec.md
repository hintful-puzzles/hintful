## MODIFIED Requirements

### Requirement: Hint: Salad's hint counts a line before it asks for pencil marks

Salad's own steps SHALL sit in the walk's ladder in this order: a line
whose empty squares, or whose symbols, are all found, the rows before the
columns; a square whose marks are down to the empty-square mark or have lost
it; and the leftover empty-square mark of a circled square. They read no
pencil mark the board lacks, so the hint SHALL take them before it pencils in
the candidates. The border-clue deductions and the Latin ones are its ladder's
techniques, run on the notes, and SHALL wait for the candidates.

#### Scenario: A Number Ball board opens on a count

- **WHEN** a hint is asked on a Number Ball board with no pencil marks, one of
  whose rows has all its empty squares given as crosses and a blank square
  left
- **THEN** the first step is a line's count, and no step pencils anything in
  while a count is left to take

#### Scenario: An ABC End View board opens on the candidates

- **WHEN** a hint is asked on the dealt board `CfABcBc,p` of `4n3L`, which has
  no square marked
- **THEN** the first step pencils in the candidates, and the second is a
  border clue's

