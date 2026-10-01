## MODIFIED Requirements

### Requirement: A hint is a nudge; only Solve is a commitment

`hint` SHALL NOT mark the game as solved-with-help and SHALL NOT install a route
into the game state. Solve's existing behavior — installing a route, the engine
recording that the solver was used, and reporting "Auto-solver used." in the
status bar for the remainder of the game — SHALL be unchanged.

This separation is the reason the hint exists: the game already offers a
step-by-step aid through Solve, but only at the price of recording the game as
auto-solved, which is precisely the price a player asking for one nudge is trying
not to pay.

The game SHALL implement `hintKeepTrack`, so that a move in the displayed step's
direction **completes** that step and the plan is kept. Without it the midend drops
the plan on every player move — including one that faithfully follows the hint —
and the next hint replans from scratch, which is what a stable subgoal exists to
prevent.

#### Scenario: Asking for a hint does not brand the game auto-solved

- **WHEN** the player asks for a hint
- **THEN** the status bar does not report that the auto-solver was used, and no
  route arrow is installed on the ball

#### Scenario: Following the hint keeps the plan

- **WHEN** the player plays the move the displayed hint step suggests
- **THEN** the plan advances to its next step rather than being recomputed

#### Scenario: The hint refuses honestly when the ball is dead

- **WHEN** the player asks for a hint with the ball dead
- **THEN** the hint refuses, and says that the move to make is to undo

#### Scenario: The hint refuses honestly when a gem is out of reach for ever

- **WHEN** the player asks for a hint from a position where some gem can no longer
  be reached by any sequence of moves
- **THEN** the hint refuses, says that a gem can no longer be reached, and says
  that the move to make is to undo
