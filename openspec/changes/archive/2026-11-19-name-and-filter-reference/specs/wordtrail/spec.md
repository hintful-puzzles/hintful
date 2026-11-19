## MODIFIED Requirements

### Requirement: Controls: Wordtrail's dictionary lists the words the board can spell

Wordtrail's reference SHALL be titled "Dictionary" and list, under a heading
for each listed length, every common word some trail on the board spells,
alphabetically, each once. A word SHALL be placed where a drawn piece spells
it, ruled out where no trail of it fits the player's lines and crosses, and
outstanding otherwise. It SHALL ask for a search box and declare a "Fits"
filter showing outstanding words and a "Found" filter showing placed ones.
Selecting a word SHALL spotlight the letters of its trails that still fit,
until the board is touched.

#### Scenario: A crossed edge rules a word out

- **WHEN** the only trail spelling TAN runs across an edge the player has
  crossed
- **THEN** TAN is shown ruled out, and an undo of the cross shows it
  outstanding again
