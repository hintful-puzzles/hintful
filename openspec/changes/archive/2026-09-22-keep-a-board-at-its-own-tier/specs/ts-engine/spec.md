## REMOVED Requirements

### Requirement: A board loaded without its difficulty is graded to the tier it needs

**Reason**: It trusted a pinned tier without checking it. Records written by a
build that mislabeled a board (the remembered board, the autosave) pin the
wrong tier, and the board reopened at it on every visit.

**Migration**: Replaced by "A loaded board carries the tier it needs", which
keeps the grading of an ambiguous id and adds a check of a pinned one.

## ADDED Requirements

### Requirement: A loaded board carries the tier it needs

When the midend loads a board of a tiered game from a `params:desc` id or from a save, it SHALL give the board the tier its own solver says it needs, as follows.

If the params string cannot tell tiers apart (the string is the sharing encoding of two or more tiers), the midend SHALL load the board at the lowest tier at which the game's own solver solves it (`lowestSolvingCap` over `DifficultyContract.solveAtCap`).

If the string pins a tier, the midend SHALL keep that tier when the board solves at it. Otherwise it SHALL raise the board to the lowest tier above the pinned one that solves it. A pinned tier SHALL NOT be lowered. A pinned tier that allows search, or that promises no unique solution, SHALL be kept without solving.

When no tier qualifies, the decoded params SHALL stand.

The board is the authority on its own tier. The sharing id omits the
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

### Requirement: Choosing params changes the next board, not the one on screen

The midend SHALL keep the params of the board on screen apart from the params the next new game is dealt at. `setParams` and `setCustomParams` SHALL change only the latter. The save envelope, a restart, the emitted game ids, the hint's tier check, the requested keys and the computed size SHALL read the params of the board on screen, which SHALL change only when a board is started.

The app sets the params and then deals, and anything that reads the board in
between would otherwise record it at a tier or size it was never dealt at.

#### Scenario: A save taken between choosing a type and dealing keeps the board's tier

- **WHEN** a board is on screen, params at a different tier are set, and the game
  is saved before a new game is dealt
- **THEN** the save records the tier of the board on screen
- **AND** the next new game is dealt at the params that were set
