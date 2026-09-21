## ADDED Requirements

### Requirement: A board loaded without its difficulty is graded to the tier it needs

When `newGameFromId` loads a `params:desc` id of a tiered game whose params
string cannot tell tiers apart — the string is the sharing encoding of two or
more tiers — the midend SHALL load the board at the lowest tier at which the
game's own solver solves it (`lowestSolvingCap` over
`DifficultyContract.solveAtCap`), rather than at the tier the string decodes to.
A params string that pins its tier SHALL keep it. When no tier solves the board,
the decoded params SHALL stand.

The sharing id omits the difficulty because the desc already fixes the board,
so the board is the authority on its own tier. Loading the default tier instead
misnamed the board, capped its hint below the rules it needs, and dealt the
next game at the default.

#### Scenario: A shared board reloads at the tier it was dealt at

- **WHEN** a tiered game deals a board at a tier other than its default, and the
  board is loaded by the id offered for sharing it
- **THEN** the midend reports that tier, and the hint runs at it

#### Scenario: An id that states its tier keeps it

- **WHEN** a board is loaded by an id whose params string pins its tier
- **THEN** the midend reports that tier without grading the board
