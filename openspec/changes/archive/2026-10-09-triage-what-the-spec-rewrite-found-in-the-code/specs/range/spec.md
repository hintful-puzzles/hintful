## ADDED Requirements

### Requirement: Range loads only a board its three rules finish

Range SHALL declare `finishesByDeduction`, true exactly when the three rules
alone decide every cell of the board's clues and break no rule, so that a
description with several answers, or one that needs search, SHALL NOT load.
`solve` keeps the first completion it meets and cannot tell such a board from
a dealt one, and `findMistakes` would call a mark that fits another answer a
mistake.

#### Scenario: A description with several answers

- **WHEN** the description `c6h3_6b` of a 4×4 board, which has three answers,
  is loaded
- **THEN** it is refused as a puzzle that needs trial and error

#### Scenario: A dealt board loads

- **WHEN** a description the generator wrote is loaded
- **THEN** it is not refused
