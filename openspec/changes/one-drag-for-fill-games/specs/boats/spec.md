## RENAMED Requirements

- FROM: `### Requirement: Controls: Boats' click goes round, and a right drag waters a line`
- TO: `### Requirement: Controls: Boats' click goes round, and a drag fills a line`

## MODIFIED Requirements

### Requirement: Controls: Boats' click goes round, and a drag fills a line

A click SHALL take a square round empty, boat segment and water, the right
button the other way round. A drag with either button SHALL keep to one row or
column and give the squares it passes what the pressed square became, as in
every fill game whose drag is straight, and Shift or Ctrl with an arrow SHALL
mark water as the cursor moves.

#### Scenario: Two clicks make water

- **WHEN** the player left-clicks an empty square twice
- **THEN** it holds a boat segment after the first click and water after the
  second

#### Scenario: A left drag lays a boat

- **WHEN** the player presses the left button on an empty square and drags
  across three more empty squares of its row
- **THEN** all four hold boat segments

## ADDED Requirements

### Requirement: Display: Water the player marks shows the ruled-out cross

Water the player marks SHALL be drawn with the cross every fill game draws on a square it rules out, and water the puzzle gives SHALL be drawn with waves, so the two read apart.

#### Scenario: Marked and given water side by side

- **WHEN** a board shows given water beside a square the player right-clicked
- **THEN** the given square shows waves and the marked one the cross
