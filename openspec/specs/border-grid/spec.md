# border-grid Specification

## Purpose

The edge-marking mechanic Palisade and Separate share: that a game takes its
input, its look and its hint notation from the engine's border-grid modules
and owns no copy, and that the shared renderer knows neither game. What each
button does to an edge, and the clue layer that stays each game's own, are
stated in `palisade` and `separate`.

## Requirements

### Requirement: A border-grid game takes the mechanic from the engine and owns no copy

A game that marks a grid's edges SHALL take the mechanic from the shared
engine modules and own no copy: the edge bits and
direction tables, the nearest-edge hit test,
the three-state toggle, the paired edit of an edge's two cells, the half-cell
cursor, and its look: the geometry, the edge rects, the tile skeleton and the
live error model (a region over or under size, a wall separating nothing). A
change to what counts as a wrong wall SHALL take effect in every such game at
once.

#### Scenario: A fix to the shared mechanic reaches both games

- **WHEN** a defect is found in the edge hit test, the three-state toggle or
  the test for a wall that separates nothing
- **THEN** it is fixed once in the shared module
- **AND** both Palisade and Separate receive the fix, rather than one game
  silently retaining the defect

#### Scenario: Both games' edits come from the shared module

- **WHEN** a click and a cursor key address the same interior edge in Separate
- **THEN** both produce the paired edits the shared module computes for that
  edge

#### Scenario: The error model is the shared module's

- **WHEN** the player's no-wall marks join more than `k` cells in Separate
- **THEN** the edges between that region and its neighbors are drawn in the
  error color by the shared module's test, not by one of Separate's own

### Requirement: The shared renderer does not know which game is drawing

The shared border-grid renderer SHALL take a game's palette indices and a
callback for the middle of a tile, and SHALL NOT branch on which game is
drawing.

#### Scenario: The middle of a tile is the game's callback

- **WHEN** the shared renderer draws a tile of Palisade or of Separate
- **THEN** the clue digit or the letter in the middle of the tile is drawn by
  that game's callback
- **AND** no branch of the renderer names either game

### Requirement: The games' move formats stay independent

The shared module SHALL report which edge a pointer or cursor action targets
and how its state should cycle, and each game SHALL construct its own `Move`
from that description. The module SHALL NOT define a shared move type, which
would couple two save formats that have no reason to be identical.

#### Scenario: Separate wraps the shared edits in its own move

- **WHEN** the shared module reports the paired edits for an edge
- **THEN** Separate returns them inside its own `edges` move

### Requirement: A game adopting the border-grid input adopts its look

A game that uses the shared border-grid input mechanic SHALL draw through the
shared border-grid renderer, and a guard SHALL fail the build for one that does
not, since nothing else would see a second hand-written renderer of the one
mechanic being written.

#### Scenario: A game adopting the input mechanic adopts its look

- **WHEN** a game uses the shared border-grid input mechanic
- **AND** its sources never reference the shared border-grid renderer
- **THEN** the build fails, naming that game

### Requirement: Border-grid games share the hint's notation layer

The border grid's hint highlight, the journey a firing becomes, the keep-track
verdict on a click, the per-tile hint flags, the drawing of a striped region
and outlined squares, and the later-leg sentence SHALL come from the engine,
shared by Separate and Palisade. Each game SHALL keep its deduction, its
sentences and its own `Move`, wrapping the shared edits itself.

#### Scenario: Separate's hint step is drawn by the shared layer

- **WHEN** Separate displays a hint step that stripes one region and outlines
  another
- **THEN** the ringed edges, the stripes and the outline are drawn by the
  shared border-grid renderer from the step's words
- **AND** the sentence and the `edges` move are Separate's own
