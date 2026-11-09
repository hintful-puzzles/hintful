## MODIFIED Requirements

### Requirement: Solver: Crossing's solver propagates what the fitting numbers allow

Crossing's solver SHALL find the unique solution, or report the board not
fully determined or contradictory, by its description's ladder: strike from a
run's cells the digits no still-fitting number puts there, place a digit all
of them agree on, give a number that fits one run only that run, and iterate.
The hint SHALL read its steps off the same ladder.

#### Scenario: The solver finds the unique solution

- **WHEN** a generated board is solved
- **THEN** the solver fills every open cell so that each clue number appears
  exactly once across the runs, and reports the board valid

#### Scenario: A number with one run left takes it

- **WHEN** the solver runs on the 4×2 board `a5a1,26,41,46,414`, where with
  414 written in every run still fits two numbers or three and 26 fits the
  across run alone
- **THEN** it writes 26 into that run and reports the board valid

### Requirement: Hint: A placement the board does not yet support waits for its notes

Where the board shows no placement but the ladder's narrowing reaches one, the
hint SHALL NOT assert it. It SHALL first write as note steps only the rule-outs
that placement rests on, traced back to what the board shows, each narrated by
the run whose still-fitting numbers decide it. Where no placement follows at
all, it SHALL only strike from the player's own notes what their runs rule
out.

#### Scenario: A placement the board does not yet support is preceded by the notes it needs

- **WHEN** the solver's propagation forces a placement, but a player checking the
  clue list against the board's digits and notes would still see several numbers
  fitting
- **THEN** the hint first offers note steps, each naming the run whose
  still-fitting numbers leave those digits in that square, and offers the
  placement only once the notes on the board support it

#### Scenario: Only the notes the placement rests on are written

- **WHEN** the hint is asked on the 5×5 board
  `3a1a1a4a1a1a6a1,11,22,33,73,84,112,361,576,764,811,838`, on which no
  placement shows
- **THEN** it writes notes in three squares and then places the digit they
  show, and writes no note that placement does not rest on
