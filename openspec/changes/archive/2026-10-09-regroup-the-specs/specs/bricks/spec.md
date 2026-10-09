## ADDED Requirements

### Requirement: A Bricks hint is refused on a board that contradicts its solution without breaking a rule

A hint SHALL be refused, with an explanatory banner, when the player's placed
cells contradict the unique solution without yet breaking a local rule, which
`findMistakes` does not report. The banner SHALL say a placed cell must be
wrong, and the hint SHALL NOT deduce onward from a doomed position.

#### Scenario: A hint is refused on a wrong-but-legal board

- **WHEN** a hint is requested on a board whose placed cells contradict the
  unique solution without yet breaking a local rule
- **THEN** no move is hinted and an explanatory banner is shown, which states
  that a placed cell must be wrong

## MODIFIED Requirements

### Requirement: The Bricks board is a hexagon stored as a padded parallelogram

The board SHALL be a hexagon stored as a padded parallelogram: the actual grid
width SHALL be the parameter width plus the ceiling of half the height minus one,
with the two triangular corners masked as boundary cells, leaving exactly
width-by-height playable cells. Neighbors SHALL be the fixed six-direction hex
step set.

#### Scenario: A board six wide and seven high

- **WHEN** a board of width 6 and height 7 is built
- **THEN** its grid is nine cells wide
- **AND** forty-two of its cells are playable

## REMOVED Requirements

### Requirement: A Bricks hint is refused on a solved, mistaken or contradicted board

**Reason**: Reworded in `bricks` as "A Bricks hint is refused on a board that
contradicts its solution without breaking a rule". Dropped the solved-board and
rule-violation refusals. They are `engine-hints` "The midend SHALL refuse a
hint on a finished or wrong board before asking the game", which gives both
before the game's `hint` is asked and forbids a game to write either; `hint` in
`src/games/bricks/index.ts` writes neither. Kept the one refusal that is
Bricks' own, the board that contradicts its solution with no rule yet broken
(`CONTRADICTION_UNLOCALIZED`), and retitled to what is left.
