## MODIFIED Requirements

### Requirement: Any other action returns the Hint control to where to look

The beat SHALL return to show on any user action between two Hint presses: a
move (key or pointer), undo, redo, solve, restart, new game, checkpoint load,
loading a saved game, deletion, or starting Auto-Hint. A key or pointer press
that leaves on display the step the beat is about, shown as it was (at where
to look, or whole), SHALL keep the beat: moving a cursor or putting a square
in focus is no reason to show the step again from where to look.

#### Scenario: An intervening action re-arms the show

- **WHEN** the player presses Hint (showing where to look, or the whole
  step), then performs any other action (e.g. a move or undo), then presses
  Hint again
- **THEN** the next press shows where to look for the now-relevant step and
  does not explain or apply a stale one

#### Scenario: A press that leaves the step keeps the beat

- **WHEN** the player has a Subsets step explained, the control reading
  "Apply the hint", and presses another square's badge
- **THEN** the step's sentence and marks stay, the control still reads "Apply
  the hint", and the next press applies the step
