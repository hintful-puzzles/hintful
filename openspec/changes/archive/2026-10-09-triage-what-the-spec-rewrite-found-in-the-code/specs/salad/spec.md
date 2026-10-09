## MODIFIED Requirements

### Requirement: A Salad description is validated against its arrays

Validation SHALL reject a description that carries more or fewer squares than
the relevant array holds, with a message that tells too many from too few, one
that contains an out-of-range clue value, and one that uses an unknown
character. An ABC End View border section that stops short is met at its
separator, and SHALL be rejected there as a character out of place and not as
too few squares.

#### Scenario: A description with the wrong number of squares is rejected

- **WHEN** a description carrying more or fewer squares than its array has cells is
  validated
- **THEN** it is rejected with a message distinguishing too much from too little

#### Scenario: A short border section is refused at its comma

- **WHEN** an ABC End View description whose border section covers fewer clues
  than the border has, followed by its comma and a grid section, is validated
- **THEN** the refusal names the comma as a character the game ID cannot have
  there

### Requirement: Salad's generation retry bound outlasts a legal seed

Each generation loop SHALL carry a retry bound, since Normal boards are rare
in the Number Ball mode and a deal that never ends is worse than one that
gives up. The bound of a shape SHALL be several times the mean tries its
rarest dealt tier takes, so that a deal which runs it out has far more likely
lost a tier than met a slow seed. A legal seed can still run it out, rarely,
and the deal then ends as any generator's does, by throwing
`RetryLimitExceeded`.

#### Scenario: A Normal Number Ball board is dealt

- **WHEN** the Normal preset of the Number Ball mode is dealt
- **THEN** generation returns a board and does not run its retry bound out

#### Scenario: A shape whose boards are rare has a bound of its own

- **WHEN** a 4x4 Number Ball board, or an ABC End View board small enough to
  be clued on its border alone, is dealt
- **THEN** its loop runs under a larger bound than the other shapes', sized to
  that shape's rarest tier

### Requirement: A Salad move that would not change the board is a no-op

A move that would not change the board SHALL be a no-op: `interpretMove` SHALL
make no move of the symbol, the empty marker or the not-empty marker a square
already holds, of a clear on a square with nothing to clear, or of a penciled
not-empty marker on a square marked empty. A penciled symbol or empty marker
toggles its mark, so it is never refused as changing nothing. An empty marker
on a square whose clue is a ball is refused in either mode, since that square
is not empty.

#### Scenario: An empty marker on a given cross

- **WHEN** the keyboard cursor is on a given cross and the empty marker's key is
  pressed
- **THEN** no move is made

#### Scenario: Re-entering what a square holds leaves no history

- **WHEN** a square holds a symbol and that symbol's key is pressed again, or a
  blank square with no pencil marks is cleared
- **THEN** no move is made and Undo gains nothing
