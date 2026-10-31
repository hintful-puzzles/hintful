## ADDED Requirements

### Requirement: Solver: Salad's ladder is its description

Salad's solver SHALL run the ladder of `salad.description.yaml`, compiled:
its border-letter deduction, and the Latin library's hidden single, naked
single, set, single-number set and wing, each at the tier the description
gives it and each reading the empty square's multiplicity, checked sound
against the description's rules at every count of symbols a board of the
checked orders can hold.

#### Scenario: A border letter's reach

- **WHEN** a column's top clue is B on a 5x5 board of three letters, and the
  column's bottom square is known empty
- **THEN** the border deduction strikes B from the column's third, fourth and
  fifth squares, since of the column's two empties the bottom square is one,
  so at most one stands before the B

## MODIFIED Requirements

### Requirement: Solver: Salad's solver reasons about the empty square directly

Salad's solver SHALL declare the empty square to the shared cube as its repeated
symbol: `nums + 1`, appearing `order − nums` times per line. A cross SHALL be
that symbol placed and a ball that symbol struck. The empty-square deductions
SHALL be the Latin library's techniques, each reading the empty square's
multiplicity: the solver SHALL NOT translate between holes and candidates at
the game's edge, nor keep a hand-written sync-and-count layer. The Number Ball
quality gate, whether the holes fall out with no number entered, SHALL be
asked of that cube.

#### Scenario: The empty square is reasoned about directly

- **WHEN** the solver deduces a placement that turns on where empty squares can
  and cannot go
- **THEN** that deduction is expressed over the shared cube's repeatable symbol,
  with no translation step at the game boundary

#### Scenario: A line that can hold its empties in only one way

- **WHEN** exactly `order − nums` squares of a line can still be empty
- **THEN** the library's hidden single places the empty-square symbol in each
  of them
