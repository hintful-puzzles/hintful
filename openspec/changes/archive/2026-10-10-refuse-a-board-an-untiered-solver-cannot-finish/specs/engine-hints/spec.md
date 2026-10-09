## MODIFIED Requirements

### Requirement: Deduction runs out only where the tier permits search

The deduction-exhausted refusal SHALL be shown to a player only where the
game's own tier declaration permits search. The permission SHALL be derived (a
tier named `Unreasonable` is the collection's promise that its boards can need
search) and never declared for a guard's benefit. The midend SHALL throw, and
show nothing, when a game returns the refusal on a board whose tier does not
permit search or in a game with no difficulty contract.

A hinting game with no difficulty contract MAY return the refusal from `hint`,
and its `finishesByDeduction` SHALL then refuse at load every board on which it
would (`engine-params`, "An untiered game says whether deduction finishes a
board"). The walk SHALL fail on the refusal from such a game on a dealt board,
and SHALL NOT skip the game.

#### Scenario: A refusal escapes onto a deduction-complete tier

- **WHEN** a hint refuses on a board dealt at a tier that does not permit search
- **THEN** the walk fails: the defect is the refusal, not the wording

#### Scenario: An untiered game's hint runs out on a pasted board

- **WHEN** a game ID names a board of an untiered game on which its hint would
  return the deduction-exhausted refusal from the opening
- **THEN** the board does not load, so no player is shown the refusal and the
  midend's throw is not reached
