## MODIFIED Requirements

### Requirement: A flagged cell carries its own mistake overlay

The cells Check flags SHALL be rendered with a mistake overlay of their own, an inset double outline that reads apart from the red number a broken rule gets, and
the overlay SHALL appear on the frame after the check, on a cell whose contents
did not change included.

#### Scenario: A mistake appears on a cell whose contents did not change

- **WHEN** Check flags a cell and nothing else about that cell changes
- **THEN** the cell is repainted with the overlay on the next frame
