## MODIFIED Requirements

### Requirement: Generation: Each Tracks difficulty adds its rungs

Each tier SHALL run the techniques `tracks.description.yaml` states at it and
below. Easy SHALL run a square's sides (`oneWayIn`, `bothSidesLeft`), a
line's count against its clue (`clueFull`, `clueExact`), and the side that
would close a loop or finish the track too soon (`closeLoop`, `strand`,
`finishEarly`). Normal SHALL add the loose end (`looseEnd`) and the
neighbor that would take the line's last track square (`sharedFate`). Tricky
SHALL add the neighbor that would take its last empty square
(`sharedFateEmpties`) and a block's crossings (`parity`).

#### Scenario: A capped solve leaves the higher rungs out

- **WHEN** the solver runs capped at Normal
- **THEN** neither `sharedFateEmpties` nor `parity` runs

### Requirement: Hint: One Tracks firing is one hint step

One firing SHALL be one step: one binding of one technique of the compiled
ladder, so a technique that scans the whole grid cannot pile several
independent deductions into one step. Where one binding forces several ops,
the step's move SHALL carry them all.

#### Scenario: A hint explains a clue that is already met

- **WHEN** a line holds as many track squares as its clue allows and a hint is
  requested
- **THEN** the step's narration names that count, its move marks every other
  square in the line empty, and its evidence is exactly the clue's own track
  squares with the clue's digit recolored

### Requirement: Hint: The Tracks hint counts a row or column against its clue

A row or column that holds as many track squares as its clue SHALL have every
other square in it marked empty ("By clue 4, this column's track squares are
the outlined ones"). One that has as many squares marked empty as its
length less its clue SHALL have every other square in it marked as track. The
step SHALL stripe the line, and outline its clue and the squares it counted.

#### Scenario: A clue as long as its line

- **WHEN** a hint is asked for on the 8×8 Normal board
  `zn5CbApAb,5,8,8,7,4,S4,3,3,2,3,4,4,5,S8,8,8` with nothing marked
- **THEN** the first step is about the sixth row, whose clue is 8: "Clue 8 is
  the length of this row, so every square in it must carry track."

### Requirement: Hint: The Tracks hint decides two neighbors whose track would run on

For two undecided squares side by side in a row or column, where the first has
at most one side not blocked other than the side they share, track in the
first would run on into the second. On a Normal or a Tricky board, where the
line needs one more track square, a step SHALL mark the first empty. On a
Tricky board, where the line can take one more empty square, a step SHALL mark
the second as track. Where both hold, each is its own step.

#### Scenario: A line with room for one more track square

- **WHEN** a column of a Normal board needs one more track square, and an
  undecided square in it has its left and right sides blocked, with an
  undecided square below it
- **THEN** a step marks the first square empty: track there would carry on
  downward and the column has room for one more track square

### Requirement: Hint: The Tracks hint tries a square's sides, then the clues, then the loop

`hint` SHALL take the first firing of the ladder `tracks.description.yaml`
states, and begin again after each: a square's sides first (`oneWayIn`, then
`bothSidesLeft`, squares in reading order), which hold back every technique
after them; then a clue that is met, then one whose empty squares are all
marked, rows top to bottom before columns left to right; then a loop or an
early finish. Then, above Easy, the neighbor that would take a line's last
track square; at Tricky, the one that would take its last empty square and a
block's crossings; and a loose end only once nothing else fires.

#### Scenario: A dealt board's first steps

- **WHEN** a hint is asked for on the 8×8 Normal board
  `zn5CbApAb,5,8,8,7,4,S4,3,3,2,3,4,4,5,S8,8,8` with nothing marked
- **THEN** the first two steps fill the sixth and seventh rows, whose clues
  are 8
- **AND** only then does a step lay track through a square with two sides
  blocked, since no square had two until those rows were filled

## ADDED Requirements

### Requirement: Solver: Tracks' solver is a certified deduction ladder

Tracks' solver SHALL deduce only, as the ladder `tracks.description.yaml`
states. Each technique SHALL be checked sound, and a planted defect of each
found unsound. The boards of its firing census SHALL be those generated at
every tier, and every technique SHALL fire on them at the caps the generator
uses.

#### Scenario: A board needing Tricky is graded Tricky

- **WHEN** a board that needs a Tricky technique is solved
- **THEN** the solver capped at Tricky solves it and grades it Tricky
- **AND** the solver capped at Normal leaves it unsolved

#### Scenario: A silenced technique fails

- **WHEN** any technique is removed from the description
- **THEN** the firing census fails

### Requirement: Hint: No Tracks firing concludes what the board already decides

The description SHALL read what the player's board already says before any
technique concludes it: a square with a rail holds track, and a side is shut
where the rim, an empty square or a finished piece closes it. So no firing of
the hint's walk SHALL ask for a change the game would refuse the contrary of:
track on a side of a square marked empty or of the rim, track as a third side
of a finished piece, or "no track" on a square showing a rail. Every firing
SHALL be shown.

#### Scenario: A finished piece's sides are never a step

- **WHEN** a finished piece's two free sides border squares the player has
  marked empty and a hint is requested
- **THEN** no step in the plan asks for either side to be blocked

## REMOVED Requirements

### Requirement: Hint: A firing the board already shows is hidden

**Reason**: The description reads what the board already decides as
definitions (`on`, `shut`), so no technique concludes it, and there is
nothing to hide.

**Migration**: "Hint: No Tracks firing concludes what the board already
decides" states the guarantee; `tracks-hint.test.ts` asserts it of every
firing in the walk.

### Requirement: Hint: Three rules of update-flags declare no reason

**Reason**: Those rules are now definitions the techniques read, not firings.

**Migration**: None; their conclusions are what the board shows.
