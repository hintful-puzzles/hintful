## MODIFIED Requirements

### Requirement: Generation: An Easy Pattern board is one the per-line solver solves

The per-line solver SHALL be the ladder `pattern.description.yaml` states: its
one technique, `line`, settles each stretch of a row's or column's undecided
cells that every way the line's runs can fit around its marks agrees on, and
it runs to a fixpoint. At Easy the generator SHALL produce a random grid and
accept it only when that solver, from the grid's derived clues alone,
completes it to one fully determined grid.

#### Scenario: Generated boards are uniquely line-solvable

- **WHEN** `newDesc` produces an Easy board and the solver is run from its
  clues on an all-unknown grid
- **THEN** the solver completes to a single fully-determined grid (no remaining
  unknown cells, no contradiction)

### Requirement: Hint: A Pattern run's overlap is shaded, and a cell no run reaches is clear

A step SHALL take one unbroken stretch of undecided cells of one line that
every fit of the line's runs around its marks agrees on, all shaded or all
clear. With each run packed as far to one end of its line as the line's marks
allow, and then to the other, a stretch every cell of which one run covers
both ways SHALL be narrated as that run's overlap, and a stretch no run covers
anywhere between its two placings as out of reach. Every cell of a line with
no clues SHALL be clear.

#### Scenario: A run with no room to slide

- **WHEN** the hint's plan on the 10×10 board
  `8/6.1/4.1.1.1/4.1/4.3/2/2/2.2/2.1.2/1.2/3.2/3.2/5/5/2.2/5/1.2/3.1/6/8`
  is read
- **THEN** its seventh step shades the top four cells of the third column,
  saying "This column's run of 4 has nowhere to slide, so these cells must be
  purple."
- **AND** its nineteenth clears the top three cells of the sixth column,
  saying "No run of this column's outlined clue can reach the ringed cells,
  so those cells must be clear."

## REMOVED Requirements

### Requirement: Hint: Pattern's hint takes the first line a named technique decides

**Reason**: The hint is the ladder's walk, as every described game's is: it takes the firing that continues from the cells its latest steps decided, so a player follows one deduction into the next line it opens, rather than going back to the first column after every step.
**Migration**: "Hint: Pattern's hint continues from its last step" states the order.

## ADDED Requirements

### Requirement: Hint: Pattern's hint continues from its last step

`hint` SHALL take, of every stretch the ladder could settle, the one that
continues from the cells the latest steps decided, and otherwise the first in
the ladder's order: the rows from the top, then the columns from the left,
and on a line its shaded stretches before its clear ones.

#### Scenario: The plan follows the cells it decides

- **WHEN** the hint's plan is read on the 10×10 board
  `8/6.1/4.1.1.1/4.1/4.3/2/2/2.2/2.1.2/1.2/3.2/3.2/5/5/2.2/5/1.2/3.1/6/8`
- **THEN** its first step is the ninth row's, "This row's run of 6 can slide
  only 4 cells, so these cells must be purple.", the first row any run's
  overlap reaches
- **AND** its second is the fifth column's, which holds one of the cells the
  first step shaded
