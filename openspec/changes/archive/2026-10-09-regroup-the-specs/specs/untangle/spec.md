## ADDED Requirements

### Requirement: The Untangle port exposes its three preferences via the hook

Untangle SHALL expose three preferences through `prefs`, under the keywords
`snap-to-grid` (boolean), `show-crossed-edges` (boolean) and `vertex-style` (a
two-way choice, Circles or Numbers). Its `newUi` SHALL set the defaults:
show-crossed-edges on, since it doubles as the built-in mistake feedback,
snap-to-grid off, and vertex-style Circles.

#### Scenario: Untangle preferences round-trip through the engine

- **WHEN** `getPreferencesConfig()` is called for Untangle
- **THEN** it returns two booleans and one two-way choice of the game's own,
  beside the engine's `show-timer`, and `getPreferences()` reports
  show-crossed-edges true by default
- **AND** `setPreferences({ "show-crossed-edges": false })` turns off the
  crossed-edge highlight and repaints, leaving the others unchanged

## MODIFIED Requirements

### Requirement: The keyboard selects, holds, nudges and cycles a vertex

An arrow key SHALL select the nearest vertex in that direction. Space or Tab
SHALL step the selection through the vertices in turn, backwards with Shift,
and SHALL do nothing while a vertex is held. Enter SHALL pick the selected
vertex up, the arrow keys SHALL then nudge it, and Enter again SHALL put it
down as a move.

#### Scenario: A held vertex is nudged and dropped

- **WHEN** the player selects a vertex away from the border, presses the select
  key, presses an arrow, and presses the select key again, with snapping off
- **THEN** a move is committed placing that vertex one nudge away in the
  arrow's direction

### Requirement: A hint step marks its vertex, its destination and the crossings it removes

Each step SHALL mark the vertex it moves, its destination, where the crossings
the move removes sit, and, on a journey's leg, the marked vertices still to
move after it. For a displayed step `redraw` SHALL draw a hint-colored line
from the vertex to its destination, the vertex and a destination marker in the
hint color, and an unfilled hint-colored ring on each crossing the move removes
and around each marked vertex still to move.

#### Scenario: A journey's first leg marks the others

- **WHEN** the first leg of a journey of three vertices is on display
- **THEN** it marks its own vertex, its destination, and the two vertices
  still to move

#### Scenario: Displayed hint is rendered

- **WHEN** a hint step is on display
- **THEN** `redraw` draws a hint-colored line to, and a hint-colored marker at,
  the suggested destination, and one ring for each crossing the move removes

## REMOVED Requirements

### Requirement: redraw draws a displayed hint in the hint color

**Reason**: duplicate: merged into "A hint step marks its vertex, its
destination and the crossings it removes", reworded above, which now carries
this requirement's sentence and its scenario word for word.
