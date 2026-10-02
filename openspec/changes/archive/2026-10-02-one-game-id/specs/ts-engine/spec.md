## MODIFIED Requirements

### Requirement: A loaded board carries the tier it needs

When the midend loads a board of a tiered game from a `params:desc` id or from a save, it SHALL give the board the tier its own solver says it needs, as follows.

If the params string cannot tell tiers apart (it omits the difficulty, as upstream's game IDs do, so it encodes two or more tiers alike), the midend SHALL load the board at the lowest tier at which the game's own solver solves it (`lowestSolvingCap` over `DifficultyContract.solveAtCap`).

If the string pins a tier, the midend SHALL keep that tier when the board solves at it. Otherwise it SHALL raise the board to the lowest tier above the pinned one that solves it. A pinned tier SHALL NOT be lowered. A pinned tier that allows search, or that promises no unique solution, SHALL be kept without solving.

When no tier qualifies, the decoded params SHALL stand.

The board is the authority on its own tier. An id from upstream omits the
difficulty, and a record written by a build that mislabeled a board pins the
wrong one; loading either as stated misnames the board and caps its hint below
the rules it needs.

#### Scenario: A shared board reloads at the tier it was dealt at

- **WHEN** a tiered game deals a board at a tier other than its default, and the
  board is loaded by the id offered for sharing it
- **THEN** the midend reports that tier, and the hint runs at it

#### Scenario: An id that states a tier the board solves at keeps it

- **WHEN** a board is loaded by an id whose params string pins a tier at which
  the board solves, including a tier above the one it needs
- **THEN** the midend reports that tier

#### Scenario: A pinned tier below the board's is raised

- **WHEN** a board is loaded by an id or a save whose params pin a tier at which
  the board does not solve
- **THEN** the midend reports the lowest tier above it at which the board
  solves, and the hint runs at it
