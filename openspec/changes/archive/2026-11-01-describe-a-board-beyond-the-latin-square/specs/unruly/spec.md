## MODIFIED Requirements

### Requirement: Hint: Unruly's hint tries the simplest technique first

The hint SHALL order its techniques: three in a row, a line with one empty cell, a completed count, on a `unique` board the unique-rows conflict, and the near-complete line. Each step SHALL be one firing, the one continuing from the hint's last steps, this order breaking ties, never of a higher tier than the first that fires, whatever tier the board was dealt at. A line with one empty cell SHALL be told as a completed count.

#### Scenario: A pair and a full quota on one board

- **WHEN** one row holds two like pieces side by side with an empty cell
  beyond them, and another row already holds all its pieces of one kind with
  several cells empty
- **THEN** the step for the cell beside the pair comes before any step that
  fills the other row

#### Scenario: A row with one cell left

- **WHEN** a row holds all its pieces of one kind and all but one of the
  other, and no three in a row is pending
- **THEN** the step fills the last cell with the other kind, and its sentence
  says the row already holds all its cells of the first
