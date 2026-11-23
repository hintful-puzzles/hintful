## MODIFIED Requirements

### Requirement: Controls: The left button shades and the right crosses out

Kakurasu's input SHALL be the fill board's, from its description's `play:`:
the left button SHALL shade a square and the right cross it out, either
SHALL clear a square already holding what it makes, and a drag with either
button SHALL keep to one row or column and give the squares it passes that
held what the pressed square held what the pressed square became. The keys S,
X and B SHALL shade, cross out and clear the cursor's square.

#### Scenario: A right drag along a row

- **WHEN** the player drags with the right button across a row holding a
  shaded square and open ones
- **THEN** the open squares are crossed out and the shaded one is kept

#### Scenario: A left drag along a row

- **WHEN** the player drags with the left button from an open square across
  three more open squares of its row
- **THEN** all four are shaded, in one move
