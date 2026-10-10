## MODIFIED Requirements

### Requirement: A digit key enters, and Backspace, Space or 0 clears

With a cell selected, a digit key `1` to `9` SHALL place that digit, or in
pencil mode toggle that note, and Backspace, Space or `0` SHALL clear. The
on-screen keypad SHALL offer the digits 1 to 9. Walls SHALL NOT be editable.

#### Scenario: The keypad offers the digits

- **WHEN** the game's on-screen keys are requested
- **THEN** the digits 1 to 9 are among them

#### Scenario: A no-op entry makes no move

- **WHEN** the player edits a wall cell
- **THEN** no move is made and the history is unchanged
