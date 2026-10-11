## ADDED Requirements

### Requirement: A hint finishes a board from a right entry made out of order

On a tier that allows no trial and error, a game with `findMistakes`, `solve`
and a hint SHALL finish the board by hints from any position with no mistake
on it. A cross-game guard SHALL hold this on a dealt board of each such game,
from the positions blind gestures leave and from steps of the opening plan
played out of their order, and SHALL fail where it reached no such position
in a game.

#### Scenario: A step of the plan played first

- **WHEN** one step of the opening plan, or two, is played on the opening
  position and `findMistakes` reports nothing there
- **THEN** hints asked from that position end on a solved board, and the
  guard fails on a refusal or a throw

#### Scenario: A gesture that enters something right

- **WHEN** a blind gesture's moves leave the solved board solved and the
  position it reached has no mistake
- **THEN** hints asked from that position end on a solved board

#### Scenario: A game no step could be played early in

- **WHEN** no step of a deducing game's opening plan gives a position with no
  mistake when played out of its order
- **THEN** the guard fails
