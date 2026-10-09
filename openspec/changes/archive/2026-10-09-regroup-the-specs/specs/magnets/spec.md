## MODIFIED Requirements

### Requirement: Magnets flags mistakes against the unique solution

Because a generated board is uniquely solvable, the game SHALL implement
`findMistakes`: re-solve from the dominoes and the row and column counts, and
return every player-set cell whose content contradicts the unique solution, and
every cell of a domino marked `?` that is neutral in it, since the hint reads a
`?` as a fact. Empty cells, and a `?` on a domino that is a magnet in the
solution, SHALL never be flagged.

#### Scenario: A wrong placement is flagged

- **WHEN** the player sets a domino to a polarity the unique solution
  contradicts, without yet violating adjacency or a count
- **THEN** `findMistakes` includes that cell and Check & Save refuses to save

#### Scenario: A `?` on a neutral domino is flagged

- **WHEN** the player marks `?` on a domino that is neutral in the unique
  solution
- **THEN** `findMistakes` includes its cells, and the hint refuses until the
  mark is fixed
