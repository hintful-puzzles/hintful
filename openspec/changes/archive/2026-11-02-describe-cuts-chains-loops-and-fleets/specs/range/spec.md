## RENAMED Requirements

- FROM: `### Requirement: Generation: A Range board is Easy where the three rules finish it`
- TO: `### Requirement: Generation: A Range board is Easy where its ladder finishes it`

- FROM: `### Requirement: Solver: Range's deduction applies three rules to a fixpoint`
- TO: `### Requirement: Solver: Range's deduction is the ladder its description states`

## MODIFIED Requirements

### Requirement: Generation: A Range board is Easy where its ladder finishes it

A board SHALL count as Easy where its ladder finishes it, and as Unreasonable
where it has exactly one answer that the ladder does not reach.

#### Scenario: A board that needs search opens as Unreasonable

- **WHEN** a 4×4 ID whose board has one answer the rules do not reach is
  entered with no difficulty letter, with `de`, and with `du`
- **THEN** each opens, and the board's params read `4x4du`

### Requirement: Solver: Range's deduction is the ladder its description states

The deductive solver SHALL run the ladder `range.description.yaml` states, in
its order, to a fixpoint: a shaded square's neighbors are clear; a number's
view along an arm that can run no further than it is known to is capped by a
shaded square; the view along an arm runs, clear, as far as the count needs
with the other arms at their longest; and a square without which the squares
not shaded would not be one group is clear.

#### Scenario: The adjacency rule whitens a neighbor

- **WHEN** the solver runs on a grid with a black cell beside an empty cell
- **THEN** that empty cell is set white

### Requirement: Solver: Range's search assumes the first undecided cell shaded, and then clear

Where the ladder stops, Range's search SHALL take the first undecided cell and
assume it shaded, and then clear.

#### Scenario: The search tells one answer from several and from none

- **WHEN** the search runs on a 4×4 board the rules finish, on one with one
  answer that they do not reach, on one with no number, and on one with a 7
  in one corner and a 1 in the opposite one
- **THEN** it reports one answer for the first two, several for the third and
  none for the fourth

#### Scenario: The search agrees with a count that has no search in it

- **WHEN** dealt boards from 2×3 to 5×5, the same with a number taken away
  and the same with one number changed are each counted by shading every set
  of squares with no two side by side and reading it against the numbers
- **THEN** the search reports one answer exactly where one shading fits,
  several where more do and none where none does

### Requirement: Solver: Range's search sees a position no answer fits before it is full

The search SHALL call a position impossible as soon as a technique of the
ladder finds the marks inconsistent: a number that cannot see its count
however its arms run, or already sees more than it, two shaded cells side by
side, or the squares not shaded in more than one group while one of them is
undecided. It SHALL NOT wait for every cell to be decided.

#### Scenario: A board that takes three positions

- **WHEN** the search is given two positions on a 4×4 board that takes five
  when an impossible position is seen only once full
- **THEN** it reports that it stopped, and with three it reports one answer

### Requirement: Hint: Range's hint stops where its rules do

On an Unreasonable board as on any other, the steps of Range's hint SHALL be
the cells its ladder forces from the player's marks.

#### Scenario: The hint stops, and goes on from a cell filled rightly

- **WHEN** the hint is followed on an Unreasonable board until it refuses
- **THEN** with a cell filled as the solution has it wherever the hint stops,
  the hint finishes the board

## REMOVED Requirements

### Requirement: Hint: Range's hint takes the clue rule first in each pass

**Reason**: The hint walks the compiled ladder a firing at a time, as every
described game's does, so the hand-written pass order it stated is gone.
**Migration**: "Hint: Range's hint walks its ladder a firing at a time".

## ADDED Requirements

### Requirement: Hint: Range's hint walks its ladder a firing at a time

The hint's plan SHALL take the ladder's firings one at a time, each the one
that carries on from the cells the plan last decided, the ladder's order
breaking ties, and SHALL narrate each cell a firing decides as a step of its
own.

#### Scenario: A shaded square's neighbors come first

- **WHEN** a hint is asked on a dealt 9×6 board with one shaded square of its
  answer marked, while numbers already force squares elsewhere
- **THEN** the plan's first steps clear that square's undecided neighbors, as
  neighbors of a shaded square, and the steps after them reason from numbers
