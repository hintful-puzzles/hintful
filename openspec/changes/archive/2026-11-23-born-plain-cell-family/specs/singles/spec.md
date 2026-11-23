## MODIFIED Requirements

### Requirement: Controls: Singles toggle moves

The left-click verb SHALL shade a cell, emptying it where it is already
shaded, and the right-click verb SHALL circle it, emptying it where it is
already circled; each replaces the other's mark, as in every fill game whose
click toggles.

#### Scenario: Left-click cycles a cell through black and back to empty

- **WHEN** the player left-clicks an empty cell, then left-clicks it again
- **THEN** the first move marks it black
- **AND** the second move clears it to empty

## ADDED Requirements

### Requirement: Generation: Singles numbers a Latin square round the squares it covers

A deal SHALL cover squares at random on a Latin square's numbers, the ladder
run after each keeping the covered squares apart and the clear ones joined,
and SHALL then number each covered square to repeat a number of its row or
column, one single in both where there is one. Every number is shown, and
the board is kept where the ladder finishes it at its tier and not below.

#### Scenario: A dealt board's shaded numbers repeat

- **WHEN** a Singles board is dealt and solved
- **THEN** every number is 1 to the longer side, and each shaded square's
  number is another square's in its row or its column

### Requirement: Hint: The Singles hint carries on from its last step, then by its rules

The hint SHALL take, of the firings the ladder could make, the one that
carries on from the cells its last step read and decided, and otherwise
the first by its rule.

#### Scenario: A fresh board's first steps

- **WHEN** a plan is asked for on the fresh 6×6 board
  `146214162623436526534361613462465334`
- **THEN** it opens with a sandwich, and its next step shades the 2 the
  first one's clear 2 already holds in its row

### Requirement: Look: Singles marks a broken rule as the fill engine does

A rule violation SHALL be marked on the board, always and with no mistake
check asked for (`Game.rules`): a diamond between two shaded squares that
touch, and a badge in the error color on a circled number another clear
square of its row or column repeats.

#### Scenario: Two shaded squares touch

- **WHEN** two squares side by side are shaded
- **THEN** a diamond is drawn on the line between them

#### Scenario: Two circled copies of a number share a row

- **WHEN** two copies of a number in a row are circled
- **THEN** each is drawn on a badge in the error color

## REMOVED Requirements

### Requirement: Generation: Singles tests a board one level below with the sneaky deduction

**Reason**: The fill deal grades a board by its ladder alone; the sneaky
step was an unsound shortcut of the hand-written generator's, which is gone.
**Migration**: See "Generation: Singles numbers a Latin square round the
squares it covers".

### Requirement: Solver: Singles solve tries the current board, then the initial one

**Reason**: The fill engine's Solve fills the answer of the board as dealt,
which every board that loads has.
**Migration**: None: Solve fills the answer.

### Requirement: Hint: Singles' hint takes the number patterns once and the joining rules last

**Reason**: The fill engine's hint follows on from the cells each step
decides.
**Migration**: See "Hint: The Singles hint carries on from its last step,
then by its rules".

### Requirement: Look: Singles errors are drawn in the error color

**Reason**: The fill engine reads the rules on the squares as marked, an
open square undecided, and marks a break as it does in every fill game.
**Migration**: See "Look: Singles marks a broken rule as the fill engine
does".
