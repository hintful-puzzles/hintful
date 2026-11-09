## MODIFIED Requirements

### Requirement: Solver: Subsets solves by candidate elimination

Subsets SHALL provide a solver that reports whether a board is complete,
unfinished or invalid, driven by the ladder `subsets.description.yaml` states,
run to a fixpoint over the sets each cell may still hold. Whether a whole
board is solved SHALL be the description's rules to say.

#### Scenario: The lowest tier's techniques

- **WHEN** a board is solved at the lowest tier
- **THEN** the solver carries a letter every set a horseshoe's closed end can
  hold has into its open end, and one no set the open end can hold has out of
  its closed end; strikes the empty and the full set beside a missing
  horseshoe, and across one every set that holds or lies inside a decided
  neighbor's; places a cell down to one set and a set only one cell can hold;
  and strikes from a horseshoe's open end a set with no smaller partner the
  closed end can hold

#### Scenario: The solver classifies a board

- **WHEN** a solvable board, an ambiguous board and a rule-violating board are each
  solved
- **THEN** the solver reports complete, unfinished and invalid respectively

#### Scenario: A board no answer fits is invalid

- **WHEN** the solver is given a board with no horseshoes, where no cell can
  hold the empty set
- **THEN** it reports the board invalid

### Requirement: Hint: The Subsets hint carries a letter across a horseshoe

Where a letter is marked present in the cell at a horseshoe's closed end and
not in the cell at its open end, a step SHALL mark it present there ("…has C
marked, so C must be here too"). Where a letter is cleared at the open end and
not at the closed end, a step SHALL clear it there ("…which has no B, so B
can't be here either"). Several letters from one horseshoe SHALL be one
journey.

#### Scenario: A given set clears a letter from the cell inside it

- **WHEN** a hint is asked for on
  `13RD,_,6R,_,_,_,_D,_UL,_R,12D,_,_DL,_UR,_,3U,10` with nothing marked
- **THEN** its plan clears B in the second cell of the top row, whose set lies
  inside the top-left cell's {A,C,D}, by that horseshoe

## REMOVED Requirements

### Requirement: Hint: The Subsets hint reads the horseshoes before it counts sets

**Reason**: The hint walks the compiled ladder's firings, each continuing from
the cells the last step read, so no fixed order of kinds holds.
**Migration**: "Hint: The Subsets hint walks its ladder from its last step".

## ADDED Requirements

### Requirement: Hint: The Subsets hint walks its ladder from its last step

`hint` SHALL take its steps from the firings of the description's ladder, each
the one that continues from the cells the last step read, never one of a
higher tier than the ladder's own next firing. A firing SHALL make a step, as
it is made, wherever it decides letters: those a horseshoe carries; a set only
one cell can hold, placed; or every letter a cell's remaining sets agree on,
a collapse.

#### Scenario: A carried letter and its cell's collapse are one after the other

- **WHEN** a hint is asked for on
  `13RD,_,6R,_,_,_,_D,_UL,_R,12D,_,_DL,_UR,_,3U,10` with nothing marked
- **THEN** the first step marks C and D present in the first cell of the
  third row, across the horseshoe to {C,D} beside it, and the next marks B
  present and clears A there, since only {B,C,D} still fits it

#### Scenario: A hidden single is shown with its placement spotlight

- **WHEN** a set has exactly one cell it can still legally occupy
- **THEN** the hint places it there and spotlights that cell as the only
  candidate
