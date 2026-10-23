# engine-input Specification Delta — add-zip-to-path

## REMOVED Requirements

### Requirement: A line drawn through squares is the engine's drag

**Reason**: A pointer's drag no longer cuts back where it returns to a square it passed: a player drawing a long Zip line in one stroke who brushed an earlier part of it lost everything drawn after (owner, 2026-10-23).

**Migration**: Replaced by "A line drawn through squares is the engine's add-only drag", which keeps the rest of the requirement and its other two scenarios.

## ADDED Requirements

### Requirement: A line drawn through squares is the engine's add-only drag

The engine SHALL provide the drag that draws a line along the edges between the squares it passes, a rook move at a time, stopped by a crossed edge or a square given more lines than it takes. A pointer's drag back onto a square it passed SHALL change nothing, unless it closes a declared loop; the keyboard's SHALL be cut back there. Its release SHALL keep the lines it passes, or take them up where it passes nothing else. A game drawing lines this way SHALL use it.

#### Scenario: A drag back over its own way keeps what it drew

- **WHEN** a drag passes three squares and returns to the second
- **THEN** releasing it draws both edges it passed

#### Scenario: An arrow back over the line takes back the step

- **WHEN** Enter starts a line, two arrows carry it, an arrow back returns it to the second square, and Enter draws it
- **THEN** only the edge between the first two squares is drawn

#### Scenario: A drag along a line and past its end carries it on

- **WHEN** a drag starts along a line already drawn and goes on past its end
- **THEN** releasing it keeps that line and draws on along the drag

#### Scenario: A square is never given more lines than it takes

- **WHEN** a drag, a click or a Ctrl+arrow would give a square more lines than it takes
- **THEN** the drag stops before that square, and the click or key makes no move
