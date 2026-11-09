## REMOVED Requirements

### Requirement: A line drawn through squares is the engine's add-only drag

**Reason**: A pointer's drag back over its own end now takes back steps, so the drag is no longer add-only, and the scenario "A drag back over its own way keeps what it drew" is false.

**Migration**: Replaced by "A line drawn through squares is the engine's drag, taken back over its end", which keeps the rest of the requirement and its other three scenarios.

## ADDED Requirements

### Requirement: A line drawn through squares is the engine's drag, taken back over its end

The engine SHALL provide the drag that draws a line along the edges between the squares it passes, a rook move at a time, stopped by a crossed edge or an over-filled square. Drawn back over its end it SHALL be cut back there. A pointer's drag onto another square it passed SHALL change nothing unless it closes a declared loop; the keyboard's SHALL be cut back. Its release SHALL keep the lines it passes, or take them up where it passes nothing else. A game drawing lines this way SHALL use it.

#### Scenario: A drag drawn back over its end takes back the step

- **WHEN** a drag passes three squares in a row and returns to the second
- **THEN** releasing it draws only the edge between the first two

#### Scenario: A drag that brushes its way off its end keeps what it drew

- **WHEN** a drag goes round three sides of a square of four squares and onto the first, where no loop is declared
- **THEN** it keeps all three edges, and carries on from the fourth square

#### Scenario: An arrow back over the line takes back the step

- **WHEN** Enter starts a line, two arrows carry it, an arrow back returns it to the second square, and Enter draws it
- **THEN** only the edge between the first two squares is drawn

#### Scenario: A drag along a line and past its end carries it on

- **WHEN** a drag starts along a line already drawn and goes on past its end
- **THEN** releasing it keeps that line and draws on along the drag

#### Scenario: A square is never given more lines than it takes

- **WHEN** a drag, a click or a Ctrl+arrow would give a square more lines than it takes
- **THEN** the drag stops before that square, and the click or key makes no move
