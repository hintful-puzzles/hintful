## ADDED Requirements

### Requirement: Params: Twiddle's game modes are Standard and Rows only

Twiddle SHALL offer one number per row as a ruleset, Standard or Rows only,
each a section of the Type menu, with the encoding's `r` unchanged.
Orientation SHALL stay a modifier of either.

#### Scenario: A custom board's label

- **WHEN** a 5×5 board with a target of 12 shuffles is labeled
- **THEN** the label reads "Standard: 5x5, 12 shuffles"
