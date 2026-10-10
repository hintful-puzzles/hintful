## MODIFIED Requirements

### Requirement: Unequal accepts digit, pencil, clue-spent, and solve moves

`interpretMove` SHALL select a cell by mouse or keyboard cursor. With a cell
highlighted, a digit `1..order` (entered as a digit, or a letter for 11 and
above) SHALL place that number, or toggle the pencil mark in pencil mode, and
backspace, space, or below order 10 the `0` key, SHALL clear it. Entering a
value a cell already holds SHALL be a no-op. Immutable (given) cells SHALL
reject entry.

#### Scenario: Entry into an immutable cell is rejected

- **WHEN** `interpretMove` would enter a digit into a given cell
- **THEN** it returns `null` (no move)

### Requirement: Unequal checks for mistakes against the unique solution

`findMistakes` SHALL re-solve the board from its givens and clues and return
every player-entered cell whose number contradicts the unique solution, plus
every empty cell whose non-empty pencil notes have crossed out its solution
value. When the board is not uniquely solvable from the givens it SHALL return
an empty result.

#### Scenario: A wrong number is flagged, ordinary notes are not

- **WHEN** the player enters a number that contradicts the unique solution
- **THEN** `findMistakes` includes that cell
- **AND** a cell carrying notes that still include its solution value is never
  included

#### Scenario: An ambiguous board

- **WHEN** `findMistakes` is asked about a board whose givens and clues admit
  two solutions
- **THEN** it returns an empty result, whatever the player has entered

### Requirement: Unequal provides an explained deduction hint

The game's hint SHALL teach the player the next deduction in pencil-notes
terms.

#### Scenario: An inequality bound is taught as a note strike

- **WHEN** the player asks for a hint on a fully-penciled Unequal-mode board
  where a greater-than clue rules a value out of one of its two cells
- **THEN** the hint returns a step whose `pencilStrike` move clears exactly those
  candidates
- **AND** the narration names the greater-than relationship and the bounding
  cell's smallest/largest possible value, concluding in the necessity voice

#### Scenario: An adjacency clue is taught in Adjacent mode

- **WHEN** the player asks for a hint on a fully-penciled Adjacent-mode board
  where a bar (or its absence) beside a filled cell rules a value out of the
  neighbor
- **THEN** the hint returns a `pencilStrike` step clearing those candidates, the
  narration stating that the two numbers must (or must not) differ by exactly one

### Requirement: A hint's marks ring the struck cell and outline the clue's pair

A clue elimination's step SHALL ring the cell it strikes from and outline the
two cells its sign or bar sits between. Equivalent strikes of one firing SHALL
share the target hint color.

#### Scenario: A link elimination is drawn

- **WHEN** an Unequal-mode link elimination is the displayed step
- **THEN** the clue's two cells are outlined and the struck cell is ringed

## REMOVED Requirements

### Requirement: The M key is Unequal's Mark-all

**Reason**: Nothing in it is Unequal's alone: the key is `engine-notes`, "The Mark-all action is the M key", and the fill of the note-less cells followed by the strike of what a row or column already holds is `engine-notes`, "Mark-all is adaptive in a game with an obvious-candidate rule". Unequal's `interpretMove` passes its row and column regions to `adaptiveMarkAllMove` and decides nothing else.

### Requirement: Every hint step is monotone progress

**Reason**: `engine-candidate-hints`, "A candidate plan's step is never undone by a later
one", holds the first sentence; `engine-hints`, "Only a searching hint is
excused the walk's promise" and "The hint walk SHALL cover every preset a game
offers", which walks both modes' presets, hold the recompute, and "A displayed
hint step never references already-resolved state" the skip.

### Requirement: A kept plan follows the player's own move

**Reason**: `engine-candidate-hints`, "A candidate step is completed by the move that
makes it whole", holds every verdict it gives; Unequal's `hintKeepTrack` is
one call of `keepCandidateHintTrack` with the default dialect.
