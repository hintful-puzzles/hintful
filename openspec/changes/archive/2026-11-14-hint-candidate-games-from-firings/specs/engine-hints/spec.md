## MODIFIED Requirements

### Requirement: The solver and the hint are two projections of one deduction engine

A logic game's deductive solver and its hint SHALL be two projections of one
deduction engine. The generator runs the techniques to a fixpoint and SHALL
accept a board only when the techniques fully solve it; the hint runs the same
techniques a firing at a time, recording each or reading them off the
player's notes. Deductive completion implies uniqueness, so no separate
uniqueness pass SHALL be required. The difficulty grade SHALL be the highest
**tier** reached, never a technique's position in the ladder.

#### Scenario: A board is graded by tier and not by position

- **WHEN** the techniques solve a board, and the last technique in the ladder
  that fired declares a lower tier than an earlier one that fired
- **THEN** the board's grade is the higher tier

### Requirement: A hint is deduced from the board in play

The `Midend` SHALL hand `Game.hint` the state in play and its `Ui`, never the
board as dealt, and the hint SHALL make its plan from it: an entry the player
placed is never a step, and a step may rest on it. Which marks a step may rest
on, and a step drawn from the clues alone, are the game's to state.
`deduceHintPlan` SHALL deduce on the board it is handed and copy nothing. Of
pencil notes: `engine-candidate-hints`, "A hint deduces from the notes only
where the mistake check vouches for them".

#### Scenario: A right entry the deduction had not reached

- **WHEN** the player makes an entry that is right and that the opening plan
  comes to only after other steps, and then asks for a hint
- **THEN** no step of the new plan makes that entry, and a step may rest on it
  before the steps the opening plan put ahead of it

#### Scenario: A plan in hand when the board changes

- **WHEN** a hint is asked again after moves that left the stored plan
- **THEN** the plan is deduced afresh from the board as it now stands, and not
  continued from the board the first plan was made on

#### Scenario: A mark the hint has not proved

- **WHEN** the player sets a mark their game's hint does not take on trust, as
  a Mines flag is, and asks for a hint
- **THEN** the hint's first step reads as it would without the mark
