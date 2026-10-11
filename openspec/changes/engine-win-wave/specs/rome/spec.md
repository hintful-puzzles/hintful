## MODIFIED Requirements

### Requirement: Rome's completion flash sweeps the board

The win flash SHALL sweep the board's squares from the bottom left to the top
right, and a lit square SHALL be filled with the flash color in place of its
surface and keep what it holds. The selected square's
highlight SHALL not be drawn while the win flash runs.

#### Scenario: The flash moves

- **WHEN** the win flash is drawn early and late
- **THEN** the early frame lights the bottom-left square and the late one the
  top-right square

#### Scenario: The selection through the flash

- **WHEN** a square is selected for notes and the board is won
- **THEN** no frame of the flash shows the selection's wash or its `?`
