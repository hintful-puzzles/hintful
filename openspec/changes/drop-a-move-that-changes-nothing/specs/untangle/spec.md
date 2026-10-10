## MODIFIED Requirements

### Requirement: Vertices are dragged by pointer or keyboard

`interpretMove` SHALL let the player move one vertex at a time. A pointer
press near a vertex SHALL begin a drag, motion SHALL preview the vertex
following the pointer as a `UI_UPDATE` with no history entry, and release SHALL
place that vertex at its position.

#### Scenario: A drag moves one vertex and updates crossings

- **WHEN** the player drags a vertex to a new position and releases in-bounds
- **THEN** a move is committed that repositions only that vertex, the crossing set
  is recomputed, and the displayed crossed-edge highlighting updates

### Requirement: The keyboard selects, holds, nudges and cycles a vertex

An arrow key SHALL select the nearest vertex in that direction. Space or Tab
SHALL step the selection through the vertices in turn, backwards with Shift,
and SHALL do nothing while a vertex is held. Enter SHALL pick the selected
vertex up, the arrow keys SHALL then nudge it, and Enter again SHALL put it
down where the nudges left it. A vertex put down where it was picked up SHALL
go back exactly as it was, not rounded to a pixel, and Undo gains no step.

#### Scenario: A held vertex is nudged and dropped

- **WHEN** the player selects a vertex away from the border, presses the select
  key, presses an arrow, and presses the select key again, with snapping off
- **THEN** a move is committed placing that vertex one nudge away in the
  arrow's direction
