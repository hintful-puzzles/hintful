## MODIFIED Requirements

### Requirement: A strike's conclusion names the struck values, even after its premise

The conclusion SHALL refer to the struck notes the way the premise says: by
`where` for a strike that reaches beyond the cell it is about, and by `struck`
where a word names the notes better than a list of their values. Otherwise it
SHALL name their values, even where the premise has just named them, a value
struck from several cells and the only one struck in its plural, but a
lower-case letter, which has no plural that reads as the letter.

#### Scenario: A premise that names the values is followed by them

- **WHEN** a strike's premise says "puts 2 in this cell"
- **THEN** its conclusion reads "so the 2 must go", and not "so it must go"

#### Scenario: One value struck from a whole line

- **WHEN** a strike takes A from every cell of a row that shows it
- **THEN** its conclusion reads "so the As must go"
