## ADDED Requirements

### Requirement: Salad's hint pencils the candidates in and offers no other reading

Salad's hint SHALL walk the populate reading only: before its first step
that reads a pencil mark, it SHALL pencil the candidates into every undecided
square that has none, by the fill-all action, and it SHALL NOT write a
square's marks one square at a time. Salad SHALL NOT offer the `hint-notes`
preference, because the "might be empty" mark is a candidate no row or column
rules out.

#### Scenario: Salad has no hint-notes preference

- **WHEN** Salad's preferences are listed
- **THEN** `hint-notes` is not among them

#### Scenario: No step writes one square's marks

- **WHEN** a hint plan is built on a board with no pencil marks whose first
  deduction is a border clue's
- **THEN** the step before it is the fill-all, and no step of the plan
  pencils marks into a single square

### Requirement: Salad's hint takes a marker on the board as settled

Salad's hint SHALL reason from the symbols and the empty and not-empty
markers on the board, the player's included, since the mistake check flags a
wrong one, and SHALL NOT take the player's pencil marks as facts. A square
marked empty or not-empty SHALL count as decided: the hint SHALL give no step
that settles it again, and SHALL NOT hold back a step whose reason reads that
square.

#### Scenario: The player's cross is counted

- **WHEN** the player correctly marks a blank square empty, so that its row
  now shows all its empty squares, and asks for a hint
- **THEN** no step of the plan marks that square, and a step may rest on the
  row holding all its empty squares

#### Scenario: A pencil mark is not a fact

- **WHEN** the player strikes pencil marks the board does not yet rule out,
  none of them a square's answer, and asks for a hint
- **THEN** every step's reason holds on the symbols, markers and clues alone,
  and the plan solves the board
