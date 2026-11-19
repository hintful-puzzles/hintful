## MODIFIED Requirements

### Requirement: The reference panel renders each item and selects on a click

The panel SHALL show the model's title and instructions, and its sections
in order under their headings. It SHALL render each item with status-distinct
styling, drawing `pips` as piece faces when present and `label` otherwise,
mark the hint's items in the hint's color, and follow the board live. A click
SHALL toggle the item's selection and call `selectReference` with its key, or
`null` when deselecting, its feedback not waiting on the model's refresh.

#### Scenario: Clicking an item spotlights it on the still-visible board

- **WHEN** the player clicks an outstanding item in the open panel
- **THEN** the item shows as selected immediately, and the board, still visible
  beside or above the panel, highlights that item's occurrences
- **AND** clicking it again clears the highlight

#### Scenario: A hint names words in an open dictionary

- **WHEN** Wordtrail's dictionary is open and a hint step reasoning from four
  words is shown
- **THEN** those four words are marked in the hint's color until the step is
  gone
