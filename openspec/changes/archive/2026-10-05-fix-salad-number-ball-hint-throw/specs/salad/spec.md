## ADDED Requirements

### Requirement: Salad's hint teaches every deduction that rules a square out as empty

Salad's hint SHALL teach each deduction that rules a square out as empty, on every board Salad deals at either difficulty. Where a line already holds all its empty squares, the hint says so as a count and marks the line's other squares as holding a symbol. Where a set elimination or a forcing chain rules a square out as empty, no count says it, so the hint SHALL strike that square's "might be empty" pencil mark with the set or chain as its reason, and SHALL then mark the square as holding a symbol because the mark is gone from its notes.

A sentence that names the "might be empty" mark among a square's candidates SHALL print it as the X the player pencils for it, never as a letter or a number past the board's symbols.

#### Scenario: A set holds all of a column's empty squares

- **WHEN** a hint is requested on the Number Ball board
  `5n3Bdx:c2b1aOXbXb3c1OOc`, where three squares of one column can hold only
  one number and the column's two empty squares
- **THEN** the hint returns a plan, a step of it strikes the "might be empty"
  mark from another square of that column and names the set and the column's
  empty squares as the reason, a later step marks that square as holding a
  number, and following the plan solves the board

#### Scenario: The mark is gone from a square's notes

- **WHEN** a square with pencil marks has lost its "might be empty" mark and
  carries no marker
- **THEN** the hint's step marks it as holding a symbol and says the mark is
  not among the square's pencil marks

#### Scenario: A chain runs through the "might be empty" mark

- **WHEN** a board with one empty square per line reaches a forcing chain whose
  squares include the "might be empty" mark among their two candidates
- **THEN** the sentence prints that mark as X and counts the squares'
  candidates as pencil marks
