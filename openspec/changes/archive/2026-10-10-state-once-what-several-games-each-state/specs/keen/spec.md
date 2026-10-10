## MODIFIED Requirements

### Requirement: Keen selects a cell through the shared note-taking cell

Keen SHALL take its selection from the engine's note-taking cell. Every cell
SHALL take an entry, since Keen has no givens, and only an empty cell SHALL
take a pencil mark. The cursor keys SHALL move the highlight.

#### Scenario: A right press on a filled cell without sticky mode

- **WHEN** sticky pencil mode is off and the player right-presses a cell that
  holds a digit
- **THEN** the highlight moves to that cell and is not shown, because the cell
  can take no pencil mark

### Requirement: Keen flags mistakes against its unique solution

The game SHALL implement `findMistakes`: re-solve from the cage clue structure
to the unique solution and return every player cell that contradicts it: a
filled cell whose digit is wrong (`"cell"`), and an empty cell whose non-empty
pencil notes have crossed out its solution digit (`"note"`). When the board is
not uniquely solvable from the clues the result SHALL be empty.

#### Scenario: A wrong digit and a wrong note are flagged

- **WHEN** the player fills a cell with a digit other than its solution value, or
  pencils out the solution digit in an empty cell
- **THEN** `findMistakes` includes that cell
- **AND** a cell whose notes merely carry extra (non-solution) candidates is not
  flagged

### Requirement: Keen exposes pencil-mark preferences

The game SHALL offer a sticky-pencil-mode preference and an auto-pencil
preference.

#### Scenario: Pencil preferences are exposed with their defaults

- **WHEN** the game's preferences are read
- **THEN** they include a sticky-pencil-mode boolean defaulting to on
- **AND** an auto-pencil boolean defaulting to off

### Requirement: A cage elimination is one firing, struck as one journey

A cage elimination SHALL be taught as one firing: no layout of the cage's
digits consistent with its clue leaves a candidate possible in a cage cell, or,
at the harder level, a digit the cage requires along a row or column is ruled
out elsewhere in that line. A firing SHALL be one cage's, so a hint step never
mixes cages. It SHALL strike what it rules out through `pencilStrike` moves
linked as one journey, and every cell it strikes in SHALL be marked in the one
acted-on hint color.

#### Scenario: A cage elimination is taught as a note strike

- **WHEN** the player asks for a hint on a fully-penciled board where a cage's
  arithmetic clue rules a digit out of one of its cells
- **THEN** the hint returns a step whose `pencilStrike` move clears exactly those
  candidates
- **AND** the cage's cells are striped and the cell is ringed in the hint color

#### Scenario: Two cages could prune at once

- **WHEN** the recording solver reaches a board on which two cages each rule a
  candidate out
- **THEN** each cage's eliminations are recorded under a `group` of their own

## REMOVED Requirements

### Requirement: Keen's mark-all key fills, then cleans

**Reason**: Nothing in it is Keen's alone. The fill of the note-less cells, the narrowed cell left as it is and the strike of what a row or column already holds are `engine-notes`, "Mark-all is adaptive in a game with an obvious-candidate rule"; that a cage is no reason to strike is `engine-notes`, "An obvious candidate is judged only against placed values", which names Keen's cage; the key is `engine-notes`, "The Mark-all action is the M key". Keen's `interpretMove` passes its row and column regions to `adaptiveMarkAllMove` and decides nothing else.

### Requirement: Every Keen hint step is monotone progress

**Reason**: `engine-candidate-hints`, "A candidate plan's step is never undone by a later
one", holds the first sentence; `engine-hints`, "Only a searching hint is
excused the walk's promise" and "The hint walk SHALL cover every preset a game
offers", hold the recompute, and "A displayed hint step never references
already-resolved state" the skip. Nothing in it is Keen's own.

### Requirement: Keen keeps a hint plan while the player follows it

**Reason**: `engine-candidate-hints`, "A candidate step is completed by the move that
makes it whole", holds every verdict it gives; Keen's `hintKeepTrack` is one
call of `keepCandidateHintTrack` with the default dialect.
