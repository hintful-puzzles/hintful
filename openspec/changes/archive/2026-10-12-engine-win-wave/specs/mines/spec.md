## MODIFIED Requirements

### Requirement: Mines' flashes fill every square on their lit beats

The win flash SHALL sweep the board's squares from the bottom left to the top
right, and a lit square's face SHALL be filled with a flash color and keep
what it holds.
The flash on a death SHALL be the game's own: it SHALL fill every square in
the error color on its lit beats. The mine the player trod on SHALL keep the
error color throughout.

#### Scenario: The trodden mine through a death's flash

- **WHEN** a death's flash moves from a lit beat to an unlit one
- **THEN** every square is filled in the error color on the lit beat
- **AND** on the unlit beat the trodden mine's square is still filled in it,
  while the others return to their own surfaces

#### Scenario: A flagged mine under the win's highlight

- **WHEN** the win flash's highlight is on a flagged mine
- **THEN** the square is filled with a flash color, its flag drawn on it as
  usual
